import { cache } from 'react';
import { MOCK_CATEGORIES, MOCK_CITIES, MOCK_REVIEWS, MOCK_BLOG_POSTS } from '@/data/mockData';
import { BusinessListing, BusinessReview, Category, LocationCity, BlogPost, LeadSubmission } from '@/types/directory';

/**
 * Get WordPress REST API base URL.
 */
export function getWpApiUrl(): string {
  return (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '').replace(/\/$/, '');
}

/**
 * Test Connection to Headless WordPress REST API
 */
export async function testWpConnection(url?: string): Promise<{ success: boolean; message: string; count?: number }> {
  const targetUrl = url ? url.replace(/\/$/, '') : getWpApiUrl();
  if (!targetUrl) {
    return { success: false, message: 'No WordPress API URL configured yet.' };
  }

  try {
    const res = await fetch(`${targetUrl}/wp-json/wp/v2/business_listing?per_page=1`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const totalCount = res.headers.get('X-WP-Total') || '0';
      return {
        success: true,
        message: `Connected! Found ${totalCount} business listings in WordPress.`,
        count: parseInt(totalCount, 10)
      };
    } else {
      return {
        success: false,
        message: `WordPress responded with HTTP ${res.status}. Make sure the Locable plugin is active.`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Cannot reach ${targetUrl}. Error: ${error?.message || 'Network error'}`
    };
  }
}

let listingsCache: { data: BusinessListing[]; timestamp: number } | null = null;
let categoriesCache: { data: Category[]; timestamp: number } | null = null;
let citiesCache: { data: LocationCity[]; timestamp: number } | null = null;

const CACHE_TTL_MS = 300000; // 5 minutes in-memory cache for 0ms responses

export function clearListingsCache(): void {
  listingsCache = null;
  categoriesCache = null;
  citiesCache = null;
}

/**
 * Fetch ALL business listings from WordPress REST API with auto-pagination.
 */
async function fetchAllFromWp(): Promise<BusinessListing[]> {
  const now = Date.now();
  if (listingsCache && (now - listingsCache.timestamp < CACHE_TTL_MS)) {
    return listingsCache.data;
  }

  // If we have stale cache, return it instantly and revalidate in background!
  if (listingsCache && listingsCache.data.length > 0) {
    refreshWpListingsInBackground();
    return listingsCache.data;
  }

  return fetchWpListingsDirectly();
}

async function refreshWpListingsInBackground() {
  try {
    const data = await fetchWpListingsDirectly();
    if (data && data.length > 0) {
      listingsCache = { data, timestamp: Date.now() };
    }
  } catch (e) {}
}

async function fetchWpListingsDirectly(): Promise<BusinessListing[]> {
  const now = Date.now();
  const apiUrl = getWpApiUrl();
  if (!apiUrl) return [];

  try {
    const firstRes = await fetch(
      `${apiUrl}/wp-json/wp/v2/business_listing?per_page=100&page=1&orderby=date&order=desc&_fields=id,slug,title,meta`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!firstRes.ok) {
      console.warn(`[WordPress] API returned HTTP ${firstRes.status}`);
      return [];
    }

    const ct = firstRes.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      console.warn('[WordPress] Response is not JSON (got:', ct, '). Check WordPress REST API settings.');
      return [];
    }

    const totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);
    const total      = parseInt(firstRes.headers.get('X-WP-Total') || '0', 10);
    const firstPage  = await firstRes.json();

    if (!Array.isArray(firstPage) || firstPage.length === 0) {
      console.log('[WordPress] 0 business listings found in WordPress.');
      listingsCache = { data: [], timestamp: now };
      return [];
    }

    let allPosts = [...firstPage];

    if (totalPages > 1) {
      const BATCH_SIZE = 10;
      for (let i = 2; i <= totalPages; i += BATCH_SIZE) {
        const batchPromises: Promise<unknown[]>[] = [];
        for (let page = i; page < Math.min(i + BATCH_SIZE, totalPages + 1); page++) {
          batchPromises.push(
            fetch(
              `${apiUrl}/wp-json/wp/v2/business_listing?per_page=100&page=${page}&orderby=date&order=desc&_fields=id,slug,title,meta`,
              {
                cache: 'no-store',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
                },
                signal: AbortSignal.timeout(10000),
              }
            ).then(async (r) => {
              if (r.ok) return r.json();
              // Small pause and retry if PHP-FPM was temporarily busy
              await new Promise((res) => setTimeout(res, 150));
              const retry = await fetch(
                `${apiUrl}/wp-json/wp/v2/business_listing?per_page=100&page=${page}&orderby=date&order=desc&_fields=id,slug,title,meta`,
                { cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0' } }
              );
              return retry.ok ? retry.json() : [];
            }).catch(() => [])
          );
        }
        const batchResults = await Promise.all(batchPromises);
        for (const batch of batchResults) {
          if (Array.isArray(batch)) allPosts = allPosts.concat(batch);
        }
      }
    }

    console.log(`[WordPress] Successfully fetched ${allPosts.length} of ${total} total business listings.`);
    const mapped = allPosts.map(mapWpBusinessToFormat);
    listingsCache = { data: mapped, timestamp: now };
    return mapped;
  } catch (error) {
    console.warn('[WordPress] Network error fetching listings:', error);
    return listingsCache ? listingsCache.data : [];
  }
}

/**
 * Fetch All Business Listings (with optional filters) directly from WordPress
 */
export async function getBusinesses(filters?: {
  categorySlug?: string;
  citySlug?: string;
  searchQuery?: string;
  minRating?: number;
  featuredOnly?: boolean;
}): Promise<BusinessListing[]> {
  const wpListings = await fetchAllFromWp();
  return filterListingsDataset(wpListings, filters);
}

function filterListingsDataset(listings: BusinessListing[], filters?: {
  categorySlug?: string;
  citySlug?: string;
  searchQuery?: string;
  minRating?: number;
  featuredOnly?: boolean;
}): BusinessListing[] {
  let results = [...listings];

  if (filters?.featuredOnly) {
    results = results.filter((b) => b.featured);
  }
  if (filters?.categorySlug) {
    results = results.filter(
      (b) => b.typeSlug?.toLowerCase() === filters.categorySlug?.toLowerCase()
           || b.type?.toLowerCase().replace(/\s+/g, '-') === filters.categorySlug?.toLowerCase()
    );
  }
  if (filters?.citySlug) {
    results = results.filter(
      (b) => b.citySlug?.toLowerCase() === filters.citySlug?.toLowerCase()
           || b.city?.toLowerCase().replace(/\s+/g, '-') === filters.citySlug?.toLowerCase()
    );
  }
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
    );
  }
  if (filters?.minRating) {
    results = results.filter((b) => b.rating >= (filters.minRating || 0));
  }

  return results;
}

export const getBusinessBySlug = cache(async (slugOrPlaceId: string): Promise<BusinessListing | null> => {
  const target = slugOrPlaceId.toLowerCase().trim();

  const matchListing = (b: BusinessListing) => {
    const s = b.slug.toLowerCase();
    const raw = (b.rawSlug || '').toLowerCase();
    const pid = b.placeId.toLowerCase();
    const seo = createSeoSlug(b.title, b.city, b.placeId).toLowerCase();
    const titleSlug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    return (
      s === target ||
      raw === target ||
      pid === target ||
      seo === target ||
      titleSlug === target ||
      (s.length > 5 && target.length > 5 && (s.startsWith(target) || target.startsWith(s))) ||
      (raw.length > 5 && target.length > 5 && (raw.startsWith(target) || target.startsWith(raw)))
    );
  };

  // Fast check 1: In-memory cache hit for instant 0ms response!
  if (listingsCache && listingsCache.data.length > 0) {
    const cachedMatch = listingsCache.data.find(matchListing);
    if (cachedMatch) return cachedMatch;
  }

  const apiUrl = getWpApiUrl();

  // Fast check 2: Direct single-item lookup by slug via WP REST API
  if (apiUrl) {
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_listing?slug=${encodeURIComponent(slugOrPlaceId)}&_fields=id,slug,title,meta`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0' },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length > 0) {
          return mapWpBusinessToFormat(items[0]);
        }
      }
    } catch (e) {
      console.warn('[WordPress] Direct slug lookup warning:', e);
    }

    // Try search query by slug keywords if direct slug fetch returns empty
    try {
      const resSearch = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_listing?search=${encodeURIComponent(slugOrPlaceId.replace(/-/g, ' '))}&per_page=10&_fields=id,slug,title,meta`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0' },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (resSearch.ok) {
        const items = await resSearch.json();
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map(mapWpBusinessToFormat);
          const found = mapped.find(matchListing);
          if (found) return found;
        }
      }
    } catch (e) {}
  }

  // Fast check 3: Full dataset search
  const all = await getBusinesses();
  return all.find(matchListing) || null;
});

/**
 * Dynamically derive Category taxonomy from actual WP data
 */
export async function getCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache && (now - categoriesCache.timestamp < CACHE_TTL_MS)) {
    return categoriesCache.data;
  }

  const categoryMap = new Map<string, Category>();
  const apiUrl = getWpApiUrl();

  // 1. Fetch all pages of WordPress CPT business_type taxonomy terms
  if (apiUrl) {
    try {
      const firstRes = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_type?per_page=100&page=1&orderby=name&order=asc`,
        {
          headers: { 'User-Agent': 'LocableNextJS/1.0' },
          next: { revalidate: 3600 },
        }
      );
      if (firstRes.ok) {
        const totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);
        const firstTerms = await firstRes.json();
        let allTerms = Array.isArray(firstTerms) ? [...firstTerms] : [];

        if (totalPages > 1) {
          const pagePromises = [];
          for (let p = 2; p <= totalPages; p++) {
            pagePromises.push(
              fetch(`${apiUrl}/wp-json/wp/v2/business_type?per_page=100&page=${p}&orderby=name&order=asc`, {
                headers: { 'User-Agent': 'LocableNextJS/1.0' },
                next: { revalidate: 3600 }
              }).then(r => r.ok ? r.json() : []).catch(() => [])
            );
          }
          const restPages = await Promise.all(pagePromises);
          for (const pageItems of restPages) {
            if (Array.isArray(pageItems)) allTerms = allTerms.concat(pageItems);
          }
        }

        for (let i = 0; i < allTerms.length; i++) {
          const t = allTerms[i];
          const key = String(t.name || '').toLowerCase().trim();
          if (!key) continue;
          categoryMap.set(key, {
            id: String(t.id || `wp-cat-${i}`),
            name: t.name,
            slug: t.slug,
            icon: 'Store',
            description: `${t.name} services & contractors`,
            count: t.count || 0,
            subcategories: [],
          });
        }
      }
    } catch (e) {
      console.warn('[WordPress] business_type taxonomy fetch warning:', e);
    }
  }

  // 2. Sync category counts and add primary listing categories
  try {
    const listings = await getBusinesses();
    for (const b of listings) {
      if (!b.type) continue;
      const key = b.type.toLowerCase().trim();
      const slug = b.typeSlug || key.replace(/[\s&]+/g, '-').replace(/[^a-z0-9-]/g, '');

      if (categoryMap.has(key)) {
        const cat = categoryMap.get(key)!;
        if (!cat.count || cat.count === 0) {
          cat.count = (cat.count || 0) + 1;
        }
      } else {
        categoryMap.set(key, {
          id: `derived-${slug}`,
          name: b.type,
          slug,
          icon: 'Store',
          description: `${b.type} businesses`,
          count: 1,
          subcategories: [],
        });
      }
    }
  } catch (e) {
    // ignore
  }

  // Sort by highest business count descending, then alphabetically
  const result = Array.from(categoryMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0) || a.name.localeCompare(b.name));
  categoriesCache = { data: result, timestamp: now };
  return result;
}

export function cleanCityName(rawCity: string): string {
  if (!rawCity) return '';
  let city = rawCity.trim();

  // If city starts with a digit or looks like a street address
  if (/^\d/.test(city) || /\b(ave|avenue|st|street|blvd|rd|road|ste|suite|unit|#|camino|dr|drive|pkwy)\b/i.test(city)) {
    if (city.includes(',')) {
      const parts = city.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const potentialCity = parts[1].replace(/\b(ca|california|\d{5})\b/gi, '').trim();
        if (potentialCity && !/^\d/.test(potentialCity) && !/\b(ave|avenue|st|street|blvd|rd|road|ste|suite|unit|#|camino|dr|drive|pkwy)\b/i.test(potentialCity)) {
          return potentialCity;
        }
      }
    }
    return '';
  }

  city = city.replace(/,?\s*\b(ca|california|\d{5})\b.*/gi, '').trim();
  return city;
}

/**
 * Dynamically derive City taxonomy from actual WP data
 */
export async function getCities(): Promise<LocationCity[]> {
  const now = Date.now();
  if (citiesCache && (now - citiesCache.timestamp < CACHE_TTL_MS)) {
    return citiesCache.data;
  }

  const listings = await getBusinesses();

  const cityMap = new Map<string, { name: string; slug: string; state: string; count: number }>();
  for (const b of listings) {
    const cityName = cleanCityName(b.city);
    if (!cityName) continue;

    const slug = cityName.toLowerCase().replace(/\s+/g, '-');
    if (cityMap.has(slug)) {
      cityMap.get(slug)!.count++;
    } else {
      cityMap.set(slug, { name: cityName, slug, state: b.state || 'CA', count: 1 });
    }
  }

  let result: LocationCity[] = [];
  if (cityMap.size > 0) {
    result = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count)
      .map((c, i) => {
        const mock = MOCK_CITIES.find((mc) => mc.slug === c.slug || mc.name === c.name);
        return {
          id: `city-${i + 1}`,
          name: c.name,
          slug: c.slug,
          county: mock?.county || '',
          state: c.state,
          stateSlug: c.state.toLowerCase().replace(/\s+/g, '-'),
          zipCodes: mock?.zipCodes || [],
          count: c.count,
          popularCategories: mock?.popularCategories || [],
        };
      });
  } else {
    result = [];
  }

  citiesCache = { data: result, timestamp: now };
  return result;
}

export async function getReviewsForBusiness(businessPlaceId: string): Promise<BusinessReview[]> {
  const apiUrl = getWpApiUrl();

  if (apiUrl) {
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_review?meta_key=businessPlaceId&meta_value=${businessPlaceId}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
          },
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item) => mapWpReviewToFormat(item));
        }
      }
    } catch (e) {
      console.warn('[WordPress] Review fetch failed:', e);
    }
  }

  return [];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/wp/v2/posts?per_page=100&orderby=date&order=desc&_embed`,
        {
          cache: 'no-store',
          headers: { 'User-Agent': 'LocableNextJS/1.0' }
        }
      );
      if (res.ok) {
        const posts = await res.json();
        if (Array.isArray(posts) && posts.length > 0) {
          const filtered = posts.filter((p: any) => p.slug !== 'hello-world');
          if (filtered.length > 0) {
            return filtered.map((item: any) => mapWpPostToFormat(item));
          }
        }
      }
    } catch (e) {
      console.warn('[WordPress] Blog posts fetch failed:', e);
    }
  }
  return [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  const match = posts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  if (match) return match;

  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`, {
        cache: 'no-store',
        headers: { 'User-Agent': 'LocableNextJS/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return mapWpPostToFormat(data[0]);
        }
      }
    } catch (e) {
      console.warn('[WordPress] Single post fetch failed:', e);
    }
  }

  return null;
}

const FALLBACK_BLOG_IMAGE = '/images/hero_contractor_pro.jpg';

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function mapWpPostToFormat(item: any): BlogPost {
  const meta = item.meta || {};
  const embedded = item._embedded || {};

  let categoryName = meta.category_tag || 'Guides';
  if (embedded['wp:term'] && Array.isArray(embedded['wp:term'][0]) && embedded['wp:term'][0].length > 0) {
    categoryName = embedded['wp:term'][0][0].name || categoryName;
  }

  let authorName = 'LocalNest Team';
  if (embedded.author && Array.isArray(embedded.author) && embedded.author.length > 0) {
    authorName = embedded.author[0].name || authorName;
  }

  let coverImage = meta.custom_featured_image || meta.featured_image || meta.coverImage || '';
  if (!coverImage && embedded['wp:featuredmedia'] && Array.isArray(embedded['wp:featuredmedia']) && embedded['wp:featuredmedia'].length > 0) {
    const media = embedded['wp:featuredmedia'][0];
    coverImage = media.source_url || media.media_details?.sizes?.full?.source_url || media.media_details?.sizes?.medium_large?.source_url || '';
  }
  if (!coverImage || typeof coverImage !== 'string' || !coverImage.trim()) {
    coverImage = FALLBACK_BLOG_IMAGE;
  }

  const rawDate = item.date ? new Date(item.date) : new Date();
  const dateFormatted = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const wordCount = (item.content?.rendered || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = `${Math.max(2, Math.ceil(wordCount / 200))} min read`;

  const rawTitle = item.title?.rendered || 'Untitled Article';
  const rawExcerpt = (item.excerpt?.rendered || '').replace(/<[^>]*>/g, '').trim();

  return {
    id: String(item.id || ''),
    title: decodeHtmlEntities(rawTitle),
    slug: item.slug || 'article',
    excerpt: decodeHtmlEntities(rawExcerpt),
    content: item.content?.rendered || '',
    author: decodeHtmlEntities(authorName),
    date: dateFormatted,
    category: decodeHtmlEntities(categoryName),
    readTime,
    coverImage
  };
}

export async function submitReviewToWp(reviewData: Partial<BusinessReview>): Promise<{ success: boolean; message: string }> {
  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/wp-json/wp/v2/business_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reviewData.title,
          content: reviewData.comment,
          status: 'pending',
          meta: {
            businessPlaceId: reviewData.businessPlaceId,
            rating: reviewData.rating,
            reviewerName: reviewData.reviewerName,
            reviewerEmail: reviewData.reviewerEmail,
            visitDate: reviewData.visitDate
          }
        })
      });
      if (res.ok) return { success: true, message: 'Review submitted to WP moderation queue!' };
    } catch (e) {
      console.error('WP review submission failed:', e);
    }
  }
  return { success: true, message: 'Thank you! Your review was submitted.' };
}

export async function submitLeadToWp(leadData: Partial<LeadSubmission>): Promise<{ success: boolean; message: string }> {
  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/wp-json/wp/v2/lead_submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${leadData.type?.toUpperCase()} - ${leadData.businessName || leadData.contactName}`,
          content: leadData.message || 'New lead from website directory',
          status: 'publish',
          meta: {
            type: leadData.type,
            contactName: leadData.contactName,
            contactEmail: leadData.contactEmail,
            contactPhone: leadData.contactPhone,
            placeId: leadData.placeId
          }
        })
      });
      if (res.ok) return { success: true, message: 'Lead logged to WordPress dashboard!' };
    } catch (e) {
      console.error('WP lead submission failed:', e);
    }
  }
  return { success: true, message: 'Thank you! Your request was received.' };
}

// ─── Mapper helpers ───────────────────────────────────────────────────────────

export function createSeoSlug(title: string, city: string, placeId: string): string {
  if (!title) return placeId ? placeId.toLowerCase() : 'business';

  // Extract core business name before separators like |, -, :, or 'in City' keyword stuffing
  let coreName = title.split(/[|:-]/)[0];
  coreName = coreName.replace(/\bin\b.*/i, '').trim();

  if (coreName.length < 3) {
    coreName = title.split('|')[0].trim();
  }

  const cleanTitle = coreName
    .replace(/&#038;/g, 'and')
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/&#\d+;/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const cleanCity = (city || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  if (cleanTitle && cleanTitle !== 'business') {
    return (cleanCity && !cleanTitle.includes(cleanCity))
      ? `${cleanTitle}-${cleanCity}`
      : cleanTitle;
  }
  return placeId ? placeId.toLowerCase() : 'business';
}

export function formatReviewCount(count: number): string {
  if (typeof count !== 'number' || isNaN(count) || count <= 0) return '0';
  if (count >= 5000) {
    return '5K+';
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}K+`;
  }
  return String(count);
}

export function parseServiceOptions(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(String).map(s => s.trim().replace(/^["'[\]]+|["'[\]]+$/g, '')).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim()) {
    let str = val.trim();
    try {
      let parsed = JSON.parse(str);
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
      }
      if (Array.isArray(parsed)) {
        return parsed.map(String).map(s => s.trim().replace(/^["'[\]]+|["'[\]]+$/g, '')).filter(Boolean);
      }
    } catch {
      // Not JSON
    }
    return str
      .replace(/^["'[\]]+|["'[\]]+$/g, '')
      .split(/[,|]/)
      .map(s => s.trim().replace(/^["']+|["']+$/g, ''))
      .filter(Boolean);
  }
  return [];
}

function mapWpBusinessToFormat(item: Record<string, unknown>): BusinessListing {
  const meta = (item.meta as Record<string, unknown>) || {};

  const rawService = meta.serviceOptions || meta.services || item.serviceOptions || item.services;
  let serviceOptions = parseServiceOptions(rawService);
  const otherTypes = parseServiceOptions(meta.otherTypes);

  if (serviceOptions.length === 0 && otherTypes.length > 0) {
    serviceOptions = [...otherTypes];
  }

  const rawTitle = (item.title as { rendered?: string })?.rendered || String(meta.title || 'Business');
  const title = rawTitle.replace(/<[^>]*>/g, '').replace(/&#038;/g, '&').replace(/&amp;/g, '&').replace(/&#8211;/g, '–');

  const city = String(meta.city || 'San Diego');
  const placeIdStr = String(meta.placeId || item.id || '');
  const rawSlug = String(meta.slug || item.slug || '').trim();

  // Create clean SEO friendly slug (max 6 hyphenated words, filtering out keyword-stuffed slugs)
  const slug = (rawSlug && !rawSlug.toLowerCase().startsWith('chij') && rawSlug.includes('-') && rawSlug.split('-').length <= 6)
    ? rawSlug
    : createSeoSlug(title, city, placeIdStr);

  const citySlug = String(meta.citySlug || city.toLowerCase().replace(/\s+/g, '-'));
  const type = String(meta.type || 'General');
  const typeSlug = String(meta.typeSlug || type.toLowerCase().replace(/[\s&]+/g, '-').replace(/[^a-z0-9-]/g, ''));

  const rawAddress = String(meta.address || '');
  const state = detectStateFromListing(String(meta.state || ''), city, rawAddress);
  const stateSlug = state.toLowerCase().replace(/\s+/g, '-');

  return {
    id:            String(item.id || ''),
    placeId:       String(meta.placeId || item.id || ''),
    dataId:        String(meta.dataId || ''),
    slug,
    rawSlug,
    title,
    type,
    typeSlug,
    otherTypes,
    address:       rawAddress,
    city,
    citySlug,
    state,
    stateSlug,
    website:       String(meta.website || ''),
    phone:         String(meta.phone || ''),
    price:         String(meta.price || '$$'),
    rating:        parseFloat(String(meta.rating || '5.0')),
    reviews:       parseInt(String(meta.reviews || '0'), 10),
    description:   String(meta.description || (item.content as any)?.rendered?.replace(/<[^>]*>/g, '') || ''),
    openState:     String(meta.openState || 'Open'),
    workingHours:  parseWorkingHours(meta.workingHours),
    serviceOptions,
    thumbnail:     String(meta.thumbnail || ''),
    latitude:      (() => {
                     const lat = parseFloat(String(meta.latitude || '0'));
                     return (!isNaN(lat) && lat >= 24 && lat <= 50) ? lat : 32.7157;
                   })(),
    longitude:     (() => {
                     let lng = parseFloat(String(meta.longitude || '0'));
                     if (lng > 0 && lng > 60 && lng < 130) lng = -lng;
                     return (!isNaN(lng) && lng <= -65 && lng >= -125) ? lng : -117.1611;
                   })(),
    keyword:       String(meta.keyword || ''),
    googleMapsRank: parseInt(String(meta.googleMapsRank || '0'), 10),
    verified:      meta.verified === 'true' || meta.verified === true,
    claimed:       true,
    featured:      false,
    founderName:   String(meta.founderName || meta.founder_name || meta.owner_name || ''),
    founderRole:   String(meta.founderRole || meta.founder_role || meta.owner_title || ''),
    founderExperience: String(meta.founderExperience || meta.founder_experience || ''),
    founderQuote:  String(meta.founderQuote || meta.founder_quote || meta.owner_quote || ''),
    founderAvatar: String(meta.founderAvatar || meta.founder_avatar || ''),
    licenseStatus: String(meta.licenseStatus || meta.license_status || meta.cslb_status || ''),
  };
}

function parseWorkingHours(raw: unknown) {
  if (!raw || raw === '') return { days: [], timezone: 'America/Los_Angeles' };
  if (typeof raw === 'object' && raw !== null) return raw as any;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return { days: [], timezone: 'America/Los_Angeles' }; }
  }
  return { days: [], timezone: 'America/Los_Angeles' };
}

function mapWpReviewToFormat(item: Record<string, unknown>): BusinessReview {
  const meta = (item.meta as Record<string, unknown>) || {};
  return {
    id:               String(item.id || ''),
    businessPlaceId:  String(meta.businessPlaceId || ''),
    businessSlug:     String(meta.businessSlug || ''),
    reviewerName:     String(meta.reviewerName || 'Anonymous'),
    rating:           Number(meta.rating || 5),
    title:            String((item.title as { rendered?: string })?.rendered || ''),
    comment:          String((item.content as { rendered?: string })?.rendered?.replace(/<[^>]*>/g, '') || ''),
    date:             String(item.date || new Date().toISOString().split('T')[0]),
    verifiedCustomer: Boolean(meta.verifiedCustomer ?? true),
    helpfulCount:     Number(meta.helpfulCount || 0),
    status:           (item.status as 'approved' | 'pending' | 'rejected') || 'approved'
  };
}

export function detectStateFromListing(metaState?: string, city?: string, address?: string): string {
  if (metaState && metaState.trim() !== '') {
    const clean = metaState.trim();
    if (clean.length === 2) return clean.toUpperCase();
    if (clean.toLowerCase() === 'new york') return 'NY';
    if (clean.toLowerCase() === 'california') return 'CA';
    return clean;
  }

  const fullText = `${address || ''} ${city || ''}`.toUpperCase();

  if (city?.toLowerCase() === 'new york' || /\bNEW YORK\b|\bNY\b/.test(fullText)) {
    return 'NY';
  }
  if (/\bCA\b|\bCALIFORNIA\b/.test(fullText) || city?.toLowerCase().includes('san diego') || city?.toLowerCase().includes('la mesa') || city?.toLowerCase().includes('chula vista') || city?.toLowerCase().includes('oceanside') || city?.toLowerCase().includes('carlsbad')) {
    return 'CA';
  }

  const zipMatch = (address || '').match(/,\s*([A-Z]{2})\s+\d{5}/i);
  if (zipMatch && zipMatch[1]) {
    return zipMatch[1].toUpperCase();
  }

  return 'CA';
}

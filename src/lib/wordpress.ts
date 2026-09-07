import { cache } from 'react';
import { MOCK_CATEGORIES, MOCK_CITIES, MOCK_REVIEWS, MOCK_BLOG_POSTS } from '@/data/mockData';
import { BusinessListing, BusinessReview, Category, LocationCity, BlogPost, LeadSubmission, SiteBranding } from '@/types/directory';
import { clearRankMathCache } from './rankMath';

/**
 * Get WordPress REST API base URL.
 */
export function getWpApiUrl(): string {
  // 1. Check browser localStorage first (saved via Admin WP Sync page)
  if (typeof window !== 'undefined') {
    const localSaved = localStorage.getItem('directory_wp_api_url');
    if (localSaved && localSaved.trim()) {
      return localSaved.trim().replace(/\/$/, '');
    }
    const host = window.location.hostname;
    if (host.includes('sandiegobusinesscircle.com') || host.includes('hostingersite.com')) {
      return 'https://admin.sandiegobusinesscircle.com';
    }
  }

  // 2. Check environment variables
  const envUrl = (
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    process.env.WORDPRESS_API_URL ||
    ''
  ).trim().replace(/\/$/, '');

  // In production (e.g. Hostinger), always target the live production WordPress URL
  if (process.env.NODE_ENV === 'production') {
    if (envUrl && !envUrl.includes('.local') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'https://admin.sandiegobusinesscircle.com';
  }

  // In development, use configured envUrl or default to local WordPress
  if (envUrl) {
    return envUrl;
  }

  return 'http://gmb.local';
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

interface ListingsCacheStore {
  data: BusinessListing[];
  timestamp: number;
  lastModifiedGmt: string;
  total: number;
}

let listingsCache: ListingsCacheStore | null = null;
let categoriesCache: { data: Category[]; timestamp: number } | null = null;
let citiesCache: { data: LocationCity[]; timestamp: number } | null = null;
let activeListingsPromise: Promise<BusinessListing[]> | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

export function clearListingsCache(): void {
  listingsCache = null;
  categoriesCache = null;
  citiesCache = null;
  activeListingsPromise = null;
  clearRankMathCache();
}

/**
 * Fetch dynamic Site Branding (Logo, Favicon, Brand Title, SEO) from WordPress.
 * Zero-delay: always fetches live with cache-busting headers.
 */
export async function getSiteBranding(): Promise<SiteBranding> {
  const defaultBranding: SiteBranding = {
    siteName: 'San Diego Business Circle',
    tagline: 'Verified Local Business Directory & Marketplace',
    logo: '',
    logoDark: '',
    favicon: '',
    metaTitle: 'San Diego Business Circle | Verified Local Business Directory',
    metaDescription: 'Discover verified local businesses, medical spas, contractors, and services in San Diego.',
    heroImage1: '/images/hero_medical_spa.jpg',
    heroImage2: '/images/hero_contractor_pro.jpg',
    heroImage3: '/images/hero_storefront.jpg',
    heroBadgeText: 'VERIFIED LOCAL BUSINESS DIRECTORY •',
  };

  const apiUrl = getWpApiUrl();
  if (!apiUrl) return defaultBranding;

  const now = Date.now();
  try {
    const res = await fetch(`${apiUrl}/wp-json/locable/v1/branding?_t=${now}`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        siteName: data.siteName || defaultBranding.siteName,
        tagline: data.tagline || defaultBranding.tagline,
        logo: data.logo || '',
        logoDark: data.logoDark || '',
        favicon: data.favicon || '',
        metaTitle: data.metaTitle || defaultBranding.metaTitle,
        metaDescription: data.metaDescription || defaultBranding.metaDescription,
        heroImage1: data.heroImage1 || defaultBranding.heroImage1,
        heroImage2: data.heroImage2 || defaultBranding.heroImage2,
        heroImage3: data.heroImage3 || defaultBranding.heroImage3,
        heroBadgeText: data.heroBadgeText || defaultBranding.heroBadgeText,
      };
    }
  } catch (e) {
    // Return default fallback
  }

  return defaultBranding;
}

async function getWpListingStatus(apiUrl: string): Promise<{ total: number; latestModifiedGmt: string } | null> {
  try {
    const res = await fetch(
      `${apiUrl}/wp-json/wp/v2/business_listing?per_page=1&orderby=modified&order=desc&_fields=id,modified_gmt&_t=${Date.now()}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (res.ok) {
      const totalHeader = res.headers.get('X-WP-Total');
      const total = totalHeader !== null ? parseInt(totalHeader, 10) : 0;
      const data = await res.json();
      const latestModifiedGmt = Array.isArray(data) && data.length > 0 && data[0].modified_gmt ? String(data[0].modified_gmt) : '';
      return { total, latestModifiedGmt };
    }
  } catch (e) {}
  return null;
}

/**
 * Fetch ALL business listings from WordPress REST API with auto-pagination,
 * zero-delay modification checking, and promise deduplication.
 */
async function fetchAllFromWp(): Promise<BusinessListing[]> {
  const now = Date.now();
  const apiUrl = getWpApiUrl();

  // 1. If listings are cached, verify with WordPress via a fast ~15ms modified timestamp and total count check
  if (listingsCache && apiUrl) {
    const wpStatus = await getWpListingStatus(apiUrl);
    if (wpStatus) {
      if (wpStatus.total === 0) {
        console.log('[WordPress] Total listings is 0 in WordPress. Clearing cache.');
        listingsCache = { data: [], timestamp: now, lastModifiedGmt: '', total: 0 };
        return [];
      }
      if (
        wpStatus.total !== listingsCache.data.length ||
        (wpStatus.latestModifiedGmt && listingsCache.lastModifiedGmt && wpStatus.latestModifiedGmt !== listingsCache.lastModifiedGmt)
      ) {
        console.log(`[WordPress] Detected change in WordPress (Total: WP ${wpStatus.total} vs Cache ${listingsCache.data.length}, Mod: WP ${wpStatus.latestModifiedGmt} vs Cache ${listingsCache.lastModifiedGmt}). Invalidating cache immediately.`);
        listingsCache = null;
      } else {
        // Total and modification timestamp both match! Cache is 100% up to date.
        listingsCache.timestamp = now;
        return listingsCache.data;
      }
    } else if (now - listingsCache.timestamp < 3000) {
      // If status check timed out but cache is under 3s old, return fast cache
      return listingsCache.data;
    }
  }

  if (activeListingsPromise) {
    return activeListingsPromise;
  }

  activeListingsPromise = (async () => {
    try {
      const freshData = await fetchWpListingsDirectly();
      return freshData;
    } finally {
      activeListingsPromise = null;
    }
  })();

  return activeListingsPromise;
}

async function fetchWpListingsDirectly(): Promise<BusinessListing[]> {
  const now = Date.now();
  const apiUrl = getWpApiUrl();
  if (!apiUrl) return listingsCache ? listingsCache.data : [];

  try {
    const firstRes = await fetch(
      `${apiUrl}/wp-json/wp/v2/business_listing?per_page=100&page=1&orderby=modified&order=desc&_fields=id,slug,title,meta,modified_gmt&_t=${now}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!firstRes.ok) {
      console.warn(`[WordPress] API returned HTTP ${firstRes.status}`);
      return listingsCache ? listingsCache.data : [];
    }

    const ct = firstRes.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      console.warn('[WordPress] Response is not JSON (got:', ct, '). Check WordPress REST API settings.');
      return listingsCache ? listingsCache.data : [];
    }

    const totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);
    const total      = parseInt(firstRes.headers.get('X-WP-Total') || '0', 10);
    const firstPage  = await firstRes.json();

    if (!Array.isArray(firstPage) || firstPage.length === 0 || total === 0) {
      console.log('[WordPress] 0 business listings found in WordPress.');
      listingsCache = { data: [], timestamp: now, lastModifiedGmt: '', total: 0 };
      return [];
    }

    const latestModifiedGmt = (Array.isArray(firstPage) && firstPage.length > 0 && firstPage[0].modified_gmt)
      ? String(firstPage[0].modified_gmt)
      : '';

    let allPosts = [...firstPage];

    // Seed cache immediately with the first 100 listings so callers get fast responses
    const initialMapped = allPosts.map(mapWpBusinessToFormat);
    if (!listingsCache || listingsCache.data.length === 0) {
      listingsCache = { data: initialMapped, timestamp: now, lastModifiedGmt: latestModifiedGmt, total };
    }

    if (totalPages > 1) {
      const BATCH_SIZE = 4;
      for (let i = 2; i <= totalPages; i += BATCH_SIZE) {
        const batchPromises: Promise<unknown[]>[] = [];
        for (let page = i; page < Math.min(i + BATCH_SIZE, totalPages + 1); page++) {
          batchPromises.push(
            fetch(
              `${apiUrl}/wp-json/wp/v2/business_listing?per_page=100&page=${page}&orderby=modified&order=desc&_fields=id,slug,title,meta,modified_gmt&_t=${now}`,
              {
                cache: 'no-store',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache'
                },
                signal: AbortSignal.timeout(12000),
              }
            ).then(async (r) => {
              if (r.ok) return r.json();
              await new Promise((res) => setTimeout(res, 200));
              const retry = await fetch(
                `${apiUrl}/wp-json/wp/v2/business_listing?per_page=100&page=${page}&orderby=modified&order=desc&_fields=id,slug,title,meta,modified_gmt&_t=${now}`,
                {
                  cache: 'no-store',
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                  }
                }
              );
              return retry.ok ? retry.json() : [];
            }).catch(() => [])
          );
        }
        const batchResults = await Promise.all(batchPromises);
        for (const batch of batchResults) {
          if (Array.isArray(batch)) allPosts = allPosts.concat(batch);
        }
        // Update incremental cache
        listingsCache = { data: allPosts.map(mapWpBusinessToFormat), timestamp: now, lastModifiedGmt: latestModifiedGmt, total };
        // Gentle delay to avoid choking local PHP-FPM
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    console.log(`[WordPress] Successfully fetched ${allPosts.length} of ${total} total business listings.`);
    const mapped = allPosts.map(mapWpBusinessToFormat);
    listingsCache = { data: mapped, timestamp: now, lastModifiedGmt: latestModifiedGmt, total };
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
  limit?: number;
  page?: number;
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
  limit?: number;
  page?: number;
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

  if (filters?.limit && filters.limit > 0) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const start = (page - 1) * filters.limit;
    return results.slice(start, start + filters.limit);
  }

  return results;
}

function findBusinessInList(list: BusinessListing[], target: string): BusinessListing | null {
  if (!list || list.length === 0 || !target) return null;
  const t = target.toLowerCase().trim();

  // PASS 1: Exact canonical slug match
  const exactSlug = list.find(b => b.slug.toLowerCase() === t);
  if (exactSlug) return exactSlug;

  // PASS 2: Exact alias match (placeId, WP slug, historical aliases, ID)
  const exactAlias = list.find(b =>
    (b.aliases && b.aliases.some(a => a.toLowerCase() === t)) ||
    b.placeId.toLowerCase() === t ||
    String(b.id) === t ||
    (b.wpSlug && b.wpSlug.toLowerCase() === t) ||
    (b.rawSlug && b.rawSlug.toLowerCase() === t)
  );
  if (exactAlias) return exactAlias;

  // PASS 3: Exact title-derived slug match
  const exactTitle = list.find(b => {
    const titleSlug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (titleSlug === t) return true;
    const titleSeo = createSeoSlug(b.title, b.city, b.placeId).toLowerCase();
    return titleSeo === t;
  });
  if (exactTitle) return exactTitle;

  // PASS 4: City variations (e.g. target with or without -san-diego suffix)
  const cityMatch = list.find(b => {
    const cityClean = (b.city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!cityClean) return false;
    if (`${t}-${cityClean}` === b.slug.toLowerCase()) return true;
    if (`${b.slug.toLowerCase()}-${cityClean}` === t) return true;
    const targetNoCity = t.replace(new RegExp(`-${cityClean}$`), '');
    const slugNoCity = b.slug.toLowerCase().replace(new RegExp(`-${cityClean}$`), '');
    if (targetNoCity && targetNoCity === slugNoCity) return true;
    if (b.wpSlug && targetNoCity === b.wpSlug.toLowerCase()) return true;
    return false;
  });
  if (cityMatch) return cityMatch;

  // PASS 5: Number / duplicate normalization (e.g. 'the-studio-med-spa-2' -> 'the-studio-med-spa')
  const stripDigits = (s: string) => s.replace(/[0-9]+/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const tNoDigits = stripDigits(t);
  if (tNoDigits.length > 5) {
    const numMatch = list.find(b => {
      const sNoDigits = stripDigits(b.slug);
      return sNoDigits === tNoDigits;
    });
    if (numMatch) return numMatch;
  }

  return null;
}

export const getBusinessBySlug = cache(async (slugOrPlaceId: string): Promise<BusinessListing | null> => {
  const target = (slugOrPlaceId || '').toLowerCase().trim();
  if (!target) return null;

  // 1. Ensure full dataset is up to date (checks WordPress modified status in ~15ms)
  const allListings = await fetchAllFromWp();
  const cachedMatch = findBusinessInList(allListings, target);
  if (cachedMatch) return cachedMatch;

  const apiUrl = getWpApiUrl();

  // 2. Direct queries to WordPress REST API with cache: 'no-store'
  if (apiUrl) {
    // 2a. Direct slug lookup
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_listing?slug=${encodeURIComponent(slugOrPlaceId)}&_fields=id,slug,title,meta,modified_gmt&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map(mapWpBusinessToFormat);
          const found = findBusinessInList(mapped, target);
          if (found) return found;
        }
      }
    } catch (e) {
      console.warn('[WordPress] Direct slug lookup warning:', e);
    }

    // 2b. Direct slug lookup without city suffix (e.g. querying 'the-studio-med-spa' when URL has 'the-studio-med-spa-san-diego')
    const baseSlug = slugOrPlaceId.replace(/-(san-diego|chula-vista|oceanside|carlsbad|escondido|la-mesa|el-cajon|encinitas|san-marcos|vista|poway|coronado|del-mar|imperial-beach|lemon-grove|national-city|santee|solana-beach)/i, '');
    if (baseSlug !== slugOrPlaceId) {
      try {
        const resBase = await fetch(
          `${apiUrl}/wp-json/wp/v2/business_listing?slug=${encodeURIComponent(baseSlug)}&_fields=id,slug,title,meta,modified_gmt&_t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (resBase.ok) {
          const items = await resBase.json();
          if (Array.isArray(items) && items.length > 0) {
            const mapped = items.map(mapWpBusinessToFormat);
            const found = findBusinessInList(mapped, target);
            if (found) return found;
          }
        }
      } catch (e) {}
    }

    // 2c. Try search query by slug keywords
    try {
      const cleanSearch = slugOrPlaceId.replace(/-/g, ' ').replace(/[0-9]+/g, '').trim();
      const resSearch = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_listing?search=${encodeURIComponent(cleanSearch)}&per_page=15&_fields=id,slug,title,meta,modified_gmt&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (resSearch.ok) {
        const items = await resSearch.json();
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map(mapWpBusinessToFormat);
          const found = findBusinessInList(mapped, target);
          if (found) return found;
        }
      }
    } catch (e) {}
  }

  return null;
});

/**
 * Dynamically derive Category taxonomy from actual WP data
 */
export async function getCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache && (now - categoriesCache.timestamp < CACHE_TTL_MS) && categoriesCache.data.length > 0) {
    return categoriesCache.data;
  }

  const categoryMap = new Map<string, Category>();

  // Initialize with predefined categories
  for (const cat of MOCK_CATEGORIES) {
    categoryMap.set(cat.name.toLowerCase().trim(), { ...cat, count: 0 });
  }

  // 1. Fetch all pages of WordPress CPT business_type taxonomy terms
  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const firstRes = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_type?per_page=100&page=1&orderby=count&order=desc`,
        {
          headers: { 'User-Agent': 'LocableNextJS/1.0' },
          signal: AbortSignal.timeout(6000),
          cache: 'no-store',
        }
      );
      if (firstRes.ok) {
        const totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);
        const firstTerms = await firstRes.json();
        let allTerms = Array.isArray(firstTerms) ? [...firstTerms] : [];

        if (totalPages > 1) {
          const pagePromises = [];
          const maxPages = Math.min(totalPages, 6);
          for (let p = 2; p <= maxPages; p++) {
            pagePromises.push(
              fetch(`${apiUrl}/wp-json/wp/v2/business_type?per_page=100&page=${p}&orderby=count&order=desc`, {
                headers: { 'User-Agent': 'LocableNextJS/1.0' },
                signal: AbortSignal.timeout(6000),
                cache: 'no-store',
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

  // 2. Synchronously check in-memory cached listings (if any) without triggering a fetch
  if (listingsCache && listingsCache.data.length > 0) {
    for (const b of listingsCache.data) {
      if (!b.type) continue;
      const key = b.type.toLowerCase().trim();
      const slug = b.typeSlug || key.replace(/[\s&]+/g, '-').replace(/[^a-z0-9-]/g, '');

      if (!categoryMap.has(key)) {
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
  }

  // Sort by highest business count descending, then alphabetically
  const result = Array.from(categoryMap.values()).sort((a, b) => (b.count || 0) - (a.count || 0) || a.name.localeCompare(b.name));
  if (result.length > 0) {
    categoriesCache = { data: result, timestamp: now };
  }
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
  if (citiesCache && (now - citiesCache.timestamp < CACHE_TTL_MS) && citiesCache.data.length > 0) {
    return citiesCache.data;
  }

  const cityMap = new Map<string, { name: string; slug: string; state: string; count: number }>();
  const apiUrl = getWpApiUrl();

  // 1. Fetch from WordPress business_location taxonomy directly
  if (apiUrl) {
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/wp/v2/business_location?per_page=100&orderby=count&order=desc`,
        {
          headers: { 'User-Agent': 'LocableNextJS/1.0' },
          signal: AbortSignal.timeout(6000),
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const terms = await res.json();
        if (Array.isArray(terms)) {
          for (const t of terms) {
            const cityName = cleanCityName(t.name);
            if (!cityName) continue;
            const slug = t.slug || cityName.toLowerCase().replace(/\s+/g, '-');
            cityMap.set(slug, {
              name: cityName,
              slug,
              state: 'CA',
              count: t.count || 0,
            });
          }
        }
      }
    } catch (e) {
      console.warn('[WordPress] business_location taxonomy fetch warning:', e);
    }
  }

  // 2. Synchronously check in-memory cached listings (if any) without triggering a fetch
  if (listingsCache && listingsCache.data.length > 0) {
    for (const b of listingsCache.data) {
      const cityName = cleanCityName(b.city);
      if (!cityName) continue;

      const slug = cityName.toLowerCase().replace(/\s+/g, '-');
      if (cityMap.has(slug)) {
        if (!cityMap.get(slug)!.count) {
          cityMap.get(slug)!.count++;
        }
      } else {
        cityMap.set(slug, { name: cityName, slug, state: b.state || 'CA', count: 1 });
      }
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
    result = [...MOCK_CITIES];
  }

  if (result.length > 0) {
    citiesCache = { data: result, timestamp: now };
  }
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

/**
 * Sanitize raw GMB / CSV business titles:
 * Removes pipe keyword stuffing ("Name | Skin Tightening | Cryo..."), bullets, subtitle spam,
 * and category repetition after dashes ("E Med Spa - Medical Spa in Rancho Bernardo" -> "E Med Spa").
 * Preserves legitimate multi-location branch tags ("SDBotox - Pacific Beach").
 */
export function sanitizeBusinessTitle(rawTitle: string, category?: string, city?: string): string {
  if (!rawTitle) return '';
  let title = String(rawTitle).trim();

  // 1. Decode HTML entities
  title = title
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]*>/g, '');

  // 2. Remove pipes/pipelines and all keyword stuffing after the first pipe:
  // e.g. "Skin Medical Spa in San Diego | Skin Tightening | Cryo Fat Freezing | Lipo Cavitation"
  if (/[|¦‖]/.test(title)) {
    const parts = title.split(/\s*[|¦‖]\s*/).filter(Boolean);
    if (parts.length > 0) {
      title = parts[0].trim();
    }
  }

  // 3. Remove bullets: "Name • Keyword • Keyword"
  if (/[•·●▪]/.test(title)) {
    const parts = title.split(/\s*[•·●▪]\s*/).filter(Boolean);
    if (parts.length > 0) {
      title = parts[0].trim();
    }
  }

  // 4. Remove double slashes: "Name // Keyword"
  if (/\s*\/\/\s*/.test(title)) {
    const parts = title.split(/\s*\/\/\s*/).filter(Boolean);
    if (parts.length > 0) {
      title = parts[0].trim();
    }
  }

  // 5. Clean keyword stuffing after hyphens/dashes:
  // e.g. "E Med Spa - Medical Spa in Rancho Bernardo" -> "E Med Spa"
  // but PRESERVE real branch/neighborhood identifiers: "SDBotox - Pacific Beach", "Revive Med Spa - Mission Valley"
  const dashMatch = title.match(/^(.*?)\s+[-–—]\s+(.*?)$/);
  if (dashMatch) {
    const prefix = dashMatch[1].trim();
    const suffix = dashMatch[2].trim();

    const catLower = (category || '').toLowerCase().trim();
    const sufLower = suffix.toLowerCase();

    const isCategorySpam = catLower && (
      sufLower.includes(catLower) ||
      (catLower.length > 4 && sufLower.includes(catLower.replace(/s$/, '')))
    );
    const isMarketingSpam = /^(best|top|#1|rated|emergency|licensed|affordable|expert|specialist|specialists|services|service|official|premier)\b/i.test(suffix)
      || /\b(near\s+me|24\/7|open\s+now|free\s+estimates?)\b/i.test(suffix)
      || /\b(medical\s+spa|med\s+spa|plumbing|roofing|electrician|contractor|dentist|attorney|lawyer)\s+in\b/i.test(suffix);

    if (isCategorySpam || isMarketingSpam) {
      title = prefix;
    }
  }

  // 6. Remove colon subtitle spam: e.g. "ABC Dental: Cosmetic & Family Dentistry"
  const colonMatch = title.match(/^(.*?):\s+(.*?)$/);
  if (colonMatch) {
    const prefix = colonMatch[1].trim();
    const suffix = colonMatch[2].trim();
    if (/(dentistry|dentist|spa|plumbing|roofing|repair|services|best|#1|rated|emergency)/i.test(suffix)) {
      title = prefix;
    }
  }

  // 7. Strip trailing location keyword spam like " in San Diego" or " in San Diego, CA" (only if preceded by "in")
  // e.g. "Skin Medical Spa in San Diego" -> "Skin Medical Spa"
  title = title.replace(/\s+in\s+([A-Z][a-zA-Z\s]+)(,\s*[A-Z]{2})?$/i, '').trim();

  // 8. Clean up whitespace and any trailing separator punctuation
  title = title.replace(/\s+/g, ' ').replace(/[\s,:–|/-]+$/, '').trim();

  return title;
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
  const type = String(meta.type || 'General');
  const city = String(meta.city || 'San Diego');
  const title = sanitizeBusinessTitle(rawTitle, type, city);
  const placeIdStr = String(meta.placeId || item.id || '');
  const cleanCity = (city || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  // WordPress native post slug (post_name, e.g. 'the-studio-med-spa')
  const wpPostSlug = String(item.slug || '').trim().toLowerCase();
  const rawMetaSlug = String(meta.slug || '').trim().toLowerCase();

  // Determine canonical permanent slug:
  // 1. If meta.slug is clean human-readable slug (not starting with chij and not purely numeric): use it!
  // 2. Otherwise if wpPostSlug is valid and not starting with chij: use it! (append city if not already present)
  // 3. Otherwise generate from title + city + placeId
  let slug = '';
  if (rawMetaSlug && !rawMetaSlug.startsWith('chij') && !/^\d+$/.test(rawMetaSlug) && rawMetaSlug.includes('-') && rawMetaSlug.split('-').length <= 6) {
    slug = rawMetaSlug;
  } else if (wpPostSlug && !wpPostSlug.startsWith('chij') && wpPostSlug !== 'business_listing' && !/^\d+$/.test(wpPostSlug)) {
    slug = (cleanCity && !wpPostSlug.includes(cleanCity)) ? `${wpPostSlug}-${cleanCity}` : wpPostSlug;
  } else {
    slug = createSeoSlug(title, city, placeIdStr);
  }

  // Collect all aliases so ANY old URL, title variation, placeId, or WP slug NEVER 404s!
  const aliasesSet = new Set<string>();
  if (wpPostSlug) aliasesSet.add(wpPostSlug);
  if (cleanCity && wpPostSlug && !wpPostSlug.includes(cleanCity)) aliasesSet.add(`${wpPostSlug}-${cleanCity}`);
  if (rawMetaSlug) aliasesSet.add(rawMetaSlug);
  if (placeIdStr) aliasesSet.add(placeIdStr.toLowerCase());
  if (meta.dataId) aliasesSet.add(String(meta.dataId).toLowerCase());
  if (item.id) aliasesSet.add(String(item.id));

  // Also include current title SEO slug and clean title slug as aliases
  const currentTitleSeo = createSeoSlug(title, city, placeIdStr).toLowerCase();
  aliasesSet.add(currentTitleSeo);
  const currentTitleClean = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (currentTitleClean) {
    aliasesSet.add(currentTitleClean);
    if (cleanCity && !currentTitleClean.includes(cleanCity)) {
      aliasesSet.add(`${currentTitleClean}-${cleanCity}`);
    }
  }

  // Also include version without numbers (e.g. "the-studio-med-spa2" -> "the-studio-med-spa")
  const strippedNumber = slug.replace(/[0-9]+/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  if (strippedNumber && strippedNumber.length > 3) {
    aliasesSet.add(strippedNumber);
  }

  const aliases = Array.from(aliasesSet).filter(a => a && a !== slug);

  const citySlug = String(meta.citySlug || city.toLowerCase().replace(/\s+/g, '-'));
  const typeSlug = String(meta.typeSlug || type.toLowerCase().replace(/[\s&]+/g, '-').replace(/[^a-z0-9-]/g, ''));

  const rawAddress = String(meta.address || '');
  const state = detectStateFromListing(String(meta.state || ''), city, rawAddress);
  const stateSlug = state.toLowerCase().replace(/\s+/g, '-');

  return {
    id:            String(item.id || ''),
    placeId:       String(meta.placeId || item.id || ''),
    dataId:        String(meta.dataId || ''),
    slug,
    rawSlug:       rawMetaSlug || wpPostSlug,
    wpSlug:        wpPostSlug,
    aliases,
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

import { BusinessListing, Category, LocationCity, BlogPost, SiteBranding } from '@/types/directory';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

let businessCache: CacheItem<BusinessListing[]> | null = null;
let categoryCache: CacheItem<Category[]> | null = null;
let cityCache: CacheItem<LocationCity[]> | null = null;
let postCache: CacheItem<BlogPost[]> | null = null;

let pendingBusinessPromise: Promise<BusinessListing[]> | null = null;
let pendingCategoryPromise: Promise<Category[]> | null = null;
let pendingCityPromise: Promise<LocationCity[]> | null = null;
let pendingPostPromise: Promise<BlogPost[]> | null = null;

const CLIENT_CACHE_TTL = 5000; // 5 seconds fresh cache for instant updates

export async function fetchCachedBusinesses(): Promise<BusinessListing[]> {
  const now = Date.now();
  if (businessCache && now - businessCache.timestamp < CLIENT_CACHE_TTL) {
    return businessCache.data;
  }
  if (pendingBusinessPromise) return pendingBusinessPromise;

  pendingBusinessPromise = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch('/api/businesses?_t=' + Date.now(), { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) {
            businessCache = { data, timestamp: Date.now() };
            return data;
          }
        }
      } catch (e) {}
      if (attempt === 0) await new Promise((res) => setTimeout(res, 300));
    }

    return businessCache ? businessCache.data : [];
  })().finally(() => {
    pendingBusinessPromise = null;
  });

  return pendingBusinessPromise;
}

export async function fetchCachedCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoryCache && now - categoryCache.timestamp < CLIENT_CACHE_TTL) {
    return categoryCache.data;
  }
  if (pendingCategoryPromise) return pendingCategoryPromise;

  pendingCategoryPromise = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch('/api/categories?_t=' + Date.now(), { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) {
            categoryCache = { data, timestamp: Date.now() };
            return data;
          }
        }
      } catch (e) {}
      if (attempt === 0) await new Promise((res) => setTimeout(res, 300));
    }

    return categoryCache ? categoryCache.data : [];
  })().finally(() => {
    pendingCategoryPromise = null;
  });

  return pendingCategoryPromise;
}

export async function fetchCachedCities(): Promise<LocationCity[]> {
  const now = Date.now();
  if (cityCache && now - cityCache.timestamp < CLIENT_CACHE_TTL) {
    return cityCache.data;
  }
  if (pendingCityPromise) return pendingCityPromise;

  pendingCityPromise = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch('/api/cities?_t=' + Date.now(), { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) {
            cityCache = { data, timestamp: Date.now() };
            return data;
          }
        }
      } catch (e) {}
      if (attempt === 0) await new Promise((res) => setTimeout(res, 300));
    }

    return cityCache ? cityCache.data : [];
  })().finally(() => {
    pendingCityPromise = null;
  });

  return pendingCityPromise;
}

export async function fetchCachedPosts(): Promise<BlogPost[]> {
  const now = Date.now();
  if (postCache && now - postCache.timestamp < CLIENT_CACHE_TTL) {
    return postCache.data;
  }
  if (pendingPostPromise) return pendingPostPromise;

  pendingPostPromise = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch('/api/posts?_t=' + Date.now(), { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data)) {
            postCache = { data, timestamp: Date.now() };
            return data;
          }
        }
      } catch (e) {}
      if (attempt === 0) await new Promise((res) => setTimeout(res, 300));
    }

    return postCache ? postCache.data : [];
  })().finally(() => {
    pendingPostPromise = null;
  });

  return pendingPostPromise;
}

let brandingCacheItem: CacheItem<SiteBranding> | null = null;
let pendingBrandingPromise: Promise<SiteBranding> | null = null;

export async function fetchCachedBranding(): Promise<SiteBranding> {
  const now = Date.now();
  if (brandingCacheItem && now - brandingCacheItem.timestamp < 3000) {
    return brandingCacheItem.data;
  }
  if (pendingBrandingPromise) return pendingBrandingPromise;

  pendingBrandingPromise = (async () => {
    try {
      const r = await fetch(`/api/branding?_t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        if (data && data.siteName) {
          brandingCacheItem = { data, timestamp: Date.now() };
          return data;
        }
      }
    } catch (e) {}

    return brandingCacheItem?.data || {
      siteName: 'San Diego Business Circle',
      tagline: 'Verified Local Business Directory & Marketplace',
      logo: '',
      logoDark: '',
      favicon: '',
      heroImage1: '/images/hero_medical_spa.jpg',
      heroImage2: '/images/hero_contractor_pro.jpg',
      heroImage3: '/images/hero_storefront.jpg',
      heroBadgeText: 'VERIFIED LOCAL BUSINESS DIRECTORY •',
    };
  })().finally(() => {
    pendingBrandingPromise = null;
  });

  return pendingBrandingPromise;
}

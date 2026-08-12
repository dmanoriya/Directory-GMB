import { BusinessListing, Category, LocationCity, BlogPost } from '@/types/directory';
import { getBusinesses, getCategories, getCities, getBlogPosts } from '@/lib/wordpress';

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

const CLIENT_CACHE_TTL = 300000; // 5 minutes

export async function fetchCachedBusinesses(): Promise<BusinessListing[]> {
  const now = Date.now();
  if (businessCache && businessCache.data.length > 0 && now - businessCache.timestamp < CLIENT_CACHE_TTL) {
    return businessCache.data;
  }
  if (pendingBusinessPromise) return pendingBusinessPromise;

  pendingBusinessPromise = (async () => {
    try {
      const r = await fetch('/api/businesses');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          businessCache = { data, timestamp: Date.now() };
          return data;
        }
      }
    } catch (e) {}

    // Fallback: Direct fetch from WordPress REST API if API route returns empty
    try {
      const direct = await getBusinesses();
      if (Array.isArray(direct) && direct.length > 0) {
        businessCache = { data: direct, timestamp: Date.now() };
        return direct;
      }
    } catch (e) {}

    return businessCache ? businessCache.data : [];
  })().finally(() => {
    pendingBusinessPromise = null;
  });

  return pendingBusinessPromise;
}

export async function fetchCachedCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoryCache && categoryCache.data.length > 0 && now - categoryCache.timestamp < CLIENT_CACHE_TTL) {
    return categoryCache.data;
  }
  if (pendingCategoryPromise) return pendingCategoryPromise;

  pendingCategoryPromise = (async () => {
    try {
      const r = await fetch('/api/categories');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          categoryCache = { data, timestamp: Date.now() };
          return data;
        }
      }
    } catch (e) {}

    try {
      const direct = await getCategories();
      if (Array.isArray(direct) && direct.length > 0) {
        categoryCache = { data: direct, timestamp: Date.now() };
        return direct;
      }
    } catch (e) {}

    return categoryCache ? categoryCache.data : [];
  })().finally(() => {
    pendingCategoryPromise = null;
  });

  return pendingCategoryPromise;
}

export async function fetchCachedCities(): Promise<LocationCity[]> {
  const now = Date.now();
  if (cityCache && cityCache.data.length > 0 && now - cityCache.timestamp < CLIENT_CACHE_TTL) {
    return cityCache.data;
  }
  if (pendingCityPromise) return pendingCityPromise;

  pendingCityPromise = (async () => {
    try {
      const r = await fetch('/api/cities');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          cityCache = { data, timestamp: Date.now() };
          return data;
        }
      }
    } catch (e) {}

    try {
      const direct = await getCities();
      if (Array.isArray(direct) && direct.length > 0) {
        cityCache = { data: direct, timestamp: Date.now() };
        return direct;
      }
    } catch (e) {}

    return cityCache ? cityCache.data : [];
  })().finally(() => {
    pendingCityPromise = null;
  });

  return pendingCityPromise;
}

export async function fetchCachedPosts(): Promise<BlogPost[]> {
  const now = Date.now();
  if (postCache && postCache.data.length > 0 && now - postCache.timestamp < CLIENT_CACHE_TTL) {
    return postCache.data;
  }
  if (pendingPostPromise) return pendingPostPromise;

  pendingPostPromise = (async () => {
    try {
      const r = await fetch('/api/posts');
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          postCache = { data, timestamp: Date.now() };
          return data;
        }
      }
    } catch (e) {}

    try {
      const direct = await getBlogPosts();
      if (Array.isArray(direct) && direct.length > 0) {
        postCache = { data: direct, timestamp: Date.now() };
        return direct;
      }
    } catch (e) {}

    return postCache ? postCache.data : [];
  })().finally(() => {
    pendingPostPromise = null;
  });

  return pendingPostPromise;
}

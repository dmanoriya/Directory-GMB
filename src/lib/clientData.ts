import { BusinessListing, Category, LocationCity, BlogPost } from '@/types/directory';

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
  if (businessCache && now - businessCache.timestamp < CLIENT_CACHE_TTL) {
    return businessCache.data;
  }
  if (pendingBusinessPromise) return pendingBusinessPromise;

  pendingBusinessPromise = fetch('/api/businesses')
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => {
      const arr = Array.isArray(data) ? data : [];
      businessCache = { data: arr, timestamp: Date.now() };
      pendingBusinessPromise = null;
      return arr;
    })
    .catch(() => {
      pendingBusinessPromise = null;
      return businessCache ? businessCache.data : [];
    });

  return pendingBusinessPromise;
}

export async function fetchCachedCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoryCache && now - categoryCache.timestamp < CLIENT_CACHE_TTL) {
    return categoryCache.data;
  }
  if (pendingCategoryPromise) return pendingCategoryPromise;

  pendingCategoryPromise = fetch('/api/categories')
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => {
      const arr = Array.isArray(data) ? data : [];
      categoryCache = { data: arr, timestamp: Date.now() };
      pendingCategoryPromise = null;
      return arr;
    })
    .catch(() => {
      pendingCategoryPromise = null;
      return categoryCache ? categoryCache.data : [];
    });

  return pendingCategoryPromise;
}

export async function fetchCachedCities(): Promise<LocationCity[]> {
  const now = Date.now();
  if (cityCache && now - cityCache.timestamp < CLIENT_CACHE_TTL) {
    return cityCache.data;
  }
  if (pendingCityPromise) return pendingCityPromise;

  pendingCityPromise = fetch('/api/cities')
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => {
      const arr = Array.isArray(data) ? data : [];
      cityCache = { data: arr, timestamp: Date.now() };
      pendingCityPromise = null;
      return arr;
    })
    .catch(() => {
      pendingCityPromise = null;
      return cityCache ? cityCache.data : [];
    });

  return pendingCityPromise;
}

export async function fetchCachedPosts(): Promise<BlogPost[]> {
  const now = Date.now();
  if (postCache && now - postCache.timestamp < CLIENT_CACHE_TTL) {
    return postCache.data;
  }
  if (pendingPostPromise) return pendingPostPromise;

  pendingPostPromise = fetch('/api/posts')
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => {
      const arr = Array.isArray(data) ? data : [];
      postCache = { data: arr, timestamp: Date.now() };
      pendingPostPromise = null;
      return arr;
    })
    .catch(() => {
      pendingPostPromise = null;
      return postCache ? postCache.data : [];
    });

  return pendingPostPromise;
}

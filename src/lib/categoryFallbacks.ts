/**
 * Category-based fallback image map for both Grid cards and Detail hero headers.
 */

export interface CategoryFallbackImages {
  grid: string;
  detail: string;
}

export const CATEGORY_FALLBACK_MAP: Record<string, CategoryFallbackImages> = {
  // Medical Spa & Wellness
  'medical-spa': {
    grid: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop&q=80'
  },
  'medical spa & wellness': {
    grid: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop&q=80'
  },

  // Plumbing
  'plumbing': {
    grid: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=600&fit=crop&q=80'
  },

  // HVAC & Air Conditioning
  'hvac': {
    grid: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&h=600&fit=crop&q=80'
  },
  'hvac & air conditioning': {
    grid: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&h=600&fit=crop&q=80'
  },

  // Roofing
  'roofing': {
    grid: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=600&fit=crop&q=80'
  },

  // Electricians
  'electricians': {
    grid: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop&q=80'
  },
  'electrician': {
    grid: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop&q=80'
  },

  // Solar Power & Storage
  'solar': {
    grid: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&h=600&fit=crop&q=80'
  },
  'solar power & storage': {
    grid: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&h=600&fit=crop&q=80'
  },

  // Landscaping & Turf
  'landscaping': {
    grid: 'https://images.unsplash.com/photo-1558904541-efa8c196b27d?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=1200&h=600&fit=crop&q=80'
  },
  'landscaping & turf': {
    grid: 'https://images.unsplash.com/photo-1558904541-efa8c196b27d?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=1200&h=600&fit=crop&q=80'
  },

  // Pest Control
  'pest-control': {
    grid: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop&q=80'
  },
  'pest control': {
    grid: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop&q=80',
    detail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=600&fit=crop&q=80'
  }
};

const DEFAULT_GRID_FALLBACK = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80';
const DEFAULT_DETAIL_FALLBACK = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&q=80';

export function getCategoryFallbackImage(category?: string | null, variant: 'grid' | 'detail' = 'grid'): string {
  if (!category) {
    return variant === 'detail' ? DEFAULT_DETAIL_FALLBACK : DEFAULT_GRID_FALLBACK;
  }

  const key = category.trim().toLowerCase();
  const match = CATEGORY_FALLBACK_MAP[key];

  if (match) {
    return variant === 'detail' ? match.detail : match.grid;
  }

  // Substring matching
  for (const mapKey of Object.keys(CATEGORY_FALLBACK_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) {
      return variant === 'detail' ? CATEGORY_FALLBACK_MAP[mapKey].detail : CATEGORY_FALLBACK_MAP[mapKey].grid;
    }
  }

  return variant === 'detail' ? DEFAULT_DETAIL_FALLBACK : DEFAULT_GRID_FALLBACK;
}

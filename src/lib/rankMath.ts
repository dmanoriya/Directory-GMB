import type { Metadata } from 'next';
import { getWpApiUrl } from './wordpress';

export interface RankMathHeadData {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLdSchemas: string[];
  rawHead?: string;
}

const FRONTEND_CANONICAL_DOMAIN = 'https://sandiegobusinesscircle.com';

let rankMathCache: Map<string, { data: RankMathHeadData | null; timestamp: number }> = new Map();
const rankMathInFlight: Map<string, Promise<{ metadata: Metadata; jsonLdSchemas: string[] }>> = new Map();
const RM_CACHE_TTL_MS = 30 * 1000; // 30 seconds in-memory cache for fast repeat requests

export function clearRankMathCache(): void {
  rankMathCache.clear();
  rankMathInFlight.clear();
}

/**
 * Fetch raw HTML head string from Rank Math Headless REST API:
 * GET /wp-json/rankmath/v1/getHead?url={targetUrl}
 */
export async function fetchRankMathHead(wpTargetUrl: string): Promise<string | null> {
  const apiUrl = getWpApiUrl();
  if (!apiUrl) return null;

  try {
    const endpoint = `${apiUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(wpTargetUrl)}&_t=${Date.now()}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) LocableNextJS/1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.success && typeof data.head === 'string') {
      return data.head;
    }
  } catch (error) {
    // Non-blocking fallback
  }

  return null;
}

/**
 * Parses raw Rank Math HTML head string into structured metadata and JSON-LD schemas.
 */
export function parseRankMathHead(headHtml: string, fallbackCanonicalPath = ''): RankMathHeadData {
  if (!headHtml) {
    return { jsonLdSchemas: [] };
  }

  const extractTag = (regex: RegExp): string | undefined => {
    const match = headHtml.match(regex);
    if (!match || !match[1]) return undefined;
    return decodeHtmlEntities(match[1].trim());
  };

  const title =
    extractTag(/<title[^>]*>(.*?)<\/title>/i) ||
    extractTag(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
    extractTag(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i);

  const description =
    extractTag(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
    extractTag(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
    extractTag(/<meta\s+name=["']twitter:description["']\s+content=["'](.*?)["']/i);

  const rawCanonical = extractTag(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  const robots = extractTag(/<meta\s+name=["']robots["']\s+content=["'](.*?)["']/i);

  const ogTitle = extractTag(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) || title;
  const ogDescription = extractTag(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) || description;
  const ogImage = extractTag(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
  const ogType = extractTag(/<meta\s+property=["']og:type["']\s+content=["'](.*?)["']/i) || 'website';
  const ogSiteName = extractTag(/<meta\s+property=["']og:site_name["']\s+content=["'](.*?)["']/i);

  const twitterCard = extractTag(/<meta\s+name=["']twitter:card["']\s+content=["'](.*?)["']/i) || 'summary_large_image';
  const twitterTitle = extractTag(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i) || title;
  const twitterDescription = extractTag(/<meta\s+name=["']twitter:description["']\s+content=["'](.*?)["']/i) || description;
  const twitterImage = extractTag(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i) || ogImage;

  // Extract JSON-LD scripts and normalize WordPress backend URLs to public frontend domain
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const jsonLdSchemas: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = jsonLdRegex.exec(headHtml)) !== null) {
    if (m[1] && m[1].trim()) {
      let schemaStr = m[1].trim();
      schemaStr = schemaStr
        .replaceAll('http://gmb.local', FRONTEND_CANONICAL_DOMAIN)
        .replaceAll('https://admin.sandiegobusinesscircle.com', FRONTEND_CANONICAL_DOMAIN)
        .replaceAll('http:\\/\\/gmb.local', 'https:\\/\\/sandiegobusinesscircle.com')
        .replaceAll('https:\\/\\/admin.sandiegobusinesscircle.com', 'https:\\/\\/sandiegobusinesscircle.com');
      jsonLdSchemas.push(schemaStr);
    }
  }

  // Normalize canonical URL to public frontend domain
  let canonical: string | undefined = undefined;
  if (fallbackCanonicalPath) {
    canonical = `${FRONTEND_CANONICAL_DOMAIN}${fallbackCanonicalPath.startsWith('/') ? '' : '/'}${fallbackCanonicalPath}`;
  } else if (rawCanonical) {
    try {
      const u = new URL(rawCanonical);
      canonical = `${FRONTEND_CANONICAL_DOMAIN}${u.pathname}`;
    } catch {
      canonical = rawCanonical;
    }
  }

  return {
    title,
    description,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    ogSiteName,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLdSchemas,
    rawHead: headHtml,
  };
}

/**
 * Get Rank Math SEO Head and convert to Next.js Metadata object with fallback support.
 */
export async function getRankMathMetadata(options: {
  wpUrl: string;
  fallbackMetadata: Metadata;
  fallbackCanonicalPath?: string;
}): Promise<{ metadata: Metadata; jsonLdSchemas: string[] }> {
  const { wpUrl, fallbackMetadata, fallbackCanonicalPath } = options;

  // 1. In-flight promise deduplication: share ongoing request across generateMetadata and Page
  if (rankMathInFlight.has(wpUrl)) {
    return rankMathInFlight.get(wpUrl)!;
  }

  const promise = (async () => {
    const now = Date.now();
    const cached = rankMathCache.get(wpUrl);
    let headData: RankMathHeadData | null = null;

    if (cached && now - cached.timestamp < RM_CACHE_TTL_MS) {
      headData = cached.data;
    } else {
      const rawHead = await fetchRankMathHead(wpUrl);
      if (rawHead) {
        headData = parseRankMathHead(rawHead, fallbackCanonicalPath);
      }
      rankMathCache.set(wpUrl, { data: headData, timestamp: now });
    }

    if (!headData || !headData.title || headData.title.toLowerCase().includes('page not found')) {
      return {
        metadata: fallbackMetadata,
        jsonLdSchemas: [],
      };
    }

    // Merge Rank Math tags on top of fallback metadata
    const mergedMetadata: Metadata = {
      ...fallbackMetadata,
      title: headData.title || fallbackMetadata.title,
      description: headData.description || fallbackMetadata.description,
      alternates: {
        ...fallbackMetadata.alternates,
        canonical: headData.canonical || fallbackMetadata.alternates?.canonical,
      },
      robots: headData.robots
        ? {
            index: !headData.robots.includes('noindex'),
            follow: !headData.robots.includes('nofollow'),
          }
        : fallbackMetadata.robots,
      openGraph: {
        ...fallbackMetadata.openGraph,
        title: headData.ogTitle || headData.title || (fallbackMetadata.openGraph?.title as string),
        description: headData.ogDescription || headData.description || (fallbackMetadata.openGraph?.description as string),
        url: headData.canonical || (fallbackMetadata.openGraph?.url as string),
        type: (headData.ogType as any) || (fallbackMetadata.openGraph as any)?.type || 'website',
        siteName: headData.ogSiteName || fallbackMetadata.openGraph?.siteName,
        images: headData.ogImage
          ? [{ url: headData.ogImage }]
          : fallbackMetadata.openGraph?.images || [],
      },
      twitter: {
        ...fallbackMetadata.twitter,
        card: (headData.twitterCard as any) || 'summary_large_image',
        title: headData.twitterTitle || headData.title || (fallbackMetadata.twitter?.title as string),
        description: headData.twitterDescription || headData.description || (fallbackMetadata.twitter?.description as string),
        images: headData.twitterImage ? [headData.twitterImage] : fallbackMetadata.twitter?.images,
      },
    };

    return {
      metadata: mergedMetadata,
      jsonLdSchemas: headData.jsonLdSchemas || [],
    };
  })();

  rankMathInFlight.set(wpUrl, promise);
  try {
    return await promise;
  } finally {
    rankMathInFlight.delete(wpUrl);
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

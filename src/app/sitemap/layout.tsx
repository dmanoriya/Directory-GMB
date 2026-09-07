import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'HTML Directory Sitemap | San Diego Business Circle',
    description: 'Browse the complete index of local business categories, cities, neighborhood hubs, and articles on San Diego Business Circle.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/sitemap',
    },
    openGraph: {
      title: 'HTML Directory Sitemap | San Diego Business Circle',
      description: 'Directory overview with all categories, city locations, and business profiles.',
      url: 'https://sandiegobusinesscircle.com/sitemap',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sitemap | San Diego Business Circle',
      description: 'Directory overview with all categories, city locations, and business profiles.',
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/html-sitemap/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/sitemap',
  });

  return rm.metadata;
}

export default function SitemapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

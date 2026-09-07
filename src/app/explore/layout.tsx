import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Explore Verified San Diego Businesses & Services | San Diego Business Circle',
    description: 'Browse top-rated and verified local businesses, medical spas, contractors, plumbers, roofers, and professional services across San Diego County.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/explore',
    },
    openGraph: {
      title: 'Explore Verified San Diego Businesses & Services',
      description: 'Browse top-rated and verified local businesses, medical spas, contractors, plumbers, roofers, and professional services across San Diego County.',
      url: 'https://sandiegobusinesscircle.com/explore',
      type: 'website',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Explore Verified San Diego Businesses & Services',
      description: 'Browse top-rated and verified local businesses and services across San Diego County.',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/explore/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/explore',
  });

  return rm.metadata;
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

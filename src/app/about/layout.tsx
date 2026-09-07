import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'About San Diego Business Circle | Verified Local Marketplace',
    description: 'Learn about San Diego Business Circle, our mission to support verified local businesses, and our strict quality standards for contractors, clinics, and service providers.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/about',
    },
    openGraph: {
      title: 'About San Diego Business Circle',
      description: 'Learn about our mission to support verified local businesses in San Diego County.',
      url: 'https://sandiegobusinesscircle.com/about',
      type: 'website',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About San Diego Business Circle',
      description: 'Learn about our mission to support verified local businesses in San Diego County.',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/about/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/about',
  });

  return rm.metadata;
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

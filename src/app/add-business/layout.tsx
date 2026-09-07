import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Add Your Business | List on San Diego Business Circle',
    description: 'Add and list your local business on San Diego Business Circle. Showcase services, display verified Google reviews, and connect with local customers.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/add-business',
    },
    openGraph: {
      title: 'Add Your Business | San Diego Business Circle',
      description: 'Add your business profile to reach local San Diego customers and build verified local trust.',
      url: 'https://sandiegobusinesscircle.com/add-business',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Add Your Business | San Diego Business Circle',
      description: 'Add your business profile to reach local San Diego customers and build verified local trust.',
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/add-business/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/add-business',
  });

  return rm.metadata;
}

export default function AddBusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Claim Your Business Listing | San Diego Business Circle',
    description: 'Claim ownership of your business listing on San Diego Business Circle to manage contact details, highlight offerings, and respond to local customer leads.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/claim-listing',
    },
    openGraph: {
      title: 'Claim Your Business Listing | San Diego Business Circle',
      description: 'Claim your existing business profile to manage leads and update company information.',
      url: 'https://sandiegobusinesscircle.com/claim-listing',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Claim Your Business Listing | San Diego Business Circle',
      description: 'Claim your existing business profile to manage leads and update company information.',
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/claim-listing/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/claim-listing',
  });

  return rm.metadata;
}

export default function ClaimListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

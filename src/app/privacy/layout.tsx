import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Privacy Policy | San Diego Business Circle',
    description: 'Read our Privacy Policy to understand how San Diego Business Circle collects, protects, and handles consumer and business owner data.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/privacy',
    },
    openGraph: {
      title: 'Privacy Policy | San Diego Business Circle',
      description: 'Privacy Policy outlining data protection, cookies, and user privacy standards.',
      url: 'https://sandiegobusinesscircle.com/privacy',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Privacy Policy | San Diego Business Circle',
      description: 'Privacy Policy outlining data protection, cookies, and user privacy standards.',
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/privacy-policy/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/privacy',
  });

  return rm.metadata;
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

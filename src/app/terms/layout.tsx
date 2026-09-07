import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Terms of Service | San Diego Business Circle',
    description: 'Read the Terms of Service governing directory access, listing submissions, verified reviews, and marketplace usage on San Diego Business Circle.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/terms',
    },
    openGraph: {
      title: 'Terms of Service | San Diego Business Circle',
      description: 'Terms of Service governing usage, directory listings, and guidelines.',
      url: 'https://sandiegobusinesscircle.com/terms',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Terms of Service | San Diego Business Circle',
      description: 'Terms of Service governing usage, directory listings, and guidelines.',
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/terms-of-service/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/terms',
  });

  return rm.metadata;
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

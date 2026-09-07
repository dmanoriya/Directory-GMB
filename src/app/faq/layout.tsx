import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Frequently Asked Questions | San Diego Business Circle',
    description: 'Find answers to common questions about San Diego Business Circle, business verification, Google reviews syncing, claiming listings, and consumer trust.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/faq',
    },
    openGraph: {
      title: 'Frequently Asked Questions | San Diego Business Circle',
      description: 'Frequently asked questions about listing verification, claiming businesses, and local marketplace guidelines.',
      url: 'https://sandiegobusinesscircle.com/faq',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FAQ | San Diego Business Circle',
      description: 'Frequently asked questions about listing verification, claiming businesses, and local marketplace guidelines.',
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/faq/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/faq',
  });

  return rm.metadata;
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

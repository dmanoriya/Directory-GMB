import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'San Diego Business & Local Industry Blog | San Diego Business Circle',
    description: 'Explore the latest San Diego local business guides, home improvement insights, medical spa trends, contractor tips, and local market reports.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/blog',
    },
    openGraph: {
      title: 'San Diego Business & Local Industry Blog',
      description: 'Explore the latest San Diego local business guides, home improvement insights, medical spa trends, contractor tips, and local market reports.',
      url: 'https://sandiegobusinesscircle.com/blog',
      type: 'website',
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&q=80'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'San Diego Business & Local Industry Blog',
      description: 'Explore the latest San Diego local business guides and contractor advice.',
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop&q=80'],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/blog/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/blog',
  });

  return rm.metadata;
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

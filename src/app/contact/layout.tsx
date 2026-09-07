import type { Metadata } from 'next';
import { getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Contact Us | San Diego Business Circle Support & Inquiries',
    description: 'Get in touch with the San Diego Business Circle team for directory support, listing inquiries, advertising partnerships, or verification assistance.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/contact',
    },
    openGraph: {
      title: 'Contact Us | San Diego Business Circle',
      description: 'Get in touch with the San Diego Business Circle team.',
      url: 'https://sandiegobusinesscircle.com/contact',
      type: 'website',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact Us | San Diego Business Circle',
      description: 'Get in touch with the San Diego Business Circle team.',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/contact/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/contact',
  });

  return rm.metadata;
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

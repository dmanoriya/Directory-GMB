import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { getSiteBranding, getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';
import RankMathSchema from '@/components/RankMathSchema';
import './globals.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getSiteBranding();
  const wpApiUrl = getWpApiUrl();

  const title = branding.metaTitle || `${branding.siteName} | Verified Local Business Directory & Marketplace`;
  const description = branding.metaDescription || `${branding.siteName} is the official local marketplace for top-rated medical spas, clinics, plumbers, roofers, HVAC, solar, and local businesses. 100% verified listings with Google Maps ratings.`;
  const faviconUrl = branding.favicon || '/favicon.ico';
  const ogImageUrl = branding.logo || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80';

  const defaultMeta: Metadata = {
    title,
    description,
    keywords: `${branding.siteName}, local business directory, medical spas San Diego, plumbers San Diego, trusted local contractors`,
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com',
    },
    openGraph: {
      title,
      description,
      url: 'https://sandiegobusinesscircle.com',
      siteName: branding.siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          alt: branding.siteName,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/',
  });

  return rm.metadata;
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getSiteBranding();
  const wpApiUrl = getWpApiUrl();

  // Fetch Rank Math Schemas for Homepage
  let homeSchemas: string[] = [];
  try {
    const rm = await getRankMathMetadata({
      wpUrl: `${wpApiUrl}/`,
      fallbackMetadata: {},
      fallbackCanonicalPath: '/',
    });
    homeSchemas = rm.jsonLdSchemas;
  } catch (e) {}

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        {branding.favicon ? (
          <>
            <link rel="icon" href={branding.favicon} />
            <link rel="shortcut icon" href={branding.favicon} />
            <link rel="apple-touch-icon" href={branding.favicon} />
          </>
        ) : (
          <link rel="icon" href="/favicon.ico" />
        )}
        <RankMathSchema schemas={homeSchemas} />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header branding={branding} />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer branding={branding} />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

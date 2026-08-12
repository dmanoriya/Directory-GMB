import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalNest | Verified Local Business Directory & Marketplace',
  description: 'LocalNest is the official local marketplace for top-rated medical spas, clinics, plumbers, roofers, HVAC, solar, and local businesses. 100% verified listings with Google Maps ratings.',
  keywords: 'local business directory, medical spas San Diego, plumbers San Diego, trusted local contractors, LocalNest directory',
  openGraph: {
    title: 'LocalNest | Verified Local Business Marketplace',
    description: 'Find trusted, verified local business professionals.',
    url: 'https://localnest.com',
    siteName: 'LocalNest Marketplace',
    locale: 'en_US',
    type: 'website'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

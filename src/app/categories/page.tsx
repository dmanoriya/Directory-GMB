import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ChevronRight, Grid } from 'lucide-react';
import { getCategories, getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';
import RankMathSchema from '@/components/RankMathSchema';
import CategoriesHub from '@/components/CategoriesHub';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: 'Business Categories & Industry Directory | San Diego Business Circle',
    description: 'Browse all local business categories in San Diego including medical spas, general contractors, plumbers, roofers, dentists, legal services, and home improvement experts.',
    alternates: {
      canonical: 'https://sandiegobusinesscircle.com/categories',
    },
    openGraph: {
      title: 'Business Categories & Industry Directory | San Diego Business Circle',
      description: 'Browse all local business categories in San Diego including medical spas, contractors, plumbers, and home services.',
      url: 'https://sandiegobusinesscircle.com/categories',
      type: 'website',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Business Categories & Industry Directory | San Diego Business Circle',
      description: 'Browse all local business categories in San Diego.',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/categories/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: '/categories',
  });

  return rm.metadata;
}

export default async function AllCategoriesPage() {
  const dynamicCategories = await getCategories();
  const wpApiUrl = getWpApiUrl();

  let rankMathSchemas: string[] = [];
  try {
    const rm = await getRankMathMetadata({
      wpUrl: `${wpApiUrl}/categories/`,
      fallbackMetadata: {},
      fallbackCanonicalPath: '/categories',
    });
    rankMathSchemas = rm.jsonLdSchemas;
  } catch (e) {}

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '5rem' }}>
      <RankMathSchema schemas={rankMathSchemas} />
      
      {/* REDESIGNED ULTRA-MODERN CATEGORIES HERO */}
      <section style={{ 
        background: '#FAF6F0', 
        borderBottom: '1px solid #EBE4D8',
        padding: '3rem 0 2.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Backdrop */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 91, 62, 0.06) 0%, rgba(250, 246, 240, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          
          {/* Top Bar: Breadcrumb + Badge */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666666' }}>
              <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Home size={14} color="#111111" /> Home
              </Link>
              <ChevronRight size={13} color="#999999" />
              <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Service Categories</span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#FFF0ED',
              border: '1px solid #FFD8D0',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.775rem',
              fontWeight: '700',
              color: '#FF5B3E'
            }}>
              <Grid size={14} color="#FF5B3E" />
              <span>{dynamicCategories.length} VERIFIED SERVICE CATEGORIES</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '800', 
            color: '#111111',
            marginBottom: '0.75rem', 
            lineHeight: '1.15',
            letterSpacing: '-0.02em'
          }}>
            Browse Directory <span style={{ color: '#FF5B3E', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400' }}>Service Categories</span>
          </h1>

          <p style={{ color: '#555555', fontSize: '1.05rem', maxWidth: '780px', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Explore authentic local medical spas, skin clinics, plumbers, solar installers, roofers, HVAC contractors, and trade specialists across San Diego County.
          </p>

          {/* Quick Category Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Popular Categories:
            </span>
            {dynamicCategories.slice(0, 6).map((cat) => (
              <Link 
                key={cat.id} 
                href={`/explore?category=${cat.slug}`}
                style={{
                  background: '#ffffff',
                  color: '#111111',
                  border: '1px solid #EBE4D8',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.825rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {cat.name} <span style={{ fontSize: '0.725rem', color: '#FF5B3E', fontWeight: '700' }}>({cat.count})</span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* INTERACTIVE CATEGORIES HUB WITH INSTANT SEARCH & FAST PAGINATION */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <CategoriesHub categories={dynamicCategories} />
      </div>

    </div>
  );
}

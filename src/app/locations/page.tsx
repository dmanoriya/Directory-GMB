import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { getCities } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export default async function AllLocationsPage() {
  const dynamicCities = await getCities();

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* REDESIGNED ULTRA-MODERN LOCATIONS HERO */}
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
              <span style={{ color: '#FF5B3E', fontWeight: '600' }}>City Locations</span>
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
              <MapPin size={14} color="#FF5B3E" />
              <span>{dynamicCities.length} SAN DIEGO COUNTY CITIES</span>
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
            Explore Local Service <span style={{ color: '#FF5B3E', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400' }}>Directories By City</span>
          </h1>

          <p style={{ color: '#555555', fontSize: '1.05rem', maxWidth: '780px', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Explore verified local business providers in San Diego, La Jolla, La Mesa, Chula Vista, Carlsbad, Oceanside, Escondido, and surrounding regional hubs.
          </p>

          {/* Quick City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Popular Hubs:
            </span>
            {dynamicCities.slice(0, 7).map((city) => (
              <Link 
                key={city.id} 
                href={`/explore?location=${city.slug}`}
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
                <MapPin size={12} color="#FF5B3E" />
                {city.name} <span style={{ fontSize: '0.725rem', color: '#666666', fontWeight: '700' }}>({city.count})</span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* LOCATIONS GRID */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.35rem' }}>
          {dynamicCities.map((city) => (
            <Link key={city.id} href={`/explore?location=${city.slug}`} className="card" style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '18px', border: '1px solid #EBE4D8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FFF0ED', border: '1px solid #FFD8D0', color: '#FF5B3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="#FF5B3E" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#111111', margin: 0 }}>{city.name}</h3>
                  <span style={{ fontSize: '0.775rem', color: '#666666', fontWeight: '600' }}>{city.count} Businesses</span>
                </div>
              </div>
              <ArrowRight size={16} color="#FF5B3E" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

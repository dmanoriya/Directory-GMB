'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Award, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
          
          {/* BREADCRUMB */}
          <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>/</span>
            <span style={{ color: '#FF5B3E', fontWeight: '600' }}>About Us</span>
          </div>

          {/* HERO HEADER */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            border: '1px solid #EBE4D8',
            boxShadow: '0 8px 30px rgba(17, 17, 17, 0.04)',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#FF5B3E',
              background: '#FFF0ED',
              border: '1px solid #FFDCD4',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={13} color="#FF5B3E" /> ABOUT LOCALNEST DIRECTORY
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              color: '#111111',
              lineHeight: '1.2',
              marginBottom: '1.25rem',
              maxWidth: '800px',
              margin: '0 auto 1.25rem'
            }}>
              Connecting San Diego Communities with Verified Local Experts
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: '#555555',
              lineHeight: '1.65',
              maxWidth: '720px',
              margin: '0 auto 2rem'
            }}>
              LocalNest is San Diego County’s modern business marketplace built to give homeowners, patients, and residents immediate access to top-rated trade contractors, medical spas, plumbers, and local companies.
            </p>

            {/* QUICK STATS BAR */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1.5rem',
              maxWidth: '700px',
              margin: '0 auto',
              paddingTop: '2rem',
              borderTop: '1px solid #EBE4D8'
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#FF5B3E' }}>450+</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '500' }}>Verified Businesses</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#FF5B3E' }}>34+</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '500' }}>San Diego Cities</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#FF5B3E' }}>98.4%</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '500' }}>Customer Satisfaction</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: '#FF5B3E' }}>$0</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '500' }}>Free for Consumers</div>
              </div>
            </div>

          </div>

          {/* OUR MISSION & VALUES GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            
            {/* VALUE CARD 1 */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2.25rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#FFF0ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={26} color="#FF5B3E" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                Verified Ratings &amp; Data
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555', lineHeight: '1.6' }}>
                We sync directly with official Google Maps Places API and CSLB licensing registries to ensure ratings, operating hours, and customer reviews reflect real experiences.
              </p>
            </div>

            {/* VALUE CARD 2 */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2.25rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#FFF0ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <MapPin size={26} color="#FF5B3E" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                Hyper-Local Focus
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555', lineHeight: '1.6' }}>
                From downtown San Diego to Oceanside, Carlsbad, La Mesa, and Chula Vista, we map hyper-local neighborhood specialists so you find pro services right in your community.
              </p>
            </div>

            {/* VALUE CARD 3 */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2.25rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#FFF0ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Award size={26} color="#FF5B3E" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                Empowering Trade Pros
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555', lineHeight: '1.6' }}>
                We provide small business owners and licensed trade professionals with free profiles to showcase their work, build reputation, and grow their local search visibility.
              </p>
            </div>

          </div>

          {/* BOTTOM CTA CARD */}
          <div style={{
            background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
                Ready to find a verified professional?
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#A1A1AA', margin: 0 }}>
                Browse top plumbing contractors, electrical pros, medical spas, and local companies today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/explore" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem' }}>
                Explore Directory <ArrowRight size={16} />
              </Link>
              <Link href="/add-business" className="btn" style={{ background: '#ffffff', color: '#111111', padding: '0.8rem 1.6rem', fontWeight: '700' }}>
                + Add Business
              </Link>
            </div>
          </div>

        </div>
    </div>
  );
}
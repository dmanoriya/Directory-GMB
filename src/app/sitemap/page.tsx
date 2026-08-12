'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Grid, FileText, Sparkles, Building2 } from 'lucide-react';

export default function SitemapPage() {
  const mainPages = [
    { name: 'Home Page', href: '/' },
    { name: 'Explore Directory', href: '/explore' },
    { name: 'Browse Categories', href: '/categories' },
    { name: 'Browse City Locations', href: '/locations' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Support', href: '/contact' },
    { name: 'Frequently Asked Questions', href: '/faq' },
    { name: 'Add Your Business', href: '/add-business' },
    { name: 'Claim Business Listing', href: '/claim-listing' },
    { name: 'User Account Login', href: '/login' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ];

  const popularCategories = [
    { name: 'Plumbing Services', href: '/explore?category=plumber' },
    { name: 'Electricians & Solar', href: '/explore?category=electrician' },
    { name: 'HVAC & Air Conditioning', href: '/explore?category=hvac' },
    { name: 'Medical Spas & Skin Care', href: '/explore?category=medical-spa' },
    { name: 'Roofing Contractors', href: '/explore?category=roofing' },
    { name: 'Auto Repair Specialists', href: '/explore?category=auto-repair' },
    { name: 'Landscaping & Tree Services', href: '/explore?category=landscaping' },
    { name: 'General Contractors', href: '/explore?category=contractors' }
  ];

  const cityHubs = [
    { name: 'San Diego, CA', href: '/ca/san-diego' },
    { name: 'La Mesa, CA', href: '/ca/la-mesa' },
    { name: 'Chula Vista, CA', href: '/ca/chula-vista' },
    { name: 'Oceanside, CA', href: '/ca/oceanside' },
    { name: 'Carlsbad, CA', href: '/ca/carlsbad' },
    { name: 'Escondido, CA', href: '/ca/escondido' },
    { name: 'Encinitas, CA', href: '/ca/encinitas' },
    { name: 'El Cajon, CA', href: '/ca/el-cajon' },
    { name: 'Vista, CA', href: '/ca/vista' },
    { name: 'San Marcos, CA', href: '/ca/san-marcos' },
    { name: 'Coronado, CA', href: '/ca/coronado' },
    { name: 'Poway, CA', href: '/ca/poway' }
  ];

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
          
          {/* BREADCRUMB */}
          <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>/</span>
            <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Directory Sitemap</span>
          </div>

          {/* PAGE HEADER */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
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
              <Sparkles size={13} color="#FF5B3E" /> COMPLETE SITE INDEX
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#111111',
              marginBottom: '0.75rem'
            }}>
              LocalNest Directory Sitemap
            </h1>

            <p style={{ fontSize: '1rem', color: '#555555', maxWidth: '640px', margin: '0 auto' }}>
              Quickly navigate through our main platform pages, service categories, regional city hubs, and cost guides across San Diego County.
            </p>
          </div>

          {/* SITEMAP SECTIONS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}>
            
            {/* SECTION 1: MAIN PAGES */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2.25rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF0ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Grid size={20} color="#FF5B3E" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                  Main Platform Pages
                </h3>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {mainPages.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="sitemap-nav-link">
                      <ArrowRight size={13} color="#FF5B3E" /> {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 2: TOP SERVICE CATEGORIES */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2.25rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF0ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="#FF5B3E" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                  Popular Categories
                </h3>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {popularCategories.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="sitemap-nav-link">
                      <ArrowRight size={13} color="#FF5B3E" /> {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 3: SAN DIEGO CITY HUBS */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2.25rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF0ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="#FF5B3E" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                  San Diego City Directories
                </h3>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {cityHubs.map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="sitemap-nav-link">
                      <ArrowRight size={13} color="#FF5B3E" /> {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Category, LocationCity } from '@/types/directory';
import { fetchCachedCategories, fetchCachedCities } from '@/lib/clientData';

const SocialIcons = {
  Facebook: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Linkedin: () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  )
};

export default function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);

  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCachedCategories(),
      fetchCachedCities()
    ]).then(([cats, cits]) => {
      if (!active) return;
      if (cats) setCategories(cats);
      if (cits) setCities(cits);
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{ background: '#111111', color: '#A1A1AA', borderTop: '1px solid #222222' }}>
      
      {/* TOP NEWSLETTER BANNER (Warm Contrast Canvas + Deep Charcoal Card) */}
      <div style={{ background: '#FAF6F0', borderBottom: '1px solid #EBE4D8', padding: '3.5rem 0' }}>
        <div className="container">
          <div className="footer-newsletter-card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            background: '#111111',
            borderRadius: '24px',
            border: '1px solid #222222',
            boxShadow: '0 16px 40px rgba(17, 17, 17, 0.12)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '540px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#ffffff',
                background: '#FF5B3E',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                marginBottom: '0.85rem'
              }}>
                <Sparkles size={12} color="#ffffff" /> SAN DIEGO LOCAL DIRECTORY BULLETIN
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.35rem, 2.5vw, 1.9rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.25', marginBottom: '0.5rem' }}>
                Get Weekly Local Deals &amp; Cost Reports.
              </h3>
              <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.925rem', color: '#A1A1AA', margin: 0, lineHeight: '1.55' }}>
                Join 18,000+ San Diego homeowners receiving verified contractor tips, energy rebates, and local spa discounts.
              </p>
            </div>

            <div className="footer-subscribe-wrapper" style={{ width: '100%', maxWidth: '440px', boxSizing: 'border-box' }}>
              {subscribed ? (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#047857',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>You're subscribed! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="footer-subscribe-form">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      padding: '0.65rem 0.85rem',
                      color: '#111111',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#FF5B3E',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 91, 62, 0.35)',
                      whiteSpace: 'nowrap',
                      transition: 'transform 180ms ease, background 180ms ease'
                    }}
                    className="footer-subscribe-btn"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN 5-COLUMN NAVIGATION GRID */}
      <div style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem'
          }}>
            
            {/* BRAND & IDENTITY COLUMN */}
            <div style={{ gridColumn: 'span 2' }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', textDecoration: 'none' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FF5B3E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 6px 18px rgba(255, 91, 62, 0.35)',
                  flexShrink: 0
                }}>
                  <Home size={22} color="#ffffff" />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em' }}>
                  Local<span style={{ color: '#FF5B3E' }}>Nest.</span>
                </span>
              </Link>

              <p style={{ fontSize: '0.9rem', color: '#A1A1AA', lineHeight: '1.65', marginBottom: '1.5rem', maxWidth: '380px' }}>
                The trusted business directory connecting homeowners, patients, and residents with verified contractors, medical spas, plumbers, and local specialists across San Diego.
              </p>

              {/* Trust Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#18181B',
                border: '1px solid #27272A',
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.825rem',
                color: '#34D399',
                fontWeight: '600',
                marginBottom: '1.5rem'
              }}>
                <ShieldCheck size={16} color="#34D399" />
                <span>Verified Google Ratings &amp; CSLB Licensing</span>
              </div>

              {/* Social Media Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-icon" title="Facebook">
                  <SocialIcons.Facebook />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-icon" title="Twitter">
                  <SocialIcons.Twitter />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-icon" title="Instagram">
                  <SocialIcons.Instagram />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-social-icon" title="LinkedIn">
                  <SocialIcons.Linkedin />
                </a>
              </div>
            </div>

            {/* COLUMN 2: POPULAR CATEGORIES */}
            <div>
              <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Top Services
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/explore?category=${cat.slug}`} className="footer-nav-link">
                      {cat.name}
                    </Link>
                  </li>
                ))}
                {categories.length === 0 && (
                  <>
                    <li><Link href="/explore?category=plumber" className="footer-nav-link">Plumbing Services</Link></li>
                    <li><Link href="/explore?category=electrician" className="footer-nav-link">Electrical &amp; Solar</Link></li>
                    <li><Link href="/explore?category=hvac" className="footer-nav-link">HVAC &amp; Air Conditioning</Link></li>
                    <li><Link href="/explore?category=medical-spa" className="footer-nav-link">Medical Spas &amp; Skin Care</Link></li>
                    <li><Link href="/explore?category=roofing" className="footer-nav-link">Roofing Contractors</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* COLUMN 3: POPULAR CITIES */}
            <div>
              <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Popular Cities
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cities.slice(0, 5).map((city) => (
                  <li key={city.id}>
                    <Link href={`/${city.stateSlug || 'ca'}/${city.slug}`} className="footer-nav-link">
                      {city.name}, {city.state}
                    </Link>
                  </li>
                ))}
                {cities.length === 0 && (
                  <>
                    <li><Link href="/ca/san-diego" className="footer-nav-link">San Diego, CA</Link></li>
                    <li><Link href="/ca/la-mesa" className="footer-nav-link">La Mesa, CA</Link></li>
                    <li><Link href="/ca/chula-vista" className="footer-nav-link">Chula Vista, CA</Link></li>
                    <li><Link href="/ca/oceanside" className="footer-nav-link">Oceanside, CA</Link></li>
                  </>
                )}
                <li>
                  <Link href="/locations" style={{ color: '#FF5B3E', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    View All Cities <ArrowRight size={13} color="#FF5B3E" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: DIRECTORY & COMPANY */}
            <div>
              <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Company &amp; Support
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><Link href="/about" className="footer-nav-link">About Us</Link></li>
                <li><Link href="/contact" className="footer-nav-link">Contact Support</Link></li>
                <li><Link href="/faq" className="footer-nav-link">FAQ &amp; Help Center</Link></li>
                <li><Link href="/explore" className="footer-nav-link">Explore Directory</Link></li>
                <li><Link href="/blog" className="footer-nav-link">Cost Guides &amp; Blog</Link></li>
              </ul>
            </div>

          </div>

          {/* BUSINESS OWNER PROMO BANNER BOX */}
          <div style={{
            background: 'linear-gradient(135deg, #18181B 0%, #111111 100%)',
            borderRadius: '20px',
            border: '1px solid #27272A',
            padding: '1.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '3.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 91, 62, 0.15)',
                border: '1px solid rgba(255, 91, 62, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={24} color="#FF5B3E" />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0, marginBottom: '0.2rem' }}>
                  Are you a Licensed Trade Professional or Business Owner?
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#A1A1AA', margin: 0 }}>
                  Claim your profile to display verified reviews, response times, and track your Google Maps local SEO rankings.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href="/add-business"
                style={{
                  background: '#FF5B3E',
                  color: '#ffffff',
                  padding: '0.7rem 1.35rem',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(255, 91, 62, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                Claim Your Listing <ArrowRight size={15} color="#ffffff" />
              </Link>
            </div>
          </div>

          {/* BOTTOM LEGAL & COPYRIGHT BAR */}
          <div style={{
            borderTop: '1px solid #222222',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            fontSize: '0.85rem',
            color: '#71717A'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span>© {new Date().getFullYear()} LocalNest Inc. All rights reserved.</span>
              <span style={{ color: '#27272A' }}>|</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#A1A1AA' }}>
                <MapPin size={14} color="#FF5B3E" /> San Diego County, CA
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/about" style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} className="footer-legal-link">
                About Us
              </Link>
              <Link href="/contact" style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} className="footer-legal-link">
                Contact
              </Link>
              <Link href="/faq" style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} className="footer-legal-link">
                FAQ
              </Link>
              <Link href="/privacy" style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} className="footer-legal-link">
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} className="footer-legal-link">
                Terms of Service
              </Link>
              <Link href="/sitemap" style={{ color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} className="footer-legal-link">
                Sitemap
              </Link>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}

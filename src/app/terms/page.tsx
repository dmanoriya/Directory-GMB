'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
          
          {/* BREADCRUMB */}
          <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>/</span>
            <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Terms of Service</span>
          </div>

          {/* PAGE HEADER */}
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
              color: '#3B82F6',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <FileText size={13} color="#3B82F6" /> USER AGREEMENT &amp; POLICY
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#111111',
              marginBottom: '0.75rem'
            }}>
              Terms of Service
            </h1>

            <p style={{ fontSize: '0.9rem', color: '#777777', margin: 0 }}>
              Last Updated: January 1, 2026 • LocalNest Directory Platform
            </p>
          </div>

          {/* CONTENT CARD CONTAINER */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            border: '1px solid #EBE4D8',
            boxShadow: '0 4px 20px rgba(17, 17, 17, 0.03)',
            maxWidth: '900px',
            margin: '0 auto',
            color: '#333333',
            lineHeight: '1.7'
          }}>
            
            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                1. Acceptance of Terms
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                By accessing or using LocalNest (localnest.com), creating an account, or claiming a business listing, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.
              </p>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                2. Directory Search &amp; Consumer Use
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                LocalNest provides an online business directory for consumers to discover, search, review, and contact local trade contractors, medical spas, plumbers, and companies in San Diego County. Search services are free for individual consumers. Users agree not to scrape, automate, or systematically harvest directory data without explicit written consent.
              </p>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                3. Business Owner Representations &amp; Claims
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                Business owners who add or claim listing profiles warrant that:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.95rem', color: '#555555', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <li>They hold valid legal authorization and California State Licensing (CSLB) for listed trade services.</li>
                <li>All profile information, business phone numbers, addresses, and images uploaded are accurate and non-infringing.</li>
                <li>They will respond to consumer lead inquiries in a professional and lawful manner.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                4. User Reviews &amp; Content Guidelines
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                Reviews published on LocalNest are derived from verified Google Business Ratings or submitted user feedback. Users agree not to post fraudulent, defamatory, or abusive content. LocalNest reserves the right to moderate or remove reviews that violate content guidelines.
              </p>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                5. Disclaimers &amp; Limitation of Liability
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                LocalNest acts as an informational directory connector. We do not directly hire, employ, or guarantee work performed by listed third-party contractors or businesses. Consumers are encouraged to verify licensing and contract terms independently.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                6. Governing Law
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                These Terms are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Legal disputes shall be resolved exclusively in the courts of San Diego County, California.
              </p>
            </section>

          </div>

        </div>
    </div>
  );
}
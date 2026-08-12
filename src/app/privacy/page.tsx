'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
          
          {/* BREADCRUMB */}
          <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>/</span>
            <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Privacy Policy</span>
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
              color: '#059669',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Lock size={13} color="#059669" /> LEGAL &amp; DATA PRIVACY
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#111111',
              marginBottom: '0.75rem'
            }}>
              Privacy Policy
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
                1. Overview &amp; Commitment to Privacy
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                LocalNest Inc. ("LocalNest," "we," "us," or "our") respects your privacy and is committed to protecting the personal data of our consumers, business owners, and website visitors. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you access localnest.com and our mobile services.
              </p>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                2. Information We Collect
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.95rem', color: '#555555', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Information You Provide Voluntarily:</strong> When you submit a lead request, claim a business profile, sign up for an account, or contact support, we collect contact information such as your name, email address, phone number, and message details.</li>
                <li><strong>Publicly Available Business Data:</strong> Business names, Google rating scores, phone numbers, operating hours, and addresses displayed on LocalNest are sourced from public Google Maps Places API feeds, state licensing boards (CSLB), and business owner submissions.</li>
                <li><strong>Automated Device &amp; Usage Data:</strong> Web browser type, IP address, device location, page view metrics, and cookie identifiers collected to optimize site search and performance.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                3. How We Use Your Information
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                We use collected information solely for legitimate business purposes:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.95rem', color: '#555555', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <li>To connect consumers with requested local service providers.</li>
                <li>To verify business owner claims and enforce platform security.</li>
                <li>To send transactional emails, business verification codes, or directory bulletins.</li>
                <li>To analyze directory search trends and improve local search relevance in San Diego County.</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                4. Data Sharing &amp; Third Parties
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                LocalNest <strong>does not sell your personal information</strong> to data brokers. When you explicitly request a quote or phone call from a local business, your contact details are securely transmitted to that specific business. We may also share data with trusted infrastructure providers (e.g. cloud hosting, Google Maps API services) under strict confidentiality agreements.
              </p>
            </section>

            <section style={{ marginBottom: '2.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                5. Data Security &amp; Retention
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                We implement industry-standard SSL/TLS encryption, secure server databases, and strict access controls to safeguard your data. We retain personal data only for as long as necessary to fulfill the services described in this policy or as required by law.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: '#111111', marginBottom: '0.75rem' }}>
                6. Contact Privacy Officer
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#555555' }}>
                If you have any questions, wish to exercise your CCPA rights (California Consumer Privacy Act), or request data deletion, please contact our privacy compliance team at <a href="mailto:privacy@localnest.com" style={{ color: '#FF5B3E', fontWeight: '600' }}>privacy@localnest.com</a>.
              </p>
            </section>

          </div>

        </div>
    </div>
  );
}
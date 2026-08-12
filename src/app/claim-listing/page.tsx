'use client';

import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { submitLeadToWp } from '@/lib/wordpress';

export default function ClaimListingPage() {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLeadToWp({
      type: 'claim_listing',
      businessName,
      contactName: ownerName,
      contactEmail: email,
      contactPhone: phone,
      submittedAt: new Date().toISOString()
    });
    setSubmitted(true);
  };

  return (
    <div style={{ paddingBottom: '6rem' }}>
      <div style={{ background: '#111111', color: '#ffffff', padding: '4rem 0 3rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FFD84D', color: '#111111', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '1rem' }}>
            <ShieldCheck size={16} color="#111111" /> San Diego Business Owner Portal
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Claim Your Business Listing
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#cccccc' }}>
            Take control of your online presence in San Diego County. Respond to customer reviews, upload project photos, and boost your local leads.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '640px', marginTop: '3rem' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Claim Request Submitted!</h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
                We have received your verification request. Our directory team will confirm your business license and email your WP-Admin owner credentials within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pacific Coast Plumbing & Drain"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  Owner / Manager Name *
                </label>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    placeholder="owner@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="(619) 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                Verify & Claim Listing
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

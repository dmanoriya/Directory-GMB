'use client';

import React, { useState } from 'react';
import { X, Search, CheckCircle2, TrendingUp, Globe, Building2 } from 'lucide-react';
import { submitLeadToWp } from '@/lib/wordpress';

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBusinessName?: string;
}

export default function SeoAuditModal({ isOpen, onClose, defaultBusinessName = '' }: SeoAuditModalProps) {
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitLeadToWp({
        type: 'seo_audit',
        businessName,
        contactName,
        contactEmail,
        contactPhone,
        websiteUrl,
        submittedAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#e0f2fe', padding: '0.5rem', borderRadius: '10px', color: '#0284c7' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Free Local SEO & Google Ranking Audit</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>For San Diego Home Service Companies</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}><X size={24} /></button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Audit Request Received!</h4>
            <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Our San Diego digital growth team will analyze your local Google Map Pack rankings, site speed, and review profile. We will email your custom audit report within 24 hours.
            </p>
            <button onClick={onClose} className="btn btn-primary">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                Business Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Pacific Plumbing & Drain"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                  Business Phone *
                </label>
                <input
                  type="tel"
                  placeholder="(619) 555-0199"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                Business Email *
              </label>
              <input
                type="email"
                placeholder="john@yourcompany.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                Website URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://yourcompany.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
              🎯 Audit covers: Google Business Profile optimization, local keyword rankings, review authority, page speed, and schema markup analysis.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Generating Request...' : 'Send Me My Free Audit'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Edit3, CheckCircle2, Phone, Globe, MapPin, Clock, FileText, Send, AlertCircle } from 'lucide-react';
import { BusinessListing } from '@/types/directory';
import { SuggestedEdit } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { formatPhoneNumber } from '@/lib/phoneFormatter';

interface SuggestEditsModalProps {
  business: BusinessListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newEdit?: SuggestedEdit) => void;
}

export default function SuggestEditsModal({ business, isOpen, onClose, onSuccess }: SuggestEditsModalProps) {
  const { user } = useAuth();
  const [phone, setPhone] = useState(business.phone || '');
  const [website, setWebsite] = useState(business.website || '');
  const [address, setAddress] = useState(business.address || '');
  const [description, setDescription] = useState(business.description || '');
  const [services, setServices] = useState(
    Array.isArray(business.serviceOptions) && business.serviceOptions.length > 0
      ? business.serviceOptions.join(', ')
      : ''
  );
  const [hours, setHours] = useState(
    business.workingHours?.days ? business.workingHours.days.map(d => `${d.day}: ${d.time}`).join('\n') : ''
  );
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setError('Please provide your email address so we can notify you upon admin approval.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/edits/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: business.placeId,
          businessTitle: business.title,
          userEmail,
          userName: userName || userEmail.split('@')[0],
          proposedPhone: phone,
          proposedWebsite: website,
          proposedAddress: address,
          proposedServices: services,
          proposedDescription: description,
          proposedHours: hours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitted(true);
        if (onSuccess) {
          onSuccess({
            id: String(data.id || Date.now()),
            placeId: business.placeId,
            businessTitle: business.title,
            userEmail,
            userName: userName || userEmail.split('@')[0],
            proposedPhone: phone,
            proposedWebsite: website,
            proposedAddress: address,
            proposedServices: services,
            proposedDescription: description,
            proposedHours: hours,
            editStatus: 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setError('Failed to submit edit suggestion. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-container" style={{ maxWidth: '560px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FFD84D', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Edit3 size={20} color="#111111" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                Suggest Edits
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Update details for {business.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              Edit Suggestion Received!
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your proposed edits have been submitted for verification. Once approved, the changes will automatically update on the live directory listing.
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#0ea5e9" style={{ flexShrink: 0 }} />
              Changes will be reviewed by our team before publishing live.
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem' }}>
                {error}
              </div>
            )}

            {/* Submitter Info */}
            <div className="modal-grid-2col">
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Proposed Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number (Max 10 digits)
              </label>
              <input
                type="text"
                inputMode="tel"
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                placeholder="(619) 555-0199"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            {/* Proposed Website */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                <Globe size={13} style={{ display: 'inline', marginRight: '4px' }} /> Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            {/* Proposed Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> Address / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, San Diego, CA 92101"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            {/* Proposed Services Offered (Comma Separated) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                Services Offered (Comma Separated)
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="e.g. Drone Photography, Aerial Videography, 4K Footage"
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            {/* Proposed Operating Hours */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> Operating Hours
              </label>
              <textarea
                rows={3}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Monday: 9:00 AM - 5:00 PM..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            {/* Proposed Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                <FileText size={13} style={{ display: 'inline', marginRight: '4px' }} /> Business Description &amp; Services
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide updated business summary or services..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.5rem' }}
            >
              {submitting ? 'Submitting Edits...' : 'Submit Proposed Edits'} <Send size={15} />
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

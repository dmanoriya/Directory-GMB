'use client';

import React, { useState } from 'react';
import { Star, X, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { submitReviewToWp } from '@/lib/wordpress';
import { checkReviewContent } from '@/lib/antiSpam';
import { BusinessReview } from '@/types/directory';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessPlaceId: string;
  businessName: string;
  businessSlug: string;
  onSuccess?: (newReview?: BusinessReview) => void;
}

export default function ReviewModal({ isOpen, onClose, businessPlaceId, businessName, businessSlug, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      return; // Silent bot rejection
    }

    if (!reviewerName || !title || !comment) {
      setStatusMessage({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    // Run Anti-Spam & Profanity Filter Check
    const spamCheck = checkReviewContent(title, comment, reviewerName);
    if (spamCheck.isSpam) {
      setStatusMessage({ type: 'error', text: spamCheck.reason || 'Prohibited content detected. Please remove links or improper text.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessPlaceId,
          businessPlaceId,
          businessSlug,
          reviewerName,
          reviewerEmail,
          rating,
          title,
          comment,
          visitDate,
        })
      });

      const response = await res.json();

      if (response.success) {
        setStatusMessage({
          type: 'success',
          text: 'Thank you! Your customer review has been published!'
        });
        setTimeout(() => {
          if (onSuccess) onSuccess(response.review);
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: response.error || 'Failed to submit review. Please try again.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Write a Verified Customer Review</h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>For {businessName}</p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}><X size={20} /></button>
        </div>

        {statusMessage && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.85rem',
            background: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: statusMessage.type === 'success' ? '#047857' : '#b91c1c',
            border: statusMessage.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {statusMessage.type === 'success' ? <CheckCircle size={18} style={{ flexShrink: 0 }} /> : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Honeypot Bot Trap */}
          <input
            type="text"
            name="website_url_honeypot"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Star Rating Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
              Your Overall Rating *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ transition: 'transform 150ms' }}
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? '#eab308' : '#e2e8f0'}
                    color={(hoverRating || rating) >= star ? '#eab308' : '#cbd5e1'}
                  />
                </button>
              ))}
              <span style={{ marginLeft: '0.6rem', fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                {hoverRating || rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
              Review Headline / Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Excellent service and friendly team!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
              Detailed Experience *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your service experience, staff professionalism, and overall results..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                Your Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
                Email (Kept Private)
              </label>
              <input
                type="email"
                placeholder="sarah@example.com"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem' }}>
              Date of Service (Optional)
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
            <ShieldCheck size={14} color="#059669" /> Reviews are subject to admin moderation to prevent spam or inappropriate content.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}>
              {isSubmitting ? 'Submitting Review...' : 'Submit for Admin Approval'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

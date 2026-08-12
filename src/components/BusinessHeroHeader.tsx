'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Award,
  Edit3
} from 'lucide-react';
import { BusinessListing } from '@/types/directory';
import { formatReviewCount } from '@/lib/wordpress';
import SuggestEditsModal from '@/components/SuggestEditsModal';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import { useAuth } from '@/context/AuthContext';

interface BusinessHeroHeaderProps {
  business: BusinessListing;
}

export default function BusinessHeroHeader({ business }: BusinessHeroHeaderProps) {
  const { user } = useAuth();
  const [liveReviewsCount, setLiveReviewsCount] = useState<number>(business.reviews);
  const [liveRating, setLiveRating] = useState<number>(business.rating);
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    async function fetchLiveGoogleData() {
      if (!business.placeId) return;
      try {
        const res = await fetch(`/api/google-reviews?placeId=${encodeURIComponent(business.placeId)}`);
        const data = await res.json();
        if (data.user_ratings_total && typeof data.user_ratings_total === 'number') {
          setLiveReviewsCount(data.user_ratings_total);
        }
        if (data.rating && typeof data.rating === 'number') {
          setLiveRating(data.rating);
        }
      } catch (err) {
        // Fallback to initial props
      }
    }

    fetchLiveGoogleData();
  }, [business.placeId]);

  return (
    <>
      <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div className="card hero-header-card">
          
          {/* Top Badges Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {business.verified && (
              <span className="badge badge-verified" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                <ShieldCheck size={13} /> Verified Business
              </span>
            )}
            {Boolean(business.googleMapsRank) && business.googleMapsRank > 0 && (
              <span style={{ background: '#FFD84D', color: '#111111', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #e5be32' }}>
                <Award size={12} color="#111111" /> #{business.googleMapsRank} Ranked on Google Maps
              </span>
            )}
            <span className="badge badge-category" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', background: '#FF5B3E', color: '#ffffff', border: 'none' }}>{business.type}</span>
          </div>

          {/* Full Width Business Title */}
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', fontWeight: '700', color: '#111111', marginBottom: '0.5rem', lineHeight: '1.25', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {business.title}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#555555', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            <MapPin size={16} color="#FF5B3E" style={{ flexShrink: 0 }} /> <span>{business.address}</span>
          </p>

          {/* Dynamic Rating & Real Google Review Count Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#555555', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', color: '#f59e0b', gap: '0.2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(liveRating) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: '800', color: '#111111', marginLeft: '0.25rem' }}>{liveRating}</span>
              <a href="#reviews-hub" style={{ color: '#FF5B3E', textDecoration: 'underline', marginLeft: '0.25rem', fontWeight: '700' }}>
                ({formatReviewCount(liveReviewsCount)} Google Reviews)
              </a>
            </div>

            <div className="hero-status-group">
              <span className="hero-status-dot">•</span>
              <span style={{ fontWeight: '700', color: '#111111', background: '#FFD84D', padding: '0.15rem 0.6rem', borderRadius: '6px', fontSize: '0.825rem' }}>
                {business.openState}
              </span>
            </div>
          </div>

          {/* Full Width Action Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #DEDEDE', paddingTop: '1.25rem' }}>
            {business.phone && (
              <a href={`tel:${business.phone}`} className="btn btn-primary" style={{ padding: '0.65rem 1.2rem', fontSize: '0.875rem' }}>
                <Phone size={16} /> Call {business.phone}
              </a>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.65rem 1.2rem', fontSize: '0.875rem' }}>
                <Globe size={16} /> Visit Website <ExternalLink size={13} />
              </a>
            )}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.65rem 1.2rem', fontSize: '0.875rem' }}>
              <MapPin size={16} color="#FF5B3E" /> Directions
            </a>
            <button
              onClick={() => {
                if (!user) {
                  setAuthModalOpen(true);
                } else {
                  setModalOpen(true);
                }
              }}
              className="btn btn-outline"
              style={{ padding: '0.65rem 1.1rem', fontSize: '0.875rem', background: '#f8f8f8', marginLeft: 'auto', gap: '0.35rem', fontWeight: '700', color: '#111111', borderColor: '#DEDEDE' }}
            >
              <Edit3 size={15} color="#111111" /> Suggest Edits
            </button>
          </div>

        </div>
      </div>

      <SuggestEditsModal
        business={business}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In Required to Suggest Edits"
        message={`Please sign in to your account or create a free account to propose updates for ${business.title}.`}
      />
    </>
  );
}

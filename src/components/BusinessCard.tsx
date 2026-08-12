import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, MapPin, Phone, Award, Check } from 'lucide-react';
import { BusinessListing } from '@/types/directory';
import SafeImage from '@/components/SafeImage';
import { parseServiceOptions, formatReviewCount } from '@/lib/wordpress';

interface BusinessCardProps {
  business: BusinessListing;
}

function cleanCategoryName(typeStr: string): string {
  if (!typeStr) return 'Business';
  const parts = typeStr.split('/').map(s => s.trim()).filter(Boolean);
  if (parts.length > 0) {
    return parts[0];
  }
  return typeStr;
}

function formatServiceBadgeLabel(str: string): string {
  if (!str) return 'Verified Service';
  const s = str.trim().toLowerCase();
  
  if (s.includes('women-owned') || s.includes('women owned')) return 'Women-Owned';
  if (s.includes('veteran-owned') || s.includes('veteran owned')) return 'Veteran-Owned';
  if (s.includes('lgbtq')) return 'LGBTQ+ Friendly';
  if (s.includes('wheelchair') && s.includes('entrance')) return 'Accessible Entrance';
  if (s.includes('wheelchair') && s.includes('parking')) return 'Accessible Parking';
  if (s.includes('wheelchair') && s.includes('restroom')) return 'Accessible Restroom';
  if (s.includes('wheelchair') && s.includes('seating')) return 'Accessible Seating';
  if (s.includes('wheelchair')) return 'Wheelchair Accessible';
  if (s.includes('onsite')) return 'Onsite Services';
  if (s.includes('online appointment') || s.includes('online booking')) return 'Online Booking';
  if (s.includes('free estimate') || s.includes('free quote')) return 'Free Estimates';
  if (s.includes('emergency')) return 'Emergency Service';

  const words = str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const joined = words.join(' ');
  return joined.length > 26 ? joined.slice(0, 24) + '...' : joined;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const parsedServices = parseServiceOptions(business.serviceOptions || (business as any).services);
  const parsedOthers = parseServiceOptions(business.otherTypes);
  
  const rawList = parsedServices.length > 0 ? parsedServices : parsedOthers;
  const initialServices = rawList.length > 0 ? rawList : ['Verified Service Provider', 'Onsite Services'];

  const categoryTitle = cleanCategoryName(business.type);

  // Filter out redundant category names from service checkmark badges
  const cleanServicesList = initialServices
    .map(cleanCategoryName)
    .filter((srv, idx, arr) => {
      if (!srv) return false;
      const lower = srv.toLowerCase();
      const catLower = categoryTitle.toLowerCase();
      // Exclude exact match to category title
      if (lower === catLower) return false;
      return arr.indexOf(srv) === idx;
    });

  const displayServices = cleanServicesList.length > 0 ? cleanServicesList : ['Verified Service Provider', 'Onsite Services'];

  return (
    <div
      className="business-card-container"
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #EBE4D8',
        boxShadow: '0 8px 24px rgba(17, 17, 17, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      {/* Clickable Cover Thumbnail */}
      <Link href={`/listing/${business.slug}`} style={{ position: 'relative', height: '190px', width: '100%', display: 'block', background: '#0f172a', overflow: 'hidden' }}>
        <SafeImage
          src={business.thumbnail}
          alt={business.title}
          category={business.type}
          variant="grid"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover', transition: 'transform 300ms ease' }}
          className="business-card-img"
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.7) 100%)'
        }} />

        {/* Top Badges Bar */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {business.verified && (
              <span style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(6px)',
                color: '#047857',
                fontWeight: '700',
                fontSize: '0.725rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
                border: '1px solid #a7f3d0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <ShieldCheck size={13} color="#059669" /> Verified Pro
              </span>
            )}
            {Boolean(business.googleMapsRank && business.googleMapsRank > 0 && business.googleMapsRank <= 20) && (
              <span style={{
                background: '#111111',
                color: '#ffffff',
                fontSize: '0.725rem',
                fontWeight: '800',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                border: '1px solid #333333'
              }}>
                <Award size={12} color="#FFD84D" /> #{business.googleMapsRank} Ranked
              </span>
            )}
          </div>

          <span style={{
            background: '#FF5B3E',
            color: '#ffffff',
            fontSize: '0.725rem',
            fontWeight: '800',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(255, 91, 62, 0.3)',
            whiteSpace: 'nowrap',
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {categoryTitle}
          </span>
        </div>
      </Link>

      {/* Body Content */}
      <div style={{ padding: '1.35rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Rating Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={15} fill={i < Math.floor(business.rating) ? '#f59e0b' : 'none'} color="#f59e0b" />
            ))}
          </div>
          <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#111111' }}>{business.rating}</span>
          <span style={{ fontSize: '0.775rem', color: '#666666' }}>({formatReviewCount(business.reviews)} reviews)</span>
        </div>

        {/* Business Title */}
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem', lineHeight: '1.3' }}>
          <Link href={`/listing/${business.slug}`} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 150ms' }} className="business-title-link">
            {business.title}
          </Link>
        </h3>
        
        {/* Description Block */}
        {business.description && business.description.trim() !== business.address?.trim() && (
          <p style={{
            fontSize: '0.825rem',
            color: '#666666',
            marginBottom: '0.85rem',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {business.description}
          </p>
        )}

        {/* Location & Open Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem',
          color: '#555555',
          marginBottom: '0.85rem',
          borderTop: '1px solid #EBE4D8',
          paddingTop: '0.75rem',
          marginTop: business.description ? '0' : 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={15} color="#FF5B3E" style={{ flexShrink: 0 }} /> {business.city}{business.state ? `, ${business.state}` : ''}
          </div>
          <span style={{
            fontSize: '0.725rem',
            fontWeight: '700',
            color: business.openState?.toLowerCase().includes('open') ? '#047857' : '#64748b',
            background: business.openState?.toLowerCase().includes('open') ? '#ECFDF5' : '#f1f5f9',
            border: business.openState?.toLowerCase().includes('open') ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            whiteSpace: 'nowrap'
          }}>
            {business.openState || 'Open Now'}
          </span>
        </div>

        {/* Service Options Pills */}
        {displayServices.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.1rem' }}>
            {displayServices.slice(0, 2).map((opt, idx) => (
              <span key={idx} style={{
                fontSize: '0.725rem',
                color: '#047857',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap'
              }}>
                <Check size={12} color="#059669" style={{ flexShrink: 0 }} />
                <span>{formatServiceBadgeLabel(opt)}</span>
              </span>
            ))}
            {displayServices.length > 2 && (
              <span style={{
                fontSize: '0.725rem',
                color: '#64748b',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '0.25rem 0.55rem',
                borderRadius: '8px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                +{displayServices.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          {business.phone ? (
            <a
              href={`tel:${business.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.65rem 0.5rem',
                fontSize: '0.825rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                color: '#111111',
                background: '#ffffff',
                border: '1px solid #EBE4D8',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 180ms ease'
              }}
              className="card-call-btn"
            >
              <Phone size={14} color="#111111" /> Call Now
            </a>
          ) : (
            <Link
              href={`/listing/${business.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.65rem 0.5rem',
                fontSize: '0.825rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                color: '#111111',
                background: '#ffffff',
                border: '1px solid #EBE4D8',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 180ms ease'
              }}
              className="card-call-btn"
            >
              Details
            </Link>
          )}

          <Link
            href={`/listing/${business.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.65rem 0.5rem',
              fontSize: '0.825rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              color: '#ffffff',
              background: '#111111',
              border: 'none',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 180ms ease',
              boxShadow: '0 4px 12px rgba(17, 17, 17, 0.12)'
            }}
            className="card-view-btn"
          >
            View Profile
          </Link>
        </div>

      </div>

    </div>
  );
}

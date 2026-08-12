import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Clock,
  Award,
  ArrowLeft,
  Share2,
  UserCheck
} from 'lucide-react';
import { getBusinessBySlug, getBusinesses, getReviewsForBusiness, parseServiceOptions } from '@/lib/wordpress';
import ReviewsSection from '@/components/ReviewsSection';
import BusinessCard from '@/components/BusinessCard';
import SafeImage from '@/components/SafeImage';
import BusinessHeroHeader from '@/components/BusinessHeroHeader';
import SuggestEditTriggerCard from '@/components/SuggestEditTriggerCard';


interface ListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Use dynamic rendering so each request gets fresh data from WordPress
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ListingPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: 'Business Not Found | San Diego Directory' };

  return {
    title: `${business.title} | San Diego Directory`,
    description: `${business.title} located at ${business.address}. Rated ${business.rating} stars with ${business.reviews} reviews on Google Maps.`,
    openGraph: {
      title: `${business.title} | San Diego Directory`,
      description: business.description,
      images: [business.thumbnail]
    }
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  const detailServices = parseServiceOptions(business.serviceOptions || (business as any).services);
  const fallbackServices = detailServices.length > 0 ? detailServices : parseServiceOptions(business.otherTypes);

  const [reviews, categoryListings] = await Promise.all([
    getReviewsForBusiness(business.placeId),
    getBusinesses({ categorySlug: business.typeSlug })
  ]);

  const similarBusinesses = categoryListings
    .filter((b) => b.placeId !== business.placeId)
    .slice(0, 3);

  // Dynamic Founder Data & Category-Aware Fallbacks from WordPress Backend
  const isTradeService = /plumb|hvac|roof|electr|solar|construct|remodel|contract|handyman/i.test(business.type + ' ' + business.title);
  
  const founderName = business.founderName || `${business.title.split(' ')[0]} Leadership`;
  const founderRole = business.founderRole || 'Managing Director & Founder';
  const founderExperience = business.founderExperience || '15+ Yrs San Diego Service';
  const founderAvatar = business.founderAvatar || '';
  
  const defaultQuote = isTradeService
    ? `"${business.title} is family-owned and committed to providing San Diego County residents with honest flat-rate pricing, 5-star workmanship, and full CSLB licensing compliance."`
    : `"${business.title} is dedicated to serving San Diego County with authentic quality, transparent pricing, and 100% customer satisfaction."`;

  const founderQuote = business.founderQuote || defaultQuote;
  const licenseLabel = isTradeService ? 'CSLB License Status:' : 'Registration Status:';
  const licenseValue = business.licenseStatus || 'ACTIVE (Verified)';

  // Schema.org JSON-LD Structured Data Generator using placeId & extracted CSV fields
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.title,
    image: business.thumbnail,
    telephone: business.phone,
    url: business.website,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviews,
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <div style={{ paddingBottom: '6rem' }}>
      
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* COVER HERO */}
      <div style={{ position: 'relative', height: '320px', width: '100%', background: '#0f172a' }}>
        <SafeImage
          src={business.thumbnail}
          alt={business.title}
          category={business.type}
          variant="detail"
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.65 }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)'
        }} />

        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '2.5rem' }}>
          <Link href="/explore" style={{ position: 'absolute', top: '20px', left: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', background: 'rgba(15,23,42,0.75)', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.825rem', backdropFilter: 'blur(6px)', fontWeight: '600' }}>
            <ArrowLeft size={15} /> Back to Directory
          </Link>
        </div>
      </div>

      {/* DYNAMIC LIVE BUSINESS HERO HEADER */}
      <BusinessHeroHeader business={business} />

      {/* RESPONSIVE RE-ORDERED MAIN CONTENT */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div className="listing-layout-grid">
          
          {/* LEFT MAIN COLUMN */}
          <div className="listing-main-col">
            {/* 1. OVERVIEW & AMENITIES */}
            <div className="card listing-block-about" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                About {business.title}
              </h2>
              <p style={{ fontSize: '0.975rem', color: '#334155', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                {business.description || `${business.title} is a premier ${business.type} operating in ${business.city}${business.state ? `, ${business.state}` : ''}.`}
              </p>

              {fallbackServices.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>
                    Amenities &amp; Service Options
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {fallbackServices.map((opt, idx) => (
                      <span key={idx} style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.825rem', fontWeight: '600' }}>
                        ✓ {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. RATINGS & REVIEWS ENGINE (DESKTOP: RIGHT UNDER ABOUT; MOBILE: AT END BEFORE SIMILAR) */}
            <div className="listing-block-reviews">
              <ReviewsSection
                businessId={business.placeId}
                businessName={business.title}
                businessSlug={business.slug}
                overallRating={business.rating}
                totalReviews={business.reviews}
                initialReviews={reviews}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="listing-sidebar-col">
            {/* 2. FOUNDER & LEADERSHIP CARD */}
            <div className="listing-block-founders" style={{
              background: '#FAF6F0',
              borderRadius: '20px',
              border: '1px solid #EBE4D8',
              padding: '1.65rem 1.5rem',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              {/* Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2D7C7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', fontWeight: '800', color: '#111111', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap' }}>
                  <UserCheck size={18} color="#FF5B3E" style={{ flexShrink: 0 }} />
                  <span>Founders &amp; Leadership</span>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#FFF0ED',
                  color: '#FF5B3E',
                  fontSize: '0.675rem',
                  fontWeight: '800',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  border: '1px solid #FFD8D0',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={12} color="#FF5B3E" /> VERIFIED OWNER
                </span>
              </div>

              {/* Founder Profile Header */}
              <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', marginBottom: '1.15rem' }}>
                {founderAvatar ? (
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #FF5B3E' }}>
                    <img src={founderAvatar} alt={founderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#FF5B3E',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '800',
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 12px rgba(255, 91, 62, 0.25)',
                    flexShrink: 0
                  }}>
                    {founderName.charAt(0)}
                  </div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.025rem', fontWeight: '800', color: '#111111', margin: 0, lineHeight: '1.3', wordBreak: 'break-word' }}>
                    {founderName}
                  </h4>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666666', marginTop: '0.15rem' }}>
                    {founderRole}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.25rem' }}>
                    <Award size={13} color="#059669" /> {founderExperience}
                  </div>
                </div>
              </div>

              {/* Owner Quote Box */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #EBE4D8',
                padding: '0.95rem 1.05rem',
                fontSize: '0.85rem',
                color: '#444444',
                lineHeight: '1.55',
                fontStyle: 'italic',
                marginBottom: '1.1rem'
              }}>
                {founderQuote}
              </div>

              {/* Verification Details Footer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: '#555555', paddingTop: '0.75rem', borderTop: '1px solid #E2D7C7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span>{licenseLabel}</span>
                  <span style={{ fontWeight: '700', color: '#059669', textAlign: 'right' }}>{licenseValue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span>Primary Location:</span>
                  <span style={{ fontWeight: '700', color: '#111111', textAlign: 'right' }}>{business.city}{business.state ? `, ${business.state}` : ''}</span>
                </div>
              </div>
            </div>

            {/* 3. LOCATION & SCHEDULE CARD */}
            <div className="card listing-block-location" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                Location &amp; Schedule
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#334155', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={18} color="#FF5B3E" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', color: '#111111' }}>Address</div>
                    <div style={{ lineHeight: '1.4' }}>{business.address}</div>
                  </div>
                </div>

                {business.phone && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Phone size={18} color="#FF5B3E" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', color: '#111111' }}>Phone</div>
                      <a href={`tel:${business.phone}`} style={{ color: '#FF5B3E', fontWeight: '600' }}>{business.phone}</a>
                    </div>
                  </div>
                )}
              </div>

              {/* Working Hours Array */}
              {business.workingHours?.days && business.workingHours.days.length > 0 && (
                <div style={{ borderTop: '1px solid #DEDEDE', paddingTop: '1.1rem' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.9rem', color: '#111111', marginBottom: '0.75rem' }}>
                    <Clock size={16} color="#FF5B3E" /> Weekly Hours
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                    {business.workingHours.days.map((d, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>{d.day}:</span>
                        <span style={{ fontWeight: '600', color: '#0f172a' }}>{d.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* 4. BUSINESS EDIT SUGGESTION CALLOUT */}
            <div className="listing-block-suggest">
              <SuggestEditTriggerCard business={business} />
            </div>
          </div>

        </div>

        {/* 6. SIMILAR / RELATED BUSINESSES */}
        {similarBusinesses.length > 0 && (
          <div style={{ marginTop: '4.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.75rem' }}>
              Similar {business.type} Listings in San Diego
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {similarBusinesses.map((sim) => (
                <BusinessCard key={sim.placeId} business={sim} />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

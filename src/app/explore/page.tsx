'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Grid, Map as MapIcon, ArrowLeft, MapPin, Loader2, Filter, X, RotateCcw, SlidersHorizontal, Sparkles, ShieldCheck, Home, ChevronRight } from 'lucide-react';
import { MOCK_BUSINESSES } from '@/data/mockData';
import { FilterState, BusinessListing, Category, LocationCity } from '@/types/directory';
import BusinessCard from '@/components/BusinessCard';
import FilterSidebar from '@/components/FilterSidebar';
import GoogleMapView from '@/components/GoogleMapView';
import Pagination from '@/components/Pagination';
import { SkeletonGrid } from '@/components/SkeletonLoader';
import { fetchCachedBusinesses } from '@/lib/clientData';

function ExploreContent() {
  const searchParams = useSearchParams();

  const [allBusinesses, setAllBusinesses] = useState<BusinessListing[]>(MOCK_BUSINESSES);
  const [loading, setLoading] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    subcategory: '',
    location: searchParams.get('location') || '',
    state: searchParams.get('state') || '',
    minRating: 0,
    openNow: false,
    verifiedOnly: false,
    emergencyOnly: false,
    freeEstimatesOnly: false,
    sortBy: 'newest'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Count active filters for mobile filter button badge
  const activeFilterCount = [
    Boolean(filters.searchQuery),
    Boolean(filters.category),
    Boolean(filters.location),
    Boolean(filters.minRating > 0),
    Boolean(filters.openNow),
    Boolean(filters.verifiedOnly)
  ].filter(Boolean).length;

  // Fetch live businesses from WordPress via API route in background
  useEffect(() => {
    let active = true;
    fetchCachedBusinesses()
      .then((data: BusinessListing[]) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setAllBusinesses(data);
        }
      })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    const loc = searchParams.get('location') || '';
    const st = searchParams.get('state') || '';

    setFilters((prev) => ({
      ...prev,
      searchQuery: q,
      category: cat,
      location: loc,
      state: st
    }));
  }, [searchParams]);

  // Filtering Logic — uses live WP data
  const filteredBusinesses = allBusinesses.filter((b) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesTitle = b.title.toLowerCase().includes(q);
      const matchesType = b.type.toLowerCase().includes(q);
      const matchesAddress = b.address.toLowerCase().includes(q);
      const matchesCity = b.city.toLowerCase().includes(q);
      if (!matchesTitle && !matchesType && !matchesAddress && !matchesCity) return false;
    }

    if (filters.category && b.typeSlug.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }

    if (filters.location && b.citySlug.toLowerCase() !== filters.location.toLowerCase()) {
      return false;
    }

    if (filters.minRating && b.rating < filters.minRating) {
      return false;
    }

    if (filters.openNow && !b.openState.toLowerCase().includes('open')) {
      return false;
    }

    if (filters.verifiedOnly && !b.verified) {
      return false;
    }

    return true;
  });

  // Sorting — Newest listing first by default!
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    if (filters.sortBy === 'older') {
      const idA = parseInt(a.id || '0', 10) || 0;
      const idB = parseInt(b.id || '0', 10) || 0;
      return idA - idB;
    }
    if (filters.sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    if (filters.sortBy === 'name-desc') {
      return b.title.localeCompare(a.title);
    }
    if (filters.sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (filters.sortBy === 'reviews') {
      return b.reviews - a.reviews;
    }
    // Default: 'newest' -> Newest listing first (highest numeric WP Post ID first)
    const idA = parseInt(a.id || '0', 10) || 0;
    const idB = parseInt(b.id || '0', 10) || 0;
    return idB - idA;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(sortedBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = sortedBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetAllFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      subcategory: '',
      location: '',
      state: '',
      minRating: 0,
      openNow: false,
      verifiedOnly: false,
      emergencyOnly: false,
      freeEstimatesOnly: false,
      sortBy: 'newest'
    });
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* REDESIGNED ULTRA-MODERN HERO SECTION */}
      <section style={{ 
        background: '#FAF6F0', 
        borderBottom: '1px solid #EBE4D8',
        padding: '3rem 0 2.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative Backdrop Elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 91, 62, 0.06) 0%, rgba(250, 246, 240, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          
          {/* Top Bar: Breadcrumb + Verified Badge */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666666' }}>
              <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Home size={14} color="#111111" /> Home
              </Link>
              <ChevronRight size={13} color="#999999" />
              <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Explore Directory</span>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#FFF0ED',
              border: '1px solid #FFD8D0',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.775rem',
              fontWeight: '700',
              color: '#FF5B3E'
            }}>
              <ShieldCheck size={14} color="#FF5B3E" />
              <span>6,390+ VERIFIED SAN DIEGO PROFILES</span>
            </div>
          </div>
          
          {/* Main Hero Headline */}
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '800', 
            color: '#111111',
            marginBottom: '0.75rem', 
            lineHeight: '1.15',
            letterSpacing: '-0.02em'
          }}>
            Explore Verified Local <span style={{ color: '#FF5B3E', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400' }}>Businesses &amp; Services</span>
          </h1>

          <p style={{ color: '#555555', fontSize: '1.05rem', maxWidth: '780px', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Browse top-rated medical spas, plumbers, electricians, roofers, HVAC, and local service providers across San Diego County with 100% verified Google ratings.
          </p>

          {/* Integrated Interactive Hero Search Input Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '0.6rem 0.75rem',
            border: '1px solid #EBE4D8',
            boxShadow: '0 8px 24px -6px rgba(17, 17, 17, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: '820px',
            marginBottom: '1.5rem'
          }}>
            {/* Keyword Search Input */}
            <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0.5rem' }}>
              <Search size={18} color="#FF5B3E" />
              <input
                type="text"
                placeholder="Search by business name or category (e.g. Plumber)..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.925rem',
                  fontWeight: '500',
                  color: '#111111',
                  background: 'transparent'
                }}
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* City Divider & Selector */}
            <div style={{ width: '1px', height: '28px', background: '#EBE4D8', display: 'none' }} className="hero-divider" />

            <div style={{ flex: '0 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAF6F0', padding: '0.4rem 0.75rem', borderRadius: '10px' }}>
              <MapPin size={15} color="#666666" />
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#111111',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <option value="">All San Diego Cities</option>
                <option value="san-diego">San Diego, CA</option>
                <option value="la-mesa">La Mesa, CA</option>
                <option value="chula-vista">Chula Vista, CA</option>
                <option value="oceanside">Oceanside, CA</option>
                <option value="carlsbad">Carlsbad, CA</option>
                <option value="escondido">Escondido, CA</option>
                <option value="encinitas">Encinitas, CA</option>
              </select>
            </div>
          </div>

          {/* Quick San Diego City Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Popular Hubs:
            </span>

            {[
              { name: 'San Diego', slug: 'san-diego' },
              { name: 'La Mesa', slug: 'la-mesa' },
              { name: 'Chula Vista', slug: 'chula-vista' },
              { name: 'Oceanside', slug: 'oceanside' },
              { name: 'Carlsbad', slug: 'carlsbad' },
              { name: 'Escondido', slug: 'escondido' },
              { name: 'Encinitas', slug: 'encinitas' }
            ].map((city) => {
              const isActive = filters.location === city.slug;
              return (
                <button
                  key={city.slug}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, location: isActive ? '' : city.slug }))}
                  style={{
                    background: isActive ? '#111111' : '#ffffff',
                    color: isActive ? '#ffffff' : '#111111',
                    border: isActive ? '1px solid #111111' : '1px solid #EBE4D8',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: isActive ? '0 4px 12px rgba(17, 17, 17, 0.12)' : 'none'
                  }}
                >
                  <MapPin size={13} color={isActive ? '#FF5B3E' : '#666666'} />
                  {city.name}
                </button>
              );
            })}

            {(filters.location || filters.searchQuery || filters.category) && (
              <button
                type="button"
                onClick={resetAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF5B3E',
                  fontSize: '0.825rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginLeft: '0.25rem'
                }}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            )}
          </div>

        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }} className="explore-layout-grid">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="desktop-filter-sidebar">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetAllFilters}
              totalResults={sortedBusinesses.length}
            />
          </aside>

          {/* LISTINGS DISPLAY & TOGGLE */}
          <main>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {loading ? 'Loading Verified Businesses...' : `Showing ${sortedBusinesses.length} Verified Businesses`}
                </h2>
              </div>

              {/* View Switcher Controls, Mobile Filter Button & Sort Dropdown */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
                
                {/* MOBILE E-COMMERCE FILTER TRIGGER BUTTON */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  style={{
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: activeFilterCount > 0 ? '1.5px solid #FF5B3E' : '1px solid #111111',
                    background: activeFilterCount > 0 ? '#FAF6F0' : '#111111',
                    color: activeFilterCount > 0 ? '#FF5B3E' : '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(17, 17, 17, 0.08)'
                  }}
                  className="mobile-filter-trigger-btn"
                >
                  <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#FF5B3E' : '#ffffff'} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span style={{
                      background: '#FF5B3E',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                      marginLeft: '0.2rem'
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View Mode Toggle Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      border: viewMode === 'grid' ? '1px solid #0ea5e9' : '1px solid #cbd5e1',
                      background: viewMode === 'grid' ? '#0ea5e9' : '#ffffff',
                      color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <Grid size={16} /> Grid View
                  </button>
                  
                  <button
                    onClick={() => setViewMode('map')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      border: viewMode === 'map' ? '1px solid #0ea5e9' : '1px solid #cbd5e1',
                      background: viewMode === 'map' ? '#0ea5e9' : '#ffffff',
                      color: viewMode === 'map' ? '#ffffff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <MapIcon size={16} /> Interactive Map
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <select
                    aria-label="Sort listings"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="older">Older First</option>
                    <option value="name">Alphabetical (A to Z)</option>
                    <option value="name-desc">Alphabetical (Z to A)</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviewed</option>
                  </select>
                </div>

              </div>
            </div>

            {/* LISTING CONTENT GRID OR MAP */}
            {loading ? (
              <SkeletonGrid count={6} type="business" />
            ) : sortedBusinesses.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Search size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                  No Businesses Match Your Search
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Try resetting filters or searching for another category.
                </p>
                <button
                  onClick={() => setFilters({
                    searchQuery: '',
                    category: '',
                    subcategory: '',
                    location: '',
                    minRating: 0,
                    openNow: false,
                    verifiedOnly: false,
                    emergencyOnly: false,
                    freeEstimatesOnly: false,
                    sortBy: 'recommended'
                  })}
                  className="btn btn-primary"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
                  {paginatedBusinesses.map((b) => (
                    <BusinessCard key={b.placeId} business={b} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedBusinesses.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                />
              </>
            ) : (
              <>
                <div className="card" style={{ padding: '0.5rem', height: '650px', borderRadius: '16px', overflow: 'hidden' }}>
                  <GoogleMapView businesses={paginatedBusinesses} />
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedBusinesses.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </main>

        </div>
      </div>

      {/* MOBILE E-COMMERCE SLIDE-IN FILTER DRAWER (Mounted via React Portal) */}
      {mounted && filterDrawerOpen && createPortal(
        <>
          <div
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999990,
              background: 'rgba(17, 17, 17, 0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '88vw',
              maxWidth: '360px',
              height: '100dvh',
              maxHeight: '100%',
              zIndex: 999999,
              background: '#ffffff',
              boxShadow: '-8px 0 36px rgba(0, 0, 0, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #EBE4D8',
              background: '#ffffff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '700', fontSize: '1.05rem', color: '#111111' }}>
                <SlidersHorizontal size={18} color="#FF5B3E" /> Filter Directory
                {activeFilterCount > 0 && (
                  <span style={{ background: '#FF5B3E', color: '#ffffff', fontSize: '0.725rem', padding: '0.15rem 0.55rem', borderRadius: '999px', fontWeight: '800' }}>
                    {activeFilterCount} Active
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    style={{ fontSize: '0.8rem', fontWeight: '600', color: '#FF5B3E', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Reset All
                  </button>
                )}
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #DEDEDE', background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  aria-label="Close filters"
                >
                  <X size={18} color="#111111" />
                </button>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div style={{ padding: '1.15rem', flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetAllFilters}
                totalResults={sortedBusinesses.length}
              />
            </div>

            {/* Drawer Bottom Sticky Footer CTA */}
            <div style={{
              padding: '0.85rem 1.15rem 1.15rem',
              borderTop: '1px solid #EBE4D8',
              background: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)'
            }}>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{
                  width: '100%',
                  background: '#FFD84D',
                  color: '#111111',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.925rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(255, 216, 77, 0.4)'
                }}
              >
                Show {sortedBusinesses.length} Results
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default function ExploreDirectoryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading directory...</div>}>
      <ExploreContent />
    </Suspense>
  );
}

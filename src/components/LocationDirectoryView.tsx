'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  Search, Grid, Map as MapIcon, Home, ChevronRight, ChevronLeft,
  MapPin, X, SlidersHorizontal, RotateCcw, ShieldCheck, Building2
} from 'lucide-react';
import { FilterState, BusinessListing, LocationCity } from '@/types/directory';
import BusinessCard from '@/components/BusinessCard';
import FilterSidebar from '@/components/FilterSidebar';
import { SkeletonGrid } from '@/components/SkeletonLoader';
import { fetchCachedCities } from '@/lib/clientData';

// Lazy-load heavy Google Maps component ONLY when user clicks Map View!
const GoogleMapViewLazy = dynamic(() => import('@/components/GoogleMapView'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6F0', borderRadius: '16px', border: '1px solid #EBE4D8', color: '#666666', fontWeight: '600' }}>
      Loading Interactive Google Map...
    </div>
  )
});

interface LocationDirectoryViewProps {
  stateParam: string;
  cityParam: string;
  initialBusinesses?: BusinessListing[];
  initialCityName?: string;
  initialStateCode?: string;
}

export default function LocationDirectoryView({
  stateParam,
  cityParam,
  initialBusinesses = [],
  initialCityName,
  initialStateCode
}: LocationDirectoryViewProps) {
  
  const [allBusinesses, setAllBusinesses] = useState<BusinessListing[]>(initialBusinesses);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [loading, setLoading] = useState(initialBusinesses.length === 0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fast targeted API fetch by cityParam if initial Businesses empty
  useEffect(() => {
    let isSubscribed = true;
    
    // Fetch only city businesses (lightweight targeted request)
    fetch(`/api/businesses?city=${encodeURIComponent(cityParam)}`)
      .then(r => r.json())
      .then((data: BusinessListing[]) => {
        if (isSubscribed && Array.isArray(data)) {
          setAllBusinesses(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    // Fetch cities for fallback metadata
    fetchCachedCities()
      .then((data: LocationCity[]) => {
        if (isSubscribed && Array.isArray(data)) {
          setCities(data);
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, [cityParam]);

  // Compute city metadata
  const cityInfo = cities.find(
    (c) => c.slug.toLowerCase() === cityParam.toLowerCase() || (c.stateSlug && c.stateSlug.toLowerCase() === stateParam.toLowerCase())
  );

  const cityName = initialCityName || (cityInfo ? cityInfo.name : cityParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  const stateCode = initialStateCode || (cityInfo ? cityInfo.state : stateParam.toUpperCase());
  const countyName = cityInfo?.county || 'San Diego County';

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    subcategory: '',
    location: cityParam,
    state: stateParam,
    minRating: 0,
    openNow: false,
    verifiedOnly: false,
    emergencyOnly: false,
    freeEstimatesOnly: false,
    sortBy: 'recommended'
  });

  const activeFilterCount = [
    Boolean(filters.searchQuery),
    Boolean(filters.category),
    filters.minRating > 0,
    filters.openNow,
    filters.verifiedOnly,
    filters.emergencyOnly,
    filters.freeEstimatesOnly
  ].filter(Boolean).length;

  // Filtered Businesses
  const filteredBusinesses = React.useMemo(() => {
    return allBusinesses.filter((b) => {
      // City matching
      if (cityParam && cityParam !== 'all') {
        const matchSlug = b.citySlug?.toLowerCase() === cityParam.toLowerCase();
        const matchName = b.city?.toLowerCase().includes(cityName.toLowerCase());
        if (!matchSlug && !matchName) return false;
      }

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

      if (filters.minRating && b.rating < filters.minRating) {
        return false;
      }

      if (filters.openNow && !b.openState?.toLowerCase().includes('open')) {
        return false;
      }

      if (filters.verifiedOnly && !b.verified) {
        return false;
      }

      return true;
    });
  }, [allBusinesses, cityParam, cityName, filters]);

  // Sorted Businesses
  const sortedBusinesses = React.useMemo(() => {
    return [...filteredBusinesses].sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'reviews') return b.reviews - a.reviews;
      if (filters.sortBy === 'name') return a.title.localeCompare(b.title);
      return (a.googleMapsRank || 99) - (b.googleMapsRank || 99);
    });
  }, [filteredBusinesses, filters.sortBy]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, cityParam]);

  const totalPages = Math.ceil(sortedBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = React.useMemo(() => {
    return sortedBusinesses.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedBusinesses, currentPage]);

  const popularCities = [
    { name: 'San Diego', slug: 'san-diego' },
    { name: 'La Jolla', slug: 'la-jolla' },
    { name: 'Chula Vista', slug: 'chula-vista' },
    { name: 'Carlsbad', slug: 'carlsbad' },
    { name: 'Encinitas', slug: 'encinitas' },
    { name: 'Oceanside', slug: 'oceanside' },
    { name: 'Coronado', slug: 'coronado' },
    { name: 'Del Mar', slug: 'del-mar' }
  ];

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      subcategory: '',
      location: cityParam,
      state: stateParam,
      minRating: 0,
      openNow: false,
      verifiedOnly: false,
      emergencyOnly: false,
      freeEstimatesOnly: false,
      sortBy: 'recommended'
    });
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* REDESIGNED ULTRA-MODERN LOCATION HERO WITH WARM CANVAS THEME */}
      <section style={{ 
        background: '#FAF6F0', 
        borderBottom: '1px solid #EBE4D8',
        padding: '3rem 0 2.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Radial Backdrop Accent */}
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
          
          {/* Breadcrumbs & Badge */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666666' }}>
              <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Home size={14} color="#111111" /> Home
              </Link>
              <ChevronRight size={13} color="#999999" />
              <Link href="/locations" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600' }}>
                Locations
              </Link>
              <ChevronRight size={13} color="#999999" />
              <span style={{ color: '#FF5B3E', fontWeight: '600' }}>{cityName}, {stateCode}</span>
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
              <MapPin size={14} color="#FF5B3E" />
              <span>{countyName.toUpperCase()} • VERIFIED CITY DIRECTORY</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '800', 
            color: '#111111',
            marginBottom: '0.75rem', 
            lineHeight: '1.15',
            letterSpacing: '-0.02em'
          }}>
            Top Verified Businesses in <span style={{ color: '#FF5B3E', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400' }}>{cityName}, {stateCode}</span>
          </h1>

          <p style={{ color: '#555555', fontSize: '1.05rem', maxWidth: '780px', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Discover top-rated medical spas, clinics, home service providers, solar contractors, and local businesses in {cityName} with authentic Google Reviews &amp; licensing status.
          </p>

          {/* Interactive Search Bar */}
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
            maxWidth: '720px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0.5rem' }}>
              <Search size={18} color="#FF5B3E" />
              <input
                type="text"
                placeholder={`Search local businesses in ${cityName}...`}
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
          </div>

          {/* City Quick Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nearby Cities:
            </span>
            {popularCities.map((city) => {
              const isActive = cityParam.toLowerCase() === city.slug.toLowerCase();
              return (
                <Link
                  key={city.slug}
                  href={`/ca/${city.slug}`}
                  style={{
                    background: isActive ? '#111111' : '#ffffff',
                    color: isActive ? '#ffffff' : '#111111',
                    border: isActive ? '1px solid #111111' : '1px solid #EBE4D8',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 4px 12px rgba(17, 17, 17, 0.12)' : 'none'
                  }}
                >
                  {city.name}
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* MAIN CONTENT AREA WITH 2-COLUMN GRID (DESKTOP SIDEBAR + LISTINGS) */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }} className="explore-layout-grid">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="desktop-filter-sidebar">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
              totalResults={sortedBusinesses.length}
            />
          </aside>

          {/* MAIN LISTINGS COLUMN */}
          <main>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #EBE4D8', padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '1.75rem', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                  {loading ? 'Loading Listings...' : `Showing ${sortedBusinesses.length} Verified Businesses in ${cityName}`}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                
                {/* MOBILE FILTER TRIGGER BUTTON */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: activeFilterCount > 0 ? '1.5px solid #FF5B3E' : '1px solid #111111',
                    background: activeFilterCount > 0 ? '#FAF6F0' : '#111111',
                    color: activeFilterCount > 0 ? '#FF5B3E' : '#ffffff',
                    cursor: 'pointer'
                  }}
                  className="mobile-filter-trigger-btn"
                >
                  <SlidersHorizontal size={15} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span style={{
                      background: '#FF5B3E',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View Switcher Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#FAF6F0', padding: '0.25rem', borderRadius: '10px', border: '1px solid #EBE4D8' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: '700',
                      border: 'none',
                      background: viewMode === 'grid' ? '#111111' : 'transparent',
                      color: viewMode === 'grid' ? '#ffffff' : '#666666',
                      cursor: 'pointer'
                    }}
                  >
                    <Grid size={15} /> Grid
                  </button>

                  <button
                    onClick={() => setViewMode('map')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: '700',
                      border: 'none',
                      background: viewMode === 'map' ? '#FF5B3E' : 'transparent',
                      color: viewMode === 'map' ? '#ffffff' : '#666666',
                      cursor: 'pointer'
                    }}
                  >
                    <MapIcon size={15} /> Interactive Map
                  </button>
                </div>
              </div>
            </div>

            {/* LISTINGS OR LAZY MAP */}
            {loading ? (
              <SkeletonGrid count={6} type="business" />
            ) : sortedBusinesses.length === 0 ? (
              <div style={{ background: '#FAF6F0', borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', border: '1px solid #EBE4D8', margin: '1rem 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FFF0ED', color: '#FF5B3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Building2 size={24} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: '#111111', marginBottom: '0.5rem' }}>
                  No Businesses Found in {cityName}
                </h3>
                <p style={{ color: '#666666', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  We couldn't find any business listings matching your current filter criteria in {cityName}.
                </p>
                <button onClick={resetFilters} style={{ padding: '0.65rem 1.4rem', cursor: 'pointer', background: '#111111', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700' }}>
                  Reset Filters &amp; Show All
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {paginatedBusinesses.map((business) => (
                    <BusinessCard key={business.placeId} business={business} />
                  ))}
                </div>

                {/* PAGINATION BAR */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #EBE4D8',
                        background: '#ffffff',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              border: pageNum === currentPage ? '1px solid #FF5B3E' : '1px solid #EBE4D8',
                              background: pageNum === currentPage ? '#FF5B3E' : '#ffffff',
                              color: pageNum === currentPage ? '#ffffff' : '#111111',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                        return <span key={pageNum} style={{ color: '#888888' }}>...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #EBE4D8',
                        background: '#ffffff',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ padding: '0.5rem', height: '650px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #EBE4D8' }}>
                <GoogleMapViewLazy businesses={sortedBusinesses} />
              </div>
            )}
          </main>

        </div>
      </div>

      {/* RESPONSIVE MOBILE FILTER DRAWER (PORTAL) */}
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
              width: '320px',
              maxWidth: '85vw',
              zIndex: 999999,
              background: '#ffffff',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #EBE4D8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.05rem', color: '#111111' }}>
                <SlidersHorizontal size={18} color="#FF5B3E" /> Filter {cityName} Listings
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem', color: '#111111' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                totalResults={sortedBusinesses.length}
              />
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #EBE4D8' }}>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', background: '#FF5B3E', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
              >
                Show {sortedBusinesses.length} Businesses
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
}

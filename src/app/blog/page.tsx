'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Home, ChevronRight, BookOpen, ArrowRight, X, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { BlogPost } from '@/types/directory';
import BlogFilterSidebar, { BlogFilters } from '@/components/BlogFilterSidebar';
import { SkeletonGrid } from '@/components/SkeletonLoader';
import { fetchCachedPosts } from '@/lib/clientData';

export default function BlogHubPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [filters, setFilters] = useState<BlogFilters>({
    searchQuery: '',
    category: '',
    sortBy: 'newest'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Fetch live blog posts from API
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCachedPosts()
      .then((data: BlogPost[]) => {
        if (active) setAllPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (active) setAllPosts([]); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  // Compute category counts dynamically from live posts
  const categoriesList = React.useMemo(() => {
    const countsMap: Record<string, number> = {};
    allPosts.forEach(post => {
      const cat = post.category || 'Guides';
      countsMap[cat] = (countsMap[cat] || 0) + 1;
    });
    return Object.keys(countsMap).map(name => ({
      name,
      count: countsMap[name]
    })).sort((a, b) => b.count - a.count);
  }, [allPosts]);

  // Active filter count for mobile filter button badge
  const activeFilterCount = [
    Boolean(filters.searchQuery),
    Boolean(filters.category)
  ].filter(Boolean).length;

  // Filtering Logic
  const filteredPosts = allPosts.filter((post) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt.toLowerCase().includes(q);
      const matchCategory = post.category.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchCategory) return false;
    }

    if (filters.category) {
      const topicLower = filters.category.toLowerCase();
      const catLower = post.category.toLowerCase();
      const titleLower = post.title.toLowerCase();
      const excerptLower = post.excerpt.toLowerCase();

      const matchesCat = catLower.includes(topicLower) || topicLower.includes(catLower);
      const matchesText = titleLower.includes(topicLower) || excerptLower.includes(topicLower);
      if (!matchesCat && !matchesText) return false;
    }

    return true;
  });

  // Sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (filters.sortBy === 'older') {
      const idA = parseInt(a.id || '0', 10) || 0;
      const idB = parseInt(b.id || '0', 10) || 0;
      return idA - idB;
    }
    if (filters.sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Default: 'newest' -> Newest listing first (highest numeric WP Post ID)
    const idA = parseInt(a.id || '0', 10) || 0;
    const idB = parseInt(b.id || '0', 10) || 0;
    return idB - idA;
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      sortBy: 'newest'
    });
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* REDESIGNED ULTRA-MODERN BLOG HERO */}
      <section style={{ 
        background: '#FAF6F0', 
        borderBottom: '1px solid #EBE4D8',
        padding: '3rem 0 2.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Backdrop */}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666666' }}>
              <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Home size={14} color="#111111" /> Home
              </Link>
              <ChevronRight size={13} color="#999999" />
              <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Blog & Guides</span>
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
              <BookOpen size={14} color="#FF5B3E" />
              <span>{allPosts.length > 0 ? `${allPosts.length} ARTICLES AVAILABLE` : 'SAN DIEGO GUIDES & REPORTS'}</span>
            </div>
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '800', 
            color: '#111111',
            marginBottom: '0.75rem', 
            lineHeight: '1.15',
            letterSpacing: '-0.02em'
          }}>
            San Diego Homeowner Guides & <span style={{ color: '#FF5B3E', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400' }}>Cost Reports</span>
          </h1>

          <p style={{ color: '#555555', fontSize: '1.05rem', maxWidth: '780px', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Expert hiring advice, local permit regulations, SDG&E energy efficiency rebates, and transparent San Diego home improvement cost estimates.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Popular Topics:
            </span>
            {categoriesList.slice(0, 7).map((cat) => {
              const isActive = filters.category.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, category: isActive ? '' : cat.name }))}
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
                    boxShadow: isActive ? '0 4px 12px rgba(17, 17, 17, 0.12)' : 'none'
                  }}
                >
                  {cat.name} <span style={{ fontSize: '0.725rem', color: isActive ? '#FF5B3E' : '#666666', fontWeight: '700' }}>({cat.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA WITH 2-COLUMN GRID (LEFT SIDEBAR + ARTICLES GRID) */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }} className="explore-layout-grid">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="desktop-filter-sidebar">
            <BlogFilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
              totalResults={sortedPosts.length}
              categoriesList={categoriesList}
            />
          </aside>

          {/* MAIN ARTICLES COLUMN */}
          <main>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #EBE4D8', padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '1.75rem', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                  {loading ? 'Loading Articles...' : `Showing ${sortedPosts.length} Articles`}
                </h2>
                {filters.category && (
                  <span style={{ fontSize: '0.825rem', color: '#FF5B3E', fontWeight: '600' }}>
                    Filtered by: {filters.category}
                  </span>
                )}
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

                {/* Sort Dropdown Selector */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #EBE4D8',
                    background: '#FAF6F0',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    color: '#111111',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="older">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <SkeletonGrid count={6} type="blog" />
            ) : sortedPosts.length === 0 ? (
              /* Empty State */
              <div style={{ background: '#FAF6F0', borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', border: '1px solid #EBE4D8', margin: '1rem 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FFF0ED', color: '#FF5B3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <BookOpen size={24} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: '700', color: '#111111', marginBottom: '0.5rem' }}>
                  No Articles Found
                </h3>
                <p style={{ color: '#666666', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
                  We couldn't find any articles matching your current search query or category selection.
                </p>
                <button onClick={resetFilters} style={{ padding: '0.65rem 1.4rem', cursor: 'pointer', background: '#111111', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700' }}>
                  Reset Filters & Show All
                </button>
              </div>
            ) : (
              /* Articles Grid */
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {paginatedPosts.map((post) => (
                    <article 
                      key={post.id} 
                      className="blog-post-card" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden', 
                        borderRadius: '20px', 
                        border: '1px solid #EBE4D8', 
                        background: '#ffffff', 
                        boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)' 
                      }}
                    >
                      {/* CLICKABLE COVER IMAGE CONTAINER */}
                      <Link 
                        href={`/blog/${post.slug}`} 
                        title={post.title} 
                        style={{ display: 'block', position: 'relative', height: '210px', background: '#FAF6F0', overflow: 'hidden', textDecoration: 'none' }}
                      >
                        <img
                          src={post.coverImage && post.coverImage.trim() ? post.coverImage : '/images/hero_contractor_pro.jpg'}
                          alt={post.title}
                          className="card-hover-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hero_contractor_pro.jpg';
                          }}
                        />
                        <span style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          left: '12px', 
                          background: '#FF5B3E', 
                          color: '#ffffff', 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          padding: '0.25rem 0.7rem', 
                          borderRadius: '999px', 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {post.category}
                        </span>
                      </Link>
                      
                      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.785rem', color: '#666666', marginBottom: '0.5rem', fontWeight: '500' }}>
                          <span>{post.date}</span>
                          <span style={{ background: '#FAF6F0', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '600', color: '#444444' }}>{post.readTime}</span>
                        </div>
                        
                        <h3 style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#111111',
                          marginBottom: '0.65rem',
                          lineHeight: '1.35',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.7em'
                        }}>
                          <Link href={`/blog/${post.slug}`} title={post.title} style={{ textDecoration: 'none', color: '#111111' }}>
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p style={{ fontSize: '0.875rem', color: '#555555', lineHeight: '1.5', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.excerpt}
                        </p>
                        
                        <Link href={`/blog/${post.slug}`} style={{ marginTop: 'auto', fontWeight: '700', fontSize: '0.85rem', color: '#FF5B3E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          Read Full Article <ArrowRight size={14} color="#FF5B3E" />
                        </Link>
                      </div>
                    </article>
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
                <SlidersHorizontal size={18} color="#FF5B3E" /> Filter Blog Articles
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem', color: '#111111' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <BlogFilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                totalResults={sortedPosts.length}
                categoriesList={categoriesList}
              />
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #EBE4D8' }}>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', background: '#FF5B3E', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
              >
                Show {sortedPosts.length} Articles
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
}

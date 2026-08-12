'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  Filter,
  Grid
} from 'lucide-react';
import { Category } from '@/types/directory';

interface CategoriesHubProps {
  categories: Category[];
}

const ITEMS_PER_PAGE = 12;

export default function CategoriesHub({ categories }: CategoriesHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        cat.slug.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const gridEl = document.getElementById('category-grid-hub');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Color generator for category icon circles
  const getCategoryColor = (index: number) => {
    const palette = [
      { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }, // Blue
      { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' }, // Emerald
      { bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' }, // Orange
      { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }, // Red
      { bg: '#faf5ff', color: '#9333ea', border: '#e9d5ff' }, // Purple
      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }, // Green
      { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' }, // Rose
      { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' }, // Sky
    ];
    return palette[index % palette.length];
  };

  return (
    <div>
      {/* SEARCH FILTER & STATS BAR */}
      <div id="category-grid-hub" style={{ scrollMarginTop: '100px', marginBottom: '2rem' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem'
        }}>
          
          {/* SEARCH INPUT FIELD */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search category name, service type, or keyword..."
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 2.6rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* RESULTS METRIC BADGE */}
          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="#FF5B3E" />
            <span>
              {searchTerm ? (
                <span>Found <strong style={{ color: '#FF5B3E' }}>{filteredCategories.length}</strong> matching categories</span>
              ) : (
                <span>Showing <strong style={{ color: '#FF5B3E' }}>{paginatedCategories.length}</strong> of <strong>{categories.length}</strong> Categories</span>
              )}
            </span>
          </div>

        </div>
      </div>

      {/* REDESIGNED CATEGORY CARDS GRID */}
      {paginatedCategories.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {paginatedCategories.map((cat, idx) => {
            const colorTheme = getCategoryColor(idx);
            return (
              <Link
                key={cat.id}
                href={`/explore?category=${cat.slug}`}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="category-card-hover"
              >
                {/* Decorative Top Accent Bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: colorTheme.color
                }} />

                {/* Card Header: Icon & Active Business Count Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: colorTheme.bg,
                    color: colorTheme.color,
                    border: `1px solid ${colorTheme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.2rem'
                  }}>
                    {cat.name.charAt(0)}
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: colorTheme.color,
                    background: colorTheme.bg,
                    border: `1px solid ${colorTheme.border}`,
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    letterSpacing: '0.02em'
                  }}>
                    {cat.count} {cat.count === 1 ? 'Listing' : 'Listings'}
                  </span>
                </div>

                {/* Category Name */}
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                  lineHeight: '1.3'
                }}>
                  {cat.name}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  lineHeight: '1.55',
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  height: '2.7rem'
                }}>
                  {cat.description || `Explore top-rated verified ${cat.name.toLowerCase()} businesses and services in San Diego.`}
                </p>

                {/* Footer Action */}
                <div style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#FF5B3E'
                }}>
                  <span>Browse Category</span>
                  <div className="arrow-slide" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ArrowRight size={16} />
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      ) : (
        /* EMPTY SEARCH STATE */
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          marginBottom: '3rem'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff0ed', color: '#FF5B3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Search size={26} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            No Service Categories Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            We couldn&apos;t find any service category matching &ldquo;<strong style={{ color: '#0f172a' }}>{searchTerm}</strong>&rdquo;. Try searching for another keyword like Plumber, Solar, Spa, or Roofer.
          </p>
          <button
            onClick={handleClearSearch}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.65rem 1.35rem' }}
          >
            Clear Search &amp; View All Categories
          </button>
        </div>
      )}

      {/* FAST PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
            Page <strong style={{ color: '#0f172a' }}>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredCategories.length} Total Categories)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    background: currentPage === pageNum ? '#FF5B3E' : '#ffffff',
                    color: currentPage === pageNum ? '#ffffff' : '#0f172a',
                    border: currentPage === pageNum ? '1px solid #FF5B3E' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

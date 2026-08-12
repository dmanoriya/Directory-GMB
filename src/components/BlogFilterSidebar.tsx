'use client';

import React from 'react';
import { Search, Filter, RotateCcw, Check, X, BookOpen, Layers } from 'lucide-react';

export interface BlogFilters {
  searchQuery: string;
  category: string;
  sortBy: string;
}

interface BlogFilterSidebarProps {
  filters: BlogFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<BlogFilters>>;
  onReset: () => void;
  totalResults: number;
  categoriesList: { name: string; count: number }[];
}

export default function BlogFilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  categoriesList
}: BlogFilterSidebarProps) {
  
  const hasActiveFilters = Boolean(filters.searchQuery || filters.category);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #EBE4D8',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F0EAE1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#FF5B3E" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#111111', margin: 0 }}>
            Filter Articles
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF5B3E',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* 1. Search Query */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Search Keywords
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#FAF6F0',
          border: '1px solid #EBE4D8',
          borderRadius: '10px',
          padding: '0.45rem 0.75rem'
        }}>
          <Search size={15} color="#999999" />
          <input
            type="text"
            placeholder="Search guides or topics..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              fontWeight: '500',
              color: '#111111',
              background: 'transparent'
            }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, searchQuery: '' }))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Topic Categories */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          <Layers size={13} color="#888888" /> Categories & Topics
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '320px', overflowY: 'auto' }}>
          {/* All Categories Option */}
          <button
            type="button"
            onClick={() => onFilterChange(prev => ({ ...prev, category: '' }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.5rem 0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: filters.category === '' ? '#FFF0ED' : 'transparent',
              color: filters.category === '' ? '#FF5B3E' : '#111111',
              fontWeight: filters.category === '' ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 120ms ease'
            }}
          >
            <span>All Categories</span>
            {filters.category === '' && <Check size={14} color="#FF5B3E" />}
          </button>

          {categoriesList.map((cat) => {
            const isActive = filters.category.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onFilterChange(prev => ({ ...prev, category: isActive ? '' : cat.name }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#FFF0ED' : 'transparent',
                  color: isActive ? '#FF5B3E' : '#333333',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms ease'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: '700',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  background: isActive ? '#FF5B3E' : '#FAF6F0',
                  color: isActive ? '#ffffff' : '#666666',
                  marginLeft: '0.35rem',
                  flexShrink: 0
                }}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

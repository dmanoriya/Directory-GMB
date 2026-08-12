'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Filter, RotateCcw, ShieldCheck, Zap, Search, ChevronDown, Check, X } from 'lucide-react';
import { FilterState, Category, LocationCity } from '@/types/directory';
import { fetchCachedCategories, fetchCachedCities } from '@/lib/clientData';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export default function FilterSidebar({ filters, onFilterChange, onReset, totalResults }: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCachedCategories(),
      fetchCachedCities()
    ]).then(([cats, cits]) => {
      if (!active) return;
      if (cats) setCategories(cats);
      if (cits) setCities(cits);
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  const handleChange = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <aside className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #DEDEDE', paddingBottom: '0.85rem' }}>
        <div style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '1.05rem', color: '#111111' }}>
          <Filter size={16} color="#FF5B3E" /> Filter Directory
        </div>
        <button
          onClick={onReset}
          style={{ fontSize: '0.775rem', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Category Picker */}
      <SearchableTradeCategoryDropdown
        categories={categories}
        selectedSlug={filters.category}
        onSelect={(slug) => handleChange('category', slug)}
      />


      {/* Location Picker */}
      <div>
        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
          City / Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          style={{
            width: '100%',
            padding: '0.55rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            fontWeight: '500',
            outline: 'none',
            background: '#ffffff'
          }}
        >
          <option value="">All San Diego County</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              📍 {city.name} ({city.count})
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Rating */}
      <div>
        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
          Minimum Customer Rating
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            { label: 'Any Rating', value: 0 },
            { label: '4.5★ & Above (Top Rated)', value: 4.5 },
            { label: '4.0★ & Above', value: 4.0 }
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.825rem',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === item.value}
                onChange={() => handleChange('minRating', item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Toggle Badges */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.65rem' }}>
          Special Features &amp; Badges
        </label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.825rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0f172a', fontWeight: '600' }}>
              <ShieldCheck size={15} color="#059669" /> Verified Businesses Only
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.emergencyOnly}
              onChange={(e) => handleChange('emergencyOnly', e.target.checked)}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0f172a', fontWeight: '600' }}>
              <Zap size={15} color="#dc2626" /> 24/7 Emergency Service
            </span>
          </label>
        </div>
      </div>

    </aside>
  );
}

function SearchableTradeCategoryDropdown({
  categories,
  selectedSlug,
  onSelect
}: {
  categories: Category[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCat = useMemo(() => {
    return categories.find((c) => c.slug === selectedSlug);
  }, [categories, selectedSlug]);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
        Trade Category
      </label>

      {/* Select Box Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          fontSize: '0.85rem',
          fontWeight: '500',
          background: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: selectedCat ? '#0f172a' : '#64748b',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selectedCat ? '600' : '400' }}>
          {selectedCat ? `${selectedCat.name} (${selectedCat.count})` : 'All Categories'}
        </span>
        <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 99,
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search Input Header */}
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={14} color="#94a3b8" style={{ marginLeft: '0.4rem' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search category..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.825rem',
                color: '#0f172a',
                padding: '0.2rem'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: '#94a3b8', display: 'flex' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '0.35rem' }}>
            <div
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.825rem',
                fontWeight: !selectedSlug ? '700' : '500',
                color: !selectedSlug ? '#FF5B3E' : '#334155',
                background: !selectedSlug ? '#fff1f2' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.2rem'
              }}
            >
              <span>All Categories</span>
              {!selectedSlug && <Check size={14} color="#FF5B3E" />}
            </div>

            {filteredCategories.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                No categories matching "{query}"
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = selectedSlug === cat.slug;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onSelect(cat.slug);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.825rem',
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? '#FF5B3E' : '#334155',
                      background: isSelected ? '#fff1f2' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isSelected ? '#FF5B3E' : '#94a3b8', marginLeft: '0.5rem' }}>
                      ({cat.count})
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

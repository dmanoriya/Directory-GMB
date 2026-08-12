'use client';

import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
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
      <div>
        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
          Trade Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
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
          <option value="">All Categories ({totalResults} Total Listings)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>
      </div>


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

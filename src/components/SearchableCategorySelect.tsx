'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, Plus, Store, X } from 'lucide-react';
import { Category } from '@/types/directory';
import { MOCK_CATEGORIES } from '@/data/mockData';

interface SearchableCategorySelectProps {
  value: string;
  onChange: (categoryName: string) => void;
  categories?: Category[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export default function SearchableCategorySelect({
  value,
  onChange,
  categories = [],
  placeholder = 'Search or select category...',
  error,
  required = false,
}: SearchableCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build unified deduplicated list of category names (main + subcategories)
  const allCategoryNames = useMemo(() => {
    const set = new Set<string>();

    // Add passed categories
    for (const c of categories) {
      if (c.name) set.add(c.name.trim());
      if (Array.isArray(c.subcategories)) {
        for (const sub of c.subcategories) {
          if (sub) set.add(sub.trim());
        }
      }
    }

    // Add popular default service categories
    const defaults = [
      'Medical Spa & Wellness',
      'Medical Spa',
      'Skin Care Clinic',
      'Plumbing',
      'Emergency Plumbing',
      'Drain Cleaning',
      'Water Heaters',
      'HVAC & Air Conditioning',
      'AC Repair',
      'Heating Installation',
      'Roofing',
      'Roof Repair',
      'Electricians',
      'EV Charger Install',
      'Panel Upgrades',
      'Solar Power & Storage',
      'Landscaping & Turf',
      'House Cleaning',
      'Pest Control',
      'Handyman Services',
      'Auto Repair & Mechanics',
      'Dentist & Dental Clinic',
      'Chiropractor',
      'Pet Grooming & Veterinary',
      'Photography & Videography',
      'Legal & Attorney Services',
      'Accounting & Tax Services',
      'Real Estate Agency',
      'Fitness & Gym',
      'Barbershop & Salon',
    ];

    for (const d of defaults) set.add(d);

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categories]);

  // Filter categories based on search input query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategoryNames;
    const q = searchQuery.toLowerCase().trim();
    return allCategoryNames.filter((cat) => cat.toLowerCase().includes(q));
  }, [allCategoryNames, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const isExactMatch = useMemo(() => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return allCategoryNames.some((c) => c.toLowerCase() === q);
  }, [allCategoryNames, searchQuery]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Target Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          padding: '0.65rem 0.75rem',
          borderRadius: '8px',
          border: error ? '1.5px solid #ef4444' : isOpen ? '1.5px solid #0ea5e9' : '1px solid #cbd5e1',
          background: '#ffffff',
          fontSize: '0.875rem',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(14, 165, 233, 0.18)' : 'none',
          transition: 'all 150ms ease',
          color: value ? '#0f172a' : '#94a3b8',
          fontWeight: value ? '600' : '400',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Store size={16} color={value ? '#0ea5e9' : '#94a3b8'} style={{ flexShrink: 0 }} />
          {value ? (
            <span style={{ color: '#0f172a', fontWeight: '700' }}>{value}</span>
          ) : (
            <span style={{ color: '#94a3b8' }}>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          color="#64748b"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', flexShrink: 0 }}
        />
      </button>

      {error && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.25rem', fontWeight: '600' }}>{error}</div>}

      {/* Floating Search Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.2), 0 6px 12px -2px rgba(0, 0, 0, 0.08)',
            padding: '0.65rem',
            maxHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Real-time Filter Search Input */}
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={15} color="#FF5B3E" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories (e.g. Plumbing, Spa, Doctor)..."
              style={{
                width: '100%',
                padding: '0.55rem 2rem 0.55rem 2.1rem',
                borderRadius: '8px',
                border: '1px solid #DEDEDE',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#f8f8f8',
                fontWeight: '500',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666666',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Subtitle / Counter bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.2rem 0.4rem 0.4rem', fontSize: '0.725rem', color: '#666666', fontWeight: '600' }}>
            <span>CATEGORIES</span>
            <span>{filteredCategories.length} available</span>
          </div>

          {/* Categories Options List */}
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '2px' }}>
            {filteredCategories.map((catName) => {
              const isSelected = value.toLowerCase() === catName.toLowerCase();
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => handleSelect(catName)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? '#FFD84D' : 'transparent',
                    color: isSelected ? '#111111' : '#111111',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '800' : '500',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isSelected ? '#0284c7' : '#cbd5e1'
                    }} />
                    {catName}
                  </span>
                  {isSelected && <Check size={16} color="#0284c7" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}

            {/* Custom Category Fallback Option if user typed something not in list */}
            {searchQuery.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={() => handleSelect(searchQuery.trim())}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px dashed #0ea5e9',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.35rem',
                }}
              >
                <Plus size={16} />
                <span>Use custom category: &quot;{searchQuery.trim()}&quot;</span>
              </button>
            )}

            {filteredCategories.length === 0 && !searchQuery.trim() && (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.825rem' }}>
                No categories found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

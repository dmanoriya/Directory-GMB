'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1 || totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate pagination buttons logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push('...');

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 1.5rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        marginTop: '2rem',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Item Range Info */}
      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
        Showing <strong style={{ color: '#0f172a' }}>{startItem}–{endItem}</strong> of{' '}
        <strong style={{ color: '#0f172a' }}>{totalItems.toLocaleString()}</strong> listings
      </div>

      {/* Page Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#0f172a',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 150ms',
          }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        {/* Page Numbers */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  fontWeight: '600',
                }}
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: '38px',
                height: '38px',
                padding: '0 0.5rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #FF5B3E' : '1px solid #DEDEDE',
                background: isActive ? '#FF5B3E' : '#ffffff',
                color: isActive ? '#ffffff' : '#111111',
                fontSize: '0.875rem',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
            color: currentPage === totalPages ? '#cbd5e1' : '#0f172a',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 150ms',
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

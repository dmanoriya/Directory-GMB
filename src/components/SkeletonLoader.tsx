'use client';

import React from 'react';

// CSS Shimmer Keyframes Injection
const shimmerStyle = `
@keyframes skeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer-box {
  background: linear-gradient(90deg, #FAF6F0 25%, #EBE4D8 37%, #FAF6F0 63%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite linear;
}
`;

export function SkeletonStyles() {
  return <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />;
}

// 1. Business Card Skeleton
export function BusinessCardSkeleton() {
  return (
    <div style={{
      borderRadius: '20px',
      border: '1px solid #EBE4D8',
      background: '#ffffff',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '380px'
    }}>
      <SkeletonStyles />
      {/* Top Image Box */}
      <div className="skeleton-shimmer-box" style={{ height: '180px', width: '100%' }} />

      {/* Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.65rem' }}>
        <div className="skeleton-shimmer-box" style={{ height: '14px', width: '40%', borderRadius: '6px' }} />
        <div className="skeleton-shimmer-box" style={{ height: '22px', width: '80%', borderRadius: '6px' }} />
        <div className="skeleton-shimmer-box" style={{ height: '14px', width: '60%', borderRadius: '6px' }} />
        
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #F5F0E8' }}>
          <div className="skeleton-shimmer-box" style={{ height: '16px', width: '30%', borderRadius: '6px' }} />
          <div className="skeleton-shimmer-box" style={{ height: '32px', width: '90px', borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  );
}

// 2. Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <div style={{
      background: '#ffffff',
      padding: '1.65rem 1.25rem',
      borderRadius: '20px',
      border: '1px solid #EBE4D8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
      <SkeletonStyles />
      <div className="skeleton-shimmer-box" style={{ width: '58px', height: '58px', borderRadius: '16px' }} />
      <div className="skeleton-shimmer-box" style={{ height: '20px', width: '70%', borderRadius: '6px' }} />
      <div className="skeleton-shimmer-box" style={{ height: '16px', width: '40%', borderRadius: '999px' }} />
      <div className="skeleton-shimmer-box" style={{ height: '12px', width: '90%', borderRadius: '6px' }} />
    </div>
  );
}

// 3. Blog Post Card Skeleton
export function BlogCardSkeleton() {
  return (
    <div style={{
      borderRadius: '20px',
      border: '1px solid #EBE4D8',
      background: '#ffffff',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '420px'
    }}>
      <SkeletonStyles />
      <div className="skeleton-shimmer-box" style={{ height: '200px', width: '100%' }} />
      
      <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        <div className="skeleton-shimmer-box" style={{ height: '12px', width: '35%', borderRadius: '6px' }} />
        <div className="skeleton-shimmer-box" style={{ height: '22px', width: '90%', borderRadius: '6px' }} />
        <div className="skeleton-shimmer-box" style={{ height: '14px', width: '100%', borderRadius: '6px' }} />
        <div className="skeleton-shimmer-box" style={{ height: '14px', width: '75%', borderRadius: '6px' }} />
        
        <div className="skeleton-shimmer-box" style={{ marginTop: 'auto', height: '16px', width: '45%', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

// 4. Skeleton Grid Wrapper helper
export function SkeletonGrid({ count = 6, type = 'business' }: { count?: number; type?: 'business' | 'category' | 'blog' }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: type === 'category'
        ? 'repeat(auto-fill, minmax(240px, 1fr))'
        : 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
      width: '100%'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {type === 'business' && <BusinessCardSkeleton />}
          {type === 'category' && <CategoryCardSkeleton />}
          {type === 'blog' && <BlogCardSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
}

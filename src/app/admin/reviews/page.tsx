'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Building2,
  Trash2,
  Filter,
  CheckSquare,
  Globe,
  Home,
  ChevronRight
} from 'lucide-react';
import { BusinessReview, BusinessListing } from '@/types/directory';
import { fetchCachedBusinesses } from '@/lib/clientData';

export default function AdminReviewModerationPage() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [reviewsList, setReviewsList] = useState<BusinessReview[]>([]);

  useEffect(() => {
    fetchCachedBusinesses()
      .then(data => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => setBusinesses([]));
  }, []);

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [filterBusiness, setFilterBusiness] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleStatusChange = (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setReviewsList(
      reviewsList.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
    );
  };

  const handleDelete = (reviewId: string) => {
    setReviewsList(reviewsList.filter((r) => r.id !== reviewId));
    setSelectedIds(selectedIds.filter((id) => id !== reviewId));
  };

  // Bulk Actions Handlers
  const handleBulkApprove = () => {
    setReviewsList(
      reviewsList.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'approved' } : r))
    );
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    setReviewsList(
      reviewsList.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'rejected' } : r))
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setReviewsList(reviewsList.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  const toggleSelectAll = (filteredList: BusinessReview[]) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const pendingCount = reviewsList.filter((r) => r.status === 'pending').length;
  const approvedCount = reviewsList.filter((r) => r.status === 'approved').length;

  const displayedReviews = reviewsList.filter((r) => {
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'approved' && r.status !== 'approved') return false;
    if (filterBusiness && r.businessPlaceId !== filterBusiness) return false;
    return true;
  });

  return (
    <div style={{ background: '#FAF8F5', minHeight: '90vh', padding: '2.5rem 0 6rem 0' }}>
      <div className="container">
        
        {/* HERO BANNER HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '2.25rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#FFF0ED', color: '#FF5B3E', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.85rem' }}>
            <ShieldCheck size={16} /> Admin Review Moderation &amp; Quality Control
          </div>
          
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            Review Moderation &amp; Bulk Management Hub
          </h1>
          
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '680px', margin: 0, lineHeight: '1.5' }}>
            Approve verified website feedback, filter pending submissions per business, or manage bulk approvals to protect review integrity.
          </p>
        </div>

        {/* METRIC STATS OVERVIEW GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div className="card" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            <div style={{ background: '#fff7ed', color: '#ea580c', padding: '0.85rem', borderRadius: '14px', border: '1px solid #ffedd5' }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{pendingCount}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: '700', marginTop: '0.35rem' }}>Pending Approval</div>
            </div>
          </div>

          <div className="card" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.85rem', borderRadius: '14px', border: '1px solid #a7f3d0' }}>
              <CheckCircle size={26} />
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{approvedCount}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: '700', marginTop: '0.35rem' }}>Approved Reviews</div>
            </div>
          </div>

          <div className="card" style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.85rem', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
              <Building2 size={26} />
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{businesses.length}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: '700', marginTop: '0.35rem' }}>Active Businesses</div>
            </div>
          </div>

        </div>

        {/* FILTERS & PER-BUSINESS CONTROL BAR */}
        <div className="card" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px', flexWrap: 'wrap', gap: '0.2rem' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '800',
                background: activeTab === 'pending' ? '#ffffff' : 'transparent',
                color: activeTab === 'pending' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'pending' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              Pending Queue ({pendingCount})
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '800',
                background: activeTab === 'approved' ? '#ffffff' : 'transparent',
                color: activeTab === 'approved' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'approved' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              Approved ({approvedCount})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '800',
                background: activeTab === 'all' ? '#ffffff' : 'transparent',
                color: activeTab === 'all' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'all' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              All Reviews ({reviewsList.length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
            <select
              value={filterBusiness}
              onChange={(e) => setFilterBusiness(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: '600',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="">Filter Per Business (All)</option>
              {businesses.map((b) => (
                <option key={b.placeId} value={b.placeId}>{b.title}</option>
              ))}
            </select>
          </div>

        </div>

        {/* BULK SELECTION ACTION BAR */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: '800', fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={displayedReviews.length > 0 && selectedIds.length === displayedReviews.length}
              onChange={() => toggleSelectAll(displayedReviews)}
              style={{ width: '16px', height: '16px' }}
            />
            Select All Displayed ({displayedReviews.length})
          </label>

          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FF5B3E' }}>{selectedIds.length} Selected:</span>
              <button onClick={handleBulkApprove} className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', background: '#059669', borderColor: '#059669', borderRadius: '8px' }}>
                <CheckCircle size={14} /> Bulk Approve
              </button>
              <button onClick={handleBulkReject} className="btn btn-outline" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', color: '#dc2626', borderRadius: '8px' }}>
                <XCircle size={14} /> Bulk Reject
              </button>
              <button onClick={handleBulkDelete} className="btn btn-outline" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', color: '#94a3b8', borderRadius: '8px' }}>
                <Trash2 size={14} /> Bulk Delete
              </button>
            </div>
          )}
        </div>

        {/* REVIEWS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedReviews.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <CheckCircle size={40} color="#059669" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                No Reviews in this Moderation View
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                All pending reviews have been processed or approved!
              </p>
            </div>
          ) : (
            displayedReviews.map((review) => {
              const biz = businesses.find((b) => b.placeId === review.businessPlaceId || b.slug === review.businessSlug);
              const isSelected = selectedIds.includes(review.id);

              return (
                <div key={review.id} className="card" style={{ padding: '1.6rem', borderLeft: review.status === 'pending' ? '4px solid #f59e0b' : '4px solid #10b981', background: isSelected ? '#f0f9ff' : '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(review.id)}
                        style={{ marginTop: '4px', width: '16px', height: '16px' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{review.reviewerName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({review.reviewerEmail || 'No email'})</span>
                          <span style={{
                            fontSize: '0.725rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            background: review.status === 'pending' ? '#fef3c7' : '#ecfdf5',
                            color: review.status === 'pending' ? '#d97706' : '#059669',
                            border: review.status === 'pending' ? '1px solid #fde68a' : '1px solid #a7f3d0'
                          }}>
                            {review.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#FF5B3E', fontWeight: '700' }}>
                          Target Listing: {biz ? biz.title : review.businessSlug}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', color: '#eab308' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < review.rating ? '#eab308' : 'none'} color="#eab308" />
                      ))}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
                    {review.title}
                  </h4>
                  
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.55', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    {review.comment}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                      Submitted on {review.date}
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="btn"
                            style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.825rem', padding: '0.45rem 0.95rem', fontWeight: '700', borderRadius: '8px' }}
                          >
                            <CheckCircle size={14} /> Approve Review
                          </button>

                          <button
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            className="btn"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.825rem', padding: '0.45rem 0.95rem', fontWeight: '700', borderRadius: '8px' }}
                          >
                            <XCircle size={14} /> Reject / Spam
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(review.id)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem', color: '#94a3b8', borderRadius: '8px', fontWeight: '700' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

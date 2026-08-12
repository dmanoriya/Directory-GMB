'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, LogIn, UserPlus, X, ShieldCheck } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionName?: string;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'Login Required',
  message = 'You need to sign in or create an account to write reviews, suggest edits, or claim business listings.',
  actionName = 'perform this action'
}: AuthRequiredModalProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const loginUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(pathname || '/')}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 200ms ease'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '460px',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        position: 'relative',
        textAlign: 'center'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 150ms'
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Lock Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FFD84D',
          color: '#111111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          boxShadow: '0 8px 16px rgba(255, 216, 77, 0.35)'
        }}>
          <Lock size={30} color="#111111" />
        </div>

        {/* Modal Title */}
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '700', color: '#111111', marginBottom: '0.5rem' }}>
          {title}
        </h3>

        {/* Subtitle / Description */}
        <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.55', marginBottom: '1.75rem' }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <Link
            href={loginUrl}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              justifyContent: 'center',
              width: '100%',
              borderRadius: '12px'
            }}
          >
            <LogIn size={18} /> Sign In to Your Account
          </Link>

          <Link
            href={registerUrl}
            className="btn btn-outline"
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              justifyContent: 'center',
              width: '100%',
              borderRadius: '12px'
            }}
          >
            <UserPlus size={18} /> Create a New Free Account
          </Link>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Continue Browsing as Guest
          </button>

        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.775rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="#059669" /> Safe & Secure Instant Account Access
        </div>

      </div>
    </div>
  );
}

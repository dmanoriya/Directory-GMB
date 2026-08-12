'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Auto-verify if 1-Click token is present in URL
  useEffect(() => {
    if (emailParam && tokenParam) {
      handleVerifyByToken(emailParam, tokenParam);
    }
  }, [emailParam, tokenParam]);

  const handleVerifyByToken = async (targetEmail: string, token: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, token }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Email verification link invalid or expired.');
      }

      setSuccessMessage('Email verified successfully! Logging you in...');
      if (data.user) {
        login(data.user);
      }
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification link failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean && value !== '') return;

    const newDigits = [...pinDigits];
    newDigits[index] = clean.slice(-1);
    setPinDigits(newDigits);
    setError('');

    // Auto-advance focus to next input
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setPinDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinDigits.join('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (pin.length < 6) {
      setError('Please enter all 6 digits of your verification PIN.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid 6-digit verification PIN.');
      }

      setSuccessMessage('Email verified successfully! Submitting account for WP-Admin approval...');
      if (data.user) {
        login(data.user);
      }
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address to resend code.');
      return;
    }

    setResending(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email.split('@')[0], email }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to resend verification code.');
      }

      setSuccessMessage(`Fresh 6-digit PIN sent to ${email} via SendGrid SMTP.`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
        border: '1px solid #e2e8f0',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>

        {/* Header Icon */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: '#FFF0ED',
          color: '#FF5B3E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          border: '1px solid #ffccd5'
        }}>
          <Mail size={34} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem' }}>
          Verify Your Email
        </h1>

        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', margin: '0 0 1.75rem' }}>
          We sent a 6-digit verification code via <strong>SendGrid SMTP</strong> to:
          <br />
          <strong style={{ color: '#0f172a' }}>{email || 'your email address'}</strong>
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email field if not provided in URL */}
          {!emailParam && (
            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          )}

          {/* 6-Digit PIN Boxes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.75rem' }} onPaste={handlePaste}>
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '46px',
                  height: '54px',
                  borderRadius: '12px',
                  border: digit ? '2px solid #FF5B3E' : '1px solid #cbd5e1',
                  background: digit ? '#FFF0ED' : '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  textAlign: 'center',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 150ms ease'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', justifyContent: 'center' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Confirm Email &amp; Submit Registration
              </span>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: '#FF5B3E', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {resending ? 'Resending...' : 'Resend Verification Code'}
          </button>

          <Link href="/register" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} /> Back to Register
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="#FF5B3E" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

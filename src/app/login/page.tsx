'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleReCaptcha from '@/components/GoogleReCaptcha';
import {
  sanitizeInput,
  checkPasswordRequirements,
  calculatePasswordStrength
} from '@/lib/securityFilter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const reqs = checkPasswordRequirements(password);
  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = sanitizeInput(email);
    if (!cleanEmail || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    if (!recaptchaVerified) {
      setError('Please complete the Google reCAPTCHA security verification.');
      return;
    }

    setSubmitting(true);

    try {
      await login(cleanEmail);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', background: '#FAF8F5', padding: '3.5rem 1rem', display: 'flex', alignItems: 'flex-start' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>

          {/* LEFT COLUMN: BRAND WELCOME & TRUST FEATURES */}
          <div style={{ padding: '1rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#FFF0ED',
              color: '#FF5B3E',
              fontSize: '0.8rem',
              fontWeight: '800',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid #FFD8D0',
              marginBottom: '1.25rem'
            }}>
              <ShieldCheck size={16} /> 256-Bit Encrypted &amp; Spam Protected
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: '800',
              color: '#0f172a',
              lineHeight: '1.15',
              letterSpacing: '-0.02em',
              marginBottom: '1rem'
            }}>
              Welcome Back to Your Business Dashboard
            </h1>

            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.6', marginBottom: '2rem' }}>
              Access your verified listings, respond to customer reviews, track profile analytics, and manage suggested business updates in real-time.
            </p>

            {/* TRUST FEATURE CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '2.25rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.15rem' }}>
                    Manage Verified Businesses
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.45' }}>
                    Full real-time control over your business profiles, operating hours, phone numbers, and categories.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.15rem' }}>
                    Customer Reviews &amp; Feedback Hub
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.45' }}>
                    Reply to customer reviews, monitor Google Places feedback, and build trust with prospective clients.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.15rem' }}>
                    Suggested Edits &amp; Community Updates
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.45' }}>
                    Review user-submitted updates to keep your business records accurate and up to date.
                  </p>
                </div>
              </div>

            </div>

            {/* TRUST BADGE FOOTER */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={18} />
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: '1.4' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>Google reCAPTCHA &amp; SSL Encrypted Security:</span> Your credentials and session are protected with enterprise security standards.
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LOGIN FORM CARD */}
          <div className="card" style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                Sign In to Your Account
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Enter your email address and password to access your dashboard.
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* EMAIL FIELD */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem' }}>
                  Email Address <span style={{ color: '#FF5B3E' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111' }}>
                    Password <span style={{ color: '#FF5B3E' }}>*</span>
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* PASSWORD STRENGTH BAR */}
                <div style={{ marginTop: '0.55rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#64748b' }}>Password Strength:</span>
                    <span style={{ color: password ? strength.color : '#94a3b8' }}>{password ? strength.label : 'Required'}</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${password ? strength.score : 0}%`, height: '100%', background: strength.color, transition: 'all 200ms ease' }} />
                  </div>
                </div>

                {/* LIVE PASSWORD REQUIREMENTS CHECKLIST */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.75rem', marginTop: '0.65rem', background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.725rem' }}>
                  <div style={{ color: reqs.minLength ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: reqs.minLength ? '700' : '400' }}>
                    {reqs.minLength ? <Check size={12} strokeWidth={2.5} /> : <span style={{ width: '12px', textAlign: 'center' }}>•</span>} Min 8 characters
                  </div>
                  <div style={{ color: reqs.hasUpper ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: reqs.hasUpper ? '700' : '400' }}>
                    {reqs.hasUpper ? <Check size={12} strokeWidth={2.5} /> : <span style={{ width: '12px', textAlign: 'center' }}>•</span>} 1 Uppercase (A-Z)
                  </div>
                  <div style={{ color: reqs.hasLower ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: reqs.hasLower ? '700' : '400' }}>
                    {reqs.hasLower ? <Check size={12} strokeWidth={2.5} /> : <span style={{ width: '12px', textAlign: 'center' }}>•</span>} 1 Lowercase (a-z)
                  </div>
                  <div style={{ color: reqs.hasNumber ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: reqs.hasNumber ? '700' : '400' }}>
                    {reqs.hasNumber ? <Check size={12} strokeWidth={2.5} /> : <span style={{ width: '12px', textAlign: 'center' }}>•</span>} 1 Number (0-9)
                  </div>
                  <div style={{ color: reqs.hasSpecial ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: reqs.hasSpecial ? '700' : '400', gridColumn: 'span 2' }}>
                    {reqs.hasSpecial ? <Check size={12} strokeWidth={2.5} /> : <span style={{ width: '12px', textAlign: 'center' }}>•</span>} 1 Special symbol (!@#$%^&*)
                  </div>
                </div>
              </div>

              {/* GOOGLE RECAPTCHA SECURITY BOX */}
              <GoogleReCaptcha
                onVerify={(token) => {
                  setRecaptchaToken(token);
                  setRecaptchaVerified(true);
                }}
                onExpired={() => {
                  setRecaptchaToken('');
                  setRecaptchaVerified(false);
                }}
              />

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  borderRadius: '12px',
                  marginTop: '0.35rem',
                  opacity: submitting ? 0.75 : 1
                }}
              >
                {submitting ? 'Authenticating...' : 'Sign In to Account'} <ArrowRight size={18} />
              </button>

            </form>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
              Don&apos;t have an account yet?{' '}
              <Link href="/register" style={{ color: '#FF5B3E', fontWeight: '700', textDecoration: 'none' }}>
                Create a Free Account
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

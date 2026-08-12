'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  LockKeyhole,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleReCaptcha from '@/components/GoogleReCaptcha';
import {
  sanitizeInput,
  containsProhibitedContent,
  isDisposableEmail,
  checkPasswordRequirements,
  calculatePasswordStrength
} from '@/lib/securityFilter';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  // Password requirements & strength
  const reqs = checkPasswordRequirements(password);
  const strength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Validation helpers
  const nameHasProhibited = containsProhibitedContent(name);
  const emailHasProhibited = containsProhibitedContent(email);
  const emailIsDisposable = isDisposableEmail(email);

  const isFormValid =
    name.trim().length >= 2 &&
    !nameHasProhibited &&
    email.includes('@') &&
    !emailHasProhibited &&
    !emailIsDisposable &&
    reqs.minLength &&
    reqs.hasUpper &&
    reqs.hasLower &&
    reqs.hasNumber &&
    reqs.hasSpecial &&
    passwordsMatch &&
    agreedTerms &&
    recaptchaVerified;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-flight client validations
    if (nameHasProhibited || emailHasProhibited) {
      setError('Registration blocked: Name or email contains prohibited, adult, or spam content.');
      return;
    }

    if (emailIsDisposable) {
      setError('Disposable and temporary email addresses are not permitted.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!recaptchaVerified) {
      setError('Please complete the Google reCAPTCHA security verification.');
      return;
    }

    if (!agreedTerms) {
      setError('You must agree to the Terms of Service & Anti-Spam / Content Safety Policy.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitizeInput(name),
          email: sanitizeInput(email),
          password,
          recaptchaToken: recaptchaToken || 'dev_verified_token'
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (data.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      await register(name, email);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
              color: '#111111',
              lineHeight: '1.2',
              marginBottom: '1rem',
              letterSpacing: '-0.03em'
            }}>
              Join San Diego’s Most Trusted Business Network
            </h1>

            <p style={{ fontSize: '1rem', color: '#555555', lineHeight: '1.65', marginBottom: '2rem', maxWidth: '480px' }}>
              Create your secure verified account to claim business listings, collect customer reviews, and boost local Google Maps visibility.
            </p>

            {/* TRUST HIGHLIGHT CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: '460px' }}>
              
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FFD84D', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111111', marginBottom: '0.15rem' }}>
                    Instant Business Claiming
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: '1.45' }}>
                    Verify ownership of your San Diego business and update phone, hours, and photos live.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#111111', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111111', marginBottom: '0.15rem' }}>
                    Zero Spam &amp; Safe Community
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: '1.45' }}>
                    Strict automated filters block spam bots, fake profiles, and adult content automatically.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111111', marginBottom: '0.15rem' }}>
                    Google reCAPTCHA Security
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: '1.45' }}>
                    Protected by Google security verification to keep your credentials safe 24/7.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: REGISTRATION FORM CARD */}
          <div className="card" style={{
            padding: '2.25rem',
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #EBE4D8',
            boxShadow: '0 16px 40px -10px rgba(17, 17, 17, 0.08)'
          }}>

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#111111', marginBottom: '0.35rem' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666666' }}>
                Fill in your details to start managing local listings
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
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                lineHeight: '1.4'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* FULL NAME FIELD */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem' }}>
                  Full Name <span style={{ color: '#FF5B3E' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: nameHasProhibited ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {nameHasProhibited && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: '600' }}>
                    ❌ Name contains prohibited keywords.
                  </div>
                )}
              </div>

              {/* EMAIL ADDRESS FIELD */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem' }}>
                  Work or Personal Email <span style={{ color: '#FF5B3E' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: emailHasProhibited || emailIsDisposable ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {emailHasProhibited && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: '600' }}>
                    ❌ Email contains prohibited terms.
                  </div>
                )}
                {emailIsDisposable && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: '600' }}>
                    ❌ Disposable temporary email domains are blocked.
                  </div>
                )}
              </div>

              {/* PASSWORD FIELD WITH STRENGTH INDICATOR */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem' }}>
                  Secure Password <span style={{ color: '#FF5B3E' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
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

              {/* CONFIRM PASSWORD FIELD */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem' }}>
                  Confirm Password <span style={{ color: '#FF5B3E' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.6rem',
                      borderRadius: '12px',
                      border: confirmPassword ? (passwordsMatch ? '1.5px solid #10b981' : '1.5px solid #ef4444') : '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {confirmPassword && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '600', color: passwordsMatch ? '#059669' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {passwordsMatch ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
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

              {/* TERMS & SAFETY POLICY CHECKBOX */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', marginTop: '0.2rem', lineHeight: '1.45' }}>
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: '#FF5B3E', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span>
                  I agree to the <Link href="/terms" style={{ color: '#FF5B3E', fontWeight: '700', textDecoration: 'underline' }}>Terms of Service</Link>, <Link href="/privacy" style={{ color: '#FF5B3E', fontWeight: '700', textDecoration: 'underline' }}>Privacy Policy</Link>, and <strong>Zero Spam / Anti-Adult Content Policy</strong>.
                </span>
              </label>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting || !isFormValid}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  marginTop: '0.5rem',
                  borderRadius: '12px',
                  opacity: isFormValid ? 1 : 0.6,
                  cursor: isFormValid ? 'pointer' : 'not-allowed'
                }}
              >
                {submitting ? 'Creating Secure Account...' : 'Register Secure Account'} <ArrowRight size={17} />
              </button>

            </form>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Already have a registered account?{' '}
              <Link href="/login" style={{ color: '#FF5B3E', fontWeight: '800', textDecoration: 'underline' }}>
                Sign in here
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

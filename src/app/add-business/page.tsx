'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, CheckCircle2, ShieldCheck, Lock, LogIn, 
  UserPlus, Building2, MapPin, Phone, Mail, Globe, FileText, ArrowRight, UserCheck, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitLeadToWp } from '@/lib/wordpress';
import { Category, LocationCity } from '@/types/directory';
import { fetchCachedCategories, fetchCachedCities } from '@/lib/clientData';

export default function AddBusinessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  
  // Founder & Leadership State
  const [founderName, setFounderName] = useState('');
  const [founderRole, setFounderRole] = useState('');
  const [founderExperience, setFounderExperience] = useState('');
  const [founderQuote, setFounderQuote] = useState('');
  const [licenseStatus, setLicenseStatus] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);

  // Pre-fill email when user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await submitLeadToWp({
        type: 'advertise',
        businessName: name,
        contactName: user.name,
        contactEmail: email || user.email,
        contactPhone: phone,
        websiteUrl: website,
        message: `Category: ${category} | City: ${city} | Address: ${address} | Description: ${description} | FounderName: ${founderName} | FounderRole: ${founderRole} | FounderExp: ${founderExperience} | FounderQuote: ${founderQuote} | LicenseStatus: ${licenseStatus}`,
        submittedAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#FAF6F0', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666666' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Checking account status...</div>
          <p style={{ fontSize: '0.875rem' }}>San Diego Directory Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* REDESIGNED HERO SECTION WITH WARM CANVAS THEME */}
      <section style={{
        background: '#FAF6F0',
        borderBottom: '1px solid #EBE4D8',
        padding: '3.5rem 0 3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Radial Backdrop */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 91, 62, 0.06) 0%, rgba(250, 246, 240, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '780px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#FFF0ED',
            border: '1px solid #FFD8D0',
            padding: '0.35rem 0.95rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#FF5B3E',
            marginBottom: '1.25rem'
          }}>
            <ShieldCheck size={15} color="#FF5B3E" />
            <span>SAN DIEGO BUSINESS PORTAL</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            color: '#111111',
            marginBottom: '0.85rem',
            lineHeight: '1.15'
          }}>
            List Your Business in <span style={{ color: '#FF5B3E', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400' }}>San Diego Directory</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#555555', lineHeight: '1.6', margin: '0 auto' }}>
            Join San Diego County's premier verified home service &amp; trade directory. Get qualified local customer inquiries and boost Google Maps trust.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="container" style={{ maxWidth: '680px', marginTop: '3rem' }}>
        
        {/* CASE 1: USER IS GUEST (NOT LOGGED IN) */}
        {!user ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #EBE4D8',
            boxShadow: '0 12px 36px rgba(17, 17, 17, 0.06)',
            padding: '3rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FFF0ED',
              color: '#FF5B3E',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Lock size={28} color="#FF5B3E" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#111111', marginBottom: '0.65rem' }}>
              Sign In Required to Add a Business
            </h2>

            <p style={{ color: '#555555', fontSize: '0.975rem', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 2rem' }}>
              To ensure authentic local listings and verify business ownership, please log in or create a free account to submit your business details.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Link
                href="/login?redirect=/add-business"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  background: '#111111',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.15)'
                }}
              >
                <LogIn size={18} /> Sign In to Continue
              </Link>

              <Link
                href="/register?redirect=/add-business"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  background: '#FF5B3E',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(255, 91, 62, 0.25)'
                }}
              >
                <UserPlus size={18} /> Create Free Account
              </Link>
            </div>
          </div>
        ) : submitted ? (
          /* CASE 2: SUCCESS SUBMISSION SCREEN */
          <div style={{
            background: '#FAF6F0',
            borderRadius: '24px',
            border: '1px solid #EBE4D8',
            padding: '3.5rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#D1FAE5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle2 size={32} color="#059669" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: '#111111', marginBottom: '0.65rem' }}>
              Business Listing Submitted!
            </h2>

            <p style={{ color: '#555555', fontSize: '1rem', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 2rem' }}>
              Thank you, <strong>{user.name}</strong>! Your business submission for <strong>{name}</strong> has been received by our moderation team. Once verified, it will go live automatically on San Diego Directory.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  background: '#111111',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                Go to My User Dashboard <ArrowRight size={16} />
              </Link>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setAddress('');
                  setPhone('');
                  setWebsite('');
                  setDescription('');
                }}
                style={{
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #EBE4D8',
                  color: '#111111',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Submit Another Business
              </button>
            </div>
          </div>
        ) : (
          /* CASE 3: LOGGED IN USER SUBMISSION FORM */
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #EBE4D8',
            boxShadow: '0 12px 36px rgba(17, 17, 17, 0.06)',
            padding: '2.5rem'
          }}>
            {/* Account Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FAF6F0',
              border: '1px solid #EBE4D8',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#111111', fontWeight: '600' }}>
                <ShieldCheck size={18} color="#FF5B3E" />
                <span>Account: <strong>{user.name}</strong> ({user.email})</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', background: '#D1FAE5', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                LOGGED IN
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              
              {/* Business Name */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                  <Building2 size={15} color="#FF5B3E" /> Company / Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Diego Solar Tech & Roofing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #EBE4D8',
                    background: '#FAF6F0',
                    fontSize: '0.925rem',
                    color: '#111111',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Category & City */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                    Primary Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #EBE4D8',
                      background: '#FAF6F0',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                    City / Neighborhood *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #EBE4D8',
                      background: '#FAF6F0',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select City</option>
                    {cities.map((loc) => (
                      <option key={loc.id} value={loc.slug}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                    <MapPin size={15} color="#666666" /> Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 450 B Street, Suite 100"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #EBE4D8',
                      background: '#FAF6F0',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                    <Phone size={15} color="#666666" /> Business Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="(619) 555-0188"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #EBE4D8',
                      background: '#FAF6F0',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Email & Website */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                    <Mail size={15} color="#666666" /> Contact Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #EBE4D8',
                      background: '#FAF6F0',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                    <Globe size={15} color="#666666" /> Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #EBE4D8',
                      background: '#FAF6F0',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#111111', marginBottom: '0.45rem' }}>
                  <FileText size={15} color="#666666" /> Business Description &amp; Overview
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a brief overview of your local services, specialties, and licensing status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #EBE4D8',
                    background: '#FAF6F0',
                    fontSize: '0.9rem',
                    color: '#111111',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* FOUNDERS & LEADERSHIP SECTION */}
              <div style={{
                background: '#FAF6F0',
                border: '1px solid #EBE4D8',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.95rem', fontWeight: '800', color: '#111111', fontFamily: 'var(--font-heading)' }}>
                  <UserCheck size={18} color="#FF5B3E" /> Founders &amp; Leadership Details (Optional)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.35rem' }}>
                      Founder / Owner Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nina Bacci"
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #EBE4D8', background: '#ffffff', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.35rem' }}>
                      Founder Title / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director & Founder"
                      value={founderRole}
                      onChange={(e) => setFounderRole(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #EBE4D8', background: '#ffffff', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.35rem' }}>
                      Local Experience Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15+ Yrs San Diego Service"
                      value={founderExperience}
                      onChange={(e) => setFounderExperience(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #EBE4D8', background: '#ffffff', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.35rem' }}>
                      License / Registration Status
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ACTIVE (Verified)"
                      value={licenseStatus}
                      onChange={(e) => setLicenseStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #EBE4D8', background: '#ffffff', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '700', color: '#111111', marginBottom: '0.35rem' }}>
                    Founder Personal Quote / Statement
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide a personal statement or commitment quote to San Diego customers..."
                    value={founderQuote}
                    onChange={(e) => setFounderQuote(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #EBE4D8', background: '#ffffff', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  borderRadius: '14px',
                  background: '#FF5B3E',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 18px rgba(255, 91, 62, 0.3)',
                  marginTop: '0.5rem'
                }}
              >
                <PlusCircle size={20} /> {submitting ? 'Submitting Listing...' : 'Submit Business Listing'}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}

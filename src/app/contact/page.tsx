'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Consumer Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
          
          {/* BREADCRUMB */}
          <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>/</span>
            <span style={{ color: '#FF5B3E', fontWeight: '600' }}>Contact Us</span>
          </div>

          {/* PAGE HEADER */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            border: '1px solid #EBE4D8',
            boxShadow: '0 8px 30px rgba(17, 17, 17, 0.04)',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#FF5B3E',
              background: '#FFF0ED',
              border: '1px solid #FFDCD4',
              padding: '0.3rem 0.85rem',
              borderRadius: '999px',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={13} color="#FF5B3E" /> GET IN TOUCH WITH OUR TEAM
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#111111',
              marginBottom: '1rem'
            }}>
              We're Here to Help You
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#555555',
              lineHeight: '1.6',
              maxWidth: '640px',
              margin: '0 auto'
            }}>
              Have a question about a business listing, need assistance claiming your profile, or interested in advertising partnerships? Reach out to our San Diego support team.
            </p>
          </div>

          {/* MAIN 2-COLUMN GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: CONTACT DETAILS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #EBE4D8',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#FFF0ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={24} color="#FF5B3E" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#111111', margin: 0, marginBottom: '0.2rem' }}>
                    San Diego Office
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666666', margin: 0, lineHeight: '1.4' }}>
                    101 W Broadway, Suite 1200<br />San Diego, CA 92101
                  </p>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #EBE4D8',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#FFF0ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Mail size={24} color="#FF5B3E" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#111111', margin: 0, marginBottom: '0.2rem' }}>
                    Email Support
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666666', margin: 0 }}>
                    support@localnest.com<br />listings@localnest.com
                  </p>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #EBE4D8',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#FFF0ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Phone size={24} color="#FF5B3E" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#111111', margin: 0, marginBottom: '0.2rem' }}>
                    Phone Contact
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666666', margin: 0 }}>
                    (619) 555-0192 (Toll-Free CA)
                  </p>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #EBE4D8',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#FFF0ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={24} color="#FF5B3E" />
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#111111', margin: 0, marginBottom: '0.2rem' }}>
                    Business Hours
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666666', margin: 0 }}>
                    Mon – Fri: 8:00 AM – 6:00 PM PST<br />Sat – Sun: Closed
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: CONTACT FORM */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid #EBE4D8',
              boxShadow: '0 8px 30px rgba(17, 17, 17, 0.04)'
            }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '800', color: '#111111', marginBottom: '0.5rem' }}>
                    Message Sent Successfully!
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#666666', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Thank you for reaching out to LocalNest. A member of our support team will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '800', color: '#111111', marginBottom: '1.5rem' }}>
                    Send Us a Direct Message
                  </h3>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#333333', marginBottom: '0.4rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #EBE4D8',
                        background: '#FAF6F0',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#333333', marginBottom: '0.4rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sarah@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #EBE4D8',
                        background: '#FAF6F0',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#333333', marginBottom: '0.4rem' }}>
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #EBE4D8',
                        background: '#FAF6F0',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Consumer Inquiry">Consumer Inquiry</option>
                      <option value="Claim Business Listing">Claiming Business Listing</option>
                      <option value="Suggest Edit / Data Correction">Suggest Listing Edit</option>
                      <option value="Advertising / Partnership">Advertising &amp; Partnerships</option>
                      <option value="Technical Support">Technical Support</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#333333', marginBottom: '0.4rem' }}>
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="How can we assist you today? Please include any business names or listing URLs if relevant..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #EBE4D8',
                        background: '#FAF6F0',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Send Message <Send size={16} />
                  </button>

                </form>
              )}
            </div>

          </div>

        </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck, Building2, UserCheck } from 'lucide-react';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      category: 'For Consumers',
      question: 'How does LocalNest verify business listings and ratings?',
      answer: 'We sync directly with official Google Maps Places API feeds, California State Licensing Board (CSLB) databases, and business owner documentation. This ensures star ratings, customer review counts, operating hours, and license status reflect authentic data.'
    },
    {
      category: 'For Consumers',
      question: 'Is searching and contacting local businesses free on LocalNest?',
      answer: 'Yes, LocalNest is 100% free for consumers, homeowners, and patients. You can search, compare verified pro profiles, view photos, call directly, or request quotes without any paywalls or hidden fees.'
    },
    {
      category: 'For Consumers',
      question: 'What should I do if a business listed has incorrect operating hours or details?',
      answer: 'Each listing page includes a "Suggest an Edit" button near the business header. Clicking it allows you to report updated phone numbers, operating hours, or address details directly to our data verification team.'
    },
    {
      category: 'For Business Owners',
      question: 'How do I claim my business profile on LocalNest?',
      answer: 'To claim an existing profile or add a new listing, navigate to "/claim-listing" or click "+ Add Business" in the top navigation. Once submitted, our team verifies your business ownership through phone or document check within 24 hours.'
    },
    {
      category: 'For Business Owners',
      question: 'What features are included when I claim a business profile?',
      answer: 'Claiming your profile unlocks the Business Management Dashboard. You can update your business bio, add high-resolution work photos, feature service options (e.g., Emergency Services, Free Estimates), respond to reviews, and track lead performance.'
    },
    {
      category: 'For Business Owners',
      question: 'Does claiming a business profile cost anything?',
      answer: 'Basic business profile claims, Google Business API syncing, and lead receiving are completely free for local trade pros in San Diego County.'
    }
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div style={{ background: '#FAF6F0', minHeight: '100vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
          
          {/* BREADCRUMB */}
          <div style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.5rem' }}>
            <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span style={{ margin: '0 0.5rem', color: '#999999' }}>/</span>
            <span style={{ color: '#FF5B3E', fontWeight: '600' }}>FAQ</span>
          </div>

          {/* PAGE HEADER */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
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
              <Sparkles size={13} color="#FF5B3E" /> FREQUENTLY ASKED QUESTIONS
            </div>
            
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: '800',
              color: '#111111',
              marginBottom: '0.75rem'
            }}>
              Got Questions? We Have Answers.
            </h1>

            <p style={{ fontSize: '1rem', color: '#555555', maxWidth: '640px', margin: '0 auto' }}>
              Everything you need to know about searching for verified local contractors or managing your business profile on LocalNest.
            </p>
          </div>

          {/* FAQ ACCORDION CONTAINER */}
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: isOpen ? '1px solid #FF5B3E' : '1px solid #EBE4D8',
                    boxShadow: isOpen ? '0 8px 24px rgba(255, 91, 62, 0.08)' : '0 4px 16px rgba(17, 17, 17, 0.02)',
                    overflow: 'hidden',
                    transition: 'all 200ms ease'
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    style={{
                      width: '100%',
                      padding: '1.5rem 1.75rem',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: item.category === 'For Consumers' ? '#059669' : '#FF5B3E',
                        background: item.category === 'For Consumers' ? '#ECFDF5' : '#FFF0ED',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        marginBottom: '0.4rem',
                        textTransform: 'uppercase'
                      }}>
                        {item.category}
                      </span>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: '#111111', margin: 0 }}>
                        {item.question}
                      </h4>
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isOpen ? '#FF5B3E' : '#FAF6F0',
                      color: isOpen ? '#ffffff' : '#111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.75rem 1.5rem 1.75rem', fontSize: '0.95rem', color: '#555555', lineHeight: '1.65', borderTop: '1px solid #F3EDE4', paddingTop: '1rem' }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* STILL HAVE QUESTIONS CARD */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            border: '1px solid #EBE4D8',
            boxShadow: '0 4px 20px rgba(17, 17, 17, 0.03)',
            maxWidth: '820px',
            margin: '3rem auto 0',
            textAlign: 'center'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '800', color: '#111111', marginBottom: '0.5rem' }}>
              Still have questions?
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#666666', marginBottom: '1.5rem' }}>
              Can't find the answer you're looking for? Reach out to our local San Diego support team.
            </p>
            <Link href="/contact" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}>
              Contact Customer Support
            </Link>
          </div>

        </div>
    </div>
  );
}
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, Calendar, User, Home, ChevronRight, 
  Share2, BookOpen, Sparkles, Building2, Layers, Tag
} from 'lucide-react';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/wordpress';
import BusinessCard from '@/components/BusinessCard';

export const dynamic = 'force-dynamic';

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch all posts for related articles sidebar
  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && p.category.toLowerCase() === post.category.toLowerCase())
    .slice(0, 3);

  const fallbackRelated = relatedPosts.length > 0
    ? relatedPosts
    : allPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '6rem' }}>
      
      {/* REDESIGNED EDITORIAL WARM CANVAS HERO */}
      <section style={{
        background: '#FAF6F0',
        borderBottom: '1px solid #EBE4D8',
        padding: '3rem 0 2.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Backdrop */}
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

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666666' }}>
              <Link href="/" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Home size={14} color="#111111" /> Home
              </Link>
              <ChevronRight size={13} color="#999999" />
              <Link href="/blog" style={{ color: '#111111', textDecoration: 'none', fontWeight: '600' }}>
                Blog &amp; Guides
              </Link>
              <ChevronRight size={13} color="#999999" />
              <span style={{ color: '#FF5B3E', fontWeight: '600' }}>{post.category}</span>
            </div>

            <span style={{
              background: '#FF5B3E',
              color: '#ffffff',
              fontSize: '0.775rem',
              fontWeight: '700',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {post.category}
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: '800',
            color: '#111111',
            lineHeight: '1.18',
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em'
          }}>
            {post.title}
          </h1>

          {/* Article Author & Date Meta Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', fontSize: '0.875rem', color: '#555555', paddingTop: '0.5rem', borderTop: '1px solid #EBE4D8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', color: '#111111' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FF5B3E', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>
                {post.author.charAt(0)}
              </div>
              <span>{post.author}</span>
            </div>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} color="#888888" /> {post.date}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={15} color="#888888" /> {post.readTime}
            </span>
          </div>

        </div>
      </section>

      {/* MAIN ARTICLE BODY & SIDEBAR GRID */}
      <div className="container" style={{ marginTop: '2.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }} className="article-layout-grid">
          
          {/* LEFT ARTICLE COLUMN */}
          <main>
            
            {/* Hero Cover Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '420px',
              borderRadius: '24px',
              overflow: 'hidden',
              marginBottom: '2rem',
              boxShadow: '0 12px 32px rgba(17, 17, 17, 0.08)',
              border: '1px solid #EBE4D8'
            }}>
              <img
                src={post.coverImage && post.coverImage.trim() ? post.coverImage : '/images/hero_contractor_pro.jpg'}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Lead Excerpt Summary */}
            {post.excerpt && (
              <div style={{
                background: '#FAF6F0',
                borderLeft: '4px solid #FF5B3E',
                borderRadius: '0 16px 16px 0',
                padding: '1.35rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#111111',
                lineHeight: '1.6',
                marginBottom: '2rem',
                fontFamily: 'var(--font-heading)'
              }}>
                {post.excerpt}
              </div>
            )}

            {/* Main Article Rendered HTML Content */}
            <article 
              className="blog-content-body"
              style={{
                fontSize: '1.075rem',
                color: '#333333',
                lineHeight: '1.85',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {post.content ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <>
                  <p style={{ marginBottom: '1.5rem' }}>
                    San Diego County homeowners face unique local conditions—from coastal salt spray corroding exterior HVAC condensers to high SDG&amp;E peak demand charges. Choosing the right licensed trade professional is critical to protecting your property value and ensuring code compliance with the City of San Diego Development Services Department.
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '800', color: '#111111', margin: '2rem 0 1rem 0' }}>
                    Key Factors to Verify Before Signing Any Contract
                  </h2>
                  <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <li><strong>CSLB Licensing:</strong> Verify active California Contractors State License Board status &amp; class (C-36 for Plumbing, C-20 for HVAC, C-39 for Roofing).</li>
                    <li><strong>Insurance &amp; Bonding:</strong> Ensure the company carries at least $1,000,000 in General Liability and active Workers' Compensation.</li>
                    <li><strong>Upfront Flat-Rate Pricing:</strong> Ask for itemized flat-rate quotes separating equipment costs from labor guarantees.</li>
                    <li><strong>Verified Customer Feedback:</strong> Check authentic Google Reviews and CSLB complaint history before paying any deposit.</li>
                  </ul>
                </>
              )}
            </article>

            {/* Back Button & Category Tags Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #EBE4D8', gap: '1rem' }}>
              <Link
                href="/blog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.2rem',
                  borderRadius: '10px',
                  background: '#111111',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeft size={16} /> Back to All Guides
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={15} color="#888888" />
                <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#666666' }}>Category:</span>
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  style={{
                    background: '#FAF6F0',
                    border: '1px solid #EBE4D8',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#FF5B3E',
                    textDecoration: 'none'
                  }}
                >
                  {post.category}
                </Link>
              </div>
            </div>

          </main>

          {/* RIGHT SIDEBAR COLUMN */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. NEED A LOCAL PRO CARD */}
            <div style={{
              background: '#FAF6F0',
              borderRadius: '20px',
              border: '1px solid #EBE4D8',
              padding: '1.75rem',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFF0ED', color: '#FF5B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Building2 size={22} />
              </div>
              
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '800', color: '#111111', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                Need a Verified San Diego Specialist?
              </h3>
              
              <p style={{ fontSize: '0.875rem', color: '#555555', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Compare verified local trade pros, medical spas, solar contractors, and emergency plumbers with authentic Google reviews.
              </p>

              <Link
                href="/explore"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem' }}
              >
                Browse Directory Pros
              </Link>
            </div>

            {/* 2. RELATED ARTICLES WIDGET */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #EBE4D8',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(17, 17, 17, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: '700', color: '#111111', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F0EAE1' }}>
                <BookOpen size={18} color="#FF5B3E" />
                <span>Related Cost Guides</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {fallbackRelated.map((rel) => (
                  <div key={rel.id} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <Link href={`/blog/${rel.slug}`} title={rel.title} style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'block' }}>
                      <img
                        src={rel.coverImage && rel.coverImage.trim() ? rel.coverImage : '/images/hero_contractor_pro.jpg'}
                        alt={rel.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: '700', color: '#FF5B3E', textTransform: 'uppercase' }}>
                        {rel.category}
                      </span>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111111', lineHeight: '1.35', margin: '0.2rem 0 0.3rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <Link href={`/blog/${rel.slug}`} style={{ textDecoration: 'none', color: '#111111' }}>
                          {rel.title}
                        </Link>
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                        {rel.readTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}

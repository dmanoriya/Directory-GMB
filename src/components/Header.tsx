'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Building2,
  Home, 
  Menu, 
  X, 
  PlusCircle, 
  ChevronDown, 
  Grid, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Star,
  Layers
} from 'lucide-react';
import { Category, LocationCity, BusinessListing } from '@/types/directory';
import { useAuth } from '@/context/AuthContext';
import { fetchCachedBusinesses, fetchCachedCategories, fetchCachedCities } from '@/lib/clientData';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [dynamicCities, setDynamicCities] = useState<LocationCity[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessListing[]>([]);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCachedBusinesses(),
      fetchCachedCategories(),
      fetchCachedCities()
    ]).then(([biz, cats, cits]) => {
      if (!active) return;
      if (biz) setAllBusinesses(biz);
      if (cats) setDynamicCategories(cats);
      if (cits) setDynamicCities(cits);
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  // Live Auto-complete Suggestions for Quick Search Modal
  const modalSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return { bizMatches: [], catMatches: [] };
    const q = searchQuery.toLowerCase().trim();
    const bizMatches = allBusinesses
      .filter(b => b.title.toLowerCase().includes(q) || (b.type && b.type.toLowerCase().includes(q)))
      .slice(0, 4);
    const catMatches = dynamicCategories
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 3);
    return { bizMatches, catMatches };
  }, [searchQuery, allBusinesses, dynamicCategories]);

  // Popular Categories sorted by highest business count descending
  const popularCategories = useMemo(() => {
    return [...dynamicCategories].sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [dynamicCategories]);

  // Popular Cities sorted by highest business count descending
  const popularCities = useMemo(() => {
    return [...dynamicCities].sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [dynamicCities]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Keyboard Shortcut Cmd+K / Ctrl+K listener for quick search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 180);
  };

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className={`sticky-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          
          {/* LEFT: Simple & Sober Brand Logo: LocalNest */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(17, 17, 17, 0.15)',
              position: 'relative',
              flexShrink: 0
            }}>
              <Home size={20} color="#ffffff" />
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#FF5B3E',
                border: '2px solid #ffffff'
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#111111',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap'
            }}>
              Local<span style={{ color: '#FF5B3E' }}>Nest.</span>
            </span>
          </Link>

          {/* CENTER: Clean, Balanced Short Desktop Navigation */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '1.8rem' }} className="desktop-nav">
            <Link href="/" className="nav-link-item">
              Home
            </Link>

            {/* COMPACT DYNAMIC MEGA MENU */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={handleMouseEnterMega}
              onMouseLeave={handleMouseLeaveMega}
            >
              <button 
                className="nav-link-item"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Browse Markets <ChevronDown size={14} style={{ transition: 'transform 200ms ease', transform: megaMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {megaMenuOpen && (
                <div 
                  className="mega-menu-popup"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    left: '-20px',
                    width: '540px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -10px rgba(17, 17, 17, 0.15)',
                    border: '1px solid #DEDEDE',
                    padding: '1.25rem',
                    zIndex: 200,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.25rem'
                  }}
                >
                  
                  {/* Left Column: Trade Categories */}
                  <div>
                    <div style={{
                      fontSize: '0.725rem',
                      fontWeight: '800',
                      color: '#FF5B3E',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <Grid size={13} color="#FF5B3E" /> Popular Categories
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {popularCategories.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/explore?category=${cat.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.55rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            color: '#111111',
                            transition: 'all 120ms ease'
                          }}
                          className="mega-menu-row"
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#111111',
                            background: '#FFD84D',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px',
                            fontWeight: '700',
                            marginLeft: '0.4rem',
                            flexShrink: 0
                          }}>
                            {cat.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #EBE4D8' }}>
                      <Link
                        href="/categories"
                        onClick={() => setMegaMenuOpen(false)}
                        style={{
                          fontSize: '0.775rem',
                          fontWeight: '700',
                          color: '#FF5B3E',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          textDecoration: 'none'
                        }}
                      >
                        All Categories <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: San Diego Hubs */}
                  <div style={{ borderLeft: '1px solid #EBE4D8', paddingLeft: '1.15rem' }}>
                    <div style={{
                      fontSize: '0.725rem',
                      fontWeight: '800',
                      color: '#FF5B3E',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <MapPin size={13} color="#FF5B3E" /> San Diego Hubs
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {popularCities.slice(0, 8).map((city) => (
                        <Link
                          key={city.id}
                          href={`/${city.stateSlug || 'ca'}/${city.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.55rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            color: '#111111',
                            transition: 'all 120ms ease'
                          }}
                          className="mega-menu-row"
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#666666',
                            background: '#f4f4f4',
                            border: '1px solid #DEDEDE',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px',
                            fontWeight: '600',
                            marginLeft: '0.4rem',
                            flexShrink: 0
                          }}>
                            {city.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #EBE4D8' }}>
                      <Link
                        href="/locations"
                        onClick={() => setMegaMenuOpen(false)}
                        style={{
                          fontSize: '0.775rem',
                          fontWeight: '700',
                          color: '#111111',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          textDecoration: 'none'
                        }}
                      >
                        All Neighborhoods <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <Link href="/explore" className="nav-link-item">
              Explore Directory
            </Link>

            <Link href="/blog" className="nav-link-item">
              Blog &amp; Guides
            </Link>
          </nav>

          {/* RIGHT: Search Button, Login, Register & + Add Business Actions */}
          <div style={{ display: 'none', alignItems: 'center', gap: '0.65rem' }} className="desktop-actions">
            
            {/* Search Trigger Button */}
            <button 
              onClick={() => setSearchModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8f8f8',
                border: '1px solid #DEDEDE',
                padding: '0.45rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.825rem',
                color: '#666666',
                transition: 'all 150ms ease',
                cursor: 'pointer'
              }}
              className="header-search-btn"
            >
              <Search size={14} color="#666666" />
              <span>Search...</span>
              <span style={{
                background: '#ffffff',
                padding: '0.1rem 0.3rem',
                borderRadius: '4px',
                border: '1px solid #DEDEDE',
                fontSize: '0.65rem',
                fontWeight: '700',
                color: '#888888'
              }}>
                ⌘K
              </span>
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link href="/dashboard" className="btn-header-yellow" style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}>
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <Link href="/add-business" className="btn-header-cta" style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}>
                  <PlusCircle size={14} /> + Add Business
                </Link>
                <button
                  onClick={logout}
                  title="Logout Account"
                  className="btn-header-ghost"
                  style={{ padding: '0.45rem 0.65rem' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/login" className="btn-header-ghost" style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}>
                  Login
                </Link>

                <Link href="/register" className="btn-header-cta" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Quick Action Buttons Group (Search Icon + Menu Toggle) */}
          <div style={{ alignItems: 'center', gap: '0.45rem' }} className="mobile-only-controls">
            
            {/* Mobile Header Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid #DEDEDE',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(17, 17, 17, 0.05)',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                flexShrink: 0
              }}
              className="mobile-search-btn"
              aria-label="Open Quick Search"
            >
              <Search size={18} color="#111111" />
            </button>

            {/* Mobile Toggle Button (Clean White Badge with Custom 2-Bar Icon) */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(prev => !prev);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid #DEDEDE',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(17, 17, 17, 0.05)',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 10005,
                flexShrink: 0
              }}
              className="mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X size={20} color="#111111" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '18px', alignItems: 'center' }}>
                  <span style={{ display: 'block', width: '18px', height: '2px', background: '#111111', borderRadius: '2px' }} />
                  <span style={{ display: 'block', width: '12px', height: '2px', background: '#FF5B3E', borderRadius: '2px' }} />
                </div>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ANIMATED RIGHT-SIDE MOBILE & TABLET DRAWER (Mounted via React Portal) */}
      {mounted && mobileMenuOpen && createPortal(
        <>
          {/* Backdrop Blur Overlay (zIndex below Panel) */}
          <div 
            className="mobile-drawer-overlay"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999990,
              background: 'rgba(17, 17, 17, 0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          {/* Right Slide-In Panel (100dvh Locked Flex Layout) */}
          <div 
            className="mobile-drawer-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85vw',
              maxWidth: '320px',
              height: '100dvh',
              maxHeight: '100%',
              zIndex: 999999,
              background: '#ffffff',
              boxShadow: '-8px 0 36px rgba(0, 0, 0, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            {/* 1. Fixed Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              borderBottom: '1px solid #EBE4D8',
              background: '#ffffff',
              flexShrink: 0
            }}>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Home size={16} color="#ffffff" />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: '#111111' }}>
                  Local<span style={{ color: '#FF5B3E' }}>Nest.</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #DEDEDE',
                  background: '#f8f8f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close navigation menu"
              >
                <X size={18} color="#111111" />
              </button>
            </div>

            {/* 2. Middle Scrollable Body Content */}
            <div style={{
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              flex: '1 1 0%',
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>

              {/* Main Page Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Navigation
                </div>
                
                <Link 
                  href="/explore" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: '600', color: '#111111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f4f4f4' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Grid size={16} color="#FF5B3E" /> Explore Directory
                  </span>
                  <ArrowRight size={14} color="#888888" />
                </Link>

                <Link 
                  href="/categories" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: '600', color: '#111111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f4f4f4' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Building2 size={16} color="#FF5B3E" /> All Categories
                  </span>
                  <ArrowRight size={14} color="#888888" />
                </Link>

                <Link 
                  href="/locations" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: '600', color: '#111111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f4f4f4' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={16} color="#FF5B3E" /> San Diego Neighborhoods
                  </span>
                  <ArrowRight size={14} color="#888888" />
                </Link>

                <Link 
                  href="/blog" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: '600', color: '#111111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f4f4f4' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={16} color="#FF5B3E" /> Blog &amp; Local Guides
                  </span>
                  <ArrowRight size={14} color="#888888" />
                </Link>

                <Link 
                  href="/claim-listing" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: '600', color: '#111111', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <PlusCircle size={16} color="#FF5B3E" /> Claim Business Profile
                  </span>
                  <ArrowRight size={14} color="#888888" />
                </Link>
              </div>

              {/* Popular Categories Grid (Bounded to Drawer Width) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#FF5B3E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Popular Categories
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', width: '100%', minWidth: 0 }}>
                  {popularCategories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/explore?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        background: '#FAF6F0',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '500',
                        color: '#111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #EBE4D8',
                        textDecoration: 'none',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>{cat.name}</span>
                      <span style={{ color: '#FF5B3E', fontWeight: '800', fontSize: '0.7rem', marginLeft: '0.2rem', flexShrink: 0 }}>{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Fixed Bottom Footer (ALWAYS VISIBLE ON ALL PHONES) */}
            <div style={{
              padding: '0.85rem 1.15rem 1.15rem',
              borderTop: '1px solid #EBE4D8',
              background: '#ffffff',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)'
            }}>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-header-yellow" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/add-business" onClick={() => setMobileMenuOpen(false)} className="btn-header-cta" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
                    <PlusCircle size={16} /> + Add Your Business
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="btn-header-ghost"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.55rem' }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-header-ghost" style={{ justifyContent: 'center', padding: '0.65rem', textAlign: 'center', fontWeight: '700' }}>
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-header-cta" style={{ justifyContent: 'center', padding: '0.65rem', textAlign: 'center', fontWeight: '700' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* QUICK SEARCH MODAL */}
      {searchModalOpen && (
        <div className="modal-overlay" onClick={() => setSearchModalOpen(false)} style={{ zIndex: 10000 }}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={20} color="#FF5B3E" />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700', color: '#111111' }}>
                  Search San Diego Directory
                </h3>
              </div>
              <button onClick={() => setSearchModalOpen(false)} style={{ color: '#888888', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#FF5B3E' }} />
              <input
                type="text"
                placeholder="Search Medical Spas, Emergency Plumbers, Solar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setSearchModalOpen(false);
                    window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.85rem 2.5rem 0.85rem 2.75rem',
                  borderRadius: '12px',
                  border: '2px solid #FF5B3E',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#111111',
                  fontFamily: 'var(--font-primary)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* LIVE AUTOCOMPLETE SUGGESTIONS WHEN TYPING */}
            {searchQuery.trim() ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto' }}>
                {modalSuggestions.catMatches.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                      Matching Categories
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {modalSuggestions.catMatches.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/explore?category=${cat.slug}`}
                          onClick={() => setSearchModalOpen(false)}
                          style={{
                            padding: '0.6rem 0.85rem',
                            borderRadius: '10px',
                            background: '#FAF6F0',
                            border: '1px solid #EBE4D8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            textDecoration: 'none',
                            color: '#111111',
                            fontSize: '0.875rem'
                          }}
                        >
                          <Layers size={16} color="#FF5B3E" />
                          <span style={{ fontWeight: '600', flex: 1 }}>{cat.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#888888', background: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #EBE4D8' }}>
                            {cat.count} pros
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {modalSuggestions.bizMatches.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                      Verified San Diego Businesses
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {modalSuggestions.bizMatches.map((biz) => (
                        <Link
                          key={biz.id}
                          href={`/listing/${biz.slug}`}
                          onClick={() => setSearchModalOpen(false)}
                          style={{
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            background: '#ffffff',
                            border: '1px solid #EBE4D8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textDecoration: 'none',
                            color: '#111111',
                            transition: 'border-color 150ms'
                          }}
                        >
                          <Building2 size={16} color="#111111" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {biz.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                              {biz.type} • {biz.city}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.775rem', fontWeight: '700', color: '#111111' }}>
                            <Star size={13} color="#f59e0b" fill="#f59e0b" /> {biz.rating || '4.9'}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {modalSuggestions.catMatches.length === 0 && modalSuggestions.bizMatches.length === 0 && (
                  <div style={{ padding: '1.25rem', textAlign: 'center', color: '#888888', fontSize: '0.85rem' }}>
                    No matching business or category found for &quot;{searchQuery}&quot;
                  </div>
                )}

                <Link
                  href={`/explore?q=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => setSearchModalOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: '#FFD84D',
                    color: '#111111',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    marginTop: '0.25rem'
                  }}
                >
                  View All Search Results for &quot;{searchQuery}&quot; <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
                  Popular Searches in San Diego
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {['Skin Medical Spa', 'Licensed Plumber', 'Solar & Battery', 'HVAC Air Conditioning', 'Auto Detailing'].map((tag) => (
                    <Link
                      key={tag}
                      href={`/explore?q=${encodeURIComponent(tag)}`}
                      onClick={() => setSearchModalOpen(false)}
                      style={{
                        background: '#FAF6F0',
                        border: '1px solid #EBE4D8',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '999px',
                        fontSize: '0.825rem',
                        color: '#111111',
                        fontWeight: '600',
                        transition: 'all 120ms ease'
                      }}
                      className="search-modal-tag"
                    >
                      🔍 {tag}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .mega-menu-row:hover {
          background: #FAF6F0 !important;
          color: #FF5B3E !important;
        }
        .header-search-btn:hover {
          border-color: #FF5B3E !important;
          background: #ffffff !important;
        }
        .search-modal-tag:hover {
          background: #FFD84D !important;
          border-color: #FFD84D !important;
        }
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
        @media (min-width: 1025px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </>
  );
}

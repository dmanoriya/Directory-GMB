'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Wrench,
  Thermometer,
  Home,
  Trees,
  Sun,
  Bug,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Sparkles,
  ChevronDown,
  Check,
  Building2,
  Star,
  X,
  Layers,
  Calculator,
  Camera,
  Rocket,
  Droplets,
  Hammer,
  Car,
  ShoppingBag,
  Briefcase,
  Award
} from 'lucide-react';
import { Category, LocationCity, BusinessListing, BlogPost } from '@/types/directory';
import { MOCK_CATEGORIES, MOCK_CITIES, MOCK_BUSINESSES, MOCK_BLOG_POSTS } from '@/data/mockData';
import { fetchCachedBusinesses, fetchCachedCategories, fetchCachedCities, fetchCachedPosts } from '@/lib/clientData';

// Category Dynamic Icon & Soft Color Palette Resolver (Zero Yellow Overload)
const getCategoryIconAndColor = (name: string, iconKey?: string) => {
  const n = name.toLowerCase();
  
  if (n.includes('accountant') || n.includes('accounting') || n.includes('tax') || n.includes('finance') || n.includes('cpa')) {
    return {
      icon: <Calculator size={26} color="#0284C7" />,
      bg: '#E0F2FE',
      badgeBg: '#F0F9FF',
      badgeColor: '#0369A1'
    };
  }
  if (n.includes('adver') || n.includes('market') || n.includes('photo') || n.includes('media')) {
    return {
      icon: <Camera size={26} color="#7C3AED" />,
      bg: '#F3E8FF',
      badgeBg: '#FAF5FF',
      badgeColor: '#6D28D9'
    };
  }
  if (n.includes('aero') || n.includes('space') || n.includes('fly') || n.includes('aviation')) {
    return {
      icon: <Rocket size={26} color="#2563EB" />,
      bg: '#DBEAFE',
      badgeBg: '#EFF6FF',
      badgeColor: '#1D4ED8'
    };
  }
  if (n.includes('spa') || n.includes('skin') || n.includes('beauty') || n.includes('health') || n.includes('med')) {
    return {
      icon: <Sparkles size={26} color="#EC4899" />,
      bg: '#FCE7F3',
      badgeBg: '#FDF2F8',
      badgeColor: '#BE185D'
    };
  }
  if (n.includes('plumb') || n.includes('water') || n.includes('drain')) {
    return {
      icon: <Droplets size={26} color="#0284C7" />,
      bg: '#E0F2FE',
      badgeBg: '#F0F9FF',
      badgeColor: '#0369A1'
    };
  }
  if (n.includes('electric') || n.includes('solar') || n.includes('power') || n.includes('zap')) {
    return {
      icon: <Zap size={26} color="#D97706" />,
      bg: '#FEF3C7',
      badgeBg: '#FFFBEB',
      badgeColor: '#B45309'
    };
  }
  if (n.includes('hvac') || n.includes('air') || n.includes('cool') || n.includes('heat')) {
    return {
      icon: <Thermometer size={26} color="#059669" />,
      bg: '#D1FAE5',
      badgeBg: '#ECFDF5',
      badgeColor: '#047857'
    };
  }
  if (n.includes('contract') || n.includes('build') || n.includes('remodel') || n.includes('home') || n.includes('roof')) {
    return {
      icon: <Hammer size={26} color="#EA580C" />,
      bg: '#FFEDD5',
      badgeBg: '#FFF7ED',
      badgeColor: '#C2410C'
    };
  }
  if (n.includes('auto') || n.includes('car') || n.includes('vehicle') || n.includes('detail')) {
    return {
      icon: <Car size={26} color="#DC2626" />,
      bg: '#FEE2E2',
      badgeBg: '#FEF2F2',
      badgeColor: '#B91C1C'
    };
  }
  if (n.includes('entertain') || n.includes('event') || n.includes('store') || n.includes('shop')) {
    return {
      icon: <ShoppingBag size={26} color="#8B5CF6" />,
      bg: '#EDE9FE',
      badgeBg: '#F5F3FF',
      badgeColor: '#7C3AED'
    };
  }
  
  // Dynamic color palette per category hash
  const palettes = [
    { icon: <Building2 size={26} color="#2563EB" />, bg: '#DBEAFE', badgeBg: '#EFF6FF', badgeColor: '#1D4ED8' },
    { icon: <Layers size={26} color="#059669" />, bg: '#D1FAE5', badgeBg: '#ECFDF5', badgeColor: '#047857' },
    { icon: <Briefcase size={26} color="#D97706" />, bg: '#FEF3C7', badgeBg: '#FFFBEB', badgeColor: '#B45309' },
    { icon: <Award size={26} color="#EC4899" />, bg: '#FCE7F3', badgeBg: '#FDF2F8', badgeColor: '#BE185D' }
  ];
  const hash = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % palettes.length;
  return palettes[hash];
};
import BusinessCard from '@/components/BusinessCard';
import SeoAuditModal from '@/components/SeoAuditModal';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={24} />,
  Wrench: <Wrench size={24} />,
  Thermometer: <Thermometer size={24} />,
  Home: <Home size={24} />,
  Zap: <Zap size={24} />,
  Trees: <Trees size={24} />,
  Sun: <Sun size={24} />,
  Bug: <Bug size={24} />
};

const TESTIMONIALS_ROW1 = [
  {
    id: 1,
    name: 'Lily Woods',
    location: 'San Diego, CA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: 'Found SDBotox in Pacific Beach through LocalNest! The Google reviews were 100% authentic and booking my appointment was seamless.'
  },
  {
    id: 2,
    name: 'Andy Smith',
    location: 'La Jolla, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'Had an emergency plumbing leak at 9 PM. Found Elite Plumbing on LocalNest within 2 minutes. They arrived in under 30 mins and fixed it!'
  },
  {
    id: 3,
    name: 'Kelly Sung',
    location: 'Carlsbad, CA',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    text: 'LocalNest made comparing solar installers in North County so easy. Clear Google ratings and verified licenses made our decision simple.'
  },
  {
    id: 4,
    name: 'John Carter',
    location: 'Downtown San Diego, CA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    text: 'Getting our store listed on LocalNest boosted our local map visibility and brought 45+ new foot traffic customers in our first month.'
  },
  {
    id: 5,
    name: 'Elena Rostova',
    location: 'Del Mar, CA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    text: 'The medical spa listings are top tier. I love seeing authentic Google review photos and practitioner credentials before making an appointment.'
  },
  {
    id: 6,
    name: 'Marcus Vance',
    location: 'Chula Vista, CA',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    text: 'Extremely helpful for finding top HVAC contractors during summer heatwaves. Honest upfront pricing and fast local responses.'
  }
];

const TESTIMONIALS_ROW2 = [
  {
    id: 7,
    name: 'Arnold Graham',
    location: 'Pacific Beach, CA',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    text: 'LocalNest is my go-to directory for local home services in San Diego. Every contractor listed has verified Google reviews and transparent pricing.'
  },
  {
    id: 8,
    name: 'Matt Cannon',
    location: 'Encinitas, CA',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    text: 'We listed our auto detailing shop 3 months ago and our customer call volume doubled! Best directory investment for local pros.'
  },
  {
    id: 9,
    name: 'Patrick Meyers',
    location: 'Coronado, CA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    text: 'The map search and category filters are smooth and intuitive. Found a fantastic roofing team in Coronado who finished early.'
  },
  {
    id: 10,
    name: 'Sophie Moore',
    location: 'North Park, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    text: 'Saved me hours of searching on Google Maps. Having verified local pros with authentic customer ratings all in one directory is a game changer.'
  },
  {
    id: 11,
    name: 'David Rodriguez',
    location: 'San Marcos, CA',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    text: 'Super transparent review system. I checked the Google Maps ratings before hiring an emergency electrician and they exceeded expectations.'
  },
  {
    id: 12,
    name: 'Chloe Bennett',
    location: 'Solana Beach, CA',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    text: 'LocalNest connects you directly with top local business owners without third-party middleman markups. Highly recommended!'
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearchFilter, setCatSearchFilter] = useState('');

  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<BusinessListing[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [dynamicCities, setDynamicCities] = useState<LocationCity[]>([]);
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);

  const keywordRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCachedBusinesses(),
      fetchCachedCategories(),
      fetchCachedCities(),
      fetchCachedPosts()
    ]).then(([biz, cats, cits, posts]) => {
      if (!active) return;
      if (Array.isArray(biz)) setAllBusinesses(biz);
      if (Array.isArray(cats)) setDynamicCategories(cats);
      if (Array.isArray(cits)) setDynamicCities(cits);
      if (Array.isArray(posts)) setDynamicPosts(posts);
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (keywordRef.current && !keywordRef.current.contains(e.target as Node)) {
        setShowKeywordSuggestions(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const featuredListings = allBusinesses.slice(0, 6);

  // Live Auto-complete Keyword Suggestions
  const keywordSuggestions = useMemo(() => {
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

  // Filter Categories for Category Search Dropdown
  const filteredCategories = useMemo(() => {
    if (!catSearchFilter.trim()) return dynamicCategories;
    const q = catSearchFilter.toLowerCase().trim();
    return dynamicCategories.filter(c => c.name.toLowerCase().includes(q));
  }, [dynamicCategories, catSearchFilter]);

  const selectedCategoryObj = useMemo(() => {
    return dynamicCategories.find(c => c.slug === selectedCategory);
  }, [dynamicCategories, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    window.location.href = `/explore?${params.toString()}`;
  };

  return (
    <>
      {/* HERO SECTION (Custom Warm Editorial Aesthetic Tailored to Locable Directory) */}
      <section style={{
        position: 'relative',
        background: '#FAF6F0',
        color: '#111111',
        paddingTop: '3.5rem',
        paddingBottom: '6rem',
        overflow: 'visible',
        borderBottom: '1px solid #EBE4D8'
      }}>
        {/* Background Vector Line Art Graphic Clip Wrapper */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '550px',
            height: '240px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='500' height='200' viewBox='0 0 500 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 180H480M50 180V120H90V180M110 180V90H160V180M180 180V140H220V180M240 180V70H300V180M320 180V110H370V180M390 180V130H440V180' stroke='%23E5DDD0' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom left',
            opacity: 0.45
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-grid-row" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '3.5rem',
            alignItems: 'center'
          }}>
            
            {/* LEFT COLUMN: Editorial Text & Functional Business Search Form */}
            <div style={{ gridColumn: 'span 7' }} className="hero-text-col">
              
              {/* Top Tagline */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#FF5B3E',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                SAN DIEGO'S #1 VERIFIED DIRECTORY ...
              </div>

              {/* Main Editorial Display Headline in Instrument Serif */}
              <h1 className="hero-title">
                Discover Verified Local <span style={{ fontStyle: 'italic' }}>Professionals.</span>
              </h1>

              {/* Subheading */}
              <p style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.05rem',
                color: '#555555',
                lineHeight: '1.65',
                maxWidth: '560px',
                marginBottom: '2.25rem'
              }}>
                Connect with top-rated medical spas, licensed plumbers, HVAC contractors, solar installers, and verified local business specialists backed by authentic Google reviews.
              </p>

              {/* FULLY FUNCTIONAL MULTI-FIELD SEARCH FORM BAR */}
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  background: '#ffffff',
                  padding: '0.45rem',
                  borderRadius: '18px',
                  boxShadow: '0 16px 36px rgba(17, 17, 17, 0.08)',
                  border: '1px solid #EBE4D8',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1.4fr) minmax(150px, 1.2fr) auto',
                  gap: '0.4rem',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 50
                }}
                className="hero-search-form"
              >
                {/* Field 1: Service / Keyword Input with Autocomplete Suggestions */}
                <div ref={keywordRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} color="#888888" style={{ position: 'absolute', left: '14px' }} />
                  <input
                    type="text"
                    placeholder="Med Spa, Plumber, Solar..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowKeywordSuggestions(true);
                    }}
                    onFocus={() => setShowKeywordSuggestions(true)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 0.85rem 0.85rem 2.5rem',
                      border: 'none',
                      borderRight: '1px solid #EBE4D8',
                      fontSize: '0.9rem',
                      color: '#111111',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'var(--font-primary)'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#999999', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* AUTOCOMPLETE SUGGESTIONS POPUP PANEL */}
                  {showKeywordSuggestions && (keywordSuggestions.bizMatches.length > 0 || keywordSuggestions.catMatches.length > 0) && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      left: 0,
                      right: 0,
                      background: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #DEDEDE',
                      zIndex: 9999,
                      overflow: 'hidden',
                      maxHeight: '320px',
                      overflowY: 'auto'
                    }}>
                      {keywordSuggestions.catMatches.length > 0 && (
                        <div style={{ padding: '0.5rem 0' }}>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.725rem', fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Matching Categories
                          </div>
                          {keywordSuggestions.catMatches.map(cat => (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(cat.slug);
                                setSearchQuery('');
                                setShowKeywordSuggestions(false);
                              }}
                              style={{
                                padding: '0.6rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: '#111111',
                                transition: 'background 120ms'
                              }}
                              className="suggestion-row"
                            >
                              <Layers size={15} color="#FF5B3E" />
                              <span style={{ fontWeight: '600' }}>{cat.name}</span>
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#888888', background: '#f5f5f5', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{cat.count} pros</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {keywordSuggestions.bizMatches.length > 0 && (
                        <div style={{ padding: '0.5rem 0', borderTop: keywordSuggestions.catMatches.length > 0 ? '1px solid #f0f0f0' : 'none' }}>
                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.725rem', fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Verified Local Businesses
                          </div>
                          {keywordSuggestions.bizMatches.map(biz => (
                            <Link
                              key={biz.id}
                              href={`/listing/${biz.slug}`}
                              onClick={() => setShowKeywordSuggestions(false)}
                              style={{
                                padding: '0.6rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.65rem',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: '#111111',
                                transition: 'background 120ms'
                              }}
                              className="suggestion-row"
                            >
                              <Building2 size={15} color="#111111" />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{biz.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666666' }}>{biz.type} • {biz.city}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: '700', color: '#111111' }}>
                                <Star size={12} color="#f59e0b" fill="#f59e0b" /> {biz.rating || '4.9'}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Field 2: Custom Searchable Category Dropdown */}
                <div ref={catDropdownRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: selectedCategoryObj ? '#111111' : '#666666',
                      fontWeight: selectedCategoryObj ? '600' : '400',
                      userSelect: 'none'
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                      {selectedCategoryObj ? selectedCategoryObj.name : 'All Categories'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.4rem' }}>
                      {selectedCategory && (
                        <X
                          size={14}
                          color="#888888"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory('');
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      <ChevronDown size={15} color="#888888" />
                    </div>
                  </div>

                  {/* CATEGORY SEARCH DROPDOWN POPUP */}
                  {catDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      left: 0,
                      right: 0,
                      width: '100%',
                      maxWidth: '340px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #DEDEDE',
                      zIndex: 9999,
                      padding: '0.75rem',
                      maxHeight: '340px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {/* Search Bar inside Category Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <Search size={14} color="#888888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={catSearchFilter}
                          onChange={(e) => setCatSearchFilter(e.target.value)}
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.5rem 0.5rem 2rem',
                            borderRadius: '8px',
                            border: '1px solid #DEDEDE',
                            fontSize: '0.825rem',
                            outline: 'none',
                            background: '#f9f9f9'
                          }}
                        />
                      </div>

                      {/* Filtered Category List */}
                      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div
                          onClick={() => {
                            setSelectedCategory('');
                            setCatDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: !selectedCategory ? '#FFD84D' : 'transparent',
                            fontWeight: !selectedCategory ? '700' : '500',
                            color: '#111111'
                          }}
                          className="cat-select-option"
                        >
                          <span>All Categories</span>
                          {!selectedCategory && <Check size={14} color="#111111" />}
                        </div>

                        {filteredCategories.map(cat => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.slug);
                              setCatDropdownOpen(false);
                              setCatSearchFilter('');
                            }}
                            style={{
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: selectedCategory === cat.slug ? '#FFD84D' : 'transparent',
                              fontWeight: selectedCategory === cat.slug ? '700' : '500',
                              color: '#111111'
                            }}
                            className="cat-select-option"
                          >
                            <span>{cat.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#666666' }}>({cat.count})</span>
                          </div>
                        ))}

                        {filteredCategories.length === 0 && (
                          <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#888888' }}>
                            No matching category found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  style={{
                    background: '#FFD84D',
                    color: '#111111',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: '700',
                    fontSize: '0.925rem',
                    padding: '0.85rem 1.6rem',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'transform 150ms ease, background 150ms ease',
                    boxShadow: '0 4px 14px rgba(255, 216, 77, 0.4)'
                  }}
                >
                  Search Directory
                </button>
              </form>

            </div>

            {/* RIGHT COLUMN: Asymmetric Image Collage & Rotating Stamp Badge FLOATING OVER CARDS */}
            <div style={{ gridColumn: 'span 5', position: 'relative' }} className="hero-collage-col">
              
              {/* ROTATING STAMP BADGE ("VERIFIED LOCAL BUSINESS DIRECTORY") FLOATING ABOVE IMAGE CARDS */}
              <div style={{
                position: 'absolute',
                left: '-36px',
                top: '48%',
                transform: 'translateY(-50%)',
                zIndex: 40,
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: '#FF5B3E',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(255, 91, 62, 0.45)',
                border: '3px solid #FAF6F0',
                pointerEvents: 'none'
              }}>
                <Sparkles size={22} color="#ffffff" />
                <svg
                  viewBox="0 0 100 100"
                  className="spin-rotating-ring"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text fill="#ffffff" fontSize="7.8" fontWeight="800" letterSpacing="1.9">
                    <textPath href="#circlePath">
                      VERIFIED LOCAL BUSINESS DIRECTORY •
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* ASYMMETRIC BUSINESS IMAGE COLLAGE GRID WITH PERFECT 28PX BORDER RADIUS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '1rem',
                alignItems: 'center',
                transform: 'skewX(-7deg)',
                transformOrigin: 'center center',
                position: 'relative',
                zIndex: 10
              }}>
                
                {/* Left Stacked Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Top Right Medical Spa Card (100% Perfect Rounded Corners) */}
                  <div style={{
                    position: 'relative',
                    height: '215px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(17, 17, 17, 0.12)',
                    background: '#ffffff'
                  }}>
                    <img
                      src="/images/hero_medical_spa.jpg"
                      alt="Modern Luxury Medical Spa Interior"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'skewX(7deg) scale(1.22)',
                        transformOrigin: 'center center'
                      }}
                    />
                  </div>

                  {/* Bottom Left Licensed Contractor Card (100% Perfect Rounded Corners) */}
                  <div style={{
                    position: 'relative',
                    height: '215px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(17, 17, 17, 0.12)',
                    background: '#ffffff'
                  }}>
                    <img
                      src="/images/hero_contractor_pro.jpg"
                      alt="Licensed Trade Contractor & Service Specialist"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'skewX(7deg) scale(1.22)',
                        transformOrigin: 'center center'
                      }}
                    />
                  </div>

                </div>

                {/* Right Vertical Tall Storefront Card (100% Perfect Rounded Corners) */}
                <div style={{
                  position: 'relative',
                  height: '445px',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 36px rgba(17, 17, 17, 0.15)',
                  background: '#ffffff'
                }}>
                  <img
                    src="/images/hero_storefront.jpg"
                    alt="Luxury Local Business Storefront"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'skewX(7deg) scale(1.22)',
                      transformOrigin: 'center center'
                    }}
                  />
                </div>

              </div>

            </div>

          </div>
        </div>

        <style jsx>{`
          @keyframes spinRing {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes drawStroke {
            0% { stroke-dashoffset: 480; }
            100% { stroke-dashoffset: 0; }
          }
          .suggestion-row:hover {
            background: #fff8f6 !important;
          }
          .cat-select-option:hover {
            background: #fff3ce !important;
          }
          @media (max-width: 991px) {
            .hero-text-col { grid-column: span 12 !important; }
            .hero-collage-col { grid-column: span 12 !important; marginTop: 2.5rem; }
            .hero-search-form { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* POPULAR CATEGORIES (Pure White Cards on Soft Luxury Warm Canvas) */}
      <section style={{ padding: '5rem 0', background: '#F9F6F0', borderBottom: '1px solid #EBE4D8' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.825rem',
              fontWeight: '700',
              color: '#FF5B3E',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}>
              EXPLORE LOCAL DIRECTORY CATEGORIES
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: '#111111', lineHeight: '1.18', marginBottom: '0.85rem' }}>
              Browse Verified San Diego Trades.
            </h2>
            <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1rem', color: '#555555', lineHeight: '1.6' }}>
              Discover top-rated specialists, licensed contractors, medical spas, and local service providers backed by verified customer reviews.
            </p>
          </div>

          {dynamicCategories.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px dashed #EBE4D8', maxWidth: '560px', margin: '0 auto' }}>
              <Building2 size={36} color="#999999" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700', color: '#111111', marginBottom: '0.5rem' }}>
                No Categories Found in WordPress
              </h3>
              <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Your directory currently has no categories. Upload listings or create terms in WP-Admin to populate categories here.
              </p>
            </div>
          ) : (
            <div className="homepage-category-grid">
              {dynamicCategories.slice(0, 8).map((cat) => {
                const theme = getCategoryIconAndColor(cat.name, cat.icon);
                return (
                  <Link
                    key={cat.id}
                    href={`/explore?category=${cat.slug}`}
                    style={{
                      background: '#ffffff',
                      padding: '1.65rem 1.25rem',
                      borderRadius: '20px',
                      border: '1px solid #EBE4D8',
                      boxShadow: '0 10px 30px rgba(17, 17, 17, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      textDecoration: 'none',
                      transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative'
                    }}
                    className="category-card-item"
                  >
                    <div style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '16px',
                      background: theme.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.1rem',
                      transition: 'transform 200ms ease'
                    }} className="category-icon-box">
                      {theme.icon}
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: '#111111', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                      {cat.name}
                    </h3>
                    
                    <div style={{
                      background: theme.badgeBg,
                      color: theme.badgeColor,
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.725rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      marginBottom: '0.85rem'
                    }}>
                      {cat.count} Verified Pros
                    </div>

                    <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.825rem', color: '#666666', lineHeight: '1.5', margin: 0 }}>
                      {cat.description || `${cat.name} local specialists`}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              href="/categories"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.85rem',
                borderRadius: '14px',
                background: '#111111',
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: '0.925rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(17, 17, 17, 0.15)',
                transition: 'transform 180ms ease, background 180ms ease'
              }}
              className="view-all-categories-btn"
            >
              Explore All {dynamicCategories.length} Categories <ArrowRight size={16} color="#ffffff" />
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURED BUSINESSES (Pure Crisp White Canvas with Web App Cards) */}
      <section style={{ padding: '5rem 0', background: '#ffffff', borderBottom: '1px solid #EBE4D8' }}>
        <div className="container">
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '3rem' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.825rem',
                fontWeight: '700',
                color: '#FF5B3E',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem'
              }}>
                HANDPICKED LOCAL PROS
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: '800', color: '#111111', lineHeight: '1.2' }}>
                Featured Verified Businesses.
              </h2>
            </div>

            <Link
              href="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                background: '#FF5B3E',
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 6px 18px rgba(255, 91, 62, 0.25)',
                transition: 'all 180ms ease'
              }}
              className="featured-section-btn"
            >
              Explore All 1,200+ Businesses <ArrowRight size={16} color="#ffffff" />
            </Link>
          </div>

          {featuredListings.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#FAF6F0', borderRadius: '20px', border: '1px solid #EBE4D8', maxWidth: '560px', margin: '0 auto' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700', color: '#111111', marginBottom: '0.5rem' }}>
                No Business Listings Found
              </div>
              <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Your directory is currently loading listings. Refresh or add a business to showcase featured specialists.
              </p>
              <Link
                href="/add-business"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: '#111111',
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  textDecoration: 'none'
                }}
              >
                + Add Your Business
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '1.75rem'
            }}>
              {featuredListings.map((business) => (
                <BusinessCard key={business.placeId} business={business} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* CITIES & LOCATIONS (Top 8 Hubs - Dark Theme Redesign) */}
      <section style={{ padding: '5.5rem 0', background: '#111111', borderTop: '1px solid #222222', borderBottom: '1px solid #222222' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem auto' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.825rem',
              fontWeight: '700',
              color: '#FF5B3E',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}>
              SAN DIEGO DIRECTORY HUBS
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.1rem, 4vw, 3rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.18', marginBottom: '0.85rem' }}>
              Browse Verified Services by City.
            </h2>
            <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1rem', color: '#94A3B8', lineHeight: '1.6' }}>
              Explore top-rated contractors, medical spas, skin care clinics, and local service providers in your neighborhood.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.35rem'
          }}>
            {dynamicCities.slice(0, 8).map((city) => (
              <Link
                key={city.id}
                href={`/${city.stateSlug || 'ca'}/${city.slug}`}
                style={{
                  background: '#18181B',
                  padding: '1.35rem 1.25rem',
                  borderRadius: '20px',
                  border: '1px solid #27272A',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                className="location-card-item dark-location-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(255, 91, 62, 0.12)',
                    border: '1px solid rgba(255, 91, 62, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 200ms ease'
                  }} className="location-icon-box">
                    <MapPin size={22} color="#FF5B3E" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.2rem', lineHeight: '1.2' }}>
                      {city.name}
                    </h3>
                    <span style={{
                      fontSize: '0.775rem',
                      fontWeight: '500',
                      color: '#94A3B8',
                      display: 'inline-block'
                    }}>
                      {city.count} Verified Pros
                    </span>
                  </div>
                </div>

                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#27272A',
                  border: '1px solid #3F3F46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }} className="location-arrow-box">
                  <ArrowRight size={16} color="#FF5B3E" />
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link
              href="/locations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.85rem',
                borderRadius: '14px',
                background: '#FF5B3E',
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: '0.925rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(255, 91, 62, 0.35)',
                transition: 'transform 180ms ease, background 180ms ease'
              }}
              className="view-all-locations-btn dark-cta-btn"
            >
              Explore All Cities ({dynamicCities.length}) <ArrowRight size={16} color="#ffffff" />
            </Link>
          </div>

        </div>
      </section>

      {/* WHAT OUR CUSTOMERS SAY (2-Row Infinite Marquee Slider with Warm Web App Aesthetics) */}
      <section style={{ padding: '5.5rem 0', background: '#F9F6F0', borderTop: '1px solid #EBE4D8', borderBottom: '1px solid #EBE4D8', overflow: 'hidden' }}>
        
        {/* Section Header */}
        <div className="container" style={{ textAlign: 'center', maxWidth: '680px', marginBottom: '3.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.825rem',
            fontWeight: '700',
            color: '#FF5B3E',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
          }}>
            VERIFIED HOMEOWNER & CLIENT REVIEWS
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.1rem, 4vw, 3rem)',
            fontWeight: '800',
            color: '#111111',
            lineHeight: '1.18',
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem'
          }}>
            What Our Community Says.
          </h2>
          <p style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '1rem',
            color: '#555555',
            lineHeight: '1.6'
          }}>
            Real feedback from homeowners, patients, and local residents who hired verified pros on LocalNest.
          </p>
        </div>

        {/* MARQUEE ROW 1: MOVING LEFT */}
        <div className="marquee-container" style={{ marginBottom: '1.25rem' }}>
          <div className="marquee-track-left">
            {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((item, idx) => (
              <div
                key={`row1-${idx}`}
                style={{
                  width: '380px',
                  flexShrink: 0,
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '1.65rem 1.75rem',
                  border: '1px solid #EBE4D8',
                  boxShadow: '0 8px 24px rgba(17, 17, 17, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 200ms ease, boxShadow 200ms ease'
                }}
              >
                <div>
                  {/* Top Rating Stars & Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: '700',
                      color: '#047857',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px'
                    }}>
                      Verified Client
                    </span>
                  </div>

                  {/* Review Text */}
                  <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.925rem', color: '#334155', lineHeight: '1.6', marginBottom: '1.35rem' }}>
                    "{item.text}"
                  </p>
                </div>

                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: '700', color: '#111111', lineHeight: '1.2' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#666666', marginTop: '0.15rem' }}>
                      {item.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MARQUEE ROW 2: MOVING RIGHT */}
        <div className="marquee-container">
          <div className="marquee-track-right">
            {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((item, idx) => (
              <div
                key={`row2-${idx}`}
                style={{
                  width: '380px',
                  flexShrink: 0,
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '1.65rem 1.75rem',
                  border: '1px solid #EBE4D8',
                  boxShadow: '0 8px 24px rgba(17, 17, 17, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 200ms ease, boxShadow 200ms ease'
                }}
              >
                <div>
                  {/* Top Rating Stars & Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: '700',
                      color: '#047857',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px'
                    }}>
                      Verified Client
                    </span>
                  </div>

                  {/* Review Text */}
                  <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.925rem', color: '#334155', lineHeight: '1.6', marginBottom: '1.35rem' }}>
                    "{item.text}"
                  </p>
                </div>

                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: '700', color: '#111111', lineHeight: '1.2' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#666666', marginTop: '0.15rem' }}>
                      {item.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* BROWSE ARTICLES & NEWS (Editorial High-End Layout) */}
      <section style={{ padding: '5.5rem 0', background: '#ffffff', borderBottom: '1px solid #EBE4D8' }}>
        <div className="container">
          
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.825rem',
                fontWeight: '700',
                color: '#FF5B3E',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}>
                LOCAL INSIGHTS & COST GUIDES
              </div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.1rem, 4vw, 3rem)',
                fontWeight: '800',
                color: '#111111',
                lineHeight: '1.18',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem'
              }}>
                Articles, Guides & Hiring Tips.
              </h2>
              <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1rem', color: '#555555', margin: 0, maxWidth: '600px' }}>
                Expert home improvement advice, SDG&E energy rebates, and local market reports.
              </p>
            </div>

            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.65rem',
                borderRadius: '14px',
                background: '#111111',
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: '0.925rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(17, 17, 17, 0.12)',
                transition: 'all 200ms ease'
              }}
              className="featured-section-btn"
            >
              Browse All Articles <ArrowRight size={16} color="#ffffff" />
            </Link>
          </div>

          {/* Grid Layout (Left Main Featured Card + Right 3 Horizontal Rows - Perfectly Aligned Top & Bottom) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2.5rem',
            alignItems: 'stretch'
          }}>

            {/* LEFT SIDE: Featured Hero Article Card */}
            {dynamicPosts.length > 0 && (
              <Link
                href={`/blog/${dynamicPosts[0].slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #EBE4D8',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: '0 8px 30px rgba(17, 17, 17, 0.04)',
                  transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '100%'
                }}
                className="blog-hero-card"
              >
                <div style={{ position: 'relative', width: '100%', height: '310px', overflow: 'hidden' }}>
                  <img
                    src={dynamicPosts[0].coverImage && dynamicPosts[0].coverImage.trim() ? dynamicPosts[0].coverImage : '/images/hero_contractor_pro.jpg'}
                    alt={dynamicPosts[0].title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 300ms ease'
                    }}
                    className="blog-card-img"
                  />
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#FF5B3E',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '999px',
                    boxShadow: '0 4px 12px rgba(255, 91, 62, 0.3)'
                  }}>
                    {dynamicPosts[0].category}
                  </span>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {/* Date & Read Time */}
                    <div style={{ fontSize: '0.825rem', color: '#666666', fontWeight: '500', marginBottom: '0.65rem' }}>
                      {dynamicPosts[0].date} • 6 min read
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.45rem',
                      fontWeight: '800',
                      color: '#111111',
                      lineHeight: '1.3',
                      marginBottom: '0.75rem',
                      letterSpacing: '-0.01em'
                    }} className="blog-title-text">
                      {dynamicPosts[0].title}
                    </h3>

                    {/* Excerpt */}
                    <p style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '0.925rem',
                      color: '#555555',
                      lineHeight: '1.6',
                      marginBottom: '1.25rem'
                    }}>
                      {dynamicPosts[0].excerpt}
                    </p>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#FF5B3E', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: '700', marginTop: 'auto' }}>
                    Read Full Article <ArrowRight size={15} color="#FF5B3E" />
                  </div>
                </div>
              </Link>
            )}

            {/* RIGHT SIDE: 3 Compact Horizontal Post Cards (Equal Height & Stretch) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem', height: '100%' }}>
              {dynamicPosts.slice(1, 4).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    textDecoration: 'none',
                    background: '#ffffff',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '20px',
                    border: '1px solid #EBE4D8',
                    boxShadow: '0 6px 20px rgba(17, 17, 17, 0.03)',
                    transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                    flex: 1
                  }}
                  className="blog-item-card"
                >
                  {/* Thumbnail Image */}
                  <div style={{
                    width: '125px',
                    height: '125px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={post.coverImage && post.coverImage.trim() ? post.coverImage : '/images/hero_contractor_pro.jpg'}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 300ms ease'
                      }}
                      className="blog-card-img"
                    />
                  </div>

                  {/* Post Meta & Title */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: '700',
                        color: '#FF5B3E',
                        background: '#FFF0ED',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px'
                      }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: '0.775rem', color: '#666666', fontWeight: '500' }}>
                        {post.date}
                      </span>
                    </div>

                    <h4 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#111111',
                      lineHeight: '1.35',
                      letterSpacing: '-0.01em',
                      margin: 0
                    }} className="blog-title-text">
                      {post.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* BUSINESS OWNER CTA */}
      <section style={{ padding: '4rem 0', background: '#111111', color: '#ffffff', borderTop: '1px solid #222222' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '700', color: '#ffffff', marginBottom: '0.85rem' }}>
            Own a Local Business? Join Our Verified Directory Today
          </h2>
          <p style={{ fontSize: '1rem', color: '#cccccc', marginBottom: '2rem', lineHeight: '1.55' }}>
            Get discovered by thousands of customers. Manage your reviews, display your credentials, and track your Google Maps rankings.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
            <Link href="/add-business" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.925rem' }}>
              <PlusCircle size={18} /> Add / Claim Listing
            </Link>
            
            <button
              onClick={() => setAuditModalOpen(true)}
              className="btn btn-outline"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.925rem', color: '#ffffff', borderColor: '#444444', background: 'rgba(255,255,255,0.05)' }}
            >
              <TrendingUp size={18} color="#FFD84D" /> Free Local SEO Audit
            </button>
          </div>
        </div>
      </section>

      <SeoAuditModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} />
    </>
  );
}

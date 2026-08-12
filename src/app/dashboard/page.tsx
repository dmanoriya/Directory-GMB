'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Edit3,
  Settings,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Phone,
  Globe,
  MapPin,
  Bell,
  User,
  KeyRound,
  Menu,
  X,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SuggestedEdit } from '@/types/auth';
import { BusinessListing } from '@/types/directory';
import AddBusinessModal from '@/components/AddBusinessModal';
import SuggestEditsModal from '@/components/SuggestEditsModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

interface UserListingItem {
  id: string;
  placeId: string;
  title: string;
  type: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  description?: string;
  workingHours?: string;
  serviceOptions?: string[];
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading, logout, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'edits' | 'settings'>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

  const closeMobileMenu = () => {
    if (isDrawerClosing) return;
    setIsDrawerClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsDrawerClosing(false);
    }, 230);
  };

  const [edits, setEdits] = useState<SuggestedEdit[]>([]);
  const [listings, setListings] = useState<UserListingItem[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Search & Filter states for CRM tables
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedEditListing, setSelectedEditListing] = useState<BusinessListing | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    loadUserData();
  }, [user, loading, router]);

  const loadUserData = () => {
    if (user?.email) {
      setFetchingData(true);
      Promise.all([
        fetch(`/api/user/edits?email=${encodeURIComponent(user.email)}`).then(r => r.json()).catch(() => ({ edits: [] })),
        fetch(`/api/user/listings?email=${encodeURIComponent(user.email)}`).then(r => r.json()).catch(() => ({ listings: [] })),
        fetch(`/api/user/status?email=${encodeURIComponent(user.email)}`).then(r => r.json()).catch(() => ({ accountStatus: user.accountStatus })),
      ]).then(([editsRes, listingsRes, statusRes]) => {
        setEdits(Array.isArray(editsRes.edits) ? editsRes.edits : []);
        setListings(Array.isArray(listingsRes.listings) ? listingsRes.listings : []);
        if (statusRes?.accountStatus && statusRes.accountStatus !== user.accountStatus) {
          login({ ...user, accountStatus: statusRes.accountStatus });
        }
      }).finally(() => setFetchingData(false));
    }
  };

  const handleOpenEditModal = (item: UserListingItem) => {
    const mockBiz: BusinessListing = {
      placeId: item.placeId,
      dataId: item.id,
      slug: item.title.toLowerCase().replace(/\s+/g, '-'),
      title: item.title,
      type: item.type,
      typeSlug: item.type.toLowerCase().replace(/\s+/g, '-'),
      otherTypes: [],
      address: item.address,
      city: item.city,
      citySlug: item.city.toLowerCase().replace(/\s+/g, '-'),
      state: 'CA',
      website: item.website,
      phone: item.phone,
      price: '$$',
      rating: 5.0,
      reviews: 1,
      description: item.description || '',
      openState: 'Open Now',
      workingHours: { days: [], timezone: 'PST' },
      serviceOptions: item.serviceOptions || [],
      thumbnail: '',
      latitude: 32.7157,
      longitude: -117.1611,
      keyword: item.type,
      googleMapsRank: 1
    };
    setSelectedEditListing(mockBiz);
    setEditModalOpen(true);
  };

  if (loading || (!user && fetchingData)) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '240px', height: '50px', borderRadius: '16px', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>Loading your CRM Business Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = edits.filter((e) => e.editStatus === 'pending').length + listings.filter(l => l.status === 'pending').length;
  const approvedCount = edits.filter((e) => e.editStatus === 'approved').length + listings.filter(l => l.status === 'published').length;

  // Listings for CRM table
  const filteredListings = listings;

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredListings.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="crm-portal-container">
      
      {/* ─── 1. DESKTOP COLLAPSIBLE CRM SIDEBAR ─────────────────────────────────── */}
      <aside className="crm-sidebar crm-sidebar-desktop" style={{ width: isSidebarCollapsed ? '78px' : '260px' }}>
        
        {/* Sidebar Brand Header */}
        <div style={{
          padding: isSidebarCollapsed ? '1.25rem 0.5rem' : '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f1f5f9',
          minHeight: '72px'
        }}>
          {!isSidebarCollapsed ? (
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
                L
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', lineHeight: '1.1' }}>
                  Locable
                </div>
                <div style={{ fontSize: '0.675rem', fontWeight: '700', color: '#FF5B3E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CRM Portal
                </div>
              </div>
            </Link>
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
              L
            </div>
          )}

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              position: 'absolute',
              right: '-14px',
              top: '24px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              cursor: 'pointer',
              zIndex: 50,
              transition: 'transform 200ms ease'
            }}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Mini Profile Badge (Expanded only) */}
        {!isSidebarCollapsed && (
          <div style={{ padding: '1.15rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FF5B3E',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.1rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(255, 91, 62, 0.3)'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', fontWeight: '800', color: user.accountStatus === 'approved' ? '#059669' : '#ea580c', background: user.accountStatus === 'approved' ? '#ecfdf5' : '#fff7ed', padding: '0.15rem 0.45rem', borderRadius: '999px', marginTop: '0.2rem' }}>
                  {user.accountStatus === 'approved' ? <ShieldCheck size={11} /> : <Clock size={11} />}
                  {user.accountStatus === 'approved' ? 'Verified Member' : 'Pending Moderation'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav style={{ padding: isSidebarCollapsed ? '1rem 0.5rem' : '1rem 0.85rem', flex: 1, overflowY: 'auto' }}>
          
          <div
            onClick={() => setActiveTab('overview')}
            className={`crm-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
            title="Overview"
          >
            <LayoutDashboard size={20} />
            {!isSidebarCollapsed && <span>Overview</span>}
          </div>

          <div
            onClick={() => setActiveTab('listings')}
            className={`crm-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}
            title="My Business Listings"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Building2 size={20} />
              {!isSidebarCollapsed && <span>My Listings</span>}
            </div>
            {!isSidebarCollapsed && listings.length > 0 && (
              <span style={{ background: activeTab === 'listings' ? '#FF5B3E' : '#e2e8f0', color: activeTab === 'listings' ? '#ffffff' : '#475569', fontSize: '0.725rem', fontWeight: '800', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
                {listings.length}
              </span>
            )}
          </div>

          <div
            onClick={() => setActiveTab('edits')}
            className={`crm-nav-item ${activeTab === 'edits' ? 'active' : ''}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}
            title="Suggested Edits"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Edit3 size={20} />
              {!isSidebarCollapsed && <span>Suggested Edits</span>}
            </div>
            {!isSidebarCollapsed && edits.length > 0 && (
              <span style={{ background: activeTab === 'edits' ? '#FF5B3E' : '#e2e8f0', color: activeTab === 'edits' ? '#ffffff' : '#475569', fontSize: '0.725rem', fontWeight: '800', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
                {edits.length}
              </span>
            )}
          </div>

          <div
            onClick={() => setActiveTab('settings')}
            className={`crm-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
            title="Account & Security"
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span>Account &amp; Security</span>}
          </div>

        </nav>

        {/* Sidebar Footer (Notifications & Logout) */}
        <div style={{ padding: isSidebarCollapsed ? '1rem 0.5rem' : '1rem 1rem', borderTop: '1px solid #f1f5f9' }}>
          
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setPasswordModalOpen(true)}
                className="crm-nav-item"
                style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.65rem 0.85rem' }}
              >
                <KeyRound size={18} /> <span>Change Password</span>
              </button>

              <button
                onClick={logout}
                className="crm-nav-item"
                style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444', padding: '0.65rem 0.85rem' }}
              >
                <LogOut size={18} color="#ef4444" /> <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => setPasswordModalOpen(true)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }} title="Change Password">
                <KeyRound size={20} />
              </button>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          )}

        </div>

      </aside>

      {/* ─── 2. MOBILE SLIDE-OUT NAVIGATION DRAWER ──────────────────────────── */}
      {(isMobileMenuOpen || isDrawerClosing) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          {/* Animated Frosted Backdrop */}
          <div
            onClick={closeMobileMenu}
            className={`crm-drawer-backdrop ${isDrawerClosing ? 'closing' : ''}`}
          />

          {/* Animated Slide-In & Slide-Out Drawer Panel */}
          <div className={`crm-drawer-panel ${isDrawerClosing ? 'closing' : ''}`}>
            {/* Mobile Header */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
              <Link href="/" onClick={closeMobileMenu} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem' }}>
                  L
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', lineHeight: '1.1' }}>
                    Locable
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#FF5B3E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CRM Portal
                  </div>
                </div>
              </Link>
              <button onClick={closeMobileMenu} style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                <X size={20} color="#0f172a" />
              </button>
            </div>

            {/* Mobile User Card */}
            <div style={{ padding: '1.15rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FF5B3E', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.925rem', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</div>
                  <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.675rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
                    <ShieldCheck size={11} /> Verified Member
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation List */}
            <nav style={{ padding: '1.25rem 1rem', flex: 1 }}>
              <button
                onClick={() => { setActiveTab('overview'); closeMobileMenu(); }}
                className={`crm-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'transparent' }}
              >
                <LayoutDashboard size={18} /> <span>Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('listings'); closeMobileMenu(); }}
                className={`crm-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'transparent', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Building2 size={18} /> <span>My Listings</span>
                </div>
                <span style={{ background: activeTab === 'listings' ? '#FF5B3E' : '#e2e8f0', color: activeTab === 'listings' ? '#ffffff' : '#475569', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.725rem', fontWeight: '800' }}>
                  {listings.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('edits'); closeMobileMenu(); }}
                className={`crm-nav-item ${activeTab === 'edits' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'transparent', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Edit3 size={18} /> <span>Suggested Edits</span>
                </div>
                <span style={{ background: activeTab === 'edits' ? '#FF5B3E' : '#e2e8f0', color: activeTab === 'edits' ? '#ffffff' : '#475569', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.725rem', fontWeight: '800' }}>
                  {edits.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); closeMobileMenu(); }}
                className={`crm-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'transparent' }}
              >
                <User size={18} /> <span>Account &amp; Security</span>
              </button>

              <div style={{ margin: '1rem 0', borderTop: '1px solid #f1f5f9' }} />

              <button
                onClick={() => { setAddModalOpen(true); closeMobileMenu(); }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.75rem', justifyContent: 'center' }}
              >
                <PlusCircle size={16} /> <span>Add Listing</span>
              </button>

              <button
                onClick={() => { setPasswordModalOpen(true); closeMobileMenu(); }}
                className="crm-nav-item"
                style={{ width: '100%', border: 'none', background: 'transparent' }}
              >
                <KeyRound size={18} /> <span>Change Password</span>
              </button>

              <button
                onClick={() => { logout(); closeMobileMenu(); }}
                className="crm-nav-item"
                style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444' }}
              >
                <LogOut size={18} color="#ef4444" /> <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* ─── 3. MAIN CRM CONTENT AREA ───────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', paddingBottom: '5rem' }}>
        
        {/* Top Sticky CRM Header Bar */}
        <header
          className="crm-top-header"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '1.25rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 4px 20px -10px rgba(15, 23, 42, 0.03)'
          }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}
              className="crm-mobile-hamburger"
              title="Open Navigation Menu"
            >
              <Menu size={20} color="#0f172a" />
            </button>

            <div>
              <h1 className="crm-header-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'listings' && 'My Business Listings'}
                {activeTab === 'edits' && 'Suggested Edits'}
                {activeTab === 'settings' && 'Account & Security Settings'}
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                {activeTab === 'overview' && 'Manage your business directory listings, suggested edits, and account controls.'}
                {activeTab === 'listings' && `Displaying ${filteredListings.length} business listings for ${user.email}`}
                {activeTab === 'edits' && `Displaying ${edits.length} edit requests`}
                {activeTab === 'settings' && 'Update your profile information and manage account security.'}
              </p>
            </div>
          </div>

          <div className="crm-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Quick Action Button */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '12px', gap: '0.4rem' }}
            >
              <PlusCircle size={16} /> Add Listing
            </button>
          </div>

        </header>

        {/* Main Workspace Body */}
        <div className="crm-main-padding" style={{ padding: '2rem' }}>
          
          {/* ─── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              {/* METRIC STATS OVERVIEW GRID */}
              <div className="crm-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                
                <div className="card" style={{ background: '#ffffff', padding: '1.6rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Listings</span>
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.45rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{listings.length}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>Submitted Business Profiles</span>
                </div>

                <div className="card" style={{ background: '#ffffff', padding: '1.6rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Edits</span>
                    <div style={{ background: '#faf5ff', color: '#9333ea', padding: '0.45rem', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                      <Edit3 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#9333ea', lineHeight: '1' }}>{edits.length}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>Profile Update Requests</span>
                </div>

                <div className="card" style={{ background: '#ffffff', padding: '1.6rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</span>
                    <div style={{ background: '#fff7ed', color: '#ea580c', padding: '0.45rem', borderRadius: '10px', border: '1px solid #ffedd5' }}>
                      <Clock size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ea580c', lineHeight: '1' }}>{pendingCount}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>In Admin Queue</span>
                </div>

                <div className="card" style={{ background: '#ffffff', padding: '1.6rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live &amp; Approved</span>
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.45rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#059669', lineHeight: '1' }}>{approvedCount}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>Published on Directory</span>
                </div>

              </div>

              {/* RECENT BUSINESS LISTINGS & QUICK ACTION CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
                
                {/* Recent Listings Box */}
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Recent Business Listings
                    </h3>
                    <button onClick={() => setActiveTab('listings')} style={{ background: 'none', border: 'none', color: '#FF5B3E', fontWeight: '800', fontSize: '0.825rem', cursor: 'pointer' }}>
                      View All ({listings.length}) →
                    </button>
                  </div>

                  {listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                      <Building2 size={32} color="#94a3b8" style={{ margin: '0 auto 0.65rem' }} />
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>No listings added yet</div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Click below to submit your business details.</p>
                      <button onClick={() => setAddModalOpen(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                        + Add Business Listing
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {listings.slice(0, 3).map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                              {item.title.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{item.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.type} &bull; {item.city}</div>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.725rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '6px', background: item.status === 'published' ? '#ecfdf5' : '#fff7ed', color: item.status === 'published' ? '#059669' : '#ea580c' }}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Security Quick Card */}
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.15rem' }}>
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: '10px' }}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Account &amp; Security Status
                      </h3>
                      <div style={{ fontSize: '0.775rem', color: '#64748b' }}>Account Security &amp; Password Control</div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #f1f5f9', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Account Email:</span>
                      <strong style={{ color: '#0f172a' }}>{user.email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Moderation Status:</span>
                      <span style={{ fontWeight: '800', color: user.accountStatus === 'approved' ? '#059669' : '#ea580c' }}>
                        {user.accountStatus === 'approved' ? 'Verified Member 🟢' : 'Pending Admin Review 🟠'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPasswordModalOpen(true)}
                    className="btn btn-outline"
                    style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', fontWeight: '800', borderRadius: '12px', justifyContent: 'center' }}
                  >
                    <KeyRound size={16} /> Update Password
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ─── TAB 2: MY BUSINESS LISTINGS (CRM DATA TABLE MATCHING SCREENSHOT) ─── */}
          {activeTab === 'listings' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)' }}>
              
              {/* Table Action Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#0f172a' }}>
                  Total Business Listings ({filteredListings.length})
                </div>

                {selectedIds.length > 0 && (
                  <div style={{ fontSize: '0.825rem', fontWeight: '800', color: '#FF5B3E', background: '#FFF0ED', padding: '0.35rem 0.85rem', borderRadius: '8px' }}>
                    {selectedIds.length} listing(s) selected
                  </div>
                )}
              </div>

              {fetchingData ? (
                <div className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />
              ) : filteredListings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1' }}>
                  <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 0.85rem' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                    No Business Listings Found
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                    You haven&apos;t added any business listings under <strong>{user.email}</strong> yet.
                  </p>
                  <button onClick={() => setAddModalOpen(true)} className="btn btn-primary" style={{ padding: '0.65rem 1.35rem', fontSize: '0.875rem', borderRadius: '12px' }}>
                    <PlusCircle size={16} /> Add Your First Business
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  {/* CRM TABLE FORMAT MATCHING USER REFERENCE SCREENSHOT */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '0.85rem 1rem', width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={filteredListings.length > 0 && selectedIds.length === filteredListings.length}
                            onChange={toggleSelectAll}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '0.85rem 1rem' }}>Business &amp; Company</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.85rem 1rem' }}>City &amp; Address</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Contact Info</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <tr key={item.id} className="crm-table-row" style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#f0f9ff' : 'transparent' }}>
                            <td style={{ padding: '1rem' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(item.id)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF0ED', color: '#FF5B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', flexShrink: 0 }}>
                                  {item.title.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>{item.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {item.placeId || item.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.775rem', fontWeight: '800' }}>
                                {item.type}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', color: '#475569', fontSize: '0.825rem' }}>
                              <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.city}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.address}</div>
                            </td>
                            <td style={{ padding: '1rem', color: '#475569', fontSize: '0.825rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {item.phone && <span><Phone size={12} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} />{item.phone}</span>}
                                {item.website && <span><Globe size={12} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} />{item.website}</span>}
                                {!item.phone && !item.website && <span style={{ color: '#94a3b8' }}>No direct contact</span>}
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {item.status === 'published' ? (
                                <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <CheckCircle2 size={13} /> Live &amp; Published
                                </span>
                              ) : item.status === 'rejected' ? (
                                <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <AlertCircle size={13} /> Rejected
                                </span>
                              ) : (
                                <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Clock size={13} /> Pending Review
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="btn btn-outline"
                                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem', fontWeight: '700', borderRadius: '8px' }}
                              >
                                <Edit3 size={13} /> Suggest Edits
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 3: SUGGESTED EDITS ──────────────────────────────────────────── */}
          {activeTab === 'edits' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)' }}>
              
              {fetchingData ? (
                <div className="skeleton" style={{ height: '180px', borderRadius: '16px' }} />
              ) : edits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1' }}>
                  <Edit3 size={36} color="#9333ea" style={{ margin: '0 auto 0.85rem' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                    No Suggested Edits Submitted
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                    Browse any listing on the website and click &quot;Suggest Edits&quot; to update details or operating hours.
                  </p>
                  <Link href="/explore" className="btn btn-outline" style={{ padding: '0.65rem 1.35rem', fontSize: '0.875rem', borderRadius: '12px', fontWeight: '700' }}>
                    Explore Directory Listings →
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Target Business</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Proposed Updates</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Submitted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edits.map((edit) => (
                        <tr key={edit.id} className="crm-table-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', fontWeight: '800', color: '#0f172a' }}>
                            {edit.businessTitle}
                          </td>
                          <td style={{ padding: '1rem', color: '#475569' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.825rem' }}>
                              {edit.proposedPhone && <span><Phone size={12} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} /> {edit.proposedPhone}</span>}
                              {edit.proposedWebsite && <span><Globe size={12} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} /> {edit.proposedWebsite}</span>}
                              {edit.proposedAddress && <span><MapPin size={12} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} /> {edit.proposedAddress}</span>}
                              {!edit.proposedPhone && !edit.proposedWebsite && !edit.proposedAddress && <span>General description updates</span>}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {edit.editStatus === 'approved' ? (
                              <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle2 size={13} /> Approved
                              </span>
                            ) : edit.editStatus === 'rejected' ? (
                              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <AlertCircle size={13} /> Rejected
                              </span>
                            ) : (
                              <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Clock size={13} /> Pending Review
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right' }}>
                            {new Date(edit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: ACCOUNT & SECURITY SETTINGS ─────────────────────────────── */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '720px' }}>
              <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} color="#FF5B3E" /> User Profile &amp; Verification Status
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FF5B3E', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.5rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{user.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{user.email}</div>
                    <div style={{ marginTop: '0.35rem' }}>
                      {user.accountStatus === 'approved' ? (
                        <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <ShieldCheck size={14} /> Verified Business Member
                        </span>
                      ) : (
                        <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={14} /> Account Under Moderation Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                    Account Security Active 🟢
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                    Your business member account profile is active, secure, and verified.
                  </p>
                </div>
              </div>

              {/* Live Password Change Block */}
              <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <KeyRound size={20} color="#FF5B3E" /> Change Password
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Update your account password securely.
                </p>

                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '800', fontSize: '0.875rem' }}
                >
                  <KeyRound size={16} /> Change Password
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ─── MODALS ───────────────────────────────────────────────────────────── */}
      <AddBusinessModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadUserData}
      />

      {selectedEditListing && (
        <SuggestEditsModal
          business={selectedEditListing}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEditListing(null);
          }}
          onSuccess={(newEdit) => {
            if (newEdit) {
              setEdits((prev) => [newEdit, ...prev.filter((e) => e.id !== newEdit.id)]);
            }
            loadUserData();
          }}
        />
      )}

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        userEmail={user.email}
        onClose={() => setPasswordModalOpen(false)}
      />

    </div>
  );
}

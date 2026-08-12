'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode,
  Upload,
  Download,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { testWpConnection, getWpApiUrl } from '@/lib/wordpress';

export default function WordPressSyncPage() {
  const [wpUrl, setWpUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  useEffect(() => {
    const active = getWpApiUrl();
    if (active) {
      setWpUrl(active);
      runTest(active);
    }
  }, []);

  const runTest = async (urlToTest: string) => {
    setIsTesting(true);
    setConnectionStatus(null);

    const res = await testWpConnection(urlToTest);
    setConnectionStatus(res);
    setIsTesting(false);
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpUrl) return;

    localStorage.setItem('directory_wp_api_url', wpUrl.trim());
    await runTest(wpUrl.trim());
  };

  const handleDisconnect = () => {
    localStorage.removeItem('directory_wp_api_url');
    setWpUrl('');
    setConnectionStatus(null);
  };

  return (
    <div style={{ background: '#FAF8F5', minHeight: '90vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* HERO BANNER HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '2.25rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#FFF0ED', color: '#FF5B3E', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.85rem' }}>
            <Database size={16} /> Headless WordPress API Integration
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            Connect Your WordPress WP-Admin Backend
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '680px', margin: 0, lineHeight: '1.5' }}>
            Link your live or local WordPress site to sync business listings, manage customer reviews, and run bulk CSV imports directly from WP-Admin.
          </p>
        </div>

        {/* CONNECTION STATUS CARD */}
        <div className="card" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.05)', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#FF5B3E" /> WordPress REST API Endpoint Setup
          </h2>

          <form onSubmit={handleSaveUrl} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>
                WordPress Site URL
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="url"
                  placeholder="https://your-wordpress-domain.com  or  http://localhost:8000"
                  value={wpUrl}
                  onChange={(e) => setWpUrl(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    minWidth: '260px',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                />
                <button
                  type="submit"
                  disabled={isTesting}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.5rem', whiteSpace: 'nowrap', borderRadius: '12px', fontWeight: '800' }}
                >
                  {isTesting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Testing Connection...
                    </>
                  ) : (
                    'Connect & Save'
                  )}
                </button>
              </div>
              <span style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.4rem', display: 'block' }}>
                Example: <code>https://cms.verifieddirectory.com</code> or local dev <code>http://mysite.local</code>
              </span>
            </div>

            {/* Connection Status Banner */}
            {connectionStatus && (
              <div style={{
                padding: '1.25rem',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                fontSize: '0.925rem',
                background: connectionStatus.success ? '#ecfdf5' : '#fef2f2',
                color: connectionStatus.success ? '#047857' : '#b91c1c',
                border: connectionStatus.success ? '1px solid #a7f3d0' : '1px solid #fecaca'
              }}>
                {connectionStatus.success ? <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>
                  <div style={{ fontWeight: '800', marginBottom: '0.2rem' }}>
                    {connectionStatus.success ? 'WordPress Connected Successfully!' : 'Connection Warning'}
                  </div>
                  <div>{connectionStatus.message}</div>
                  {connectionStatus.success && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link href="/san-diego" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', background: '#047857', borderColor: '#047857', borderRadius: '8px' }}>
                        View Live Listings Page →
                      </Link>
                      <button type="button" onClick={handleDisconnect} style={{ fontSize: '0.8rem', color: '#b91c1c', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Disconnect WP URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 3 STEP WORDPRESS SETUP GUIDE */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
          3 Easy Steps to Manage All Data in WordPress WP-Admin
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STEP 1 */}
          <div className="card" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
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
              flexShrink: 0
            }}>
              1
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                Activate the Directory Helper Plugin
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                We provided a custom WordPress helper plugin located in your codebase at:
                <br />
                <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#0f172a', fontWeight: '600', fontSize: '0.85rem' }}>
                  wordpress-plugin/directory-helper.php
                </code>
              </p>
              <div style={{ fontSize: '0.85rem', color: '#334155', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', borderLeft: '4px solid #FF5B3E', marginBottom: '1rem', lineHeight: '1.5' }}>
                Copy <code>directory-helper.php</code> to your WordPress site’s <code>wp-content/plugins/directory-helper/</code> folder or upload the ZIP file in WP-Admin.
              </div>

              <a
                href="/directory-helper.zip"
                download="directory-helper.zip"
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}
              >
                <Download size={16} /> Download Plugin ZIP (directory-helper.zip)
              </a>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="card" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
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
              flexShrink: 0
            }}>
              2
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                Bulk CSV Import / Export using <code style={{ color: '#FF5B3E' }}>placeId</code> Key
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                The plugin adds a new admin screen in WP-Admin: <strong>Directory Businesses -&gt; CSV Import / Export</strong>.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#334155', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', borderLeft: '4px solid #FF5B3E', lineHeight: '1.5' }}>
                Upload your extraction CSV sheet containing columns (<code>title</code>, <code>type</code>, <code>address</code>, <code>phone</code>, <code>placeId</code>). The plugin uses <code>placeId</code> to automatically <strong>Insert new listings</strong> or <strong>Update existing listings</strong> without duplicate records!
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="card" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
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
              flexShrink: 0
            }}>
              3
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                Manage, Edit &amp; Delete Listings Live in WP-Admin
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                Go to <strong>WP-Admin -&gt; Directory Businesses</strong> to edit listing details, upload thumbnails, approve customer reviews in <strong>Customer Reviews</strong>, and handle leads in <strong>Leads &amp; Audits</strong>.
              </p>
            </div>
          </div>

          {/* STEP 4: FOUNDERS & LEADERSHIP WP META FIELDS */}
          <div className="card" style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', gap: '1.25rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.1rem',
              flexShrink: 0
            }}>
              4
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                Founders &amp; Leadership WP Custom Meta Fields
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                To edit Founder details directly per listing in <code>WP-Admin -&gt; Edit Listing</code>, copy this PHP snippet into your theme&apos;s <code>functions.php</code> or active plugin. It registers WP REST API keys (<code>founderName</code>, <code>founderRole</code>, <code>founderExperience</code>, <code>founderQuote</code>, <code>licenseStatus</code>):
              </p>

              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '1.25rem',
                borderRadius: '14px',
                fontSize: '0.825rem',
                overflowX: 'auto',
                lineHeight: '1.6'
              }}>
{`// Register Founder Custom Meta Fields for WordPress REST API
add_action('init', function() {
    $fields = ['founderName', 'founderRole', 'founderExperience', 'founderQuote', 'founderAvatar', 'licenseStatus'];
    foreach ($fields as $field) {
        register_post_meta('business_listing', $field, [
            'show_in_rest' => true,
            'single'       => true,
            'type'         => 'string',
        ]);
    }
});`}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

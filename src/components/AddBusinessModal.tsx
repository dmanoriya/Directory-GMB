'use client';

import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Building2, MapPin, Phone, Globe, DollarSign, Clock, FileText, Send, CheckCircle2, AlertCircle, Lock, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Category, LocationCity } from '@/types/directory';
import { validateImageFile, compressAndResizeImage } from '@/lib/imageCompression';
import SearchableCategorySelect from '@/components/SearchableCategorySelect';
import { formatPhoneNumber } from '@/lib/phoneFormatter';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddBusinessModal({ isOpen, onClose, onSuccess }: AddBusinessModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('San Diego');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('92101');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [price, setPrice] = useState('$$');
  const [hours, setHours] = useState('Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM');
  
  // Separate Cover & Thumbnail state
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=675&fit=crop&q=80');
  const [thumbnailImage, setThumbnailImage] = useState('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop&q=80');
  
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [coverInfo, setCoverInfo] = useState('');
  const [thumbnailInfo, setThumbnailInfo] = useState('');

  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [services, setServices] = useState('');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCategories(data);
    }).catch(() => {});

    fetch('/api/cities').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCities(data);
    }).catch(() => {});
  }, []);

  if (!isOpen) return null;

  if (user?.accountStatus !== 'approved') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1px solid #e2e8f0',
          padding: '2.25rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '2px solid #fde68a'
          }}>
            <Lock size={32} />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Account Approval Pending
          </h3>
          
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Your account (<strong>{user?.email}</strong>) is currently pending admin moderation review. 
            You can still submit business listings below for our team to review!
          </p>

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontWeight: '700' }}
          >
            Understood, Close
          </button>
        </div>
      </div>
    );
  }

  // ── Client Validation ──
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errors.title = 'Business Name must be at least 3 characters.';
    }

    if (!type) {
      errors.type = 'Please select a business category.';
    }

    if (!city) {
      errors.city = 'Please select a city.';
    }

    if (!address.trim() || address.trim().length < 4) {
      errors.address = 'Please enter a valid street address.';
    }

    if (!zip.trim() || !/^\d{5}$/.test(zip.trim())) {
      errors.zip = 'Enter a valid 5-digit ZIP code (e.g. 92101).';
    }

    if (phone.trim()) {
      const cleanDigits = phone.trim().replace(/[^\d]/g, '');
      if (cleanDigits.length < 10 || cleanDigits.length > 15) {
        errors.phone = 'Enter a valid 10-digit phone number (e.g. (619) 555-0199).';
      }
    }

    if (website.trim()) {
      let formattedUrl = website.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      try {
        new URL(formattedUrl);
      } catch {
        errors.website = 'Enter a valid website URL (e.g. https://mybusiness.com).';
      }
    }

    if (!services.trim()) {
      errors.services = 'Please list at least one service offered (e.g. Plumbing, Emergency Repairs).';
    }

    if (!description.trim() || description.trim().length < 15) {
      errors.description = 'Business description must be at least 15 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'thumbnail'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGlobalError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setGlobalError(validation.error || 'Invalid image file.');
      return;
    }

    if (type === 'cover') setUploadingCover(true);
    else setUploadingThumbnail(true);

    try {
      const options = type === 'cover' 
        ? { maxWidth: 1200, maxHeight: 675, quality: 0.85 } 
        : { maxWidth: 600, maxHeight: 600, quality: 0.85 };

      const compressedFile = await compressAndResizeImage(file, options);
      
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('userEmail', user?.email || '');
      formData.append('imageType', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          if (type === 'cover') {
            setCoverImage(data.url);
            setCoverInfo('✓ Photo uploaded');
          } else {
            setThumbnailImage(data.url);
            setThumbnailInfo('✓ Photo uploaded');
          }
        }
      } else {
        setGlobalError(`Failed to upload ${type} image.`);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setGlobalError(`Error compressing/uploading ${type} image.`);
    } finally {
      if (type === 'cover') setUploadingCover(false);
      else setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (!validateForm()) {
      setGlobalError('Please fix the validation errors before submitting.');
      return;
    }

    setSubmitting(true);

    let cleanWebsite = website.trim();
    if (cleanWebsite && !/^https?:\/\//i.test(cleanWebsite)) {
      cleanWebsite = 'https://' + cleanWebsite;
    }

    try {
      const res = await fetch('/api/user/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email || '',
          userName: user?.name || '',
          title: title.trim(),
          type,
          city,
          address: address.trim(),
          state,
          zip: zip.trim(),
          phone: phone.trim(),
          website: cleanWebsite,
          googleMapsUrl: googleMapsUrl.trim(),
          price,
          workingHours: hours,
          coverImage,
          thumbnail: thumbnailImage,
          serviceOptions: services ? services.split(',').map(s => s.trim()).filter(Boolean) : [],
          description: description.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setGlobalError('Failed to submit new business listing. Please try again.');
      }
    } catch (err) {
      setGlobalError('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-container">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#111111', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(17,17,17,0.15)', flexShrink: 0 }}>
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: '700', color: '#111111', margin: 0, lineHeight: '1.2' }}>
                Add New Business Listing
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                Submit a new local business with map location &amp; details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <CheckCircle2 size={56} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              Business Listing Submitted!
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              Your new business listing has been submitted for admin review. Once verified and approved, it will go live automatically with interactive Google Maps &amp; reviews enabled!
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#0ea5e9" style={{ flexShrink: 0 }} />
              Listings, map coordinates &amp; uploaded media are submitted for moderation review.
            </div>

            {globalError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem' }}>
                {globalError}
              </div>
            )}

            {/* Title & Category */}
            <div className="modal-grid-2col">
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. San Diego Aesthetics Spa"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.title ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                {fieldErrors.title && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.title}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Business Category *
                </label>
                <SearchableCategorySelect
                  value={type}
                  onChange={(val) => {
                    setType(val);
                    if (fieldErrors.type) setFieldErrors(prev => ({ ...prev, type: '' }));
                  }}
                  categories={categories}
                  error={fieldErrors.type}
                  required
                />
              </div>
            </div>

            {/* City & Address */}
            <div className="modal-grid-address">
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  City / Location *
                </label>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#ffffff' }}
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="San Diego">San Diego</option>
                  <option value="La Mesa">La Mesa</option>
                  <option value="Chula Vista">Chula Vista</option>
                  <option value="Carlsbad">Carlsbad</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Street Address (for Map Pin) *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: '' }));
                  }}
                  placeholder="861 Sixth Ave, Suite 827"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.address ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                {fieldErrors.address && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.address}</div>}
              </div>
            </div>

            {/* State & ZIP */}
            <div className="modal-grid-3col">
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  State
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
                  placeholder="CA"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  ZIP Code * (Max 5 digits)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  required
                  value={zip}
                  onChange={(e) => {
                    const cleanZip = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setZip(cleanZip);
                    if (fieldErrors.zip) setFieldErrors(prev => ({ ...prev, zip: '' }));
                  }}
                  placeholder="92101"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.zip ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                {fieldErrors.zip && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.zip}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Price Tier
                </label>
                <select
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#ffffff' }}
                >
                  <option value="$">$ (Inexpensive)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Ultra High End)</option>
                </select>
              </div>
            </div>

            {/* Phone & Website */}
            <div className="modal-grid-2col">
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  inputMode="tel"
                  maxLength={14}
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setPhone(formatted);
                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="(619) 555-0199"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.phone ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                {fieldErrors.phone && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.phone}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Website URL
                </label>
                <input
                  type="text"
                  inputMode="url"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (fieldErrors.website) setFieldErrors(prev => ({ ...prev, website: '' }));
                  }}
                  onBlur={() => {
                    let clean = website.trim();
                    if (clean && !/^https?:\/\//i.test(clean) && clean.includes('.')) {
                      setWebsite('https://' + clean);
                    }
                  }}
                  placeholder="https://myspasandiego.com"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.website ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
                {fieldErrors.website && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.website}</div>}
              </div>
            </div>

            {/* Google Maps Profile Link or Place ID (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                Google Maps Profile Link or Place ID (Optional)
              </label>
              <input
                type="text"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/... or Place ID"
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem', lineHeight: '1.4' }}>
                Link or Place ID to auto-sync Google Reviews &amp; Star Ratings. Leave blank to auto-detect.
              </div>
            </div>

            {/* Separate Cover & Thumbnail Uploaders */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={18} color="#0ea5e9" /> Business Photos (Auto-Compressed)
              </h4>

              <div className="modal-grid-2col">
                
                {/* 1. Cover Image Upload Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Hero Cover Image (16:9)
                  </label>
                  
                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    background: '#ffffff',
                    position: 'relative'
                  }}>
                    {uploadingCover ? (
                      <div style={{ padding: '1.5rem 0', color: '#0ea5e9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <Loader2 size={24} className="animate-spin" />
                        Compressing &amp; Uploading...
                      </div>
                    ) : coverImage ? (
                      <div>
                        <img
                          src={coverImage}
                          alt="Cover Banner"
                          style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.4rem' }}
                        />
                        {coverInfo && <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700', marginBottom: '0.4rem' }}>{coverInfo}</div>}
                        <label style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Upload size={13} /> Change Cover
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'cover')} style={{ display: 'none' }} />
                        </label>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'block', padding: '1rem 0' }}>
                        <Upload size={22} color="#64748b" style={{ marginBottom: '0.25rem' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Upload Cover Image</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max 10MB (Auto 1200px max)</div>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'cover')} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. Thumbnail Image Upload Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Card Thumbnail Logo (1:1 Square)
                  </label>

                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    textAlign: 'center',
                    background: '#ffffff',
                    position: 'relative'
                  }}>
                    {uploadingThumbnail ? (
                      <div style={{ padding: '1.5rem 0', color: '#0ea5e9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <Loader2 size={24} className="animate-spin" />
                        Compressing &amp; Uploading...
                      </div>
                    ) : thumbnailImage ? (
                      <div>
                        <img
                          src={thumbnailImage}
                          alt="Thumbnail Logo"
                          style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto 0.4rem', display: 'block' }}
                        />
                        {thumbnailInfo && <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700', marginBottom: '0.4rem' }}>{thumbnailInfo}</div>}
                        <label style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Upload size={13} /> Change Thumbnail
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'thumbnail')} style={{ display: 'none' }} />
                        </label>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'block', padding: '1rem 0' }}>
                        <Upload size={22} color="#64748b" style={{ marginBottom: '0.25rem' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Upload Thumbnail</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max 10MB (Auto 600px max)</div>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'thumbnail')} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                Operating Hours
              </label>
              <textarea
                rows={2}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Monday - Friday: 9am - 6pm..."
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>

            {/* Services Offered */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                Services Offered (comma separated) *
              </label>
              <input
                type="text"
                required
                value={services}
                onChange={(e) => {
                  setServices(e.target.value);
                  if (fieldErrors.services) setFieldErrors(prev => ({ ...prev, services: '' }));
                }}
                placeholder="Botox, Dermal Fillers, Laser Hair Removal, Cryofacial"
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.services ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
              {fieldErrors.services && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.services}</div>}
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                Business Description &amp; Overview *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
                }}
                placeholder="Describe your business services, team qualifications, and customer experience..."
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: fieldErrors.description ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
              />
              {fieldErrors.description && <div style={{ color: '#ef4444', fontSize: '0.725rem', marginTop: '0.2rem' }}>{fieldErrors.description}</div>}
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingCover || uploadingThumbnail}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', fontWeight: '700', marginTop: '0.5rem' }}
            >
              {submitting ? 'Submitting Business Listing...' : 'Submit Business Listing'} <Send size={16} />
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

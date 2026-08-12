'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BusinessListing } from '@/types/directory';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapViewProps {
  businesses: BusinessListing[];
  apiKey?: string;
}

const DEFAULT_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAusNwdN9zPqXJ_doW_M4mbdrhtJkZkdpU';

export default function GoogleMapView({ businesses, apiKey = DEFAULT_MAPS_KEY }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google Maps API Key missing.');
      return;
    }

    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      initMap();
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initMap();
      };

      script.onerror = () => {
        setLoadError('Failed to load Google Maps API.');
      };

      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => {
        initMap();
      });
    }
  }, [apiKey, businesses]);

  const initMap = () => {
    if (!mapRef.current || typeof window === 'undefined' || !window.google || !window.google.maps) return;

    const center = { lat: 32.7157, lng: -117.1611 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 11,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const bounds = new window.google.maps.LatLngBounds();
    const infoWindow = new window.google.maps.InfoWindow();
    let validMarkerCount = 0;

    businesses.forEach((biz) => {
      if (!biz.latitude || !biz.longitude) return;

      let lat = Number(biz.latitude);
      let lng = Number(biz.longitude);

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      // Auto-correct positive US longitude e.g. 117.1611 -> -117.1611
      if (lng > 0 && lng > 60 && lng < 130) {
        lng = -lng;
      }

      // Filter out ocean / invalid coordinates (Outside US land mass: 24 to 50 N, -125 to -65 W)
      if (lat < 24 || lat > 50 || lng < -125 || lng > -65) {
        return;
      }

      const position = { lat, lng };
      bounds.extend(position);
      validMarkerCount++;

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: biz.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FF5B3E',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      });

      const contentString = `
        <div style="padding: 10px; max-width: 240px; font-family: sans-serif;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a;">${biz.title}</h4>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">📍 ${biz.address}</div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            <span style="color: #eab308;">★ ${biz.rating}</span> (${biz.reviews} reviews)
          </div>
          <a href="/listing/${biz.slug}" target="_blank" style="display: inline-block; background: #0ea5e9; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
            View Profile →
          </a>
        </div>
      `;

      marker.addListener('click', () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });
    });

    if (validMarkerCount > 0) {
      map.fitBounds(bounds);
    }
  };

  if (loadError) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#f8fafc' }}>
        <MapPin size={48} color="#0ea5e9" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
          Interactive Map View
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '650px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { BusinessListing } from '@/types/directory';
import SuggestEditsModal from '@/components/SuggestEditsModal';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import { useAuth } from '@/context/AuthContext';

interface SuggestEditTriggerCardProps {
  business: BusinessListing;
}

export default function SuggestEditTriggerCard({ business }: SuggestEditTriggerCardProps) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <div style={{ background: '#111111', color: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #333333' }}>
        <div style={{ fontSize: '0.775rem', fontWeight: '800', color: '#FFD84D', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Notice inaccuracies or missing info?
        </div>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
          Suggest Edits for this Business
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#cccccc', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Are you the business owner or acting on its behalf? Submit updated phone numbers, operating hours, website, or address.
        </p>
        <button
          onClick={() => {
            if (!user) {
              setAuthModalOpen(true);
            } else {
              setModalOpen(true);
            }
          }}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', gap: '0.4rem', fontWeight: '700' }}
        >
          <Edit3 size={16} /> Suggest Edits
        </button>
      </div>

      <SuggestEditsModal
        business={business}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In Required to Suggest Edits"
        message={`Please sign in to your account or create a free account to submit edit proposals for ${business.title}.`}
      />
    </>
  );
}

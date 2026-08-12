import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';
import { SuggestedEdit } from '@/types/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ edits: [] });
  }

  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/wp/v2/suggested_edit?meta_key=userEmail&meta_value=${encodeURIComponent(email)}&_fields=id,title,date,meta`,
        {
          headers: { 'User-Agent': 'LocableNextJS/1.0' },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          const edits: SuggestedEdit[] = items
            .filter((item: any) => {
              const meta = item.meta || {};
              const editEmail = (meta.userEmail || '').toLowerCase();
              return !editEmail || editEmail === email.toLowerCase();
            })
            .map((item: any) => {
              const meta = item.meta || {};
              return {
                id: String(item.id),
                placeId: String(meta.placeId || ''),
                businessTitle: String(meta.businessTitle || item.title?.rendered || 'Business Listing'),
                userEmail: String(meta.userEmail || email),
                userName: String(meta.userName || ''),
                proposedPhone: String(meta.proposedPhone || ''),
                proposedWebsite: String(meta.proposedWebsite || ''),
                proposedAddress: String(meta.proposedAddress || ''),
                proposedDescription: String(meta.proposedDescription || ''),
                proposedHours: String(meta.proposedHours || ''),
                editStatus: (meta.editStatus || 'pending') as 'pending' | 'approved' | 'rejected',
                createdAt: String(item.date || new Date().toISOString()),
              };
            });

          return NextResponse.json({ edits });
        }
      }
    } catch (e) {
      console.warn('[User Edits API] WP fetch failed:', e);
    }
  }

  return NextResponse.json({ edits: [] });
}

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId') || searchParams.get('businessId') || '';
  const slug = searchParams.get('slug') || '';

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://gmb.local';

  if (wpUrl) {
    try {
      const res = await fetch(`${wpUrl}/wp-json/locable/v1/reviews?placeId=${encodeURIComponent(placeId)}&slug=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.error('[API /api/reviews] Error fetching reviews from WP:', e);
    }
  }

  return NextResponse.json({ reviews: [] });
}

import { NextResponse } from 'next/server';
import { getBusinesses } from '@/lib/wordpress';

/**
 * GET /api/businesses
 * Server-side proxy to WordPress so client components can fetch live data.
 * Cache: no-store ensures deleted businesses are never served stale.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const city = searchParams.get('city') || undefined;
  const search = searchParams.get('q') || undefined;

  try {
    const businesses = await getBusinesses({
      categorySlug: category,
      citySlug: city,
      searchQuery: search,
    });

    return NextResponse.json(businesses, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[/api/businesses] Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

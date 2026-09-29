import { NextResponse } from 'next/server';
import { clearListingsCache, clearSeoCache } from '@/lib/wordpress';
import { clearRankMathCache } from '@/lib/rankMath';

export const dynamic = 'force-dynamic';

export async function GET() {
  clearListingsCache();
  clearRankMathCache();
  clearSeoCache();
  return NextResponse.json({
    success: true,
    message: 'Next.js in-memory cache cleared successfully. All listings and taxonomy data will be freshly refetched from WordPress.',
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    }
  });
}

export async function POST() {
  clearListingsCache();
  clearRankMathCache();
  clearSeoCache();
  return NextResponse.json({
    success: true,
    message: 'Next.js in-memory cache cleared successfully.',
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    }
  });
}

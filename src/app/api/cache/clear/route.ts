import { NextResponse } from 'next/server';
import { clearListingsCache } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  clearListingsCache();
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

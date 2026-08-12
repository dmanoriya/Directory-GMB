import { NextResponse } from 'next/server';
import { getCities } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json(cities, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

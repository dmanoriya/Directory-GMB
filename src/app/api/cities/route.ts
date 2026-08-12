import { NextResponse } from 'next/server';
import { getCities } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json(cities, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' },
    });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

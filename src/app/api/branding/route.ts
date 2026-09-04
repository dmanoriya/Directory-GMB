import { NextResponse } from 'next/server';
import { getSiteBranding } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const branding = await getSiteBranding();
    return NextResponse.json(branding, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json({
      siteName: 'San Diego Business Circle',
      tagline: 'Verified Local Business Directory & Marketplace',
      logo: '',
      logoDark: '',
      favicon: '',
    }, { status: 200 });
  }
}

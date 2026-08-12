import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required.' }, { status: 400 });
    }

    const apiUrl = getWpApiUrl();
    if (apiUrl) {
      const wpRes = await fetch(`${apiUrl}/wp-json/locable/v1/user-status?email=${encodeURIComponent(email)}`, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'DirectoryNextJS/1.0',
        },
      });

      if (wpRes.ok) {
        const data = await wpRes.json();
        return NextResponse.json({
          email: data.email,
          accountStatus: data.accountStatus || 'pending',
        });
      }
    }

    return NextResponse.json({ email, accountStatus: 'pending' });
  } catch (err: any) {
    console.error('[User Status API] Error fetching status:', err);
    return NextResponse.json({ error: 'Failed to fetch user status' }, { status: 500 });
  }
}

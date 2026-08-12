import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';
import { User } from '@/types/auth';

export async function POST(req: Request) {
  try {
    const { email, pin, token } = await req.json();

    if (!email || (!pin && !token)) {
      return NextResponse.json({ error: 'Email and verification code/link token are required.' }, { status: 400 });
    }

    const apiUrl = getWpApiUrl();

    if (apiUrl) {
      const wpRes = await fetch(`${apiUrl}/wp-json/locable/v1/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DirectoryNextJS/1.0',
        },
        body: JSON.stringify({ email, pin, token }),
      });

      const wpData = await wpRes.json();

      if (!wpRes.ok || wpData.code) {
        return NextResponse.json(
          { error: wpData.message || wpData.error || 'Invalid or expired verification code.' },
          { status: wpRes.status || 400 }
        );
      }

      const userObj: User = {
        id: String(wpData.user?.id || 'usr_' + Date.now()),
        name: String(wpData.user?.name || email.split('@')[0]),
        email: email.toLowerCase().trim(),
        role: 'user',
        accountStatus: (wpData.user?.accountStatus || 'pending') as 'pending' | 'approved' | 'rejected',
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        user: userObj,
        message: 'Email verified successfully! Account submitted for WP-Admin approval.'
      });
    }

    return NextResponse.json({ error: 'WordPress API service unavailable.' }, { status: 500 });
  } catch (err: any) {
    console.error('[Verify Email API] Error:', err);
    return NextResponse.json({ error: 'Email verification failed. Please try again.' }, { status: 500 });
  }
}

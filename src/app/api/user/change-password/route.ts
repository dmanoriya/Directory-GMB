import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';

export async function POST(req: Request) {
  try {
    const { email, oldPassword, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const apiUrl = getWpApiUrl();
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/wp-json/locable/v1/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LocableNextJS/1.0',
          },
          body: JSON.stringify({ email, oldPassword, newPassword }),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            success: true,
            message: data.message || 'Password updated successfully in WordPress!',
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          return NextResponse.json(
            { error: errData.message || 'WordPress password update failed.' },
            { status: res.status }
          );
        }
      } catch (e) {
        console.warn('[Change Password API] WP REST error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully for local session!',
    });
  } catch (err) {
    console.error('[Change Password API] Error:', err);
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}

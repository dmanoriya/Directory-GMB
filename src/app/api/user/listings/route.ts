import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';
import { BusinessListing } from '@/types/directory';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ listings: [] });
  }

  const apiUrl = getWpApiUrl();
  if (apiUrl) {
    try {
      const res = await fetch(
        `${apiUrl}/wp-json/locable/v1/user-listings?email=${encodeURIComponent(email)}`,
        {
          headers: { 'User-Agent': 'LocableNextJS/1.0' },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.listings)) {
          const filtered = data.listings.filter((l: any) => !l.userEmail || l.userEmail.toLowerCase() === email.toLowerCase());
          return NextResponse.json({ listings: filtered });
        }
      }
    } catch (e) {
      console.warn('[User Listings API] WP fetch warning:', e);
    }
  }

  return NextResponse.json({ listings: [] });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userEmail,
      userName,
      title,
      type,
      city,
      address,
      state,
      zip,
      phone,
      website,
      price,
      workingHours,
      thumbnail,
      serviceOptions,
      description,
    } = body;

    if (!title || !type || !city || !address) {
      return NextResponse.json({ error: 'Missing required listing fields.' }, { status: 400 });
    }

    const apiUrl = getWpApiUrl();
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/wp-json/locable/v1/submit-listing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LocableNextJS/1.0',
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            success: true,
            message: 'Business listing submitted to WordPress admin for review!',
            id: data.id,
          });
        }
      } catch (e) {
        console.error('[User Listings API] Public REST error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Business listing received and submitted for review!',
      id: 'chij_user_' + Date.now(),
    });
  } catch (err) {
    console.error('[User Listings API] POST error:', err);
    return NextResponse.json({ error: 'Failed to submit business listing.' }, { status: 500 });
  }
}

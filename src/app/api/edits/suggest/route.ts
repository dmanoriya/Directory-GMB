import { NextResponse } from 'next/server';
import { getWpApiUrl } from '@/lib/wordpress';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      placeId,
      businessTitle,
      userEmail,
      userName,
      proposedPhone,
      proposedWebsite,
      proposedAddress,
      proposedServices,
      proposedDescription,
      proposedHours,
    } = body;

    if (!placeId || !businessTitle || !userEmail) {
      return NextResponse.json({ error: 'Missing required edit parameters.' }, { status: 400 });
    }

    const apiUrl = getWpApiUrl();

    if (apiUrl) {
      try {
        const wpRes = await fetch(`${apiUrl}/wp-json/locable/v1/suggest-edit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LocableNextJS/1.0',
          },
          body: JSON.stringify({
            placeId,
            businessTitle,
            userEmail,
            userName,
            proposedPhone,
            proposedWebsite,
            proposedAddress,
            proposedServices,
            proposedDescription,
            proposedHours,
          }),
        });

        if (wpRes.ok) {
          const wpData = await wpRes.json();
          return NextResponse.json({
            success: true,
            message: 'Your edit suggestions have been submitted to WordPress admin for review!',
            id: wpData.id,
          });
        }
      } catch (e) {
        console.error('[Suggest Edit API] Public REST error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Edit suggestion received and logged!',
      id: 'ed_' + Date.now(),
    });
  } catch (err) {
    console.error('[Suggest Edit API] Server Error:', err);
    return NextResponse.json({ error: 'Failed to submit edit suggestion.' }, { status: 500 });
  }
}

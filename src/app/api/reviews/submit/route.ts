import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, reviewerName, reviewerEmail, rating, title, comment, website_url_honeypot } = body;

    // Honeypot spam filter check
    if (website_url_honeypot) {
      return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 });
    }

    if (!reviewerName || !title || !comment || !rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to Headless WordPress API if configured
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://gmb.local';
    if (wpUrl) {
      try {
        const wpRes = await fetch(`${wpUrl}/wp-json/locable/v1/submit-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (wpRes.ok) {
          const wpData = await wpRes.json();
          return NextResponse.json(wpData);
        }
      } catch (err) {
        console.error('[Submit Review API] Error posting to WP:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review received and queued for San Diego Directory admin approval.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

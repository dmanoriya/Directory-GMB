import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAusNwdN9zPqXJ_doW_M4mbdrhtJkZkdpU';

  if (!placeId) {
    return NextResponse.json({ error: 'placeId query parameter is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key is missing' }, { status: 500 });
  }

  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,reviews&reviews_sort=newest&key=${apiKey}`;

    // ISR Cache for 1 hour (3600s) -> Instant 0ms response time for visitors!
    const res = await fetch(googleUrl, {
      next: { revalidate: 3600 }
    });
    const data = await res.json();

    if (data.status !== 'OK' || !data.result) {
      return NextResponse.json({
        status: data.status,
        reviews: [],
        message: data.error_message || 'No Google Places details found'
      });
    }

    const placeDetails = data.result;
    const rawReviews = placeDetails.reviews || [];

    const formattedReviews = rawReviews.map((rev: any, index: number) => ({
      id: `live-google-${index}-${Date.now()}`,
      businessPlaceId: placeId,
      businessSlug: '',
      reviewerName: rev.author_name || 'Google User',
      reviewerEmail: '',
      rating: rev.rating || 5,
      title: rev.relative_time_description || 'Verified Google Review',
      comment: rev.text || 'No written comment provided.',
      date: rev.relative_time_description || 'Recently on Google',
      verifiedCustomer: true,
      helpfulCount: Math.floor(Math.random() * 8) + 1,
      status: 'approved',
      source: 'google',
      googleReviewerPhoto: rev.profile_photo_url || ''
    }));

    return NextResponse.json(
      {
        success: true,
        placeName: placeDetails.name,
        rating: placeDetails.rating,
        user_ratings_total: placeDetails.user_ratings_total,
        reviews: formattedReviews
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch Google Places reviews', details: error.message },
      { status: 500 }
    );
  }
}

import React from 'react';
import type { Metadata } from 'next';
import LocationDirectoryView from '@/components/LocationDirectoryView';
import { getBusinesses, getCities, getWpApiUrl } from '@/lib/wordpress';
import { getRankMathMetadata } from '@/lib/rankMath';
import RankMathSchema from '@/components/RankMathSchema';

export const dynamic = 'force-dynamic';

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city = 'san-diego' } = await params;
  const cities = await getCities();
  const cityObj = cities.find(c => c.slug.toLowerCase() === city.toLowerCase());
  const cityName = cityObj ? cityObj.name : city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const stateCode = cityObj ? cityObj.state : 'CA';
  const wpApiUrl = getWpApiUrl();

  const defaultMeta: Metadata = {
    title: `Verified Businesses & Services in ${cityName}, ${stateCode} | San Diego Business Circle`,
    description: `Find top-rated and verified local businesses, medical spas, contractors, plumbers, and home services in ${cityName}, ${stateCode}. 100% verified directory with reviews.`,
    alternates: {
      canonical: `https://sandiegobusinesscircle.com/san-diego/${city}`,
    },
    openGraph: {
      title: `Verified Businesses & Services in ${cityName}, ${stateCode}`,
      description: `Find top-rated and verified local businesses, medical spas, and contractors in ${cityName}, ${stateCode}.`,
      url: `https://sandiegobusinesscircle.com/san-diego/${city}`,
      type: 'website',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Verified Businesses in ${cityName}, ${stateCode}`,
      description: `Find verified local businesses in ${cityName}, ${stateCode}.`,
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=630&fit=crop&q=80'],
    }
  };

  const rm = await getRankMathMetadata({
    wpUrl: `${wpApiUrl}/business-location/${city}/`,
    fallbackMetadata: defaultMeta,
    fallbackCanonicalPath: `/san-diego/${city}`,
  });

  return rm.metadata;
}

export default async function CityDirectoryPage({ params }: CityPageProps) {
  const { city = 'san-diego' } = await params;
  const wpApiUrl = getWpApiUrl();

  // Server-side targeted fetch for instant speed (no client overhead)
  const [cityBusinesses, cities] = await Promise.all([
    getBusinesses({ citySlug: city }),
    getCities()
  ]);

  const cityObj = cities.find(c => c.slug.toLowerCase() === city.toLowerCase());
  const cityName = cityObj ? cityObj.name : city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const stateCode = cityObj ? cityObj.state : 'CA';

  let rankMathSchemas: string[] = [];
  try {
    const rm = await getRankMathMetadata({
      wpUrl: `${wpApiUrl}/business-location/${city}/`,
      fallbackMetadata: {},
      fallbackCanonicalPath: `/san-diego/${city}`,
    });
    rankMathSchemas = rm.jsonLdSchemas;
  } catch (e) {}

  return (
    <>
      <RankMathSchema schemas={rankMathSchemas} />
      <LocationDirectoryView
        stateParam="ca"
        cityParam={city}
        initialBusinesses={cityBusinesses}
        initialCityName={cityName}
        initialStateCode={stateCode}
      />
    </>
  );
}

import React from 'react';
import LocationDirectoryView from '@/components/LocationDirectoryView';
import { getBusinesses, getCities } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
}

export default async function StateCityDirectoryPage({ params }: PageProps) {
  const { state = 'ca', city = 'san-diego' } = await params;

  // Server-side targeted fetch for instant speed (no client overhead)
  const [cityBusinesses, cities] = await Promise.all([
    getBusinesses({ citySlug: city }),
    getCities()
  ]);

  const cityObj = cities.find(c => c.slug.toLowerCase() === city.toLowerCase());
  const cityName = cityObj ? cityObj.name : city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const stateCode = cityObj ? cityObj.state : state.toUpperCase();

  return (
    <LocationDirectoryView
      stateParam={state}
      cityParam={city}
      initialBusinesses={cityBusinesses}
      initialCityName={cityName}
      initialStateCode={stateCode}
    />
  );
}

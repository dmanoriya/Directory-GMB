import { BusinessListing } from '@/types/directory';

/**
 * Generates rich, multi-paragraph, keyword-optimized "About" content for a business listing.
 * If the business already has a custom description entered in WordPress (> 40 characters),
 * it formats and returns the custom description paragraphs.
 * Otherwise, it dynamically synthesizes a structured, multi-paragraph local SEO overview.
 */
export function getListingAboutParagraphs(business: BusinessListing): string[] {
  // If custom description exists from WordPress, always return it
  if (business.description && business.description.trim().length > 0) {
    const rawParagraphs = business.description
      .split(/\n\s*\n/)
      .map((p: string) => p.trim())
      .filter(Boolean);
    if (rawParagraphs.length > 0) {
      return rawParagraphs;
    }
  }

  const title = business.title || 'This business';
  const type = business.type || 'Local Business';
  const typeLower = type.toLowerCase();
  const city = business.city || 'San Diego';
  const state = business.state || 'CA';
  const address = business.address || '';
  const ratingNum = typeof business.rating === 'number' ? business.rating : (parseFloat(String(business.rating || '5.0')) || 5.0);
  const reviewsCount = typeof business.reviews === 'number' ? business.reviews : (parseInt(String(business.reviews || '0'), 10) || 0);

  // Extract clean service options
  const services = Array.isArray(business.serviceOptions)
    ? business.serviceOptions.filter(Boolean)
    : [];

  // Paragraph 1: Entity, Primary Category, Location & Mission
  const locationPhrase = address
    ? `Conveniently situated at ${address} in ${city}, ${state}`
    : `Located in the heart of ${city}, ${state}`;

  const p1 = `${title} is a premier ${typeLower} serving ${city} and the surrounding San Diego County communities. ${locationPhrase}, ${title} delivers dependable, high-quality ${typeLower} services designed to meet the unique needs of local residents, patients, and clients.`;

  // Paragraph 2: Specialties, Services & Care
  let p2 = '';
  if (services.length >= 2) {
    const serviceList = services.slice(0, 5).join(', ');
    p2 = `Specializing in a comprehensive array of professional solutions, their capabilities include ${serviceList}. With a commitment to modern techniques, industry-grade standards, and client-first care, their team ensures every appointment and project is handled with precision.`;
  } else {
    p2 = `Whether you are seeking routine consultations, expert project execution, or customized solutions, their team brings seasoned industry experience and dedication to every client interaction. Every service is provided with meticulous attention to detail and lasting results.`;
  }

  // Paragraph 3: Trust, Google Reviews & Reputation
  let p3 = '';
  if (reviewsCount > 0) {
    p3 = `Demonstrating a strong track record of client satisfaction, ${title} holds an impressive ${ratingNum.toFixed(1)}-star rating across ${reviewsCount} verified Google reviews. Their reputation for transparent communication, prompt service, and dependable results has made them a trusted choice throughout ${city}.`;
  } else {
    p3 = `Committed to superior service and community trust, ${title} emphasizes transparent communication, courteous service, and lasting client relationships across ${city} and neighboring areas.`;
  }

  // Paragraph 4: Accessibility & Contact Call to Action
  let p4 = '';
  if (business.phone) {
    p4 = `To inquire about services, request an estimate, or schedule an appointment, contact their team at ${business.phone} or visit them in ${city}. You can also explore verified reviews, current hours of operation, and service details right here on the directory.`;
  } else {
    p4 = `For service inquiries, hours of operation, and scheduling availability, visit their location in ${city} or browse their complete verified business profile on the San Diego Business Directory.`;
  }

  return [p1, p2, p3, p4];
}

/**
 * Returns a concise 150-160 character meta snippet for SEO description tags.
 */
export function getListingMetaSnippet(business: BusinessListing): string {
  const paragraphs = getListingAboutParagraphs(business);
  const first = paragraphs[0] || `${business.title} is a top-rated ${business.type} in ${business.city}, CA.`;
  if (first.length <= 160) return first;
  return first.substring(0, 157).replace(/\s+\S*$/, '') + '...';
}

/**
 * Generates Schema.org LocalBusiness structured data JSON-LD.
 */
export function generateLocalBusinessSchema(business: BusinessListing): Record<string, unknown> {
  const paragraphs = getListingAboutParagraphs(business);
  const description = paragraphs.join(' ');

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.title,
    description: description,
    url: `https://sandiegobusinesscircle.com/listing/${business.slug}`,
    image: business.thumbnail || business.coverImage || undefined,
    telephone: business.phone || undefined,
    priceRange: business.price || '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || undefined,
      addressLocality: business.city || 'San Diego',
      addressRegion: business.state || 'CA',
      postalCode: business.zip || undefined,
      addressCountry: 'US',
    },
  };

  const ratingValue = typeof business.rating === 'number' ? business.rating : parseFloat(String(business.rating || '0'));
  const reviewCount = typeof business.reviews === 'number' ? business.reviews : parseInt(String(business.reviews || '0'), 10);
  if (ratingValue > 0 && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (business.website) {
    schema.sameAs = [business.website];
  }

  return schema;
}

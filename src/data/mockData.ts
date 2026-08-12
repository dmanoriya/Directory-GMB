import { BusinessListing, BusinessReview, Category, LocationCity, BlogPost } from '@/types/directory';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Medical Spa & Wellness',
    slug: 'medical-spa',
    icon: 'Sparkles',
    description: 'Botox, cryo fat freezing, laser hair removal, lipo cavitation, and advanced skin care clinics.',
    count: 42,
    subcategories: ['Botox & Fillers', 'Laser Hair Removal', 'Fat Freezing & Cavitation', 'Facial & Skin Care', 'IV Therapy']
  },
  {
    id: 'cat-2',
    name: 'Plumbing',
    slug: 'plumbing',
    icon: 'Wrench',
    description: 'Emergency plumbing, drain cleaning, tankless water heaters, and leak detection.',
    count: 48,
    subcategories: ['Emergency Plumbing', 'Drain Cleaning', 'Water Heaters', 'Leak Detection']
  },
  {
    id: 'cat-3',
    name: 'HVAC & Air Conditioning',
    slug: 'hvac',
    icon: 'Thermometer',
    description: 'Top-rated AC repair, heating installation, duct cleaning, and heat pump maintenance.',
    count: 36,
    subcategories: ['AC Repair', 'Heating Installation', 'Duct Cleaning', 'Heat Pumps']
  },
  {
    id: 'cat-4',
    name: 'Roofing',
    slug: 'roofing',
    icon: 'Home',
    description: 'Licensed roof inspection, shingle replacement, tile repair, and new roof installation.',
    count: 39,
    subcategories: ['Roof Repair', 'Roof Replacement', 'Tile Roofing', 'Gutter Installation']
  },
  {
    id: 'cat-5',
    name: 'Electricians',
    slug: 'electricians',
    icon: 'Zap',
    description: 'Residential & commercial panel upgrades, EV chargers, smart lighting, and wiring.',
    count: 35,
    subcategories: ['EV Charger Install', 'Panel Upgrades', 'Lighting Design', 'Generator Install']
  },
  {
    id: 'cat-6',
    name: 'Solar Power & Storage',
    slug: 'solar',
    icon: 'Sun',
    description: 'San Diego solar panel installers, battery backup storage (Tesla Powerwall), and NEM 3.0 prep.',
    count: 31,
    subcategories: ['Solar Panel Installation', 'Battery Storage', 'EV Integration']
  },
  {
    id: 'cat-7',
    name: 'Landscaping & Turf',
    slug: 'landscaping',
    icon: 'Trees',
    description: 'Custom landscape design, artificial turf installation, irrigation, and hardscapes.',
    count: 51,
    subcategories: ['Artificial Turf', 'Landscape Design', 'Irrigation Repair', 'Hardscaping']
  },
  {
    id: 'cat-8',
    name: 'Pest Control',
    slug: 'pest-control',
    icon: 'Bug',
    description: 'Eco-friendly pest management, termite inspection, rodent control, and wildlife exclusion.',
    count: 27,
    subcategories: ['Termite Control', 'Rodent Proofing', 'Eco Pest Control']
  }
];

export const MOCK_CITIES: LocationCity[] = [
  {
    id: 'loc-sd',
    name: 'San Diego',
    slug: 'san-diego',
    county: 'San Diego County',
    state: 'CA',
    stateSlug: 'ca',
    zipCodes: ['92101', '92103', '92104', '92108', '92109', '92111'],
    count: 156,
    popularCategories: ['Medical Spa & Wellness', 'Plumbing', 'HVAC', 'Solar']
  },
  {
    id: 'loc-lj',
    name: 'La Jolla',
    slug: 'la-jolla',
    county: 'San Diego County',
    state: 'CA',
    stateSlug: 'ca',
    zipCodes: ['92037'],
    count: 48,
    popularCategories: ['Medical Spa & Wellness', 'Solar', 'Pool Services']
  },
  {
    id: 'loc-lm',
    name: 'La Mesa',
    slug: 'la-mesa',
    county: 'San Diego County',
    state: 'CA',
    stateSlug: 'ca',
    zipCodes: ['91941', '91942'],
    count: 32,
    popularCategories: ['Medical Spa & Wellness', 'Plumbing', 'Electricians']
  },
  {
    id: 'loc-cb',
    name: 'Carlsbad',
    slug: 'carlsbad',
    county: 'San Diego County',
    state: 'CA',
    stateSlug: 'ca',
    zipCodes: ['92008', '92009', '92011'],
    count: 58,
    popularCategories: ['Solar', 'Landscaping', 'HVAC']
  },
  {
    id: 'loc-ny',
    name: 'New York City',
    slug: 'new-york-city',
    county: 'New York County',
    state: 'NY',
    stateSlug: 'ny',
    zipCodes: ['10001', '10002', '10003'],
    count: 210,
    popularCategories: ['Medical Spa & Wellness', 'Plumbing', 'Electricians']
  },
  {
    id: 'loc-atx',
    name: 'Austin',
    slug: 'austin',
    county: 'Travis County',
    state: 'TX',
    stateSlug: 'tx',
    zipCodes: ['78701', '78702', '78704'],
    count: 142,
    popularCategories: ['Solar', 'HVAC', 'Medical Spa & Wellness']
  },
  {
    id: 'loc-mia',
    name: 'Miami',
    slug: 'miami',
    county: 'Miami-Dade County',
    state: 'FL',
    stateSlug: 'fl',
    zipCodes: ['33101', '33139', '33145'],
    count: 180,
    popularCategories: ['Medical Spa & Wellness', 'Pool Services', 'Roofing']
  }
];

export const MOCK_BUSINESSES: BusinessListing[] = [
  {
    placeId: 'ChIJ0fkVj7wB3IARJm1vn7X8pR0',
    dataId: '0x80dc01bc8f15f9d1:0x1da5fcb59f6f6d26',
    slug: 'skin-medical-spa-san-diego',
    title: 'Skin Medical Spa in San Diego | Skin Tightening | Cryo Fat Freezing | Lipo Cavitation',
    type: 'Medical spa',
    typeSlug: 'medical-spa',
    otherTypes: ['Medical spa'],
    address: '4501 Mission Bay Dr. #2A, San Diego, CA 92109',
    city: 'San Diego',
    citySlug: 'san-diego',
    state: 'CA',
    website: 'https://skinmedicalsd.com/',
    phone: '(858) 203-3422',
    price: '$$',
    rating: 4.9,
    reviews: 423,
    description: 'Premier medical spa in San Diego offering non-invasive skin tightening, cryo fat freezing, lipo cavitation, Botox, dermal fillers, and body contouring.',
    openState: 'Opens soon · 10 AM',
    workingHours: {
      days: [
        { day: 'Tuesday', date: '2026-3-17', time: '10 AM–6 PM' },
        { day: 'Wednesday', date: '2026-3-18', time: '10 AM–6 PM' },
        { day: 'Thursday', date: '2026-3-19', time: '10 AM–6 PM' },
        { day: 'Friday', date: '2026-3-20', time: '10 AM–6 PM' },
        { day: 'Saturday', date: '2026-3-21', time: '10 AM–6 PM' },
        { day: 'Sunday', date: '2026-3-22', time: '10 AM–6 PM' },
        { day: 'Monday', date: '2026-3-23', time: '10 AM–6 PM' }
      ],
      timezone: 'America/Los_Angeles'
    },
    serviceOptions: ['Wheelchair accessible entrance', 'Wheelchair accessible parking lot', 'Wheelchair accessible restroom'],
    thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoYZoG7gm9JyTD0obFa5yw3_yiKYk0be46XBawgGFaYPrdnSteqXJfC7WgASLZw9CatNoTR8slx15t6ounAtBmWAcqWjkC4l79ztvUBUdqbWNy6BT_JpSgpfV0HOdjK_eruQX3-yA=s1024-v1',
    latitude: 32.8034119,
    longitude: -117.2163332,
    keyword: 'Med Spa in San Diego, CA',
    googleMapsRank: 2,
    verified: true,
    claimed: true,
    featured: true
  },
  {
    placeId: 'ChIJGQjkifRX2YARx5s2DJoA0Mw',
    dataId: '0x80d957f489e40819:0xccd0009a0c369bc7',
    slug: 'san-diego-aesthetics-and-med-spa-la-mesa',
    title: 'San Diego Aesthetics and Med Spa',
    type: 'Medical spa',
    typeSlug: 'medical-spa',
    otherTypes: ['Medical spa', 'Skin care clinic'],
    address: '5464 Baltimore Dr, La Mesa, CA 91942',
    city: 'La Mesa',
    citySlug: 'la-mesa',
    state: 'CA',
    website: 'https://sdamedspa.com/',
    phone: '(619) 303-0988',
    price: '$$',
    rating: 5.0,
    reviews: 400,
    description: 'Top-rated women-owned aesthetic and skin care clinic specializing in advanced facial rejuvenation, Botox, microneedling, and laser treatments.',
    openState: 'Opens soon · 10 AM',
    workingHours: {
      days: [
        { day: 'Tuesday', date: '2026-3-17', time: '10 AM–6 PM' },
        { day: 'Wednesday', date: '2026-3-18', time: '9 AM–5 PM' },
        { day: 'Thursday', date: '2026-3-19', time: '10 AM–6 PM' },
        { day: 'Friday', date: '2026-3-20', time: '9 AM–4 PM' },
        { day: 'Saturday', date: '2026-3-21', time: '9 AM–2 PM' },
        { day: 'Sunday', date: '2026-3-22', time: 'Closed' },
        { day: 'Monday', date: '2026-3-23', time: '9 AM–5 PM' }
      ],
      timezone: 'America/Los_Angeles'
    },
    serviceOptions: ['Identifies as women-owned'],
    thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoEEorUBIf-fFtRH1WqCS5AAeqCXDq6Qal40gIrdDR9zCtiJQWX_24b-8314PPMpnD4ZDbf2_pmXuByXo4E5xrZ-j_wb4KjFlfeUglGyeue3_S8upJDseZzqCorkecxvJK_AXkz6FepuYfs=s1024-v1',
    latitude: 32.7791768,
    longitude: -117.0319377,
    keyword: 'Med Spa in San Diego, CA',
    googleMapsRank: 3,
    verified: true,
    claimed: true,
    featured: true
  },
  {
    placeId: 'ChIJKRiULyhV2YARvJ1rURXwXqI',
    dataId: '0x80d955282f941829:0xa25ef015516b9dbc',
    slug: 'aesthetica-med-spa-of-san-diego',
    title: 'Aesthetica Med Spa of San Diego',
    type: 'Medical spa',
    typeSlug: 'medical-spa',
    otherTypes: ['Medical spa', 'Facial spa', 'Hair removal service', 'Laser hair removal service', 'Skin care clinic', 'Tattoo removal service', 'Weight loss service'],
    address: '306 Walnut Ave # 32, San Diego, CA 92103',
    city: 'San Diego',
    citySlug: 'san-diego',
    state: 'CA',
    website: 'https://www.aestheticamedspasd.com/',
    phone: '(619) 204-5843',
    price: '$$$',
    rating: 4.9,
    reviews: 133,
    description: 'Comprehensive medical aesthetic clinic offering laser hair removal, facial spa treatments, tattoo removal, weight loss therapy, and men’s health.',
    openState: 'Opens soon · 10 AM',
    workingHours: {
      days: [
        { day: 'Tuesday', date: '2026-3-17', time: '10 AM–6 PM' },
        { day: 'Wednesday', date: '2026-3-18', time: '9 AM–5 PM' },
        { day: 'Thursday', date: '2026-3-19', time: '10 AM–6 PM' },
        { day: 'Friday', date: '2026-3-20', time: '9 AM–5 PM' },
        { day: 'Saturday', date: '2026-3-21', time: '10 AM–3 PM' },
        { day: 'Sunday', date: '2026-3-22', time: 'Closed' },
        { day: 'Monday', date: '2026-3-23', time: '10 AM–6 PM' }
      ],
      timezone: 'America/Los_Angeles'
    },
    serviceOptions: ['Identifies as LGBTQ+ owned', 'Identifies as Indigenous-owned'],
    thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAwepmlt5xNZ6b098kIUf8QrrsAxHF-Ze3b7Us1siZi1HaahWIlUA9UKbok5JpO2KflfNuYefLMPdZ4jmvTP1XCx_g1BzeEdoyAB1IkiSytYF-LBbrQYi5SqmyUks94hXhk-yNRNO-=s1024-v1',
    latitude: 32.7417591,
    longitude: -117.162457,
    keyword: 'Med Spa in San Diego, CA',
    googleMapsRank: 4,
    verified: true,
    claimed: true,
    featured: true
  },
  {
    placeId: 'ChIJVdWU0sYB3IARa0SbHLw5t9I',
    dataId: '0x80dc01c6d294d555:0xd2b739bc1c9b446b',
    slug: 'sdbotox-pacific-beach',
    title: 'SDBotox - Pacific Beach',
    type: 'Medical spa',
    typeSlug: 'medical-spa',
    otherTypes: ['Medical spa', 'Facial spa', 'Laser hair removal service', 'Skin care clinic'],
    address: '1707 Grand Ave, San Diego, CA 92109',
    city: 'San Diego',
    citySlug: 'san-diego',
    state: 'CA',
    website: 'https://www.sdbotox.com/',
    phone: '(844) 732-6869',
    price: '$$',
    rating: 4.9,
    reviews: 732,
    description: 'San Diego’s premier Botox & facial injectable destination in Pacific Beach. Expert injectors, dermal fillers, and laser skin resurfacing.',
    openState: 'Open · Closes 6 PM',
    workingHours: {
      days: [
        { day: 'Tuesday', date: '2026-3-17', time: '9 AM–6 PM' },
        { day: 'Wednesday', date: '2026-3-18', time: '9 AM–6 PM' },
        { day: 'Thursday', date: '2026-3-19', time: '9 AM–6 PM' },
        { day: 'Friday', date: '2026-3-20', time: '9 AM–6 PM' },
        { day: 'Saturday', date: '2026-3-21', time: '9 AM–3 PM' },
        { day: 'Sunday', date: '2026-3-22', time: 'Closed' },
        { day: 'Monday', date: '2026-3-23', time: '9 AM–6 PM' }
      ],
      timezone: 'America/Los_Angeles'
    },
    serviceOptions: ['Onsite services'],
    thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweq7yOmZRix9qyuM98W0oGnrDhLJ_e71K1UQgJWn0HGAWlEGuqROzq0OZ5Mj6MQEO0duGcG-fccN3ql9ZYMbSMYD7QhWFdbQ4XMVPGrU30EuMQwToL5TEtqWvR5nm6RZb_KJorD-=s1024-v1',
    latitude: 32.7979669,
    longitude: -117.2380993,
    keyword: 'Med Spa in San Diego, CA',
    googleMapsRank: 7,
    verified: true,
    claimed: true,
    featured: true
  },
  {
    placeId: 'ChIJ0ShIjzzpsygR1aLCzi56kTE',
    dataId: '0x28b3e93c8f4828d1:0x31917a2ecec2a2d5',
    slug: 'ta-med-spa-san-diego',
    title: 'Ta Med Spa',
    type: 'Medical spa',
    typeSlug: 'medical-spa',
    otherTypes: ['Medical spa', 'Skin care clinic'],
    address: '2333 First Ave. #101, San Diego, CA 92101',
    website: 'http://tamedspa.com/',
    phone: '(619) 566-6424',
    price: '$$',
    rating: 5.0,
    reviews: 18,
    city: 'San Diego',
    citySlug: 'san-diego',
    state: 'CA',
    description: 'Boutique medical spa in Downtown San Diego delivering personalized cosmetic injections, chemical peels, and medical grade skin treatments.',
    openState: 'Opens soon · 10 AM',
    workingHours: {
      days: [
        { day: 'Tuesday', date: '2026-3-17', time: '10 AM–6 PM' },
        { day: 'Wednesday', date: '2026-3-18', time: '10 AM–6 PM' },
        { day: 'Thursday', date: '2026-3-19', time: '10 AM–6 PM' },
        { day: 'Friday', date: '2026-3-20', time: '10 AM–6 PM' },
        { day: 'Saturday', date: '2026-3-21', time: '1–7 PM' },
        { day: 'Sunday', date: '2026-3-22', time: '12–6 PM' },
        { day: 'Monday', date: '2026-3-23', time: '10 AM–6 PM' }
      ],
      timezone: 'America/Los_Angeles'
    },
    serviceOptions: ['Wheelchair accessible entrance', 'Wheelchair accessible parking lot'],
    thumbnail: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweoZWsrHOTNHIR2jvQx5HEV4Pi-pHHoq7sBfDTrCA7IjVBJ-hxvhbBl9dBrlvq0Txyhqhju-rxI6VfLA-jeXcoTZnWRa1oN777pm1DamSCXnpGl9QOmbKlf5WTy7Blj1WD65csjinQ=s1024-v1',
    latitude: 32.7299093,
    longitude: -117.163679,
    keyword: 'Med Spa in San Diego, CA',
    googleMapsRank: 5,
    verified: true,
    claimed: true,
    featured: false
  }
];

export const MOCK_REVIEWS: BusinessReview[] = [
  {
    id: 'rev-101',
    businessPlaceId: 'ChIJ0fkVj7wB3IARJm1vn7X8pR0',
    businessSlug: 'skin-medical-spa-san-diego',
    reviewerName: 'Marcus Vance',
    rating: 5,
    title: 'Incredible Cryo Fat Freezing & Skin Tightening Results!',
    comment: 'The team at Skin Medical Spa in Mission Bay is top-tier. Extremely professional staff, spotless clean rooms, and zero downtime lipo cavitation. Highly recommend!',
    date: '2026-07-28',
    visitDate: '2026-07-27',
    verifiedCustomer: true,
    helpfulCount: 24,
    status: 'approved',
    ownerResponse: {
      date: '2026-07-29',
      comment: 'Thank you Marcus! We are thrilled you loved your cryo fat freezing results. Looking forward to seeing you at your next skin tightening session!',
      verifiedResponse: true
    }
  },
  {
    id: 'rev-102',
    businessPlaceId: 'ChIJGQjkifRX2YARx5s2DJoA0Mw',
    businessSlug: 'san-diego-aesthetics-and-med-spa-la-mesa',
    reviewerName: 'Elena Rostova',
    rating: 5,
    title: 'Best Med Spa in La Mesa!',
    comment: 'Clarissa and her staff are wonderful! My skin has never looked smoother after their microneedling and facial package. 5 stars all the way!',
    date: '2026-07-14',
    visitDate: '2026-07-12',
    verifiedCustomer: true,
    helpfulCount: 18,
    status: 'approved'
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: '2026 San Diego Guide to Cryo Fat Freezing vs. Lipo Cavitation',
    slug: 'san-diego-cryo-fat-freezing-guide-2026',
    excerpt: 'Compare top non-invasive body contouring treatments, costs, and top-rated medical spas in San Diego County.',
    content: 'Body contouring treatments like cryo fat freezing and lipo cavitation offer non-surgical solutions for stubborn fat areas...',
    author: 'Dr. Sarah Lin, Aesthetics Editor',
    date: 'August 2, 2026',
    category: 'Medical Spa & Wellness',
    readTime: '6 min read',
    coverImage: '/images/hero_medical_spa.jpg'
  },
  {
    id: 'post-2',
    title: 'Top Questions to Ask Before Choosing a San Diego Med Spa',
    slug: 'questions-to-ask-san-diego-med-spa',
    excerpt: 'Learn how to verify licensed nurse practitioners, medical director supervision, and Google Maps rankings when picking a skin clinic.',
    content: 'Before scheduling a Botox or dermal filler appointment, ensure the clinic operates under certified medical oversight...',
    author: 'Michael Vance, Healthcare Journalist',
    date: 'July 25, 2026',
    category: 'Beauty & Rejuvenation',
    readTime: '5 min read',
    coverImage: '/images/hero_storefront.jpg'
  }
];

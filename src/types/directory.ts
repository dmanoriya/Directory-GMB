export interface BusinessListing {
  id?: string;
  placeId: string; // UNIQUE KEY (e.g. ChIJ0fkVj7wB3IARJm1vn7X8pR0)
  dataId: string;
  slug: string;
  rawSlug?: string;
  title: string;
  type: string;
  typeSlug: string;
  otherTypes: string[];
  address: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug?: string;
  website: string;
  phone: string;
  price: string;
  rating: number;
  reviews: number;
  description: string;
  openState: string;
  workingHours: {
    days: { day: string; date: string; time: string }[];
    timezone: string;
  };
  serviceOptions: string[];
  thumbnail: string;
  latitude: number;
  longitude: number;
  keyword: string;
  googleMapsRank: number;
  verified?: boolean;
  claimed?: boolean;
  featured?: boolean;
  founderName?: string;
  founderRole?: string;
  founderExperience?: string;
  founderQuote?: string;
  founderAvatar?: string;
  licenseStatus?: string;
}

export interface ReviewPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface BusinessReview {
  id: string;
  businessPlaceId: string;
  businessSlug: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  visitDate?: string;
  photos?: ReviewPhoto[];
  verifiedCustomer: boolean;
  helpfulCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  source?: 'website' | 'google' | 'locable';
  googleReviewerPhoto?: string;
  ownerResponse?: {
    date: string;
    comment: string;
    verifiedResponse: boolean;
  };
  adminNotes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  count: number;
  subcategories: string[];
}

export interface LocationCity {
  id: string;
  name: string;
  slug: string;
  county: string;
  state: string;
  stateSlug?: string;
  zipCodes: string[];
  count: number;
  popularCategories: string[];
}

export interface FilterState {
  searchQuery: string;
  category: string;
  subcategory: string;
  location: string;
  state?: string;
  minRating: number;
  openNow: boolean;
  verifiedOnly: boolean;
  emergencyOnly: boolean;
  freeEstimatesOnly: boolean;
  sortBy: 'newest' | 'older' | 'name' | 'name-desc' | 'rating' | 'reviews' | 'recommended';
}

export interface LeadSubmission {
  id: string;
  type: 'claim_listing' | 'seo_audit' | 'contact_business' | 'advertise';
  businessName?: string;
  placeId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  message?: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'resolved';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  coverImage: string;
}

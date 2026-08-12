export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  accountStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SuggestedEdit {
  id: string;
  placeId: string;
  businessTitle: string;
  userEmail: string;
  userName: string;
  proposedPhone?: string;
  proposedWebsite?: string;
  proposedAddress?: string;
  proposedServices?: string;
  proposedDescription?: string;
  proposedHours?: string;
  editStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

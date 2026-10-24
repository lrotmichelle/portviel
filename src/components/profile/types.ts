export interface ProfileData {
  accountId: string;
  name: string;
  role: string;
  bio: string;
  dateJoined: string;
  rating: number;
  totalRatings: number;
  sales: number;
  invested: number;
  verified: boolean;
  verificationType: 'kyc' | 'admin' | null;
}

export interface DiscoverActivity {
  title: string;
  vacants: number;
  recruited: number;
}

export interface CampaignActivity {
  name: string;
  members: number;
  rank: number;
  amount: number;
}

export interface MarketActivity {
  account: string;
  type: 'sold' | 'purchased';
  amount: number;
}

export function getProfileData(accountId: string) {
  return {
    accountId,
    name: 'John Doe',
    role: 'Employer',
    bio: 'Passionate about building great products and connecting talent with opportunity.',
    dateJoined: '2025-01-15',
    rating: 4.5,
    totalRatings: 12,
    sales: 12500000,
    invested: 3200000,
    verified: false,
    verificationType: null,
  };
}

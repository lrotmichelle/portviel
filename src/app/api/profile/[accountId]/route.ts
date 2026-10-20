import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;

  // Mock profile data - replace with DB queries
  const profile = {
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
    discoverJobs: [
      { title: 'Social Media Manager', vacants: 3, recruited: 2 },
      { title: 'Frontend Developer', vacants: 5, recruited: 4 },
      { title: 'Graphics Illustrator', vacants: 2, recruited: 0 },
    ],
    campaigns: [
      { name: 'Brand Awareness Q1', members: 12, rank: 3, amount: 500000 },
      { name: 'Product Launch', members: 8, rank: 1, amount: 1200000 },
    ],
    marketTransactions: [
      { account: 'Acme Corp', type: 'sold', amount: 850000 },
      { account: 'Beta Inc', type: 'purchased', amount: 420000 },
      { account: 'Gamma Ltd', type: 'sold', amount: 1100000 },
    ],
  };

  return NextResponse.json(profile);
}

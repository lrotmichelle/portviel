import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const dataDir = path.join(process.cwd(), 'data', 'profile', accountId);

  try {
    const readJson = (file: string) => {
      const filePath = path.join(dataDir, file);
      if (!existsSync(filePath)) return null;
      return JSON.parse(readFileSync(filePath, 'utf8'));
    };

    const summary = readJson('account-summary.txt') || {};
    const discoverJobs = readJson('discover-activity.txt') || [];
    const campaigns = readJson('campaign-activity.txt') || [];
    const marketTransactions = readJson('market-activity.txt') || [];
    const bioData = readJson('account-bio.txt') || {};
    const ratingsData = readJson('account-ratings.txt') || {};
    const nameData = readJson('account-name.txt') || {};

    const profile = {
      accountId,
      name: nameData.name || summary.name || 'Unknown',
      role: summary.role || 'User',
      bio: bioData.bio || summary.bio || '',
      dateJoined: summary.dateJoined || 'N/A',
      rating: ratingsData.rating ?? summary.rating ?? 0,
      totalRatings: ratingsData.totalRatings ?? summary.totalRatings ?? 0,
      sales: summary.sales || 0,
      invested: summary.invested || 0,
      verified: summary.verified || false,
      verificationType: summary.verificationType || null,
      discoverJobs,
      campaigns,
      marketTransactions,
    };

    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Profile data error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { campaignMembers, campaigns } from '@/db/schema';
import { db, ensureDatabaseSchema } from '@/lib/db';
import { getMockCampaigns } from '@/lib/mockCampaigns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapCampaignRow(row: any, hasJoined = false) {
  return {
    id: String(row.id),
    publisherProfileIcon: row.publisherProfileIcon ?? '/images/publisher-placeholder.png',
    projectName: row.title,
    publisherUsername: row.createdBy,
    publisherRating: row.publisherRating,
    timeRemainingDays: row.timeRemainingDays,
    nicheHashtag: row.nicheHashtag,
    description: row.description,
    category: row.category,
    status: row.status,
    communitySize: row.communitySize,
    viewsGenerated: row.viewsGenerated,
    likesGenerated: row.likesGenerated,
    totalBudget: row.totalBudget,
    budgetUsed: row.budgetUsed,
    debit: row.debit,
    paid: row.paid,
    owe: row.owe,
    highestMcp: row.highestMcp,
    requiredPlatforms: row.requiredPlatforms ? row.requiredPlatforms.split(',').map((value: string) => value.trim()).filter(Boolean) : [],
    hasJoined,
    startDate: row.startDate?.toISOString() ?? '',
    minPayout: row.minPayout,
    maxPayout: row.maxPayout,
    createdAt: row.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const requestedUserId = toString(request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId'), 'demo-user');
  const requestedFilter = toString(request.nextUrl.searchParams.get('filter'), '');
  try {
    await ensureDatabaseSchema();
    const userId = requestedUserId;
    const filter = requestedFilter;

    const personMemberships = await db.select().from(campaignMembers).where(eq(campaignMembers.userId, userId));
    const joinedCampaignIds = new Set(personMemberships.filter((member) => member.status === 'active').map((member) => member.campaignId));
    let rows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(100);

    if (filter === 'created') rows = rows.filter((row) => row.createdBy === userId);
    else if (filter === 'joined') rows = rows.filter((row) => joinedCampaignIds.has(row.id));
    else if (filter !== 'all') rows = rows.filter((row) => row.status.toLowerCase() === 'active');

    const databaseCampaigns = rows.map((row) => mapCampaignRow(row, joinedCampaignIds.has(row.id)));
    const mockFilter = filter === 'created' || filter === 'joined' ? filter : 'all';
    const mockIdentity = toString(request.nextUrl.searchParams.get('mockIdentity'), userId);
    const mockCampaigns = getMockCampaigns(mockIdentity, mockFilter)
      .filter((campaign) => filter === 'all' || filter === 'created' || filter === 'joined' || campaign.status === 'Active');
    const databaseIds = new Set(databaseCampaigns.map((campaign) => campaign.id));
    return NextResponse.json([...databaseCampaigns, ...mockCampaigns.filter((campaign) => !databaseIds.has(campaign.id))]);
  } catch (error) {
    console.error('Failed to load campaigns', error);
    const filter = requestedFilter === 'created' || requestedFilter === 'joined' ? requestedFilter : 'all';
    const mockIdentity = toString(request.nextUrl.searchParams.get('mockIdentity'), requestedUserId);
    const mockCampaigns = getMockCampaigns(mockIdentity, filter)
      .filter((campaign) => requestedFilter === 'all' || requestedFilter === 'created' || requestedFilter === 'joined' || campaign.status === 'Active');
    return NextResponse.json(mockCampaigns, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = toString(request.headers.get('x-user-id') ?? body.userId ?? body.createdBy, 'demo-user');
    const title = toString(body.title, '');
    const description = toString(body.description, '');
    const category = toString(body.category, 'Technology');
    const nicheHashtag = toString(body.nicheHashtag ?? body.niche, 'growth');
    const totalBudget = toNumber(body.totalBudget ?? body.budget, 1000);
    const timeRemainingDays = toNumber(body.timeRemainingDays ?? body.daysRemaining, 14);
    const communitySize = toNumber(body.communitySize, 12000);
    const publisherRating = toNumber(body.publisherRating, 4.8);

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const [created] = await db.insert(campaigns).values({
      title,
      description,
      category,
      nicheHashtag,
      createdBy: userId,
      status: 'active',
      totalBudget,
      budgetUsed: 0,
      timeRemainingDays,
      publisherRating,
      publisherProfileIcon: '/images/publisher-placeholder.png',
      communitySize,
      viewsGenerated: 0,
      likesGenerated: 0,
      highestMcp: 100,
      requiredPlatforms: '',
    }).returning();

    return NextResponse.json({ ok: true, item: mapCampaignRow(created) });
  } catch (error) {
    console.error('Unable to create campaign', error);
    return NextResponse.json({ error: 'Unable to create campaign' }, { status: 500 });
  }
}

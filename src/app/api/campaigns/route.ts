import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Campaign } from '@/generated/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapCampaignRow(row: Campaign & { members?: { id: number }[] }, hasJoined = false) {
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
    highestMcp: row.highestMcp,
    requiredPlatforms: row.requiredPlatforms ? row.requiredPlatforms.split(',').map((value) => value.trim()).filter(Boolean) : [],
    hasJoined,
    startDate: row.startDate?.toISOString() ?? '',
    minPayout: row.minPayout,
    maxPayout: row.maxPayout,
    createdAt: row.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = toString(request.headers.get('x-user-id') ?? request.nextUrl.searchParams.get('userId'), 'demo-user');
    const filter = toString(request.nextUrl.searchParams.get('filter'), '');

    const where: any = {};
    const include = {
      members: {
        where: {
          userId,
          status: 'active',
        },
        select: { id: true },
      },
    };

    if (filter === 'created') {
      where.createdBy = userId;
    } else if (filter === 'joined') {
      where.members = {
        some: {
          userId,
          status: 'active',
        },
      };
    } else {
      where.status = 'active';
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: filter === 'joined' ? undefined : include,
    });

    if (filter === 'joined') {
      return NextResponse.json(campaigns.map((campaign) => mapCampaignRow(campaign as Campaign, true)));
    }

    return NextResponse.json(
      campaigns.map((campaign) =>
        mapCampaignRow(campaign as Campaign & { members?: { id: number }[] }, (campaign as any).members?.length > 0)
      )
    );
  } catch (error) {
    console.error('Failed to load campaigns', error);
    return NextResponse.json([], { status: 500 });
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

    const created = await prisma.campaign.create({
      data: {
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
      },
    });

    return NextResponse.json({ ok: true, item: mapCampaignRow(created) });
  } catch (error) {
    console.error('Unable to create campaign', error);
    return NextResponse.json({ error: 'Unable to create campaign' }, { status: 500 });
  }
}

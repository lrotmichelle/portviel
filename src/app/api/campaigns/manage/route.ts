import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { campaigns } from '@/db/schema';
import { db, ensureDatabaseSchema } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function parseArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function mapCampaignRow(row: any) {
  return {
    id: String(row.id),
    publisherProfileIcon: row.publisherProfileIcon,
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
    requiredPlatforms: row.requiredPlatforms ? row.requiredPlatforms.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
    startDate: row.startDate?.toISOString() ?? '',
    minPayout: row.minPayout ?? undefined,
    maxPayout: row.maxPayout ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseSchema();
    const body = await request.json().catch(() => ({}));
    const userId = toString(request.headers.get('x-user-id') ?? body.userId ?? body.createdBy, 'demo-user');
    const action = toString(body.action ?? body.mode, '').toLowerCase();
    const campaignId = toNumber(body.campaignId ?? body.id);

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'create') {
      const title = toString(body.title, '');
      const description = toString(body.description, '');
      const category = toString(body.category, 'Technology');
      const nicheHashtag = toString(body.nicheHashtag ?? body.niche, 'growth');
      const totalBudget = toNumber(body.totalBudget ?? body.budget, 1000);
      const timeRemainingDays = toNumber(body.timeRemainingDays ?? body.timeRemaining, 14);
      const publishFee = toNumber(body.publishFee, 1000);
      const requiredPlatforms = parseArray(body.requiredPlatforms ?? body.required_platforms).join(',');
      const startDateValue = toString(body.startDate ?? body.start_date, '');
      const minPayout = toNumber(body.minPayout ?? body.min_payout, 0);
      const maxPayout = toNumber(body.maxPayout ?? body.max_payout, 0);

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
        publisherRating: 4.8,
        publisherProfileIcon: '/images/publisher-placeholder.png',
        communitySize: 12000,
        viewsGenerated: 10000,
        likesGenerated: 1500,
        highestMcp: 100,
        requiredPlatforms,
        publishFee,
        startDate: startDateValue ? new Date(startDateValue) : null,
        minPayout,
        maxPayout,
      }).returning();

      return NextResponse.json({ ok: true, item: mapCampaignRow(created) });
    }

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign id is required' }, { status: 400 });
    }

    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (action === 'update') {
      if (campaign.createdBy !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can update it' }, { status: 403 });
      }

      const updateData: Record<string, unknown> = {};
      if (body.title) updateData.title = toString(body.title);
      if (body.description) updateData.description = toString(body.description);
      if (body.category) updateData.category = toString(body.category);
      if (body.status) updateData.status = toString(body.status);
      if (body.totalBudget !== undefined) updateData.totalBudget = toNumber(body.totalBudget);
      if (body.budgetUsed !== undefined) updateData.budgetUsed = toNumber(body.budgetUsed);
      if (body.viewsGenerated !== undefined) updateData.viewsGenerated = toNumber(body.viewsGenerated);
      if (body.likesGenerated !== undefined) updateData.likesGenerated = toNumber(body.likesGenerated);
      if (body.timeRemainingDays !== undefined) updateData.timeRemainingDays = toNumber(body.timeRemainingDays);
      if (body.minPayout !== undefined) updateData.minPayout = toNumber(body.minPayout);
      if (body.maxPayout !== undefined) updateData.maxPayout = toNumber(body.maxPayout);
      if (body.startDate !== undefined) updateData.startDate = toString(body.startDate) ? new Date(toString(body.startDate)) : null;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: true, message: 'No updates provided' });
      }

      await db.update(campaigns)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(campaigns.id, campaignId));

      return NextResponse.json({ ok: true, message: 'Campaign updated successfully' });
    }

    if (action === 'pause' || action === 'resume') {
      if (campaign.createdBy !== userId) {
        return NextResponse.json({ error: `Only the campaign creator can ${action} it` }, { status: 403 });
      }

      await db.update(campaigns)
        .set({
          status: action === 'pause' ? 'paused' : 'active',
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId));

      return NextResponse.json({ ok: true, message: `Campaign ${action}d` });
    }

    if (action === 'delete') {
      if (campaign.createdBy !== userId) {
        return NextResponse.json({ error: 'Only the campaign creator can delete it' }, { status: 403 });
      }

      await db.delete(campaigns).where(eq(campaigns.id, campaignId));
      return NextResponse.json({ ok: true, message: 'Campaign deleted' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Campaign management failed', error);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}

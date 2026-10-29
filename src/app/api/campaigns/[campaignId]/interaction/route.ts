import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { authCampaignStars } from '@/db/schema/auth';
import { campaignMembers, campaigns } from '@/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isEnded(status: string, daysRemaining: number) {
  return ['ended', 'complete', 'completed', 'expired'].includes(status.toLowerCase()) || daysRemaining <= 0;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { campaignId: rawId } = await params;
  const campaignId = Number(rawId);
  if (!Number.isSafeInteger(campaignId) || campaignId <= 0) return NextResponse.json({ error: 'Invalid campaign' }, { status: 400 });

  try {
    const body = await request.json();
    const action = body?.action;
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    const isOwner = String(campaign.createdBy) === String(userId);
    const ended = isEnded(campaign.status, campaign.timeRemainingDays);

    if (action === 'pause' || action === 'activate' || action === 'end') {
      if (!isOwner) return NextResponse.json({ error: 'Only the campaign owner can change campaign status.' }, { status: 403 });
      if (ended) return NextResponse.json({ error: 'This campaign has already ended.' }, { status: 409 });
      const currentStatus = campaign.status.toLowerCase();
      if (action === 'pause' && currentStatus !== 'active') return NextResponse.json({ error: 'Only active campaigns can be paused.' }, { status: 409 });
      if (action === 'activate' && currentStatus !== 'paused') return NextResponse.json({ error: 'Only paused campaigns can be activated.' }, { status: 409 });
      if (action === 'end' && !['active', 'paused'].includes(currentStatus)) return NextResponse.json({ error: 'Only active or paused campaigns can be ended.' }, { status: 409 });
      const status = action === 'pause' ? 'paused' : action === 'activate' ? 'active' : 'ended';
      await db.update(campaigns).set({ status, ...(action === 'end' ? { timeRemainingDays: 0 } : {}), updatedAt: new Date() }).where(eq(campaigns.id, campaignId));
      return NextResponse.json({ ok: true, status });
    }

    if (action === 'join') {
      if (isOwner) return NextResponse.json({ error: 'Campaign owners cannot join their own campaign.' }, { status: 403 });
      if (ended || campaign.status.toLowerCase() !== 'active') return NextResponse.json({ error: 'This campaign is not accepting members.' }, { status: 409 });
      const [existing] = await db.select().from(campaignMembers)
        .where(and(eq(campaignMembers.campaignId, campaignId), eq(campaignMembers.userId, String(userId)), eq(campaignMembers.status, 'active')))
        .limit(1);
      if (!existing) {
        await db.insert(campaignMembers).values({ campaignId, userId: String(userId), status: 'active' });
        await db.update(campaigns).set({ communitySize: campaign.communitySize + 1, updatedAt: new Date() }).where(eq(campaigns.id, campaignId));
      }
      return NextResponse.json({ ok: true, joined: true });
    }

    if (action === 'leave') {
      if (ended) return NextResponse.json({ error: 'Ended campaign memberships cannot be changed.' }, { status: 409 });
      const [existing] = await db.select().from(campaignMembers)
        .where(and(eq(campaignMembers.campaignId, campaignId), eq(campaignMembers.userId, String(userId)), eq(campaignMembers.status, 'active')))
        .limit(1);
      if (existing) {
        await db.delete(campaignMembers).where(eq(campaignMembers.id, existing.id));
        await db.update(campaigns).set({ communitySize: Math.max(0, campaign.communitySize - 1), updatedAt: new Date() }).where(eq(campaigns.id, campaignId));
      }
      return NextResponse.json({ ok: true, joined: false });
    }

    if (action === 'star') {
      if (isOwner) return NextResponse.json({ error: 'Campaign owners cannot star their own campaign.' }, { status: 403 });
      if (ended) return NextResponse.json({ error: 'Ended campaigns can no longer be starred.' }, { status: 409 });
      const numericUserId = Number(userId);
      if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0) return NextResponse.json({ error: 'Invalid user session.' }, { status: 400 });
      await db.insert(authCampaignStars).values({ campaignId, userId: numericUserId }).onConflictDoNothing();
      const votes = await db.select().from(authCampaignStars).where(eq(authCampaignStars.campaignId, campaignId));
      return NextResponse.json({ ok: true, starred: true, stars: votes.length });
    }

    return NextResponse.json({ error: 'Unsupported campaign action.' }, { status: 400 });
  } catch (error) {
    console.error('Campaign interaction failed:', error);
    return NextResponse.json({ error: 'Unable to update campaign.' }, { status: 500 });
  }
}

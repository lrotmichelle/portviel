import { and, avg, count, eq, inArray, or, sql, sum } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/db/client';
import { authUsers } from '@/db/schema/auth';
import { campaignCampaigns } from '@/db/schema/campaign';
import { campaignMembers } from '@/db/schema/campaign';
import { discoverVacancies } from '@/db/schema/discover';
import { financeWalletTransactions } from '@/db/schema/finance';
import { marketListings, marketTransactions } from '@/db/schema/market';
import { authUserRatings } from '@/db/schema/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const usernamePattern = /^[a-z][a-z0-9_.]{2,23}$/;

async function getCurrentUser() {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id)).limit(1);
  return user ?? null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [incomeResult, investmentResult, discoverJobs, campaigns, transactions, ratingSummary] = await Promise.all([
      db
        .select({ total: sum(financeWalletTransactions.amount) })
        .from(financeWalletTransactions)
        .where(and(
          eq(financeWalletTransactions.userId, user.id),
          inArray(financeWalletTransactions.type, ['campaign_payout', 'campaign_income', 'sale']),
          inArray(financeWalletTransactions.status, ['completed', 'settled']),
        )),
      db
        .select({ total: sum(campaignCampaigns.budgetUsed) })
        .from(campaignCampaigns)
        .where(eq(campaignCampaigns.createdBy, user.id)),
      db
        .select({
          id: discoverVacancies.id,
          title: discoverVacancies.title,
          vacants: discoverVacancies.requiredPeople,
          recruited: discoverVacancies.accepted,
        })
        .from(discoverVacancies)
        .where(eq(discoverVacancies.createdBy, user.id))
        .orderBy(sql`${discoverVacancies.createdAt} DESC`)
        .limit(10),
      db
        .select({
          id: campaignCampaigns.id,
          name: campaignCampaigns.title,
          members: count(campaignMembers.id),
          amount: campaignCampaigns.budgetUsed,
          status: campaignCampaigns.status,
        })
        .from(campaignCampaigns)
        .leftJoin(campaignMembers, and(
          eq(campaignMembers.campaignId, campaignCampaigns.id),
          eq(campaignMembers.status, 'active'),
        ))
        .where(eq(campaignCampaigns.createdBy, user.id))
        .groupBy(campaignCampaigns.id)
        .orderBy(sql`${campaignCampaigns.createdAt} DESC`)
        .limit(10),
      db
        .select({
          id: marketTransactions.id,
          account: marketListings.title,
          type: marketTransactions.type,
          amount: marketTransactions.amount,
          createdAt: marketTransactions.createdAt,
        })
        .from(marketTransactions)
        .leftJoin(marketListings, eq(marketTransactions.listingId, marketListings.id))
        .where(or(eq(marketTransactions.buyerId, user.id), eq(marketTransactions.sellerId, user.id)))
        .orderBy(sql`${marketTransactions.createdAt} DESC`)
        .limit(10),
      db
        .select({ rating: avg(authUserRatings.rating), total: count(authUserRatings.id) })
        .from(authUserRatings)
        .where(eq(authUserRatings.targetUserId, user.id)),
    ]);

    const ratingCap = user.isKycVerified ? 4.8 : 3.5;
    const rating = Math.min(Number(ratingSummary[0]?.rating ?? 0), ratingCap);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.profileBio ?? '',
      role: user.role,
      isVerified: user.isKycVerified,
      nameLocked: user.nameLocked,
      kycStatus: user.kycStatus,
      joinedAt: user.createdAt,
      income: Number(incomeResult[0]?.total ?? 0),
      invested: Number(investmentResult[0]?.total ?? 0),
      discoverJobs,
      campaigns: campaigns.map((campaign) => ({ ...campaign, amount: Number(campaign.amount ?? 0) })),
      marketTransactions: transactions.map((transaction) => ({
        ...transaction,
        type: transaction.type === 'sale' ? 'sold' : transaction.type === 'purchase' ? 'purchased' : transaction.type,
        amount: Number(transaction.amount),
      })),
      rating,
      totalRatings: Number(ratingSummary[0]?.total ?? 0),
      ratingCap,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }
    const input = body as { name?: unknown; username?: unknown; bio?: unknown };
    const updates: Partial<typeof authUsers.$inferInsert> = { updatedAt: new Date() };

    if (input.name !== undefined) {
      if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 255) {
        return NextResponse.json({ error: 'Name must be 1–255 characters' }, { status: 400 });
      }
      if (user.nameLocked || user.isKycVerified) {
        return NextResponse.json({ error: 'Your verified legal name is locked. Contact support to request a change.' }, { status: 403 });
      }
      updates.name = input.name.trim();
    }

    if (input.username !== undefined) {
      if (typeof input.username !== 'string' && input.username !== null) {
        return NextResponse.json({ error: 'Username must be text' }, { status: 400 });
      }
      const username = typeof input.username === 'string'
        ? input.username.trim().replace(/^@/, '').toLowerCase()
        : '';
      if (!username) {
        updates.username = null;
      } else {
        if (!usernamePattern.test(username)) {
          return NextResponse.json({ error: 'Username must be 3–24 characters, start with a letter, and use only letters, numbers, dots, or underscores.' }, { status: 400 });
        }
        const [taken] = await db
          .select({ id: authUsers.id })
          .from(authUsers)
          .where(sql`LOWER(${authUsers.username}) = ${username}`)
          .limit(1);
        if (taken && taken.id !== user.id) {
          return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 });
        }
        updates.username = username;
      }
    }

    if (input.bio !== undefined) {
      if (typeof input.bio !== 'string' || input.bio.length > 400) {
        return NextResponse.json({ error: 'Bio must be 400 characters or fewer.' }, { status: 400 });
      }
      updates.profileBio = input.bio.trim();
    }

    const [updated] = await db
      .update(authUsers)
      .set(updates)
      .where(eq(authUsers.id, user.id))
      .returning();

    return NextResponse.json({
      name: updated.name,
      username: updated.username,
      bio: updated.profileBio ?? '',
      nameLocked: updated.nameLocked,
      isVerified: updated.isKycVerified,
      kycStatus: updated.kycStatus,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

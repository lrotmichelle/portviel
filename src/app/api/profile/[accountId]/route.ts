import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { and, eq, inArray, or } from 'drizzle-orm';

import { authUserRatings, authUsers } from '@/db/schema/auth';
import { campaignMembers, campaigns } from '@/db/schema';
import { marketTransactions } from '@/db/schema/market';
import { financeWalletTransactions } from '@/db/schema/finance';
import { db } from '@/lib/db';
import { getMockPublicProfile } from '@/lib/mockProfiles';
import { getMockProfileFinanceTotals } from '@/lib/mockCampaigns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const normalizedId = accountId.replace(/^acc-/, '');

  const mockProfile = getMockPublicProfile(accountId);
  if (mockProfile) {
    const totals = getMockProfileFinanceTotals(mockProfile.username, mockProfile.marketTransactions);
    return NextResponse.json({ ...mockProfile, sales: totals.income, invested: totals.invested }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }

  const numericId = Number(normalizedId);
  if (Number.isSafeInteger(numericId) && numericId > 0) {
    try {
      const [user] = await db.select().from(authUsers).where(eq(authUsers.id, numericId)).limit(1);
      if (user) {
        const fixtureProfile = getMockPublicProfile(user.username || user.name);
        if (fixtureProfile) {
          const totals = getMockProfileFinanceTotals(fixtureProfile.username, fixtureProfile.marketTransactions);
          const ratings = await db.select({ rating: authUserRatings.rating }).from(authUserRatings).where(eq(authUserRatings.targetUserId, user.id));
          const ratingTotal = ratings.reduce((sum, item) => sum + item.rating, 0);
          return NextResponse.json({
            ...fixtureProfile,
            accountId,
            name: user.name,
            username: user.username || fixtureProfile.username,
            role: user.role || fixtureProfile.role,
            bio: user.profileBio || fixtureProfile.bio,
            sales: totals.income,
            invested: totals.invested,
            rating: ratings.length ? ratingTotal / ratings.length : fixtureProfile.rating,
            totalRatings: ratings.length || fixtureProfile.totalRatings,
            verified: user.isKycVerified || fixtureProfile.verified,
            verificationType: user.isKycVerified ? 'kyc' : fixtureProfile.verificationType,
          }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }
        const [ratings, createdCampaignRows, membershipRows, marketRows, walletRows] = await Promise.all([
          db.select({ rating: authUserRatings.rating }).from(authUserRatings).where(eq(authUserRatings.targetUserId, user.id)),
          db.select({ id: campaigns.id, paid: campaigns.paid }).from(campaigns).where(eq(campaigns.createdBy, String(user.id))),
          db.select({ amount: campaignMembers.amount }).from(campaignMembers).where(and(eq(campaignMembers.userId, String(user.id)), eq(campaignMembers.status, 'active'))),
          db.select({ type: marketTransactions.type, amount: marketTransactions.amount }).from(marketTransactions)
            .where(and(or(eq(marketTransactions.buyerId, user.id), eq(marketTransactions.sellerId, user.id)), inArray(marketTransactions.status, ['completed', 'settled']))),
          db.select({ type: financeWalletTransactions.type, amount: financeWalletTransactions.amount })
            .from(financeWalletTransactions)
            .where(and(eq(financeWalletTransactions.userId, user.id), inArray(financeWalletTransactions.status, ['completed', 'settled']))),
        ]);
        const sumTypes = (rows: { type: string; amount: number }[], types: string[]) => rows
          .filter((item) => types.includes(item.type.toLowerCase()))
          .reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const ledgerCampaignIncome = sumTypes(walletRows, ['campaign_income']);
        const ledgerCampaignPayouts = sumTypes(walletRows, ['campaign_payout']);
        const ledgerMarketSales = sumTypes(walletRows, ['sale', 'sold']);
        const ledgerMarketPurchases = sumTypes(walletRows, ['purchase', 'purchased']);
        const marketSalesFromMarket = sumTypes(marketRows, ['sale', 'sold']);
        const marketPurchasesFromMarket = sumTypes(marketRows, ['purchase', 'purchased']);
        const marketSales = marketSalesFromMarket || ledgerMarketSales;
        const marketPurchases = marketPurchasesFromMarket || ledgerMarketPurchases;
        const campaignIncome = ledgerCampaignIncome || membershipRows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const campaignPayouts = ledgerCampaignPayouts || createdCampaignRows.reduce((sum, item) => sum + Number(item.paid || 0), 0);
        const ratingTotal = ratings.reduce((sum, item) => sum + item.rating, 0);
        return NextResponse.json({
          accountId,
          name: user.name,
          username: user.username || user.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          role: user.role,
          bio: user.profileBio || '',
          dateJoined: user.createdAt.toLocaleDateString('en-GB'),
          rating: ratings.length ? ratingTotal / ratings.length : 0,
          totalRatings: ratings.length,
          sales: campaignIncome + marketSales,
          invested: campaignPayouts + marketPurchases,
          verified: user.isKycVerified,
          verificationType: user.isKycVerified ? 'kyc' : null,
          discoverJobs: [],
          campaigns: [],
          marketTransactions: [],
        }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
      }
    } catch (error) {
      console.error('Unable to load public user profile:', error);
    }
  }

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

    const marketSales = marketTransactions.filter((item: { type?: string }) => ['sale', 'sold'].includes(String(item.type).toLowerCase())).reduce((sum: number, item: { amount?: number }) => sum + (Number(item.amount) || 0), 0);
    const marketPurchases = marketTransactions.filter((item: { type?: string }) => ['purchase', 'purchased'].includes(String(item.type).toLowerCase())).reduce((sum: number, item: { amount?: number }) => sum + (Number(item.amount) || 0), 0);
    const campaignIncome = campaigns.reduce((sum: number, item: { income?: number; memberIncome?: number; amount?: number }) => sum + (Number(item.income ?? item.memberIncome ?? item.amount) || 0), 0);
    const campaignPayouts = campaigns.reduce((sum: number, item: { payout?: number; paid?: number; campaignPayout?: number }) => sum + (Number(item.payout ?? item.paid ?? item.campaignPayout) || 0), 0);
    const profile = {
      accountId,
      name: nameData.name || summary.name || 'Unknown',
      role: summary.role || 'User',
      bio: bioData.bio || summary.bio || '',
      dateJoined: summary.dateJoined || 'N/A',
      rating: ratingsData.rating ?? summary.rating ?? 0,
      totalRatings: ratingsData.totalRatings ?? summary.totalRatings ?? 0,
      sales: campaignIncome + marketSales,
      invested: campaignPayouts + marketPurchases,
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


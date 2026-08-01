import type { MarketCardData } from '@/types';
import { desc } from 'drizzle-orm';

import { marketListings } from '@/db/schema';
import { db } from '@/lib/db';

function computeViews(row: any): number {
  return Math.max(500, Math.round(row.followers * 2 + row.likes * 1.5 + row.engagementRate * 25));
}

function mapMarketListing(row: any): MarketCardData {
  return {
    id: String(row.id),
    sellerName: row.createdBy,
    sellerUsername: row.handle ?? 'seller',
    sellerAvatar: undefined,
    description: row.description,
    handle: row.handle ?? 'seller',
    followers: row.followers,
    likes: row.likes,
    views: computeViews(row),
    erCurrentRatio: row.engagementRate,
    erPreviousRatio: 0,
    vlCurrentRatio: row.engagementRate,
    vlPreviousRatio: 0,
    productPriceRaw: row.price,
    valueRaw: row.price,
    sellerBuys: 0,
    sellerSells: 0,
    sellerStars: 4.8,
    isAdminVerified: true,
    createdAt: row.createdAt.toISOString(),
    offersCount: 0,
    sentimentRate: row.engagementRate,
  };
}

export async function getMarketCards(): Promise<MarketCardData[]> {
  const rows = await db.select().from(marketListings)
    .orderBy(desc(marketListings.createdAt))
    .limit(12);

  return rows.map(mapMarketListing);
}

import type { MarketCardData } from '@/types';
import { desc } from 'drizzle-orm';

import { marketListings } from '@/db/schema';
import { db } from '@/lib/db';

function computeViews(row: { followers?: number; likes?: number; engagementRate?: number }): number {
  return Math.max(500, Math.round((row.followers ?? 0) * 2 + (row.likes ?? 0) * 1.5 + (row.engagementRate ?? 0) * 25));
}

function mapMarketListing(row: { id: number; createdBy?: string | null; handle?: string | null; description?: string | null; followers?: number | null; likes?: number | null; engagementRate?: number | null; price?: number | null; createdAt: Date | string; }): MarketCardData {
  return {
    id: String(row.id),
    sellerName: 'Portville Seller',
    sellerUsername: 'portville-seller',
    sellerAvatar: undefined,
    description: row.description,
    handle: row.handle ?? 'seller',
    followers: Number(row.followers ?? 0),
    likes: Number(row.likes ?? 0),
    views: Number(row.views ?? computeViews(row)),
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

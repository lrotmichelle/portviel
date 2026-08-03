import type { MarketCardData } from '@/types';
import { desc } from 'drizzle-orm';

import { marketListings } from '@/db/schema';
import { db } from '@/lib/db';

function computeViews(row: { followers?: number | null; likes?: number | null; engagementRate?: number | null }): number {
  return Math.max(500, Math.round((row.followers ?? 0) * 2 + (row.likes ?? 0) * 1.5 + (row.engagementRate ?? 0) * 25));
}

function mapMarketListing(row: { id: number; createdBy?: string | null; handle?: string | null; description?: string | null; followers?: number | null; likes?: number | null; engagementRate?: number | null; price?: number | null; createdAt: Date | string; }): MarketCardData {
  const description = typeof row.description === 'string' && row.description.trim() ? row.description : 'New market listing';
  const handle = typeof row.handle === 'string' && row.handle.trim() ? row.handle : 'seller';
  const engagementRate = Number(row.engagementRate ?? 0);
  const price = Number(row.price ?? 0);

  return {
    id: String(row.id),
    sellerName: 'Portville Seller',
    sellerUsername: 'portville-seller',
    sellerAvatar: undefined,
    description,
    handle,
    followers: Number(row.followers ?? 0),
    likes: Number(row.likes ?? 0),
    views: computeViews(row),
    erCurrentRatio: engagementRate,
    erPreviousRatio: 0,
    vlCurrentRatio: engagementRate,
    vlPreviousRatio: 0,
    productPriceRaw: price,
    valueRaw: price,
    sellerBuys: 0,
    sellerSells: 0,
    sellerStars: 4.8,
    isAdminVerified: true,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date(row.createdAt).toISOString(),
    offersCount: 0,
    sentimentRate: engagementRate,
  };
}

export async function getMarketCards(): Promise<MarketCardData[]> {
  const rows = await db.select().from(marketListings)
    .orderBy(desc(marketListings.createdAt))
    .limit(12);

  return rows.map(mapMarketListing);
}

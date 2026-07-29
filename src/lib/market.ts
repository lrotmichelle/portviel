import type { MarketCardData } from '@/types';
import type { MarketListing } from '@/generated/prisma/client';
import { prisma } from './prisma';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatCount(value: number): string {
  return value.toLocaleString();
}

function toString(value: unknown, fallback = 'Seller') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapMarketListing(row: MarketListing): MarketCardData {
  return {
    id: String(row.id),
    sellerName: row.createdBy,
    sellerUsername: row.handle ?? 'seller',
    sellerAvatar: undefined,
    description: row.description,
    handle: row.handle ?? 'seller',
    followers: formatCount(row.followers),
    likes: formatCount(row.likes),
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
  const rows = await prisma.marketListing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  return rows.map(mapMarketListing);
}

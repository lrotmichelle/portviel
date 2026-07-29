import type { Offer, Order } from '@/types';
import { prisma } from './prisma';

function toNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapOrder(row: any): Order {
  return {
    id: String(row.id),
    type: (row.type as Order['type']) ?? 'buy',
    cardId: row.cardId,
    buyerId: row.buyerId,
    buyerName: row.buyerName ?? 'Buyer',
    sellerName: row.sellerName,
    productPriceRaw: toNumber(row.productPriceRaw ?? row.price ?? 0, 500),
    offeredPrice: row.offeredPrice !== undefined ? toNumber(row.offeredPrice, 0) : undefined,
    description: toString(row.description, undefined),
    status: (row.status as Order['status']) ?? 'pending',
    createdAt: row.createdAt ?? new Date().toISOString(),
    followers: row.followers !== undefined ? toNumber(row.followers, 3000) : undefined,
    likes: row.likes !== undefined ? toNumber(row.likes, 12000) : undefined,
    erCurrentRatio: row.erCurrentRatio !== undefined ? toNumber(row.erCurrentRatio, 0) : undefined,
    erPreviousRatio: row.erPreviousRatio !== undefined ? toNumber(row.erPreviousRatio, 0) : undefined,
    vlCurrentRatio: row.vlCurrentRatio !== undefined ? toNumber(row.vlCurrentRatio, 0) : undefined,
    vlPreviousRatio: row.vlPreviousRatio !== undefined ? toNumber(row.vlPreviousRatio, 0) : undefined,
    value: row.value !== undefined ? toNumber(row.value, 40) : undefined,
  };
}

function mapOffer(row: any): Offer {
  return {
    id: String(row.id),
    orderId: String(row.orderId ?? row.order_id ?? ''),
    type: (row.type as Offer['type']) ?? 'counter',
    responsePrice: row.responsePrice !== undefined ? toNumber(row.responsePrice, 0) : undefined,
    createdAt: row.createdAt ?? new Date().toISOString(),
    status: (row.status as Offer['status']) ?? 'sent',
    fromSeller: Boolean(row.fromSeller ?? row.from_seller ?? false),
    sellerName: row.sellerName ?? 'Seller',
    buyerName: row.buyerName ?? 'Buyer',
    description: toString(row.description, undefined),
    followers: row.followers !== undefined ? toNumber(row.followers, 3000) : undefined,
    likes: row.likes !== undefined ? toNumber(row.likes, 12000) : undefined,
    erCurrentRatio: row.erCurrentRatio !== undefined ? toNumber(row.erCurrentRatio, 0) : undefined,
    erPreviousRatio: row.erPreviousRatio !== undefined ? toNumber(row.erPreviousRatio, 0) : undefined,
    vlCurrentRatio: row.vlCurrentRatio !== undefined ? toNumber(row.vlCurrentRatio, 0) : undefined,
    vlPreviousRatio: row.vlPreviousRatio !== undefined ? toNumber(row.vlPreviousRatio, 0) : undefined,
    value: row.value !== undefined ? toNumber(row.value, 40) : undefined,
  };
}

export async function getNegotiationData() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    orders: orders.map(mapOrder),
    offers: offers.map(mapOffer),
  };
}

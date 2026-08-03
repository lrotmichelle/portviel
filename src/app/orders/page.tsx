'use client';

import React, { useState } from 'react';
import type { Order } from '@/types';
import OrderCard from '@/components/order-card';
import { useNegotiationContext } from '@/context/NegotiationContext';
import { useNotification } from '@/hooks/useNotification';

type OrderAction = 'decline' | 'counter' | 'accept' | null;

export default function OrdersPage() {
  const { orders } = useNotification();
  const [orderActions, setOrderActions] = useState<Record<string, OrderAction>>({});
  const [orderFilter, setOrderFilter] = useState<'all' | 'sold' | 'counter'>('all');
  const { sessions, sellerRespondToOrder } = useNegotiationContext();

  const handleOrderAction = (orderId: string, action: OrderAction) => {
    setOrderActions((prev) => ({ ...prev, [orderId]: action }));
  };

  // Group by cardId to only show the latest order state per card
  const uniqueOrdersMap: Record<string, Order> = {};
  [...orders]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((order) => {
      if (order.cardId) {
        uniqueOrdersMap[order.cardId] = order;
      }
    });
  const uniqueOrdersList = Object.values(uniqueOrdersMap).reverse();
  const soldCount = uniqueOrdersList.filter((order) => order.status === 'completed').length;
  const counterCount = uniqueOrdersList.filter((order) => order.status === 'countered').length;
  const filteredOrdersList = uniqueOrdersList.filter((order) => {
    if (orderFilter === 'sold') {
      return order.status === 'completed';
    }

    if (orderFilter === 'counter') {
      return order.status === 'countered';
    }

    return true;
  });

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOrderFilter((current) => (current === 'sold' ? 'all' : 'sold'))}
            className={`rounded-full border px-3 py-2 text-sm font-medium ${orderFilter === 'sold' ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}
          >
            {soldCount} sold
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter((current) => (current === 'counter' ? 'all' : 'counter'))}
            className={`rounded-full border px-3 py-2 text-sm font-medium ${orderFilter === 'counter' ? 'border-amber-500/50 bg-amber-500/20 text-amber-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}
          >
            {counterCount} counter
          </button>
        </div>
      </div>

      {filteredOrdersList.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>{orderFilter === 'sold' ? 'No sales yet' : orderFilter === 'counter' ? 'No counter orders yet' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrdersList.map((order) => {
            const currentAction = orderActions[order.id];
            const session = order.cardId ? sessions[order.cardId] : undefined;

            return (
              <OrderCard
                key={order.id}
                data={{
                  id: order.id,
                  buyerName: order.buyerName,
                  buyerUsername: order.sellerName?.toLowerCase().replace(/\s+/g, ''),
                  type: order.type,
                  offeredPrice: order.offeredPrice,
                  originalPrice: order.productPriceRaw,
                  description: order.description,
                  handle: order.handle ?? `@${(order.sellerName || order.buyerName).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
                  hashtags: order.hashtags,
                  status: order.status,
                  customStatus: session ? session.status : undefined,
                  createdAt: order.createdAt,
                  followers: Math.max(order.followers ?? 3000, 3000),
                  likes: Math.max(order.likes ?? 12000, 12000),
                  erCurrentRatio: order.erCurrentRatio ?? 0,
                  erPreviousRatio: order.erPreviousRatio ?? 0,
                  vlCurrentRatio: order.vlCurrentRatio ?? 0,
                  vlPreviousRatio: order.vlPreviousRatio ?? 0,
                  value: Math.max(order.value ?? 40, 40),
                  productPrice: order.productPriceRaw,
                  isInactive: session ? ['passed', 'declined', 'timed-out'].includes(session.status) : false,
                }}
                onAccept={() => {
                  sellerRespondToOrder(order.id, 'accept');
                  handleOrderAction(order.id, null);
                }}
                onCounter={(price) => {
                  sellerRespondToOrder(order.id, 'counter', price);
                  handleOrderAction(order.id, null);
                }}
                onCounterToggle={() => handleOrderAction(order.id, currentAction === 'counter' ? null : 'counter')}
                onDecline={() => {
                  sellerRespondToOrder(order.id, 'decline');
                  handleOrderAction(order.id, null);
                }}
                activeAction={currentAction}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
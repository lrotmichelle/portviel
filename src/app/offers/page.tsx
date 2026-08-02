'use client';

import React, { useState } from 'react';
import { recordOfficeEvent } from '@/lib/office-history';
import OfferCard from '@/components/offer-card';
import { useNegotiationContext, type NegotiationSession } from '@/context/NegotiationContext';
import { useNotification } from '@/hooks/useNotification';

export default function OffersPage() {
  const [offerActions, setOfferActions] = useState<Record<string, 'view' | 'counter' | null>>({});
  const [offerFilter, setOfferFilter] = useState<'all' | 'acquired' | 'counter'>('all');

  const {
    sessions,
    buyerRespondToOffer,
    finalizeNegotiation,
  } = useNegotiationContext();

  const { orders: allOrders, offers: allOffers } = useNotification();

  const handleOfferAction = (id: string, action: 'view' | 'counter' | null) => {
    setOfferActions((prev) => ({ ...prev, [id]: action }));
  };

  const handleBuyerAcceptOffer = (cardId: string) => {
    buyerRespondToOffer(cardId, 'accept');
    recordOfficeEvent({ type: 'offer', title: 'Offer accepted', description: 'You accepted a seller offer.', status: 'accepted' });
    handleOfferAction(cardId, null);
  };

  const handleBuyerCounterOffer = (cardId: string, counterPrice: number) => {
    buyerRespondToOffer(cardId, 'counter', counterPrice);
    recordOfficeEvent({ type: 'offer', title: 'Offer countered', description: `You countered a seller offer with $${counterPrice}.`, status: 'pending' });
    handleOfferAction(cardId, null);
  };

  const handleBuyerDeclineOffer = (cardId: string) => {
    buyerRespondToOffer(cardId, 'decline');
    recordOfficeEvent({ type: 'offer', title: 'Offer declined', description: 'You declined a seller offer.', status: 'rejected' });
    handleOfferAction(cardId, null);
  };

  // Map active sessions to OfferCardData
  const activeOffersList = Object.entries(sessions as Record<string, NegotiationSession>)
    .filter(([, session]) => session.status !== 'idle')
    .map(([cardId, session]) => {
      const cardOrders = allOrders.filter((o: { cardId?: string }) => o.cardId === cardId);
      const latestOrder = cardOrders[cardOrders.length - 1];

      const latestOffer = allOffers
        .filter((o: { orderId: string }) => {
          const ord = allOrders.find((ord: { id: string; cardId?: string }) => ord.id === o.orderId);
          return ord?.cardId === cardId;
        })
        .pop();

      const sellerName = latestOrder?.sellerName || latestOffer?.sellerName || 'Seller';

      return {
        cardId,
        session,
        latestOrder,
        latestOffer,
        sellerName,
      };
    });

  const acquiredCount = activeOffersList.filter(({ session, latestOffer }) => {
    return session.status === 'finalized' || latestOffer?.status === 'completed';
  }).length;

  const counterCount = activeOffersList.filter(({ latestOffer }) => {
    return latestOffer?.status === 'received';
  }).length;

  const filteredOffersList = activeOffersList.filter(({ session, latestOffer, latestOrder }) => {
    if (offerFilter === 'acquired') {
      return session.status === 'finalized' || latestOffer?.status === 'completed' || latestOrder?.status === 'completed';
    }

    if (offerFilter === 'counter') {
      return latestOffer?.status === 'received' || latestOrder?.status === 'countered';
    }

    return true;
  });

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOfferFilter((current) => (current === 'acquired' ? 'all' : 'acquired'))}
            className={`rounded-full border px-3 py-2 text-sm font-medium ${offerFilter === 'acquired' ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}
          >
            {acquiredCount} acquired
          </button>
          <button
            type="button"
            onClick={() => setOfferFilter((current) => (current === 'counter' ? 'all' : 'counter'))}
            className={`rounded-full border px-3 py-2 text-sm font-medium ${offerFilter === 'counter' ? 'border-amber-500/50 bg-amber-500/20 text-amber-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}
          >
            {counterCount} counter
          </button>
        </div>
      </div>

      {filteredOffersList.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p>{offerFilter === 'acquired' ? 'No purchases yet' : offerFilter === 'counter' ? 'No counter offers yet' : 'No new offers'}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-full border border-neutral-800 bg-neutral-950/70 px-4 py-2 text-sm text-zinc-400">
            <span>Offers expire within a week if ignored.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffersList.map(({ cardId, session, latestOrder, latestOffer, sellerName }) => {
            const isInactive = ['passed', 'declined', 'timed-out', 'finalized'].includes(session.status);

            return (
              <OfferCard
                key={cardId}
                session={session}
                data={{
                  id: cardId,
                  sellerName: sellerName,
                  sellerUsername: sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''),
                  type: latestOffer?.type || (latestOrder?.type === 'buy' ? 'accept' : 'counter'),
                  responsePrice: latestOffer?.responsePrice || latestOrder?.offeredPrice || session.currentValue,
                  originalPrice: latestOrder?.productPriceRaw || session.productPrice,
                  originalOfferType: latestOrder?.type,
                  yourOffer: latestOrder?.offeredPrice,
                  receivedAt: latestOffer?.createdAt || latestOrder?.createdAt || session.createdAt,
                  handle: latestOrder?.handle ?? latestOffer?.handle ?? `@${sellerName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
                  hashtags: latestOrder?.hashtags ?? latestOffer?.hashtags,
                  followers: latestOrder?.followers ?? latestOffer?.followers ?? 3000,
                  likes: latestOrder?.likes ?? latestOffer?.likes ?? 12000,
                  erCurrentRatio: latestOrder?.erCurrentRatio ?? latestOffer?.erCurrentRatio ?? 0,
                  erPreviousRatio: latestOrder?.erPreviousRatio ?? latestOffer?.erPreviousRatio ?? 0,
                  vlCurrentRatio: latestOrder?.vlCurrentRatio ?? latestOffer?.vlCurrentRatio ?? 0,
                  vlPreviousRatio: latestOrder?.vlPreviousRatio ?? latestOffer?.vlPreviousRatio ?? 0,
                  value: latestOrder?.value ?? latestOffer?.value ?? 40,
                  productPrice: latestOrder?.productPriceRaw || session.productPrice,
                  customStatus: session.status,
                  isInactive,
                }}
                onAccept={() => handleBuyerAcceptOffer(cardId)}
                onCounter={(price) => {
                  handleBuyerCounterOffer(cardId, price);
                }}
                onDecline={() => handleBuyerDeclineOffer(cardId)}
                onFinalize={() => finalizeNegotiation(cardId)}
                activeAction={offerActions[cardId]}
                onCounterToggle={() => handleOfferAction(cardId, offerActions[cardId] === 'counter' ? null : 'counter')}
              />
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}



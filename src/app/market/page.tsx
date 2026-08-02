'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { MarketCardData } from '@/types';
import { recordOfficeEvent } from '@/lib/office-history';
import { useNegotiationContext } from '@/context/NegotiationContext';
import ListingModal from '@/components/layout/listing-modal';
import { Plus, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const MarketCard = dynamic(() => import('@/components/market-card'), {
  ssr: false,
  loading: () => <div className="h-40 bg-neutral-900/20 rounded animate-pulse" />,
});

const BUYER_NAME = 'You';

export default function MarketPage() {
  const [marketCards, setMarketCards] = useState<MarketCardData[]>([]);
  const [isListingOpen, setIsListingOpen] = useState(false);
  const { startBuyerBuy, startBuyerCounter } = useNegotiationContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('Request failed');
        const cards = (await response.json()) as MarketCardData[];
        setMarketCards(cards);
      } catch (error) {
        console.error('Failed to load market cards from database', error);
        setMarketCards([]);
      }
    };

    loadData();
  }, []);

  const visibleMarketCards = marketCards.filter((card) => (card.offersCount ?? 0) < 12);

  const handleBuy = (card: MarketCardData) => {
    const session = startBuyerBuy({
      id: card.id,
      itemType: 'market',
      productPrice: card.productPriceRaw,
      sellerName: card.sellerName,
      buyerName: BUYER_NAME,
      description: card.description,
    });

    if (!session) return;
    recordOfficeEvent({ type: 'offer', title: 'Buy request sent', description: `Buyer initiated a purchase request for ${card.sellerName}.`, status: 'pending' });
  };

  const handleCounter = (card: MarketCardData, offeredPrice: number) => {
    const session = startBuyerCounter({
      id: card.id,
      itemType: 'market',
      productPrice: card.productPriceRaw,
      price: offeredPrice,
      sellerName: card.sellerName,
      buyerName: BUYER_NAME,
      description: card.description,
    });

    if (!session) return;
    recordOfficeEvent({ type: 'offer', title: 'Counter submitted', description: `Buyer submitted a counter offer for ${card.sellerName}.`, status: 'pending' });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-black text-white">
      <section className="border-b border-white/10 bg-black px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Market
          </h1>
          <p className="text-lg text-zinc-400">
            Browse available listings and make counter offers
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setIsListingOpen(true)}
              className="flex items-center gap-2 rounded-full border border-emerald-500/70 bg-transparent px-4 py-2 text-sm font-semibold text-emerald-500 transition-colors duration-150 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white"
            >
              <Plus className="h-4 w-4" />
              Sale
            </button>
            <Link href="/manage/listings" className="flex items-center gap-2 rounded-full border border-amber-400/70 bg-transparent px-4 py-2 text-sm font-semibold text-amber-400 transition-colors duration-150 hover:bg-amber-400 hover:text-white active:bg-amber-400 active:text-white">
              <ClipboardList className="h-4 w-4" />
              My listings
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-black px-4 py-12">
        <div className="mx-auto max-w-7xl">
          {visibleMarketCards.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-transparent p-8 text-center text-zinc-400">
              No active market listings are available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleMarketCards.map((card) => (
                  <div key={card.id} className="h-fit">
                    <MarketCard
                      cardData={card}
                      onBuyClick={() => handleBuy(card)}
                      onCounterSubmit={(price) => handleCounter(card, price)}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      <ListingModal
        isOpen={isListingOpen}
        onClose={() => setIsListingOpen(false)}
        onPublishSuccess={(item) => {
          const newCard: MarketCardData = {
            id: String(item?.id ?? Date.now()),
            sellerName: 'Portville Seller',
            sellerUsername: 'portville-seller',
            description: item?.description ?? 'New market listing',
            handle: item?.handle ? `@${item.handle}` : '@demo-user',
            followers: Number(item?.followers ?? 0),
            likes: Number(item?.likes ?? 0),
            erCurrentRatio: Number(item?.engagementRate ?? 0),
            erPreviousRatio: Number(item?.engagementRate ?? 0),
            vlCurrentRatio: 0,
            vlPreviousRatio: 0,
            sellerAvatar: undefined,
            productPriceRaw: Number(item?.price ?? 0),
            valueRaw: Number(item?.price ?? 0),
            views: Number(item?.views ?? 0),
            sellerBuys: 4,
            sellerSells: 2,
            sellerStars: 4.9,
            isAdminVerified: true,
            createdAt: new Date().toISOString(),
            offersCount: 0,
          };
          setMarketCards((prev) => [newCard, ...prev]);
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Header from './header';
import Content from './content';
import Sentiment from './sentiment';
import Footer from './footer';
import type { MarketCardData } from '@/types';
import { formatToUGX } from '@/lib/currency';
import { useNegotiationContext } from '@/context/NegotiationContext';

interface MarketCardProps {
    cardData: MarketCardData;
    hideFooter?: boolean;
    hideBorder?: boolean;
    onBuyClick?: () => void;
    onCounterSubmit?: (price: number) => void;
}

export default function MarketCard({ cardData, hideFooter = false, hideBorder = false, onBuyClick, onCounterSubmit }: MarketCardProps) {
    const { sessions } = useNegotiationContext();
    const session = sessions[cardData.id];
    
    const productPrice = cardData.productPriceRaw;
    
    // Limits
    const counterAttempts = session?.buyerCounterCount ?? 0;
    
    // Dynamic discount floor
    // Counter 1: 40% max off -> min 60%
    // Counter 2: 30% max off -> min 70%
    // Counter 3: 15% max off -> min 85%
    let maxOff = 0.40;
    if (counterAttempts === 1) maxOff = 0.30;
    else if (counterAttempts === 2) maxOff = 0.15;
    
    const minPrice = productPrice * (1 - maxOff);
    const maxPrice = productPrice * 1.5;

    const [liveOffers, setLiveOffers] = useState(cardData.offersCount ?? 0);
    const [showPriceInput, setShowPriceInput] = useState(false);
    const [userOffer, setUserOffer] = useState("");
    const [costlyVotes, setCostlyVotes] = useState(cardData.sentimentRate ?? 0);
    const [hasVotedCostly, setHasVotedCostly] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    useEffect(() => {
        if (!session?.cooldownUntil) return;
        const target = new Date(session.cooldownUntil).getTime();
        const updateTimer = () => {
            const diff = target - Date.now();
            setCooldownRemaining(Math.max(0, Math.floor(diff / 1000)));
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [session?.cooldownUntil]);

    const isMaxed = liveOffers >= 12 || counterAttempts >= 3;
    const isCooling = cooldownRemaining > 0;
    
    const isInactive = session && ['passed', 'declined', 'timed-out'].includes(session.status);
    const hasActiveOffer = session && ['buyer-pending', 'seller-pending', 'accepted', 'payment-pending'].includes(session.status);

    const numericOffer = parseFloat(userOffer);
    const isError = userOffer !== "" && (numericOffer < minPrice || numericOffer > maxPrice);

    const handleCounterInitiate = () => {
        if (counterAttempts < 3 && !isMaxed && !isCooling && !isInactive && !hasActiveOffer) {
            setShowPriceInput(true);
        }
    };

    const confirmCounterOffer = (price: string) => {
        if (isError || !price || isMaxed || isCooling || isInactive || hasActiveOffer) return;
        setLiveOffers((prev) => prev + 1);
        setShowPriceInput(false);
        const numPrice = parseFloat(price);
        onCounterSubmit?.(numPrice);
        setUserOffer("");
    };

    return (
        <div className={`mx-auto flex w-full max-w-[350px] flex-col gap-4 bg-transparent p-4 transition-all duration-300 ${hideBorder ? '' : 'rounded-2xl border border-white/10'} ${isInactive ? 'pointer-events-none bg-black/20 opacity-60 grayscale' : ''}`}>
            <Header
                name={cardData.sellerName}
                username={cardData.sellerUsername}
                avatar={cardData.sellerAvatar}
                sellerBuys={cardData.sellerBuys}
                sellerSells={cardData.sellerSells}
                sellerStars={cardData.sellerStars}
                isAdminVerified={cardData.isAdminVerified}
                createdAt={cardData.createdAt}
                offersCount={liveOffers}
                hasActiveOffer={Boolean(hasActiveOffer)}
                onExpire={() => { }}
            />

            {hasActiveOffer && (
                <div className="text-center py-1.5 px-3 rounded-xl border border-purple-500/20 bg-purple-500/10 text-[10px] font-black uppercase tracking-wider text-purple-400">
                    {session.status === 'buyer-pending' ? 'Pending Seller Response' : 'Countered by Seller (See Offers)'}
                </div>
            )}

            {isCooling && !hasActiveOffer && (
                <div className="text-center py-1.5 px-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Cooldown: {cooldownRemaining}s
                </div>
            )}

            {isInactive && (
                <div className="text-center py-1.5 px-3 rounded-xl border border-red-500/20 bg-red-500/10 text-[10px] font-black uppercase tracking-wider text-red-400">
                    Status: {session.status}
                </div>
            )}

            <Content cardData={cardData} />

            {showPriceInput && !isMaxed && (
                <div className="p-4 bg-zinc-950/80 border border-zinc-700 rounded-2xl flex flex-col gap-3">
                    <h2 className="font-bold text-xs text-white">Suggest a bid (Attempt {counterAttempts + 1}/3)</h2>
                    <input
                        type="number"
                        placeholder={`Min: ${formatToUGX(minPrice)}`}
                        value={userOffer}
                        className={`w-full bg-transparent text-sm outline-none border rounded-xl p-3 ${isError ? 'text-red-500 border-red-500' : 'text-white border-zinc-700'}`}
                        onChange={(e) => setUserOffer(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setShowPriceInput(false)} className="py-2 text-[10px] font-black uppercase border border-amber-900/40 text-amber-500 rounded-xl">Cancel</button>
                        <button onClick={() => confirmCounterOffer(userOffer)} disabled={isError || userOffer === ""} className="py-2 text-[10px] font-black uppercase border border-emerald-900/40 text-emerald-500 rounded-xl">Submit</button>
                    </div>
                </div>
            )}

            <Sentiment costlyVotes={costlyVotes} />

            {!hideFooter && (
                <Footer
                    onBuyClick={onBuyClick}
                    onCounterClick={handleCounterInitiate}
                    counterAttempts={counterAttempts}
                    onCostlyClick={() => {
                        if (!hasVotedCostly && costlyVotes < 100 && !isMaxed && !isInactive) {
                            setCostlyVotes((prev) => prev + 1);
                            setHasVotedCostly(true);
                        }
                    }}
                    hasVotedCostly={hasVotedCostly}
                    isCostlyMaxed={costlyVotes >= 100 || isMaxed}
                    offersCount={liveOffers}
                    hasActiveOffer={Boolean(hasActiveOffer || isCooling)}
                />
            )}
        </div>
    );
}

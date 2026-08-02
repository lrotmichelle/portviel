'use client';

import React from 'react';
import { ShoppingBag, RefreshCw, Flame } from 'lucide-react';

interface FooterProps {
    onCounterClick: () => void;
    onBuyClick?: () => void;
    counterAttempts: number;
    onCostlyClick: () => void;
    hasVotedCostly: boolean;
    isCostlyMaxed: boolean;
    offersCount: number;
    hasActiveOffer: boolean;
}

export default function Footer({
    onCounterClick, onBuyClick, counterAttempts, onCostlyClick,
    hasVotedCostly, isCostlyMaxed, offersCount, hasActiveOffer
}: FooterProps) {

    const isMaxed = offersCount >= 12;
    // Cannot buy or counter if there is already an active offer or if it is maxed
    const canBuy = !isMaxed && !hasActiveOffer;

    const isCounterDisabled = counterAttempts >= 3 || isMaxed || hasActiveOffer;
    const isCostlyDisabled = hasVotedCostly || isCostlyMaxed || isMaxed;

    const getBtnClasses = (color: 'emerald' | 'amber' | 'red', isDisabled: boolean) => {
        const base = "group flex items-center justify-center gap-1 rounded-xl border py-2 px-1 text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98] truncate";
        const themes = {
            emerald: "border-emerald-500/70 bg-transparent text-emerald-500 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white",
            amber: "border-amber-400/70 bg-transparent text-amber-400 hover:bg-amber-400 hover:text-white active:bg-amber-400 active:text-white",
            red: "border-red-500/70 bg-transparent text-red-500 hover:bg-red-500 hover:text-white active:bg-red-500 active:text-white"
        };
        const disabledClass = isDisabled ? "opacity-20 cursor-not-allowed" : "";
        return `${base} ${themes[color]} ${disabledClass}`;
    };

    return (
        <div className="grid grid-cols-3 gap-2 mt-2">
            <button onClick={onBuyClick} disabled={!canBuy} className={getBtnClasses('emerald', !canBuy)}>
                <ShoppingBag className="w-3 h-3" /> Buy
            </button>

            <button onClick={onCounterClick} disabled={isCounterDisabled} className={getBtnClasses('amber', isCounterDisabled)}>
                <RefreshCw className="w-3 h-3" /> {isMaxed ? 'Full' : counterAttempts === 2 ? 'Final' : 'Counter'}
            </button>

            <button onClick={onCostlyClick} disabled={isCostlyDisabled} className={getBtnClasses('red', isCostlyDisabled)}>
                <Flame className="w-3 h-3" /> {isMaxed ? 'Full' : hasVotedCostly ? 'Voted' : 'Costly'}
            </button>
        </div>
    );
}

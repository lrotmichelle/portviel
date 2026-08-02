'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, AlertTriangle } from 'lucide-react';

interface HeaderProps {
    name: string;
    username: string;
    avatar?: string;
    sellerBuys: number;
    sellerSells: number;
    sellerStars: number;
    isAdminVerified: boolean;
    createdAt: string;
    offersCount: number;
    hasActiveOffer: boolean;
    onExpire: () => void;
}

export default function Header({
    name, username, avatar, sellerBuys, sellerSells, sellerStars,
    isAdminVerified, createdAt, offersCount, onExpire
}: HeaderProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const isMaxed = offersCount >= 12;

    useEffect(() => {
        const handle = requestAnimationFrame(() => {
            setIsMounted(true);
        });
        const parsedDate = new Date(createdAt);
        const validTimestamp = isNaN(parsedDate.getTime()) ? Date.now() : parsedDate.getTime();
        const MAX_LIFECYCLE_MS = 168 * 60 * 60 * 1000;
        const targetExpiryTime = validTimestamp + MAX_LIFECYCLE_MS;

        const updateTimer = () => {
            const remaining = targetExpiryTime - Date.now();
            if (remaining <= 0) {
                setTimeLeft(0);
                onExpire();
            } else {
                setTimeLeft(remaining);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => {
            cancelAnimationFrame(handle);
            clearInterval(timer);
        };
    }, [createdAt, onExpire]);

    const getTimeColorClass = (ms: number) => {
        const totalHours = ms / (3600 * 1000);
        if (totalHours <= 12) return 'text-red-500 animate-pulse font-bold';
        if (totalHours <= 48) return 'text-yellow-500 font-bold';
        if (totalHours <= 72) return 'text-orange-500 font-bold';
        if (totalHours <= 100) return 'text-emerald-500';
        return 'text-blue-500';
    };

    const getOfferColorClass = (count: number) => {
        if (count >= 12) return 'text-red-500 font-black'; // Maxed out
        if (count >= 9) return 'text-red-500 font-bold';
        if (count >= 4) return 'text-yellow-500 font-bold';
        return 'text-emerald-500 font-bold';
    };

    const formatTime = (ms: number) => {
        if (ms <= 0) return "00:00:00";
        const totalSecs = Math.floor(ms / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-2.5 w-full">
            <div className="flex justify-center select-none">
                {isMaxed ? (
                    <div className="flex items-center gap-1.5 py-1 px-3 text-[9px] font-black uppercase tracking-widest border border-red-500/30 text-red-500 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Restricted
                    </div>
                ) : (
                    <div className="w-fit py-1 px-3 text-[9px] font-black uppercase tracking-widest border border-emerald-500/30 text-emerald-400 rounded-full">
                        Live Stock
                    </div>
                )}
            </div>

            <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-transparent p-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-transparent">
                        {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover grayscale opacity-90" />
                        ) : (
                            <span className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase">{name.slice(0, 2)}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                            <h3 className="text-xs sm:text-sm font-black truncate text-white">{name}</h3>
                            {isAdminVerified && <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />}
                        </div>
                        <span className="text-[9px] sm:text-[11px] text-zinc-500 font-medium truncate">@{username}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[8px] sm:text-[10px] font-mono font-bold text-zinc-400">
                            <span>{sellerBuys}/{sellerSells}</span>
                            <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-400 fill-amber-400" />
                            <span className="text-zinc-200">{sellerStars.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                    <span className={`text-[11px] sm:text-sm font-mono font-black ${getTimeColorClass(timeLeft)}`}>
                        {isMounted ? formatTime(timeLeft) : "--:--:--"}
                    </span>

                    {/* Offer Count Display (No Lock Icon) */}
                    <span className={`text-[9px] sm:text-[10px] font-mono uppercase ${getOfferColorClass(offersCount)}`}>
                        {offersCount} / 12 offers
                    </span>
                </div>
            </div>
        </div>
    );
}

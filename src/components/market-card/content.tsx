'use client';

import React from 'react';
import { Users, Triangle, Eye, Heart } from 'lucide-react';
import type { MarketCardData } from '@/types';

interface ContentProps {
  cardData: MarketCardData;
}

export default function Content({ cardData }: ContentProps) {
  // Use pre-calculated ratios from the data
  const erRatio = cardData.erCurrentRatio;
  const vlRatio = cardData.vlCurrentRatio;

  // Function to determine color based on ratio efficiency
  // Target is 1:1. Closer to 1 = Green, Higher (e.g., 50:1) = Red (less efficient)
  const getRatioColor = (ratio: number) => {
    if (ratio <= 1) return 'text-emerald-500 fill-emerald-500/20'; // Perfect 1:1
    if (ratio <= 5) return 'text-green-400 fill-green-400/20'; // Excellent
    if (ratio <= 10) return 'text-yellow-500 fill-yellow-500/20'; // Good
    if (ratio <= 20) return 'text-orange-500 fill-orange-500/20'; // Fair
    return 'text-red-500 fill-red-500/20'; // Poor efficiency
  };

  const erIconColor = getRatioColor(erRatio);
  const vlIconColor = getRatioColor(vlRatio);

  return (
    <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-white/10 bg-transparent p-3.5 text-left">
      <div className="flex flex-col gap-2 px-0.5">
        <p className="text-[11px] leading-relaxed font-normal text-zinc-400">
          {cardData.description}
        </p>
        <div className="select-none flex items-center gap-1.5 py-0.5">
          <span className="text-[11px] font-extrabold tracking-tight text-amber-400/90">
            {cardData.handle}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 shadow-sm">
            <Users className="w-4 h-4 text-emerald-500/40 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1">
                Followers
              </span>
              <span className="text-sm font-black font-mono tracking-tight leading-none text-emerald-400">
                {cardData.followers.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 shadow-sm">
            <Eye className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1">
                Views
              </span>
              <span className="text-sm font-black font-mono tracking-tight leading-none text-sky-400">
                {cardData.views?.toLocaleString() ?? '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-900/80 px-0.5">
          <div className="flex items-center gap-1.5">
            <Triangle
              className={`w-3.5 h-3.5 shrink-0 ${erIconColor}`}
              strokeWidth={2.5}
            />
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-tight">
              ER
            </span>
            <span className="font-black font-mono tracking-tight text-white text-[10px]">
              {erRatio}:1
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart
              className="w-3.5 h-3.5 text-red-500 fill-red-500/10 shrink-0"
              strokeWidth={2.5}
            />
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-tight">
              Likes
            </span>
            <span className="font-black font-mono tracking-tight text-white text-[10px]">
              {cardData.likes}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye
              className={`w-3.5 h-3.5 shrink-0 ${vlIconColor}`}
              strokeWidth={2.5}
            />
            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-tight">
              V/L
            </span>
            <span className="font-black font-mono tracking-tight text-white text-[10px]">
              {vlRatio}:1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

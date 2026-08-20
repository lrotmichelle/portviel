'use client';

import React from 'react';
import { formatCompactNumber, formatCompactValue } from '@/lib/currency';

interface HitTargetProps {
  currentViews?: number;
  maxPayout?: number;
}

export default function HitTarget({ currentViews = 0, maxPayout = 0 }: HitTargetProps) {
  const effectiveViews = Number(currentViews) || 0;
  const effectiveMaxPayout = Number(maxPayout) || 0;

  // Covered miles of views in relation to the campaign max payout
  const hitPercentage = effectiveMaxPayout > 0 ? Math.min(100, (effectiveViews / effectiveMaxPayout) * 100) : 0;
  const remainingPercentage = Math.max(0, 100 - hitPercentage);

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Hit target</h3>
      </div>

      <div className="rounded-xl bg-zinc-950/30 p-4">
        <div className="relative">
          <div className="flex h-[16px] w-full overflow-hidden rounded-full bg-zinc-900/80">
            <div className="h-full bg-emerald-400" style={{ width: `${hitPercentage}%` }} />
            <div className="h-full bg-zinc-700" style={{ width: `${remainingPercentage}%` }} />
          </div>

          <div className="mt-2 flex items-center justify-between text-[9px] font-semibold text-white">
            <span>{formatCompactNumber(effectiveViews)} views</span>
            <span>{formatCompactValue(effectiveMaxPayout)} UGX max</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300">Covered {hitPercentage.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-700" />
            <span className="text-zinc-300">Remaining {remainingPercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

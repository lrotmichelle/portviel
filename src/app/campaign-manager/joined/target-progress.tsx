'use client';

import React from 'react';
import { formatCompactValue, formatCompactNumber } from '@/lib/currency';

interface TargetProgressProps {
  campaign?: {
    totalBudget?: number;
    budgetUsed?: number;
    paid?: number;
    viewsGenerated?: number;
    maxPayout?: number;
  } | null;
  isExpired?: boolean;
}

export default function TargetProgress({ campaign, isExpired = false }: TargetProgressProps) {
  const budget = campaign?.totalBudget ?? 0;
  const budgetPaidAmount = campaign?.paid ?? campaign?.budgetUsed ?? 0;
  const viewsGotten = campaign?.viewsGenerated ?? 0;
  const maxPayout = campaign?.maxPayout ?? 0;

  const budgetPaid = budget > 0 ? Math.min(100, (budgetPaidAmount / budget) * 100) : 0;
  const budgetRemaining = Math.max(0, 100 - budgetPaid);

  const myProgress = maxPayout > 0 ? Math.min(100, (viewsGotten / maxPayout) * 100) : 0;
  const myRemaining = Math.max(0, 100 - myProgress);

  return (
    <div className={`w-full ${isExpired ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Campaign target */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isExpired ? 'text-zinc-500' : 'text-zinc-400'}`}>Budget</span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isExpired ? 'text-zinc-500' : 'text-zinc-300'}`}>
              Paid {formatCompactValue(budgetPaidAmount)} | remaining {formatCompactValue(Math.max(0, budget - budgetPaidAmount))}
            </span>
          </div>
          <div className="relative flex h-[16px] w-full overflow-hidden rounded-full bg-zinc-900/80">
            <div className={`h-full transition-all ${isExpired ? 'bg-zinc-600' : 'bg-emerald-400'}`} style={{ width: `${budgetPaid}%` }} />
            <div className={`h-full transition-all ${isExpired ? 'bg-zinc-700' : 'bg-zinc-700'}`} style={{ width: `${budgetRemaining}%` }} />
            <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-widest ${isExpired ? 'text-zinc-400' : 'text-white'}`}>
              {budgetPaid.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* My target */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isExpired ? 'text-zinc-500' : 'text-zinc-400'}`}>Views</span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isExpired ? 'text-zinc-500' : 'text-zinc-300'}`}>
              {formatCompactNumber(viewsGotten)} | remaining {formatCompactNumber(Math.max(0, maxPayout - viewsGotten))}
            </span>
          </div>
          <div className="relative flex h-[16px] w-full overflow-hidden rounded-full bg-zinc-900/80">
            <div className={`h-full transition-all ${isExpired ? 'bg-zinc-600' : 'bg-emerald-400'}`} style={{ width: `${myProgress}%` }} />
            <div className={`h-full transition-all ${isExpired ? 'bg-zinc-700' : 'bg-zinc-700'}`} style={{ width: `${myRemaining}%` }} />
            <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-widest ${isExpired ? 'text-zinc-400' : 'text-white'}`}>
              {myProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

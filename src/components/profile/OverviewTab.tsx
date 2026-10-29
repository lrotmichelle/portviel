'use client';

import React from 'react';
import { TrendingUp, Megaphone } from 'lucide-react';

interface OverviewTabProps {
  formatCurrency: (amount: number) => string;
}

export function OverviewTab({ formatCurrency }: OverviewTabProps) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Platform History</h3>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Escrow Release #4092</div>
              <div className="text-zinc-400">Completed 2 hours ago</div>
            </div>
          </div>
          <span className="font-extrabold text-emerald-400">+UGX 450k</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Kampala Tech Expo Promo</div>
              <div className="text-zinc-400">Campaign Joined</div>
            </div>
          </div>
          <span className="font-bold text-zinc-300">Active</span>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { formatCompactNumber, formatCompactValue } from '@/lib/currency';

interface FlowRow {
  rank: number;
  campaignName: string;
  views: number;
  likes: number;
  amount: number;
  status: 'settled' | 'owe';
}

interface CampaignFlowProps {
  rows?: FlowRow[];
}

const sampleRows: FlowRow[] = [
  { rank: 1, campaignName: 'Campaign 1 — Technology', views: 1850000, likes: 420000, amount: 3200000, status: 'settled' },
  { rank: 2, campaignName: 'Campaign 2 — Lifestyle', views: 1620000, likes: 390000, amount: 2850000, status: 'settled' },
  { rank: 3, campaignName: 'Campaign 3 — Gaming', views: 1480000, likes: 365000, amount: 2600000, status: 'owe' },
  { rank: 4, campaignName: 'Campaign 4 — Music', views: 1320000, likes: 318000, amount: 2380000, status: 'owe' },
  { rank: 5, campaignName: 'Campaign 5 — Sports', views: 910000, likes: 152000, amount: 980000, status: 'owe' },
];

export default function CampaignFlow({ rows = sampleRows }: CampaignFlowProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rows : rows.slice(0, 4);
  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign flow</h3>
      </div>

      <div className={`w-full ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
        <table className={`campaign-manager-spaced-table w-full ${showAll ? 'min-w-[700px]' : 'min-w-full'} table-auto bg-transparent text-left text-sm`}>
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Campaign</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Views</th>
              <th className={`${showAll ? '' : 'hidden md:table-cell'} pb-2 text-right text-[11px] font-medium uppercase tracking-wide`}>Likes</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rank} className="border-t border-zinc-800/60 bg-transparent align-top">
                <td className="py-1.5 pr-2 text-zinc-300">#{row.rank}</td>
                <td className="py-1.5 pr-2 text-white">{row.campaignName}</td>
                <td className="py-1.5 pr-2 text-right text-zinc-100">{formatCompactNumber(row.views)}</td>
                <td className={`${showAll ? '' : 'hidden md:table-cell'} py-1.5 pr-2 text-right text-zinc-100`}>{formatCompactNumber(row.likes)}</td>
                <td className={`py-1.5 text-right font-semibold ${row.status === 'settled' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {formatCompactValue(row.amount)} UGX
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-start">
        <button type="button" onClick={() => setShowAll((prev) => !prev)} className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-600 hover:text-white">
          {showAll ? 'Show less' : 'View all'}
        </button>
      </div>
    </div>
  );
}

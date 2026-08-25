'use client';

import React, { useState } from 'react';
import { formatCompactValue } from '@/lib/currency';

interface DebtRow {
  rank: number;
  campaignName: string;
  amount: number;
}

interface DebtProps {
  rows?: DebtRow[];
}

const sampleRows: DebtRow[] = [
  { rank: 1, campaignName: 'Campaign 3 — Gaming', amount: 1450000 },
  { rank: 2, campaignName: 'Campaign 4 — Music', amount: 1280000 },
  { rank: 3, campaignName: 'Campaign 5 — Sports', amount: 1170000 },
  { rank: 4, campaignName: 'Campaign 7 — Education', amount: 980000 },
  { rank: 5, campaignName: 'Campaign 9 — Luxury', amount: 760000 },
];

export default function Debt({ rows = sampleRows }: DebtProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleRows = showAll ? rows : rows.slice(0, 4);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Debt</h3>
      </div>

      <div className={`w-full ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
        <table className={`w-full ${showAll ? 'min-w-[520px]' : 'min-w-full'} table-auto bg-transparent text-left text-sm`}>
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Campaign</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
              <th className={`${showAll ? '' : 'hidden md:table-cell'} pb-2 pl-3 text-right text-[11px] font-medium uppercase tracking-wide`}>Demand</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.rank} className="border-t border-zinc-800/60 bg-transparent align-middle">
                <td className="py-1 pr-2 text-zinc-300">#{row.rank}</td>
                <td className="py-1 pr-2 text-white">{row.campaignName}</td>
                <td className="py-1 text-right text-zinc-100">{formatCompactValue(row.amount)} UGX</td>
                <td className={`${showAll ? '' : 'hidden md:table-cell'} py-1 pl-3 text-right`}>
                  <button className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500 hover:text-white">
                    Demand
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" onClick={() => setShowAll((prev) => !prev)} className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-600 hover:text-white">
          {showAll ? 'Show less' : 'View all'}
        </button>
        <button className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500 hover:text-white">
          Demand all {formatCompactValue(totalAmount)} UGX
        </button>
      </div>
    </div>
  );
}

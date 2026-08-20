'use client';

import React from 'react';
import { formatCompactValue } from '@/lib/currency';

interface TransactionItem {
  id: string;
  campaignName: string;
  platform: string;
  amount: number;
}

interface TransactionsProps {
  items?: TransactionItem[];
}

const sample: TransactionItem[] = [
  { id: '1', campaignName: 'Campaign 1 — Technology', platform: 'TikTok', amount: 120000 },
  { id: '2', campaignName: 'Campaign 2 — Lifestyle', platform: 'Instagram', amount: 45000 },
  { id: '3', campaignName: 'Campaign 3 — Gaming', platform: 'YouTube', amount: 30000 },
  { id: '4', campaignName: 'Campaign 4 — Music', platform: 'TikTok', amount: 75000 },
];

export default function Transactions({ items }: TransactionsProps) {
  const rows = (items && items.length > 0 ? items : sample).slice(0, 4);

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Recent transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-transparent text-left text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Campaign name</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Platform</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800/60 bg-transparent align-middle">
                <td className="py-1.5 pr-2 text-sm font-semibold leading-tight text-white">{t.campaignName}</td>
                <td className="py-1.5 pr-2 text-sm font-semibold leading-tight text-zinc-100">{t.platform}</td>
                <td className="py-1.5 text-right text-sm font-semibold leading-tight text-zinc-100">
                  {formatCompactValue(t.amount)} UGX
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-start">
        <button className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-600 hover:text-white">
          View all
        </button>
      </div>
    </div>
  );
}

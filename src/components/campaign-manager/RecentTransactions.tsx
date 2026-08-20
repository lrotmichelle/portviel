'use client';

import React, { useEffect, useState } from 'react';
import { formatCompactNumber, formatCompactValue } from '@/lib/currency';

interface Transaction {
  id: string;
  name: string;
  memberName: string;
  platform: string;
  date: string;
  amount: number;
  views: number;
}

interface RecentTransactionsProps {
  items?: Transaction[];
}

export default function RecentTransactions({ items }: RecentTransactionsProps) {
  const sample: Transaction[] = [
    { id: '1', name: 'Campaign A', memberName: 'Sarah K.', platform: 'TikTok', date: '2026-08-01', amount: 120000, views: 14500 },
    { id: '2', name: 'Campaign B', memberName: 'David O.', platform: 'Instagram', date: '2026-08-02', amount: 45000, views: 3200 },
    { id: '3', name: 'Campaign C', memberName: 'Alex M.', platform: 'YouTube', date: '2026-08-03', amount: 30000, views: 8900 },
    { id: '4', name: 'Campaign D', memberName: 'Rita N.', platform: 'TikTok', date: '2026-08-04', amount: 75000, views: 21000 },
    { id: '5', name: 'Campaign E', memberName: 'John D.', platform: 'Instagram', date: '2026-08-05', amount: 5000, views: 650 },
  ];

  const [rows, setRows] = useState<Transaction[]>(items ?? sample);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRows(sorted.slice(0, 5));
  }, [items]);

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Recent transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-transparent text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Campaign / Member</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Platform / Date</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount / Views</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800/60 bg-transparent align-top">
                <td className="py-1 pr-2">
                  <div className="text-sm font-semibold leading-tight text-white">{t.name}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">{t.memberName}</div>
                </td>
                <td className="py-1 pr-2">
                  <div className="text-sm font-semibold leading-tight text-zinc-100">{t.platform}</div>
                  <div className="mt-0.5 text-[10px] leading-tight text-zinc-500">{t.date}</div>
                </td>
                <td className="py-1 text-right">
                  <div className="text-sm font-semibold leading-tight text-zinc-100">
                    {formatCompactValue(t.amount)} UGX
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-400">
                    {formatCompactNumber(t.views)} views
                  </div>
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

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatCompactValue } from '@/lib/currency';

interface TransactionItem {
  id: string;
  campaignName: string;
  platform: string;
  amount: number;
}

interface TransactionsProps {
  items?: TransactionItem[];
  isExpired?: boolean;
}

const sample: TransactionItem[] = [
  { id: '1', campaignName: 'Campaign 1 — Technology', platform: 'TT', amount: 120000 },
  { id: '2', campaignName: 'Campaign 2 — Lifestyle', platform: 'IG', amount: 45000 },
  { id: '3', campaignName: 'Campaign 3 — Gaming', platform: 'YT', amount: 30000 },
  { id: '4', campaignName: 'Campaign 4 — Music', platform: 'TT', amount: 75000 },
];

export default function Transactions({ items, isExpired = false }: TransactionsProps) {
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const allRows = items && items.length > 0 ? items : sample;
  const rows = showAll ? allRows : allRows.slice(0, 4);
  const totalAmount = allRows.reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    if (!showAll) return;
    const timer = setTimeout(() => {
      setShowAll(false);
    }, 60000);
    return () => clearTimeout(timer);
  }, [showAll]);

  useEffect(() => {
    if (!showAll) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAll]);

  return (
    <div ref={containerRef} className={`w-full rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Income received</h3>
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300"
        >
          {showAll ? 'View less' : 'View all'}
        </button>
      </div>
      <div className={`w-full ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
        <table className={`w-full ${showAll ? 'min-w-[620px]' : 'min-w-full'} table-auto bg-transparent text-left text-sm`}>
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Campaign name</th>
              <th className={`${showAll ? '' : 'hidden md:table-cell'} pb-2 text-[11px] font-medium uppercase tracking-wide`}>Platform</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800/60 bg-transparent align-middle">
                <td className={`py-1.5 pr-2 text-sm font-semibold leading-tight ${isExpired ? 'text-zinc-500' : 'text-white'}`}>{t.campaignName}</td>
                <td className={`${showAll ? '' : 'hidden md:table-cell'} py-1.5 pr-2 text-sm font-semibold leading-tight ${isExpired ? 'text-zinc-500' : 'text-zinc-100'}`}>{t.platform}</td>
                <td className={`py-1.5 text-right text-sm font-semibold leading-tight ${isExpired ? 'text-zinc-500' : 'text-emerald-400'}`}>
                  {formatCompactValue(t.amount)} UGX
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div />
        <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isExpired ? 'text-zinc-500' : 'text-emerald-300'}`}>
          Total {formatCompactValue(totalAmount)} UGX
        </div>
      </div>
    </div>
  );
}

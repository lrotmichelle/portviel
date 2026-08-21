'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatCompactValue } from '@/lib/currency';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date?: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  currentUserName?: string;
  userDebt?: number;
  isExpired?: boolean;
}

const sampleTransactions: Transaction[] = [
  { id: '1', name: 'Campaign 1 — Technology', amount: 120000, date: '2024-01-15' },
  { id: '2', name: 'Campaign 2 — Lifestyle', amount: 45000, date: '2024-02-20' },
  { id: '3', name: 'Campaign 3 — Gaming', amount: 30000, date: '2024-03-10' },
  { id: '4', name: 'Campaign 4 — Music', amount: 75000, date: '2024-04-05' },
  { id: '5', name: 'You', amount: 0, date: '2024-05-01' },
];

export default function RecentTransactions({ transactions = sampleTransactions, currentUserName = 'You', userDebt = 0, isExpired = false }: RecentTransactionsProps) {
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const allRows = transactions.length > 0 ? transactions : sampleTransactions;
  const rows = showAll ? allRows : allRows.slice(0, 5);

  useEffect(() => {
    if (!showAll) return;
    const timer = setTimeout(() => {
      setShowAll(false);
    }, 10000);
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
    <div ref={containerRef} className={`flex h-full flex-col rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Recent transactions</h3>
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300"
        >
          {showAll ? 'Show less' : 'View all'}
        </button>
      </div>
      <div className={`flex-grow overflow-x-auto ${showAll ? 'max-h-[200px] overflow-y-auto' : ''}`}>
        <table className="h-full w-full table-auto text-left text-sm">
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Name</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount paid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, idx) => {
              const isUser = t.name === currentUserName;
              const showRemind = isUser && t.amount === 0 && userDebt > 0 && !isExpired;

              return (
                <tr key={t.id} className="border-t border-zinc-800/60">
                  <td className={`py-2 pr-2 ${isExpired ? 'text-zinc-500' : 'text-zinc-300'}`}>#{idx + 1}</td>
                  <td className={`py-2 pr-2 ${isExpired ? 'text-zinc-500' : isUser ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                    {showRemind ? (
                      <span className="flex items-center gap-2">
                        <button type="button" className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300 transition hover:bg-amber-500 hover:text-white">
                          Remind
                        </button>
                      </span>
                    ) : (
                      t.name
                    )}
                  </td>
                  <td className={`py-2 text-right ${isExpired ? 'text-zinc-500' : t.amount > 0 ? 'text-emerald-400' : showRemind ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {showRemind ? `${formatCompactValue(userDebt)} UGX` : t.amount > 0 ? `${formatCompactValue(t.amount)} UGX` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

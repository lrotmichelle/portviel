'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatCompactValue } from '@/lib/currency';

interface Withdrawal {
  date: string;
  time: string;
  amount: number;
}

interface WalletProps {
  withdrawals?: Withdrawal[];
  totalWithdrawn?: number;
  isExpired?: boolean;
}

const sampleWithdrawals: Withdrawal[] = [
  { date: '2024-01-15', time: '09:30', amount: 150000 },
  { date: '2024-02-20', time: '14:15', amount: 200000 },
  { date: '2024-03-10', time: '11:45', amount: 175000 },
  { date: '2024-04-05', time: '16:20', amount: 250000 },
];

export default function Wallet({ withdrawals = sampleWithdrawals, totalWithdrawn = 0, isExpired = false }: WalletProps) {
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rows = showAll ? withdrawals : withdrawals.slice(0, 4);
  const total = totalWithdrawn || withdrawals.reduce((sum, w) => sum + w.amount, 0);

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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Withdrawals</h3>
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300"
        >
          {showAll ? 'View less' : 'View all'}
        </button>
      </div>
      <div className={`w-full ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
        <table className={`w-full ${showAll ? 'min-w-[500px]' : 'min-w-full'} table-auto text-sm`}>
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="pb-2">Date</th>
              <th className={`${showAll ? '' : 'hidden md:table-cell'} pb-2`}>Time</th>
              <th className="pb-2 text-right">Amount (UGX)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w, i) => (
              <tr key={i} className="border-t border-zinc-800/60">
                <td className={`py-2 text-lg font-semibold ${isExpired ? 'text-zinc-500' : 'text-zinc-200'}`}>{w.date}</td>
                <td className={`${showAll ? '' : 'hidden md:table-cell'} py-2 text-[10px] uppercase tracking-[0.18em] ${isExpired ? 'text-zinc-500' : 'text-zinc-400'}`}>{w.time}</td>
                <td className={`py-2 text-right text-emerald-400 ${isExpired ? 'text-zinc-500' : ''}`}>{formatCompactValue(w.amount)} UGX</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div />
        <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isExpired ? 'text-zinc-500' : 'text-emerald-300'}`}>
          Total {formatCompactValue(total)} UGX
        </div>
      </div>
    </div>
  );
}

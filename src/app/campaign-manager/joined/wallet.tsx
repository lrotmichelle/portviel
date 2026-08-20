'use client';

import React, { useState } from 'react';
import { formatCompactValue } from '@/lib/currency';

interface Withdrawal {
  date: string;
  time: string;
  amount: number;
}

interface WalletProps {
  withdrawals?: Withdrawal[];
  totalWithdrawn?: number;
}

const sampleWithdrawals: Withdrawal[] = [
  { date: '2024-01-15', time: '09:30', amount: 150000 },
  { date: '2024-02-20', time: '14:15', amount: 200000 },
  { date: '2024-03-10', time: '11:45', amount: 175000 },
  { date: '2024-04-05', time: '16:20', amount: 250000 },
];

export default function Wallet({ withdrawals = sampleWithdrawals, totalWithdrawn = 0 }: WalletProps) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? withdrawals : withdrawals.slice(0, 4);
  const total = totalWithdrawn || withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-sm uppercase tracking-[0.3em] text-zinc-500">Withdrawals</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="pb-2">Date</th>
              <th className="pb-2">Time</th>
              <th className="pb-2 text-right">Amount (UGX)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w, i) => (
              <tr key={i} className="border-t border-zinc-800">
                <td className="py-2 text-zinc-200">{w.date}</td>
                <td className="py-2 text-zinc-200">{w.time}</td>
                <td className="py-2 text-right text-emerald-400">{formatCompactValue(w.amount)} UGX</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-600 hover:text-white"
        >
          {showAll ? 'Show less' : 'View all'}
        </button>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Total {formatCompactValue(total)} UGX
        </div>
      </div>
    </div>
  );
}

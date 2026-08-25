'use client';

import React from 'react';
import { formatCompactValue } from '@/lib/currency';

interface WalletProps {
  pool?: number;
  settled?: number;
  debt?: number;
  campaignsCount?: number;
}

export default function Wallet({ pool = 0, settled = 0, debt = 0, campaignsCount = 0 }: WalletProps) {
  const balance = Math.max(0, pool - settled);

  const rows = [
    { key: 'pool', label: 'Pool (total campaigns budget)', value: pool },
    { key: 'settled', label: 'Settled (paid)', value: settled },
    { key: 'debt', label: 'Debt (unpaid)', value: debt },
    { key: 'balance', label: 'Balance (pool - settled)', value: balance },
  ];

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-sm uppercase tracking-[0.3em] text-zinc-500">Wallet</h3>
      <table className="w-full min-w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-zinc-400">
            <th className="pb-2">Item</th>
            <th className="pb-2">Amount (UGX)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-zinc-800">
              <td className="py-3">{r.label}</td>
              <td className="py-3 font-semibold">{formatCompactValue(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-zinc-400">
        <div>
          <div className="text-xs">Campaigns</div>
          <div className="font-semibold text-white">{campaignsCount}</div>
        </div>
        <div>
          <div className="text-xs">Totals</div>
          <div className="font-semibold text-white">{formatCompactValue(pool)} UGX</div>
        </div>
      </div>
    </div>
  );
}

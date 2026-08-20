'use client';

import React from 'react';
import { formatCompactValue } from '@/lib/currency';

interface WalletProps {
  balance?: number;
  debt?: number;
  campaignsCount?: number;
}

export default function Wallet({ balance = 0, debt = 0, campaignsCount = 0 }: WalletProps) {
  const netBalance = balance - debt;

  const rows = [
    { key: 'balance', label: 'Balance', value: balance },
    { key: 'debt', label: 'Debt', value: debt },
    { key: 'net', label: 'Net balance (balance - debt)', value: netBalance },
  ];

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-sm uppercase tracking-[0.3em] text-zinc-500">Wallet</h3>
      <table className="w-full table-auto text-sm">
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
              <td className={`py-3 font-semibold ${r.key === 'net' ? 'text-emerald-400' : ''}`}>
                {formatCompactValue(r.value)}
              </td>
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
          <div className="text-xs">Net total</div>
          <div className="font-semibold text-emerald-400">{formatCompactValue(netBalance)} UGX</div>
        </div>
      </div>
    </div>
  );
}

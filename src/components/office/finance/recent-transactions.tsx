'use client';

import React, { useState } from 'react';
import { detailColor, formatAmount, loadTransactions, methodColor } from './transactions-data';

export default function RecentTransactions() {
  const [showAll, setShowAll] = useState(false);
  const [transactions] = useState(() => loadTransactions());
  const visible = showAll ? transactions : transactions.slice(0, 4);

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 lg:col-span-2 no-scrollbar">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Recent transactions</h2>
        <h2 className="hidden max-[500px]:block text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Transactions</h2>
        <button type="button" onClick={() => setShowAll((current) => !current)} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300 hover:text-red-200">{showAll ? 'View less' : 'View all'}</button>
      </div>
      <div className="office-transactions-scroll max-h-56 overflow-y-auto max-[500px]:overflow-x-auto max-[500px]:scrollbar-hide">
        <div className="hidden max-[500px]:block">
          <div className="divide-y divide-zinc-800/60">
            {visible.map((item) => (
              <div key={item.id} className="flex gap-3 px-3 py-2 max-[500px]:px-1.5">
                <div className="flex-shrink-0 text-right">
                  <p className="text-[11px] font-medium text-zinc-300">{item.date}</p>
                  <p className="text-[10px] text-zinc-500">{item.time}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-xs font-medium ${detailColor(item.type)}`}>{item.details}</p>
                  <p className={`truncate text-[11px] ${methodColor(item.method)}`}>{item.method}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-emerald-300">{formatAmount(item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-[500px]:hidden">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-zinc-900 text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-zinc-800/60">
                  <td className="px-3 py-2 text-zinc-300">{item.date}</td>
                  <td className="px-3 py-2 text-zinc-400">{item.time}</td>
                  <td className={`px-3 py-2 ${detailColor(item.type)}`}>{item.details}</td>
                  <td className={`px-3 py-2 ${methodColor(item.method)}`}>{item.method}</td>
                  <td className="px-3 py-2 text-right text-emerald-300">{formatAmount(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

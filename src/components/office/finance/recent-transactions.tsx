'use client';

import React, { useState } from 'react';

const transactions = [
  { date: '26|08|26', time: '09:30', details: 'Campaign payout', amount: 'UGX 450,000' },
  { date: '25|08|26', time: '16:10', details: 'Market purchase', amount: 'UGX 120,000' },
  { date: '24|08|26', time: '11:45', details: 'Account deposit', amount: 'UGX 800,000' },
  { date: '22|08|26', time: '14:20', details: 'Withdrawal', amount: 'UGX 200,000' },
  { date: '20|08|26', time: '08:15', details: 'Campaign income', amount: 'UGX 320,000' },
  { date: '18|08|26', time: '13:05', details: 'Campaign payout', amount: 'UGX 150,000' },
];

export default function RecentTransactions() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Recent transactions</h2><button type="button" onClick={() => setShowAll((current) => !current)} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300 hover:text-red-200">{showAll ? 'View less' : 'View all'}</button></div>
      <div className="office-transactions-scroll max-h-56 overflow-y-auto max-[500px]:overflow-x-auto"><table className="min-w-[560px] w-full text-left text-sm"><thead className="sticky top-0 bg-zinc-900 text-[10px] uppercase tracking-[0.15em] text-zinc-500"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Details</th><th className="px-3 py-2 text-right">Amount</th></tr></thead><tbody>{(showAll ? transactions : transactions.slice(0, 4)).map((transaction) => <tr key={`${transaction.date}-${transaction.time}`} className="border-t border-zinc-800/60"><td className="px-3 py-2 text-zinc-300">{transaction.date}</td><td className="px-3 py-2 text-zinc-400">{transaction.time}</td><td className="px-3 py-2 text-white">{transaction.details}</td><td className="px-3 py-2 text-right text-emerald-300">{transaction.amount}</td></tr>)}</tbody></table></div>
    </section>
  );
}

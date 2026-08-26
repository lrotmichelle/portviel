'use client';

import React, { useState } from 'react';

const initialMethods = [
  { name: 'Airtel Money', detail: '0700 123 456', verified: true },
  { name: 'MoMo', detail: 'Merchant code: 884211', verified: true },
  { name: 'Bank', detail: 'Account: 0012345678', verified: false },
];

export default function PaymentMethods() {
  const [methods, setMethods] = useState(initialMethods);

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Payment methods</h2><button type="button" onClick={() => setMethods((current) => current.map((method) => ({ ...method, verified: !method.verified })))} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-300 hover:text-emerald-200">Refresh</button></div>
      <div className="grid gap-3 sm:grid-cols-3">{methods.map((method) => <div key={method.name} className="min-w-0 rounded-xl border border-zinc-700/80 bg-zinc-950/50 p-3"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-white">{method.name}</span><span className={`text-base font-bold ${method.verified ? 'text-emerald-400' : 'text-red-400'}`} aria-label={method.verified ? 'Verified' : 'Not verified'}>{method.verified ? '✓' : '×'}</span></div><p className="mt-2 truncate text-xs text-zinc-400">{method.detail}</p></div>)}</div>
    </section>
  );
}

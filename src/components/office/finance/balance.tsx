'use client';

import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { getFinanceState } from '@/lib/finance';

export default function Balance() {
  const [balance, setBalance] = useState(() => getFinanceState().accountBalance);

  useEffect(() => {
    const update = () => setBalance(getFinanceState().accountBalance);
    window.addEventListener('financeStateChanged', update);
    return () => window.removeEventListener('financeStateChanged', update);
  }, []);

  const formatBalance = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
      const suffix = abs >= 1_000_000_000_000 ? 't' : 'b';
      const divisor = suffix === 't' ? 1_000_000_000_000 : 1_000_000_000;
      return `UGX ${(value / divisor).toFixed(1).replace(/\.0$/, '')}${suffix}`;
    }
    if (abs >= 1_000_000) {
      return `UGX ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
    }
    if (abs >= 1_000) {
      return `UGX ${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `UGX ${value}`;
  };

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-emerald-400" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Balance</h2>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{formatBalance(balance)}</p>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { addTransaction } from './transactions-data';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const submit = () => {
    if (!amount) {
      setMessage('Enter an amount first.');
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Enter a valid amount.');
      return;
    }
    addTransaction({
      date: new Date().toISOString().split('T')[0].replace(/\d{4}/, (y) => y.slice(-2)),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      details: 'Account deposit',
      amount: value,
      method: 'bank',
      type: 'deposit',
    });
    setMessage(`Deposit request for ${value} submitted.`);
    setAmount('');
  };

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Deposit</h2>
      <div className="mt-4 flex gap-2 no-spinner"><input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" placeholder="Amount" className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-500" /><button type="button" onClick={submit} className="rounded-lg border border-amber-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-300 hover:bg-amber-500/10">Deposit</button></div>
      {message && <p className="mt-2 text-xs text-zinc-400">{message}</p>}
    </section>
  );
}

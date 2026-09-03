'use client';

import React, { useState } from 'react';
import { addTransaction, formatAmount } from './transactions-data';
import { getFinanceState, setFinanceState } from '@/lib/finance';
import { loadPaymentMethod } from './payment-methods';

export default function Withdrawals() {
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

    const method = loadPaymentMethod();
    if (!method) {
      setMessage('Add a payment method before withdrawing.');
      return;
    }

    const finance = getFinanceState();
    if (value > finance.accountBalance) {
      setMessage('Insufficient balance.');
      return;
    }

    setFinanceState({
      ...finance,
      accountBalance: Math.max(0, finance.accountBalance - value),
    });

    addTransaction({
      date: new Date().toISOString().split('T')[0].replace(/\d{4}/, (y) => y.slice(-2)),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      details: 'Withdrawal',
      amount: value,
      method: method.type === 'bank' ? 'bank' : 'mobile money',
      type: 'withdrawal',
    });

    setMessage(`Withdrawal of ${value.toLocaleString()} UGX submitted.`);
    setAmount('');
  };

  const numericAmount = Number(amount);
  const helperText = amount && Number.isFinite(numericAmount) && numericAmount > 0 ? `Withdrawal: ${formatAmount(numericAmount)}` : '';

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Withdrawals</h2>
      <div className="mt-4 flex gap-2 no-spinner"><input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" placeholder="Amount" className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /><button type="button" onClick={submit} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">Withdrawal</button></div>
      {helperText && <p className="mt-2 text-xs text-sky-300">{helperText}</p>}
      {message && <p className="mt-2 text-xs text-zinc-400">{message}</p>}
    </section>
  );
}

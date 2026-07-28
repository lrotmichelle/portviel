'use client';

import React, { useEffect, useState } from 'react';

type Transaction = {
  id: string;
  particulars: string;
  method: 'Bank' | 'Airtel Money' | 'Mobile Money' | 'On site';
  details: 'withdraw' | 'deposit' | 'income' | 'payout' | 'purchase' | 'sales';
  amount: number;
};

const transactions: Transaction[] = [
  { id: 't1', particulars: 'Spring Launch campaign', method: 'Airtel Money', details: 'payout', amount: 32000 },
  { id: 't2', particulars: 'Trending Pro product', method: 'Mobile Money', details: 'purchase', amount: 15000 },
  { id: 't3', particulars: 'Growth Campaign income', method: 'Bank', details: 'income', amount: 45000 },
  { id: 't4', particulars: 'Office deposit', method: 'Bank', details: 'deposit', amount: 120000 },
  { id: 't5', particulars: 'Withdraw request', method: 'Airtel Money', details: 'withdraw', amount: 200000 },
  { id: 't6', particulars: 'Creator on-site sale', method: 'On site', details: 'sales', amount: 54000 },
  { id: 't7', particulars: 'Creator Fund payout', method: 'Airtel Money', details: 'payout', amount: 64000 },
];

const rowBackground = (detail: Transaction['details']) => {
  switch (detail) {
    case 'income':
    case 'payout':
    case 'sales':
      return 'bg-emerald-500/10';
    case 'deposit':
      return 'bg-sky-500/10';
    case 'withdraw':
      return 'bg-red-500/10';
    case 'purchase':
      return 'bg-amber-500/10';
    default:
      return 'bg-zinc-800/50';
  }
};

const getRandomTransaction = (currentDisplay: Transaction[]) => {
  const currentIds = new Set(currentDisplay.map((item) => item.id));
  const available = transactions.filter((item) => !currentIds.has(item.id));
  return available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : transactions[Math.floor(Math.random() * transactions.length)];
};

export default function TransactionsContainer() {
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>(transactions.slice(0, 5));
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

  useEffect(() => {
    const delays = [2000, 3000, 4000, 5000, 6000];
    const timers: number[] = [];

    const runFlipSequence = () => {
      delays.forEach((delay, index) => {
        const timer = window.setTimeout(() => {
          setFlippingIndex(index);

          const replaceTimer = window.setTimeout(() => {
            setDisplayedTransactions((currentDisplay) => {
              const updated = [...currentDisplay];
              updated[index] = getRandomTransaction(currentDisplay);
              return updated;
            });
            setFlippingIndex(null);
          }, 300);

          timers.push(replaceTimer);
        }, delay);

        timers.push(timer);
      });
    };

    runFlipSequence();
    const totalCycleInterval = window.setInterval(runFlipSequence, 7000);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(totalCycleInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-full rounded-[28px] border border-zinc-800 p-4 overflow-hidden bg-zinc-950/20">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-0 border-b border-zinc-800/60 px-4 py-1.5 text-sm uppercase tracking-[0.22em] text-zinc-500">
        <span>Particulars</span>
        <span>Method</span>
        <span>Details</span>
        <span className="text-right">Amount</span>
      </div>

      <div className="grid gap-0.5 overflow-hidden flex-1">
        {displayedTransactions.map((tx, index) => (
          <div
            key={tx.id}
            className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-0 px-4 py-1.5 text-base leading-6 text-zinc-100 transition-all duration-300 ${rowBackground(tx.details)}`}
            style={{
              transform: flippingIndex === index ? 'rotateX(90deg) scale(0.98)' : 'rotateX(0deg) scale(1)',
              transformStyle: 'preserve-3d',
              transition: 'transform 300ms ease-out, opacity 300ms ease-out',
              opacity: flippingIndex === index ? 0 : 1,
              perspective: 700,
            }}
          >
            <span className="truncate">{tx.particulars}</span>
            <span className="text-zinc-300">{tx.method}</span>
            <span className="capitalize text-zinc-300">{tx.details}</span>
            <span className="text-right font-semibold text-zinc-100">{tx.amount.toLocaleString()} UGX</span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatCompactValue, formatCompactNumber } from '@/lib/currency';

interface CampaignTransaction {
  date: string;
  time: string;
  rank: number;
  member: string;
  views: number;
  amount: number;
}

interface CampaignTransactionsProps {
  transactions: CampaignTransaction[];
}

function formatElapsedTime(date: string, time: string, now: number): string {
  const timestamp = new Date(`${date}T${time}`).getTime();
  if (!Number.isFinite(timestamp)) return '-';

  const elapsedHours = Math.max(0, now - timestamp) / 3600000;
  if (elapsedHours < 24) {
    return `${elapsedHours.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}h`;
  }

  return `${Math.floor(elapsedHours / 24)}d`;
}

function formatTransactionDate(value: string): string {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}|${month}|${year.slice(-2)}` : value;
}

export default function CampaignTransactions({ transactions }: CampaignTransactionsProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showAll) return;
    const timer = setTimeout(() => setShowAll(false), 60000);
    return () => clearTimeout(timer);
  }, [showAll]);

  useEffect(() => {
    if (!showAll) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setShowAll(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAll]);

  return (
    <div ref={containerRef} className="flex h-full w-full flex-col rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign transactions</h3>
        <button type="button" onClick={() => setShowAll((prev) => !prev)} className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300">
          {showAll ? 'View less' : 'View all'}
        </button>
      </div>
      <div className={`min-w-0 max-w-full w-full flex-grow ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
        <table className={`campaign-transactions-table w-full ${showAll ? 'is-expanded min-w-[650px] table-auto' : 'is-collapsed min-w-full table-auto'} border-separate text-left text-sm`}>
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[5%]" />
            <col className="w-[31%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2 text-[11px] uppercase tracking-wide">
                <span className="transaction-relative-age-label">Age</span>
                <span className="transaction-date-label">Date</span>
              </th>
              <th className={`${showAll ? '' : 'transaction-time-column'} pb-2 text-[11px] uppercase tracking-wide`}>Time</th>
              <th className={`${showAll ? '' : 'transaction-optional-column'} pb-2 text-[11px] uppercase tracking-wide`}>Rank</th>
              <th className="pb-2 text-[11px] uppercase tracking-wide">Member</th>
              <th className={`${showAll ? '' : 'transaction-optional-column'} pb-2 text-right text-[11px] uppercase tracking-wide`}>Views</th>
              <th className="pb-2 text-right text-[11px] uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.length > 0 ? visibleTransactions.map((transaction, index) => (
              <tr key={`${transaction.date}-${transaction.time}-${transaction.member}-${index}`} className="border-t border-zinc-800/60">
                <td className="whitespace-nowrap py-2 pr-2 text-zinc-300">
                  <span className="transaction-relative-age">{formatElapsedTime(transaction.date, transaction.time, currentTime)}</span>
                  <span className="transaction-date">{formatTransactionDate(transaction.date)}</span>
                  <span className="transaction-inline-time text-[10px] uppercase tracking-[0.12em] text-zinc-500">{transaction.time}</span>
                </td>
                <td className={`${showAll ? '' : 'transaction-time-column'} py-2 text-zinc-400`}>{transaction.time}</td>
                <td className={`${showAll ? '' : 'transaction-optional-column'} py-2 text-zinc-300`}>#{transaction.rank}</td>
                <td className="max-w-[14rem] truncate whitespace-nowrap py-2 pr-2 text-white" title={transaction.member}>{transaction.member}</td>
                <td className={`${showAll ? '' : 'transaction-optional-column'} py-2 text-right text-zinc-300`}>{formatCompactNumber(transaction.views)}</td>
                <td className="whitespace-nowrap py-2 pl-2 text-right text-emerald-400">{formatCompactValue(transaction.amount)} UGX</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="py-4 text-center text-zinc-500">No campaign transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

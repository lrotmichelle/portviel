'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { formatCompactValue, formatCompactNumber } from '@/lib/currency';

interface PressureRow {
  rank: number;
  name: string;
  views: number;
  amount: number;
}

interface CampaignPressureProps {
  campaign?: {
    participants?: Array<{
      id: string;
      name: string;
      progress: number;
      submitted: boolean;
      approved: boolean;
    }>;
    viewsGenerated?: number;
    budgetUsed?: number;
    status?: string;
    timeRemainingDays?: number;
  } | null;
  currentUserName?: string;
  isExpired?: boolean;
}

export default function CampaignPressure({ campaign, currentUserName = 'You', isExpired = false }: CampaignPressureProps) {
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { rows, allRows } = useMemo(() => {
    if (!campaign) return { rows: [] as PressureRow[], allRows: [] as PressureRow[] };

    const participants = campaign.participants ?? [];
    const totalViews = campaign.viewsGenerated ?? 0;
    const totalAmount = campaign.budgetUsed ?? 0;

    const sorted = [...participants]
      .map((p, idx) => ({
        id: p.id,
        name: p.name.length > 9 ? `${p.name.slice(0, 9)}...` : p.name,
        views: Math.round(totalViews * (p.progress / 100)),
        amount: Math.round(totalAmount * (p.progress / 100)),
        originalIndex: idx,
      }))
      .sort((a, b) => b.views - a.views)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));

    const top3 = sorted.slice(0, 3);
    const userRow = participants.find((p) => p.name === currentUserName);
    const userRanked = userRow
      ? sorted.find((p) => p.id === userRow.id) ?? null
      : null;

    let result: PressureRow[] = [];

    if (userRanked && top3.some((p) => p.id === userRanked.id)) {
      result = top3.slice(0, 5).map((p) => ({ rank: p.rank, name: p.name, views: p.views, amount: p.amount }));
      if (sorted.length > 5) {
        const last = sorted[sorted.length - 1];
        result.push({ rank: last.rank, name: last.name, views: last.views, amount: last.amount });
      }
    } else {
      result = top3.map((p) => ({ rank: p.rank, name: p.name, views: p.views, amount: p.amount }));
      if (userRanked) {
        result.push({ rank: userRanked.rank, name: userRanked.name, views: userRanked.views, amount: userRanked.amount });
      }
      const remaining = sorted.filter((p) => !result.some((r) => r.name === p.name));
      result.push(...remaining.slice(0, 2));
    }

    return { rows: result.slice(0, 6), allRows: result };
  }, [campaign, currentUserName]);

  useEffect(() => {
    if (!showAll) return;
    const timer = setTimeout(() => {
      setShowAll(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [showAll]);

  useEffect(() => {
    if (!showAll) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAll]);

  if (!campaign || rows.length === 0) {
    return (
      <div className={`flex h-full flex-col rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200 ${isExpired ? 'opacity-60' : ''}`}>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign pressure</h3>
        <p className="text-sm text-zinc-400">No data available.</p>
      </div>
    );
  }

  const displayRows = showAll ? allRows : rows;

  return (
    <div ref={containerRef} className={`flex h-full flex-col rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign pressure</h3>
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300"
        >
          {showAll ? 'Show less' : 'View all'}
        </button>
      </div>
      <div className={`flex-grow overflow-x-auto ${showAll ? 'max-h-[200px] overflow-y-auto' : ''}`}>
        <table className="h-full w-full table-auto text-left text-sm">
          <thead>
            <tr className="text-zinc-400">
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
              <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Name</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Views</th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, idx) => (
              <tr key={idx} className="border-t border-zinc-800/60">
                <td className={`py-2 pr-2 ${isExpired ? 'text-zinc-500' : 'text-zinc-300'}`}>#{row.rank}</td>
                <td className={`py-2 pr-2 ${isExpired ? 'text-zinc-500' : row.name === currentUserName ? 'text-emerald-400 font-semibold' : 'text-white'}`}>{row.name}</td>
                <td className={`py-2 text-right ${isExpired ? 'text-zinc-500' : 'text-zinc-100'}`}>{formatCompactNumber(row.views)}</td>
                <td className={`py-2 text-right ${isExpired ? 'text-zinc-500' : 'text-emerald-400'}`}>{formatCompactValue(row.amount)} UGX</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

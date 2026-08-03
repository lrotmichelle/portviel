"use client";

import React, { useState } from 'react';

type CompetitionItem = {
  id: string;
  rank: number;
  username: string;
  likes: number;
  views: number;
  rate: string;
  owe: number;
  sparkline: number[];
};

const defaultItems: CompetitionItem[] = [
  { id: 'c1', rank: 1, username: 'creator_zen', likes: 42200, views: 328000, rate: '+12.4%', owe: 192000, sparkline: [32000, 34000, 36000, 38000, 40000, 41000, 42800] },
  { id: 'c2', rank: 2, username: 'brandflare', likes: 38100, views: 297000, rate: '+8.3%', owe: 176000, sparkline: [30000, 30500, 31000, 31200, 30900, 31400, 32100] },
  { id: 'c3', rank: 3, username: 'viralwave', likes: 34900, views: 275000, rate: '+1.2%', owe: 158000, sparkline: [28000, 28500, 28200, 28300, 28450, 28500, 28200] },
  { id: 'c4', rank: 4, username: 'peakreach', likes: 29800, views: 242000, rate: '-2.8%', owe: 140000, sparkline: [25000, 26000, 25500, 24800, 24200, 23900, 23500] },
];

const formatMetric = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
  }
  return `${(value / 1000).toFixed(value < 1000 ? 1 : 0).replace(/\.0$/, '')}k`;
};

const getSparklinePath = (points: number[]) => {
  const width = 150;
  const height = 34;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const step = width / (points.length - 1);

  return points
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / (max - min || 1)) * (height - 8) - 4;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const sparklineColor = (points: number[]) => {
  const first = points[0];
  const last = points[points.length - 1];
  if (last > first) return '#22c55e';
  if (last === first) return '#f59e0b';
  return '#f97316';
};

export default function Competition({ items }: { items?: CompetitionItem[] }) {
  const [selectedCampaign, setSelectedCampaign] = useState('Growth Campaign');
  const [selectedRange, setSelectedRange] = useState('5d');
  const rows = items ?? defaultItems;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-4 items-stretch">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 h-full">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">Victory in campaign</h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px] rounded-3xl bg-zinc-950/50 overflow-hidden">
            <div className="grid grid-cols-[48px_1.5fr_1.2fr_1.2fr_1.4fr_1fr] gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              <span>Rank</span>
              <span>Name</span>
              <span>Likes</span>
              <span>Views</span>
              <span>Rate</span>
              <span>Owe</span>
            </div>

            <div>
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-[48px_1.5fr_1.2fr_1.2fr_1.4fr_1fr] gap-2 items-center px-3 py-2 text-sm text-white ${
                    index === 0 ? 'animate-flip-slow' : 'animate-flip-fast'
                  } ${index % 2 === 0 ? 'bg-zinc-950/60' : 'bg-zinc-950/40'}`}
                >
                  <span className="font-semibold text-emerald-300">{row.rank}</span>
                  <div>
                    <p className="font-medium text-white truncate">{row.username}</p>
                  </div>
                  <span className="font-semibold text-zinc-100">{formatMetric(row.likes)}</span>
                  <span className="font-semibold text-zinc-100">{formatMetric(row.views)}</span>
                  <div className="rounded-2xl bg-zinc-950/70 p-1">
                    <svg viewBox="0 0 150 24" className="w-full h-5">
                      <path d={getSparklinePath(row.sparkline)} fill="none" stroke={sparklineColor(row.sparkline)} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="font-semibold text-zinc-200">UGX {formatMetric(row.owe)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 h-full">
        <div className="space-y-2 h-full">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.32em] text-zinc-500">Select campaign</label>
            <select
              value={selectedCampaign}
              onChange={(event) => setSelectedCampaign(event.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-[13px] text-zinc-100 outline-none"
            >
              <option>Growth Campaign</option>
              <option>Spring Launch</option>
              <option>Brand Refresh</option>
              <option>Awareness Drive</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-[0.32em] text-zinc-500">Date range</div>
            <div className="grid grid-cols-2 gap-2">
              {['5d', '10d', '16d', '1m', 'this year', 'this month'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`rounded-2xl px-2 py-2 text-left text-[13px] font-semibold transition-colors ${
                    selectedRange === range
                      ? 'bg-emerald-500/10 text-emerald-200'
                      : 'bg-zinc-950/70 text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          
        </div>
      </aside>
    </div>
  );
}

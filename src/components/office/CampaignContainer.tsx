'use client';

import React, { useEffect, useState } from 'react';
import CampaignProgressCurveGraph from '@/components/office/CampaignProgressCurveGraph';
import DualTrackGaugeWidget from '@/components/office/DualTrackGaugeWidget';

type TimeScale = 'days' | 'months' | 'years';

type SeriesSet = Record<TimeScale, { labels: string[]; likes: number[]; views: number[] }>;

function makeSeries(total: number, points: number) {
  // Create a simple ramp-up series that sums approximately to total
  const arr = Array.from({ length: points }, (_, i) => Math.round((total / (points * (points + 1) / 2)) * (i + 1)));
  return arr;
}

// CampaignContainer: shows campaign progress (left) and audience gauge (right).
// Data should be sourced from the Manage page state or the /api/campaigns route.
// TODO: Replace mock/static data in child components with live data from context or API.
export default function CampaignContainer() {
  const [campaignSeries, setCampaignSeries] = useState<SeriesSet | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch('/api/campaigns?filter=created');
        if (!res.ok) throw new Error('no data');
        const data = await res.json();
        const item = Array.isArray(data) && data.length ? data[0] : null;
        if (!item) return;

        const likesTotal = Number(item.likesGenerated ?? item.likesGenerated) || 0;
        const viewsTotal = Number(item.viewsGenerated ?? item.views_generated ?? 0) || 0;

        const series: SeriesSet = {
          days: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            likes: makeSeries(likesTotal || 7000, 7),
            views: makeSeries(viewsTotal || 350000, 7),
          },
          months: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            likes: makeSeries(Math.max(likesTotal, 12000), 12),
            views: makeSeries(Math.max(viewsTotal, 450000), 12),
          },
          years: {
            labels: ['2023','2024','2025','2026'],
            likes: makeSeries(Math.max(likesTotal, 450000), 4),
            views: makeSeries(Math.max(viewsTotal, 12000000), 4),
          },
        };

        if (mounted) setCampaignSeries(series);
      } catch (err) {
        // ignore; keep using internal mock data in child component
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-[28px] p-4 bg-transparent mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Campaign Flow</h2>
        <div className="flex items-center gap-2">
          <select className="bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-200 px-2 py-1 rounded">
            <option value="7d">7d</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>

          <select className="bg-zinc-900/60 border border-zinc-800 text-sm text-zinc-200 px-2 py-1 rounded">
            <option>All campaigns</option>
            <option>Spring Launch</option>
            <option>Growth Campaign</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Main progress curve (spans 2 columns on large screens) */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
          <CampaignProgressCurveGraph campaignData={campaignSeries ?? undefined} />

          {/* Competition block below the graph */}
          <div className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                {/* placeholder — competition will be shown outside in OfficeOverview insertion */}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Audience gauge (uses DualTrackGaugeWidget). */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 flex items-center justify-center">
          {
            // derive totals from the 'days' series when available
          }
          <DualTrackGaugeWidget
            campaignTotals={
              campaignSeries
                ? {
                    likes: campaignSeries.days.likes.reduce((s, v) => s + v, 0),
                    views: campaignSeries.days.views.reduce((s, v) => s + v, 0),
                  }
                : undefined
            }
          />
        </div>
      </div>
    </section>
  );
}

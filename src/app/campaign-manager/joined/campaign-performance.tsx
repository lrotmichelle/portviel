'use client';

import React, { useMemo } from 'react';
import type { CampaignCardData } from '@/types/campaign';
import { calculatePlatformPercentages } from '@/lib/campaignData';

interface CampaignPerformanceProps {
  campaign?: CampaignCardData | null;
}

const platformColors: Record<string, string> = {
  tiktok: '#00f2ea',
  instagram: '#C13584',
  youtube: '#FF0000',
  facebook: '#1877F2',
  twitter: '#a1a1aa',
  linkedin: '#0a66c2',
  snapchat: '#FFFC00',
};

export default function CampaignPerformance({ campaign }: CampaignPerformanceProps) {
  const platforms = campaign?.requiredPlatforms ?? [];

  const { conicSegments, totalViews } = useMemo(() => {
    if (platforms.length === 0 || !campaign) {
      return { conicSegments: '', totalViews: 0 };
    }

    const metrics = calculatePlatformPercentages(campaign);
    const totalPlatformViews = metrics.reduce((acc, curr) => acc + (curr.views || 0), 0);

    // Use the same descending segment order and dynamic 280° gauge as CampaignMembers.
    const sortedMetrics = [...metrics].sort((a, b) => (b.views || 0) - (a.views || 0));
    const count = platforms.length;
    let percentageOfGauge = 1.0;
    if (count === 1) percentageOfGauge = 0.4;
    else if (count === 2) percentageOfGauge = 0.6;
    else if (count === 3) percentageOfGauge = 0.8;

    const MAX_GAUGE_SWEEP_DEG = 280;
    const activeSweepDeg = MAX_GAUGE_SWEEP_DEG * percentageOfGauge;
    let accumulatedDeg = 0;
    const gradientStops: string[] = [];

    sortedMetrics.forEach((metric) => {
      const share = totalPlatformViews > 0
        ? (metric.views || 0) / totalPlatformViews
        : 0;
      const color = platformColors[metric.platform.toLowerCase()] || '#52525b';
      const segmentSweep = share * activeSweepDeg;
      const startDeg = accumulatedDeg;
      const endDeg = accumulatedDeg + segmentSweep;
      gradientStops.push(`${color} ${startDeg}deg ${endDeg}deg`);
      accumulatedDeg = endDeg;
    });

    if (accumulatedDeg < MAX_GAUGE_SWEEP_DEG) {
      gradientStops.push(`#27272a ${accumulatedDeg}deg ${MAX_GAUGE_SWEEP_DEG}deg`);
    }
    gradientStops.push(`#27272a ${MAX_GAUGE_SWEEP_DEG}deg 360deg`);

    return {
      conicSegments: gradientStops.join(', '),
      totalViews: campaign.viewsGenerated || 0,
    };
  }, [campaign, platforms.length]);

  if (!campaign || platforms.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign performance</h3>
        <p className="text-sm text-zinc-400">No campaign selected.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign performance</h3>
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${conicSegments})`,
              WebkitMask: 'radial-gradient(transparent 56%, black 57%)',
              mask: 'radial-gradient(transparent 56%, black 57%)',
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-bold text-white">{totalViews.toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">Views</span>
          </div>
        </div>
      </div>
    </div>
  );
}

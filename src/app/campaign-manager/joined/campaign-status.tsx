'use client';

import React, { useMemo } from 'react';
import type { CampaignCardData } from '@/types/campaign';
import { calculatePlatformPercentages } from '@/lib/campaignData';

interface CampaignStatusProps {
  campaign: CampaignCardData | null;
}

function abbreviatePlatform(platform: string): string {
  const map: Record<string, string> = {
    tiktok: 'TT',
    instagram: 'IG',
    youtube: 'YT',
    facebook: 'FB',
    twitter: 'X',
    linkedin: 'LI',
    snapchat: 'SC',
  };
  return map[platform.toLowerCase()] || platform.slice(0, 2).toUpperCase();
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

export default function CampaignStatus({ campaign }: CampaignStatusProps) {
  const selected = campaign;
  const platforms = selected?.requiredPlatforms ?? [];

  const { conicSegments, totalMembers } = useMemo(() => {
    if (platforms.length === 0 || !selected) {
      return { conicSegments: '', totalMembers: 0 };
    }

    const metrics = calculatePlatformPercentages(selected);
    const totalPlatformMembers = metrics.reduce((acc, curr) => acc + (curr.members || 0), 0);

    // Dynamic scale factor of 280° max gauge capacity
    const count = platforms.length;
    let percentageOfGauge = 1.0;
    if (count === 1) percentageOfGauge = 0.4;
    else if (count === 2) percentageOfGauge = 0.6;
    else if (count === 3) percentageOfGauge = 0.8;
    else percentageOfGauge = 1.0;

    const MAX_GAUGE_SWEEP_DEG = 280;
    const activeSweepDeg = MAX_GAUGE_SWEEP_DEG * percentageOfGauge;

    let accumulatedDeg = 0;
    const gradientStops: string[] = [];

    // Calculate exact mathematical proportion for each segment without sorting
    metrics.forEach((metric) => {
      const share = totalPlatformMembers > 0
        ? (metric.members || 0) / totalPlatformMembers
        : 0;

      const color = platformColors[metric.platform.toLowerCase()] || '#52525b';
      const segmentSweep = share * activeSweepDeg;
      const startDeg = accumulatedDeg;
      const endDeg = accumulatedDeg + segmentSweep;

      gradientStops.push(`${color} ${startDeg}deg ${endDeg}deg`);
      accumulatedDeg = endDeg;
    });

    // Make everything past the active data transparent (no unfilled track displayed)
    gradientStops.push(`transparent ${accumulatedDeg}deg 360deg`);

    return {
      conicSegments: gradientStops.join(', '),
      totalMembers: selected.communitySize || 0,
    };
  }, [platforms, selected]);

  if (!selected || platforms.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign members</h3>
        <p className="text-sm text-zinc-400">No campaign selected.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign members</h3>
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-36 w-36 items-center justify-center">
          {/* Donut Ring built starting from 0deg (12 o'clock) */}
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${conicSegments})`,
              WebkitMask: 'radial-gradient(transparent 56%, black 57%)',
              mask: 'radial-gradient(transparent 56%, black 57%)',
            }}
          />

          {/* Center Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-bold text-white">
              {totalMembers.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">
              Members
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
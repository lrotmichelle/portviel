'use client';

import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';
import type { CampaignCardData } from '@/types/campaign';
import { calculatePlatformPercentages } from '@/lib/campaignData';
import { formatCompactNumber } from '@/lib/currency';

interface CampaignPerformanceProps {
  campaign?: CampaignCardData | null;
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

export default function CampaignPerformance({ campaign }: CampaignPerformanceProps) {
  const platforms = campaign?.requiredPlatforms ?? [];
  const isSinglePlatform = platforms.length === 1;

  const { conicSegments, totalViews, metrics } = useMemo(() => {
    if (platforms.length === 0 || !campaign) {
      return { conicSegments: '', totalViews: 0, metrics: [] };
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

    // Leave unused gauge space transparent so only platform colors are visible.
    gradientStops.push(`transparent ${accumulatedDeg}deg 360deg`);

    return {
      conicSegments: gradientStops.join(', '),
      totalViews: campaign.viewsGenerated || 0,
      metrics,
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
      <div className="flex items-center gap-4">
        <div className={`${isSinglePlatform ? 'w-full' : 'w-1/2 shrink-0'}`}>
          {isSinglePlatform && (
            <div className="mb-3 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              <span className="campaign-platform-abbreviation text-white">{abbreviatePlatform(platforms[0])}</span>
              <span className="campaign-platform-name text-white">{platforms[0]}</span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-sky-500/70" />
                <span>{formatCompactNumber(totalViews)}</span>
              </span>
            </div>
          )}
          {isSinglePlatform ? (
            <div className="h-4 w-full overflow-hidden rounded-full bg-transparent">
              <div className="h-full w-full rounded-full" style={{ backgroundColor: platformColors[platforms[0].toLowerCase()] || '#52525b' }} />
            </div>
          ) : (
          <div className="relative mx-auto aspect-square w-full max-w-[240px]">
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
          )}
        </div>
        <div className={`${isSinglePlatform ? 'hidden' : 'grid w-1/2'} gap-y-2 border-l border-zinc-800/60 pl-4 text-[10px] uppercase tracking-[0.16em] text-zinc-300`}>
          {metrics.map((metric) => (
            <div key={metric.platform} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: platformColors[metric.platform.toLowerCase()] || '#52525b' }}
                />
                <span className="campaign-platform-abbreviation">{abbreviatePlatform(metric.platform)}</span>
                <span className="campaign-platform-name">{metric.platform}</span>
              </span>
              <span className="text-zinc-400">{formatCompactNumber(metric.views || 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

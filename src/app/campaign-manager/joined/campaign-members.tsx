'use client';

import React, { useMemo } from 'react';
import DonutChart from '@/components/DonutChart';
import type { CampaignCardData } from '@/types/campaign';

interface CampaignMembersProps {
  campaigns: CampaignCardData[];
  selectedId: string;
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

const platformColors: Record<string, { color: string; textColor: string }> = {
  tiktok: { color: 'bg-cyan-400', textColor: 'text-cyan-300' },
  instagram: { color: 'bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400', textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-pink-300 to-orange-300' },
  youtube: { color: 'bg-red-500', textColor: 'text-red-300' },
  facebook: { color: 'bg-blue-500', textColor: 'text-blue-300' },
  twitter: { color: 'bg-zinc-300', textColor: 'text-zinc-200' },
  linkedin: { color: 'bg-sky-600', textColor: 'text-sky-300' },
  snapchat: { color: 'bg-yellow-400', textColor: 'text-yellow-300' },
};

export default function CampaignMembers({ campaigns, selectedId }: CampaignMembersProps) {
  const selected = campaigns.find((c) => c.id === selectedId) ?? campaigns[0] ?? null;
  const platforms = selected?.requiredPlatforms ?? [];

  const { segments, visiblePercentage, centerLabel, isBar } = useMemo(() => {
    if (platforms.length === 0) {
      return { segments: [], visiblePercentage: 100, centerLabel: 'Members', isBar: false };
    }

    const count = platforms.length;
    let vp = 100;
    let bar = false;
    if (count === 1) {
      bar = true;
      vp = 100;
    } else if (count === 2) {
      vp = 50;
    } else if (count === 3) {
      vp = 75;
    } else {
      vp = 100;
    }

    const base = selected ? Math.max(1, Math.round((selected.communitySize || 100) / count)) : 100;
    const segs = platforms.map((platform, idx) => {
      const colors = platformColors[platform.toLowerCase()] || { color: 'bg-zinc-500', textColor: 'text-zinc-300' };
      return {
        label: platform,
        short: abbreviatePlatform(platform),
        value: count === 1 ? 100 : base + idx * 17,
        color: colors.color,
        textColor: colors.textColor,
      };
    });

    return { segments: segs, visiblePercentage: vp, centerLabel: 'Members', isBar: bar };
  }, [platforms, selected]);

  if (!selected || platforms.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-200">
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign members</h3>
        <p className="text-sm text-zinc-400">No campaign selected.</p>
      </div>
    );
  }

  const totalMembers = selected.communitySize || segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-200">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign members</h3>
      <div className="flex flex-col items-center gap-3">
        {isBar ? (
          <div className="w-full">
            <div className="flex h-[16px] w-full overflow-hidden rounded-full bg-zinc-900/80">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className={`${segment.color} h-full`}
                  style={{ width: `${segment.value}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-300">
              <span className="text-zinc-400">Members</span>
              <span className="text-emerald-300">{totalMembers.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <DonutChart
            segments={segments}
            centerValue={totalMembers}
            centerLabel={centerLabel}
            title=""
            size={180}
            strokeWidth={20}
            visiblePercentage={visiblePercentage}
          />
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${segment.color}`} />
              <span className={`${segment.textColor}`}>{segment.short}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

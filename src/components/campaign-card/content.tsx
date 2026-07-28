import React from 'react';
import { Users, Eye, Heart } from 'lucide-react';
import type { CampaignCardData } from '@/types/campaign';

interface ContentProps {
  data: CampaignCardData;
}

export function Content({ data }: ContentProps) {
  const nicheHashtags = data.nicheHashtag.split(',').map(tag => tag.trim());
  const requiredPlatforms = data.requiredPlatforms ?? [];

  const renderPlatformLabel = (platform: string) => {
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    return (
      <span key={platform} className="rounded-full border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
        {label}
      </span>
    );
  };

  const formatMetric = (val: number): string => {
    if (val >= 100000) {
      const mVal = val / 1000000;
      return mVal % 1 === 0 ? `${mVal}M` : `${mVal.toFixed(2).replace(/\.?0+$/, '')}M`;
    } else {
      const kVal = val / 1000;
      return kVal % 1 === 0 ? `${kVal}k` : `${kVal.toFixed(1).replace(/\.?0+$/, '')}k`;
    }
  };

  return (
    <div className="bg-zinc-950/20 border border-neutral-900 rounded-2xl p-3.5 flex flex-col gap-4">
      <div className="flex flex-col gap-2 px-0.5">
        {requiredPlatforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {requiredPlatforms.slice(0, 3).map(renderPlatformLabel)}
          </div>
        ) : null}

        <p className="text-xs leading-relaxed font-normal text-zinc-400">
          {data.description}
        </p>

        <div className="select-none flex items-center gap-1.5 py-0.5">
          {nicheHashtags.map((tag, index) => (
            <span key={index} className="text-[11px] font-extrabold tracking-tight text-amber-400/90">
              #{tag}
            </span>
          ))}
          <span className="text-[11px] font-extrabold tracking-tight text-zinc-500">• {data.category}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-neutral-800/80 bg-[#0B0B0B]/90 border border-neutral-800/80 rounded-xl py-2.5 shadow-sm text-xs font-black font-mono tracking-tight leading-none">
        {/* Community Size */}
        <div className="flex items-center justify-center gap-1.5" title="Community Size">
          <Users className="w-4 h-4 text-emerald-500/60 shrink-0" />
          <span className="text-emerald-400">{formatMetric(data.communitySize)}</span>
        </div>

        {/* Views */}
        <div className="flex items-center justify-center gap-1.5" title="Views">
          <Eye className="w-4 h-4 text-sky-500/60 shrink-0" />
          <span className="text-sky-400">{formatMetric(data.viewsGenerated)}</span>
        </div>

        {/* Likes */}
        <div className="flex items-center justify-center gap-1.5" title="Likes">
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/10 shrink-0" strokeWidth={2.5} />
          <span className="text-red-400">{formatMetric(data.likesGenerated)}</span>
        </div>
      </div>
    </div>
  );
}
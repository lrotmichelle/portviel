'use client';

import React from 'react';
import DonutChart from '@/components/DonutChart';

interface AudienceMixProps {
  segments?: { label: string; value: number; color: string; textColor: string }[];
  totalFollowers?: number;
}

const defaultSegments = [
  { label: 'TikTok', value: 34, color: 'bg-cyan-400', textColor: 'text-cyan-300' },
  { label: 'YouTube', value: 26, color: 'bg-red-500', textColor: 'text-red-300' },
  { label: 'Instagram', value: 24, color: 'bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400', textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-pink-300 to-orange-300' },
  { label: 'Facebook', value: 16, color: 'bg-blue-500', textColor: 'text-blue-300' },
].filter((segment) => segment.value > 0);

export default function AudienceMix({ segments = defaultSegments, totalFollowers = 0 }: AudienceMixProps) {
  return (
    <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
      <div className="mb-3">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Audience mix</h3>
      </div>
      <div className="rounded-xl bg-zinc-950/30 p-4">
        <DonutChart
          segments={segments}
          centerValue={totalFollowers}
          centerLabel="Followers"
          title="Platform performance"
          size={200}
          strokeWidth={25}
        />
      </div>
    </div>
  );
}

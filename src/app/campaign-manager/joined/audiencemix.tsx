'use client';

import React from 'react';
import DonutChart from '@/components/DonutChart';

interface AudienceMixProps {
  segments?: { label: string; value: number; color: string; textColor: string }[];
  totalFollowers?: number;
}

const defaultSegments = [
  { label: 'TikTok', value: 34, color: '#00f2ea', textColor: 'text-[#00f2ea]' },
  { label: 'YouTube', value: 26, color: '#FF0000', textColor: 'text-[#FF0000]' },
  { label: 'Instagram', value: 24, color: '#C13584', textColor: 'text-[#C13584]' },
  { label: 'Facebook', value: 16, color: '#1877F2', textColor: 'text-[#1877F2]' },
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

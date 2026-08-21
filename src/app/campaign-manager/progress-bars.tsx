'use client';

import React from 'react';
import DonutChart from '@/components/DonutChart';

type BarSegment = {
    label: string;
    short: string;
    value: number;
    color: string;
    textColor: string;
};

type ProgressBarsProps = {
    budget?: number;
    cpm?: number;
    currentViews?: number;
    pool?: number;
    settled?: number;
};

const payoutSegments: BarSegment[] = [
    { label: 'Paid', short: 'Paid', value: 58, color: 'bg-emerald-400', textColor: 'text-emerald-300' },
    { label: 'Budget', short: 'Budget', value: 27, color: 'bg-zinc-600', textColor: 'text-zinc-300' },
    { label: 'Owe', short: 'Owe', value: 15, color: 'bg-yellow-400', textColor: 'text-yellow-300' },
].filter((segment) => segment.value > 0);

const targetSegments: BarSegment[] = [
    { label: 'TikTok', short: 'TK', value: 34, color: '#00f2ea', textColor: 'text-[#00f2ea]' },
    { label: 'YouTube', short: 'YT', value: 26, color: '#FF0000', textColor: 'text-[#FF0000]' },
    { label: 'Instagram', short: 'IG', value: 24, color: '#C13584', textColor: 'text-[#C13584]' },
    { label: 'Facebook', short: 'FB', value: 16, color: '#1877F2', textColor: 'text-[#1877F2]' },
].filter((segment) => segment.value > 0);

function renderBarWithMarkers(segments: BarSegment[]) {
    return (
        <div className="relative pt-4">
            {segments.map((segment) => {
                const segmentStart = segments
                    .slice(0, segments.indexOf(segment))
                    .reduce((acc, item) => acc + item.value, 0);
                const labelLeft = segmentStart + segment.value / 2;

                return (
                    <div
                        key={`${segment.label}-label`}
                        className="absolute top-0 -translate-x-1/2 text-[9px] font-semibold text-white"
                        style={{ left: `${labelLeft}%` }}
                    >
                        {segment.value}%
                    </div>
                );
            })}

            <div className="flex h-[16px] w-full overflow-hidden rounded-full bg-zinc-900/80">
                {segments.map((segment) => (
                    <div
                        key={segment.label}
                        className="h-full"
                        style={{ backgroundColor: segment.color, width: `${segment.value}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function ProgressBars({ budget = 0, cpm = 0, currentViews = 0, pool = 0, settled = 0 }: ProgressBarsProps) {
    const effectiveBudget = Number(budget) || 0;
    const effectiveCpm = Number(cpm) || 0;
    const effectiveViews = Number(currentViews) || 0;
    const effectivePool = Number(pool) || 0;
    const effectiveSettled = Number(settled) || 0;
    const balance = Math.max(0, effectivePool - effectiveSettled);
    
    const targetViews = effectiveBudget > 0 && effectiveCpm > 0 ? (effectiveBudget / effectiveCpm) * 1.6 : 0;
    const hitTargetPercentage = targetViews > 0 ? Math.min(100, (effectiveViews / targetViews) * 100) : 0;
    const remainingPercentage = Math.max(0, 100 - hitTargetPercentage);

    // Create donut segments for payment plan
    const paymentDonutSegments = [
        { label: 'Paid', short: 'Paid', value: 58, color: '#4ade80', textColor: 'text-emerald-300' },
        { label: 'Budget', short: 'Budget', value: 27, color: '#52525b', textColor: 'text-zinc-300' },
        { label: 'Owe', short: 'Owe', value: 15, color: '#facc15', textColor: 'text-yellow-300' },
    ].filter((segment) => segment.value > 0);

    return (
        <div className="w-full rounded-2xl bg-transparent p-3 text-sm text-zinc-200">
            <div className="flex flex-col gap-5">
                <div className="rounded-xl bg-zinc-950/30 p-4">
                    <DonutChart 
                        segments={paymentDonutSegments}
                        centerValue={balance}
                        centerLabel="Balance"
                        title="Payment plan"
                        size={200}
                        strokeWidth={25}
                    />
                </div>

                <div className="rounded-xl bg-zinc-950/30 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Target mix</h3>
                    </div>

                    {renderBarWithMarkers(targetSegments)}

                    <div className="mt-2 grid grid-cols-4 gap-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                        {targetSegments.map((segment) => (
                            <div key={segment.label} className="flex items-center justify-center gap-1.5 text-center">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                                <span style={{ color: segment.color }}>
                                    {segment.short}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl bg-zinc-950/30 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Hit target</h3>
                    </div>

                    <div className="relative">
                        <div className="flex h-[16px] w-full overflow-hidden rounded-full bg-zinc-900/80">
                            <div className="h-full bg-emerald-400" style={{ width: `${hitTargetPercentage}%` }} />
                            <div className="h-full bg-zinc-700" style={{ width: `${remainingPercentage}%` }} />
                        </div>

                        <div className="mt-2 flex items-center justify-end text-[9px] font-semibold text-white">
                            {effectiveViews.toLocaleString()} views
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-emerald-300">Hit target</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-zinc-700" />
                            <span className="text-zinc-300">Remaining</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
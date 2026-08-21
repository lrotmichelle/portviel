'use client';

import React from 'react';
import { formatCompactValue } from '@/lib/currency';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  textColor: string;
  rawValue?: number;
  rawUnit?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue?: number;
  centerLabel?: string;
  title: string;
  size?: number;
  strokeWidth?: number;
  visiblePercentage?: number;
}

export default function DonutChart({
  segments,
  centerValue = 0,
  centerLabel = 'Balance',
  title,
  size = 200,
  strokeWidth = 25,
  visiblePercentage = 100,
}: DonutChartProps) {
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const visibleFraction = Math.max(0, Math.min(1, visiblePercentage / 100));
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  let currentOffset = 0;
  const visibleSegments: Array<{ segment: DonutSegment; visibleLength: number; offset: number }> = [];

  segments.forEach((segment) => {
    const fraction = total > 0 ? segment.value / total : 0;
    const fullLength = circumference * fraction;
    const startOffset = currentOffset;
    const endOffset = startOffset + fullLength;
    const visibleEnd = circumference * visibleFraction;

    if (startOffset >= visibleEnd) return;

    const visibleLength = Math.min(fullLength, Math.max(0, visibleEnd - startOffset));
    visibleSegments.push({ segment, visibleLength, offset: startOffset });
    currentOffset = endOffset;
  });

  return (
    <div className="flex flex-row items-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">{title}</h3>

        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {visibleSegments.map(({ segment, visibleLength, offset }) => (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${visibleLength} ${circumference}`}
                strokeDashoffset={-offset}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatCompactValue(centerValue)}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wide">{centerLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
        {segments.map((segment, index) => {
          const label = (segment as any).short || segment.label;
          const raw = segment.rawValue != null ? formatCompactValue(segment.rawValue) : '';
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
              <span style={{ color: segment.color }}>{label}</span>
              {raw && <span className="text-zinc-400">{raw}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { formatCompactValue } from '@/lib/currency';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  textColor: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerValue?: number;
  centerLabel?: string;
  title: string;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({
  segments,
  centerValue = 0,
  centerLabel = 'Balance',
  title,
  size = 200,
  strokeWidth = 25,
}: DonutChartProps) {
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate total value for percentage calculations
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  
  // Generate SVG paths for each segment
  let currentOffset = 0;
  const paths = segments.map((segment, index) => {
    const percentage = total > 0 ? segment.value / total : 0;
    const segmentLength = circumference * percentage;
    const offset = currentOffset;
    currentOffset += segmentLength;
    
    // Calculate start and end angles
    const angle = (percentage * 360);
    
    return {
      index,
      segment,
      offset,
      length: segmentLength,
      angle,
      percentage: (percentage * 100).toFixed(0),
    };
  });

  // Map colors to Tailwind classes
  const colorClasses: Record<string, string> = {
    'bg-emerald-400': 'fill-emerald-400 stroke-emerald-400',
    'bg-zinc-600': 'fill-zinc-600 stroke-zinc-600',
    'bg-yellow-400': 'fill-yellow-400 stroke-yellow-400',
    'bg-cyan-400': 'fill-cyan-400 stroke-cyan-400',
    'bg-red-500': 'fill-red-500 stroke-red-500',
    'bg-blue-500': 'fill-blue-500 stroke-blue-500',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">{title}</h3>
      
      {/* Donut Chart SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgb(39, 39, 42)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          
          {/* Segments */}
          {paths.map(({ segment, index }) => {
            const percentage = total > 0 ? segment.value / total : 0;
            const angle = percentage * 360;
            const rad = (angle * Math.PI) / 180;
            
            // Calculate path
            const startX = size / 2 + radius * Math.cos(0);
            const startY = size / 2 + radius * Math.sin(0);
            
            const endX = size / 2 + radius * Math.cos(rad);
            const endY = size / 2 + radius * Math.sin(rad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            // Use circle segment approach with proper angle calculation
            const prevAngle = paths.slice(0, index).reduce((sum, p) => sum + (total > 0 ? p.segment.value / total : 0) * 360, 0);
            const prevRad = (prevAngle * Math.PI) / 180;
            
            const x1 = size / 2 + radius * Math.cos(prevRad);
            const y1 = size / 2 + radius * Math.sin(prevRad);
            
            const x2 = size / 2 + radius * Math.cos(prevRad + rad);
            const y2 = size / 2 + radius * Math.sin(prevRad + rad);
            
            return (
              <circle
                key={`segment-${index}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color.replace('bg-', 'var(--color-')}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * percentage} ${circumference}`}
                strokeDashoffset={-circumference * (paths.slice(0, index).reduce((sum, p) => sum + (total > 0 ? p.segment.value / total : 0), 0))}
                strokeLinecap="round"
                style={{
                  '--color-emerald-400': '#4ade80',
                  '--color-zinc-600': '#52525b',
                  '--color-yellow-400': '#facc15',
                  '--color-cyan-400': '#22d3ee',
                  '--color-red-500': '#ef4444',
                  '--color-blue-500': '#3b82f6',
                } as React.CSSProperties}
              />
            );
          })}
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatCompactValue(centerValue)}
            </div>
            <div className="text-xs text-zinc-400 uppercase tracking-wide">{centerLabel}</div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-2 flex flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
        {paths.map(({ segment, index, percentage }) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${segment.color}`} />
            <span className={`${segment.textColor}`}>{segment.label}</span>
            <span className="text-zinc-500">({percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

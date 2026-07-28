'use client';

import React, { useState } from 'react';

type TimeScale = 'days' | 'months' | 'years';

type SeriesSet = Record<TimeScale, { labels: string[]; likes: number[]; views: number[] }>;

export default function CampaignProgressCurveGraph({ campaignData }: { campaignData?: SeriesSet }) {
  const [timeScale, setTimeScale] = useState<TimeScale>('days');

  const chartData: Record<TimeScale, { labels: string[]; likes: number[]; views: number[] }> = {
    days: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      likes: [450, 820, 1200, 2400, 3100, 4800, 6500],
      views: [12000, 25000, 48000, 95000, 140000, 210000, 350000],
    },
    months: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      likes: [12000, 19000, 35000, 42000, 58000, 72000, 89000, 105000, 125000, 140000, 165000, 195000],
      views: [450000, 620000, 950000, 1200000, 1500000, 1800000, 2200000, 2600000, 3100000, 3600000, 4200000, 5000000],
    },
    years: {
      labels: ['2023', '2024', '2025', '2026'],
      likes: [450000, 890000, 1450000, 2300000],
      views: [12000000, 25000000, 42000000, 68000000],
    },
  };

  const currentDataset = campaignData?.[timeScale] ?? chartData[timeScale];

  const formatMetricValue = (val: number): string => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    } else {
      return (val / 1000).toFixed(val < 1000 ? 1 : 0) + 'k';
    }
  };

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...currentDataset.views, 1000);
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  const getSmoothPathData = (dataPoints: number[]) => {
    const points = dataPoints.map((val, index) => {
      const x = padding.left + (index / (dataPoints.length - 1)) * graphWidth;
      const y = padding.top + graphHeight - (val / maxVal) * graphHeight;
      return { x, y };
    });

    if (points.length === 0) return '';

    // If only two points, draw a straight line
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i - 1 >= 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : points[i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const likesPath = getSmoothPathData(currentDataset.likes);
  const viewsPath = getSmoothPathData(currentDataset.views);

  return (
    <div className="flex flex-col h-full bg-transparent p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Campaign Progress Curve</h3>
          <p className="text-[11px] text-zinc-500">Real-time tracking from Manage Page</p>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/50">
          {(['days', 'months', 'years'] as TimeScale[]).map((scale) => (
            <button
              key={scale}
              onClick={() => setTimeScale(scale)}
              className={`px-3 py-1 text-xs rounded-lg capitalize transition-all ${
                timeScale === scale ? 'bg-zinc-700 text-zinc-100 font-medium shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center w-full overflow-hidden my-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[320px]">
          {yTicks.map((tick, i) => {
            const yCoord = padding.top + graphHeight - (tick / maxVal) * graphHeight;
            return (
              <g key={i}>
                <line x1={padding.left} y1={yCoord} x2={width - padding.right} y2={yCoord} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding.left - 8} y={yCoord + 4} fill="#a1a1aa" fontSize="10" textAnchor="end">{formatMetricValue(tick)}</text>
              </g>
            );
          })}

          {currentDataset.labels.map((label, index) => {
            const xCoord = padding.left + (index / (currentDataset.labels.length - 1)) * graphWidth;
            return (
              <text key={index} x={xCoord} y={height - 8} fill="#a1a1aa" fontSize="10" textAnchor="middle">{label}</text>
            );
          })}

          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + graphHeight} stroke="#ffffff" strokeWidth="1.5" />
          <line x1={padding.left} y1={padding.top + graphHeight} x2={width - padding.right} y2={padding.top + graphHeight} stroke="#ffffff" strokeWidth="1.5" />

          <path d={viewsPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          <path d={likesPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-3 pt-3 border-t border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 rounded-full bg-amber-500" />
          <span className="text-xs text-zinc-300 font-medium">Likes (Gold)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-300 font-medium">Views (Green)</span>
        </div>
      </div>
    </div>
  );
}

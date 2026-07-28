'use client';

import React, { useState } from 'react';

export default function DualTrackGaugeWidget({ campaignTotals }: { campaignTotals?: { likes: number; views: number } }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');

  const PLATFORM_ICONS: Record<string, string> = {
    youtube: 'YT',
    instagram: 'IG',
    tiktok: 'TT',
    facebook: 'FB',
    snapchat: 'SC',
  };

  const platformMeta: Record<string, { name: string; colorLikes: string; colorViews: string }> = {
    youtube: { name: 'YouTube', colorLikes: '#ef4444', colorViews: '#f87171' },
    instagram: { name: 'Instagram', colorLikes: '#ec4899', colorViews: '#f472b6' },
    tiktok: { name: 'TikTok', colorLikes: '#38bdf8', colorViews: '#7dd3fc' },
    facebook: { name: 'Facebook', colorLikes: '#3b82f6', colorViews: '#60a5fa' },
    snapchat: { name: 'Snapchat', colorLikes: '#facc15', colorViews: '#fde047' },
  };

  const currentMeta = platformMeta[selectedPlatform];
  const IconInitial = PLATFORM_ICONS[selectedPlatform];

  // Metrics (use live totals when available)
  const likes = campaignTotals?.likes ?? 45200;
  const maxLikes = 60000;
  const views = campaignTotals?.views ?? 320000;
  const maxViews = 500000;

  const outerRadius = 40;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const viewsPercentage = Math.min(views / maxViews, 1);
  const outerStrokeDashoffset = outerCircumference - viewsPercentage * outerCircumference;

  const innerRadius = 30;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const likesPercentage = Math.min(likes / maxLikes, 1);
  const innerStrokeDashoffset = innerCircumference - likesPercentage * innerCircumference;

  return (
    <div className="flex flex-col h-full bg-transparent p-0">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Audience Analytics</h3>
          <p className="text-[11px] text-zinc-500">Live Campaign Views vs Likes</p>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/50">
          {Object.keys(PLATFORM_ICONS).map((key) => {
            const initials = PLATFORM_ICONS[key];
            const isSelected = selectedPlatform === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedPlatform(key)}
                className={`p-1.5 rounded-lg transition-all ${
                  isSelected ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center text-[10px] font-semibold">{initials}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={outerRadius} stroke="currentColor" strokeWidth="7" className="text-zinc-800" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r={outerRadius}
              stroke={currentMeta.colorViews}
              strokeWidth="7"
              strokeDasharray={outerCircumference}
              strokeDashoffset={outerStrokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />

            <circle cx="50" cy="50" r={innerRadius} stroke="currentColor" strokeWidth="7" className="text-zinc-800" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r={innerRadius}
              stroke={currentMeta.colorLikes}
              strokeWidth="7"
              strokeDasharray={innerCircumference}
              strokeDashoffset={innerStrokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="w-6 h-6 rounded-full bg-zinc-800/40 text-zinc-300 flex items-center justify-center mb-0.5 text-xs font-semibold">{IconInitial}</div>
            <span className="text-[10px] font-medium text-zinc-400 tracking-wide uppercase">{currentMeta.name}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2 w-full max-w-[200px]">
          <div className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800/80">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentMeta.colorViews }} />
              <span className="text-xs text-zinc-400 font-medium">Campaign Views</span>
            </div>
            <p className="text-sm font-bold text-zinc-100 pl-4">{views.toLocaleString()}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800/80">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentMeta.colorLikes }} />
              <span className="text-xs text-zinc-400 font-medium">Campaign Likes</span>
            </div>
            <p className="text-sm font-bold text-zinc-100 pl-4">{likes.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

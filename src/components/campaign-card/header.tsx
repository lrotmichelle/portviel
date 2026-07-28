"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, Pause, Play, Trash2 } from 'lucide-react';
import type { CampaignCardData } from '@/types/campaign';

interface HeaderProps {
  data: CampaignCardData;
  onPause?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}

export function Header({ data, onPause, onDelete }: HeaderProps) {
  const [timeLeft, setTimeLeft] = useState(data.timeRemainingDays * 24 * 60 * 60 * 1000);
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase());
    if (words.length === 0) return 'C';
    if (words.length === 1) return words[0];
    return `${words[0]}${words[1]}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [data.timeRemainingDays]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";

    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / (24 * 3600));
    const hrs = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) {
      return `${days}d`;
    } else {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between p-4 border border-neutral-900 bg-[#060606]/40 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-800 flex items-center justify-center select-none shrink-0 overflow-hidden">
            {!imageError && data.publisherProfileIcon ? (
              <img
                src={data.publisherProfileIcon}
                alt="Publisher Profile"
                className="w-full h-full rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-sm font-black text-zinc-200 uppercase">{getInitials(data.projectName)}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-xs md:text-sm font-black truncate tracking-tight text-white">{data.projectName}</h3>
              <CheckCircle className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-500 fill-amber-500/10 shrink-0" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] md:text-xs text-zinc-500 font-medium truncate">@{data.publisherUsername} ({data.publisherRating} / 5)</span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center select-none text-right shrink-0">
          <span className="text-sm md:text-base font-black text-emerald-400 font-mono tracking-tight whitespace-nowrap leading-none">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[6.5px] md:text-[8px] font-mono tracking-wider font-medium mt-1 text-zinc-500">
            Remaining
          </span>
          {/* Manager controls: only show if current user is the creator and handlers were provided */}
          {data.publisherUsername === 'demo-user' && (onPause || onDelete) && (
            <div className="mt-2 flex items-center gap-2">
              {onPause ? (
                <button
                  onClick={() => onPause(data.id, data.status.toLowerCase() === 'paused' ? 'active' : 'paused')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-900/40 text-xs text-zinc-200 hover:bg-zinc-900"
                  aria-label="Pause or resume campaign"
                >
                  {data.status.toLowerCase() === 'paused' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  <span className="text-[10px] font-black uppercase tracking-wider">{data.status.toLowerCase() === 'paused' ? 'Resume' : 'Pause'}</span>
                </button>
              ) : null}

              {onDelete ? (
                <button
                  onClick={() => { if (confirm('Delete this campaign? This cannot be undone.')) onDelete(data.id); }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-900/20 text-xs text-red-400 hover:bg-red-900/30"
                  aria-label="Delete campaign"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Delete</span>
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Check, X } from 'lucide-react';
import type { CampaignCardData } from '@/types/campaign';

interface FooterProps {
  data: CampaignCardData;
  onJoin: (id: string) => void;
  onExit: (id: string) => void;
  isPaused?: boolean;
  isJoinDisabled?: boolean;
  joinDisabledLabel?: string;
}

export function Footer({ data, onJoin, onExit, isPaused = false, isJoinDisabled = false, joinDisabledLabel }: FooterProps) {
  const handleButtonClick = () => {
    if (data.hasJoined) {
      if (window.confirm("Are you sure you want to leave this community?")) {
        onExit(data.id);
      }
    } else {
      if (!isPaused && !isJoinDisabled) {
        onJoin(data.id);
      }
    }
  };

  const showExit = data.hasJoined;
  const isDisabled = isJoinDisabled || (isPaused && !showExit);

  return (
    <div className="w-full select-none">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleButtonClick}
        className={`group flex items-center justify-center gap-1 py-2 px-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98] truncate w-full
          ${showExit
            ? "bg-red-500/10 text-red-500 border-red-900/40 hover:bg-red-600 hover:text-white hover:border-red-500 active:bg-red-600 active:text-white cursor-pointer"
            : isDisabled
              ? "bg-zinc-900/40 text-zinc-600 border-zinc-800/40 cursor-not-allowed opacity-50"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-900/40 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 active:bg-emerald-600 active:text-white cursor-pointer"}
        `}
      >
        {showExit ? (
          <><X className="w-3 h-3 shrink-0 stroke-[3] transition-colors duration-200" /><span>Exit</span></>
        ) : (
          <><Check className="w-3 h-3 shrink-0 stroke-[3] transition-colors duration-200" /><span>{isPaused ? "Paused" : "Join"}</span></>
        )}
      </button>
    </div>
  );
}
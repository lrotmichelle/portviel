"use client";

import React, { useState } from 'react';
import type { CampaignCardData } from '@/types/campaign';
import { Header } from './header';
import { Content } from './content';
import { BudgetSentiment } from './budget-sentiment';
import { Footer } from './footer';

interface CampaignCardProps {
  data: CampaignCardData;
  onJoinCampaign: (id: string) => void;
  onExitCampaign: (id: string) => void;
  onPauseCampaign?: (id: string, status: string) => void;
  onDeleteCampaign?: (id: string) => void;
  isJoinDisabled?: boolean;
  joinDisabledLabel?: string;
}

export default function CampaignCard({
  data,
  onJoinCampaign,
  onExitCampaign,
  onPauseCampaign,
  onDeleteCampaign,
  isJoinDisabled,
  joinDisabledLabel,
}: CampaignCardProps) {
  const [campaignData, setCampaignData] = useState<CampaignCardData>(data);

  const handleJoin = (id: string) => {
    setCampaignData((prev) => ({ ...prev, hasJoined: true }));
    onJoinCampaign(id);
  };

  const handleExit = (id: string) => {
    setCampaignData((prev) => ({ ...prev, hasJoined: false }));
    onExitCampaign(id);
  };

  const isPaused = campaignData.status.toLowerCase() === 'paused';

  return (
    <div className={`w-full max-w-[420px] bg-black border rounded-[28px] p-5 flex flex-col gap-4 shadow-2xl tracking-tight select-none transition-all duration-300 relative ${isPaused ? 'border-zinc-900 bg-zinc-950/40' : 'border-zinc-800/80'}`}>
      {/* Card Status Badge placed before the header */}
      <div className="flex justify-center select-none">
        <div className={`w-fit py-1 px-3 text-[9px] font-black uppercase tracking-widest border rounded-full transition-all duration-300 ${
          isPaused 
            ? 'bg-zinc-900 border-zinc-800 text-zinc-500' 
            : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
        }`}>
          {campaignData.status}
        </div>
      </div>

      <div className={`flex flex-col gap-4 transition-all duration-300 ${isPaused ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        <Header data={campaignData} onPause={onPauseCampaign} onDelete={onDeleteCampaign} />
        <Content data={campaignData} />
        <BudgetSentiment data={campaignData} />
      </div>
      <Footer
        data={campaignData}
        onJoin={handleJoin}
        onExit={handleExit}
        isPaused={isPaused}
        isJoinDisabled={isJoinDisabled}
        joinDisabledLabel={joinDisabledLabel}
      />
    </div>
  );
}
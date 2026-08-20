'use client';

import { useState } from 'react';
import Link from 'next/link';
import CampaignModal from '@/components/layout/campaign-modal';

export default function ManageCampaignsPage() {
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
            <h1 className="text-3xl font-bold">My campaigns</h1>
          </div>
        </div>

        <div className="flex flex-nowrap items-center justify-center gap-3 overflow-x-auto md:justify-end">
          <Link href="/campaign" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-[0.95rem] text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Campaigns</Link>
          <Link href="/campaign/activity" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-[0.95rem] text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Joined</Link>
          <button onClick={() => setIsCampaignOpen(true)} className="rounded-lg border border-blue-500/40 px-3 py-2 text-[0.95rem] text-blue-400 transition-colors duration-200 hover:bg-blue-500 hover:text-white active:bg-blue-500 active:text-white">+ campaign</button>
        </div>
      </div>

      <CampaignModal isOpen={isCampaignOpen} onClose={() => setIsCampaignOpen(false)} />
    </div>
  );
}

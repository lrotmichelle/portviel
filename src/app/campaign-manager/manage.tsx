'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Wallet from '@/components/campaign-manager/Wallet';
import RecentTransactions from '@/components/campaign-manager/RecentTransactions';
import MembersTable from '@/app/campaign-manager/members';
import ReminderTable from '@/app/campaign-manager/reminder';
import ProgressBars from '@/app/campaign-manager/progress-bars';
import { generateMockCampaigns } from '@/lib/mockCampaigns';

export default function ManageComponent() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    // generate mock campaigns and use them to populate the tables
    const mock = generateMockCampaigns(30);
    setCampaigns(mock);
  }, []);

  const pool = campaigns.reduce((s, c) => s + (c.totalBudget || 0), 0);
  const settled = campaigns.reduce((s, c) => s + (c.budgetUsed || 0), 0);
  const debt = Math.max(0, pool - settled);
  const campaignsCount = campaigns.length;

  const recentItems = campaigns
    .slice()
    .sort((a, b) => new Date(b.lastEditedAt || 0).getTime() - new Date(a.lastEditedAt || 0).getTime())
    .slice(0, 5)
    .map((c, index) => ({
      id: c.id,
      name: c.projectName,
      memberName: ['Sarah K.', 'David O.', 'Alex M.', 'Rita N.', 'John D.'][index % 5],
      platform: ['TikTok', 'Instagram', 'YouTube'][index % 3],
      date: c.lastEditedAt ? new Date(c.lastEditedAt).toISOString().split('T')[0] : '',
      amount: c.budgetUsed || 0,
      views: c.viewsGenerated || 0,
    }));

  const primaryCampaign = campaigns[0] ?? null;
  const budgetForProgress = primaryCampaign?.totalBudget ?? 0;
  const cpmForProgress = primaryCampaign?.highestMcp ?? 0;
  const viewsForProgress = primaryCampaign?.viewsGenerated ?? 0;

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
          <Link href="/campaign-manager/manage" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-[0.95rem] text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Manage</Link>
          <Link href="/campaign-manager/joined" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-[0.95rem] text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Joined</Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <div className="min-w-0">
            <Wallet pool={pool} settled={settled} debt={debt} campaignsCount={campaignsCount} />
          </div>
          <div className="min-w-0">
            <RecentTransactions items={recentItems} />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="min-w-0 w-1/2">
            <MembersTable />
          </div>
          <div className="min-w-0 w-1/2">
            <ReminderTable />
          </div>
        </div>

        <div className="w-full">
          <ProgressBars budget={budgetForProgress} cpm={cpmForProgress} currentViews={viewsForProgress} pool={pool} settled={settled} />
        </div>
      </div>
    </div>
  );
}

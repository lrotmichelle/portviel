'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Wallet from './joined/wallet';
import Transactions from './joined/transactions';
import CampaignFlow from './joined/campaignflow';
import Debt from './joined/debt';
import AudienceMix from './joined/audiencemix';
import HitTarget from './joined/hittarget';
import type { CampaignCardData } from '@/types/campaign';

export default function JoinedComponent() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJoinedCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns?filter=joined', {
          headers: { 'x-user-id': 'demo-user' },
        });
        if (!response.ok) throw new Error('Failed to load joined campaigns');
        const data = (await response.json()) as CampaignCardData[];
        setCampaigns(data.filter((c) => c.hasJoined));
      } catch (error) {
        console.error('Failed to load joined campaigns', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadJoinedCampaigns();
  }, []);

  const balance = campaigns.reduce((s, c) => s + (c.budgetUsed || 0), 0);
  const debt = campaigns.reduce((s, c) => s + Math.max(0, (c.totalBudget || 0) - (c.budgetUsed || 0)), 0);
  const campaignsCount = campaigns.length;

  const transactionItems = campaigns
    .slice(0, 4)
    .map((c, index) => ({
      id: c.id,
      campaignName: c.projectName,
      platform: ['TikTok', 'Instagram', 'YouTube'][index % 3],
      amount: c.budgetUsed || 0,
    }));

  const flowRows = campaigns.slice(0, 5).map((c, index) => ({
    rank: index + 1,
    campaignName: c.projectName,
    views: c.viewsGenerated || 0,
    likes: c.likesGenerated || 0,
    amount: c.budgetUsed || 0,
    status: ((c.budgetUsed || 0) >= (c.totalBudget || 0) * 0.5 ? 'settled' : 'owe') as 'settled' | 'owe',
  }));

  const debtRows = campaigns
    .map((c, index) => ({
      rank: index + 1,
      campaignName: c.projectName,
      amount: Math.max(0, (c.totalBudget || 0) - (c.budgetUsed || 0)),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const primaryCampaign = campaigns[0] ?? null;
  const viewsForTarget = primaryCampaign?.viewsGenerated ?? 0;
  const maxPayoutForTarget = primaryCampaign?.maxPayout ?? 0;
  const totalFollowers = campaigns.reduce((s, c) => s + (c.communitySize || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 text-white">
        <p className="text-sm text-zinc-400">Loading joined campaigns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
            <h1 className="text-3xl font-bold">Joined campaigns</h1>
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
            <Wallet balance={balance} debt={debt} campaignsCount={campaignsCount} />
          </div>
          <div className="min-w-0">
            <Transactions items={transactionItems} />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="min-w-0 w-1/2">
            <CampaignFlow rows={flowRows} />
          </div>
          <div className="min-w-0 w-1/2">
            <Debt rows={debtRows} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <AudienceMix totalFollowers={totalFollowers} />
          </div>
          <div className="min-w-0">
            <HitTarget currentViews={viewsForTarget} maxPayout={maxPayoutForTarget} />
          </div>
        </div>
      </div>
    </div>
  );
}

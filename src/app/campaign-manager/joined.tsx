'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Wallet from './joined/wallet';
import Transactions from './joined/transactions';
import JoinedCampaigns from './joined/joined-campaigns';
import CampaignFlow from './joined/campaignflow';
import Debt from './joined/debt';
import AudienceMix from './joined/audiencemix';
import CampaignMembers from './joined/campaign-members';
import HitTarget from './joined/hittarget';
import type { CampaignCardData } from '@/types/campaign';
import { generateJoinedCampaigns } from '@/lib/joineddata';
import { formatCompactValue } from '@/lib/currency';

export default function JoinedComponent() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [withdrawals, setWithdrawals] = useState<{ date: string; time: string; amount: number }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  useEffect(() => {
    setCampaigns(generateJoinedCampaigns(50));
  }, []);

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const incomeReceived = campaigns.reduce((s, c) => s + (c.incomeReceived || 0), 0);
  const debt = campaigns.reduce((s, c) => s + (c.debt || 0), 0);
  const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
  const balance = incomeReceived - totalWithdrawn;

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawError(`You can only withdraw ${formatCompactValue(balance)}`);
      return;
    }
    if (amount > balance) {
      setWithdrawError(`You can only withdraw ${formatCompactValue(balance)}`);
      return;
    }
    setWithdrawError('');
    const now = new Date();
    setWithdrawals((prev) => [
      ...prev,
      { date: now.toISOString().split('T')[0], time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount },
    ]);
    setWithdrawAmount('');
  };

  const transactionItems = campaigns
    .filter((c) => (c.incomeReceived || 0) > 0)
    .map((c, index) => ({
      id: c.id,
      campaignName: c.projectName,
      platform: ['TikTok', 'Instagram', 'YouTube'][index % 3],
      amount: c.incomeReceived || 0,
    }));

  const flowRows = campaigns.slice(0, 5).map((c, index) => ({
    rank: index + 1,
    campaignName: c.projectName,
    views: c.viewsGenerated || 0,
    likes: c.likesGenerated || 0,
    amount: c.budgetUsed || 0,
    status: ((c.incomeReceived || 0) >= (c.budgetUsed || 0) * 0.5 ? 'settled' : 'owe') as 'settled' | 'owe',
  }));

  const debtRows = campaigns
    .filter((c) => (c.debt || 0) > 0)
    .map((c, index) => ({
      rank: index + 1,
      campaignName: c.projectName,
      amount: c.debt || 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const primaryCampaign = campaigns[0] ?? null;
  const viewsForTarget = primaryCampaign?.viewsGenerated ?? 0;
  const maxPayoutForTarget = primaryCampaign?.maxPayout ?? 0;
  const totalFollowers = campaigns.reduce((s, c) => s + (c.communitySize || 0), 0);

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Balance</span>
            <div className="mt-1 text-lg font-semibold text-white">{formatCompactValue(balance)} UGX</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Debt</span>
            <div className="mt-1 text-lg font-semibold text-white">{formatCompactValue(debt)} UGX</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Withdraw</span>
              {withdrawAmount && (
                <span className="text-[10px] text-zinc-300">
                  {(() => {
                    const entered = Number(withdrawAmount);
                    if (!Number.isFinite(entered) || entered <= 0) return '';
                    const display = entered > balance ? balance : entered;
                    if (display >= 1_000_000_000) return `${(display / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}b`;
                    if (display >= 1_000_000) return `${(display / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
                    if (display >= 1_000) return `${(display / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
                    return `${display}`;
                  })()}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 no-spinner">
              <input
                type="number"
                min="0"
                value={withdrawAmount}
                onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError(''); }}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleWithdraw}
                className="whitespace-nowrap rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500 hover:text-white active:bg-emerald-600 active:text-white"
              >
                Withdraw
              </button>
            </div>
            {withdrawError && (
              <p className="mt-2 text-[11px] text-red-400">{withdrawError}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <div className="min-w-0">
            <Wallet withdrawals={withdrawals} totalWithdrawn={totalWithdrawn} />
          </div>
          <div className="min-w-0">
            <Transactions items={transactionItems} />
          </div>
        </div>

        <JoinedCampaigns campaigns={campaigns} selectedId={selectedCampaignId} onSelectChange={setSelectedCampaignId} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <CampaignMembers campaigns={campaigns} selectedId={selectedCampaignId} />
          </div>
          <div className="min-w-0">
            <AudienceMix totalFollowers={totalFollowers} />
          </div>
        </div>

        <div className="mt-6">
          <HitTarget currentViews={viewsForTarget} maxPayout={maxPayoutForTarget} />
        </div>
      </div>
    </div>
  );
}

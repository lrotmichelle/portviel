'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import Wallet from './joined/wallet';
import Transactions from './joined/transactions';
import JoinedCampaigns from './joined/joined-campaigns';
import CampaignPerformance from './joined/campaign-performance';
import TargetProgress from './joined/target-progress';
import CampaignPressure from './joined/campaign-pressure';
import CampaignStatus from './joined/campaign-status';
import CampaignTransactions from '@/components/campaign-manager/CampaignTransactions';
import CampaignRules from '@/components/campaign-manager/CampaignRules';
import type { CampaignCardData } from '@/types/campaign';
import { getMockCampaigns } from '@/lib/mockCampaigns';
import { formatCompactValue } from '@/lib/currency';
import { Eye, Heart, Users } from 'lucide-react';

export default function JoinedComponent() {
  const [campaigns] = useState<CampaignCardData[]>(() => getMockCampaigns());
  const [withdrawals, setWithdrawals] = useState<{ date: string; time: string; amount: number }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => campaigns[0]?.id ?? '');

  const incomeReceived = campaigns.reduce((s, c) => s + (c.incomeReceived || 0), 0);
  const debt = campaigns.reduce((s, c) => s + (c.debt || 0), 0);
  const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0);
  const balance = incomeReceived - totalWithdrawn;
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'Active').length;

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
      { date: now.toISOString().split('T')[0], time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), amount },
    ]);
    setWithdrawAmount('');
  };

  const transactionItems = campaigns
    .filter((c) => (c.incomeReceived || 0) > 0)
    .map((c, index) => ({
      id: c.id,
      campaignName: c.projectName,
      platform: ['TT', 'IG', 'YT'][index % 3],
      amount: c.incomeReceived || 0,
    }));

  const primaryCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? campaigns[0] ?? null;
  const isExpired = primaryCampaign?.status === 'Expired' || (primaryCampaign?.timeRemainingDays ?? 0) <= 0;
  const campaignTransactions = primaryCampaign ? (primaryCampaign.participants ?? []).slice(0, 5).map((participant, index) => ({
    date: primaryCampaign.lastEditedAt ? new Date(primaryCampaign.lastEditedAt).toISOString().split('T')[0] : '-',
    time: primaryCampaign.lastEditedAt ? new Date(primaryCampaign.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
    rank: index + 1,
    member: participant.name,
    views: Math.round((primaryCampaign.viewsGenerated || 0) * participant.progress / 100),
    amount: Math.round((primaryCampaign.budgetUsed || 0) * participant.progress / 100),
  })) : [];

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-white md:p-8">
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
        {/* Section 1: Stats */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
          <div className={`rounded-2xl border border-zinc-800/60 bg-transparent p-4 ${isExpired ? 'opacity-60' : ''}`}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Balance</span>
            <div className={`mt-1 text-lg font-semibold ${isExpired ? 'text-zinc-500' : 'text-white'}`}>{formatCompactValue(balance)} UGX</div>
          </div>
          <div className={`rounded-2xl border border-zinc-800/60 bg-transparent p-4 ${isExpired ? 'opacity-60' : ''}`}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Debt</span>
            <div className={`mt-1 text-lg font-semibold ${isExpired ? 'text-zinc-500' : 'text-white'}`}>{formatCompactValue(debt)} UGX</div>
          </div>
          <div className={`rounded-2xl border border-zinc-800/60 bg-transparent p-4 ${isExpired ? 'opacity-60' : ''}`}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Active</span>
            <div className={`mt-1 text-lg font-semibold ${isExpired ? 'text-zinc-500' : 'text-white'}`}>{activeCampaignsCount}</div>
          </div>
          <div className={`col-span-3 md:col-span-2 rounded-2xl border border-zinc-800/60 bg-transparent p-4 ${isExpired ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Withdraw</span>
              {withdrawAmount && !isExpired && (
                <span className="text-[10px] text-zinc-300">
                  {(() => {
                    const entered = Number(withdrawAmount);
                    if (!Number.isFinite(entered) || entered <= 0) return '';
                    const display = entered > balance ? balance : entered;
                    return formatCompactValue(display);
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
                disabled={isExpired}
                className={`w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500 ${isExpired ? 'border-zinc-700 text-zinc-500' : 'border-zinc-700 text-white'}`}
              />
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isExpired}
                className={`whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${isExpired ? 'border-zinc-700 bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white active:bg-emerald-600 active:text-white'}`}
              >
                Withdraw
              </button>
            </div>
            {withdrawError && !isExpired && (
              <p className="mt-2 text-[11px] text-red-400">{withdrawError}</p>
            )}
          </div>
        </div>

        {/* Section 2: Wallet & Transactions */}
        <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <div className="min-w-0">
            <Wallet withdrawals={withdrawals} totalWithdrawn={totalWithdrawn} isExpired={isExpired} />
          </div>
          <div className="min-w-0">
            <Transactions items={transactionItems} isExpired={isExpired} />
          </div>
        </div>

        {/* Section 3: Campaign selector and selected campaign metrics */}
        <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-stretch">
          <JoinedCampaigns campaigns={campaigns} selectedId={selectedCampaignId} onSelectChange={setSelectedCampaignId} showMetrics={false} />
          {primaryCampaign && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Members', value: primaryCampaign.communitySize, icon: <Users className="h-4 w-4 text-emerald-500/70" /> },
                { label: 'Views', value: primaryCampaign.viewsGenerated, icon: <Eye className="h-4 w-4 text-sky-500/70" /> },
                { label: 'Likes', value: primaryCampaign.likesGenerated, icon: <Heart className="h-4 w-4 fill-red-500/10 text-red-500" /> },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col justify-center rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-center">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{metric.label}</span>
                  <span className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white">
                    {metric.icon}
                    {metric.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Selected campaign details */}
        {primaryCampaign && (
          <div className="grid w-full grid-cols-9 gap-3 max-[699px]:grid-cols-3">
            {[
              { label: 'Time', value: `${primaryCampaign.timeRemainingDays} days` },
              { label: 'Budget', value: `${formatCompactValue(primaryCampaign.totalBudget)} UGX` },
              { label: 'Debit', value: `${formatCompactValue(primaryCampaign.debit ?? primaryCampaign.budgetUsed)} UGX` },
              { label: 'Paid', value: `${formatCompactValue(primaryCampaign.paid ?? primaryCampaign.incomeReceived ?? 0)} UGX` },
              { label: 'Owe', value: `${formatCompactValue(primaryCampaign.owe ?? primaryCampaign.debt ?? 0)} UGX` },
              { label: 'CPM', value: `${formatCompactValue(primaryCampaign.highestMcp)} UGX` },
              { label: 'Rank', value: `#${primaryCampaign.rank ?? '-'}` },
              { label: 'Min payout', shortLabel: 'Min', value: `${formatCompactValue(primaryCampaign.minPayout ?? 0)} UGX` },
              { label: 'Max payout', shortLabel: 'Max', value: `${formatCompactValue(primaryCampaign.maxPayout ?? 0)} UGX` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-zinc-800/60 bg-transparent p-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span className="max-[699px]:hidden">{item.label}</span>
                  <span className="hidden max-[699px]:inline">{item.shortLabel ?? item.label}</span>
                </span>
                <div className="mt-1 text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Section 5: Campaign members and performance */}
        <div className="grid gap-6 md:grid-cols-2">
          <CampaignStatus campaign={primaryCampaign} />
          <CampaignPerformance campaign={primaryCampaign} />
        </div>

        {/* Section 6: Target Progress */}
        <TargetProgress campaign={primaryCampaign} isExpired={isExpired} />

        {/* Section 7: Pressure */}
        <div className="flex flex-col gap-6">
          <CampaignPressure campaign={primaryCampaign} isExpired={isExpired} />
        </div>
        <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
          <CampaignTransactions transactions={campaignTransactions} />
          <CampaignRules
            rules={primaryCampaign?.rules}
            resourceLink={primaryCampaign?.resourceLink}
            showJoinedActions
            onRemind={() => window.alert('Reminder sent to the campaign owner.')}
            onLeave={() => window.alert('Leave campaign request submitted.')}
            onCopyResource={() => primaryCampaign?.resourceLink && navigator.clipboard.writeText(primaryCampaign.resourceLink)}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Eye, Heart, Users } from 'lucide-react';
import MembersTable from '@/app/campaign-manager/members';
import ReminderTable from '@/app/campaign-manager/reminder';
import CampaignPerformance from '@/app/campaign-manager/joined/campaign-performance';
import TargetProgress from '@/app/campaign-manager/joined/target-progress';
import CampaignRecentTransactions from '@/app/campaign-manager/joined/recent-transactions';
import CampaignStatus from '@/app/campaign-manager/joined/campaign-status';
import JoinedCampaigns from '@/app/campaign-manager/joined/joined-campaigns';
import CampaignTransactions from '@/components/campaign-manager/CampaignTransactions';
import CampaignRules from '@/components/campaign-manager/CampaignRules';
import type { CampaignCardData } from '@/types/campaign';
import { formatCompactValue } from '@/lib/currency';
import { getMockCampaigns } from '@/lib/mockCampaigns';

function formatWithdrawalDate(value: string): string {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}|${month}|${year.slice(-2)}` : value;
}

export default function ManageComponent() {
  const [campaigns] = useState<CampaignCardData[]>(() => getMockCampaigns());
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => campaigns[0]?.id ?? '');
  const [withdrawn, setWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState<{ date: string; time: string; amount: number }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [campaignRules, setCampaignRules] = useState<string[]>(['', '', '', '', '']);
  const [resourceLink, setResourceLink] = useState('');
  const [resourceCopied, setResourceCopied] = useState(false);
  const [rulesSaved, setRulesSaved] = useState(false);
  const [editingRules, setEditingRules] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
  const withdrawalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAllWithdrawals) return;
    const timer = setTimeout(() => setShowAllWithdrawals(false), 60000);
    return () => clearTimeout(timer);
  }, [showAllWithdrawals]);

  useEffect(() => {
    if (!showAllWithdrawals) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (withdrawalsRef.current && !withdrawalsRef.current.contains(event.target as Node)) {
        setShowAllWithdrawals(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAllWithdrawals]);

  const pool = campaigns.reduce((s, c) => s + (c.totalBudget || 0), 0);
  const settled = campaigns.reduce((s, c) => s + (c.paid ?? 0), 0);
  const debt = campaigns.reduce((s, c) => s + (c.owe ?? 0), 0);
  const balance = Math.max(0, settled - withdrawn);

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) {
      setWithdrawError(`You can only withdraw ${formatCompactValue(balance)}`);
      return;
    }

    setWithdrawn((current) => current + amount);
    const now = new Date();
    setWithdrawals((current) => [
      ...current,
      {
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        amount,
      },
    ]);
    setWithdrawAmount('');
    setWithdrawError('');
  };

  const recentItems = campaigns
    .slice()
    .sort((a, b) => new Date(b.lastEditedAt || 0).getTime() - new Date(a.lastEditedAt || 0).getTime())
    .slice(0, 5)
    .map((c, index) => ({
      id: c.id,
      name: c.projectName,
      memberName: ['Sarah K.', 'David Micheal', 'Alex M.', 'Rita N.', 'John D.'][index % 5],
      platform: ['TikTok', 'Instagram', 'YouTube'][index % 3],
      date: c.lastEditedAt || '',
      amount: c.paid ?? 0,
      views: c.viewsGenerated || 0,
    }));

  const primaryCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0] ?? null;
  const campaignTiming = primaryCampaign?.startDate
    ? (() => {
        const elapsedDays = Math.max(0, Math.floor((currentTime - new Date(primaryCampaign.startDate).getTime()) / (24 * 60 * 60 * 1000)));
        return { elapsedDays, durationDays: elapsedDays + Math.max(0, primaryCampaign.timeRemainingDays || 0) };
      })()
    : null;
  const ruleChangeDay = campaignTiming
    ? campaignTiming.durationDays <= 5 ? 2 : campaignTiming.durationDays <= 10 ? 5 : campaignTiming.durationDays <= 16 ? 8 : 15
    : null;
  const canEditRules = Boolean((!primaryCampaign?.startDate || (ruleChangeDay !== null && campaignTiming && campaignTiming.elapsedDays >= ruleChangeDay)) && !rulesSaved);
  const hasRequiredRule = campaignRules[0].trim().length > 0;

  const campaignTransactions = primaryCampaign
    ? [
        {
          date: primaryCampaign.lastEditedAt ? new Date(primaryCampaign.lastEditedAt).toISOString().split('T')[0] : '-',
          time: primaryCampaign.lastEditedAt ? new Date(primaryCampaign.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
          rank: 1,
          member: primaryCampaign.publisherUsername,
          views: primaryCampaign.viewsGenerated || 0,
          amount: primaryCampaign.paid ?? 0,
        },
      ]
    : [];

  const handleCopyResource = async () => {
    if (!resourceLink) return;
    await navigator.clipboard.writeText(resourceLink);
    setResourceCopied(true);
    setTimeout(() => setResourceCopied(false), 1500);
  };

  const handleSaveRules = () => {
    if (!canEditRules || !hasRequiredRule) return;
    setRulesSaved(true);
    setEditingRules(false);
  };

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
          <Link href="/campaign-manager/joined" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-[0.95rem] text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Joined</Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[3fr_7fr] md:items-stretch">
          <div className="rounded-2xl border border-zinc-800/60 bg-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Withdraw balance</span>
              {withdrawAmount && (
                <span className="text-[10px] text-zinc-300">
                  {formatCompactValue(Math.min(Math.max(0, Number(withdrawAmount) || 0), balance))} UGX
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 no-spinner">
              <input
                type="number"
                min="0"
                max={balance}
                value={withdrawAmount}
                onChange={(event) => { setWithdrawAmount(event.target.value); setWithdrawError(''); }}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleWithdraw}
                className="whitespace-nowrap rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
              >
                Withdraw
              </button>
            </div>
            {withdrawError && <p className="mt-2 text-[11px] text-red-400">{withdrawError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { label: 'Budget', value: pool },
              { label: 'Settled', value: settled },
              { label: 'Debt', value: debt },
              { label: 'Balance', value: balance },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-zinc-800/60 bg-transparent p-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{item.label}</span>
                <div className="mt-1 text-lg font-semibold text-white">{formatCompactValue(item.value)} UGX</div>
              </div>
            ))}
          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
          <div ref={withdrawalsRef} className="manage-withdrawals-table flex h-full flex-col w-full rounded-2xl border border-zinc-800/60 bg-transparent p-4 text-sm text-zinc-200">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Withdrawals</h3>
            <button
              type="button"
              onClick={() => setShowAllWithdrawals((prev) => !prev)}
              className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300"
            >
              {showAllWithdrawals ? 'Show less' : 'View all'}
            </button>
          </div>
          <div className={`w-full flex-grow ${showAllWithdrawals ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
            <table className="w-full min-w-full table-auto text-sm">
              <thead>
                <tr className="text-left text-zinc-400">
                  <th className="pb-2">Date</th>
                  <th className="manage-withdrawal-time pb-2">Time</th>
                  <th className="pb-2 text-right">Amount (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {(showAllWithdrawals ? withdrawals : withdrawals.slice(0, 4)).length > 0 ? (showAllWithdrawals ? withdrawals : withdrawals.slice(0, 4)).map((withdrawal, index) => (
                  <tr key={`${withdrawal.date}-${withdrawal.time}-${index}`} className="border-t border-zinc-800/60">
                    <td className="py-2 text-zinc-200">{formatWithdrawalDate(withdrawal.date)}</td>
                    <td className="manage-withdrawal-time py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">{withdrawal.time}</td>
                    <td className="py-2 text-right text-emerald-400">{formatCompactValue(withdrawal.amount)} UGX</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-zinc-500">No withdrawals yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Total {formatCompactValue(withdrawn)} UGX
            </span>
          </div>
          </div>

          <CampaignRecentTransactions
            className="manage-recent-transactions"
            transactions={recentItems.map((item) => ({
              id: item.id,
              name: item.name,
              memberName: item.memberName,
              amount: item.amount,
              date: item.date,
            }))}
          />
        </div>

        {/* Shared campaign insights */}
        <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-stretch">
          <JoinedCampaigns campaigns={campaigns} selectedId={selectedCampaignId} onSelectChange={setSelectedCampaignId} showMetrics={false} showRankFilter={false} />
          {primaryCampaign && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Members', value: primaryCampaign.communitySize },
                { label: 'Views', value: primaryCampaign.viewsGenerated },
                { label: 'Likes', value: primaryCampaign.likesGenerated },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col justify-center rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-center">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{metric.label}</span>
                  <span className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white">
                    {metric.label === 'Members' && <Users className="h-4 w-4 text-emerald-500/70" />}
                    {metric.label === 'Views' && <Eye className="h-4 w-4 text-sky-500/70" />}
                    {metric.label === 'Likes' && <Heart className="h-4 w-4 fill-red-500/10 text-red-500" />}
                    {metric.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {primaryCampaign && (
          <div className="manage-campaign-metrics grid w-full grid-cols-2 gap-3 md:grid-cols-7">
            {[
              { label: 'Time', value: `${primaryCampaign.timeRemainingDays} days` },
              { label: 'Budget', value: `${formatCompactValue(primaryCampaign.totalBudget)} UGX` },
              { label: 'Owe', value: `${formatCompactValue(primaryCampaign.owe ?? primaryCampaign.debt ?? 0)} UGX` },
              { label: 'CPM', value: `${formatCompactValue(primaryCampaign.highestMcp)} UGX` },
              { label: 'Max payout', mobileLabel: 'Max payout', value: `${formatCompactValue(primaryCampaign.maxPayout ?? 0)} UGX` },
              { label: 'Min payout', mobileLabel: 'Min payout', value: `${formatCompactValue(primaryCampaign.minPayout ?? 0)} UGX` },
              { label: 'Debit', value: `${formatCompactValue(primaryCampaign.debit ?? primaryCampaign.budgetUsed)} UGX` },
              { label: 'Paid', value: `${formatCompactValue(primaryCampaign.paid ?? 0)} UGX` },
              { label: 'Balance', mobileLabel: 'Balance', value: `${formatCompactValue(Math.max(0, primaryCampaign.totalBudget - (primaryCampaign.debit ?? primaryCampaign.budgetUsed)))} UGX` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-zinc-800/60 bg-transparent p-3">
                <span className="manage-metric-label text-[10px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</span>
                <span className="manage-metric-mobile-label text-[10px] uppercase tracking-[0.18em] text-zinc-500">{item.mobileLabel ?? item.label}</span>
                <div className="mt-1 whitespace-nowrap text-sm font-semibold text-white">
                  {item.value.endsWith(' UGX') ? (
                    <>
                      {item.value.slice(0, -4)} <span className="manage-metric-currency text-[10px] font-medium text-zinc-400">UGX</span>
                    </>
                  ) : item.value}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          <CampaignStatus campaign={primaryCampaign} />
          <CampaignPerformance campaign={primaryCampaign} />
        </div>
        <TargetProgress campaign={primaryCampaign} />
        {/* Campaign flow and reminders stay at the bottom */}
        <div className="manage-flow-reminders flex gap-6">
          <div className="manage-campaign-flow min-w-0 w-1/2">
            <MembersTable />
          </div>
          <div className="manage-reminders min-w-0 w-1/2">
            <ReminderTable />
          </div>
        </div>

        {/* Campaign transactions and rules */}
        <div id="campaign-rules" className="grid gap-6 md:grid-cols-[3fr_2fr]">
          <CampaignTransactions transactions={campaignTransactions} />

          <CampaignRules
            rules={campaignRules}
            resourceLink={resourceLink}
            editable={canEditRules}
            editing={editingRules}
            onEdit={() => setEditingRules(true)}
            onRuleChange={(index, value) => {
              const nextRules = [...campaignRules];
              nextRules[index] = value;
              setCampaignRules(nextRules);
            }}
            onResourceChange={(value) => { setResourceLink(value); setResourceCopied(false); }}
            onCopyResource={handleCopyResource}
            resourceCopied={resourceCopied}
            onSave={handleSaveRules}
            saveDisabled={!canEditRules || !hasRequiredRule}
            saveLabel={rulesSaved ? 'Rules already saved' : 'Save campaign rules'}
          />
        </div>
      </div>

    </div>
  );
}

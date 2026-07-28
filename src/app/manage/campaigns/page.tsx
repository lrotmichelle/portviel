'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CampaignCardData } from '@/types/campaign';
import CampaignModal from '@/components/layout/campaign-modal';
import { defaultFinanceState, getFinanceState } from '@/lib/finance';

export default function ManageCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('newest');
  const [filters, setFilters] = useState({ minPayout: '', maxPayout: '', competition: 'newest' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [draftPayouts, setDraftPayouts] = useState<Record<string, { min: string; max: string; start: string }>>({});
  const [walletBalance, setWalletBalance] = useState(defaultFinanceState.accountBalance);
  const [walletDue, setWalletDue] = useState(defaultFinanceState.due);
  const [walletSettled, setWalletSettled] = useState(defaultFinanceState.settled);
  const [siteCharge, setSiteCharge] = useState(defaultFinanceState.reservedFee);
  const [calculatorBudget, setCalculatorBudget] = useState('');
  const budgetAfterFee = Math.max(0, Number(calculatorBudget.replace(/[^0-9]/g, '')) - siteCharge);
  const remainingBalance = Math.max(0, walletBalance - budgetAfterFee - siteCharge);

  const refreshFinanceState = () => {
    const state = getFinanceState();
    setWalletBalance(state.accountBalance);
    setWalletDue(state.due);
    setWalletSettled(state.settled);
    setSiteCharge(state.reservedFee);
  };

  useEffect(() => {
    refreshFinanceState();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'buyercard-finance') refreshFinanceState();
    };
    const handleCustom = () => refreshFinanceState();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('financeStateChanged', handleCustom);

    const load = async () => {
      try {
        const response = await fetch('/api/campaigns?filter=created', {
          headers: { 'x-user-id': 'demo-user' },
        });
        if (!response.ok) throw new Error('Failed to load campaigns');
        const createdCampaigns = (await response.json()) as CampaignCardData[];
        setCampaigns(createdCampaigns);
      } catch (error) {
        console.error('Unable to load managed campaigns', error);
        setCampaigns([]);
      }
    };

    load();

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('financeStateChanged', handleCustom);
    };
  }, []);

  const pauseCampaign = async (id: string) => {
    try {
      const target = campaigns.find((item) => item.id === id);
      const nextStatus = target?.status?.toLowerCase() === 'paused' ? 'active' : 'paused';
      
      const response = await fetch('/api/campaigns/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ action: nextStatus === 'paused' ? 'pause' : 'resume', campaignId: id }),
      });

      if (!response.ok) throw new Error('Failed to update campaign');

      setCampaigns((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
    } catch (error) {
      console.error('Unable to update campaign status', error);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const response = await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'delete_campaign', entityId: Number(id) }),
      });
      if (response.ok) {
        setCampaigns((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('Unable to delete campaign', error);
    }
  };

  const approveWork = async (id: string) => {
    setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, status: item.status === 'Approved' ? 'Active' : 'Approved' } : item)));
    try {
      await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'approve_campaign_submission', entityId: Number(id), approved: true }),
      });
    } catch (error) {
      console.error('Unable to approve submission', error);
    }
  };

  const submitForPayment = async (id: string) => {
    setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Pending Approval' } : item)));
    try {
      await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'approve_campaign_submission', entityId: Number(id), approved: false }),
      });
    } catch (error) {
      console.error('Unable to submit for payment', error);
    }
  };

  const openEditor = (campaign: CampaignCardData) => {
    setEditingId(campaign.id);
    setDraftPayouts((prev) => ({
      ...prev,
      [campaign.id]: {
        min: String(campaign.minPayout ?? 0),
        max: String(campaign.maxPayout ?? 0),
        start: campaign.startDate ?? '',
      },
    }));
  };

  const saveDraft = async (id: string) => {
    const draft = draftPayouts[id];
    if (!draft) return;
    const min = Number(draft.min) || 0;
    const max = Number(draft.max) || 0;
    setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, minPayout: min, maxPayout: max, startDate: draft.start, lastEditedAt: new Date().toISOString() } : item)));
    setEditingId(null);
    try {
      await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'update_campaign', entityId: Number(id), minPayout: min, maxPayout: max, startDate: draft.start }),
      });
    } catch (error) {
      console.error('Unable to update campaign payout', error);
    }
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const searchText = `${campaign.projectName} ${campaign.description}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      const matchesMin = !filters.minPayout || (campaign.minPayout ?? 0) >= Number(filters.minPayout);
      const matchesMax = !filters.maxPayout || (campaign.maxPayout ?? 0) <= Number(filters.maxPayout);
      return matchesSearch && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (sortMode === 'highest_budget') return b.totalBudget - a.totalBudget;
      if (sortMode === 'highest_cpm') return b.highestMcp - a.highestMcp;
      if (filters.competition === 'highest_cpm') return b.highestMcp - a.highestMcp;
      return Number(b.id) - Number(a.id);
    });

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

      <CampaignModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        onPublishSuccess={(item) => {
          const newCampaign = {
            id: String(item?.id ?? Date.now()),
            publisherProfileIcon: '/images/publisher-placeholder.png',
            projectName: item?.projectName ?? 'New campaign',
            publisherUsername: 'demo-user',
            publisherRating: 4.8,
            timeRemainingDays: item?.timeRemainingDays ?? 14,
            nicheHashtag: item?.nicheHashtag ?? 'growth',
            description: item?.description ?? 'Campaign created',
            category: item?.category ?? 'Technology',
            status: 'Active',
            communitySize: 12000,
            viewsGenerated: 10000,
            likesGenerated: 1500,
            totalBudget: item?.totalBudget ?? 1000,
            budgetUsed: 0,
            highestMcp: 100,
            hasJoined: false,
            startDate: item?.startDate,
            minPayout: item?.minPayout,
            maxPayout: item?.maxPayout,
          } as CampaignCardData;
          setCampaigns((prev) => [newCampaign, ...prev]);
          refreshFinanceState();
        }}
      />

      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Wallet</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <p className="text-sm text-zinc-400">Balance</p>
              <p className="mt-2 text-2xl font-semibold text-white">{walletBalance.toLocaleString()} UGX</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <p className="text-sm text-zinc-400">Due</p>
              <p className="mt-2 text-2xl font-semibold text-amber-400">{walletDue.toLocaleString()} UGX</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <p className="text-sm text-zinc-400">Settled</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">{walletSettled.toLocaleString()} UGX</p>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Calculator</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-zinc-400">Budget</label>
              <input
                value={calculatorBudget}
                onChange={(e) => setCalculatorBudget(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter budget"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Site charge</span>
                <span>{siteCharge.toLocaleString()} UGX</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
                <span>Available budget</span>
                <span className="font-semibold text-white">{budgetAfterFee.toLocaleString()} UGX</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
                <span>Remaining balance</span>
                <span className="font-semibold text-emerald-400">{remainingBalance.toLocaleString()} UGX</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Filters</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your campaigns" className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 outline-none" />
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 outline-none">
              <option value="newest">Newest</option>
              <option value="highest_budget">Highest budget</option>
              <option value="highest_cpm">Highest CPM</option>
            </select>
            <input value={filters.minPayout} onChange={(e) => setFilters((prev) => ({ ...prev, minPayout: e.target.value }))} placeholder="Min payout" className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 outline-none" />
            <input value={filters.maxPayout} onChange={(e) => setFilters((prev) => ({ ...prev, maxPayout: e.target.value }))} placeholder="Max payout" className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 outline-none" />
            <select value={filters.competition} onChange={(e) => setFilters((prev) => ({ ...prev, competition: e.target.value }))} className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 outline-none">
              <option value="newest">Newest</option>
              <option value="highest_cpm">Highest CPM</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-sm text-zinc-400">No campaigns to manage yet.</div>
        ) : filteredCampaigns.map((campaign) => {
          const draft = draftPayouts[campaign.id];
          return (
            <div key={campaign.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{campaign.projectName}</h2>
                <span className={`rounded-full px-3 py-1 text-xs ${campaign.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' : campaign.status.toLowerCase() === 'paused' ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-500/15 text-amber-400'}`}>{campaign.status}</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">{campaign.description}</p>
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300">
                <p>Budget: ${campaign.totalBudget}</p>
                <p>Min payout: ${campaign.minPayout ?? 0}</p>
                <p>Max payout: ${campaign.maxPayout ?? 0}</p>
                <p>Start date: {campaign.startDate || 'Flexible'}</p>
                <p>Edited: {campaign.lastEditedAt ? new Date(campaign.lastEditedAt).toLocaleDateString() : 'Not edited yet'}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => approveWork(campaign.id)} className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10">Approve</button>
                <button onClick={() => submitForPayment(campaign.id)} className="rounded-lg border border-amber-500/30 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10">Submit for payment</button>
                <button onClick={() => openEditor(campaign)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">Edit payouts</button>
                <button onClick={() => pauseCampaign(campaign.id)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">{campaign.status.toLowerCase() === 'paused' ? 'Resume' : 'Pause'}</button>
                <button onClick={() => deleteCampaign(campaign.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">Delete</button>
              </div>
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="mb-2 text-sm font-semibold text-zinc-300">Participants</div>
                {(campaign.participants ?? []).map((participant) => (
                  <div key={participant.id} className="mb-2 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium text-white">{participant.name}</div>
                      <div className="text-xs text-zinc-500">{participant.submitted ? 'Submitted work' : 'Awaiting submission'}</div>
                    </div>
                    <div className="text-right text-xs text-zinc-400">
                      <div>{participant.progress}%</div>
                      <div className={participant.approved ? 'text-emerald-400' : 'text-amber-400'}>{participant.approved ? 'Approved' : 'Pending'}</div>
                    </div>
                  </div>
                ))}
              </div>
              {editingId === campaign.id && draft ? (
                <div className="mt-4 space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
                  <input value={draft.min} onChange={(e) => setDraftPayouts((prev) => ({ ...prev, [campaign.id]: { ...prev[campaign.id], min: e.target.value } }))} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm" placeholder="Min payout" />
                  <input value={draft.max} onChange={(e) => setDraftPayouts((prev) => ({ ...prev, [campaign.id]: { ...prev[campaign.id], max: e.target.value } }))} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm" placeholder="Max payout" />
                  <input type="date" value={draft.start} onChange={(e) => setDraftPayouts((prev) => ({ ...prev, [campaign.id]: { ...prev[campaign.id], start: e.target.value } }))} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm" />
                  <button onClick={() => saveDraft(campaign.id)} className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10">Save</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CampaignCardData } from '@/types/campaign';
import CampaignModal from '@/components/layout/campaign-modal';

interface ActivityItem {
  id: string;
  entityType: string;
  entityId: number;
  actorId: string;
  action: string;
  message: string;
  createdAt: unknown;
}

type JoinedCampaign = CampaignCardData & {
  feedback?: string;
  progress?: number;
  submitted?: boolean;
};

export default function CampaignActivityPage() {
  const [joinedCampaigns, setJoinedCampaigns] = useState<JoinedCampaign[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'All', category: 'All', niche: 'All', competition: 'newest', minPayout: '', maxPayout: '' });
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/secure');
        const payload = await response.json();
        const campaigns = (payload.joinedCampaigns ?? []).map((item: any) => ({
          ...item,
          feedback: item.feedback ?? '',
          progress: item.progress ?? 62,
          submitted: Boolean(item.submitted ?? true),
          minPayout: item.minPayout ?? 0,
          maxPayout: item.maxPayout ?? 0,
        }));
        setJoinedCampaigns(campaigns);
        setActivity(payload.activity ?? []);
      } catch (error) {
        console.error('Unable to load campaign activity', error);
      }
    };

    load();
  }, []);

  const filteredCampaigns = joinedCampaigns
    .filter((campaign) => {
      const searchValue = `${campaign.projectName} ${campaign.description}`.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || searchValue.includes(query);
      const matchesMin = !filters.minPayout || (campaign.minPayout ?? 0) >= Number(filters.minPayout);
      const matchesMax = !filters.maxPayout || (campaign.maxPayout ?? 0) <= Number(filters.maxPayout);
      const matchesStatus = filters.status === 'All' || campaign.status === filters.status;
      const matchesCategory = filters.category === 'All' || campaign.category === filters.category;
      const matchesNiche = filters.niche === 'All' || (campaign.nicheHashtag ?? '').toLowerCase() === filters.niche.toLowerCase();
      return matchesSearch && matchesMin && matchesMax && matchesStatus && matchesCategory && matchesNiche;
    })
    .sort((a, b) => {
      if (filters.competition === 'highest_cpm') return (b.highestMcp ?? 0) - (a.highestMcp ?? 0);
      if (filters.competition === 'highest_payout') return (b.maxPayout ?? 0) - (a.maxPayout ?? 0);
      return Number(b.id) - Number(a.id);
    });

  const leaveCampaign = async (id: string) => {
    setJoinedCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    try {
      await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'interact', entityType: 'campaign', entityId: Number(id), actionType: 'leave', message: 'Left the campaign' }),
      });
    } catch (error) {
      console.error('Unable to record leave event', error);
    }
  };

  const saveFeedback = (campaignId: string) => {
    const note = draftNotes[campaignId] ?? '';
    setJoinedCampaigns((prev) => prev.map((campaign) => (campaign.id === campaignId ? { ...campaign, feedback: note } : campaign)));
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Campaign workspace</p>
            <h1 className="text-3xl font-bold">Joined campaigns & activity</h1>
          </div>
        </div>

        <div className="flex flex-nowrap items-center justify-center gap-3 overflow-x-auto md:justify-end">
          <Link href="/campaign" className="rounded-lg border border-emerald-500/40 px-3 py-2 text-sm text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white">Campaigns</Link>
          <Link href="/manage/campaigns" className="rounded-lg border border-amber-500/40 px-3 py-2 text-sm text-amber-400 transition-colors duration-200 hover:bg-amber-500 hover:text-white active:bg-amber-500 active:text-white">Manage</Link>
          <button onClick={() => setIsCampaignOpen(true)} className="rounded-lg border border-blue-500/40 px-3 py-2 text-sm text-blue-400 transition-colors duration-200 hover:bg-blue-500 hover:text-white active:bg-blue-500 active:text-white">+ campaign</button>
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
          setJoinedCampaigns((prev) => [newCampaign, ...prev]);
        }}
      />

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="mx-auto w-[95%] lg:w-[80%]">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search joined campaigns"
            className={`w-full rounded-xl border px-3 py-3 text-sm text-white outline-none bg-transparent transition-colors duration-200 ${filteredCampaigns.length === 0 && searchQuery.trim() ? 'border-red-500' : filteredCampaigns.length >= 10 ? 'border-emerald-500' : 'border-amber-400'}`}
          />
          {filteredCampaigns.length === 0 && searchQuery.trim() ? (
            <p className="mt-3 text-sm text-red-400">No results found. Try a different search term.</p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-nowrap gap-4 overflow-x-auto pb-2 md:flex-wrap md:items-center md:justify-center">
          <div className="min-w-[180px] md:flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Status group</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'Active', 'Paused', 'Completed'].map((status) => {
                const pressed = pressedButton === `status-${status}`;
                const selected = filters.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onPointerDown={() => setPressedButton(`status-${status}`)}
                    onPointerUp={() => setPressedButton(null)}
                    onPointerLeave={() => setPressedButton(null)}
                    onPointerCancel={() => setPressedButton(null)}
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                    className={`rounded-full border px-3 py-2 text-sm transition duration-150 outline-none ${selected ? 'border-amber-400 text-amber-400' : 'border-transparent text-zinc-300 hover:bg-amber-400/15 focus-visible:bg-amber-400/15'} ${pressed ? 'bg-amber-400 text-white' : ''}`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-[180px] md:flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Category group</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'Technology', 'Marketing', 'Design'].map((category) => {
                const pressed = pressedButton === `category-${category}`;
                const selected = filters.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onPointerDown={() => setPressedButton(`category-${category}`)}
                    onPointerUp={() => setPressedButton(null)}
                    onPointerLeave={() => setPressedButton(null)}
                    onPointerCancel={() => setPressedButton(null)}
                    onClick={() => setFilters((prev) => ({ ...prev, category }))}
                    className={`rounded-full border px-3 py-2 text-sm transition duration-150 outline-none ${selected ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-300 hover:bg-emerald-400/15 focus-visible:bg-emerald-400/15'} ${pressed ? 'bg-emerald-400 text-white' : ''}`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-[180px] md:flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Niche group</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'Growth', 'Beauty', 'Finance'].map((niche) => {
                const pressed = pressedButton === `niche-${niche}`;
                const selected = filters.niche === niche;
                return (
                  <button
                    key={niche}
                    type="button"
                    onPointerDown={() => setPressedButton(`niche-${niche}`)}
                    onPointerUp={() => setPressedButton(null)}
                    onPointerLeave={() => setPressedButton(null)}
                    onPointerCancel={() => setPressedButton(null)}
                    onClick={() => setFilters((prev) => ({ ...prev, niche }))}
                    className={`rounded-full border px-3 py-2 text-sm transition duration-150 outline-none ${selected ? 'border-sky-400 text-sky-400' : 'border-transparent text-zinc-300 hover:bg-sky-400/15 focus-visible:bg-sky-400/15'} ${pressed ? 'bg-sky-400 text-white' : ''}`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-[180px] md:flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Competition group</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'highest_cpm', label: 'Highest CPM' },
                { value: 'highest_payout', label: 'Highest payout' },
              ].map((option) => {
                const pressed = pressedButton === `competition-${option.value}`;
                const selected = filters.competition === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onPointerDown={() => setPressedButton(`competition-${option.value}`)}
                    onPointerUp={() => setPressedButton(null)}
                    onPointerLeave={() => setPressedButton(null)}
                    onPointerCancel={() => setPressedButton(null)}
                    onClick={() => setFilters((prev) => ({ ...prev, competition: option.value }))}
                    className={`rounded-full border px-3 py-2 text-sm transition duration-150 outline-none ${selected ? 'border-amber-400 text-amber-400' : 'border-transparent text-zinc-300 hover:bg-amber-400/15 focus-visible:bg-amber-400/15'} ${pressed ? 'bg-amber-400 text-white' : ''}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              value={filters.minPayout}
              onChange={(e) => setFilters((prev) => ({ ...prev, minPayout: e.target.value }))}
              placeholder="Min payout"
              className="min-w-[160px] rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none transition duration-200 hover:bg-zinc-900/60 active:bg-zinc-800"
            />
            <input
              value={filters.maxPayout}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPayout: e.target.value }))}
              placeholder="Max payout"
              className="min-w-[160px] rounded-xl border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none transition duration-200 hover:bg-zinc-900/60 active:bg-zinc-800"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Joined campaigns</h2>
            <span className="text-sm text-zinc-400">{filteredCampaigns.length} active</span>
          </div>
          {filteredCampaigns.length === 0 ? (
            <p className="text-sm text-zinc-400">No joined campaigns yet. Join one from the campaign list to see it here.</p>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{campaign.projectName}</h3>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-400">{campaign.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{campaign.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-300">
                    <span>CPM: {campaign.highestMcp ?? 100}</span>
                    <span>Min payout: ${campaign.minPayout ?? 0}</span>
                    <span>Max payout: ${campaign.maxPayout ?? 0}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900">Rate campaign</button>
                    <button className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900">Share progress</button>
                    <button className="rounded-full border border-red-500/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10">Support</button>
                    <button onClick={() => leaveCampaign(campaign.id)} className="rounded-full border border-emerald-500/30 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/10">Leave</button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-zinc-300">Progress</span>
                      <span className="text-emerald-400">{campaign.progress ?? 62}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${campaign.progress ?? 62}%` }} />
                    </div>
                    <textarea
                      value={draftNotes[campaign.id] ?? campaign.feedback ?? ''}
                      onChange={(e) => setDraftNotes((prev) => ({ ...prev, [campaign.id]: e.target.value }))}
                      rows={3}
                      className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
                      placeholder="Share progress, screenshots, or feedback for the campaign admin"
                    />
                    <button onClick={() => saveFeedback(campaign.id)} className="mt-2 rounded-full border border-emerald-500/30 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/10">Save note</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-400">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="mt-1 text-sm text-zinc-400">{item.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-500">{item.actorId} • {String(item.createdAt ?? '')}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import CampaignCard from '@/components/campaign-card';
import type { CampaignCardData } from '@/types/campaign';
import Link from 'next/link';
import { recordOfficeEvent } from '@/lib/office-history';
import AdvertModal from '@/components/layout/advert-modal';
import CampaignModal from '@/components/layout/campaign-modal';

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    status: 'active',
    category: '',
    niche: '',
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState<'status' | 'category' | 'niche' | 'competition' | null>(null);
  const [isAdvertOpen, setIsAdvertOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [profile, setProfile] = useState<{ ownerName?: string; handle?: string } | null>(null);

  const applyFilter = (key: 'sortBy' | 'status' | 'category' | 'niche', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setMobileMenuOpen(null);
  };

  const filterStyles = {
    status: {
      button: 'border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-white',
      active: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
      popover: 'border-amber-500/40 bg-zinc-950',
    },
    category: {
      button: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white',
      active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
      popover: 'border-emerald-500/40 bg-zinc-950',
    },
    niche: {
      button: 'border-sky-500/40 text-sky-300 hover:bg-sky-500 hover:text-white',
      active: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
      popover: 'border-sky-500/40 bg-zinc-950',
    },
    competition: {
      button: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white',
      active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
      popover: 'border-emerald-500/40 bg-zinc-950',
    },
  } as const;

  const renderOptionList = (
    key: 'sortBy' | 'status' | 'category' | 'niche',
    options: { value: string; label: string }[],
    currentValue: string,
    styleKey: 'status' | 'category' | 'niche' | 'competition'
  ) => {
    const styles = filterStyles[styleKey];
    return (
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isActive = option.value === currentValue;
          return (
            <button
              key={option.value}
              onClick={() => applyFilter(key, option.value)}
              className={`rounded-lg border px-2.5 py-2 text-left text-sm transition-colors duration-200 ${
                isActive ? styles.active : `border-zinc-800 bg-zinc-900 text-white hover:${styles.button}`
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data);
      } catch {
        // ignore
      }
    };

    const loadCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) throw new Error('Request failed');
        const data = (await response.json()) as CampaignCardData[];
        setCampaigns(data);
      } catch (error) {
        console.error('Failed to load campaigns from database', error);
        setCampaigns([]);
      }
    };

    loadProfile();
    loadCampaigns();
  }, []);

  const handleJoinCampaign = async (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hasJoined: true } : c))
    );

    try {
      await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'interact', entityType: 'campaign', entityId: Number(id), actionType: 'join', message: 'Joined campaign' }),
      });
    } catch (error) {
      console.error('Unable to record join event', error);
    }

    recordOfficeEvent({ type: 'campaign', title: 'Campaign joined', description: 'You joined a campaign.', status: 'active' });
  };

  const handleUpdateCampaignStatus = async (id: string, status: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'update_campaign_status', entityId: Number(id), status }),
      });
    } catch (error) {
      console.error('Failed to update campaign status', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const response = await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ mode: 'delete_campaign', entityId: Number(id) }),
      });
      if (response.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete campaign', error);
    }
  };

  const handleExitCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hasJoined: false } : c))
    );
    recordOfficeEvent({ type: 'campaign', title: 'Campaign left', description: 'You left a campaign.', status: 'updated' });
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || campaign.publisherUsername.toLowerCase().includes(query) || campaign.projectName.toLowerCase().includes(query);
      const matchesStatus = !filters.status || campaign.status.toLowerCase() === filters.status.toLowerCase();
      const matchesCategory = !filters.category || campaign.category.toLowerCase() === filters.category.toLowerCase();
      const matchesNiche = !filters.niche || campaign.nicheHashtag.toLowerCase().includes(filters.niche.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory && matchesNiche;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return parseInt(b.id, 10) - parseInt(a.id, 10);
        case 'highest_budget':
          return b.totalBudget - a.totalBudget;
        case 'highest_available_budget':
          return (b.totalBudget - b.budgetUsed) - (a.totalBudget - a.budgetUsed);
        case 'highest_mcp':
          return b.highestMcp - a.highestMcp;
        case 'most_paid_out':
          return b.budgetUsed - a.budgetUsed;
        case 'most_creators':
          return b.communitySize - a.communitySize;
        case 'less_influencer':
          return a.communitySize - b.communitySize;
        default:
          return 0;
      }
    });

  const getAlternatives = (query: string): CampaignCardData[] => {
    if (!query) return [];

    const scored = campaigns.map((c) => {
      let score = 0;
      const q = query.toLowerCase();
      const username = c.publisherUsername.toLowerCase();
      const project = c.projectName.toLowerCase();
      const niche = c.nicheHashtag.toLowerCase();
      const category = c.category.toLowerCase();

      if (username.includes(q)) score += 10;
      if (project.includes(q)) score += 8;
      if (category.includes(q)) score += 5;
      if (niche.includes(q)) score += 4;

      const words = q.split(/[\s,]+/).filter(Boolean);
      words.forEach((word) => {
        if (username.includes(word)) score += 3;
        if (project.includes(word)) score += 2;
        if (niche.includes(word)) score += 1;
      });

      return { campaign: c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    let filtered = scored.filter((item) => item.score > 0).map((item) => item.campaign);
    if (filtered.length === 0) {
      filtered = campaigns;
    }
    return filtered.slice(0, 3);
  };

  const alternatives = filteredCampaigns.length === 0 ? getAlternatives(searchQuery) : [];

  const statusLabel = filters.status ? (filters.status === 'active' ? 'Active' : 'Future') : 'Status';
  const categoryLabel = filters.category ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1) : 'Category';
  const nicheLabel = filters.niche ? filters.niche.charAt(0).toUpperCase() + filters.niche.slice(1) : 'Niche';
  const competitionLabel = {
    newest: 'Newest',
    highest_budget: 'Highest Budget',
    highest_available_budget: 'Highest Available Budget',
    highest_mcp: 'Highest MCP',
    most_paid_out: 'Most Paid Out',
    most_creators: 'Most Creators',
    less_influencer: 'Less Influencer',
  }[filters.sortBy] ?? 'Competition';

  const searchBorder = filteredCampaigns.length <= 2
    ? 'border-red-500'
    : filteredCampaigns.length >= 12
    ? 'border-emerald-500'
    : 'border-yellow-400';

  const welcomeText = profile?.handle
    ? `Welcome back, ${profile.handle}! Explore the latest campaigns to monetize your social media account.`
    : 'Welcome to our campaign page! Check out the latest deals available — monetize your social media account by completing a campaign.';

  return (
    <div className="min-h-screen mx-[2%] my-[3%] bg-zinc-950 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="mt-2 text-sm text-zinc-400">{welcomeText}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-end">
          <Link
            href="/campaign/activity"
            className="rounded-lg border border-emerald-500/40 px-3 py-2 text-sm text-emerald-400 transition-colors duration-200 hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white"
          >
            Joined
          </Link>
          <Link
            href="/manage/campaigns"
            className="rounded-lg border border-amber-500/40 px-3 py-2 text-sm text-amber-400 transition-colors duration-200 hover:bg-amber-500 hover:text-white active:bg-amber-500 active:text-white"
          >
            Manage
          </Link>
          <button
            onClick={() => setIsCampaignOpen(true)}
            className="rounded-lg border border-blue-500/40 px-3 py-2 text-sm text-blue-400 transition-colors duration-200 hover:bg-blue-500 hover:text-white active:bg-blue-500 active:text-white"
          >
            + campaign
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-10 bg-black/30" onClick={() => setMobileMenuOpen(null)} />
      ) : null}

      <div className="md:hidden sticky top-4 z-20 mb-6 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Type to search campaigns"
          className={`w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/90 px-3 py-2.5 text-sm text-white outline-none transition-colors duration-200 ${searchBorder}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-wrap justify-center gap-2 overflow-x-visible py-1 max-[760px]:overflow-visible">
          <div className="relative max-[360px]:basis-[46%] max-[360px]:min-w-[0]">
            <button
              onClick={() => setMobileMenuOpen(mobileMenuOpen === 'status' ? null : 'status')}
              className={`inline-flex w-full justify-center rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${filterStyles.status.button}`}
            >
              <div className="text-sm text-white">{statusLabel}</div>
            </button>

            {mobileMenuOpen === 'status' ? (
              <div className={`absolute left-0 right-0 mt-2 rounded-xl border p-3 shadow-2xl z-30 ${filterStyles.status.popover}`}>
                {renderOptionList('status', [{ value: 'active', label: 'Active' }, { value: 'future', label: 'Future' }], filters.status, 'status')}
              </div>
            ) : null}
          </div>

          <div className="relative max-[360px]:basis-[46%] max-[360px]:min-w-[0]">
            <button
              onClick={() => setMobileMenuOpen(mobileMenuOpen === 'category' ? null : 'category')}
              className={`inline-flex w-full justify-center rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${filterStyles.category.button}`}
            >
              <div className="text-sm text-white">{categoryLabel}</div>
            </button>

            {mobileMenuOpen === 'category' ? (
              <div className={`absolute left-0 right-0 mt-2 rounded-xl border p-3 shadow-2xl z-30 ${filterStyles.category.popover}`}>
                {renderOptionList(
                  'category',
                  [
                    { value: '', label: 'Any Category' },
                    { value: 'lifestyle', label: 'Lifestyle' },
                    { value: 'gaming', label: 'Gaming' },
                    { value: 'entertainment', label: 'Entertainment' },
                    { value: 'sports', label: 'Sports' },
                    { value: 'education', label: 'Education' },
                    { value: 'technology', label: 'Technology' },
                    { value: 'luxury', label: 'Luxury' },
                    { value: 'music', label: 'Music' },
                    { value: 'politics', label: 'Politics' },
                    { value: 'religion', label: 'Religion' },
                  ],
                  filters.category,
                  'category'
                )}
              </div>
            ) : null}
          </div>

          <div className="relative max-[360px]:basis-[46%] max-[360px]:min-w-[0]">
            <button
              onClick={() => setMobileMenuOpen(mobileMenuOpen === 'niche' ? null : 'niche')}
              className={`inline-flex w-full justify-center rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${filterStyles.niche.button}`}
            >
              <div className="text-sm text-white">{nicheLabel}</div>
            </button>

            {mobileMenuOpen === 'niche' ? (
              <div className={`absolute left-0 right-0 mt-2 rounded-xl border p-3 shadow-2xl z-30 ${filterStyles.niche.popover}`}>
                {renderOptionList(
                  'niche',
                  [
                    { value: '', label: 'Any Niche' },
                    { value: 'duet', label: '#duet' },
                    { value: 'sound', label: '#sound' },
                    { value: 'ugc', label: '#ugc' },
                    { value: 'logo', label: '#logo' },
                    { value: 'clipping', label: '#clipping' },
                  ],
                  filters.niche,
                  'niche'
                )}
              </div>
            ) : null}
          </div>

          <div className="relative max-[360px]:basis-[46%] max-[360px]:min-w-[0]">
            <button
              onClick={() => setMobileMenuOpen(mobileMenuOpen === 'competition' ? null : 'competition')}
              className={`inline-flex w-full justify-center rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${filterStyles.competition.button}`}
            >
              <div className="text-sm text-white">{competitionLabel}</div>
            </button>

            {mobileMenuOpen === 'competition' ? (
              <div className={`absolute left-0 right-0 mt-2 rounded-xl border p-3 shadow-2xl z-30 ${filterStyles.competition.popover}`}>
                {renderOptionList(
                  'sortBy',
                  [
                    { value: 'newest', label: 'Newest' },
                    { value: 'highest_budget', label: 'Highest Budget' },
                    { value: 'highest_available_budget', label: 'Highest Available Budget' },
                    { value: 'highest_mcp', label: 'Highest MCP' },
                    { value: 'most_paid_out', label: 'Most Paid Out' },
                    { value: 'most_creators', label: 'Most Creators' },
                    { value: 'less_influencer', label: 'Less Influencer' },
                  ],
                  filters.sortBy,
                  'competition'
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-8 hidden items-center justify-center gap-3 md:flex">
        <input
          type="text"
          placeholder="Type to search campaigns"
          className={`w-[90%] lg:w-[80%] max-[360px]:w-[95%] rounded-2xl border border-zinc-800/80 bg-transparent px-3 py-2 text-sm text-white outline-none transition-colors duration-200 ${searchBorder}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 hidden w-full justify-center gap-4 md:flex">
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === 'competition' ? null : 'competition')}
            className={`inline-flex rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${filterStyles.competition.button}`}
          >
            {competitionLabel}
          </button>

          {mobileMenuOpen === 'competition' ? (
            <div className={`absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border p-3 shadow-2xl ${filterStyles.competition.popover}`}>
              {renderOptionList(
                'sortBy',
                [
                  { value: 'newest', label: 'Newest' },
                  { value: 'highest_budget', label: 'Highest Budget' },
                  { value: 'highest_available_budget', label: 'Highest Available Budget' },
                  { value: 'highest_mcp', label: 'Highest MCP' },
                  { value: 'most_paid_out', label: 'Most Paid Out' },
                  { value: 'most_creators', label: 'Most Creators' },
                  { value: 'less_influencer', label: 'Less Influencer' },
                ],
                filters.sortBy,
                'competition'
              )}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === 'status' ? null : 'status')}
            className={`inline-flex rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${filterStyles.status.button}`}
          >
            {statusLabel}
          </button>

          {mobileMenuOpen === 'status' ? (
            <div className={`absolute left-0 top-full z-30 mt-2 w-48 rounded-xl border p-3 shadow-2xl ${filterStyles.status.popover}`}>
              {renderOptionList('status', [{ value: 'active', label: 'Active' }, { value: 'future', label: 'Future' }], filters.status, 'status')}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === 'category' ? null : 'category')}
            className={`inline-flex rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${filterStyles.category.button}`}
          >
            {categoryLabel}
          </button>

          {mobileMenuOpen === 'category' ? (
            <div className={`absolute left-0 top-full z-30 mt-2 w-48 rounded-xl border p-3 shadow-2xl ${filterStyles.category.popover}`}>
              {renderOptionList(
                'category',
                [
                  { value: '', label: 'Any Category' },
                  { value: 'lifestyle', label: 'Lifestyle' },
                  { value: 'gaming', label: 'Gaming' },
                  { value: 'entertainment', label: 'Entertainment' },
                  { value: 'sports', label: 'Sports' },
                  { value: 'education', label: 'Education' },
                  { value: 'technology', label: 'Technology' },
                  { value: 'luxury', label: 'Luxury' },
                  { value: 'music', label: 'Music' },
                  { value: 'politics', label: 'Politics' },
                  { value: 'religion', label: 'Religion' },
                ],
                filters.category,
                'category'
              )}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(mobileMenuOpen === 'niche' ? null : 'niche')}
            className={`inline-flex rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${filterStyles.niche.button}`}
          >
            {nicheLabel}
          </button>

          {mobileMenuOpen === 'niche' ? (
            <div className={`absolute left-0 top-full z-30 mt-2 w-48 rounded-xl border p-3 shadow-2xl ${filterStyles.niche.popover}`}>
              {renderOptionList(
                'niche',
                [
                  { value: '', label: 'Any Niche' },
                  { value: 'duet', label: '#duet' },
                  { value: 'sound', label: '#sound' },
                  { value: 'ugc', label: '#ugc' },
                  { value: 'logo', label: '#logo' },
                  { value: 'clipping', label: '#clipping' },
                ],
                filters.niche,
                'niche'
              )}
            </div>
          ) : null}
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
          } as CampaignCardData;
          setCampaigns((prev) => [newCampaign, ...prev]);
        }}
      />

      <AdvertModal
        isOpen={isAdvertOpen}
        onClose={() => setIsAdvertOpen(false)}
        onPublishSuccess={(item) => {
          const newCampaign = {
            id: String(item?.id ?? Date.now()),
            publisherProfileIcon: '/images/publisher-placeholder.png',
            projectName: item?.projectName ?? 'New advert',
            publisherUsername: 'demo-user',
            publisherRating: 4.8,
            timeRemainingDays: 14,
            nicheHashtag: 'growth',
            description: item?.description ?? 'Advert created',
            category: item?.category ?? 'Technology',
            status: 'Active',
            communitySize: 12000,
            viewsGenerated: 10000,
            likesGenerated: 1500,
            totalBudget: 1000,
            budgetUsed: 0,
            highestMcp: 100,
            hasJoined: false,
          } as CampaignCardData;
          setCampaigns((prev) => [newCampaign, ...prev]);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              data={campaign}
              onJoinCampaign={handleJoinCampaign}
              onExitCampaign={handleExitCampaign}
              onPauseCampaign={(id, status) => handleUpdateCampaignStatus(id, status)}
              onDeleteCampaign={(id) => handleDeleteCampaign(id)}
            />
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-zinc-850 bg-zinc-900/30 py-16 p-8 text-center backdrop-blur-sm">
            <p className="mb-8 text-base text-zinc-400">No campaigns match your search for "{searchQuery}".</p>

            {alternatives.length > 0 && (
              <div>
                <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-amber-500">Suggested Alternatives</h3>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 justify-center text-left md:grid-cols-2 lg:grid-cols-3">
                  {alternatives.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      data={campaign}
                      onJoinCampaign={handleJoinCampaign}
                      onExitCampaign={handleExitCampaign}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

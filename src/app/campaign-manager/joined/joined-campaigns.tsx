'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Eye, Heart, ChevronDown, Search } from 'lucide-react';
import type { CampaignCardData } from '@/types/campaign';

interface JoinedCampaignsProps {
  campaigns: CampaignCardData[];
  selectedId?: string;
  onSelectChange?: (id: string) => void;
}

function formatMetric(val: number): string {
  if (val >= 1000000) {
    const mVal = val / 1000000;
    return mVal % 1 === 0 ? `${mVal}M` : `${mVal.toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  if (val >= 1000) {
    const kVal = val / 1000;
    return kVal % 1 === 0 ? `${kVal}k` : `${kVal.toFixed(1).replace(/\.?0+$/, '')}k`;
  }
  return `${val}`;
}

function abbreviatePlatform(platform: string): string {
  const map: Record<string, string> = {
    tiktok: 'TT',
    instagram: 'IG',
    youtube: 'YT',
    facebook: 'FB',
    twitter: 'X',
    linkedin: 'LI',
    snapchat: 'SC',
  };
  return map[platform.toLowerCase()] || platform.slice(0, 2).toUpperCase();
}

export default function JoinedCampaigns({ campaigns, selectedId: externalSelectedId, onSelectChange }: JoinedCampaignsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'cpm' | 'debt' | 'views' | 'budget'>('rank');
  const [internalSelectedId, setInternalSelectedId] = useState<string>(campaigns[0]?.id ?? '');
  const selectedId = externalSelectedId ?? internalSelectedId;
  const setSelectedId = onSelectChange ?? setInternalSelectedId;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 15000);
  };

  const handleOpen = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      scheduleHide();
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 5000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    let result = campaigns;
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter((c) => c.projectName.toLowerCase().includes(q));
    }
    result = [...result];
    if (sortBy === 'views') {
      result.sort((a, b) => (b.viewsGenerated || 0) - (a.viewsGenerated || 0));
    } else if (sortBy === 'budget') {
      result.sort((a, b) => (b.totalBudget || 0) - (a.totalBudget || 0));
    } else if (sortBy === 'debt') {
      result.sort((a, b) => (b.debt || 0) - (a.debt || 0));
    } else if (sortBy === 'cpm') {
      result.sort((a, b) => (b.highestMcp || 0) - (a.highestMcp || 0));
    } else {
      result.sort((a, b) => (a.rank || 0) - (b.rank || 0));
    }
    return result;
  }, [campaigns, debouncedQuery, sortBy]);

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;
  const requiredPlatforms = selected?.requiredPlatforms ?? [];

  return (
    <div className="w-full text-sm text-zinc-200">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.25em] text-zinc-500">Joined campaigns</h3>

      <div className="flex items-start gap-4">
        <div className="w-1/2">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleOpen}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-white outline-none focus:border-emerald-500"
            >
              <span className="truncate">{selected ? `#${selected.rank || '?'} ${selected.projectName}` : 'Select campaign'}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
                <div className="p-2">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search campaign..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 pl-8 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  </div>
                  <div className="mb-2 flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 p-0.5">
                    <button
                      type="button"
                      onClick={() => setSortBy('rank')}
                      className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${sortBy === 'rank' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-white'}`}
                    >
                      My rank
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('cpm')}
                      className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${sortBy === 'cpm' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-white'}`}
                    >
                      CPM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('debt')}
                      className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${sortBy === 'debt' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Debt
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('views')}
                      className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${sortBy === 'views' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Views
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('budget')}
                      className={`flex-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest transition ${sortBy === 'budget' ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Budget
                    </button>
                  </div>
                  {searchQuery !== debouncedQuery && (
                    <p className="mb-1 text-[10px] text-zinc-500">Searching...</p>
                  )}
                  <div className="max-h-48 overflow-y-auto">
                    {filtered.map((campaign) => (
                      <button
                        key={campaign.id}
                        type="button"
                        onClick={() => handleSelect(campaign.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${selectedId === campaign.id ? 'bg-emerald-500/10 text-emerald-300' : 'text-zinc-300 hover:bg-zinc-800/60'}`}
                      >
                        <span className="font-semibold text-zinc-500">#{campaign.rank || '?'}</span>
                        <span className="flex-grow truncate">{campaign.projectName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2">
          {selected && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-500/70" />
                <span className="font-semibold text-white">{formatMetric(selected.communitySize)}</span>
                <span className="text-zinc-400">members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-sky-500/70" />
                <span className="font-semibold text-white">{formatMetric(selected.viewsGenerated)}</span>
                <span className="text-zinc-400">views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500/10" strokeWidth={2.5} />
                <span className="font-semibold text-white">{formatMetric(selected.likesGenerated)}</span>
                <span className="text-zinc-400">likes</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {requiredPlatforms.slice(0, 3).map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-zinc-800 bg-zinc-950/80 px-2 py-0.5 text-[10px] uppercase tracking-widest text-zinc-400"
                  >
                    {abbreviatePlatform(platform)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Check, BadgeCheck, BarChart2, Briefcase, Building2, CircleAlert, CreditCard, Landmark, PieChart, Sparkles, TrendingUp, Users, Wallet, X } from 'lucide-react';
import { formatCompactValue } from '@/lib/currency';
import { defaultFinanceState, getFinanceState } from '@/lib/finance';
import { useNotificationContext } from '@/context/NotificationContext';
import TransactionsContainer from '@/components/office/TransactionsContainer';
import CampaignContainer from '@/components/office/CampaignContainer';
import Competition from '@/components/office/Competition';
import type { CampaignCardData } from '@/types/campaign';

const trafficSources = [
  { label: 'Direct Traffic', value: 38, color: 'bg-amber-400' },
  { label: 'Organic Search', value: 27, color: 'bg-orange-500' },
  { label: 'Social Media', value: 18, color: 'bg-emerald-400' },
  { label: 'Referral Traffic', value: 11, color: 'bg-zinc-500' },
  { label: 'Email Campaigns', value: 6, color: 'bg-sky-400' },
];

type ChannelHealthTimeframe = '5d' | '10d' | '16d' | 'this month';

const CHANNEL_HEALTH_DATA: Record<
  ChannelHealthTimeframe,
  {
    cvStrength: number;
    tracks: Array<{ label: string; value: number; color: string }>;
  }
> = {
  '5d': {
    cvStrength: 88,
    tracks: [
      { label: 'Market growth', value: 92, color: 'bg-emerald-400' },
      { label: 'Campaign engagement', value: 80, color: 'bg-amber-400' },
    ],
  },
  '10d': {
    cvStrength: 80,
    tracks: [
      { label: 'Market growth', value: 85, color: 'bg-emerald-400' },
      { label: 'Campaign engagement', value: 76, color: 'bg-amber-400' },
    ],
  },
  '16d': {
    cvStrength: 75,
    tracks: [
      { label: 'Market growth', value: 81, color: 'bg-emerald-400' },
      { label: 'Campaign engagement', value: 72, color: 'bg-amber-400' },
    ],
  },
  'this month': {
    cvStrength: 72,
    tracks: [
      { label: 'Market growth', value: 82, color: 'bg-emerald-400' },
      { label: 'Campaign engagement', value: 74, color: 'bg-amber-400' },
    ],
  },
};

type CampaignFlowTimeframe = '5d' | '10d' | '1m' | '3m' | '6m' | '1 yr' | 'this month' | 'this year';

const TIMEFRAME_COEFFICIENTS: Record<CampaignFlowTimeframe, number> = {
  '5d': 0.3,
  '10d': 0.5,
  '1m': 0.8,
  '3m': 1.2,
  '6m': 1.6,
  '1 yr': 2.0,
  'this month': 1.0,
  'this year': 2.4,
};

type ChampionshipRankingRow = {
  rank: number;
  name: string;
  likes: number;
  views: number;
  isCurrent: boolean;
};

type ChampionshipRanking = {
  id: string;
  projectName: string;
  publisherUsername: string;
  currentRank: number;
  category: string;
  nicheHashtag: string;
  rows: ChampionshipRankingRow[];
};

function DonutChart({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800 p-4">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-950 text-sm font-black text-white">
          {value}%
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-500">Momentum outlook</p>
      </div>
    </div>
  );
}

function HalfDonutChart({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800 p-4">
      <div className="flex h-24 w-24 items-end justify-center overflow-hidden rounded-full">
        <div
          className="h-24 w-24 rounded-t-full border-[10px] border-amber-400"
          style={{ clipPath: 'inset(0 0 50% 0)', transform: `rotate(${value * 1.8}deg)` }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-500">Coverage</p>
      </div>
    </div>
  );
}

function CircularCoverageChart({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800/70 p-4">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ background: `conic-gradient(#f59e0b ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-950 text-sm font-black text-white">
          {value}%
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-500">Coverage</p>
      </div>
    </div>
  );
}

export default function OfficeOverview() {
  const [finance, setFinance] = useState(defaultFinanceState);
  const [championshipRankings, setChampionshipRankings] = useState<ChampionshipRanking[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [channelHealthTimeframe, setChannelHealthTimeframe] = useState<ChannelHealthTimeframe>('this month');
  const [createdCampaigns, setCreatedCampaigns] = useState<CampaignCardData[]>([]);
  const [selectedCreatedCampaignId, setSelectedCreatedCampaignId] = useState<string>('');
  const [campaignFlowTimeframe, setCampaignFlowTimeframe] = useState<CampaignFlowTimeframe>('this month');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const { offers: notificationOffers, orders: notificationOrders } = useNotificationContext();

  useEffect(() => {
    const updateFinance = () => setFinance(getFinanceState());

    updateFinance();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'buyercard-finance') updateFinance();
    };
    const handleCustom = () => updateFinance();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('financeStateChanged', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('financeStateChanged', handleCustom);
    };
  }, []);

  useEffect(() => {
    const loadJoinedCampaigns = async () => {
      try {
        // Fetch joined campaigns
        const joinedResponse = await fetch('/api/campaigns?filter=joined', {
          headers: { 'x-user-id': 'demo-user' },
        });
        if (!joinedResponse.ok) return;
        const joinedCampaigns = (await joinedResponse.json()) as CampaignCardData[];

        // Fetch created campaigns
        const createdResponse = await fetch('/api/campaigns?filter=created', {
          headers: { 'x-user-id': 'demo-user' },
        });
        if (createdResponse.ok) {
          const created = (await createdResponse.json()) as CampaignCardData[];
          setCreatedCampaigns(created);
          if (created.length > 0) {
            setSelectedCreatedCampaignId(created[0].id);
          }
        }

        const rankings = joinedCampaigns
          .filter((campaign) => campaign?.projectName)
          .map((campaign) => {
            const likesBase = Number(campaign.likesGenerated ?? 1500);
            const viewsBase = Number(campaign.viewsGenerated ?? 10000);
            const userRank = Math.max(1, Math.min(24, Math.round(viewsBase / 6000 + likesBase / 900 + (Number(campaign.id) % 5))));

            const baseRows = [
              { rank: 1, name: 'Champion', views: viewsBase + 2400, likes: likesBase + 320 },
              { rank: 2, name: 'Runner Up', views: viewsBase + 1800, likes: likesBase + 240 },
              { rank: userRank, name: 'You', views: viewsBase, likes: likesBase },
            ];

            const rows = [...baseRows];

            if (userRank === 1) {
              rows.push(
                { rank: 2, name: 'Runner Up', views: viewsBase + 1800, likes: likesBase + 240 },
                { rank: 3, name: 'Finalist', views: viewsBase + 1400, likes: likesBase + 180 },
                { rank: 4, name: 'Runner', views: viewsBase + 1100, likes: likesBase + 140 },
              );
            } else if (userRank === 2) {
              rows.push(
                { rank: 1, name: 'Champion', views: viewsBase + 2400, likes: likesBase + 320 },
                { rank: 3, name: 'Finalist', views: viewsBase + 1400, likes: likesBase + 180 },
                { rank: 4, name: 'Runner', views: viewsBase + 1100, likes: likesBase + 140 },
              );
            } else {
              rows.push(
                { rank: userRank - 2, name: `Runner ${userRank - 2}`, views: viewsBase - 800, likes: likesBase - 120 },
                { rank: userRank - 1, name: `Runner ${userRank - 1}`, views: viewsBase - 400, likes: likesBase - 60 },
                { rank: userRank + 1, name: `Runner ${userRank + 1}`, views: viewsBase + 400, likes: likesBase + 60 },
                { rank: userRank + 2, name: `Runner ${userRank + 2}`, views: viewsBase + 800, likes: likesBase + 120 },
              );
            }

            const sortedRows = rows
              .sort((left, right) => {
                if (right.views !== left.views) return right.views - left.views;
                return right.likes - left.likes;
              })
              .map((row, index) => ({ ...row, rank: index + 1, isCurrent: row.name === 'You' }));

            return {
              id: campaign.id,
              projectName: campaign.projectName,
              publisherUsername: campaign.publisherUsername,
              currentRank: userRank,
              category: campaign.category ?? 'General',
              nicheHashtag: campaign.nicheHashtag ?? 'growth',
              rows: sortedRows.slice(0, 5),
            };
          });

        setChampionshipRankings(rankings);
        if (rankings.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(rankings[0].id);
        }
      } catch (error) {
        console.error('Unable to load joined campaign rankings', error);
      }
    };

    loadJoinedCampaigns();
  }, []);

  const campaigns = { incomeEarned: 2400000, incomeSpent: 360000 };

  const selectedCreatedCampaign = createdCampaigns.find((c) => c.id === selectedCreatedCampaignId) ?? createdCampaigns[0];

  const coef = TIMEFRAME_COEFFICIENTS[campaignFlowTimeframe];

  const campaignGrowthScore = selectedCreatedCampaign
    ? Math.min(100, Math.round(((selectedCreatedCampaign.likesGenerated ?? 0) * coef / 2000) * 100))
    : 82;

  const campaignCoverage = selectedCreatedCampaign
    ? Math.min(100, Math.round(((selectedCreatedCampaign.viewsGenerated ?? 0) * coef / 15000) * 100))
    : 68;

  const selectedCampaign = championshipRankings.find((campaign) => campaign.id === selectedCampaignId) ?? championshipRankings[0];
  const selectedCampaignCategories = (selectedCampaign?.category ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  const selectedCampaignNiches = (selectedCampaign?.nicheHashtag ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  const selectedCampaignCoverage = (() => {
    if (!selectedCampaign) return { percentage: 0, targetViews: 0, reachedViews: 0 };

    const targetViews = 250000;
    const reachedViews = Math.max(0, Math.min(targetViews, Math.round(targetViews * 0.5 + (selectedCampaign.currentRank - 1) * 18000)));
    const percentage = Math.min(100, Math.round((reachedViews / targetViews) * 100));

    return { percentage, targetViews, reachedViews };
  })();
  const market = { involvement: '24 active' };
  const orders = { involvement: '18 tracked' };
  const offers = { involvement: '9 pending' };
  const account = {
    totalBalance: finance.accountBalance,
    reservedFee: finance.reservedFee,
    get availableBalance() {
      return Math.max(0, this.totalBalance - this.reservedFee);
    },
  };
  const paymentMethods = [
    { id: 'airtel', label: 'Airtel Money', number: '+256 701 234 567', verified: true, icon: CreditCard },
    { id: 'mobile', label: 'Mobile Money', number: '+256 772 345 678', verified: false, icon: Wallet },
    { id: 'bank', label: 'Bank card', number: '**** **** **** 8890', verified: true, icon: Building2 },
  ];
  const buildActivitySection = (items: Array<{ status?: string; productPriceRaw?: number; offeredPrice?: number; responsePrice?: number; value?: number }>) => {
    const bought = items.filter((item) => ['accepted', 'completed'].includes(item.status ?? ''));
    const pending = items.filter((item) => ['pending', 'sent', 'received', 'countered'].includes(item.status ?? ''));
    const passed = items.filter((item) => ['passed', 'timed-out'].includes(item.status ?? ''));
    const rejected = items.filter((item) => ['rejected', 'declined'].includes(item.status ?? ''));

    const sumAmounts = (group: Array<{ productPriceRaw?: number; offeredPrice?: number; responsePrice?: number; value?: number }>) =>
      group.reduce((total, item) => {
        const amount = item.responsePrice ?? item.offeredPrice ?? item.productPriceRaw ?? item.value ?? 0;
        return total + Number(amount ?? 0);
      }, 0);

    const totalCount = items.length;
    const totalAmount = sumAmounts(items);

    return {
      totalCount,
      totalAmount,
      rows: [
        { label: 'Bought', count: bought.length, amount: sumAmounts(bought) },
        { label: 'Pending', count: pending.length, amount: sumAmounts(pending) },
        { label: 'Passed', count: passed.length, amount: sumAmounts(passed) },
        { label: 'Rejected', count: rejected.length, amount: sumAmounts(rejected) },
      ],
      averageConversion: totalCount > 0 ? `${Math.round((bought.length / totalCount) * 100)}%` : '0%',
    };
  };

  const marketActivity = {
    offers: {
      label: 'Offers',
      ...buildActivitySection(notificationOffers),
    },
    orders: {
      label: 'Orders',
      ...buildActivitySection(notificationOrders),
    },
  };

  const offerStatusOrder = ['Bought', 'Pending', 'Passed', 'Rejected'] as const;
  const orderStatusOrder = ['Sold', 'Pending', 'Passed', 'Rejected'] as const;
  const [offerCycle, setOfferCycle] = useState(0);
  const [orderCycle, setOrderCycle] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOfferCycle((value) => (value + 1) % offerStatusOrder.length);
      setOrderCycle((value) => (value + 1) % orderStatusOrder.length);
    }, 3080);

    return () => window.clearInterval(interval);
  }, []);

  const displayedOfferRows = Array.from({ length: 2 }, (_, index) => {
    const statusKey = offerStatusOrder[(index + offerCycle) % offerStatusOrder.length];
    const row = marketActivity.offers.rows.find((item) => item.label === statusKey);
    return {
      label: statusKey,
      count: row?.count ?? 0,
      amount: row?.amount ?? 0,
    };
  });

  const displayedOrderRows = Array.from({ length: 2 }, (_, index) => {
    const statusKey = orderStatusOrder[(index + orderCycle) % orderStatusOrder.length];
    const row = marketActivity.orders.rows.find((item) => item.label === statusKey);
    return {
      label: statusKey,
      count: row?.count ?? 0,
      amount: row?.amount ?? 0,
    };
  });

  const displayedOfferTotal = displayedOfferRows.reduce((total, row) => total + row.amount, 0);
  const displayedOrderTotal = displayedOrderRows.reduce((total, row) => total + row.amount, 0);

  const topCampaignRank = { campaignName: 'Spring Launch', position: 2 };
  const purchasedAccount = { accountName: 'Prime Growth Account' };

  return (
    <>
      <style jsx global>{`
        @keyframes moveUpFade {
          0% { transform: translateY(10px); opacity: 0.4; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes flipUp {
          0% { transform: rotateX(-90deg); opacity: 0; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }

        .flip-animation {
          animation: flipUp 2s ease-out forwards;
          transform-origin: top center;
          perspective: 1000px;
        }

        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="w-full bg-black px-0 py-0 text-zinc-100 sm:px-0 sm:py-0 lg:px-0">
        <div className="w-full bg-black p-0 sm:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/70 pb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-white">Welcome</h1>
            <h2 className="mt-1 text-xl font-semibold text-zinc-300">Martha Mukisa</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Track your campaign momentum, creator reach, and recent income in one view.
            </p>
          </div>

          <div className="flex flex-wrap items-stretch gap-3">
            {topCampaignRank.position <= 5 ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-zinc-200">
                <div className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Congratulations</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  You are ranked <span className="font-semibold text-white">#{topCampaignRank.position}</span> in{' '}
                  <span className="font-semibold text-white">{topCampaignRank.campaignName}</span>.
                </p>
              </div>
            ) : null}

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-zinc-200">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                <span>Purchase note</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                You successfully purchased <span className="font-semibold text-white">{purchasedAccount.accountName}</span>.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly pulse</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-white">+18.3% healthier engagement</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-zinc-800 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-500">Campaign league</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Campaign leaderboard</h2>
              </div>
            </div>

            {championshipRankings.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Join a campaign to see your position and the users around you.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {championshipRankings.map((campaign) => (
                  <div key={campaign.id} className="rounded-[24px] border border-zinc-800/80 bg-zinc-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{campaign.projectName}</p>
                        <p className="mt-1 text-xs text-zinc-500">{campaign.publisherUsername}</p>
                      </div>
                      <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
                        Rank #{campaign.currentRank}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-[48px_1fr_72px_72px] gap-2 border-b border-zinc-800/80 pb-2 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                      <span>Rank</span>
                      <span>Name</span>
                      <span>Likes</span>
                      <span>Views</span>
                    </div>

                    {campaign.rows.map((row) => (
                      <div
                        key={`${campaign.id}-${row.rank}`}
                        className={`mt-2 grid grid-cols-[48px_1fr_72px_72px] items-center gap-2 rounded-xl px-2 py-2 text-sm ${row.isCurrent ? 'bg-zinc-900/80 text-white' : 'text-zinc-300'}`}
                      >
                        <span className={row.isCurrent ? 'font-semibold text-amber-300' : 'font-medium'}>#{row.rank}</span>
                        <span className="truncate">{row.name}</span>
                        <span>{formatCompactValue(row.likes)}</span>
                        <span>{formatCompactValue(row.views)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-zinc-800/70 p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                    <h3 className="text-lg font-semibold text-white">Campaign target</h3>
                  <p className="mt-1 text-sm text-zinc-400">Track campaign reach against your target audience.</p>
                </div>
                <div className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">Championship</div>
              </div>

              <div className="mt-4">
                <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">Joined campaign</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none"
                  value={selectedCampaignId}
                  onChange={(event) => setSelectedCampaignId(event.target.value)}
                >
                  {championshipRankings.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex flex-col gap-4 lg:gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                  <div className="flex-1">
                    <DonutChart value={82} label="Growth score" color="#f59e0b" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col items-center text-center">
                      <CircularCoverageChart value={selectedCampaignCoverage.percentage} label="Campaign reach" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaignCategories.map((category) => (
                      <span key={category} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1 text-xs text-zinc-300">
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaignNiches.map((niche) => (
                      <span key={niche} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                        {niche}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative p-4 pt-8 sm:p-5 sm:pt-8">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950 px-3 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500" />

            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <div className="flex-1 min-w-0 rounded-[20px] border border-amber-500/70 p-2.5 sm:p-3 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-black uppercase tracking-[0.2em] text-amber-400">campaigners</span>
                  <span className="text-sm font-medium text-amber-400">conv {marketActivity.offers.averageConversion}</span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-200">
                  {displayedOfferRows.map((row, index) => (
                    <div
                      key={`${row.label}-${index}`}
                      className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-1 py-2 text-sm"
                      style={{ animation: 'moveUpFade 980ms ease-out' }}
                    >
                      <span className="font-semibold text-amber-400">{row.count}</span>
                      <span className="truncate text-zinc-200">{row.label}</span>
                      <span className="text-right font-medium text-zinc-100">{formatCompactValue(row.amount)} UGX</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 h-px bg-amber-500/70" />

                <div className="mt-3 flex items-center justify-between text-sm font-medium text-white">
                  <span>Total</span>
                  <span>{formatCompactValue(displayedOfferTotal)} UGX</span>
                </div>
              </div>

              <div className="w-full rounded-[20px] border border-zinc-800/70 p-2.5 sm:p-3 xl:w-72 xl:order-3 h-fit">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black uppercase tracking-[0.2em] text-zinc-100">channel health</span>
                  </div>
                  <div className="flex gap-1 rounded-xl bg-zinc-900/50 p-1 text-[10px]">
                    {(['5d', '10d', '16d', 'this month'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setChannelHealthTimeframe(t)}
                        className={`flex-1 rounded-lg py-1 text-center font-medium transition-all duration-200 capitalize ${
                          channelHealthTimeframe === t
                            ? 'bg-zinc-800 text-white font-bold shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                      <span>CV strength</span>
                      <span className="font-semibold text-white">
                        {CHANNEL_HEALTH_DATA[channelHealthTimeframe].cvStrength}%
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-zinc-900">
                      <div
                        className="h-full rounded-full bg-sky-400 transition-all duration-500 ease-out"
                        style={{ width: `${CHANNEL_HEALTH_DATA[channelHealthTimeframe].cvStrength}%` }}
                      />
                    </div>
                  </div>

                  {CHANNEL_HEALTH_DATA[channelHealthTimeframe].tracks.map((track) => (
                    <div key={track.label}>
                      <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                        <span>{track.label}</span>
                        <span className="font-semibold text-white">{track.value}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-zinc-900">
                        <div
                          className={`${track.color} h-full rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${track.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-w-0 rounded-[20px] border border-emerald-500/70 p-2.5 sm:p-3 xl:order-2 h-fit">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-black uppercase tracking-[0.2em] text-emerald-400">recent income</span>
                  <span className="text-sm font-medium text-emerald-400">conv {marketActivity.orders.averageConversion}</span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-200">
                  {displayedOrderRows.map((row, index) => (
                    <div
                      key={`${row.label}-${index}`}
                      className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-1 py-2 text-sm"
                      style={{ animation: 'moveUpFade 980ms ease-out' }}
                    >
                      <span className="font-semibold text-emerald-400">{row.count}</span>
                      <span className="truncate text-zinc-200">{row.label}</span>
                      <span className="text-right font-medium text-zinc-100">{formatCompactValue(row.amount)} UGX</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 h-px bg-emerald-500/70" />

                <div className="mt-3 flex items-center justify-between text-sm font-medium text-white">
                  <span>Total</span>
                  <span>{formatCompactValue(displayedOrderTotal)} UGX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Flow and Audience Mix removed from the overview per request */}

        {/* Insert CampaignContainer at top of this section */}
        <div className="mb-4">
          <CampaignContainer />
          <div className="mt-3">
            {/* Competition panel directly below the audience mix / campaign graph */}
            <Competition />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Account Flow Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-semibold text-white">Account flow</h2>
            <Wallet className="h-5 w-5 text-emerald-400" />
          </div>

          {/* Top Section: Balance and Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Balance Container */}
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-zinc-400 font-medium">User account balance</p>
              <p className="mt-2 text-2xl font-black text-white tracking-tight">{formatCompactValue(account.totalBalance)} UGX</p>
            </div>

            {/* Deposit Button */}
            <button 
              onClick={() => {}}
              className="rounded-[28px] border border-zinc-800 bg-zinc-950/40 p-5 flex items-center justify-center gap-3 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">Deposit</span>
            </button>

            {/* Withdraw Button */}
            <button 
              onClick={() => {}}
              className="rounded-[28px] border border-zinc-800 bg-zinc-950/40 p-5 flex items-center justify-center gap-3 hover:border-amber-500/50 transition-colors group"
            >
              <div className="rounded-full bg-amber-500/20 p-2 text-amber-400 border border-amber-500/30">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">Withdraw</span>
            </button>
          </div>

          {/* Landscape View: Transactions & Payment Methods (equal height) */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            
            <div className="w-full lg:w-[70%] h-full">
              <TransactionsContainer />
            </div>

            {/* Payment Methods Container (30%, Column Format) */}
            <div className="w-full lg:w-[30%] h-full lg:h-[105%] rounded-[28px] border border-zinc-800 p-4 bg-zinc-950/20">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400 font-semibold">Payment methods</p>
                <button
                  onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Add Payment Method Popover */}
              {showAddPaymentMethod && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2">
                  <button className="w-full text-left text-sm font-medium text-white hover:text-emerald-400 transition-colors py-2 px-3 rounded-lg hover:bg-emerald-500/20">
                    Airtel Money
                  </button>
                  <button className="w-full text-left text-sm font-medium text-white hover:text-emerald-400 transition-colors py-2 px-3 rounded-lg hover:bg-emerald-500/20">
                    Mobile Money
                  </button>
                  <button className="w-full text-left text-sm font-medium text-white hover:text-emerald-400 transition-colors py-2 px-3 rounded-lg hover:bg-emerald-500/20">
                    Bank
                  </button>
                </div>
              )}

              {/* Payment Methods List */}
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between rounded-xl bg-zinc-900/50 p-2">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-800 text-zinc-300">
                        <method.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{method.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{method.number}</p>
                      </div>
                    </div>
                    {method.verified ? (
                      <div className="rounded-full bg-emerald-500/25 p-1 text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-red-500/25 p-1 text-red-400">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
}

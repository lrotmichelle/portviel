'use client';

import Link from 'next/link';
import { Eye, Flame, Medal, Pause, Play, Star, Users, Trophy } from 'lucide-react';
import { formatCompactNumber } from '@/lib/currency';

type CampaignLeader = { userId: string; name: string; rank: number | string; views?: number; amount: number };
type CampaignProfile = {
  id: string;
  name: string;
  budgetUgx: number;
  remainingUgx: number;
  budgetUsed: number;
  totalBudget: number;
  cpm: number;
  membersCount: number;
  viewsGenerated: number;
  status: 'active' | 'paused' | 'ended' | string;
  statusLabel: string;
  stars: number;
  isStarred: boolean;
  viewerIsOwner: boolean;
  canJoin: boolean;
  canLeave: boolean;
  members: CampaignLeader[];
  viewerLeader?: CampaignLeader | null;
};

interface CreatedCampaignsProps {
  campaigns: CampaignProfile[];
  formatCurrency: (amount: number) => string;
  onAction: (campaignId: string, action: 'join' | 'leave' | 'star' | 'pause' | 'activate' | 'end') => Promise<void>;
}

const statusTheme = (status: string) => {
  if (status === 'active') return { dot: 'bg-emerald-400', text: 'text-emerald-300', progress: 'bg-emerald-400', border: 'border-emerald-500/45' };
  if (status === 'paused') return { dot: 'bg-amber-400', text: 'text-amber-300', progress: 'bg-amber-400', border: 'border-amber-500/45' };
  return { dot: 'bg-rose-400', text: 'text-rose-300', progress: 'bg-rose-400', border: 'border-rose-500/45' };
};

export function CreatedCampaigns({ campaigns, formatCurrency, onAction }: CreatedCampaignsProps) {
  return (
    <div className="space-y-3">
      {campaigns.length === 0 ? (
        <p className="rounded-xl border border-zinc-800/70 bg-zinc-950/70 p-4 text-sm text-zinc-500">No campaigns created yet.</p>
      ) : campaigns.map((campaign) => {
        const theme = statusTheme(campaign.status);
        const usedPercent = campaign.budgetUgx > 0
          ? Math.max(0, Math.min(100, Math.round((campaign.budgetUsed / campaign.budgetUgx) * 100)))
          : 0;
        const leaders = [...campaign.members]
          .sort((a, b) => {
            const rankA = typeof a.rank === 'number' ? a.rank : Number.parseInt(a.rank.match(/\d+/)?.[0] ?? '999', 10);
            const rankB = typeof b.rank === 'number' ? b.rank : Number.parseInt(b.rank.match(/\d+/)?.[0] ?? '999', 10);
            return rankA - rankB || (b.views ?? 0) - (a.views ?? 0) || b.amount - a.amount;
          })
          .slice(0, 2);

        return (
          <article key={campaign.id} className={`space-y-4 rounded-2xl border bg-gradient-to-br from-zinc-950 to-black p-4 shadow-lg shadow-black/20 ${theme.border}`}>
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="break-words text-sm font-bold leading-5 text-white">{campaign.name}</h4>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${theme.text}`}>
                <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                {campaign.statusLabel}
              </span>
            </header>

            <div className="grid grid-cols-4 gap-2 rounded-xl bg-zinc-900/50 px-3 py-2.5">
              <div className="flex flex-col gap-1 text-zinc-300"><span className="text-[9px] uppercase tracking-wider text-zinc-500">Members</span><span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-sky-300" /><span className="text-xs font-semibold">{formatCompactNumber(campaign.membersCount)}</span></span></div>
              <div className="flex flex-col gap-1 text-amber-300"><span className="text-[9px] uppercase tracking-wider text-zinc-500">CPM</span><span className="text-xs font-semibold">{formatCurrency(campaign.cpm)}</span></div>
              <div className="flex flex-col gap-1 text-zinc-300"><span className="text-[9px] uppercase tracking-wider text-zinc-500">Views</span><span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-violet-300" /><span className="text-xs font-semibold">{formatCompactNumber(campaign.viewsGenerated)}</span></span></div>
              <div className="flex flex-col gap-1 text-amber-300"><span className="text-[9px] uppercase tracking-wider text-zinc-500">Stars</span><span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-amber-300" /><span className="text-xs font-semibold">{formatCompactNumber(campaign.stars)}</span></span></div>
            </div>

            <section aria-label="Campaign budget">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Budget</p>
                  <p className="mt-0.5 text-sm font-bold text-white">{formatCurrency(campaign.budgetUgx)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Balance</p>
                  <p className="mt-0.5 text-sm font-bold text-emerald-300">{formatCurrency(campaign.remainingUgx)}</p>
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800" role="progressbar" aria-label="Budget used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={usedPercent}>
                <div className={`h-full rounded-full transition-all ${theme.progress}`} style={{ width: `${usedPercent}%` }} />
              </div>
            </section>

            <section className="space-y-2 border-t border-zinc-800/80 pt-3">
              <div className="flex items-center justify-between"><h5 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Top leaders</h5></div>
              {leaders.length === 0 ? <p className="text-xs text-zinc-600">Leaders appear when members participate.</p> : leaders.map((leader, index) => (
                <div key={leader.userId} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-5 gap-y-2 rounded-lg bg-zinc-900/40 px-2.5 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {index === 0 ? <Trophy aria-label="Top leader" className="h-4 w-4 shrink-0 fill-amber-400/20 text-amber-400" /> : <Medal aria-label="Second leader" className="h-4 w-4 shrink-0 fill-emerald-400/20 text-emerald-400" />}
                    <Link href={`/profile/${encodeURIComponent(`acc-${leader.userId}`)}`} className={`truncate text-xs font-medium hover:underline ${index === 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{leader.name}</Link>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-medium text-white">{formatCompactNumber(leader.views ?? 0)}</span>
                  <span className="whitespace-nowrap text-[10px] font-semibold text-emerald-300">{formatCurrency(leader.amount)}</span>
                </div>
              ))}
              {campaign.viewerLeader && (
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-5 gap-y-2 rounded-lg border border-sky-500/20 bg-sky-500/[0.06] px-2.5 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Medal aria-label="Your campaign rank" className="h-4 w-4 shrink-0 fill-sky-400/20 text-sky-300" />
                    <Link href={`/profile/${encodeURIComponent(`acc-${campaign.viewerLeader.userId}`)}`} className="truncate text-xs font-medium text-sky-200 hover:underline">{campaign.viewerLeader.name} <span className="text-[10px] text-sky-300/70">(You · #{campaign.viewerLeader.rank})</span></Link>
                  </div>
                  <span className="whitespace-nowrap text-[10px] font-medium text-white">{formatCompactNumber(campaign.viewerLeader.views ?? 0)}</span>
                  <span className="whitespace-nowrap text-[10px] font-semibold text-emerald-300">{formatCurrency(campaign.viewerLeader.amount)}</span>
                </div>
              )}
            </section>

            <footer className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-zinc-800/80 pt-3">
              <Link href={`${campaign.viewerIsOwner ? '/campaign-manager/manage' : '/campaign-manager/joined'}?campaignId=${encodeURIComponent(campaign.id)}${campaign.viewerIsOwner ? '' : '&source=profile'}`} className="justify-self-start inline-flex items-center justify-center rounded-lg border border-sky-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-sky-300 transition-colors hover:bg-sky-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60">
                {campaign.viewerIsOwner ? 'Manage' : 'Campaign'}
              </Link>
              {campaign.viewerIsOwner ? campaign.status !== 'ended' ? <button type="button" onClick={() => void onAction(campaign.id, 'end')} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-300 transition-colors hover:bg-rose-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"><Flame className="h-3 w-3" /> End</button> : <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-300"><Flame className="h-3 w-3" /> Ended</span> : !campaign.viewerIsOwner && (campaign.canLeave || (campaign.status === 'active' && campaign.canJoin)) ? <button type="button" onClick={() => void onAction(campaign.id, campaign.canLeave ? 'leave' : 'join')} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${campaign.canLeave ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white'}`}>{campaign.canLeave ? 'Leave' : 'Join'}</button> : <span />}
              {campaign.viewerIsOwner && campaign.status === 'active' ? <button type="button" onClick={() => void onAction(campaign.id, 'pause')} className="justify-self-end inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><Pause className="h-3 w-3" /> Pause</button> : campaign.viewerIsOwner && campaign.status === 'paused' ? <button type="button" onClick={() => void onAction(campaign.id, 'activate')} className="justify-self-end inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"><Play className="h-3 w-3" /> Activate</button> : !campaign.viewerIsOwner && campaign.status !== 'ended' ? <button type="button" onClick={() => void onAction(campaign.id, 'star')} disabled={campaign.isStarred} aria-label={campaign.isStarred ? 'You starred this campaign' : 'Star campaign'} className="justify-self-end border-0 bg-transparent p-1 text-amber-400 disabled:opacity-60"><Star className={`h-5 w-5 ${campaign.isStarred ? 'fill-amber-400' : ''}`} /></button> : <span />}
            </footer>
          </article>
        );
      })}
    </div>
  );
}

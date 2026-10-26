'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export function ProfileComponent({ accountId, userName }: { accountId: string; userName?: string | null }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${accountId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [accountId]);

  if (loading) return <div className="text-zinc-400">Loading profile...</div>;
  if (!data) return <div className="text-zinc-400">No profile data</div>;

  const profile = data;
  const displayName = userName?.trim() || profile.name || 'User';
  const formatUGX = (amount: number) => {
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(1)}M`;
    return `UGX ${Math.floor(amount / 1000)}k`;
  };

  const discoverJobs = profile.discoverJobs || [];
  const campaigns = profile.campaigns || [];
  const marketTransactions = profile.marketTransactions || [];

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          {profile.verified && (
            <span className={profile.verificationType === 'kyc' ? 'text-green-500' : 'text-amber-400'}>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
          )}
        </div>
      </header>

      <h2 className="text-lg font-semibold text-white mb-2">Account Summary</h2>
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
        <div className="grid w-full gap-3 md:grid-cols-2">
          <div className="bg-zinc-900/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Name</p>
            <p className="text-white font-medium">{displayName}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Role</p>
            <p className="text-white font-medium">{profile.role}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Rating</p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-white font-medium">{profile.rating?.toFixed(1)} / {profile.totalRatings}</span>
            </div>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Date Joined</p>
            <p className="text-white font-medium">{profile.dateJoined}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Sales (Total Collected)</p>
            <p className="text-white font-medium">{formatUGX(profile.sales || 0)}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Invested (Campaigns)</p>
            <p className="text-white font-medium">{formatUGX(profile.invested || 0)}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col min-[500px]:flex-row gap-4">
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6 flex-1">
          <h2 className="text-lg font-semibold text-white mb-2">Account Bio</h2>
          <p className="text-zinc-300 text-sm">{profile.bio}</p>
        </section>
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6 flex-1">
          <h2 className="text-lg font-semibold text-white mb-2">Account Ratings</h2>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-6 h-6 ${star <= Math.round(profile.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'}`} />
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">{profile.rating?.toFixed(1)} / {profile.totalRatings} ratings</p>
        </section>
      </div>

      <h2 className="text-lg font-semibold text-white mb-2">Discover Activity (Total: {discoverJobs.length})</h2>
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium">Vacancy Name</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Vacants</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Recruited</th>
              </tr>
            </thead>
            <tbody>
              {discoverJobs.map((job: any, index: number) => (
                <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30">
                  <td className="py-3 text-zinc-200">{job.title}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right">{job.vacants}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right">{job.recruited}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="text-lg font-semibold text-white mb-2">Campaign Activity (Total: {formatUGX(campaigns.reduce((s: number, c: any) => s + c.amount, 0))})</h2>
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium">Campaign Name</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Members</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Rank</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any, index: number) => (
                <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30">
                  <td className="py-3 text-zinc-200">{c.name}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right">{c.members}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right">{c.rank}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right">{formatUGX(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="text-lg font-semibold text-white mb-2">Market Activity</h2>
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium">Account Name</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Transaction</th>
                <th className="pb-2 text-zinc-500 uppercase tracking-wide font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {marketTransactions.map((t: any, index: number) => (
                <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30">
                  <td className="py-3 text-zinc-200">{t.account}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right capitalize">{t.type}</td>
                  <td className="py-3 text-zinc-300 font-mono text-right">{formatUGX(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ProfileComponent;

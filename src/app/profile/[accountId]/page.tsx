'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage({ params }: { params: { accountId: string } }) {
  const { accountId } = params;
  const [userRating, setUserRating] = useState(0);

  const profile = {
    name: 'John Doe',
    role: 'Employer',
    bio: 'Passionate about building great products and connecting talent with opportunity.',
    dateJoined: '2025-01-15',
    rating: 4.5,
    sales: 12500000,
    invested: 3200000,
  };

  const discoverJobs = [
    { title: 'Social Media Manager', vacants: 3, recruited: 2 },
    { title: 'Frontend Developer', vacants: 5, recruited: 4 },
    { title: 'Graphics Illustrator', vacants: 2, recruited: 0 },
  ];

  const campaigns = [
    { name: 'Brand Awareness Q1', members: 12, rank: 3, amount: 500000 },
    { name: 'Product Launch', members: 8, rank: 1, amount: 1200000 },
  ];

  const marketTransactions = [
    { account: 'Acme Corp', type: 'sold', amount: 850000 },
    { account: 'Beta Inc', type: 'purchased', amount: 420000 },
    { account: 'Gamma Ltd', type: 'sold', amount: 1100000 },
  ];

  const handleRate = (rating: number) => {
    setUserRating(rating);
  };

  const formatUGX = (amount: number) => {
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(1)}M`;
    return `UGX ${Math.floor(amount / 1000)}k`;
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <Link href="/discover" className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 underline">
            ← Back to Discover
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        </header>

        {/* Account Summary */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Summary</h2>
          <div className="grid w-full gap-4 md:grid-cols-2">
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Name</p>
              <p className="text-white font-medium">{profile.name}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Account ID</p>
              <p className="text-white font-medium">{accountId}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Role</p>
              <p className="text-white font-medium">{profile.role}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-white font-medium">{profile.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Date Joined</p>
              <p className="text-white font-medium">{profile.dateJoined}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Sales (Total Collected)</p>
              <p className="text-white font-medium">{formatUGX(profile.sales)}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Invested (Campaigns)</p>
              <p className="text-white font-medium">{formatUGX(profile.invested)}</p>
            </div>
          </div>
        </section>

        {/* Discover Activity */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Discover Activity (Total: {discoverJobs.length})</h2>
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
                {discoverJobs.map((job, index) => (
                  <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 text-zinc-200">{job.title}</td>
                    <td className="py-3 text-zinc-300 font-mono text-right">{job.vacants}</td>
                    <td className="py-3 text-zinc-300 font-mono text-right">{job.recruited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Campaign Activity */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Campaign Activity (Total: {formatUGX(campaigns.reduce((s, c) => s + c.amount, 0))})</h2>
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
                {campaigns.map((c, index) => (
                  <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-colors">
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

        {/* Market Activity */}
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Activity (Sold: {formatUGX(marketTransactions.filter(t => t.type === 'sold').reduce((s, t) => s + t.amount, 0))} / Bought: {formatUGX(marketTransactions.filter(t => t.type === 'purchased').reduce((s, t) => s + t.amount, 0))})</h2>
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
                {marketTransactions.map((t, index) => (
                  <tr key={index} className="border-b border-zinc-800/60 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 text-zinc-200">{t.account}</td>
                    <td className="py-3 text-zinc-300 font-mono text-right capitalize">{t.type}</td>
                    <td className="py-3 text-zinc-300 font-mono text-right">{formatUGX(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Account Bio + Rate this account */}
        <div className="flex flex-col min-[500px]:flex-row gap-4">
          <section className="rounded-2xl border border-zinc-800/60 bg-black p-6 flex-1">
            <h2 className="text-lg font-semibold text-white mb-2">Account Bio</h2>
            <p className="text-zinc-300 text-sm">{profile.bio}</p>
          </section>

          <section className="rounded-2xl border border-zinc-800/60 bg-black p-6 flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Rate this account</h2>
                <span className={`ml-2 text-[12px] font-bold ${userRating > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {userRating} / 5
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(star)}
                    className={`w-8 h-8 rounded transition-colors duration-200 ${
                      star <= userRating
                        ? 'text-amber-400 fill-amber-400 stroke-amber-400'
                        : 'text-zinc-700 hover:text-amber-400'
                    }`}
                  >
                    <Star className="w-full h-full fill-current stroke-current" />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                {userRating === 0 ? 'Tap a star to rate this account' : `You rated this account ${userRating} star${userRating > 1 ? 's' : ''}`}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

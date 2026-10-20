'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage({ params }: { params: { accountId: string } }) {
  const { accountId } = params;

  const profile = {
    name: 'John Doe',
    role: 'Employer',
    bio: 'Passionate about building great products and connecting talent with opportunity.',
    dateJoined: '2025-01-15',
    rating: 4.5,
    totalRatings: 12,
    sales: 12500000,
    invested: 3200000,
  };

  const [userRating, setUserRating] = useState(0);
  const [rating, setRating] = useState(profile.rating);
  const [totalRatings, setTotalRatings] = useState(profile.totalRatings);
  const isOwnProfile = accountId === 'acc-employee-1';

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [bioInput, setBioInput] = useState(profile.bio);

  const canEditName = () => {
    const last = localStorage.getItem(`name-edit-${accountId}`);
    if (!last) return true;
    const days = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 365;
  };

  const canEditBio = () => {
    const last = localStorage.getItem(`bio-edit-${accountId}`);
    if (!last) return true;
    const days = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 30;
  };

const [verified, setVerified] = useState(false);
  const [verificationType, setVerificationType] = useState<'kyc' | 'admin' | null>(null);

  const handleVerify = () => {
    setVerified(true);
    setVerificationType('kyc');
  };

  const handleAdminVerify = () => {
    setVerified(true);
    setVerificationType('admin');
  };

  const handleRate = (star: number) => {
    if (isOwnProfile) return;
    const newTotal = totalRatings + 1;
    const newRating = Math.min(4.9, (rating * totalRatings + star) / newTotal);
    setRating(newRating);
    setTotalRatings(newTotal);
    setUserRating(star);
  };

  const saveName = () => {
    if (!canEditName()) return;
    setName(nameInput);
    localStorage.setItem(`name-edit-${accountId}`, new Date().toISOString());
    setEditingName(false);
  };

  const saveBio = () => {
    if (!canEditBio()) return;
    setBio(bioInput);
    localStorage.setItem(`bio-edit-${accountId}`, new Date().toISOString());
    setEditingBio(false);
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

  const formatUGX = (amount: number) => {
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(1)}M`;
    return `UGX ${Math.floor(amount / 1000)}k`;
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="space-y-2">
          <Link href="/discover" className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 underline">
            ← Back to Discover
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            {verified && (
              <span className={verificationType === 'kyc' ? 'text-green-500' : 'text-amber-400'} title={verificationType === 'kyc' ? 'KYC Verified' : 'Admin Verified'}>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
            )}
            {!verified && isOwnProfile && (
              <div className="flex gap-2">
                <button onClick={handleVerify} className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase rounded-lg hover:bg-green-500/20 transition-colors">
                  KYC Verify
                </button>
                <button onClick={handleAdminVerify} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase rounded-lg hover:bg-amber-500/20 transition-colors">
                  Admin Verify
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Account Summary */}
        <h2 className="text-lg font-semibold text-white mb-2">Account Summary</h2>
        <section className="rounded-2xl border border-zinc-800/60 bg-black p-6">
          <div className="grid w-full gap-3 md:grid-cols-2">
            <div className="bg-zinc-900/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Name</p>
              {isOwnProfile && editingName ? (
                <div className="flex gap-2">
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="bg-zinc-800 text-white text-sm rounded px-2 py-1 flex-1" />
                  <button onClick={saveName} className="text-emerald-400 text-xs">Save</button>
                  <button onClick={() => setEditingName(false)} className="text-zinc-500 text-xs">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{name}</p>
                  {isOwnProfile && canEditName() && (
                    <button onClick={() => { setNameInput(name); setEditingName(true); }} className="text-blue-400 text-xs">Edit</button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Role</p>
              <p className="text-white font-medium">{profile.role}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-white font-medium">{rating.toFixed(1)} / {totalRatings}</span>
              </div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Date Joined</p>
              <p className="text-white font-medium">{profile.dateJoined}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Sales (Total Collected)</p>
              <p className="text-white font-medium">{formatUGX(profile.sales)}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Invested (Campaigns)</p>
              <p className="text-white font-medium">{formatUGX(profile.invested)}</p>
            </div>
          </div>
        </section>

        {/* Discover Activity */}
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
        <h2 className="text-lg font-semibold text-white mb-2">Campaign Activity (Total: {formatUGX(campaigns.reduce((s, c) => s + c.amount, 0))})</h2>
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
        <h2 className="text-lg font-semibold text-white mb-2">Market Activity (Sold: {formatUGX(marketTransactions.filter(t => t.type === 'sold').reduce((s, t) => s + t.amount, 0))} / Bought: {formatUGX(marketTransactions.filter(t => t.type === 'purchased').reduce((s, t) => s + t.amount, 0))})</h2>
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
            {isOwnProfile && editingBio ? (
              <div className="space-y-2">
                <textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} maxLength={250} rows={3} className="w-full bg-zinc-800 text-white text-sm rounded px-2 py-1" />
                <div className="flex gap-2">
                  <button onClick={saveBio} className="text-emerald-400 text-xs">Save</button>
                  <button onClick={() => setEditingBio(false)} className="text-zinc-500 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-zinc-300 text-sm">{bio}</p>
                {isOwnProfile && canEditBio() && (
                  <button onClick={() => { setBioInput(bio); setEditingBio(true); }} className="text-blue-400 text-xs mt-2">Edit Bio</button>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-800/60 bg-black p-6 flex-1">
            <div className="flex flex-col gap-4">
<div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{isOwnProfile ? 'Account Ratings' : 'Rate this account'}</h2>
                <span className={`ml-2 text-[12px] font-bold ${userRating > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {rating.toFixed(1)} / {totalRatings}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(star)}
                    disabled={isOwnProfile}
                    className={`w-8 h-8 rounded transition-colors duration-200 ${
                      star <= Math.round(rating)
                        ? 'text-amber-400 fill-amber-400 stroke-amber-400'
                        : 'text-zinc-700'
                    } ${isOwnProfile ? 'cursor-default' : 'hover:text-amber-400'}`}
                  >
                    <Star className="w-full h-full fill-current stroke-current" />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                {isOwnProfile
                  ? `This account has a rating of ${rating.toFixed(1)} from ${totalRatings} rating${totalRatings > 1 ? 's' : ''}`
                  : userRating === 0
                  ? 'Tap a star to rate this account'
                  : `You rated this account ${userRating} star${userRating > 1 ? 's' : ''}`}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

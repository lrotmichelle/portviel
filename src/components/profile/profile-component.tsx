'use client';

import { CheckCircle, CircleUserRound, LoaderCircle, Pencil, ShieldCheck, Star, UserRoundPen } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProfileData = {
  name: string;
  username: string | null;
  bio: string;
  role: string;
  isVerified: boolean;
  nameLocked: boolean;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected' | string;
  joinedAt: string;
  income: number;
  invested: number;
  rating: number;
  totalRatings: number;
  ratingCap: number;
  discoverJobs: { id: number; title: string; vacants: number; recruited: number }[];
  campaigns: { id: number; name: string; members: number; amount: number; status: string }[];
  marketTransactions: { id: number; account: string | number; type: string; amount: number }[];
};

type ProfileComponentProps = {
  userName?: string | null;
  userImage?: string | null;
};

const emptyProfile: ProfileData = {
  name: '', username: null, bio: '', role: 'user', isVerified: false,
  nameLocked: false, kycStatus: 'not_started', joinedAt: '', income: 0, invested: 0,
  rating: 0, totalRatings: 0, ratingCap: 3.5, discoverJobs: [], campaigns: [], marketTransactions: [],
};

function RatingStars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className={`relative inline-block ${size}`}>
            <Star className={`absolute inset-0 ${size} fill-zinc-800 text-zinc-700`} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`max-w-none ${size} fill-amber-400 text-amber-400`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function formatUGX(amount: number) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency', currency: 'UGX', maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function ProfileComponent({ userName, userImage }: ProfileComponentProps) {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [requestingKyc, setRequestingKyc] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [legalNameInput, setLegalNameInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/profile', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your profile.');
        return response.json() as Promise<ProfileData>;
      })
      .then((data) => {
        if (!active) return;
        const nextProfile = { ...emptyProfile, ...data, name: data.name || userName || 'Member' };
        setProfile(nextProfile);
        setNameInput(nextProfile.name);
        setUsernameInput(nextProfile.username ?? '');
        setBioInput(nextProfile.bio);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [userName]);

  const saveProfile = async (fields: { name?: string; username?: string; bio?: string }) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save profile.');
      setProfile((current) => ({ ...current, ...result }));
      if (fields.name !== undefined || fields.username !== undefined) setEditing(false);
      if (fields.bio !== undefined) setEditingBio(false);
      setMessage('Profile updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const requestKycReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestingKyc(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/profile/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legalName: legalNameInput }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit identity review.');
      setProfile((current) => ({ ...current, kycStatus: 'pending' }));
      setLegalNameInput('');
      setMessage(result.message || 'Identity review submitted.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit identity review.');
    } finally {
      setRequestingKyc(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-zinc-950 p-8 text-zinc-400"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading your profile…</div>;
  }

  const joinedLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'New to PortVille';
  const handle = profile.username ? `@${profile.username}` : '@yourname';

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/60 p-6 shadow-2xl shadow-black/30 sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.22),transparent_48%)]" />
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
            <div className="h-full w-full overflow-hidden rounded-full border-2 border-emerald-300/60 bg-zinc-800 ring-4 ring-emerald-300/10">
              {userImage ? (
                // Google profile image comes from the active Auth.js session.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={`${profile.name} profile`} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-emerald-200"><CircleUserRound className="h-12 w-12" /></div>
              )}
            </div>
            {profile.isVerified && <span aria-label="Identity verified" title="Identity verified" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-zinc-950 bg-emerald-400 text-zinc-950"><CheckCircle className="h-4 w-4" strokeWidth={3} /></span>}
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-zinc-400">Display name
                  <input value={nameInput} onChange={(event) => setNameInput(event.target.value)} maxLength={255} disabled={profile.nameLocked} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50" />
                  {profile.nameLocked && <span className="mt-1 block text-[11px] text-amber-200/70">Verified legal name. Contact support to request a correction.</span>}
                </label>
                <label className="text-xs text-zinc-400">Username
                  <div className="mt-1 flex items-center rounded-xl border border-white/10 bg-black/40 px-3 focus-within:border-emerald-400"><span className="text-zinc-500">@</span><input value={usernameInput} onChange={(event) => setUsernameInput(event.target.value)} maxLength={24} placeholder="yourname" className="w-full bg-transparent px-2 py-2.5 text-sm text-white outline-none" /></div>
                </label>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="button" disabled={saving} onClick={() => void saveProfile({ name: profile.nameLocked ? undefined : nameInput, username: usernameInput })} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
                  <button type="button" onClick={() => { setNameInput(profile.name); setUsernameInput(profile.username ?? ''); setEditing(false); }} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">Cancel</button>
                </div>
                <p className="text-xs text-zinc-500 sm:col-span-2">Username: 3–24 characters, starts with a letter; letters, numbers, dots, and underscores only.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{profile.name || userName || 'Member'}</h1>
                  {profile.isVerified && <CheckCircle aria-label="Verified identity" className="h-5 w-5 fill-emerald-400/15 text-emerald-300" strokeWidth={2.6} />}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-emerald-200">{handle}</span>
                  {profile.isVerified && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200"><ShieldCheck className="h-3 w-3" /> Verified</span>}
                </div>
                <p className="mt-3 text-sm text-zinc-400">On PortVille since {joinedLabel}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-emerald-300/40 hover:bg-white/5"><Pencil className="h-3.5 w-3.5" /> Edit profile</button>
                  {profile.nameLocked && <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Legal name locked</span>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Income</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatUGX(profile.income)}</p>
            <p className="mt-1 text-xs text-zinc-500">Recorded completed earnings</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Campaign investment</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatUGX(profile.invested)}</p>
            <p className="mt-1 text-xs text-zinc-500">Budget used on campaigns you created</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">About</p><h2 className="mt-1 text-xl font-semibold text-white">A little about you</h2></div>
          {!editingBio && <button type="button" onClick={() => { setBioInput(profile.bio); setEditingBio(true); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-emerald-300/40 hover:bg-white/5"><UserRoundPen className="h-3.5 w-3.5" /> Edit bio</button>}
        </div>
        {editingBio ? (
          <div className="mt-4 space-y-3">
            <textarea value={bioInput} onChange={(event) => setBioInput(event.target.value)} maxLength={400} rows={4} placeholder="Share a few details about yourself…" className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400" />
            <div className="flex items-center justify-between"><span className="text-xs text-zinc-500">{bioInput.length}/400</span><div className="flex gap-2"><button type="button" disabled={saving} onClick={() => void saveProfile({ bio: bioInput })} className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 disabled:opacity-50">{saving ? 'Saving…' : 'Save bio'}</button><button type="button" onClick={() => setEditingBio(false)} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-300">Cancel</button></div></div>
          </div>
        ) : (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{profile.bio || 'Add a short introduction so the PortVille community can learn more about you.'}</p>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">Community reputation</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Account ratings</h2>
            <p className="mt-1 text-xs text-zinc-500">{profile.totalRatings} {profile.totalRatings === 1 ? 'rating' : 'ratings'} · {profile.isVerified ? 'verified profile cap' : 'unverified profile cap'} {profile.ratingCap.toFixed(1)}</p>
          </div>
          <div className="flex items-center gap-3"><RatingStars value={profile.rating} size="h-6 w-6" /><span className="text-xl font-bold text-white">{profile.rating.toFixed(1)}<span className="text-sm font-medium text-zinc-500"> / 5</span></span></div>
        </div>
        <p className="mt-4 border-t border-white/10 pt-4 text-xs text-zinc-500">Ratings are submitted by other PortVille members. The maximum displayed score for this {profile.isVerified ? 'verified' : 'unverified'} profile is {profile.ratingCap.toFixed(1)}.</p>
      </section>

      <section className="space-y-5" aria-label="Account activity">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Your PortVille footprint</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Discover, Campaign &amp; Market activity</h2>
        </div>

        <section className="rounded-3xl border border-white/10 bg-black p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Discover</p><h3 className="mt-1 text-lg font-semibold text-white">Jobs &amp; hiring</h3></div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{profile.discoverJobs.length} listings</span>
          </div>
          {profile.discoverJobs.length === 0 ? <p className="text-sm text-zinc-500">No Discover activity yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm">
              <thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-zinc-500"><th className="pb-3 font-medium">Vacancy</th><th className="pb-3 text-right font-medium">Open roles</th><th className="pb-3 text-right font-medium">Recruited</th></tr></thead>
              <tbody>{profile.discoverJobs.map((job) => <tr key={job.id} className="border-b border-white/5 last:border-0"><td className="py-3 pr-4 font-medium text-zinc-200">{job.title}</td><td className="py-3 text-right font-mono text-zinc-300">{job.vacants}</td><td className="py-3 text-right font-mono text-emerald-300">{job.recruited}</td></tr>)}</tbody>
            </table></div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">Campaign</p><h3 className="mt-1 text-lg font-semibold text-white">Campaign activity</h3></div>
            <span className="text-sm font-semibold text-amber-200">{formatUGX(profile.campaigns.reduce((total, campaign) => total + campaign.amount, 0))}</span>
          </div>
          {profile.campaigns.length === 0 ? <p className="text-sm text-zinc-500">No campaigns created yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm">
              <thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-zinc-500"><th className="pb-3 font-medium">Campaign</th><th className="pb-3 text-right font-medium">Members</th><th className="pb-3 text-right font-medium">Status</th><th className="pb-3 text-right font-medium">Spent</th></tr></thead>
              <tbody>{profile.campaigns.map((campaign) => <tr key={campaign.id} className="border-b border-white/5 last:border-0"><td className="py-3 pr-4 font-medium text-zinc-200">{campaign.name}</td><td className="py-3 text-right font-mono text-zinc-300">{campaign.members}</td><td className="py-3 text-right capitalize text-zinc-400">{campaign.status}</td><td className="py-3 text-right font-mono text-amber-200">{formatUGX(campaign.amount)}</td></tr>)}</tbody>
            </table></div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">Market</p><h3 className="mt-1 text-lg font-semibold text-white">Recent transactions</h3></div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">{profile.marketTransactions.length} transactions</span>
          </div>
          {profile.marketTransactions.length === 0 ? <p className="text-sm text-zinc-500">No Market transactions yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm">
              <thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-zinc-500"><th className="pb-3 font-medium">Listing</th><th className="pb-3 text-right font-medium">Type</th><th className="pb-3 text-right font-medium">Amount</th></tr></thead>
              <tbody>{profile.marketTransactions.map((transaction) => <tr key={transaction.id} className="border-b border-white/5 last:border-0"><td className="py-3 pr-4 font-medium text-zinc-200">{transaction.account}</td><td className="py-3 text-right capitalize text-zinc-400">{transaction.type}</td><td className="py-3 text-right font-mono text-sky-200">{formatUGX(transaction.amount)}</td></tr>)}</tbody>
            </table></div>
          )}
        </section>
      </section>

      {!profile.isVerified && (
        <section className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.04] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">Identity verification</h2>
              {profile.kycStatus === 'pending' ? (
                <p className="mt-2 text-sm leading-6 text-amber-100/80">Your legal name is awaiting review. It will become your profile display name and be locked only after an authorized reviewer verifies it against your ID.</p>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Submit the exact legal name shown on your government ID. A reviewer must check your identity documents before verification is approved.</p>
                  <form onSubmit={requestKycReview} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input value={legalNameInput} onChange={(event) => setLegalNameInput(event.target.value)} required minLength={2} maxLength={255} autoComplete="name" placeholder="Legal name exactly as shown on ID" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-200/50" />
                    <button type="submit" disabled={requestingKyc} className="rounded-xl bg-amber-200 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-100 disabled:opacity-50">{requestingKyc ? 'Submitting…' : 'Request review'}</button>
                  </form>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">Do not upload ID images here. This form records your requested legal name and pending status; verification must be completed through the approved document-review process.</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    </div>
  );
}

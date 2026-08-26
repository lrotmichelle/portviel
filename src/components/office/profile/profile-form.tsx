'use client';

import React, { useState } from 'react';

export default function ProfileForm() {
  const [profile, setProfile] = useState({ name: 'Martha', email: 'martha@example.com', location: 'Kampala, Uganda' });
  const [message, setMessage] = useState('');
  const save = () => setMessage('Profile saved successfully.');

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 lg:col-span-2">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Profile</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">{(['name', 'email', 'location'] as const).map((field) => <label key={field} className="text-xs text-zinc-400"><span className="mb-1 block capitalize">{field}</span><input value={profile[field]} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>)}</div>
      <div className="mt-4 flex gap-2"><button type="button" onClick={save} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">Update profile</button><button type="button" onClick={save} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 hover:border-zinc-500">Create profile</button></div>{message && <p className="mt-2 text-xs text-emerald-400">{message}</p>}
    </section>
  );
}

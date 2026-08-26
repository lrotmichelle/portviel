'use client';

import React, { useState } from 'react';

export default function Resumes() {
  const [resume, setResume] = useState('No resume uploaded');

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Resumes</h2>
      <p className="mt-3 truncate text-sm text-zinc-400">{resume}</p>
      <label className="mt-4 inline-block cursor-pointer rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">Upload resume<input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(event) => setResume(event.target.files?.[0]?.name ?? resume)} /></label>
    </section>
  );
}

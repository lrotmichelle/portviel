'use client';

import React, { useState, useEffect } from 'react';

type ResumeType = 'generated' | 'uploaded';

const STORAGE_KEY = 'user-profile';
const UPLOADED_RESUME_KEY = 'uploaded-resume';
const SELECTED_RESUME_KEY = 'selected-resume';

export default function Resumes() {
  const [profile, setProfile] = useState<{ name?: string }>({});
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeType>('generated');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
    const uploaded = localStorage.getItem(UPLOADED_RESUME_KEY);
    if (uploaded) {
      setUploadedResume(uploaded);
    }
    const selected = localStorage.getItem(SELECTED_RESUME_KEY);
    if (selected === 'uploaded' || selected === 'generated') {
      setSelectedResume(selected);
    }
  }, []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5MB.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedResume(dataUrl);
      localStorage.setItem(UPLOADED_RESUME_KEY, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const selectResume = (type: ResumeType) => {
    setSelectedResume(type);
    localStorage.setItem(SELECTED_RESUME_KEY, type);
  };

  const hasGenerated = Boolean(profile.name);
  const hasUploaded = Boolean(uploadedResume);

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Resumes</h2>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">Active resume:</span>
          <button type="button" onClick={() => selectResume('generated')} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${selectedResume === 'generated' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
            Generated
          </button>
          <button type="button" onClick={() => selectResume('uploaded')} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${selectedResume === 'uploaded' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
            Uploaded
          </button>
        </div>

        {selectedResume === 'generated' && (
          <div className="rounded-xl border border-zinc-700/80 p-3">
            <p className="text-xs text-zinc-400">
              {hasGenerated ? (
                <span>
                  Generated resume for <span className="text-white">{profile.name}</span>. Create or update your profile to regenerate.
                </span>
              ) : (
                <span>No profile data yet. Create your profile to generate a resume.</span>
              )}
            </p>
            {hasGenerated && (
              <a href="#" onClick={(e) => { e.preventDefault(); window.alert('Download generated resume from your profile form.'); }} className="mt-2 inline-block text-[11px] text-emerald-300 underline">Download generated resume</a>
            )}
          </div>
        )}

        {selectedResume === 'uploaded' && (
          <div className="rounded-xl border border-zinc-700/80 p-3">
            {hasUploaded ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Custom resume uploaded.</p>
                <a href={uploadedResume ?? undefined} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-300 underline">View uploaded resume</a>
                <label className="mt-2 inline-block cursor-pointer rounded-lg border border-emerald-500/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">
                  Replace resume
                  <input type="file" accept=".pdf" className="sr-only" onChange={handleUpload} />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">No custom resume uploaded.</p>
                <label className="inline-block cursor-pointer rounded-lg border border-emerald-500/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">
                  Upload PDF resume
                  <input type="file" accept=".pdf" className="sr-only" onChange={handleUpload} />
                </label>
              </div>
            )}
            {uploadError && <p className="mt-2 text-[11px] text-red-400">{uploadError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { ProfileData, emptyProfile } from './profile-data';

type ResumeType = 'generated' | 'uploaded';

const STORAGE_KEY = 'user-profile';
const UPLOADED_RESUME_KEY = 'uploaded-resume';
const SELECTED_RESUME_KEY = 'selected-resume';

export default function Resumes() {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile());
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeType>('generated');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const loadStoredResumes = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch {}
      } else {
        setProfile(emptyProfile());
      }
      setUploadedResume(localStorage.getItem(UPLOADED_RESUME_KEY));
    };

    loadStoredResumes();
    window.addEventListener('profile-updated', loadStoredResumes);
    const selected = localStorage.getItem(SELECTED_RESUME_KEY);
    if (selected === 'uploaded' || selected === 'generated') {
      setSelectedResume(selected);
    }
    return () => window.removeEventListener('profile-updated', loadStoredResumes);
  }, []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
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
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const deleteUploadedResume = () => {
    localStorage.removeItem(UPLOADED_RESUME_KEY);
    if (selectedResume === 'uploaded') {
      setSelectedResume('generated');
      localStorage.setItem(SELECTED_RESUME_KEY, 'generated');
    }
    setUploadedResume(null);
    setUploadError('');
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
                  Saved resume for <span className="text-white">{profile.name}</span>.
                </span>
              ) : (
                <span>No saved profile data yet.</span>
              )}
            </p>
            {hasGenerated && (
              <a href="/office/resume?type=generated" className="mt-2 inline-block text-[11px] text-emerald-300 underline">Preview resume</a>
            )}
          </div>
        )}

        {selectedResume === 'uploaded' && (
          <div className="rounded-xl border border-zinc-700/80 p-3">
            {hasUploaded ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Custom resume uploaded.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="/office/resume?type=uploaded" className="text-[11px] text-emerald-300 underline">View uploaded resume</a>
                  <label className="cursor-pointer text-[11px] text-emerald-300 underline">
                    Replace resume
                    <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleUpload} />
                  </label>
                  <button type="button" onClick={deleteUploadedResume} className="text-[11px] text-red-300 underline">Delete resume</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">No custom resume uploaded.</p>
                <label className="inline-block cursor-pointer rounded-lg border border-emerald-500/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">
                  Upload PDF resume
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleUpload} />
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

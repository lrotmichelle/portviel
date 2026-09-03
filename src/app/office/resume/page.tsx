'use client';

import React, { useEffect, useState } from 'react';
import { ProfileData, emptyProfile } from '@/components/office/profile/profile-data';

const PROFILE_KEY = 'user-profile';
const UPLOADED_RESUME_KEY = 'uploaded-resume';

type ResumeType = 'generated' | 'uploaded';

export default function ResumePreviewPage() {
  const [type, setType] = useState<ResumeType>('generated');
  const [profile, setProfile] = useState<ProfileData>(emptyProfile());
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setType(params.get('type') === 'uploaded' ? 'uploaded' : 'generated');

    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch {}
    }
    setUploadedResume(localStorage.getItem(UPLOADED_RESUME_KEY));
  }, []);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Resume</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{type === 'uploaded' ? 'Uploaded resume' : 'Profile resume'}</h1>
          </div>
          <a href="/office" className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 hover:border-zinc-500">Back to office</a>
        </div>

        {type === 'uploaded' ? (
          uploadedResume ? (
            <iframe title="Uploaded PDF resume" src={uploadedResume} className="h-[75vh] w-full rounded-2xl border border-zinc-800 bg-white" />
          ) : (
            <EmptyState message="No uploaded PDF resume was found." />
          )
        ) : (
          <GeneratedResume profile={profile} />
        )}
      </div>
    </main>
  );
}

function GeneratedResume({ profile }: { profile: ProfileData }) {
  const hasProfile = Boolean(profile.name || profile.about || profile.email || profile.experiences.length || profile.softSkills.length || profile.achievements || profile.education || profile.references.length);

  if (!hasProfile) return <EmptyState message="No saved profile data was found. Save your profile in the Office first." />;

  return (
    <article className="rounded-2xl bg-white p-6 text-zinc-900 shadow-2xl sm:p-10">
      <header className="border-b border-zinc-200 pb-5 text-center">
        <h2 className="text-3xl font-bold">{profile.name || 'Profile'}</h2>
        <p className="mt-2 text-sm text-zinc-600">{[profile.email, profile.phone, profile.address].filter(Boolean).join(' • ')}</p>
      </header>
      {profile.about && <ResumeSection title="About"><p>{profile.about}</p></ResumeSection>}
      {profile.experiences.length > 0 && <ResumeSection title="Experience"><div className="space-y-4">{profile.experiences.map((experience) => <div key={experience.id}><h3 className="font-semibold">{experience.period || 'Experience'}</h3><p className="mt-1 whitespace-pre-wrap text-zinc-700">{experience.description}</p></div>)}</div></ResumeSection>}
      {profile.softSkills.length > 0 && <ResumeSection title="Soft skills"><p>{profile.softSkills.join(', ')}</p></ResumeSection>}
      {profile.achievements && <ResumeSection title="Achievements"><p className="whitespace-pre-wrap">{profile.achievements}</p></ResumeSection>}
      {profile.education && <ResumeSection title="Education"><p className="whitespace-pre-wrap">{profile.education}</p></ResumeSection>}
      {profile.references.length > 0 && <ResumeSection title="References"><div className="space-y-2">{profile.references.map((reference) => <p key={reference.id}>{[reference.name, reference.email, reference.phone].filter(Boolean).join(' • ')}</p>)}</div></ResumeSection>}
    </article>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-6"><h2 className="border-b border-zinc-200 pb-2 text-sm font-bold uppercase tracking-[0.16em] text-zinc-700">{title}</h2><div className="mt-3 text-sm leading-6">{children}</div></section>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-zinc-800 p-6 text-sm text-zinc-400">{message}</div>;
}

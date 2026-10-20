'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobCard from '@/components/job-card';
import Grid from '@/components/layout/grid';
import type { JobOffer } from '@/components/job-card/data';
import { mockJobs } from '@/components/job-card/data';

interface VacancyItem {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  createdAt: unknown;
}

export default function ManageVacanciesPage() {
  const [items, setItems] = useState<VacancyItem[]>([]);
  const [ownJobs, setOwnJobs] = useState<JobOffer[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/secure');
        const payload = await response.json();
        setItems(payload.vacancies ?? []);
      } catch (error) {
        console.error('Unable to load vacancies', error);
      }
    };

    load();

    const loadOwnJobs = () => {
      const stored = localStorage.getItem('employer-jobs');
      const storedJobs: JobOffer[] = stored ? JSON.parse(stored) : [];
      const currentEmployerId = 'acc-employer-1';
      const mockEmployerJobs = mockJobs.filter((job) => job.employerAccountId === currentEmployerId);
      setOwnJobs([...storedJobs, ...mockEmployerJobs]);
    };

    const loadAppliedJobs = () => {
      const stored = localStorage.getItem('applied-jobs');
      if (stored) {
        try {
          setAppliedJobIds(JSON.parse(stored));
        } catch {}
      }
    };

    loadOwnJobs();
    loadAppliedJobs();

    // Poll for new jobs created from discover page
    const interval = setInterval(() => {
      loadOwnJobs();
      loadAppliedJobs();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyJob = () => {
    // Employer viewing their own jobs - no apply action needed
  };

  const appliedJobsList = mockJobs.filter((job) => appliedJobIds[job.id]);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
          <h1 className="text-3xl font-bold">Vacancies</h1>
        </div>
        <Link href="/discover" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">Back</Link>
      </div>

      {/* Own jobs as cards */}
      {ownJobs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Posted Jobs</h2>
          <Grid>
            {ownJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={handleApplyJob} />
            ))}
          </Grid>
        </div>
      )}

      {/* My Applications as cards */}
      {appliedJobsList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">My Applications</h2>
          <Grid>
            {appliedJobsList.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApplyJob}
                applicationStatus={appliedJobIds[job.id]}
              />
            ))}
          </Grid>
        </div>
      )}

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-sm text-zinc-400">No vacancies published yet.</div>
        ) : items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-400">{item.category}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">Posted by {item.createdBy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobCard from '@/components/job-card';
import Grid from '@/components/layout/grid';
import type { JobOffer } from '@/components/job-card/data';
import { mockJobs } from '@/components/job-card/data';
import EditVacancyModal from '@/components/layout/edit-vacancy-modal';

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
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
        const currentAccountId = 'acc-employee-1';
        const mockEmployerJobs = mockJobs.filter((job) => job.employerAccountId === currentAccountId);
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
const handleEditJob = (job: any) => {
    const now = Date.now();
    const lastEdit = job.lastEditedAt ? new Date(job.lastEditedAt).getTime() : new Date(job.createdAt || now).getTime();
    const daysSinceEdit = (now - lastEdit) / (1000 * 60 * 60 * 24);
    const maxEdits = (job.daysRemaining || 14) >= 21 ? 2 : 1;
    const editsUsed = job.editCount || 0;

    if (editsUsed >= maxEdits) {
      alert('Edit limit reached for this vacancy.');
      return;
    }
    if (maxEdits === 2 && daysSinceEdit < 7) {
      alert('You can edit again after 7 days from your last edit.');
      return;
    }

    setEditingJob(job);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (updatedJob: any) => {
    const now = new Date().toISOString();
    const updated = {
      ...updatedJob,
      editCount: (updatedJob.editCount || 0) + 1,
      lastEditedAt: now,
    };
    setOwnJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    const stored = localStorage.getItem('employer-jobs');
    if (stored) {
      const jobs: JobOffer[] = JSON.parse(stored);
      const updatedJobs = jobs.map((j) => (j.id === updated.id ? updated : j));
      localStorage.setItem('employer-jobs', JSON.stringify(updatedJobs));
    }
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
          <h2 className="text-lg font-semibold mb-4">Vacancies ({ownJobs.length})</h2>
          <Grid>
{ownJobs.map((job: any) => {
            const now = Date.now();
            const lastEdit = job.lastEditedAt ? new Date(job.lastEditedAt).getTime() : new Date(job.createdAt || now).getTime();
            const daysSinceEdit = (now - lastEdit) / (1000 * 60 * 60 * 24);
            const maxEdits = (job.daysRemaining || 14) >= 21 ? 2 : 1;
            const editsUsed = job.editCount || 0;
            const canEdit = editsUsed < maxEdits && !(maxEdits === 2 && daysSinceEdit < 7);
            return (
              <JobCard key={job.id} job={job} onApply={handleApplyJob} onEdit={handleEditJob} currentAccount={{ type: 'employee', id: 'acc-employee-1' }} canEdit={canEdit} />
            );
          })}
          </Grid>
        </div>
      )}

      {/* My Applications as cards */}
      {appliedJobsList.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">My Applications ({appliedJobsList.length})</h2>
          <Grid>
            {appliedJobsList.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApplyJob}
                applicationStatus={appliedJobIds[job.id]}
                currentAccount={{ type: 'employee', id: 'acc-employee-1' }}
              />
            ))}
          </Grid>
        </div>
      )}

      <EditVacancyModal
        isOpen={isEditOpen}
        job={editingJob}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

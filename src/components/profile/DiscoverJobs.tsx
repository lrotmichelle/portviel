'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Briefcase, CheckCircle2, MapPin, UserPlus, UserRound } from 'lucide-react';
import { formatCompactNumber } from '@/lib/currency';

export interface DiscoverJob {
  id: string;
  title: string;
  description: string;
  location: string;
  employerName: string;
  employerAccountId: string;
  requiredPeople: number;
  applicants: number;
  accepted: number;
  status: 'active' | 'paused' | 'closed' | string;
  minSalary: number;
  maxSalary: number;
  salaryPeriod: 'day' | 'week' | 'month' | string;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

interface DiscoverJobsProps {
  jobs: DiscoverJob[];
  currentAccountId?: string;
  canReviewApplicants?: boolean;
  onApply?: (job: DiscoverJob) => void | Promise<void>;
  onToggleStatus?: (jobId: string, status: 'apply' | 'paused') => Promise<void>;
}

interface Applicant {
  id: number;
  name: string;
  username: string | null;
  status: string;
  appliedAt: string;
}

const statusStyles = (status: string) => {
  if (status === 'active') return 'bg-emerald-500/10 text-emerald-300';
  if (status === 'paused') return 'bg-amber-500/10 text-amber-300';
  return 'bg-rose-500/10 text-rose-300';
};

export function DiscoverJobs({ jobs, canReviewApplicants = false, onApply, onToggleStatus }: DiscoverJobsProps) {
  const [selectedJob, setSelectedJob] = useState<DiscoverJob | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [applicantError, setApplicantError] = useState('');

  const openApplicants = async (job: DiscoverJob) => {
    setSelectedJob(job);
    setApplicants([]);
    setApplicantError('');
    setIsLoadingApplicants(true);
    try {
      const response = await fetch(`/api/discover/${encodeURIComponent(job.id)}/applications`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load applications.');
      setApplicants(payload.applications ?? []);
    } catch (error) {
      setApplicantError(error instanceof Error ? error.message : 'Unable to load applications.');
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400"><Briefcase className="h-4 w-4 text-emerald-400" />Jobs created (0)</div>
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/70 py-8 text-center text-xs text-zinc-500">No jobs created yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const avatarCount = Math.min(job.applicants, 3);
        const persistedJob = /^\d+$/.test(job.id);
        const borderColor = job.status === 'active' ? 'border-emerald-500/60' : job.status === 'paused' ? 'border-amber-500/60' : 'border-rose-500/60';
        return (
          <article key={job.id} className={`space-y-3 rounded-xl border bg-zinc-950/70 p-3.5 ${borderColor}`}>
            <header className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="inline-flex max-w-full break-words rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold leading-4 text-emerald-300">{job.title}</h3>
                <p className="mt-1 truncate text-base font-bold leading-5 text-white">{job.employerName}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${statusStyles(job.status)}`}>{job.status}</span>
            </header>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-white"><MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" /><span className="truncate">{job.location || 'Location not specified'}</span></div>
              <p className="shrink-0 text-xs font-semibold text-emerald-300">
                {job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary ? (
                  <>{formatCompactNumber(job.minSalary)} <span className="text-amber-400">–</span> {formatCompactNumber(job.maxSalary)} UGX</>
                ) : job.minSalary || job.maxSalary ? `${formatCompactNumber(job.maxSalary || job.minSalary)} UGX` : 'Pay negotiable'}
                {' / '}{job.salaryPeriod === 'day' ? 'd' : job.salaryPeriod === 'week' ? 'w' : 'm'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1 border-y border-zinc-900 py-2 text-center">
              <div><p className="text-sm font-bold text-amber-300">{formatCompactNumber(job.requiredPeople)}</p><p className="text-[9px] uppercase tracking-wider text-zinc-500">Required</p></div>
              <div className="border-x border-zinc-800"><p className="text-sm font-bold text-white">{formatCompactNumber(job.applicants)}</p><p className="text-[9px] uppercase tracking-wider text-zinc-500">Applicants</p></div>
              <div><p className="flex items-center justify-center gap-1 text-sm font-bold text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />{formatCompactNumber(job.accepted)}</p><p className="text-[9px] uppercase tracking-wider text-zinc-500">Accepted</p></div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="relative inline-flex items-center">
                <span className="flex items-center" aria-hidden="true">
                {Array.from({ length: avatarCount }, (_, index) => (
                  <span key={index} className={`-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-950 bg-gradient-to-br ${['from-emerald-500/40 to-teal-900', 'from-sky-500/40 to-blue-900', 'from-amber-500/40 to-orange-900', 'from-violet-500/40 to-purple-900'][index]} first:ml-0`} title="Applicant profile">
                    <UserRound className="h-3.5 w-3.5 text-zinc-200" />
                  </span>
                ))}
                </span>
                <span className="ml-1.5 flex items-center text-[9px] font-bold text-zinc-400">+{formatCompactNumber(Math.max(0, job.applicants - avatarCount))} applicants</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {canReviewApplicants && (
                  <Link href={`/manage/vacancies?jobId=${encodeURIComponent(job.id)}`} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
                    <UserPlus className="h-3.5 w-3.5" /> Review cvs
                  </Link>
                )}
                {canReviewApplicants && persistedJob && onToggleStatus && job.status !== 'closed' && (
                  <button type="button" onClick={() => void onToggleStatus(job.id, job.status === 'paused' ? 'apply' : 'paused')} className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${job.status === 'paused' ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white' : 'border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-white'}`}>
                    {job.status === 'paused' ? 'Resume applications' : 'Pause applications'}
                  </button>
                )}
                {!canReviewApplicants && (
                  <button
                    type="button"
                    onClick={() => !job.applicationStatus && job.status === 'active' && void onApply?.(job)}
                    disabled={Boolean(job.applicationStatus) || job.status !== 'active'}
                    className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${job.applicationStatus === 'accepted' ? 'border-emerald-500/40 text-emerald-300' : job.applicationStatus === 'rejected' ? 'border-rose-500/40 text-rose-300' : job.applicationStatus === 'pending' ? 'border-amber-500/40 text-amber-300' : job.status !== 'active' ? 'border-zinc-700 text-zinc-500' : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white'}`}
                  >
                    {job.applicationStatus ? job.applicationStatus : job.status === 'active' ? 'Apply now' : job.status === 'paused' ? 'Applications paused' : 'Closed'}
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="presentation" onClick={() => setSelectedJob(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="applicants-dialog-title" onClick={(event) => event.stopPropagation()} className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-zinc-800 p-4">
              <div className="min-w-0"><h2 id="applicants-dialog-title" className="text-sm font-bold text-white">Applications</h2><p className="mt-1 truncate text-xs text-zinc-400">{selectedJob.title} · {selectedJob.employerName}</p></div>
              <button type="button" onClick={() => setSelectedJob(null)} className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white">Close</button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {isLoadingApplicants ? <p className="py-8 text-center text-xs text-zinc-400">Loading applicants…</p> : applicantError ? <p role="alert" className="py-6 text-center text-xs text-rose-300">{applicantError}</p> : applicants.length === 0 ? <p className="py-8 text-center text-xs text-zinc-500">No applications have been submitted yet.</p> : (
                <ul className="space-y-2">
                  {applicants.map((applicant) => (
                    <li key={applicant.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300">{applicant.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-white">{applicant.name}</span>
                        <span className="block truncate text-[10px] text-zinc-500">{selectedJob.title} · {selectedJob.location} · Applied {new Date(applicant.appliedAt).toLocaleDateString()}</span>
                      </span>
                      <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-semibold uppercase text-amber-300">{applicant.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

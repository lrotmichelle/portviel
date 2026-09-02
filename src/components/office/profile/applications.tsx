'use client';

import React, { useState } from 'react';

import { hrApplications } from './hire-data';
import { myApplications } from './applications-data';

export default function Applications() {
  const [reviews, setReviews] = useState(hrApplications);
  const [showAllHr, setShowAllHr] = useState(false);
  const [showAllMy, setShowAllMy] = useState(false);

  const hrStatusColor = (status: string) => {
    if (status === 'Accepted') return 'text-emerald-300';
    if (status === 'Rejected') return 'text-red-300';
    return 'text-amber-300';
  };

  const myStatusColor = (status: string) => {
    if (status === 'Accepted') return 'text-emerald-300';
    if (status === 'Rejected') return 'text-red-300';
    return 'text-amber-300';
  };

  return (
    <section className="rounded-2xl bg-black p-5 lg:col-span-3 overflow-visible max-[500px]:p-0 no-scrollbar">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Applications</h2>
      <div className="mt-4 grid w-full gap-6">
        <div className="w-full min-w-0">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Hire applications</h3>
            <button
              type="button"
              onClick={() => setShowAllHr((prev) => !prev)}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300 hover:text-red-200"
            >
              {showAllHr ? 'View less' : 'View all'}
            </button>
          </div>
          <div className={`${showAllHr ? 'overflow-x-auto' : 'overflow-visible'} max-[500px]:overflow-visible`}>
            <div className="rounded-xl border border-zinc-700/80 max-[500px]:w-full max-[500px]:mx-[6px]">
              <HireApplications reviews={reviews} setReviews={setReviews} statusColor={hrStatusColor} showAll={showAllHr} />
            </div>
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">My applications</h3>
            <button
              type="button"
              onClick={() => setShowAllMy((prev) => !prev)}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300 hover:text-red-200"
            >
              {showAllMy ? 'View less' : 'View all'}
            </button>
          </div>
          <div className={`${showAllMy ? 'overflow-x-auto' : 'overflow-visible'} max-[500px]:overflow-visible`}>
            <div className="rounded-xl border border-zinc-700/80 max-[500px]:w-full max-[500px]:mx-[6px]">
              <MyApplications statusColor={myStatusColor} showAll={showAllMy} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HireApplications({ reviews, setReviews, statusColor, showAll }: { reviews: typeof hrApplications; setReviews: React.Dispatch<React.SetStateAction<typeof hrApplications>>; statusColor: (status: string) => string; showAll: boolean }) {
  const maxRows = 5;
  const visibleReviews = showAll ? reviews : reviews.slice(0, maxRows);

  return (
    <>
      <div className="hidden max-[500px]:block">
        <div className="divide-y divide-zinc-800/60 max-[500px]:w-full overflow-x-hidden scrollbar-hide">
          {visibleReviews.map((item) => (
            <div key={`${item.date}-${item.applicant}`} className="flex gap-3 px-3 py-2 max-[500px]:px-1.5">
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] font-medium text-zinc-300">{item.date}</p>
                <p className="text-[10px] text-zinc-500">{item.time}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.applicant}</p>
                <p className="truncate text-[11px] text-zinc-400">{item.role}</p>
              </div>
              <div className="flex-shrink-0">
                {item.status === 'Accepted' && <span className={`text-base ${statusColor(item.status)}`}>✓</span>}
                {item.status === 'Rejected' && <span className={`text-base ${statusColor(item.status)}`}>×</span>}
                {item.status === 'Review' && (
                  <a href={item.resume} className="text-[11px] text-emerald-300 underline">
                    Resume
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-[500px]:hidden">
        <div className={`${showAll ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden'} ${showAll ? 'max-h-[200px] overflow-y-auto scrollbar-hide' : ''}`}>
            <table className="min-w-[600px] w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500">
                  <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Date</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Time</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Applicant</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Role</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Resume to review</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleReviews.map((item) => (
                  <tr key={`${item.date}-${item.applicant}`} className="border-t border-zinc-800/60">
                    <td className="px-3 py-2 text-zinc-400">{item.date}</td>
                    <td className="px-3 py-2 text-zinc-400">{item.time}</td>
                    <td className="px-3 py-2 text-white">{item.applicant}</td>
                    <td className="px-3 py-2 text-zinc-200">{item.role}</td>
                    <td className="px-3 py-2 text-emerald-300 underline">{item.resume}</td>
                    <td className="px-3 py-2">
                      {item.status === 'Review' ? (
                        <span className="flex gap-2">
                          <button type="button" aria-label={`Accept ${item.applicant}`} onClick={() => setReviews((current) => current.map((row) => row.applicant === item.applicant ? { ...row, status: 'Accepted' } : row))} className="text-base text-emerald-400">✓</button>
                          <button type="button" aria-label={`Reject ${item.applicant}`} onClick={() => setReviews((current) => current.map((row) => row.applicant === item.applicant ? { ...row, status: 'Rejected' } : row))} className="text-base text-red-400">×</button>
                        </span>
                      ) : (
                        <span className={statusColor(item.status)}>{item.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </>
  );
}

function MyApplications({ statusColor, showAll }: { statusColor: (status: string) => string; showAll: boolean }) {
  const maxRows = 5;
  const visibleApplications = showAll ? myApplications : myApplications.slice(0, maxRows);

  return (
    <>
      <div className="hidden max-[500px]:block">
        <div className="divide-y divide-zinc-800/60 max-[500px]:w-full overflow-x-hidden scrollbar-hide">
          {visibleApplications.map((item, index) => (
            <div key={`${item.date}-${index}`} className="flex gap-3 px-3 py-2 max-[500px]:px-1.5">
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] font-medium text-zinc-300">{item.date}</p>
                <p className="text-[10px] text-zinc-500">{item.time}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.role}</p>
                <p className="truncate text-[11px] text-zinc-400">{item.employer}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-xs font-medium ${statusColor(item.status)}`}>
                  {item.status === 'Accepted' && '✓'}
                  {item.status === 'Rejected' && '×'}
                  {item.status === 'Pending' && 'Pending'}
                </span>
                <p className="text-[10px] text-zinc-500">Resume: {item.resumeType}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-[500px]:hidden">
        <div className={`${showAll ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden'} ${showAll ? 'max-h-[200px] overflow-y-auto scrollbar-hide' : ''}`}>
          <table className="min-w-[400px] w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500">
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Role</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Employer</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Status</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Resume</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map((item, index) => (
                <tr key={`${item.date}-${index}`} className="border-t border-zinc-800/60">
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.role}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.employer}</td>
                  <td className={`whitespace-nowrap px-3 py-2 ${statusColor(item.status)}`}>{item.status}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-400 capitalize">{item.resumeType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

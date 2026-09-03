'use client';

import React, { useState } from 'react';
import { hrApplications } from './hire-data';
import { myApplications } from './applications-data';

const MAX_ROWS = 8;

const statusColor = (status: string) => {
  if (status === 'accepted') return 'text-emerald-300';
  if (status === 'rejected') return 'text-red-300';
  return 'text-amber-300';
};

export default function Applications() {
  const [showAllHr, setShowAllHr] = useState(false);
  const [showAllMy, setShowAllMy] = useState(false);

  const visibleHr = showAllHr ? hrApplications : hrApplications.slice(0, MAX_ROWS);
  const visibleMy = showAllMy ? myApplications : myApplications.slice(0, MAX_ROWS);

  return (
    <section className="rounded-2xl bg-black p-5 lg:col-span-3 overflow-visible no-scrollbar">
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
              <HireApplications visible={visibleHr} statusColor={statusColor} />
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
              <MyApplications visible={visibleMy} statusColor={statusColor} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HireApplications({ visible, statusColor }: { visible: typeof hrApplications; statusColor: (status: string) => string }) {
  const resumeLabel = (filename: string) => {
    const base = filename.split('/').pop() || filename;
    if (base.length > 12) return 'Resume';
    return base;
  };

  return (
    <>
      <div className="hidden max-[500px]:block">
        <div className="divide-y divide-zinc-800/60">
          {visible.map((item) => (
            <div key={item.id} className="flex gap-3 px-3 py-2 max-[500px]:px-1.5">
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] font-medium text-zinc-300">{item.date}</p>
                <p className="text-[10px] text-zinc-500">{item.time}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.applicant}</p>
                <p className="truncate text-[11px] text-zinc-400">{item.role}</p>
              </div>
              <div className="flex-shrink-0">
                {item.status === 'pending' ? (
                  <a href={item.resume} className="text-[11px] text-emerald-300 underline">{resumeLabel(item.resume)}</a>
                ) : (
                  <span className={`text-xs font-medium capitalize ${statusColor(item.status)}`}>{item.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-[500px]:hidden">
        <div className={`${visible.length > 4 ? 'max-h-[200px] overflow-y-auto scrollbar-hide' : ''}`}>
          <table className="min-w-[600px] w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500">
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Date</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Time</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Applicant</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Role</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Resume</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-zinc-800/60">
                  <td className="px-3 py-2 text-zinc-400">{item.date}</td>
                  <td className="px-3 py-2 text-zinc-400">{item.time}</td>
                  <td className="px-3 py-2 text-white">{item.applicant}</td>
                  <td className="px-3 py-2 text-zinc-200">{item.role}</td>
                  <td className="px-3 py-2 text-emerald-300 underline">{item.resume}</td>
                  <td className={`px-3 py-2 capitalize ${statusColor(item.status)}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MyApplications({ visible, statusColor }: { visible: typeof myApplications; statusColor: (status: string) => string }) {
  return (
    <>
      <div className="hidden max-[500px]:block">
        <div className="divide-y divide-zinc-800/60">
          {visible.map((item) => (
            <div key={item.id} className="flex gap-3 px-3 py-2 max-[500px]:px-1.5">
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] font-medium text-zinc-300">{item.date}</p>
                <p className="text-[10px] text-zinc-500">{item.time}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.role}</p>
                <p className="truncate text-[11px] text-zinc-400">{item.employer}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-xs font-medium capitalize ${statusColor(item.status)}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-[500px]:hidden">
        <div className={`${visible.length > 4 ? 'max-h-[200px] overflow-y-auto scrollbar-hide' : ''}`}>
          <table className="min-w-[400px] w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500">
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Date</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Time</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Role</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Employer</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-zinc-800/60">
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.date}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.time}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.role}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.employer}</td>
                  <td className={`whitespace-nowrap px-3 py-2 capitalize ${statusColor(item.status)}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

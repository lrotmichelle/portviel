'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';

import { hrApplications } from './hire-data';
import { myApplications } from './applications-data';

type AccountType = 'employer' | 'employee';

export default function Applications() {
  const [currentAccountType, setCurrentAccountType] = useState<AccountType | null>(null);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [reviews, setReviews] = useState(hrApplications);
  const [myApps, setMyApps] = useState(myApplications);
  const [showAllHr, setShowAllHr] = useState(false);
  const [showAllMy, setShowAllMy] = useState(false);

  const hrStatusColor = (status: string) => {
    if (status === 'Accepted') return 'text-emerald-300';
    if (status === 'Rejected') return 'text-red-300';
    return 'text-amber-300';
  };

  const myStatusColor = (status: string) => {
    if (status === 'accepted') return 'text-emerald-300';
    if (status === 'rejected') return 'text-red-300';
    return 'text-amber-300';
  };

  // Filter applications by current account
  const employerHireApps = useMemo(() => {
    return reviews.filter((app) => app.accountType === 'employer' && app.accountId === currentAccountId);
  }, [reviews, currentAccountId]);

  const employeeMyApps = useMemo(() => {
    return myApps.filter((app) => app.accountType === 'employee' && app.accountId === currentAccountId);
  }, [myApps, currentAccountId]);

  const updateStatus = (applicationId: string, newStatus: string) => {
    const hireStatus = (newStatus.charAt(0).toUpperCase() + newStatus.slice(1)) as 'Pending' | 'Accepted' | 'Rejected';
    setReviews((current) =>
      current.map((row) =>
        row.applicationId === applicationId ? { ...row, status: hireStatus } : row
      )
    );
    setMyApps((current) =>
      current.map((row) =>
        row.applicationId === applicationId ? { ...row, status: newStatus as 'pending' | 'accepted' | 'rejected' } : row
      )
    );
  };

  const selectAccount = (type: AccountType, accountId: string) => {
    setCurrentAccountType(type);
    setCurrentAccountId(accountId);
  };

  const isEmployer = currentAccountType === 'employer';
  const isEmployee = currentAccountType === 'employee';

  return (
    <section className="rounded-2xl bg-black p-5 lg:col-span-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Applications</h2>

      {/* Account selector */}
      {!currentAccountType && (
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">View as</h3>
          <button
            type="button"
            onClick={() => selectAccount('employer', 'acc-employer-1')}
            className={`rounded-lg border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${
              currentAccountType === 'employer'
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            Employer
          </button>
          <button
            type="button"
            onClick={() => selectAccount('employee', 'acc-employee-1')}
            className={`rounded-lg border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${
              currentAccountType === 'employee'
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            Employee
          </button>
          <p className="text-[10px] text-zinc-500 ml-2">Account: {currentAccountId || '—'}</p>
        </div>
      )}

      {/* Back to account selector */}
      {currentAccountType && (
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentAccountType(null);
              setCurrentAccountId(null);
            }}
            className="text-[10px] text-emerald-400 underline hover:text-emerald-300"
          >
            ← Switch account
          </button>
          <span className="text-[10px] text-zinc-500">•</span>
          <span className="text-[10px] font-medium text-zinc-300">{currentAccountType.toUpperCase()}</span>
          <span className="text-[10px] text-zinc-500">:</span>
          <span className="text-[10px] text-zinc-400">{currentAccountId}</span>
        </div>
      )}

      <div className="mt-4 grid w-full gap-6 grid-cols-1 lg:grid-cols-2">
        {isEmployer && employerHireApps.length > 0 && (
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
            <div className={`${showAllHr ? 'overflow-x-auto' : 'overflow-hidden'} max-[500px]:overflow-hidden`}>
              <div className="rounded-xl border border-zinc-700/80">
                <HireApplications
                  reviews={employerHireApps}
                  statusColor={hrStatusColor}
                  showAll={showAllHr}
                  updateStatus={updateStatus}
                />
              </div>
            </div>
          </div>
        )}
        {isEmployee && employeeMyApps.length > 0 && (
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
            <div className={`${showAllMy ? 'overflow-x-auto' : 'overflow-hidden'} max-[500px]:overflow-hidden`}>
              <div className="rounded-xl border border-zinc-700/80">
                <MyApplications
                  statusColor={myStatusColor}
                  showAll={showAllMy}
                  updateStatus={updateStatus}
                  myApps={employeeMyApps}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function HireApplications({ reviews, statusColor, showAll, updateStatus }: { reviews: typeof hrApplications; statusColor: (status: string) => string; showAll: boolean; updateStatus: (applicationId: string, newStatus: string) => void }) {
  const maxRows = 5;
  const visibleReviews = showAll ? reviews : reviews.slice(0, maxRows);

  const renderMobileStatus = (item: typeof hrApplications[number]) => {
    if (item.status === 'Pending') {
      return (
        <Link
          href="/office/resume"
          className={`text-xs font-medium ${statusColor(item.status)} underline`}
        >
          Review
        </Link>
      );
    }
    return (
      <Link
        href="/office/resume"
        onClick={(e) => {
          e.preventDefault();
          updateStatus(item.applicationId, item.status.toLowerCase());
        }}
        className={`text-xs font-medium ${statusColor(item.status)} underline hover:text-white`}
      >
        {item.status}
      </Link>
    );
  };

  const renderDesktopStatus = (item: typeof hrApplications[number]) => {
    if (item.status === 'Pending') {
      return (
        <div className="flex flex-col gap-1">
          <Link
            href="/office/resume"
            className="text-xs text-emerald-300 underline hover:text-white"
          >
            Review
          </Link>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item.applicationId, 'accepted');
              }}
              className="text-[10px] text-emerald-400 hover:text-emerald-300"
            >
              Accepted
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item.applicationId, 'rejected');
              }}
              className="text-[10px] text-red-400 hover:text-red-300"
            >
              Rejected
            </button>
          </div>
        </div>
      );
    }
    return (
      <Link
        href="/office/resume"
        onClick={(e) => {
          e.preventDefault();
          updateStatus(item.applicationId, item.status.toLowerCase());
        }}
        className={`text-xs font-medium ${statusColor(item.status)} underline hover:text-white`}
      >
        {item.status}
      </Link>
    );
  };

  return (
    <>
      <div className="hidden max-[500px]:block">
        <div className="divide-y divide-zinc-800/60">
          {visibleReviews.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 px-3">
              <div className="w-20 flex-shrink-0 text-right pr-2 -ml-[10px]">
                <p className="text-[10px] text-zinc-500">{item.date}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.applicant}</p>
                <p className="truncate text-[11px] text-zinc-400">{item.role}</p>
              </div>
              <div className="flex-shrink-0">{renderMobileStatus(item)}</div>
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
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Applicant</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Role</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleReviews.map((item) => (
                <tr key={item.id} className="border-t border-zinc-800/60">
                  <td className="px-3 py-2 text-zinc-400">{item.date}</td>
                  <td className="px-3 py-2 text-white">{item.applicant}</td>
                  <td className="px-3 py-2 text-zinc-200">{item.role}</td>
                  <td className="px-3 py-2">{renderDesktopStatus(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MyApplications({ statusColor, showAll, updateStatus, myApps }: { statusColor: (status: string) => string; showAll: boolean; updateStatus: (applicationId: string, newStatus: string) => void; myApps: typeof myApplications }) {
  const maxRows = 5;
  const visibleApplications = showAll ? myApps : myApps.slice(0, maxRows);

  return (
    <>
      <div className="hidden max-[500px]:block">
        <div className="divide-y divide-zinc-800/60">
          {visibleApplications.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 px-3">
              <div className="w-20 flex-shrink-0 text-right pr-2 -ml-[10px]">
                <p className="text-[10px] text-zinc-500">{item.date}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.role}</p>
                <p className="truncate text-[11px] text-zinc-400">{item.employer}</p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/office/resume"
                  onClick={(e) => {
                    e.preventDefault();
                    updateStatus(item.applicationId, item.status);
                  }}
                  className={`text-xs font-medium ${statusColor(item.status)} underline hover:text-white`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-[500px]:hidden">
        <div className={`${showAll ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden'} ${showAll ? 'max-h-[200px] overflow-y-auto scrollbar-hide' : ''}`}>
          <table className="min-w-[500px] w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500">
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Date</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Role</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Employer</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map((item) => (
                <tr key={item.id} className="border-t border-zinc-800/60">
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-400">{item.date}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.role}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-zinc-200">{item.employer}</td>
                  <td className={`whitespace-nowrap px-3 py-2 ${statusColor(item.status)}`}>
                    <Link
                      href="/office/resume"
                      onClick={(e) => {
                        e.preventDefault();
                        updateStatus(item.applicationId, item.status);
                      }}
                      className="underline hover:text-white"
                    >
                      {item.status}
                    </Link>
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

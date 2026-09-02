'use client';

import React, { useState } from 'react';

const hrApplications = [
  { date: '26|08|26', applicant: 'Aisha N.', role: 'Social media manager', resume: 'Aisha-N.pdf', status: 'Review' },
  { date: '24|08|26', applicant: 'Kibuka Ali', role: 'Campaign creator', resume: 'Kibuka-Ali.pdf', status: 'Review' },
];

const myApplications = [
  { date: '26|08|26', role: 'Presidential campaign', employer: 'PortVille HR', status: 'Pending' },
  { date: '20|08|26', role: 'Growth campaign', employer: 'Martha Media', status: 'Accepted' },
  { date: '15|08|26', role: 'Product launch', employer: 'Market House', status: 'Rejected' },
];

export default function Applications() {
  const [reviews, setReviews] = useState(hrApplications);

  return (
    <section className="rounded-2xl bg-zinc-900/30 p-5 lg:col-span-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Applications</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0"><h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Hire applications</h3><div className="overflow-x-auto rounded-xl border border-zinc-700/80"><table className="min-w-[680px] w-full text-left text-xs"><thead className="text-zinc-500"><tr>{['Date', 'Applicant', 'Role', 'Resume to review', 'Status'].map((header) => <th key={header} className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">{header}</th>)}</tr></thead><tbody>{reviews.map((item) => <tr key={`${item.date}-${item.applicant}`} className="border-t border-zinc-800/60"><td className="px-3 py-2 text-zinc-400">{item.date}</td><td className="px-3 py-2 text-white">{item.applicant}</td><td className="px-3 py-2 text-zinc-200">{item.role}</td><td className="px-3 py-2 text-emerald-300 underline">{item.resume}</td><td className="px-3 py-2">{item.status === 'Review' ? <span className="flex gap-2"><button type="button" aria-label={`Accept ${item.applicant}`} onClick={() => setReviews((current) => current.map((row) => row.applicant === item.applicant ? { ...row, status: 'Accepted' } : row))} className="text-base text-emerald-400">✓</button><button type="button" aria-label={`Reject ${item.applicant}`} onClick={() => setReviews((current) => current.map((row) => row.applicant === item.applicant ? { ...row, status: 'Rejected' } : row))} className="text-base text-red-400">×</button></span> : <span className={item.status === 'Accepted' ? 'text-emerald-300' : 'text-red-300'}>{item.status}</span>}</td></tr>)}</tbody></table></div></div>
        <ApplicationTable title="My applications" headers={['Date', 'Role', 'Employer', 'Status']} rows={myApplications.map((item) => [item.date, item.role, item.employer, item.status])} />
      </div>
    </section>
  );
}

function ApplicationTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return <div className="min-w-0"><h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{title}</h3><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead><tr className="text-zinc-500">{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${title}-${index}`} className="border-t border-zinc-800/60">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className={`whitespace-nowrap px-3 py-2 ${cellIndex === row.length - 1 ? 'text-emerald-300' : 'text-zinc-200'}`}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

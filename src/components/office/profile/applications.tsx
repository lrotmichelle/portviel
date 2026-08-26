import React from 'react';

const hrApplications = [
  { applicant: 'Aisha N.', role: 'Social media manager', resume: 'Aisha-N.pdf', status: 'Review' },
  { applicant: 'Kibuka Ali', role: 'Campaign creator', resume: 'Kibuka-Ali.pdf', status: 'Review' },
];

const myApplications = [
  { role: 'Presidential campaign', employer: 'PortVille HR', status: 'Pending' },
  { role: 'Growth campaign', employer: 'Martha Media', status: 'Accepted' },
  { role: 'Product launch', employer: 'Market House', status: 'Rejected' },
];

export default function Applications() {
  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 lg:col-span-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Applications</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2"><ApplicationTable title="HR applications" headers={['Applicant', 'Role', 'Resume', 'Status']} rows={hrApplications.map((item) => [item.applicant, item.role, item.resume, item.status])} /><ApplicationTable title="My applications" headers={['Role', 'Employer', 'Status']} rows={myApplications.map((item) => [item.role, item.employer, item.status])} /></div>
    </section>
  );
}

function ApplicationTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return <div className="min-w-0"><h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{title}</h3><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead><tr className="text-zinc-500">{headers.map((header) => <th key={header} className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${title}-${index}`} className="border-t border-zinc-800/60">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className={`whitespace-nowrap px-3 py-2 ${cellIndex === row.length - 1 ? 'text-emerald-300' : 'text-zinc-200'}`}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

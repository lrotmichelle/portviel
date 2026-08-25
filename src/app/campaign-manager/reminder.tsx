'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatCompactValue } from '@/lib/currency';

type ReminderRow = {
    rank: number;
    member: string;
    platform: string;
    amount: number;
};

const rows: ReminderRow[] = [
    { rank: 1, member: 'Aisha N.', platform: 'TikTok', amount: 1450000 },
    { rank: 2, member: 'Maya T.', platform: 'Instagram', amount: 1280000 },
    { rank: 3, member: 'Kato M.', platform: 'YouTube', amount: 1170000 },
    { rank: 4, member: 'Rita N.', platform: 'TikTok', amount: 980000 },
    { rank: 5, member: 'Derrick L.', platform: 'Instagram', amount: 760000 },
];

export default function ReminderTable() {
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const [showAll, setShowAll] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showAll) return;
        const timer = setTimeout(() => setShowAll(false), 60000);
        return () => clearTimeout(timer);
    }, [showAll]);

    useEffect(() => {
        if (!showAll) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setShowAll(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAll]);

    const visibleRows = showAll ? rows : rows.slice(0, 4);

    return (
        <div ref={containerRef} className="flex h-full w-full flex-col rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Reminders</h3>
                <button type="button" onClick={() => setShowAll((prev) => !prev)} className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300">
                    {showAll ? 'View less' : 'View all'}
                </button>
            </div>

            <div className={`w-full flex-grow ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
                <table className="manage-reminders-table campaign-manager-spaced-table w-full min-w-full table-auto bg-transparent text-left text-sm">
                    <thead>
                        <tr className="text-zinc-400">
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Member</th>
                            <th className="manage-media-column pb-2 text-[11px] font-medium uppercase tracking-wide">Media</th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
                            <th className="pb-2 pl-3 text-right text-[11px] font-medium uppercase tracking-wide">Pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.map((row) => (
                            <tr key={row.rank} className="border-t border-zinc-800/60 bg-transparent align-middle">
                                <td className="py-1 pr-2 text-zinc-300">#{row.rank}</td>
                                <td className="py-1 pr-2 text-white">{row.member}</td>
                                <td className="manage-media-column py-1 pr-2 text-zinc-300">{row.platform}</td>
                                <td className="py-1 text-right text-zinc-100">{formatCompactValue(row.amount)} UGX</td>
                                <td className="py-1 pl-3 text-right">
                                    <button className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300 transition hover:bg-emerald-500 hover:text-white">
                                        Pay
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
                <span />
                <button className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300 transition hover:bg-emerald-500 hover:text-white">
                    Pay all {formatCompactValue(totalAmount)} UGX
                </button>
            </div>
        </div>
    );
}

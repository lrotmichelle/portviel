'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatCompactNumber, formatCompactValue } from '@/lib/currency';

type MemberRow = {
    rank: number;
    name: string;
    platform: string;
    views: number;
    likes: number;
    amount: number;
    status: 'settled' | 'owe';
};

const rows: MemberRow[] = [
    { rank: 1, name: 'Aisha N.', platform: 'TikTok', views: 1850000, likes: 420000, amount: 3200000, status: 'settled' },
    { rank: 2, name: 'Kato M.', platform: 'Instagram', views: 1620000, likes: 390000, amount: 2850000, status: 'settled' },
    { rank: 3, name: 'Maya T.', platform: 'YouTube', views: 1480000, likes: 365000, amount: 2600000, status: 'settled' },
    { rank: 4, name: 'Rita N.', platform: 'TikTok', views: 1320000, likes: 318000, amount: 2380000, status: 'owe' },
    { rank: 5, name: 'Derrick L.', platform: 'Instagram', views: 910000, likes: 152000, amount: 980000, status: 'owe' },
];

export default function MembersTable() {
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
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Campaign flow</h3>
                <button type="button" onClick={() => setShowAll((prev) => !prev)} className="rounded-none border-0 bg-transparent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 hover:text-red-300">
                    {showAll ? 'View less' : 'View all'}
                </button>
            </div>

            <div className={`w-full flex-grow ${showAll ? 'overflow-x-auto max-h-[200px] overflow-y-auto' : 'overflow-hidden'}`}>
                <table className="campaign-flow-table campaign-manager-spaced-table w-full min-w-full table-auto bg-transparent text-left text-sm">
                    <thead>
                        <tr className="text-zinc-400">
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Member</th>
                            <th className="manage-media-column pb-2 text-[11px] font-medium uppercase tracking-wide">Media</th>
                            <th className="campaign-flow-views pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Views</th>
                            <th className={`${showAll ? '' : 'hidden md:table-cell'} pb-2 text-right text-[11px] font-medium uppercase tracking-wide`}>Likes</th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.map((row) => (
                            <tr key={row.rank} className="border-t border-zinc-800/60 bg-transparent align-top">
                                <td className="py-1.5 pr-2 text-zinc-300">#{row.rank}</td>
                                <td className="py-1.5 pr-2 text-white">
                                    <span className="block max-w-[10ch] truncate md:max-w-[14ch]" title={row.name}>{row.name}</span>
                                </td>
                                <td className="manage-media-column campaign-flow-media py-1.5 pr-2 text-zinc-300">{row.platform}</td>
                                <td className="campaign-flow-views py-1.5 pr-2 text-right text-zinc-100">{formatCompactNumber(row.views)}</td>
                                <td className={`${showAll ? '' : 'hidden md:table-cell'} py-1.5 pr-2 text-right text-zinc-100`}>{formatCompactNumber(row.likes)}</td>
                                <td className={`py-1.5 text-right font-semibold ${row.status === 'settled' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                    {formatCompactValue(row.amount)} UGX
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

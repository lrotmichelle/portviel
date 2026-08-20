'use client';

import React from 'react';
import { formatCompactValue } from '@/lib/currency';

type ReminderRow = {
    rank: number;
    member: string;
    amount: number;
};

const rows: ReminderRow[] = [
    { rank: 1, member: 'Aisha N.', amount: 1450000 },
    { rank: 2, member: 'Maya T.', amount: 1280000 },
    { rank: 3, member: 'Kato M.', amount: 1170000 },
    { rank: 4, member: 'Rita N.', amount: 980000 },
    { rank: 5, member: 'Derrick L.', amount: 760000 },
];

export default function ReminderTable() {
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

    return (
        <div className="w-full rounded-2xl border border-zinc-800/60 bg-transparent p-3 text-sm text-zinc-200">
            <div className="mb-2 flex flex-col gap-2">
                <h3 className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Reminders</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto bg-transparent text-left text-sm">
                    <thead>
                        <tr className="text-zinc-400">
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Rank</th>
                            <th className="pb-2 text-[11px] font-medium uppercase tracking-wide">Member</th>
                            <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide">Amount</th>
                            <th className="pb-2 pl-3 text-right text-[11px] font-medium uppercase tracking-wide">Pay</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.rank} className="border-t border-zinc-800/60 bg-transparent align-middle">
                                <td className="py-1 pr-2 text-zinc-300">#{row.rank}</td>
                                <td className="py-1 pr-2 text-white">{row.member}</td>
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
                <button className="rounded-md border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                    View all
                </button>
                <button className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300 transition hover:bg-emerald-500 hover:text-white">
                    Pay all {formatCompactValue(totalAmount)} UGX
                </button>
            </div>
        </div>
    );
}

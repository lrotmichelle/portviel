'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, BarChart2, Briefcase, Building2, CircleAlert, CreditCard, Landmark, PieChart, Sparkles, TrendingUp, Users, Wallet } from 'lucide-react';
import { formatCompactValue } from '@/lib/currency';
import { defaultFinanceState, getFinanceState } from '@/lib/finance';

const overviewStats = [
  { label: 'Market activity', value: 32, delta: '+12.4%', icon: Users, color: 'text-emerald-400' },
  { label: 'Orders involved', value: 24, delta: '+8.1%', icon: BarChart2, color: 'text-sky-400' },
  { label: 'Offers involved', value: 16, delta: '+5.6%', icon: Briefcase, color: 'text-amber-400' },
  { label: 'Campaigns live', value: 50, delta: '+14.2%', icon: Building2, color: 'text-violet-400' },
];

const trafficSources = [
  { label: 'Direct Traffic', value: 38, color: 'bg-amber-400' },
  { label: 'Organic Search', value: 27, color: 'bg-orange-500' },
  { label: 'Social Media', value: 18, color: 'bg-emerald-400' },
  { label: 'Referral Traffic', value: 11, color: 'bg-zinc-500' },
  { label: 'Email Campaigns', value: 6, color: 'bg-sky-400' },
];

const progressTracks = [
  { label: 'Market growth', value: 82, color: 'bg-emerald-400' },
  { label: 'Campaign engagement', value: 74, color: 'bg-amber-400' },
  { label: 'Offer conversion', value: 63, color: 'bg-sky-400' },
];

function DonutChart({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-950 text-sm font-black text-white">
          {value}%
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-500">Momentum outlook</p>
      </div>
    </div>
  );
}

function HalfDonutChart({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex h-24 w-24 items-end justify-center overflow-hidden rounded-full bg-zinc-950/80">
        <div
          className="h-24 w-24 rounded-t-full border-[10px] border-amber-400"
          style={{ clipPath: 'inset(0 0 50% 0)', transform: `rotate(${value * 1.8}deg)` }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-zinc-500">Coverage</p>
      </div>
    </div>
  );
}

export default function OfficeOverview() {
  const [finance, setFinance] = useState(defaultFinanceState);

  useEffect(() => {
    const updateFinance = () => setFinance(getFinanceState());

    updateFinance();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'buyercard-finance') updateFinance();
    };
    const handleCustom = () => updateFinance();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('financeStateChanged', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('financeStateChanged', handleCustom);
    };
  }, []);

  const campaigns = { incomeEarned: 2400000, incomeSpent: 360000 };
  const market = { involvement: '24 active' };
  const orders = { involvement: '18 tracked' };
  const offers = { involvement: '9 pending' };
  const account = {
    totalBalance: finance.accountBalance,
    reservedFee: finance.reservedFee,
    get availableBalance() {
      return Math.max(0, this.totalBalance - this.reservedFee);
    },
  };
  const paymentMethods: Array<{ id: string; label: string; status: string; icon: React.ComponentType<any> }> = [
    { id: 'airtel', label: 'Airtel Money', status: 'Verified', icon: CreditCard },
    { id: 'mobile', label: 'Mobile Money', status: 'Active', icon: Wallet },
    { id: 'bank', label: 'Bank card', status: 'Primary', icon: Building2 },
  ];
  const transactions: Array<{ id: string; title: string; method: string; type: string; amount: number }> = [
    { id: 't1', title: 'Account deposit', method: 'Bank card', type: 'deposit', amount: 120000 },
    { id: 't2', title: 'Campaign payout', method: 'Airtel Money', type: 'withdrawal', amount: 32000 },
    { id: 't3', title: 'Platform fee', method: 'Mobile Money', type: 'fee', amount: 1000 },
  ];

  return (
    <div className="w-full p-4 text-zinc-100 sm:p-6">
      <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Office analytics
            </div>
            <h1 className="mt-3 text-3xl font-black text-white">Martha Mukisa activity dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              A polished office view for market movement, campaign momentum, discover activity, and finance performance.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span>Weekly pulse</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">+18.3% healthier engagement</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                </div>
                <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-500">{stat.delta} vs last week</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Performance snapshot</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Activity and momentum</h2>
                </div>
                <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-400">Live</div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DonutChart value={82} label="Growth score" color="#f59e0b" />
                <HalfDonutChart value={68} label="Coverage" />
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Progress bars</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Channel health</h2>
                </div>
                <span className="text-sm text-zinc-400">This month</span>
              </div>
              <div className="mt-5 space-y-4">
                {progressTracks.map((track) => (
                  <div key={track.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                      <span>{track.label}</span>
                      <span className="font-semibold text-white">{track.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                      <div className={`${track.color} h-full rounded-full`} style={{ width: `${track.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Audience mix</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Traffic sources</h2>
                </div>
                <PieChart className="h-5 w-5 text-amber-400" />
              </div>
              <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-center">
                  <div className="grid h-36 w-36 place-items-center rounded-full" style={{ background: 'conic-gradient(#f59e0b 0 38%, #f97316 38% 65%, #34d399 65% 83%, #64748b 83% 94%, #38bdf8 94% 100%)' }}>
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-zinc-300">
                      100% reach
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {trafficSources.map((source) => (
                    <div key={source.label} className="flex items-center justify-between text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${source.color}`} />
                        <span>{source.label}</span>
                      </div>
                      <span className="font-semibold text-white">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Finance pulse</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Account flow</h2>
                </div>
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <p className="text-sm text-zinc-400">User account balance</p>
                      <p className="mt-2 text-3xl font-black text-white">{formatCompactValue(account.totalBalance)} UGX</p>
                      <p className="mt-2 text-sm text-zinc-500">Available after site charge</p>
                      <p className="mt-1 text-lg font-semibold text-white">{formatCompactValue(account.availableBalance)} UGX</p>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-zinc-400">Reserved site fee</p>
                          <span className="text-sm font-semibold text-white">{formatCompactValue(account.reservedFee)} UGX</span>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">A fixed amount held back to cover platform fees.</p>
                      </div>
                      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
                        <p className="text-sm text-zinc-400">Payment methods</p>
                        <div className="mt-3 space-y-3">
                          {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-white">
                                  <method.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{method.label}</p>
                                  <p className="text-xs text-zinc-500">{method.status}</p>
                                </div>
                              </div>
                              <span className="rounded-full bg-zinc-900/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">{method.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Recent transactions</p>
                  <div className="mt-4 space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{transaction.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">{transaction.method}</p>
                          </div>
                          <div className={`rounded-full p-2 ${transaction.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : transaction.type === 'withdrawal' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
                            {transaction.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4" /> : transaction.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
                          <span className="capitalize">{transaction.type}</span>
                          <span className="font-semibold text-white">{transaction.amount.toLocaleString()} UGX</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

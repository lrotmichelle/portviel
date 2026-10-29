'use client';

import React from 'react';
import { Sliders, Wallet, Bell, Edit3, ChevronRight } from 'lucide-react';

interface AccountSettingsProps {
  onEdit: () => void;
}

export function AccountSettings({ onEdit }: AccountSettingsProps) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
        <Sliders className="w-4 h-4 text-emerald-400" />
        Account Settings
      </h3>

      <div className="space-y-2 text-xs">
        <button 
          onClick={onEdit}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 text-zinc-200 font-medium transition"
        >
          <div className="flex items-center gap-2.5">
            <Edit3 className="w-4 h-4 text-zinc-400" />
            <span>Edit Display Name & Username</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 text-zinc-200 font-medium transition">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-zinc-400" />
            <span>Payout Accounts (MTN / Airtel MoMo)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 hover:border-zinc-700 text-zinc-200 font-medium transition">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-zinc-400" />
            <span>Notification & Email Alerts</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
}
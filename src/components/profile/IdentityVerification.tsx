'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

interface IdentityVerificationProps {
  kycStatus: 'verified' | 'unverified' | 'pending';
  legalName: string;
}

export function IdentityVerification({ kycStatus, legalName }: IdentityVerificationProps) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        Identity Verification (KYC)
      </h3>

      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/60 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-1.5">
              Didit Passport / ID Verification
              {kycStatus === 'verified' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Legal identity locked upon verification for secure Mobile Money payouts.
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Verified Legal Name</span>
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="font-mono font-bold text-emerald-400 text-sm">
            {legalName}
          </div>
          <div className="text-[10px] text-zinc-500">
            🔒 Matches official document. Cannot be edited directly.
          </div>
        </div>
      </div>
    </div>
  );
}
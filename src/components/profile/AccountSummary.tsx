'use client';

import React from 'react';
import { TrendingUp, Star, Calendar, Megaphone } from 'lucide-react';
import { RatingComponent } from './RatingComponent';

interface AccountSummaryProps {
  userData: {
    rating: number;
    totalReviews: number;
    joinedDate: string;
    salesUgx: number;
    investedUgx: number;
    kycStatus: 'verified' | 'unverified' | 'pending';
  };
  formatCurrency: (amount: number) => string;
  isOwnProfile: boolean;
  onRatingSubmit: (rating: number) => void;
  accountId?: string;
  viewerId?: string;
  viewerName?: string;
  viewerImage?: string | null;
}

export function AccountSummary({ userData, formatCurrency, isOwnProfile, onRatingSubmit, accountId, viewerId, viewerName, viewerImage }: AccountSummaryProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Account Summary
        </h2>
        <span className="text-[10px] text-zinc-500">Live Data</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-zinc-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-white">{userData.rating}</span>
            <span className="text-[10px] text-zinc-500">/ 5.0 ({userData.totalReviews})</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Date Joined</span>
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-sm font-bold text-white">
            {userData.joinedDate}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-zinc-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Income</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-extrabold text-amber-400 truncate">
            {formatCurrency(userData.salesUgx)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Invested</span>
            <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400">
            {formatCurrency(userData.investedUgx)}
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="w-full">
          <RatingComponent
            onRatingSubmit={onRatingSubmit}
            className="mt-0"
            accountId={accountId}
            viewerId={viewerId}
            viewerName={viewerName}
            viewerImage={viewerImage}
          />
        </div>
      )}
    </section>
  );
}
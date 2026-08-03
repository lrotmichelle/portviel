'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: any) => void;
}

export default function ListingModal({ isOpen, onClose, onPublishSuccess }: ListingModalProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [nicheInput, setNicheInput] = useState('');
  const [niches, setNiches] = useState<string[]>([]);
  const [accountData, setAccountData] = useState<{ handle: string; followers: number; likes: number; views: number; engagementRate: number; platform: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const normalizeNiches = (value: string) => {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 4);
  };

  const addNicheTag = () => {
    const nextNiches = normalizeNiches(nicheInput);
    if (nextNiches.length === 0) return;

    setNiches((prev) => [...prev, ...nextNiches].slice(0, 4));
    setNicheInput('');
  };

  const handleNicheKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return;

    event.preventDefault();
    addNicheTag();
  };

  const handleRemoveNiche = (tagToRemove: string) => {
    setNiches((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const formatNumberHelper = (value: string) => {
    const numericValue = Number(value);
    if (!value.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      return '';
    }

    if (numericValue >= 1_000_000) {
      return `${(numericValue / 1_000_000).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '')}M`;
    }

    if (numericValue >= 1_000) {
      return `${(numericValue / 1_000).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '')}K`;
    }

    return `${numericValue}`;
  };

  const isPublishDisabled = !profileUrl.trim() || !description.trim() || !price.trim() || niches.length === 0;

  const handleSubmit = async () => {
    if (!profileUrl.trim() || !description.trim() || !price.trim()) {
      setError('Please provide the profile link, description, and price.');
      return;
    }

    if (niches.length === 0 && nicheInput.trim()) {
      setNiches(normalizeNiches(nicheInput));
      setNicheInput('');
      return;
    }

    if (niches.length === 0) {
      setError('Please add at least one niche tag.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ profileUrl, description, price: Number(price) || 0, niche: niches.join(','), createdBy: 'demo-user' }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create listing');

      setAccountData({
        handle: payload.item?.handle ?? '',
        followers: Number(payload.item?.followers ?? 0),
        likes: Number(payload.item?.likes ?? 0),
        views: Number(payload.item?.views ?? 0),
        engagementRate: Number(payload.item?.engagementRate ?? 0),
        platform: payload.item?.platform ?? '',
      });
      onPublishSuccess?.(payload.item);
      setProfileUrl('');
      setDescription('');
      setPrice('');
      setNiches([]);
      setNicheInput('');
      onClose();
    } catch (error) {
      console.error('Failed to publish listing', error);
      setError(error instanceof Error ? error.message : 'Unable to publish listing right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Market</p>
            <h3 className="text-lg font-semibold text-white">Publish social account listing</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition-colors hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Paste social account link</label>
            <input
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="https://instagram.com/yourhandle"
            />
            <p className="mt-1 text-[11px] text-zinc-500">We validate the profile and return the account&apos;s total views, followers, likes, and the average engagement rate from the recent 4 videos.</p>
          </div>

          {accountData && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Verified {accountData.platform} profile
              </div>
              <div className="mt-2 grid gap-2 text-[12px] text-emerald-200 sm:grid-cols-2">
                <div>Handle: @{accountData.handle}</div>
                <div>Views: {accountData.views.toLocaleString()}</div>
                <div>Followers: {accountData.followers.toLocaleString()}</div>
                <div>Likes: {accountData.likes.toLocaleString()}</div>
                <div className="sm:col-span-2">ER (recent 4 videos): {accountData.engagementRate}%</div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="Describe the account and what makes it valuable"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
              {price.trim() ? <p className="mt-1 text-[11px] text-zinc-500">Net: {formatNumberHelper(price)}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Niche</label>
              <div className="flex items-center gap-2">
                <input
                  value={nicheInput}
                  onChange={(e) => setNicheInput(e.target.value)}
                  onKeyDown={handleNicheKeyDown}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                  placeholder="Growth"
                />
                <button
                  type="button"
                  onClick={addNicheTag}
                  disabled={niches.length >= 4 || !nicheInput.trim()}
                  className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">{niches.length} tag{niches.length === 1 ? '' : 's'} • Press Enter or comma to add.</p>
              {niches.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {niches.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveNiche(tag)}
                      className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2.5 py-1 text-[11px] text-zinc-300"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isPublishDisabled}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

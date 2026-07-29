'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ListingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
}

export default function ManageListingsPage() {
  const [items, setItems] = useState<ListingItem[]>([]);

  async function loadListings() {
    try {
      const response = await fetch('/api/secure');
      const payload = await response.json();
      setItems((payload.marketListings ?? []).map((item: any) => ({
        id: String(item.id),
        title: item.title ?? 'Market listing',
        description: item.description ?? '',
        price: item.price ?? 0,
        status: item.status ?? 'open',
      })));
    } catch (error) {
      console.error('Unable to load listings', error);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function updateListingPrice(id: string, newPrice: number) {
    const response = await fetch('/api/secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
      body: JSON.stringify({ mode: 'update_listing', entityId: Number(id), price: newPrice }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to update listing');
    return payload.item;
  }

  async function deleteListing(id: string) {
    const response = await fetch('/api/secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
      body: JSON.stringify({ mode: 'delete_listing', entityId: Number(id) }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to delete listing');
    return true;
  }

  const handleAction = async (item: ListingItem, action: 'discount' | 'increase' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this listing? This action cannot be undone.')) {
          return;
        }
        await deleteListing(item.id);
        setItems((prev) => prev.filter((listing) => listing.id !== item.id));
        return;
      }

      const factor = action === 'discount' ? 0.9 : 1.1;
      const nextPrice = Math.max(0, Math.round(item.price * factor));
      const updated = await updateListingPrice(item.id, nextPrice);
      setItems((prev) => prev.map((listing) => listing.id === item.id ? { ...listing, price: updated.price } : listing));
    } catch (error) {
      console.error('Listing action failed', error);
      window.alert(error instanceof Error ? error.message : 'Unable to update listing');
    }
  }
  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
          <h1 className="text-3xl font-bold">My listings</h1>
        </div>
        <Link href="/market" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">Back</Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-sm text-zinc-400">No listings published yet.</div>
        ) : items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">{item.status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-zinc-200">Price: <span className="font-mono text-white">${item.price.toFixed ? item.price.toFixed(2) : item.price}</span></p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                  onClick={() => handleAction(item, 'discount')}
                >
                  Discount 10%
                </button>
                <button
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                  onClick={() => handleAction(item, 'increase')}
                >
                  Increase 10%
                </button>
                <button
                  className="rounded-xl border border-red-500 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                  onClick={() => handleAction(item, 'delete')}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

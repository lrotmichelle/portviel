'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Smartphone } from 'lucide-react';

type PaymentType = 'phone' | 'bank';
type BankKind = 'account' | 'card';

type SavedMethod = {
  id: string;
  type: PaymentType;
  countryCode: string;
  countryName: string;
  phoneNumber: string;
  provider: string;
  bankKind: BankKind;
  bankDetail: string;
  verified: boolean;
  savedAt: number;
};

type Country = { code: string; name: string; dialCode: string };

const LOCK_DURATION = 7 * 24 * 60 * 60 * 1000;

const COUNTRIES: Country[] = [
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'NA', name: 'Namibia', dialCode: '+264' },
  { code: 'ZM', name: 'Zambia', dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
];

const airTelPrefixes = ['070', '071', '074'];
const mtnPrefixes = ['077', '075', '076'];

const detectProvider = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  const prefix = digits.startsWith('256') ? digits.slice(3, 6) : digits.slice(0, 3);
  if (airTelPrefixes.includes(prefix)) return 'Airtel Uganda';
  if (mtnPrefixes.includes(prefix)) return 'MTN Uganda';
  if (prefix.startsWith('078') || prefix.startsWith('079')) return 'MTN Uganda';
  return '';
};

const emptyMethod = (): SavedMethod => ({
  id: '',
  type: 'phone',
  countryCode: 'UG',
  countryName: 'Uganda',
  phoneNumber: '',
  provider: '',
  bankKind: 'account',
  bankDetail: '',
  verified: false,
  savedAt: 0,
});

const STORAGE_KEY = 'payment-method';

function PhoneIcon() {
  return (
    <Smartphone className="h-5 w-5 text-amber-400" />
  );
}

function BankIcon() {
  return (
    <Landmark className="h-5 w-5 text-emerald-500" />
  );
}

export default function PaymentMethods() {
  const [method, setMethod] = useState<SavedMethod | null>(null);
  const [savedAt, setSavedAt] = useState<number>(0);
  const [form, setForm] = useState<SavedMethod>(emptyMethod());
  const [showForm, setShowForm] = useState(false);
  const [detectedProvider, setDetectedProvider] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SavedMethod;
      setMethod(parsed);
      setSavedAt(parsed.savedAt);
    }
  }, []);

  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isLocked = savedAt > 0 && now - savedAt < LOCK_DURATION;
  const lockExpiry = savedAt > 0 ? savedAt + LOCK_DURATION : 0;

  const formatTimeLeft = (expiry: number): string => {
    const ms = expiry - now;
    if (ms <= 0) return '0d 0h';
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  };

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
    setForm((prev) => ({ ...prev, countryCode: country.code, countryName: country.name }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phoneNumber: value }));
    setDetectedProvider(detectProvider(value));
  };

  const startAdd = () => {
    setForm({ ...emptyMethod(), type: 'phone' });
    setShowForm(true);
  };

  const startEdit = (existing: SavedMethod) => {
    setForm({ ...existing });
    setDetectedProvider(existing.provider);
    setShowForm(true);
  };

  const saveMethod = () => {
    const toSave: SavedMethod = {
      ...form,
      id: method?.id || `pm_${Date.now()}`,
      provider: form.type === 'phone' ? detectedProvider : '',
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setMethod(toSave);
    setSavedAt(toSave.savedAt);
    setShowForm(false);
  };

  const cancelForm = () => {
    setShowForm(false);
  };

  const displayDetail = (m: SavedMethod): string => {
    if (m.type === 'phone') {
      const country = countryByCode(m.countryCode);
      return `${country.dialCode} ${m.phoneNumber}`;
    }
    return m.bankKind === 'account' ? `Account: ${m.bankDetail}` : `Card: ${m.bankDetail}`;
  };

  const countryByCode = (code: string): Country => COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];

  if (showForm) {
    return (
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Payment method</h2>

        <div className="space-y-4">
          <fieldset className="flex gap-5 text-xs text-zinc-400">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                checked={form.type === 'phone'}
                onChange={() => setForm((p) => ({ ...p, type: 'phone' }))}
                className="h-3.5 w-3.5 accent-amber-400"
              />
              <span className={form.type === 'phone' ? 'text-amber-300' : 'text-zinc-500'}>Phone</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                checked={form.type === 'bank'}
                onChange={() => setForm((p) => ({ ...p, type: 'bank' }))}
                className="h-3.5 w-3.5 accent-amber-400"
              />
              <span className={form.type === 'bank' ? 'text-amber-300' : 'text-zinc-500'}>Bank</span>
            </label>
          </fieldset>

          {form.type === 'phone' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400">Country</label>
                <select
                  value={form.countryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              {detectedProvider && (
                <p className="text-xs font-medium text-amber-300">{detectedProvider}</p>
              )}

              <div>
                <label className="block text-xs text-zinc-400">{countryByCode(form.countryCode).name}</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={countryByCode(form.countryCode).dialCode}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <fieldset className="flex gap-5 text-xs text-zinc-400">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bankKind"
                    checked={form.bankKind === 'account'}
                    onChange={() => setForm((p) => ({ ...p, bankKind: 'account' }))}
                    className="h-3.5 w-3.5 accent-amber-400"
                  />
                  <span className={form.bankKind === 'account' ? 'text-amber-300' : 'text-zinc-500'}>Account number</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bankKind"
                    checked={form.bankKind === 'card'}
                    onChange={() => setForm((p) => ({ ...p, bankKind: 'card' }))}
                    className="h-3.5 w-3.5 accent-amber-400"
                  />
                  <span className={form.bankKind === 'card' ? 'text-amber-300' : 'text-zinc-500'}>Bank card</span>
                </label>
              </fieldset>

              <input
                value={form.bankDetail}
                onChange={(e) => setForm((prev) => ({ ...prev, bankDetail: e.target.value }))}
                placeholder={form.bankKind === 'account' ? 'Account number' : 'Card number'}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={saveMethod}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!method) {
    return (
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Payment method</h2>

        <div className="space-y-3">
          <p className="text-xs text-zinc-500">No payment method set up yet.</p>
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300"
          >
            <PhoneIcon />
            Add payment method
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 no-scrollbar">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Payment method</h2>

      <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            {method.type === 'phone' ? <PhoneIcon /> : <BankIcon />}
            <span className="truncate text-sm font-semibold text-white">
              {method.type === 'phone'
                ? `${method.countryName} • ${method.provider || 'Unknown provider'}`
                : `Bank ${method.bankKind === 'account' ? 'account' : 'card'}`}
            </span>
          </div>
          <span
            className={method.verified ? 'text-base font-bold text-emerald-400' : 'text-base font-bold text-red-400'}
            aria-label={method.verified ? 'Verified' : 'Not verified'}
            title={method.verified ? 'Verified' : 'Not verified'}
          >
            {method.verified ? '✓' : '×'}
          </span>
        </div>

        <p className="mt-2 truncate text-xs text-zinc-400" title={displayDetail(method)}>
          {displayDetail(method) || 'No detail added'}
        </p>

        {isLocked ? (
          <p className="mt-2 text-xs text-zinc-500">
            Locked for {formatTimeLeft(lockExpiry)}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => startEdit(method)}
            className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300"
          >
            Edit
          </button>
        )}
      </div>
    </section>
  );
}

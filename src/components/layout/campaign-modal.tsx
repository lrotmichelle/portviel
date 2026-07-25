'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { getFinanceState, setFinanceState } from '@/lib/finance';
import { formatCompactValue } from '@/lib/currency';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: any) => void;
}

export default function CampaignModal({ isOpen, onClose, onPublishSuccess }: CampaignModalProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [nicheHashtag, setNicheHashtag] = useState('growth');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [categoryOption, setCategoryOption] = useState('');
  const [nicheOption, setNicheOption] = useState('');
  const categoryOptions = ['Technology', 'Lifestyle', 'Gaming', 'Entertainment', 'Sports', 'Education', 'Luxury', 'Music', 'Politics', 'Religion'];
  const nicheOptions = ['duet', 'sound', 'ugc', 'logo', 'clipping'];
  const [totalBudget, setTotalBudget] = useState('');
  const [cpmInput, setCpmInput] = useState('');
  const [timeRemainingDays, setTimeRemainingDays] = useState('');
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [minPayout, setMinPayout] = useState('');
  const [maxPayout, setMaxPayout] = useState('');
  const [futureStartEnabled, setFutureStartEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const dayRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (futureStartEnabled) {
      dayRef.current?.focus();
    }
  }, [futureStartEnabled]);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const tomorrowDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  })();

  const selectedStartDate = (() => {
    if (!startDay || !startMonth || !startYear) return '';
    const day = Number(startDay);
    const month = Number(startMonth);
    const year = Number(startYear);
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return '';
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
    return date.toISOString().split('T')[0];
  })();

  const validateProjectName = (name: string) => {
    if (!name.trim()) return 'Campaign name cannot be empty.';
    if (name.length > 16) return 'Campaign name must be 16 characters or fewer.';
    if (/^[ .]/.test(name)) return 'Campaign name cannot start with a space or period.';
    if (/[ .]$/.test(name)) return 'Campaign name cannot end with a space or period.';
    if (/\p{Emoji}/u.test(name)) return 'Campaign name cannot contain emojis or icons.';
    if (/[^a-zA-Z0-9 .-]/.test(name)) return 'Only letters, numbers, spaces, dot and hyphen are allowed.';
    if (/\.\./.test(name)) return 'Campaign name cannot contain consecutive periods.';
    return '';
  };

  const descriptionContainsLink = (value: string) => {
    return /(?:https?:\/\/|www\.|\S+\.(?:com|net|org|io|gov|edu|co|me|app|store|site|biz|online|info))(?:\/\S*)?/i.test(value);
  };

  const sanitizeDescription = (value: string) => {
    const cleaned = String(value)
      .replace(/\r?\n+/g, ' ')
      .replace(/https?:\/\/\S+|www\.\S+|\S+\.(?:com|net|org|io|gov|edu|co|me|app|store|site|biz|online|info)(?:\/\S*)?/gi, '')
      .replace(/[^a-zA-Z ]+/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '');
    return cleaned.slice(0, 325);
  };

  const validateDescription = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Description cannot be empty.';
    if (trimmed.length > 325) return 'Description must be 325 characters or fewer.';
    if (/^[ .]/.test(value)) return 'Description cannot start with a space or period.';
    if (descriptionContainsLink(value)) return 'Description cannot contain links.';
    if (/[^a-zA-Z ]/.test(value)) return 'Description can only contain letters and spaces.';
    return '';
  };

  const formatCompact = (value: number) => formatCompactValue(value);

  const parseFormatted = (value: string | number) => {
    if (value === null || value === undefined) return 0;
    const s = String(value).trim().replace(/,/g, '').toLowerCase();
    if (!s) return 0;
    const m = s.match(/^([0-9]*\.?[0-9]+)\s*(k|m|b|t)?$/);
    if (m) {
      const num = parseFloat(m[1]);
      const suffix = m[2];
      if (suffix === 't') return Math.round(num * 1000000000000);
      if (suffix === 'b') return Math.round(num * 1000000000);
      if (suffix === 'm') return Math.round(num * 1000000);
      if (suffix === 'k') return Math.round(num * 1000);
      return Math.round(num);
    }
    const plain = parseFloat(s);
    return Number.isFinite(plain) ? Math.round(plain) : 0;
  };

  const convertToDisplayUnit = (value: number) => {
    if (!isFinite(value)) return '';
    return formatCompactValue(value);
  };

  const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

  const getCpmRangeForBudget = (budget: number) => {
    if (budget <= 50000) return { min: 1000, max: 2000 };
    if (budget <= 100000) return { min: 1000, max: 3000 };
    if (budget <= 200000) return { min: 1000, max: 5000 };
    if (budget <= 500000) return { min: 1000, max: 10000 };
    if (budget <= 1000000) return { min: 1000, max: 20000 };
    if (budget <= 1500000) return { min: 1000, max: 40000 };
    if (budget <= 2000000) return { min: 1000, max: 50000 };
    if (budget <= 3000000) return { min: 1000, max: 60000 };
    if (budget <= 4000000) return { min: 1000, max: 70000 };
    if (budget <= 5000000) return { min: 1000, max: 80000 };
    if (budget <= 6000000) return { min: 1000, max: 90000 };
    if (budget <= 10000000) return { min: 1000, max: 100000 };
    if (budget <= 15000000) return { min: 1000, max: 150000 };
    return { min: 1000, max: 150000 };
  };

  const getBudgetRules = () => {
    const budget = parseFormatted(totalBudget);
    const cpm = parseFormatted(cpmInput);
    const min = parseFormatted(minPayout);
    const max = parseFormatted(maxPayout);
    const hasBudgetInput = totalBudget.trim().length > 0;
    const hasCpmInput = cpmInput.trim().length > 0;
    const hasMinInput = minPayout.trim().length > 0;
    const hasMaxInput = maxPayout.trim().length > 0;
    const finance = getFinanceState();
    const availableBudget = Math.max(0, finance.accountBalance - finance.reservedFee);
    const cpmScale = hasCpmInput ? cpm / 1000 : 1;
    const violations: string[] = [];
    if (hasBudgetInput && budget <= 0) violations.push('Budget must be a positive number.');
    if (hasBudgetInput && budget > availableBudget) violations.push(`Budget cannot exceed your available account balance after site charges (${formatCompact(availableBudget)}).`);
    if (hasCpmInput && cpm <= 0) violations.push('CPM must be a positive number.');
    if (hasBudgetInput && budget > 0 && hasCpmInput) {
      const cpmRange = getCpmRangeForBudget(budget);
      if (cpm < cpmRange.min || cpm > cpmRange.max) {
        violations.push(`CPM must be between ${convertToDisplayUnit(cpmRange.min).toLowerCase()} and ${convertToDisplayUnit(cpmRange.max).toLowerCase()}.`);
      }
      if (cpm > budget) {
        violations.push('CPM cannot exceed the budget allocation.');
      }
    }
    if (hasMinInput && min < 0) violations.push('Min payout must be positive.');
    if (hasMaxInput && max < 0) violations.push('Max payout must be positive.');
    if (hasBudgetInput && budget > 0) {
      if (hasMinInput && min > budget) violations.push('Min payout cannot exceed the budget.');
      if (hasMaxInput && max > budget) violations.push('Max payout cannot exceed the budget.');
      const minLower = Math.max(1, Math.ceil(budget * 0.00009 * cpmScale));
      const minUpper = Math.max(1, Math.floor(budget * 0.005 * cpmScale));
      const maxLower = Math.max(1, Math.ceil(budget * 0.0051 * cpmScale));
      const maxUpper = Math.max(1, Math.floor(budget * 0.04 * cpmScale));
      if (hasMinInput && min > 0 && min < minLower) violations.push(`Min payout must be at least ${convertToDisplayUnit(minLower).toLowerCase()}.`);
      if (hasMinInput && min > minUpper) violations.push(`Min payout must be at most ${convertToDisplayUnit(minUpper).toLowerCase()}.`);
      if (hasMaxInput && max > 0 && max < maxLower) violations.push(`Max payout must be at least ${convertToDisplayUnit(maxLower).toLowerCase()}.`);
      if (hasMaxInput && max > maxUpper) violations.push(`Max payout must be at most ${convertToDisplayUnit(maxUpper).toLowerCase()}.`);
    }
    return {
      budget,
      cpm,
      min,
      max,
      cpmScale,
      cpmRange: getCpmRangeForBudget(budget),
      minLower: budget > 0 ? Math.max(1, Math.ceil(budget * 0.00009 * cpmScale)) : 0,
      minUpper: budget > 0 ? Math.max(1, Math.floor(budget * 0.005 * cpmScale)) : 0,
      maxLower: budget > 0 ? Math.max(1, Math.ceil(budget * 0.0051 * cpmScale)) : 0,
      maxUpper: budget > 0 ? Math.max(1, Math.floor(budget * 0.04 * cpmScale)) : 0,
      violations,
    };
  };

  const nameError = validateProjectName(projectName);
  const descriptionError = validateDescription(description);
  const budgetRules = getBudgetRules();
  const displayCpm = budgetRules.cpm > 0 ? convertToDisplayUnit(budgetRules.cpm) : '';
  const payoutsReady = budgetRules.violations.length === 0;
  const startDateReady = !futureStartEnabled || Boolean(selectedStartDate && selectedStartDate >= tomorrowDate);
  const timeRemainingSelected = Boolean(timeRemainingDays);
  const publishFee = timeRemainingDays === '30' ? 2000 : 1000;
  const isReadyToPublish = !nameError && !descriptionError && payoutsReady && startDateReady && timeRemainingSelected;

  const handleSubmit = async () => {
    const nameErr = validateProjectName(projectName);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    const descErr = validateDescription(description);
    if (descErr) {
      setError(descErr);
      return;
    }

    const finance = getFinanceState();
    const availableBudget = Math.max(0, finance.accountBalance - finance.reservedFee);
    const budget = parseFormatted(totalBudget);

    if (budget + publishFee > availableBudget) {
      setError(`Budget plus publishing fee cannot exceed your available account balance after site charges (${formatCompact(availableBudget)}).`);
      return;
    }

    if (budgetRules.violations.length > 0) {
      setError(budgetRules.violations[0]);
      return;
    }

    if (!timeRemainingDays) {
      setError('Please select the campaign duration.');
      return;
    }

    const minP = parseFormatted(minPayout) || 0;
    const maxP = parseFormatted(maxPayout) || 0;
    if (minP < 0 || maxP < 0) {
      setError('Payout values must be positive.');
      return;
    }
    if (maxP > 0 && minP > maxP) {
      setError('Min payout cannot exceed max payout.');
      return;
    }

    if (futureStartEnabled) {
      if (!selectedStartDate) {
        setError('Please enter a valid future start date.');
        return;
      }

      if (selectedStartDate < tomorrowDate) {
        setError('Future campaigns must start from tomorrow or later.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({
          mode: 'create_campaign',
          title: projectName,
          description,
          category,
          nicheHashtag,
          totalBudget: parseFormatted(totalBudget) || 1000,
          timeRemainingDays: Number(timeRemainingDays) || 14,
          startDate: futureStartEnabled ? selectedStartDate : null,
          minPayout: parseFormatted(minPayout) || 0,
          maxPayout: parseFormatted(maxPayout) || 0,
          publishFee,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create campaign');

      const finance = getFinanceState();
      const allocatedBudget = parseFormatted(totalBudget);
      setFinanceState({
        ...finance,
        accountBalance: Math.max(0, finance.accountBalance - allocatedBudget - publishFee),
        managerBalance: (finance.managerBalance ?? 0) + allocatedBudget,
      });

      const categoryValue = selectedCategories.length ? selectedCategories.join(', ') : category;
      const nicheValue = selectedNiches.length ? selectedNiches.join(', ') : nicheHashtag;

      onPublishSuccess?.({
        id: String(payload.item?.id ?? Date.now()),
        projectName,
        publisherUsername: 'demo-user',
        publisherRating: 4.8,
        timeRemainingDays: Number(timeRemainingDays) || 14,
        nicheHashtag: nicheValue,
        publishFee,
        description,
        category: categoryValue,
        status: 'Active',
        communitySize: 12000,
        viewsGenerated: 10000,
        likesGenerated: 1500,
        totalBudget: parseFormatted(totalBudget) || 1000,
        budgetUsed: 0,
        highestMcp: 100,
        hasJoined: false,
        startDate: futureStartEnabled ? selectedStartDate : undefined,
        minPayout: parseFormatted(minPayout) || undefined,
        maxPayout: parseFormatted(maxPayout) || undefined,
      });

        setProjectName('');
      setDescription('');
      setCategory('Technology');
      setNicheHashtag('growth');
      setSelectedCategories([]);
      setSelectedNiches([]);
      setCategoryOption('');
      setNicheOption('');
      setTotalBudget('');
      setCpmInput('');
      setTimeRemainingDays('');
      setStartDay('');
      setStartMonth('');
      setStartYear('');
      setMinPayout('');
      setMaxPayout('');
      setFutureStartEnabled(false);
      onClose();
    } catch (error) {
      console.error('Failed to create campaign', error);
      setError(error instanceof Error ? error.message : 'Unable to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="campaign-modal fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-y-auto max-h-[calc(100vh-3rem)]">
        <div className="flex flex-col">
          <div className="mb-0 flex items-center justify-between border-b border-zinc-900 px-6 py-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Campaign</p>
              <h3 className="text-lg font-semibold text-white">Create campaign</h3>
            </div>
            <button onClick={onClose} className="text-zinc-500 transition-colors hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Campaign name</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="e.g. Summer product launch"
            />
            {projectName && nameError ? <p className="mt-1 text-xs text-red-400">{nameError}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(sanitizeDescription(e.target.value))}
              onPaste={(e) => {
                e.preventDefault();
                const paste = e.clipboardData.getData('text');
                setDescription(sanitizeDescription(paste));
              }}
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="Describe the campaign goals and audience"
            />
            {description && (
              <p className="mt-1 text-xs text-zinc-400">{description.length}/325 letters</p>
            )}
          </div>

          <div className="flex flex-col gap-4 min-[360px]:flex-row min-[360px]:items-start">
            <div className="w-full min-[360px]:w-1/2">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Category filters (up to 3)</label>
              <div className="flex gap-2">
                <select
                  value={categoryOption}
                  onChange={(e) => setCategoryOption(e.target.value)}
                  className={`flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm outline-none ${categoryOption ? 'text-zinc-200' : 'text-zinc-500'}`}
                >
                  <option value="" disabled hidden>Choose category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (categoryOption && selectedCategories.length < 3 && !selectedCategories.includes(categoryOption)) {
                      setSelectedCategories([...selectedCategories, categoryOption]);
                    }
                  }}
                  disabled={!categoryOption || selectedCategories.length >= 3 || selectedCategories.includes(categoryOption)}
                  className="rounded-xl border border-amber-500/40 px-3 py-2 text-sm text-amber-300 transition-colors duration-200 hover:bg-amber-500 hover:text-white active:bg-amber-500 active:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCategories.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-sm text-zinc-200">
                    {item}
                    <button
                      type="button"
                      onClick={() => setSelectedCategories(selectedCategories.filter((categoryItem) => categoryItem !== item))}
                      className="text-zinc-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full min-[360px]:w-1/2">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Niche filters (up to 3)</label>
              <div className="flex gap-2">
                <select
                  value={nicheOption}
                  onChange={(e) => setNicheOption(e.target.value)}
                  className={`flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm outline-none ${nicheOption ? 'text-zinc-200' : 'text-zinc-500'}`}
                >
                  <option value="" disabled hidden>Choose niche</option>
                  {nicheOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (nicheOption && selectedNiches.length < 3 && !selectedNiches.includes(nicheOption)) {
                      setSelectedNiches([...selectedNiches, nicheOption]);
                    }
                  }}
                  disabled={!nicheOption || selectedNiches.length >= 3 || selectedNiches.includes(nicheOption)}
                  className="rounded-xl border border-sky-500/40 px-3 py-2 text-sm text-sky-300 transition-colors duration-200 hover:bg-sky-500 hover:text-white active:bg-sky-500 active:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedNiches.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-sm text-zinc-200">
                    {item}
                    <button
                      type="button"
                      onClick={() => setSelectedNiches(selectedNiches.filter((nicheItem) => nicheItem !== item))}
                      className="text-zinc-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={futureStartEnabled} onChange={(e) => setFutureStartEnabled(e.target.checked)} className="h-4 w-4 rounded border-zinc-700 bg-zinc-950" />
              Future
            </label>
            {futureStartEnabled && (
              <div className="mt-3">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Start date</label>
                <div className="flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center">
                  <input
                    ref={dayRef}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={startDay}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                    onChange={(e) => setStartDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                    placeholder="DD"
                    min={1}
                    max={31}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={startMonth}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                    onChange={(e) => setStartMonth(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                    placeholder="MM"
                    min={1}
                    max={12}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={startYear}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                    onChange={(e) => setStartYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                    placeholder="YYYY"
                    min={currentYear}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 min-[360px]:grid-cols-2">
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Budget</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={totalBudget}
                  onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                  onChange={(e) => setTotalBudget(sanitizeDigits(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  placeholder="OOOOO"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  {totalBudget ? `Budget: ${convertToDisplayUnit(parseFormatted(totalBudget)).toLowerCase()}` : 'Enter the campaign budget.'}
                </p>
              </div>

              <div className="w-full">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cost per mile (CPM)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={cpmInput}
                  onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                  onChange={(e) => setCpmInput(sanitizeDigits(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  placeholder="OOOO"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  {budgetRules.budget > 0
                    ? `cpm ${convertToDisplayUnit(budgetRules.cpmRange.min).toLowerCase()} - ${convertToDisplayUnit(budgetRules.cpmRange.max).toLowerCase()}`
                    : 'Set budget first to see the CPM range.'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 min-[360px]:grid-cols-2">
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Min payout</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={minPayout}
                  onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                  onChange={(e) => setMinPayout(sanitizeDigits(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  placeholder="OOOO"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  {budgetRules.budget > 0
                    ? `min ${convertToDisplayUnit(budgetRules.minLower).toLowerCase()} - ${convertToDisplayUnit(budgetRules.minUpper).toLowerCase()}`
                    : 'Set budget first to see min payout range.'}
                </p>
              </div>

              <div className="w-full">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Max payout</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={maxPayout}
                  onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                  onChange={(e) => setMaxPayout(sanitizeDigits(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  placeholder="OOOO"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  {budgetRules.budget > 0
                    ? `max ${convertToDisplayUnit(budgetRules.maxLower).toLowerCase()} - ${convertToDisplayUnit(budgetRules.maxUpper).toLowerCase()}`
                    : 'Set budget first to see max payout range.'}
                </p>
              </div>
            </div>
          </div>

          {budgetRules.violations.length > 0 && (
            <div className="mt-2 space-y-1 text-xs text-red-400">
              {budgetRules.violations.map((rule) => (
                <p key={rule}>{rule}</p>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Days remaining</label>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {[
                { value: '5', label: '5d', fee: 1000 },
                { value: '10', label: '10d', fee: 1000 },
                { value: '16', label: '16d', fee: 1000 },
                { value: '30', label: '1m', fee: 2000 },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTimeRemainingDays(option.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${timeRemainingDays === option.value ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-200'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">
              {timeRemainingSelected ? `Publishing fee: ${publishFee.toLocaleString()} UGX` : 'Select a duration to see the publishing fee.'}
            </p>
            {!timeRemainingSelected && (
              <p className="mt-2 text-xs text-red-400">Please select the desired campaign duration.</p>
            )}
          </div>
        </div>

          </div>

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        </div>

        <div className="border-t border-zinc-900 px-6 py-4">
          <div className="flex w-full flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-zinc-700 bg-transparent px-6 py-2.5 text-sm font-semibold text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white active:bg-red-500 active:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isReadyToPublish}
              className={`flex-1 rounded-full border border-emerald-500/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-emerald-500 transition-all duration-200 ${isSubmitting || !isReadyToPublish ? 'cursor-not-allowed opacity-50' : 'hover:bg-emerald-500 hover:text-white active:bg-emerald-500 active:text-white'} `}
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

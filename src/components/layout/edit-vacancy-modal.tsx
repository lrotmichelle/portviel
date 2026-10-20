'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditVacancyModalProps {
  isOpen: boolean;
  job: any;
  onClose: () => void;
  onSave: (updatedJob: any) => void;
}

export default function EditVacancyModal({ isOpen, job, onClose, onSave }: EditVacancyModalProps) {
  const [description, setDescription] = useState('');
  const [vacantSlots, setVacantSlots] = useState('1');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [timeToHire, setTimeToHire] = useState<'7days' | '14days' | '21days'>('14days');

  useEffect(() => {
    if (job) {
      setDescription(job.description || '');
      setVacantSlots(String(job.requiredPeople || 1));
      setMinSalary(String(job.minSalary || 0));
      setMaxSalary(String(job.maxSalary || 0));
      const days = job.daysRemaining || 14;
      if (days <= 7) setTimeToHire('7days');
      else if (days >= 21) setTimeToHire('21days');
      else setTimeToHire('14days');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSave = () => {
    const calculatedDays = timeToHire === '7days' ? 7 : timeToHire === '21days' ? 21 : 14;
    onSave({
      ...job,
      description,
      requiredPeople: parseInt(vacantSlots, 10) || 1,
      minSalary: parseInt(minSalary, 10) || 0,
      maxSalary: parseInt(maxSalary, 10) || 0,
      daysRemaining: Math.max(calculatedDays, job.daysRemaining || 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Edit Vacancy</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4 text-left">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Job Description</label>
              <span className="text-[9px] font-medium text-zinc-600">{description.length}/250</span>
            </div>
            <textarea
              rows={3}
              maxLength={250}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none resize-none placeholder:text-zinc-600"
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Vacant</label>
              <input
                type="text"
                inputMode="numeric"
                value={vacantSlots}
                onChange={(e) => setVacantSlots(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Min Salary</label>
              <input
                type="text"
                inputMode="numeric"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Max Salary</label>
              <input
                type="text"
                inputMode="numeric"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Time to Hire</label>
            <div className="grid grid-cols-3 gap-2">
              {(['7days', '14days', '21days'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeToHire(t)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border select-none transform transition-all duration-150 active:scale-95 ${
                    timeToHire === t
                      ? 'bg-white text-black border-white shadow-md shadow-white/5'
                      : 'bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-900/40 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {t === '7days' ? '7 Days' : t === '14days' ? '14 Days' : '21 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-transparent hover:bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:border-blue-500/60 font-bold uppercase tracking-widest text-[10px] py-2.5 rounded-xl transition-all duration-150"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

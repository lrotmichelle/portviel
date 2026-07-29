'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface RecruitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (newJobData: any) => void;
}

export default function RecruitModal({ isOpen, onClose, onPublishSuccess }: RecruitModalProps) {
  const [title, setTitle] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [vacantSlots, setVacantSlots] = useState('1');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  
  // Time selection states
  const [timeToHire, setTimeToHire] = useState<'7days' | '14days' | '21days'>('14days');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePublishListing = async () => {
    if (!title || !employerName || !description) {
      alert("Please fill in the required fields (Title, Company, and Description)!");
      return;
    }

    setIsSubmitting(true);

    const calculatedDays = timeToHire === '7days' ? 7 : timeToHire === '21days' ? 21 : 14;

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({
          title,
          employerName,
          description,
          skills,
          vacant: parseInt(vacantSlots, 10) || 1,
          minSalary: parseInt(minSalary, 10) || 0,
          maxSalary: parseInt(maxSalary, 10) || 0,
          daysRemaining: calculatedDays,
          category: 'general',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to publish vacancy');
      }

      if (onPublishSuccess) {
        onPublishSuccess({
          title: payload.item?.title ?? title,
          employerName: payload.item?.employerName ?? employerName,
          description: payload.item?.description ?? description,
          skills: payload.item?.requirements ? String(payload.item.requirements).split(',').map((s: string) => s.trim()).filter(Boolean) : skills,
          vacant: payload.item?.requiredPeople ?? (parseInt(vacantSlots, 10) || 1),
          minSalary: payload.item?.minSalary ?? (parseInt(minSalary, 10) || 0),
          maxSalary: payload.item?.maxSalary ?? (parseInt(maxSalary, 10) || 0),
          daysRemaining: payload.item?.daysRemaining ?? calculatedDays,
        });
      }

      setTitle('');
      setEmployerName('');
      setDescription('');
      setSkills([]);
      setVacantSlots('1');
      setMinSalary('');
      setMaxSalary('');
      setTimeToHire('14days');
      onClose();
    } catch (error) {
      console.error('Submission transmission pipeline failed:', error);
      alert(error instanceof Error ? error.message : 'Unable to publish vacancy right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length >= 6) return;
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleVacantChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '');
    if (numericValue === '') { setVacantSlots(''); return; }
    const num = parseInt(numericValue, 10);
    setVacantSlots(num > 80 ? '80' : numericValue);
  };

  const handleSalaryChange = (val: string, setter: (v: string) => void) => {
    setter(val.replace(/[^0-9]/g, ''));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        
        {/* Close Button Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200">Create Vacancy</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <div className="space-y-4 text-left">
          {/* Job Title Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Job Title</label>
              <span className="text-[9px] font-medium text-zinc-600">{title.length}/15</span>
            </div>
            <input 
              type="text" 
              maxLength={15}
              placeholder="e.g. UX Designer"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none placeholder:text-zinc-600"
            />
          </div>

          {/* Company Name Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Company Name</label>
              <span className="text-[9px] font-medium text-zinc-600">{employerName.length}/18</span>
            </div>
            <input 
              type="text" 
              maxLength={18}
              placeholder="e.g. PortVille"
              value={employerName} 
              onChange={(e) => setEmployerName(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none placeholder:text-zinc-600"
            />
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Vacant</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Max 80"
                value={vacantSlots} 
                onChange={(e) => handleVacantChange(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Min Salary</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="800000"
                value={minSalary} 
                onChange={(e) => handleSalaryChange(e.target.value, setMinSalary)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Max Salary</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="1200000"
                value={maxSalary} 
                onChange={(e) => handleSalaryChange(e.target.value, setMaxSalary)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Description Block */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Job Description</label>
              <span className="text-[9px] font-medium text-zinc-600">{description.length}/350</span>
            </div>
            <textarea 
              rows={3}
              maxLength={350}
              placeholder="Outline parameters/context..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Interactive Skills Chip Matrix */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Requirements / Skills</label>
              <span className="text-[9px] font-medium text-zinc-600">{skills.length}/6 items</span>
            </div>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                disabled={skills.length >= 6}
                placeholder={skills.length >= 6 ? "Full" : "Add tag (e.g. Figma)"}
                value={currentSkill} 
                onChange={(e) => setCurrentSkill(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-2.5 text-xs text-zinc-200 focus:border-zinc-700 outline-none placeholder:text-zinc-600"
              />
              <button 
                type="button"
                onClick={handleAddSkill}
                disabled={skills.length >= 6}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-45 disabled:cursor-not-allowed p-2.5 rounded-xl text-zinc-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-md">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(i)} className="text-zinc-500 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Time to Hire Responsive Section */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Time to Hire</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTimeToHire('7days')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border select-none transform transition-all duration-150 active:scale-95 ${
                  timeToHire === '7days'
                    ? 'bg-white text-black border-white shadow-md shadow-white/5'
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-900/40 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeToHire('14days')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border select-none transform transition-all duration-150 active:scale-95 ${
                  timeToHire === '14days'
                    ? 'bg-white text-black border-white shadow-md shadow-white/5'
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-900/40 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeToHire('21days')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border select-none transform transition-all duration-150 active:scale-95 ${
                  timeToHire === '21days'
                    ? 'bg-white text-black border-white shadow-md shadow-white/5'
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-900/40 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                21 Days
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Submission Action Button */}
        <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-end">
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handlePublishListing}
            className="w-full bg-transparent hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-50 border border-emerald-500/30 hover:border-emerald-500/60 font-bold uppercase tracking-widest text-[10px] py-2.5 rounded-xl transition-all duration-150"
          >
            {isSubmitting ? "Publishing..." : "Publish Vacant Role"}
          </button>
        </div>

      </div>
    </div>
  );
}
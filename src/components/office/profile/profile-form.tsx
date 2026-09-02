'use client';

import React, { useEffect, useState } from 'react';
import { ProfileData, emptyExperience, emptyProfile, emptyReference } from './profile-data';
import { jsPDF } from 'jspdf';

const STORAGE_KEY = 'user-profile';

type SectionKey = 'personal' | 'experience' | 'skills' | 'references' | 'achievements' | 'education';

export default function ProfileForm() {
  const [expanded, setExpanded] = useState(false);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    experience: true,
    skills: true,
    references: true,
    achievements: false,
    education: false,
  });
  const [profile, setProfile] = useState<ProfileData>(emptyProfile());
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const toggleSection = (key: SectionKey) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    updateField('experiences', [...profile.experiences, emptyExperience()]);
  };

  const removeExperience = (id: string) => {
    updateField('experiences', profile.experiences.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: 'period' | 'description', value: string) => {
    updateField(
      'experiences',
      profile.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const addReference = () => {
    if (profile.references.length >= 3) return;
    updateField('references', [...profile.references, emptyReference()]);
  };

  const removeReference = (id: string) => {
    updateField('references', profile.references.filter((r) => r.id !== id));
  };

  const updateReference = (id: string, field: 'name' | 'email' | 'phone', value: string) => {
    updateField(
      'references',
      profile.references.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const toggleSkill = (skill: string) => {
    const exists = profile.softSkills.includes(skill);
    if (exists) {
      updateField('softSkills', profile.softSkills.filter((s) => s !== skill));
    } else if (profile.softSkills.length < 5) {
      updateField('softSkills', [...profile.softSkills, skill]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > 280) {
        doc.addPage();
        y = 20;
      }
    };

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.name || 'Profile', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const contactParts = [profile.email, profile.phone, profile.address].filter(Boolean);
    if (contactParts.length) {
      doc.text(contactParts.join(' | '), pageWidth / 2, y, { align: 'center' });
      y += 8;
    }

    if (profile.about) {
      doc.setFont('helvetica', 'bold');
      doc.text('About', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const aboutLines = doc.splitTextToSize(profile.about, pageWidth - 30);
      doc.text(aboutLines, 15, y);
      y += aboutLines.length * 6 + 6;
    }

    if (profile.experiences.length) {
      checkPage(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Experience', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      for (const exp of profile.experiences) {
        checkPage(14);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.period || 'Experience', 15, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(exp.description, pageWidth - 30);
        doc.text(descLines, 15, y);
        y += descLines.length * 5 + 6;
      }
    }

    if (profile.softSkills.length) {
      checkPage(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Soft Skills', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(profile.softSkills.join(', '), 15, y);
      y += 8;
    }

    if (profile.achievements) {
      checkPage(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Achievements', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const achLines = doc.splitTextToSize(profile.achievements, pageWidth - 30);
      doc.text(achLines, 15, y);
      y += achLines.length * 6 + 6;
    }

    if (profile.education) {
      checkPage(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Education', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const eduLines = doc.splitTextToSize(profile.education, pageWidth - 30);
      doc.text(eduLines, 15, y);
      y += eduLines.length * 6 + 6;
    }

    if (profile.references.length) {
      checkPage(20);
      doc.setFont('helvetica', 'bold');
      doc.text('References', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      for (const ref of profile.references) {
        checkPage(14);
        const refParts = [ref.name, ref.email, ref.phone].filter(Boolean);
        doc.text(refParts.join(' | '), 15, y);
        y += 6;
      }
    }

    doc.save(`${profile.name || 'profile'}_resume.pdf`);
  };

  const saveProfile = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    generatePDF();
    setMessage('Profile saved. Resume PDF generated.');
    setExpanded(false);
  };

  const startCreate = () => {
    setProfile(emptyProfile());
    setMessage('');
    setExpanded(true);
  };

  const startUpdate = () => {
    setMessage('');
    setExpanded(true);
  };

  if (!expanded) {
    return (
      <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 lg:col-span-2 no-scrollbar">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Profile</h2>
        <p className="mt-3 text-xs text-zinc-500">Create or update your profile to generate an auto resume.</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={startCreate} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">Create profile</button>
          <button type="button" onClick={startUpdate} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 hover:border-zinc-500">Update profile</button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800/60 bg-black p-5 lg:col-span-2 no-scrollbar">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Profile</h2>

      <div className="mt-4 space-y-3">
        {(['personal', 'experience', 'skills', 'references', 'achievements', 'education'] as SectionKey[]).map((key) => (
          <div key={key} className="rounded-xl border border-zinc-700/80">
            <button type="button" onClick={() => toggleSection(key)} className="flex w-full items-center justify-between px-3 py-2 text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300">{key === 'personal' ? 'Personal information' : key === 'experience' ? 'Experience' : key === 'skills' ? 'Soft skills' : key === 'references' ? 'References' : key === 'achievements' ? 'Achievements' : 'Education'}</span>
              <span className="text-zinc-500">{sections[key] ? '−' : '+'}</span>
            </button>
            {sections[key] && <SectionContent key={key} section={key} profile={profile} updateField={updateField} addExperience={addExperience} removeExperience={removeExperience} updateExperience={updateExperience} addReference={addReference} removeReference={removeReference} updateReference={updateReference} toggleSkill={toggleSkill} />}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={saveProfile} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 hover:bg-emerald-500/10">Save profile</button>
        <button type="button" onClick={() => setExpanded(false)} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 hover:border-zinc-500">Cancel</button>
      </div>
      {message && <p className="mt-2 text-xs text-emerald-400">{message}</p>}
    </section>
  );
}

function SectionContent({ section, profile, updateField, addExperience, removeExperience, updateExperience, addReference, removeReference, updateReference, toggleSkill }: {
  section: SectionKey;
  profile: ProfileData;
  updateField: <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, field: 'period' | 'description', value: string) => void;
  addReference: () => void;
  removeReference: (id: string) => void;
  updateReference: (id: string, field: 'name' | 'email' | 'phone', value: string) => void;
  toggleSkill: (skill: string) => void;
}) {
  const allSkills = ['Communication', 'Teamwork', 'Leadership', 'Problem solving', 'Time management', 'Adaptability', 'Creativity', 'Critical thinking'];

  if (section === 'personal') {
    return (
      <div className="space-y-3 border-t border-zinc-800/60 p-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-zinc-400"><span className="mb-1 block">Name</span><input value={profile.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
          <label className="text-xs text-zinc-400"><span className="mb-1 block">Email</span><input value={profile.email} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
        </div>
        <label className="text-xs text-zinc-400"><span className="mb-1 block">About me (max 400 characters)</span><textarea value={profile.about} onChange={(e) => { if (e.target.value.length <= 400) updateField('about', e.target.value); }} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 resize-none" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-zinc-400"><span className="mb-1 block">Phone</span><input value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
          <label className="text-xs text-zinc-400"><span className="mb-1 block">Address</span><input value={profile.address} onChange={(e) => updateField('address', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
        </div>
      </div>
    );
  }

  if (section === 'experience') {
    return (
      <div className="space-y-3 border-t border-zinc-800/60 p-3">
        {profile.experiences.map((exp, index) => (
          <div key={exp.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Experience {index + 1}</span>
              <button type="button" onClick={() => removeExperience(exp.id)} className="text-[10px] text-red-400">Remove</button>
            </div>
            <label className="text-xs text-zinc-400"><span className="mb-1 block">Period (e.g. 2020 - 2023)</span><input value={exp.period} onChange={(e) => updateExperience(exp.id, 'period', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <label className="text-xs text-zinc-400"><span className="mb-1 block">Description (max 325 characters)</span><textarea value={exp.description} onChange={(e) => { if (e.target.value.length <= 325) updateExperience(exp.id, 'description', e.target.value); }} rows={2} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 resize-none" /></label>
          </div>
        ))}
        <button type="button" onClick={addExperience} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">Add experience</button>
      </div>
    );
  }

  if (section === 'skills') {
    return (
      <div className="border-t border-zinc-800/60 p-3">
        <p className="mb-2 text-[11px] text-zinc-500">Select up to 5 soft skills</p>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((skill) => {
            const selected = profile.softSkills.includes(skill);
            return (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition ${selected ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                {skill}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">{profile.softSkills.length}/5 selected</p>
      </div>
    );
  }

  if (section === 'references') {
    return (
      <div className="space-y-3 border-t border-zinc-800/60 p-3">
        {profile.references.map((ref, index) => (
          <div key={ref.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Reference {index + 1} of 3</span>
              <button type="button" onClick={() => removeReference(ref.id)} className="text-[10px] text-red-400">Remove</button>
            </div>
            <label className="text-xs text-zinc-400"><span className="mb-1 block">Name</span><input value={ref.name} onChange={(e) => updateReference(ref.id, 'name', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-400"><span className="mb-1 block">Email</span><input value={ref.email} onChange={(e) => updateReference(ref.id, 'email', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
              <label className="text-xs text-zinc-400"><span className="mb-1 block">Phone</span><input value={ref.phone} onChange={(e) => updateReference(ref.id, 'phone', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" /></label>
            </div>
          </div>
        ))}
        {profile.references.length < 3 && <button type="button" onClick={addReference} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">Add reference</button>}
      </div>
    );
  }

  if (section === 'achievements') {
    return (
      <div className="border-t border-zinc-800/60 p-3">
        <label className="text-xs text-zinc-400"><span className="mb-1 block">Achievements (optional)</span><textarea value={profile.achievements} onChange={(e) => updateField('achievements', e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 resize-none" /></label>
      </div>
    );
  }

  if (section === 'education') {
    return (
      <div className="border-t border-zinc-800/60 p-3">
        <label className="text-xs text-zinc-400"><span className="mb-1 block">Education (optional)</span><textarea value={profile.education} onChange={(e) => updateField('education', e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 resize-none" /></label>
      </div>
    );
  }

  return null;
}

'use client';

import React, { useEffect } from 'react';

interface EditProfileModalProps {
  isOpen: boolean;
  userData: {
    name: string;
    username: string;
    legalName: string;
  };
  onClose: () => void;
  onSave: (data: { name: string; username: string }) => void;
}

export function EditProfileModal({ isOpen, userData, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = React.useState(userData.name);
  const [username, setUsername] = React.useState(userData.username);

  useEffect(() => {
    if (isOpen) {
      setName(userData.name);
      setUsername(userData.username);
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ name, username });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-white">Edit Profile Details</h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300">Public Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
            <p className="text-[11px] text-zinc-500">Public trading or seller name.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300">Username Handle</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold">@</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 font-mono font-medium"
              />
            </div>
            <p className="text-[11px] text-zinc-500">Must be globally unique for your handle URL (`/@handle`).</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-xs text-zinc-300 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-xs text-zinc-950 transition shadow-lg shadow-emerald-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
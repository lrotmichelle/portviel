'use client';

import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';

interface ProfileHeaderProps {
  userData: {
    id: string;
    name: string;
    legalName: string;
    username: string;
    avatarUrl: string | null;
    kycStatus: 'verified' | 'unverified' | 'pending';
  };
  onEdit: () => void;
  onVerify: () => void;
  isOwnProfile?: boolean;
}

export function ProfileHeader({ userData, onEdit, onVerify, isOwnProfile = true }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = userData.kycStatus === 'verified' 
    ? (userData.legalName || userData.name)
    : userData.name;

  const isVerified = userData.kycStatus === 'verified';
  const ringGradient = isVerified 
    ? 'from-emerald-400 via-emerald-500 to-emerald-600'
    : 'from-amber-400 via-amber-500 to-amber-600';
  const ringShadow = isVerified 
    ? 'shadow-emerald-950/40'
    : 'shadow-amber-950/40';
  const usernameColor = isVerified ? 'text-emerald-400' : 'text-amber-400';
  const initialsColor = isVerified ? 'text-emerald-400' : 'text-amber-400';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent p-4 shadow-2xl">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-1 group">
          <div className={`w-16 h-16 rounded-full p-[1px] bg-gradient-to-tr ${ringGradient} shadow-xl ${ringShadow}`}>
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
              {userData.avatarUrl ? (
                <img 
                  src={userData.avatarUrl} 
                  alt={userData.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className={`text-base font-black ${initialsColor}`}>
                  {getInitials(userData.name)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-0.5">
          <h1 className="text-lg font-extrabold tracking-tight text-white">
            {displayName}
          </h1>
        </div>

        <div className="flex items-center mt-0">
          <span className={`text-[10px] font-medium ${usernameColor} flex items-center`}>
            @{userData.username}
            {isVerified && (
              <CheckCircle className="w-2 h-2 text-amber-500 fill-amber-500/10 shrink-0" strokeWidth={2.5} />
            )}
          </span>
        </div>

        {isOwnProfile && !isVerified && (
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <button 
              onClick={onVerify}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify
            </button>
            <button 
              onClick={onEdit}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
import Link from 'next/link';
import React from 'react';

interface HeaderProps {
  name: string;
  handle: string;
  accountId: string;
  rating?: number;
  daysRemaining: number;
  niche: string;
  maxSalary: number;
  salaryPeriod?: 'day' | 'week' | 'month';
}

export const Header: React.FC<HeaderProps> = ({ name, handle, accountId, daysRemaining, maxSalary, salaryPeriod = 'month' }) => {
  const getInitials = (n: string) => {
    if (!n) return "?";
    return n.split(' ').map(p => p ? p[0] : '').join('').toUpperCase();
  };
  const cleanHandle = handle ? handle.replace('@', '') : 'anonymous';

  // State calculations for formatting
  const isUrgent = !isNaN(daysRemaining) && daysRemaining < 4;

  const formatTime = (d: number) => {
    if (isNaN(d) || d <= 0) return "00:00:00";
    if (d >= 1) return `${Math.floor(d)}d`;
    
    const totalSeconds = d * 24 * 3600;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatUGX = (amount: number) => {
    if (!amount || isNaN(amount)) return "UGX 0";
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `UGX ${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
    }
    return `UGX ${Math.floor(amount / 1000)}k`;
  };

  // Dynamically assigns text colors for the timer string component
  const getTimerTextClass = (d: number) => {
    if (isUrgent) return "text-red-400 animate-pulse";
    if (d < 7) return "text-amber-400";
    if (d < 12) return "text-emerald-400";
    return "text-blue-400";
  };

  return (
    <div className="flex items-center justify-between w-full bg-transparent border border-zinc-800 rounded-xl p-3">
      
      {/* LEFT COLUMN: Org Ring Logo, Names, Handles, Borderless Ratings */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href={`/profile/${accountId}`} className="block">
          <div className="w-9 h-9 rounded-full border border-zinc-700 text-zinc-200 flex items-center justify-center text-[10px] font-black tracking-widest shrink-0 bg-transparent hover:border-emerald-500 transition-colors">
            {getInitials(name)}
          </div>
        </Link>
        
        <div className="flex flex-col min-w-0">
          <Link href={`/profile/${accountId}`} className="block">
            <h3 className="text-[9px] sm:text-[10px] font-bold text-zinc-100 truncate leading-tight uppercase tracking-wide hover:text-emerald-400 transition-colors">
              {name || "Anonymous"}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 min-w-0">
            <p className="text-[8px] sm:text-[9px] text-zinc-500 truncate">
              @{cleanHandle}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Time metrics block stacked directly over high salary value */}
      <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0 font-mono text-right">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className={`text-[9px] sm:text-[10px] font-black tracking-tight ${getTimerTextClass(daysRemaining)}`}>
            {formatTime(daysRemaining)}
          </span>
        </div>

        <div className="text-emerald-400 font-black text-[9px] sm:text-[10px] tracking-wide">
          {formatUGX(maxSalary)} / {salaryPeriod === 'day' ? 'd' : salaryPeriod === 'week' ? 'w' : 'm'}
        </div>
      </div> 

    </div>
  );
};
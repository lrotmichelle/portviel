import Link from 'next/link';
import React from 'react';
import { Star } from 'lucide-react';

interface HeaderProps {
  name: string;
  handle: string;
  accountId: string;
  rating: number;
  daysRemaining: number;
  niche: string;
  maxSalary: number;
}

export const Header: React.FC<HeaderProps> = ({ name, handle, accountId, rating, daysRemaining, maxSalary }) => {
  const getInitials = (n: string) => {
    if (!n) return "?";
    return n.split(' ').map(p => p ? p[0] : '').join('').toUpperCase();
  };
  const cleanHandle = handle ? handle.replace('@', '') : 'anonymous';

  // State calculations for formatting
  const isMicroTimer = !isNaN(daysRemaining) && daysRemaining < 1;
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

  // Base configurations matching the text rendering rules
  const getTimerColors = (d: number) => {
    if (isUrgent) return "border-red-500/50 text-red-400";
    if (d < 7) return "border-amber-500/40 text-amber-400";
    if (d < 12) return "border-emerald-500/40 text-emerald-400";
    return "border-blue-500/40 text-blue-400";
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
        <div className="w-10 h-10 rounded-full border border-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-black tracking-widest shrink-0 bg-transparent">
          {getInitials(name)}
        </div>
        
        <div className="flex flex-col min-w-0">
          <Link href={`/profile/${accountId}`} className="block">
            <h3 className="text-[10px] sm:text-xs font-bold text-zinc-100 truncate leading-tight uppercase tracking-wide hover:text-emerald-400 transition-colors">
              {name || "Anonymous"}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 min-w-0">
            <p className="text-[9px] sm:text-[11px] text-zinc-500 truncate">
              @{cleanHandle}
            </p>
            <span className="text-zinc-600 font-light text-[9px] sm:text-[10px] select-none">•</span>
            <div className="flex items-center gap-0.5 shrink-0 bg-transparent">
              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-amber-500 text-amber-500 stroke-amber-500" />
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-500/90">
                {(rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Time metrics block stacked directly over high salary value */}
      <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0 font-mono text-right">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className={`text-[10px] sm:text-xs font-black tracking-tight ${getTimerTextClass(daysRemaining)}`}>
            {formatTime(daysRemaining)}
          </span>
          
          {!isMicroTimer && (
            <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded border bg-transparent ${getTimerColors(daysRemaining)}`}>
              left
            </span>
          )}
        </div>

        <div className="text-emerald-400 font-black text-[10px] sm:text-xs tracking-wide">
          {formatUGX(maxSalary)}
        </div>
      </div> 

    </div>
  );
};
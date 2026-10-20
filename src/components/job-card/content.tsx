import React from 'react';
import { Users, CheckCircle2, UserPlus } from 'lucide-react';

interface ContentProps {
  title?: string;
  requiredPeople: number;
  applicants: number;
  accepted: number;
  description?: string;
  requirements?: string[];
}

export const Content: React.FC<ContentProps> = ({ 
  title,
  requiredPeople, 
  applicants, 
  accepted, 
  description = 'No description available.', 
  requirements = [] 
}) => {
  return (
    <div className="mt-3.5 flex flex-col h-full">
      {title && (
        <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">
          {title}
        </h3>
      )}

      {/* 1. Complete Description Text Block */}
      <p className="text-xs text-zinc-400 font-normal leading-relaxed text-left">
        {description}
      </p>

      {/* 2. Requirements | Skills Section */}
      {requirements.length > 0 && (
        <div className="space-y-2 text-left">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-100 underline decoration-zinc-700 underline-offset-4">
            Requirements | Skills
          </h4>
          
          <div className="flex flex-wrap gap-1.5 pt-0.5 justify-start">
            {requirements.map((skill, index) => (
              <span 
                key={index} 
                className="text-[10px] font-semibold tracking-wide text-zinc-400 rounded-md px-2.5 py-1 bg-zinc-900 transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to push metrics to bottom */}
      <div className="flex-1" />

      {/* 3. Reordered and re-aligned metrics matrix */}
      <div className="grid grid-cols-3 gap-2 bg-transparent p-2.5 rounded-xl border border-zinc-800 text-center">
        
        {/* FIRST: Required Column */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-indigo-400">{requiredPeople}</span>
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mt-1">Required</p>
        </div>
        
        {/* SECOND: Applicants Column */}
        <div className="flex flex-col items-center justify-center border-x border-zinc-800 px-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-zinc-300">{applicants}</span>
            <Users className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <p className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mt-1">Applicants</p>
        </div>
        
        {/* THIRD: Accepted Column */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-emerald-400">{accepted}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider mt-1">Accepted</p>
        </div>

      </div>
    </div>
  );
};
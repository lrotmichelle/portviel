import React from 'react';

interface FooterProps {
  status: 'apply' | 'paused' | 'filled' | 'acquired';
  onApply?: () => void;
  isOwnJob?: boolean;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

export const Footer: React.FC<FooterProps> = ({ status, onApply, isOwnJob = false, applicationStatus = null }) => {
  const getButtonConfig = () => {
    if (isOwnJob) {
      return {
        text: "Can't apply to your own job",
        isDisabled: true,
        styles: 'border-zinc-800 text-zinc-500 cursor-not-allowed'
      };
    }

    // If user has already applied
    if (applicationStatus) {
      if (applicationStatus === 'pending') {
        return {
          text: 'Pending',
          isDisabled: true,
          styles: 'border-amber-500/80 text-amber-400 cursor-not-allowed'
        };
      }
      if (applicationStatus === 'accepted') {
        return {
          text: 'Accepted',
          isDisabled: true,
          styles: 'border-emerald-500/80 text-emerald-400 cursor-not-allowed'
        };
      }
      if (applicationStatus === 'rejected') {
        return {
          text: 'Apply Now',
          isDisabled: false,
          styles: 'border-emerald-500/80 text-emerald-400 hover:bg-emerald-500 active:bg-emerald-500 hover:text-white active:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        };
      }
    }

    switch (status) {
      case 'paused':
        return {
          text: 'Paused',
          isDisabled: true,
          styles: 'border-zinc-800 text-amber-500/80 cursor-not-allowed'
        };
      case 'filled':
        return {
          text: 'Slots Filled',
          isDisabled: true,
          styles: 'border-zinc-800 text-zinc-500 cursor-not-allowed'
        };
      case 'acquired':
        return {
          text: 'Acquired',
          isDisabled: true,
          styles: 'border-zinc-800 text-indigo-500/80 cursor-not-allowed'
        };
      case 'apply':
      default:
        return {
          text: 'Apply Now',
          isDisabled: false,
          styles: 'border-emerald-500/80 text-emerald-400 hover:bg-emerald-500 active:bg-emerald-500 hover:text-white active:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        };
    }
  };

  const button = getButtonConfig();

  return (
    <div className="w-full pt-1">
      <button
        type="button"
        disabled={button.isDisabled}
        onClick={onApply}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 bg-transparent border select-none ${button.styles}`}
      >
        {button.text}
      </button>
    </div>
  );
};
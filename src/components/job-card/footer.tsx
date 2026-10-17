import React from 'react';

interface FooterProps {
  status: 'apply' | 'paused' | 'filled' | 'acquired';
  onApply?: () => void;
  isOwnJob?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ status, onApply, isOwnJob = false }) => {
  
  const getButtonConfig = () => {
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
          text: isOwnJob ? "Can't apply to your own job" : 'Apply Now',
          isDisabled: true,
          styles: 'border-zinc-800 text-zinc-500 cursor-not-allowed'
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
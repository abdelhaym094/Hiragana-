import React from 'react';

export type AnswerState = 'neutral' | 'correct' | 'wrong' | 'dimmed';

interface AnswerButtonProps {
  label: string;
  subLabel?: string;
  onClick: () => void;
  state?: AnswerState;
  disabled?: boolean;
  shortcut?: string | number;
  isJapanese?: boolean;
  className?: string;
}

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  label,
  subLabel,
  onClick,
  state = 'neutral',
  disabled = false,
  shortcut,
  isJapanese = false,
  className = ''
}) => {
  const stateStyles = {
    neutral: 'bg-[#171C22] border-[#282F38] border-b-4 border-b-[#11151A] text-[#F5F7FA] hover:bg-[#1D232B] hover:border-[#384250] active:translate-y-0.5 active:border-b-2',
    correct: 'bg-[#42E6A4]/15 border-[#42E6A4] border-b-4 border-b-[#2da375] text-[#42E6A4] shadow-lg shadow-[#42E6A4]/10',
    wrong: 'bg-[#FF5C7A]/15 border-[#FF5C7A] border-b-4 border-b-[#c73a54] text-[#FF5C7A] animate-shake',
    dimmed: 'bg-[#11151A]/60 border-[#282F38]/40 border-b-2 text-[#8B949E]/40 opacity-40 cursor-not-allowed'
  }[state];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state !== 'neutral'}
      className={`relative w-full min-h-[62px] p-3 rounded-2xl border-2 flex items-center justify-between transition-all duration-100 cursor-pointer shadow-md select-none ${stateStyles} ${className}`}
    >
      <div className="flex items-center gap-3 w-full">
        {shortcut !== undefined && (
          <span className="w-6 h-6 rounded-lg bg-[#080A0D]/70 border border-[#282F38] text-[11px] font-mono font-bold text-[#8B949E] flex items-center justify-center shrink-0">
            {shortcut}
          </span>
        )}
        <div className="flex-1 text-center">
          <span className={`block font-extrabold leading-tight ${isJapanese ? 'text-3xl font-japanese' : 'text-xl uppercase tracking-wider'}`}>
            {label}
          </span>
          {subLabel && (
            <span className="block text-xs text-[#8B949E] mt-0.5 font-medium">
              {subLabel}
            </span>
          )}
        </div>
      </div>
      
      {state === 'correct' && (
        <span className="absolute right-3.5 text-base font-bold">✓</span>
      )}
      {state === 'wrong' && (
        <span className="absolute right-3.5 text-base font-bold">✕</span>
      )}
    </button>
  );
};

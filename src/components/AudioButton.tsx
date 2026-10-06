import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakJapanese, sfx } from '../utils/audio';

interface AudioButtonProps {
  text: string;
  enabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoPlay?: boolean;
  label?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  enabled = true,
  size = 'md',
  className = '',
  label
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    sfx.click(enabled);
    speakJapanese(text, enabled).finally(() => {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    });
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base'
  }[size];

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Pronounce Japanese character ${text}`}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-[#1B2027] hover:bg-[#252C36] active:scale-95 text-[#FFD166] border border-[#252C36] transition-all duration-150 cursor-pointer shadow-sm ${sizeClasses} ${className}`}
    >
      <Volume2
        size={iconSizes}
        className={`transition-transform duration-200 ${isPlaying ? 'scale-115 text-[#FF5C7A]' : ''}`}
      />
      {label && <span className="ml-2 font-medium text-xs text-[#F7F7F5]">{label}</span>}
      {isPlaying && (
        <span className="absolute inset-0 rounded-2xl border-2 border-[#FF5C7A] animate-ping opacity-60 pointer-events-none" />
      )}
    </button>
  );
};

import React from 'react';
import { Volume2, VolumeX, Settings, User } from 'lucide-react';
import { UserProgress } from '../types';
import { getPlayerRank } from '../utils/achievements';

interface HeaderProps {
  progress: UserProgress;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onOpenSettings,
  onOpenProfile,
  onToggleSound,
  onHomeClick
}) => {
  const isAudioMuted = !progress.settings.soundEffects && !progress.settings.speechAudio;
  const playerRank = getPlayerRank(progress.totalXp);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080A0D]/95 backdrop-blur-md border-b border-[#282F38] px-4 py-2.5">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Zone 1: Brand title wordmark with Player Rank */}
        <button
          type="button"
          onClick={onHomeClick}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-[#11151A] border border-[#282F38] flex items-center justify-center text-base group-hover:border-[#FF5C7A] transition-colors shadow-sm">
            🇯🇵
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-[#F5F7FA] group-hover:text-[#FF5C7A] transition-colors leading-none flex items-center gap-1.5">
              <span>HIRAGANA QUEST</span>
            </h1>
            <span className="text-[10px] text-[#FFD166] font-mono tracking-wider uppercase font-semibold">
              Lv.{playerRank.level} · {playerRank.title}
            </span>
          </div>
        </button>

        {/* Zone 2 & 3: Compact Game Stats & Controls */}
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <div 
            title="Active Learning Streak"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#11151A] border border-[#282F38]"
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-[#FFD166] tabular-nums">
              {progress.streak}d
            </span>
          </div>

          {/* XP counter */}
          <div 
            title="Total XP"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#11151A] border border-[#282F38]"
          >
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-[#F5F7FA] tabular-nums">
              {progress.totalXp}
            </span>
          </div>

          {/* Audio toggle button */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
            className="w-8 h-8 rounded-xl bg-[#11151A] border border-[#282F38] hover:bg-[#171C22] flex items-center justify-center text-[#8B949E] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Profile / Journey modal trigger */}
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="View player journey and achievements"
            className="w-8 h-8 rounded-xl bg-[#11151A] border border-[#282F38] hover:border-[#FFD166]/50 flex items-center justify-center text-[#FFD166] transition-colors cursor-pointer"
          >
            <User size={15} />
          </button>

          {/* Settings trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="w-8 h-8 rounded-xl bg-[#11151A] border border-[#282F38] hover:bg-[#171C22] flex items-center justify-center text-[#8B949E] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

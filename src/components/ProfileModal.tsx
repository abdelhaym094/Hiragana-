import React from 'react';
import { X, Trophy, Flame, Brain, Shield, Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { UserProgress } from '../types';
import { getPlayerRank, ACHIEVEMENTS } from '../utils/achievements';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  progress
}) => {
  if (!isOpen) return null;

  const rank = getPlayerRank(progress.totalXp);
  const xpPct = Math.min(100, Math.round((rank.currentLevelXp / rank.nextLevelXp) * 100));

  const masteredCharacters = Object.values(progress.characters).filter(
    (c) => (c.masteryScore || 0) >= 4
  ).length;

  const memoryMastered = Object.values(progress.characters).filter(
    (c) => (c.memoryStrength || 0) >= 4
  ).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#14171C] border border-[#282F38] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282F38]">
          <div className="flex items-center gap-2">
            <span className="hanko-seal text-[9px]">DOJO PROFILE</span>
            <span className="text-xs font-bold text-[#8B949E]">Learner Stats</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1B2027] text-[#8B949E] hover:text-[#F5F7FA] border border-[#282F38] cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 py-3 pr-1">
          {/* Rank & Level Card */}
          <div className="p-4 rounded-2xl bg-[#080A0D] border border-[#282F38] text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#FFD166]/15 border border-[#FFD166]/40 flex items-center justify-center text-3xl mx-auto mb-2 shadow-inner">
              🇯🇵
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 text-[11px] font-mono font-bold text-[#FF5C7A] uppercase mb-1">
              Level {rank.level}
            </div>
            <h3 className="text-lg font-black text-[#F5F7FA] tracking-tight">
              {rank.title}
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5">
              {progress.totalXp} Total XP earned
            </p>

            {/* Level XP Progress Bar */}
            <div className="mt-3.5 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#8B949E]">
                <span>Progress to Next Rank</span>
                <span className="text-[#FFD166]">
                  {rank.currentLevelXp} / {rank.nextLevelXp} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#171C22] overflow-hidden p-0.5 border border-[#282F38]">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5C7A] to-[#FFD166] rounded-full transition-all duration-300"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#171C22] border border-[#282F38]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFD166] mb-1">
                <Flame size={15} />
                <span>Streak</span>
              </div>
              <span className="text-lg font-black text-[#F5F7FA] tabular-nums block">
                {progress.streak} Day{progress.streak === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] text-[#8B949E]">
                Best: {Math.max(progress.streak, progress.bestStreak || 0)} days
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#171C22] border border-[#282F38]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#42E6A4] mb-1">
                <CheckCircle2 size={15} />
                <span>Kana Mastered</span>
              </div>
              <span className="text-lg font-black text-[#F5F7FA] tabular-nums block">
                {masteredCharacters} / 46
              </span>
              <span className="text-[10px] text-[#8B949E]">
                Accurate recognition
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#171C22] border border-[#282F38]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5C7A] mb-1">
                <Brain size={15} />
                <span>Memory Strength</span>
              </div>
              <span className="text-lg font-black text-[#F5F7FA] tabular-nums block">
                {memoryMastered} / 46
              </span>
              <span className="text-[10px] text-[#8B949E]">
                Visual mnemonics locked
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#171C22] border border-[#282F38]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFD166] mb-1">
                <Shield size={15} />
                <span>7-Day Path</span>
              </div>
              <span className="text-lg font-black text-[#F5F7FA] tabular-nums block">
                {progress.completedDays.length} / 7
              </span>
              <span className="text-[10px] text-[#8B949E]">
                Portals cleared
              </span>
            </div>
          </div>

          {/* Cognitive Engine Stats */}
          <div className="p-3.5 rounded-2xl bg-[#080A0D]/70 border border-[#282F38] flex items-center justify-between text-center">
            <div className="flex-1">
              <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
                Total Retrievals
              </span>
              <span className="text-base font-black text-[#F5F7FA] tabular-nums mt-0.5 block">
                {progress.totalRetrievals || 0}
              </span>
            </div>
            <div className="h-8 w-px bg-[#282F38]" />
            <div className="flex-1">
              <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
                Durable Recalls
              </span>
              <span className="text-base font-black text-[#FFD166] tabular-nums mt-0.5 block">
                {progress.durableRecallCount || 0}
              </span>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                Achievements
              </span>
              <span className="text-[11px] font-mono text-[#FFD166]">
                {ACHIEVEMENTS.filter((a) => a.isUnlocked(progress)).length} / {ACHIEVEMENTS.length} Unlocked
              </span>
            </div>

            <div className="space-y-2">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = ach.isUnlocked(progress);
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      unlocked
                        ? 'bg-[#171C22] border-[#282F38]'
                        : 'bg-[#080A0D]/50 border-transparent opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#080A0D] border border-[#282F38] flex items-center justify-center text-xl shrink-0">
                        {ach.icon}
                      </div>
                      <div className="text-left">
                        <span className={`text-xs font-bold block ${unlocked ? 'text-[#F5F7FA]' : 'text-[#8B949E]'}`}>
                          {ach.title}
                        </span>
                        <span className="text-[10px] text-[#8B949E] leading-tight block">
                          {ach.description}
                        </span>
                      </div>
                    </div>

                    <div>
                      {unlocked ? (
                        <span className="text-[10px] font-bold text-[#42E6A4] px-2 py-0.5 rounded-full bg-[#42E6A4]/10 border border-[#42E6A4]/30">
                          Unlocked
                        </span>
                      ) : (
                        <Lock size={14} className="text-[#8B949E]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

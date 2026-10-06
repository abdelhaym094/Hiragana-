import React from 'react';
import { Target, Headphones, Shuffle, Zap, ShieldAlert, Trophy, ChevronRight, Brain, Sparkles } from 'lucide-react';
import { ViewMode } from '../types';
import { sfx } from '../utils/audio';

interface ArcadeViewProps {
  onSelectGame: (view: ViewMode) => void;
  soundEnabled: boolean;
  currentDay: number;
  unlockedDay: number;
  completedDays: number[];
}

export const ArcadeView: React.FC<ArcadeViewProps> = ({
  onSelectGame,
  soundEnabled,
  currentDay,
  completedDays
}) => {
  const games = [
    {
      id: 'cognitive-session' as ViewMode,
      title: 'Adaptive Memory Session',
      subtitle: 'Spaced reviews, reverse recall & confusion discrimination',
      xp: '+10 to +35 XP',
      icon: Sparkles,
      color: 'text-[#42E6A4]',
      bg: 'bg-[#42E6A4]/15'
    },
    {
      id: 'memory-test' as ViewMode,
      title: 'Memory Quest',
      subtitle: 'Visual mnemonics, concept icons & vocabulary links',
      xp: '+10 XP',
      icon: Brain,
      color: 'text-[#FFD166]',
      bg: 'bg-[#FFD166]/15'
    },
    {
      id: 'mini-game-mc' as ViewMode,
      title: 'Multiple Choice',
      subtitle: 'Identify the correct Romaji sound',
      xp: '+10 XP',
      icon: Target,
      color: 'text-[#FF5C7A]',
      bg: 'bg-[#FF5C7A]/10'
    },
    {
      id: 'mini-game-sound' as ViewMode,
      title: 'Sound to Character',
      subtitle: 'Listen to native audio and choose Kana',
      xp: '+10 XP',
      icon: Headphones,
      color: 'text-[#FFD166]',
      bg: 'bg-[#FFD166]/10'
    },
    {
      id: 'mini-game-matching' as ViewMode,
      title: 'Matching Pairs',
      subtitle: 'Fast connect between Hiragana and Romaji',
      xp: '+10 XP / pair',
      icon: Shuffle,
      color: 'text-[#42E6A4]',
      bg: 'bg-[#42E6A4]/10'
    },
    {
      id: 'mini-game-speed' as ViewMode,
      title: 'Speed Round',
      subtitle: '4-second quick reaction timer',
      xp: '+15 XP',
      icon: Zap,
      color: 'text-[#FFD166]',
      bg: 'bg-[#FFD166]/10'
    },
    {
      id: 'boss' as ViewMode,
      title: `Day ${currentDay} Boss Battle`,
      subtitle: '10-question mixed gauntlet with Boss HP',
      xp: '+50 XP',
      icon: ShieldAlert,
      color: 'text-[#FF5C7A]',
      bg: 'bg-[#FF5C7A]/15'
    }
  ];

  const canPlayFinal = completedDays.length >= 7;

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto py-2 pb-24">
      <div>
        <h2 className="text-xl font-extrabold text-[#F7F7F5]">
          Practice Arcade
        </h2>
        <p className="text-xs text-[#9AA1AA] mt-1">
          Master characters through dynamic mini-games
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                sfx.click(soundEnabled);
                onSelectGame(g.id);
              }}
              className="p-4 rounded-3xl bg-[#14171C] hover:bg-[#1B2027] border border-[#1B2027] hover:border-[#2D3748] flex items-center justify-between transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${g.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={24} className={g.color} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F7F7F5] group-hover:text-[#FF5C7A] transition-colors">
                      {g.title}
                    </span>
                    <span className="text-[10px] font-semibold text-[#FFD166] px-1.5 py-0.5 rounded-md bg-[#0B0D10]/50">
                      {g.xp}
                    </span>
                  </div>
                  <span className="text-xs text-[#9AA1AA] block mt-0.5">
                    {g.subtitle}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#9AA1AA] group-hover:text-[#F7F7F5] group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}

        {/* Final Challenge button */}
        <button
          type="button"
          onClick={() => {
            if (canPlayFinal) {
              sfx.click(soundEnabled);
              onSelectGame('final-challenge');
            }
          }}
          disabled={!canPlayFinal}
          className={`p-4 rounded-3xl border flex items-center justify-between transition-all text-left ${
            canPlayFinal
              ? 'bg-[#FFD166]/10 border-[#FFD166]/40 hover:border-[#FFD166] cursor-pointer'
              : 'bg-[#14171C]/40 border-transparent opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD166]/15 flex items-center justify-center shrink-0 text-2xl">
              🏯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F7F7F5]">
                  Final Hiragana Challenge
                </span>
                <span className="text-[10px] font-semibold text-[#FFD166] px-1.5 py-0.5 rounded-md bg-[#0B0D10]/50">
                  +100 XP
                </span>
              </div>
              <span className="text-xs text-[#9AA1AA] block mt-0.5">
                {canPlayFinal ? 'Test all 46 characters' : 'Unlock by completing all 7 Days'}
              </span>
            </div>
          </div>
          <Trophy size={18} className={canPlayFinal ? 'text-[#FFD166]' : 'text-[#9AA1AA]'} />
        </button>
      </div>
    </div>
  );
};

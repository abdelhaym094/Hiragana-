import React, { useState } from 'react';
import { Volume2, Lock, CheckCircle2, Sparkles, X } from 'lucide-react';
import { HIRAGANA_DATA } from '../data/hiragana';
import { HiraganaCharacter } from '../types';
import { sfx, speakJapanese } from '../utils/audio';
import { MemoryCard } from './MemoryCard';

interface KanaChartViewProps {
  unlockedDay: number;
  masteryMap: Record<string, any>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onBack: () => void;
}

export const KanaChartView: React.FC<KanaChartViewProps> = ({
  unlockedDay,
  masteryMap,
  soundEnabled,
  speechEnabled,
  onBack
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'mastered'>('all');
  const [inspectedChar, setInspectedChar] = useState<HiraganaCharacter | null>(null);

  const handleCharClick = (item: HiraganaCharacter) => {
    sfx.click(soundEnabled);
    speakJapanese(item.char, speechEnabled);
    setInspectedChar(item);
  };

  const filteredList = HIRAGANA_DATA.filter((item) => {
    const isUnlocked = item.day <= unlockedDay;
    const mastery = masteryMap[item.char];
    const isMastered = mastery && mastery.masteryScore >= 4;

    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'mastered') return isMastered;
    return true;
  });

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto py-2 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#F7F7F5]">
            46 Basic Hiragana
          </h2>
          <span className="text-xs text-[#9AA1AA]">
            Tap any character to hear pronunciation
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#14171C] rounded-xl border border-[#1B2027]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#1B2027] text-[#FF5C7A]'
                : 'text-[#9AA1AA] hover:text-[#F7F7F5]'
            }`}
          >
            All 46
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-[#1B2027] text-[#FF5C7A]'
                : 'text-[#9AA1AA] hover:text-[#F7F7F5]'
            }`}
          >
            Unlocked
          </button>
          <button
            type="button"
            onClick={() => setFilter('mastered')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'mastered'
                ? 'bg-[#1B2027] text-[#42E6A4]'
                : 'text-[#9AA1AA] hover:text-[#F7F7F5]'
            }`}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Grid of Characters */}
      <div className="grid grid-cols-5 gap-2">
        {filteredList.map((item) => {
          const isUnlocked = item.day <= unlockedDay;
          const mastery = masteryMap[item.char];
          const isMastered = mastery && mastery.masteryScore >= 4;

          return (
            <button
              key={item.char}
              type="button"
              onClick={() => handleCharClick(item)}
              className={`p-2 rounded-2xl border flex flex-col items-center justify-between min-h-[82px] transition-all cursor-pointer relative group ${
                isMastered
                  ? 'bg-[#14171C] border-[#42E6A4]/40 hover:border-[#42E6A4]'
                  : isUnlocked
                  ? 'bg-[#14171C] border-[#1B2027] hover:border-[#FF5C7A]'
                  : 'bg-[#0B0D10]/40 border-transparent opacity-40 hover:opacity-60'
              }`}
            >
              <div className="w-full flex items-center justify-between text-[10px]">
                <span className="text-[#9AA1AA]">D{item.day}</span>
                <span className="text-[11px]">{item.word.conceptIcon}</span>
              </div>

              <span className="text-3xl font-japanese font-bold text-[#F7F7F5] group-hover:scale-105 transition-transform my-0.5">
                {item.char}
              </span>

              <div className="w-full text-center">
                <span className="text-[11px] font-mono font-bold text-[#FFD166] uppercase block leading-none">
                  {item.romaji}
                </span>
                <span className="text-[9px] text-[#9AA1AA] font-japanese truncate block mt-0.5">
                  {item.word.jp}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Inspector Modal when tapping a character */}
      {inspectedChar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectedChar(null)}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setInspectedChar(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] border border-[#2D3748] cursor-pointer shadow-lg"
            >
              <X size={16} />
            </button>
            <MemoryCard
              character={inspectedChar}
              day={inspectedChar.day}
              speechEnabled={speechEnabled}
              soundEnabled={soundEnabled}
              onGotIt={() => setInspectedChar(null)}
              mastery={masteryMap[inspectedChar.char]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

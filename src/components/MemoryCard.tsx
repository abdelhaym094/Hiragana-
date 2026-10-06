import React, { useState } from 'react';
import { Volume2, Sparkles, Brain, Check, ArrowRight } from 'lucide-react';
import { HiraganaCharacter, CharacterMastery } from '../types';
import { AudioButton } from './AudioButton';
import { sfx, speakJapanese } from '../utils/audio';

interface MemoryCardProps {
  character: HiraganaCharacter;
  day: number;
  speechEnabled: boolean;
  soundEnabled: boolean;
  onGotIt: () => void;
  mastery?: CharacterMastery;
  currentIndex?: number;
  totalCount?: number;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  character,
  day,
  speechEnabled,
  soundEnabled,
  onGotIt,
  mastery,
  currentIndex,
  totalCount
}) => {
  const word = character.word;
  const memoryLvl = mastery?.memoryStrength || 0;
  const [isPlayingWord, setIsPlayingWord] = useState(false);

  const handlePlayWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingWord) return;
    setIsPlayingWord(true);
    sfx.click(soundEnabled);
    speakJapanese(word.jp, speechEnabled).finally(() => {
      setIsPlayingWord(false);
    });
  };

  // Render the word with the target Hiragana character emphasized in vermilion
  const renderHighlightedWord = () => {
    const chars = word.jp.split('');
    let highlighted = false;

    return (
      <span className="font-japanese tracking-wide inline-flex items-center">
        {chars.map((c, i) => {
          const isTarget = c === character.char && !highlighted;
          if (isTarget) highlighted = true;

          return isTarget ? (
            <span
              key={i}
              className="text-[#FF5C7A] font-black bg-[#FF5C7A]/20 px-2 py-0.5 rounded-xl border border-[#FF5C7A]/40 shadow-sm mx-0.5 scale-105 inline-block"
            >
              {c}
            </span>
          ) : (
            <span key={i} className="text-[#F5F7FA]">
              {c}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Collectible Game Card Frame */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1D232B] via-[#171C22] to-[#0E1116] border-2 border-[#282F38] hover:border-[#FF5C7A]/60 shadow-2xl p-5 overflow-hidden transition-all">
        {/* Subtle holographic gleam effect */}
        <div className="animate-card-gleam" />

        {/* Card Header: Day and Memory Level */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282F38] relative z-10">
          <div className="flex items-center gap-2">
            <span className="hanko-seal text-[9px]">
              DAY {day}
            </span>
            {currentIndex !== undefined && totalCount !== undefined && (
              <span className="text-[11px] font-mono font-bold text-[#8B949E]">
                CARD {currentIndex + 1}/{totalCount}
              </span>
            )}
          </div>

          {/* 5-pip Memory Level Indicator */}
          <div className="flex items-center gap-1" title="Memory Strength">
            <span className="text-[10px] font-extrabold text-[#8B949E] uppercase mr-1">
              Memory
            </span>
            {[1, 2, 3, 4, 5].map((pip) => (
              <span
                key={pip}
                className={`w-2 h-2 rounded-full transition-colors ${
                  pip <= memoryLvl
                    ? 'bg-[#FFD166] shadow-sm shadow-[#FFD166]'
                    : 'bg-[#080A0D] border border-[#282F38]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* HERO CHARACTER SECTION */}
        <div className="flex flex-col items-center text-center my-4 relative z-10">
          <div className="relative mb-2">
            <div className="w-32 h-32 rounded-3xl bg-[#080A0D] border-2 border-[#282F38] flex items-center justify-center shadow-inner group">
              <span className="text-8xl font-japanese font-black text-[#F5F7FA] select-text">
                {character.char}
              </span>
            </div>
            {/* Concept icon badge */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#171C22] border-2 border-[#FFD166]/50 flex items-center justify-center text-xl shadow-lg shadow-black/50">
              {word.conceptIcon}
            </div>
          </div>

          {/* Romaji & Large Pronunciation Audio Trigger */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-mono font-black text-[#FFD166] uppercase tracking-wider">
              {character.romaji}
            </span>
            <AudioButton
              text={character.char}
              enabled={speechEnabled}
              size="md"
            />
          </div>
        </div>

        {/* VISUAL SHAPE MEMORY TRICK */}
        <div className="w-full p-3.5 rounded-2xl bg-[#080A0D]/70 border border-[#282F38] mb-3 relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-[#FF5C7A] uppercase tracking-wider mb-1">
            <Brain size={14} />
            <span>Shape Memory Trick</span>
          </div>
          <p className="text-xs text-[#F5F7FA] leading-relaxed font-medium">
            "{character.mnemonic}"
          </p>
        </div>

        {/* VOCABULARY ASSOCIATION LINK */}
        <div className="w-full p-3.5 rounded-2xl bg-[#080A0D]/40 border border-[#282F38] mb-4 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8B949E] uppercase tracking-wide mb-1.5">
            <span className="flex items-center gap-1 text-[#42E6A4] font-black">
              <Sparkles size={13} /> Vocabulary Link
            </span>
            <button
              type="button"
              onClick={handlePlayWord}
              className="text-[10px] text-[#8B949E] hover:text-[#F5F7FA] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Volume2 size={12} className={isPlayingWord ? 'text-[#42E6A4] animate-pulse' : ''} />
              <span>Hear Word</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-2xl font-bold flex items-center">
                {renderHighlightedWord()}
              </div>
              <span className="text-xs font-mono font-bold text-[#8B949E] uppercase mt-0.5 block">
                {word.romaji}
              </span>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-[#FFD166] flex items-center gap-1 justify-end">
                <span>{word.meaning}</span>
                <span>{word.conceptIcon}</span>
              </span>
              <span className="text-[10px] text-[#8B949E] block mt-0.5">
                Hero: <strong className="text-[#FF5C7A]">{character.char}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tactile Primary Action: [ GOT IT — TEST MEMORY ] */}
        <button
          type="button"
          onClick={() => {
            sfx.click(soundEnabled);
            onGotIt();
          }}
          className="btn-game-primary w-full py-4 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF5C7A]/25 cursor-pointer relative z-10 uppercase"
        >
          <Check size={18} strokeWidth={3} />
          <span>GOT IT — TEST MEMORY</span>
        </button>
      </div>
    </div>
  );
};

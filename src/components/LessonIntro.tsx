import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Brain, Check, RefreshCw } from 'lucide-react';
import { HiraganaCharacter, CharacterMastery } from '../types';
import { MemoryCard } from './MemoryCard';
import { MemoryQuestionCard } from './MemoryQuestionCard';
import { generateMemoryQuestion, MemoryQuestion } from '../utils/mastery';
import { AudioButton } from './AudioButton';
import { sfx, speakJapanese } from '../utils/audio';

interface LessonIntroProps {
  characters: HiraganaCharacter[];
  allUnlocked: HiraganaCharacter[];
  day: number;
  soundEnabled: boolean;
  speechEnabled: boolean;
  masteryMap: Record<string, CharacterMastery>;
  onRecordAnswer: (char: string, isCorrect: boolean) => void;
  onRecordMemoryAnswer: (char: string, isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

export const LessonIntro: React.FC<LessonIntroProps> = ({
  characters,
  allUnlocked,
  day,
  soundEnabled,
  speechEnabled,
  masteryMap,
  onRecordAnswer,
  onRecordMemoryAnswer,
  onAddXp,
  onComplete,
  onBack
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'card' | 'test'>('card');
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<MemoryQuestion | null>(null);

  const currentItem = characters[currentIndex];

  // Auto-play character pronunciation when arriving at card
  useEffect(() => {
    if (currentItem && speechEnabled && phase === 'card' && !isCompleted) {
      const timer = setTimeout(() => {
        speakJapanese(currentItem.char, speechEnabled);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentItem, speechEnabled, phase, isCompleted]);

  // When learner clicks "GOT IT" on the Memory Card:
  const handleGotIt = () => {
    if (!currentItem) return;
    // Generate immediate memory test for this character
    const pool = allUnlocked.length > 3 ? allUnlocked : characters;
    const testTypes: ('concept_to_char' | 'word_to_char' | 'sound_to_char' | 'char_to_word')[] = [
      'concept_to_char',
      'word_to_char',
      'sound_to_char',
      'char_to_word'
    ];
    const pickedType = testTypes[currentIndex % testTypes.length];
    const q = generateMemoryQuestion(currentItem, pool, pickedType);
    setCurrentQuestion(q);
    setPhase('test');
  };

  // When learner answers the immediate memory test:
  const handleAnswerTest = (isCorrect: boolean) => {
    if (!currentItem) return;

    onRecordMemoryAnswer(currentItem.char, isCorrect);
    onRecordAnswer(currentItem.char, isCorrect);

    if (isCorrect) {
      onAddXp(10);
    }

    // Advance to next character or finish batch
    if (currentIndex < characters.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase('card');
      setCurrentQuestion(null);
    } else {
      setIsCompleted(true);
      sfx.victory(soundEnabled);
    }
  };

  const handlePrevious = () => {
    if (phase === 'test') {
      setPhase('card');
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setPhase('card');
    }
  };

  // Batch completion summary view
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-6 max-w-md mx-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-[#42E6A4]/15 border border-[#42E6A4] flex items-center justify-center text-3xl shadow-xl shadow-[#42E6A4]/10">
          ✨
        </div>

        <div>
          <h2 className="text-2xl font-black text-[#F7F7F5]">
            Memory Cards Unlocked!
          </h2>
          <p className="text-xs text-[#9AA1AA] mt-1 max-w-xs mx-auto">
            You connected {characters.length} characters to visual shapes and real Japanese vocabulary for Day {day}.
          </p>
        </div>

        {/* Collectible Cards List */}
        <div className="w-full flex flex-col gap-2.5 my-1">
          {characters.map((item) => (
            <div
              key={item.char}
              className="p-3.5 rounded-2xl bg-[#14171C] border border-[#1B2027] flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center font-japanese text-2xl font-bold text-[#F7F7F5]">
                  {item.char}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#FFD166] uppercase">
                      {item.romaji}
                    </span>
                    <span className="text-xs text-[#9AA1AA]">·</span>
                    <span className="text-xs font-japanese font-semibold text-[#F7F7F5]">
                      {item.word.jp}
                    </span>
                    <span className="text-xs text-[#9AA1AA]">({item.word.romaji})</span>
                  </div>
                  <span className="text-[11px] text-[#9AA1AA] flex items-center gap-1 mt-0.5">
                    <span>{item.word.conceptIcon}</span>
                    <span>{item.word.meaning}</span>
                  </span>
                </div>
              </div>

              <AudioButton
                text={item.char}
                enabled={speechEnabled}
                size="sm"
              />
            </div>
          ))}
        </div>

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] active:scale-[0.98] text-[#0B0D10] font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-[#FF5C7A]/20 transition-all cursor-pointer"
          >
            <Sparkles size={18} />
            <span>PLAY TODAY'S MINI-GAMES</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setPhase('card');
              setIsCompleted(false);
            }}
            className="text-xs font-semibold text-[#9AA1AA] hover:text-[#F7F7F5] py-2 cursor-pointer transition-colors"
          >
            Review Memory Cards Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={currentIndex === 0 && phase === 'card' ? onBack : handlePrevious}
          className="p-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {characters.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-[#FF5C7A]'
                  : idx < currentIndex
                  ? 'w-2 bg-[#42E6A4]'
                  : 'w-2 bg-[#1B2027]'
              }`}
            />
          ))}
        </div>

        <span className="text-xs font-mono font-bold text-[#9AA1AA]">
          {currentIndex + 1}/{characters.length}
        </span>
      </div>

      {/* Mode Switch: Memory Card or Immediate Test */}
      {phase === 'card' ? (
        <MemoryCard
          character={currentItem}
          day={day}
          speechEnabled={speechEnabled}
          soundEnabled={soundEnabled}
          onGotIt={handleGotIt}
          mastery={masteryMap[currentItem.char]}
          currentIndex={currentIndex}
          totalCount={characters.length}
        />
      ) : (
        currentQuestion && (
          <div className="flex flex-col gap-3">
            <div className="text-center mb-1">
              <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider">
                Instant Memory Check
              </span>
              <p className="text-[11px] text-[#9AA1AA]">
                Test your visual association while fresh
              </p>
            </div>
            <MemoryQuestionCard
              question={currentQuestion}
              soundEnabled={soundEnabled}
              speechEnabled={speechEnabled}
              onAnswer={handleAnswerTest}
            />
          </div>
        )
      )}
    </div>
  );
};

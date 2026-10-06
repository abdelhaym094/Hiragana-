import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Sparkles, Volume2, Trophy, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HiraganaCharacter } from '../types';
import { HIRAGANA_DATA } from '../data/hiragana';
import { AnswerButton, AnswerState } from './AnswerButton';
import { pickSmartCharacter, getDistractors } from '../utils/mastery';
import { sfx, speakJapanese } from '../utils/audio';

interface FinalChallengeGameProps {
  masteryMap: Record<string, any>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  totalXp: number;
  onRecordAnswer: (char: string, isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onChallengeComplete: (score: number) => void;
  onBack: () => void;
}

const TOTAL_QUESTIONS = 20;

export const FinalChallengeGame: React.FC<FinalChallengeGameProps> = ({
  masteryMap,
  soundEnabled,
  speechEnabled,
  totalXp,
  onRecordAnswer,
  onAddXp,
  onChallengeComplete,
  onBack
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4);

  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 20 questions mixing all 46 characters
  const questions = useMemo(() => {
    const list: {
      type: 'char_to_sound' | 'sound_to_char' | 'speed';
      character: HiraganaCharacter;
      options: { label: string; value: string; isJapanese?: boolean }[];
      correctValue: string;
    }[] = [];

    const types: ('char_to_sound' | 'sound_to_char' | 'speed')[] = [
      'char_to_sound', 'sound_to_char', 'speed', 'char_to_sound', 'sound_to_char',
      'speed', 'char_to_sound', 'sound_to_char', 'speed', 'char_to_sound'
    ];

    const shuffledAll = [...HIRAGANA_DATA].sort(() => Math.random() - 0.5);

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const type = types[i % types.length];
      const char = shuffledAll[i % shuffledAll.length];

      if (type === 'sound_to_char') {
        const others = HIRAGANA_DATA.filter(c => c.char !== char.char);
        const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
        const all = [char, ...shuffled].sort(() => Math.random() - 0.5);
        list.push({
          type,
          character: char,
          correctValue: char.char,
          options: all.map(c => ({ label: c.char, value: c.char, isJapanese: true }))
        });
      } else {
        const distractors = getDistractors(char, HIRAGANA_DATA, 3);
        const allRomaji = [char.romaji, ...distractors].sort(() => Math.random() - 0.5);
        list.push({
          type,
          character: char,
          correctValue: char.romaji,
          options: allRomaji.map(r => ({ label: r, value: r }))
        });
      }
    }
    return list;
  }, []);

  const currentQ = questions[questionIndex];

  // Auto-play sound for sound_to_char
  useEffect(() => {
    if (currentQ && currentQ.type === 'sound_to_char' && speechEnabled && !isFinished) {
      const timer = setTimeout(() => {
        speakJapanese(currentQ.character.char, speechEnabled);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentQ, speechEnabled, isFinished]);

  // Speed timer logic
  useEffect(() => {
    if (isAnswered || isFinished || !currentQ || currentQ.type !== 'speed') return;

    setTimeLeft(4);
    speedTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(speedTimerRef.current!);
          setIsAnswered(true);
          sfx.wrong(soundEnabled);
          onRecordAnswer(currentQ.character.char, false);
          setCurrentStreak(0);
          setTimeout(() => {
            handleNextQuestion();
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    };
  }, [currentQ, isAnswered, isFinished, soundEnabled]);

  const handleNextQuestion = useCallback(() => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      setIsFinished(true);
      return;
    }
    setQuestionIndex((prev) => prev + 1);
    setSelectedValue(null);
    setIsAnswered(false);
    setTimeLeft(4);
  }, [questionIndex]);

  const handleSelect = (val: string) => {
    if (isAnswered || !currentQ) return;
    if (speedTimerRef.current) clearInterval(speedTimerRef.current);

    setSelectedValue(val);
    setIsAnswered(true);
    const isCorrect = val === currentQ.correctValue;

    onRecordAnswer(currentQ.character.char, isCorrect);

    if (isCorrect) {
      sfx.correct(soundEnabled);
      setCorrectCount((prev) => prev + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      onAddXp(currentQ.type === 'speed' ? 15 : 10);
      if (currentQ.type !== 'sound_to_char') {
        speakJapanese(currentQ.character.char, speechEnabled);
      }
    } else {
      sfx.wrong(soundEnabled);
      setCurrentStreak(0);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, isCorrect ? 850 : 1300);
  };

  // On finished gauntlet
  useEffect(() => {
    if (isFinished) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      sfx.victory(soundEnabled);
      onChallengeComplete(correctCount);
    }
  }, [isFinished]);

  if (isFinished) {
    const accuracy = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

    return (
      <div className="flex flex-col items-center text-center gap-5 py-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-[#FFD166]/20 border border-[#FFD166] flex items-center justify-center text-5xl shadow-2xl shadow-[#FFD166]/20">
          🏆
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#F7F7F5]">
            HIRAGANA COMPLETE!
          </h2>
          <p className="text-sm text-[#FF5C7A] font-semibold mt-1">
            "You can now recognize all 46 basic Hiragana characters."
          </p>
        </div>

        {/* Stats Grid matching specification */}
        <div className="w-full grid grid-cols-2 gap-3 p-4 rounded-3xl bg-[#14171C] border border-[#1B2027]">
          <div className="p-3 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027]">
            <span className="text-xs text-[#9AA1AA] block">Hiragana</span>
            <span className="text-2xl font-extrabold text-[#42E6A4] tabular-nums">
              46 / 46
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027]">
            <span className="text-xs text-[#9AA1AA] block">Accuracy</span>
            <span className="text-2xl font-extrabold text-[#FFD166] tabular-nums">
              {accuracy}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027]">
            <span className="text-xs text-[#9AA1AA] block">Best Streak</span>
            <span className="text-2xl font-extrabold text-[#FF5C7A] tabular-nums">
              {bestStreak}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027]">
            <span className="text-xs text-[#9AA1AA] block">Total XP</span>
            <span className="text-2xl font-extrabold text-[#F7F7F5] tabular-nums">
              {totalXp}
            </span>
          </div>
        </div>

        <div className="w-full space-y-3 mt-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] text-[#0B0D10] font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#FF5C7A]/20 transition-all"
          >
            <Sparkles size={18} />
            <span>REVIEW HIRAGANA</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFD166]/15 border border-[#FFD166]/30">
          <Trophy size={14} className="text-[#FFD166]" />
          <span className="text-xs font-bold text-[#FFD166]">Final Challenge</span>
        </div>

        <span className="text-xs font-mono font-bold text-[#9AA1AA] tabular-nums">
          {questionIndex + 1}/{TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Progress & Streak Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#14171C] border border-[#1B2027] text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🔥</span>
          <span className="font-bold text-[#FFD166] tabular-nums">
            {currentStreak} Streak
          </span>
        </div>

        <div className="flex-1 mx-3">
          <div className="h-1.5 rounded-full bg-[#0B0D10] overflow-hidden">
            <div
              className="h-full bg-[#42E6A4] transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <span className="text-[#9AA1AA] font-mono tabular-nums">
          {correctCount} Solved
        </span>
      </div>

      {/* Question Card */}
      <div className="flex flex-col items-center p-6 rounded-3xl bg-[#14171C] border border-[#1B2027] text-center shadow-xl relative">
        {currentQ.type === 'speed' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-[#FFD166] bg-[#FFD166]/10 px-2 py-0.5 rounded-full">
            <Zap size={12} />
            <span className="tabular-nums">{timeLeft}s</span>
          </div>
        )}

        <span className="text-xs font-semibold text-[#9AA1AA] uppercase tracking-wider mb-2">
          {currentQ.type === 'sound_to_char'
            ? 'Listen to the sound'
            : currentQ.type === 'speed'
            ? 'Speed Question!'
            : 'Identify this Hiragana'}
        </span>

        {currentQ.type === 'sound_to_char' ? (
          <button
            type="button"
            onClick={() => speakJapanese(currentQ.character.char, speechEnabled)}
            className="w-24 h-24 my-2 rounded-3xl bg-[#0B0D10] hover:bg-[#1B2027] border-2 border-[#FFD166] flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Volume2 size={32} className="text-[#FFD166]" />
            <span className="text-[10px] text-[#9AA1AA] uppercase font-bold">Listen</span>
          </button>
        ) : (
          <div className="w-28 h-28 my-1 rounded-3xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center shadow-inner">
            <span className="text-7xl font-japanese font-extrabold text-[#F7F7F5]">
              {currentQ.character.char}
            </span>
          </div>
        )}
      </div>

      {/* Answer Choices */}
      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((opt, idx) => {
          let state: AnswerState = 'neutral';
          if (isAnswered) {
            if (opt.value === currentQ.correctValue) {
              state = 'correct';
            } else if (opt.value === selectedValue) {
              state = 'wrong';
            } else {
              state = 'dimmed';
            }
          }

          return (
            <AnswerButton
              key={opt.value}
              label={opt.label}
              shortcut={idx + 1}
              state={state}
              disabled={isAnswered}
              isJapanese={opt.isJapanese}
              onClick={() => handleSelect(opt.value)}
            />
          );
        })}
      </div>
    </div>
  );
};

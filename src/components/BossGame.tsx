import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Sparkles, Volume2, ShieldAlert, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HiraganaCharacter } from '../types';
import { AnswerButton, AnswerState } from './AnswerButton';
import { pickSmartCharacter, getDistractors } from '../utils/mastery';
import { sfx, speakJapanese } from '../utils/audio';

type BossQuestionType = 'char_to_sound' | 'sound_to_char' | 'speed' | 'concept_to_char' | 'char_to_word';

interface BossQuestion {
  character: HiraganaCharacter;
  type: BossQuestionType;
  options: { label: string; value: string; subLabel?: string; isJapanese?: boolean }[];
  correctValue: string;
  promptKicker?: string;
  promptMain?: string;
  conceptIcon?: string;
}

interface BossGameProps {
  day: number;
  charactersPool: HiraganaCharacter[];
  masteryMap: Record<string, any>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onRecordAnswer: (char: string, isCorrect: boolean, responseTimeMs?: number, selectedOption?: string) => void;
  onRecordMemoryAnswer?: (char: string, isCorrect: boolean, responseTimeMs?: number, selectedOption?: string) => void;
  onAddXp: (amount: number) => void;
  onBossDefeated: (day: number, score: number, maxScore: number) => void;
  onBack: () => void;
  weakCharacters: { character: HiraganaCharacter; mastery: any }[];
}

const TOTAL_QUESTIONS = 10;
const SPEED_TIME = 4;

export const BossGame: React.FC<BossGameProps> = ({
  day,
  charactersPool,
  masteryMap,
  soundEnabled,
  speechEnabled,
  onRecordAnswer,
  onRecordMemoryAnswer,
  onAddXp,
  onBossDefeated,
  onBack,
  weakCharacters
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SPEED_TIME);
  const [bossHp, setBossHp] = useState(TOTAL_QUESTIONS);

  const speedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 10 mixed questions for this boss battle
  const questions = useMemo<BossQuestion[]>(() => {
    const list: BossQuestion[] = [];
    const types: BossQuestionType[] = [
      'char_to_sound',
      'concept_to_char',
      'sound_to_char',
      'speed',
      'char_to_word',
      'char_to_sound',
      'concept_to_char',
      'sound_to_char',
      'speed',
      'char_to_word'
    ];

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const type = types[i % types.length];
      const char = pickSmartCharacter(charactersPool, masteryMap);
      const others = charactersPool.filter(c => c.char !== char.char);
      const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);

      if (type === 'concept_to_char') {
        const charCandidates = [char, ...shuffledOthers].sort(() => Math.random() - 0.5);
        list.push({
          character: char,
          type,
          promptKicker: 'Concept to Kana',
          promptMain: `${char.word.meaning}`,
          conceptIcon: char.word.conceptIcon,
          correctValue: char.char,
          options: charCandidates.map(c => ({
            label: c.char,
            value: c.char,
            subLabel: c.romaji.toUpperCase(),
            isJapanese: true
          }))
        });
      } else if (type === 'char_to_word') {
        const wordCandidates = [char, ...shuffledOthers].sort(() => Math.random() - 0.5);
        list.push({
          character: char,
          type,
          promptKicker: 'Word Link',
          promptMain: char.char,
          correctValue: char.word.jp,
          options: wordCandidates.map(c => ({
            label: `${c.word.conceptIcon} ${c.word.jp}`,
            value: c.word.jp,
            subLabel: `${c.word.romaji} · ${c.word.meaning}`
          }))
        });
      } else if (type === 'sound_to_char') {
        const all = [char, ...shuffledOthers].sort(() => Math.random() - 0.5);
        list.push({
          character: char,
          type,
          correctValue: char.char,
          options: all.map(c => ({ label: c.char, value: c.char, isJapanese: true }))
        });
      } else {
        // Romaji options
        const distractors = getDistractors(char, charactersPool, 3);
        const allRomaji = [char.romaji, ...distractors].sort(() => Math.random() - 0.5);
        list.push({
          character: char,
          type,
          correctValue: char.romaji,
          options: allRomaji.map(r => ({ label: r, value: r }))
        });
      }
    }
    return list;
  }, [charactersPool, masteryMap]);

  const currentQ = questions[questionIndex];

  // Play audio on sound_to_char entry
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

    setTimeLeft(SPEED_TIME);
    speedTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(speedTimerRef.current!);
          setIsAnswered(true);
          sfx.wrong(soundEnabled);
          onRecordAnswer(currentQ.character.char, false);
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

  const startTimeRef = useRef<number>(Date.now());

  const handleNextQuestion = useCallback(() => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      setIsFinished(true);
      return;
    }
    setQuestionIndex((prev) => prev + 1);
    setSelectedValue(null);
    setIsAnswered(false);
    setTimeLeft(SPEED_TIME);
    startTimeRef.current = Date.now();
  }, [questionIndex]);

  const handleSelect = (val: string) => {
    if (isAnswered || !currentQ) return;
    if (speedTimerRef.current) clearInterval(speedTimerRef.current);

    const responseTime = Date.now() - startTimeRef.current;
    setSelectedValue(val);
    setIsAnswered(true);
    const isCorrect = val === currentQ.correctValue;

    onRecordAnswer(currentQ.character.char, isCorrect, responseTime, val);
    if (currentQ.type === 'concept_to_char' || currentQ.type === 'char_to_word') {
      onRecordMemoryAnswer?.(currentQ.character.char, isCorrect, responseTime, val);
    }

    if (isCorrect) {
      sfx.bossHit(soundEnabled);
      setCorrectCount((prev) => prev + 1);
      setBossHp((prev) => Math.max(0, prev - 1));
      if (currentQ.type !== 'sound_to_char') {
        speakJapanese(currentQ.character.char, speechEnabled);
      }
    } else {
      sfx.wrong(soundEnabled);
    }

    setTimeout(() => {
      handleNextQuestion();
    }, isCorrect ? 900 : 1300);
  };

  // Keyboard 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || isFinished || !currentQ) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= currentQ.options.length) {
        handleSelect(currentQ.options[keyNum - 1].value);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, isAnswered, isFinished]);

  // Victory evaluation when finished
  useEffect(() => {
    if (isFinished) {
      const isPerfect = correctCount === 10;
      const isExcellent = correctCount >= 8;
      const isGood = correctCount >= 6;

      let xpEarned = 25;
      if (isPerfect) {
        xpEarned = 100;
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else if (isExcellent) {
        xpEarned = 50;
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else if (isGood) {
        xpEarned = 50;
      }

      onAddXp(xpEarned);
      sfx.victory(soundEnabled);
      onBossDefeated(day, correctCount, TOTAL_QUESTIONS);
    }
  }, [isFinished]);

  if (isFinished) {
    const accuracy = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const isPerfect = correctCount === 10;
    const isExcellent = correctCount >= 8 && correctCount < 10;
    const isGood = correctCount >= 6 && correctCount < 8;

    return (
      <div className="flex flex-col items-center text-center gap-5 py-6 max-w-md mx-auto">
        <div className="w-18 h-18 rounded-3xl bg-[#FF5C7A]/20 border border-[#FF5C7A] flex items-center justify-center text-4xl shadow-xl shadow-[#FF5C7A]/20">
          {isPerfect ? '🔥' : isExcellent ? '⭐⭐⭐' : isGood ? '⭐⭐' : '⭐'}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#F7F7F5]">
            {isPerfect ? 'PERFECT DEFEAT!' : isExcellent ? 'EXCELLENT VICTORY!' : isGood ? 'BOSS DEFEATED!' : 'KEEP PRACTICING!'}
          </h2>
          <p className="text-sm font-semibold text-[#FF5C7A] mt-1">
            Today's Quest Complete!
          </p>
        </div>

        {/* Score Card */}
        <div className="w-full p-4 rounded-3xl bg-[#14171C] border border-[#1B2027] flex items-center justify-around">
          <div>
            <span className="text-xs text-[#9AA1AA] block">Boss Damage</span>
            <span className="text-2xl font-bold text-[#F7F7F5] tabular-nums">
              {correctCount} / 10
            </span>
          </div>
          <div className="h-10 w-[1px] bg-[#1B2027]" />
          <div>
            <span className="text-xs text-[#9AA1AA] block">Accuracy</span>
            <span className="text-2xl font-bold text-[#42E6A4] tabular-nums">
              {accuracy}%
            </span>
          </div>
          <div className="h-10 w-[1px] bg-[#1B2027]" />
          <div>
            <span className="text-xs text-[#9AA1AA] block">Reward</span>
            <span className="text-2xl font-bold text-[#FFD166] tabular-nums">
              +{isPerfect ? 100 : isGood || isExcellent ? 50 : 25} XP
            </span>
          </div>
        </div>

        {/* Weak characters highlight if any */}
        {weakCharacters.length > 0 && (
          <div className="w-full p-3.5 rounded-2xl bg-[#0B0D10]/50 border border-[#1B2027] text-left">
            <span className="text-xs font-bold text-[#FFD166] uppercase block mb-1">
              Characters to Watch:
            </span>
            <div className="flex flex-wrap gap-2">
              {weakCharacters.slice(0, 4).map((w, idx) => {
                const charObj = (w as any)?.character || w;
                if (!charObj || !charObj.char) return null;
                const mastery = (w as any)?.mastery || masteryMap?.[charObj.char] || {};
                const accuracy = mastery?.accuracy ?? 100;
                return (
                  <span key={charObj.char || idx} className="text-xs px-2.5 py-1 rounded-lg bg-[#14171C] border border-[#1B2027] font-japanese font-bold text-[#F7F7F5]">
                    {charObj.char} ({charObj.romaji}) · {accuracy}%
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full space-y-3 mt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] active:scale-[0.98] text-[#0B0D10] font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#FF5C7A]/20 transition-all"
          >
            <Sparkles size={18} />
            <span>CONTINUE QUEST</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Header with Boss HP & Question Number */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FF5C7A]/15 border border-[#FF5C7A]/30">
          <span className="text-sm">👹</span>
          <span className="text-xs font-bold text-[#FF5C7A]">Day {day} Boss</span>
        </div>

        <span className="text-xs font-mono font-bold text-[#9AA1AA] tabular-nums">
          {questionIndex + 1}/{TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Boss Health Bar */}
      <div className="p-3 rounded-2xl bg-[#14171C] border border-[#1B2027]">
        <div className="flex items-center justify-between text-xs text-[#9AA1AA] mb-1.5 font-medium">
          <span className="flex items-center gap-1 text-[#FF5C7A] font-bold">
            <ShieldAlert size={14} /> Boss HP
          </span>
          <span className="font-mono tabular-nums">{bossHp} / {TOTAL_QUESTIONS}</span>
        </div>
        <div className="h-2 rounded-full bg-[#0B0D10] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5C7A] to-[#FFD166] transition-all duration-300"
            style={{ width: `${(bossHp / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Presentation */}
      <div className="flex flex-col items-center p-6 rounded-3xl bg-[#14171C] border border-[#1B2027] text-center shadow-xl relative">
        {currentQ.type === 'speed' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-[#FFD166] bg-[#FFD166]/10 px-2 py-0.5 rounded-full">
            <Zap size={12} />
            <span className="tabular-nums">{timeLeft}s</span>
          </div>
        )}

        <span className="text-xs font-semibold text-[#9AA1AA] uppercase tracking-wider mb-2">
          {currentQ.type === 'sound_to_char'
            ? 'Listen carefully! Which character is this?'
            : currentQ.type === 'speed'
            ? 'Quick Speed Hit! What sound is this?'
            : currentQ.type === 'concept_to_char'
            ? 'Visual Memory! Which Hiragana starts this word?'
            : currentQ.type === 'char_to_word'
            ? 'Word Link! Which vocabulary word connects to this character?'
            : 'What sound is this?'}
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
        ) : currentQ.type === 'concept_to_char' ? (
          <div className="flex flex-col items-center gap-1 my-2">
            <span className="text-4xl">{currentQ.conceptIcon}</span>
            <span className="text-2xl font-bold text-[#F7F7F5] capitalize">
              {currentQ.promptMain}
            </span>
            <span className="text-xs text-[#9AA1AA] mt-0.5">
              Japanese word: <strong className="text-[#FFD166] font-japanese">{currentQ.character.word.jp}</strong> ({currentQ.character.word.romaji})
            </span>
          </div>
        ) : (
          <div className="w-28 h-28 my-1 rounded-3xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center shadow-inner">
            <span className="text-7xl font-japanese font-extrabold text-[#F7F7F5]">
              {currentQ.character.char}
            </span>
          </div>
        )}
      </div>

      {/* Answer Options */}
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
              subLabel={opt.subLabel}
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

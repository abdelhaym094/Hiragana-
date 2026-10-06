import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, Zap, RotateCcw } from 'lucide-react';
import { HiraganaCharacter } from '../types';
import { AnswerButton, AnswerState } from './AnswerButton';
import { pickSmartCharacter, getDistractors } from '../utils/mastery';
import { sfx, speakJapanese } from '../utils/audio';

interface SpeedRoundGameProps {
  charactersPool: HiraganaCharacter[];
  masteryMap: Record<string, any>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onRecordAnswer: (char: string, isCorrect: boolean, responseTimeMs?: number, selectedOption?: string) => void;
  onAddXp: (amount: number) => void;
  onCompleteGame: () => void;
  onBack: () => void;
  totalQuestions?: number;
}

const QUESTION_TIME = 4; // 4 seconds

export const SpeedRoundGame: React.FC<SpeedRoundGameProps> = ({
  charactersPool,
  masteryMap,
  soundEnabled,
  speechEnabled,
  onRecordAnswer,
  onAddXp,
  onCompleteGame,
  onBack,
  totalQuestions = 6
}) => {
  const [questionCount, setQuestionCount] = useState(0);
  const [correctScore, setCorrectScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [currentCharacter, setCurrentCharacter] = useState<HiraganaCharacter>(() =>
    pickSmartCharacter(charactersPool, masteryMap)
  );
  const [selectedRomaji, setSelectedRomaji] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate options
  const options = useMemo(() => {
    if (!currentCharacter) return [];
    const distractors = getDistractors(currentCharacter, charactersPool, 3);
    const all = [currentCharacter.romaji, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [currentCharacter, charactersPool]);

  // Next question handler
  const nextQuestion = useCallback(() => {
    if (questionCount + 1 >= totalQuestions) {
      setIsFinished(true);
      sfx.victory(soundEnabled);
      onCompleteGame();
      return;
    }

    setQuestionCount((prev) => prev + 1);
    setSelectedRomaji(null);
    setIsAnswered(false);
    setTimeLeft(QUESTION_TIME);
    const nextChar = pickSmartCharacter(charactersPool, masteryMap, currentCharacter.char);
    setCurrentCharacter(nextChar);
  }, [questionCount, totalQuestions, charactersPool, masteryMap, currentCharacter, soundEnabled, onCompleteGame]);

  // Timer countdown effect
  useEffect(() => {
    if (isAnswered || isFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time expired
          setIsAnswered(true);
          sfx.wrong(soundEnabled);
          onRecordAnswer(currentCharacter.char, false, QUESTION_TIME * 1000);
          setTimeout(() => {
            nextQuestion();
          }, 1200);
          return 0;
        }
        if (soundEnabled && prev <= 3) {
          sfx.timerTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentCharacter, isAnswered, isFinished, soundEnabled, onRecordAnswer, nextQuestion]);

  const handleSelect = (romaji: string) => {
    if (isAnswered || !currentCharacter) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const responseTime = Math.max(400, (QUESTION_TIME - timeLeft) * 1000);
    setSelectedRomaji(romaji);
    setIsAnswered(true);
    const isCorrect = romaji === currentCharacter.romaji;

    onRecordAnswer(currentCharacter.char, isCorrect, responseTime, romaji);

    if (isCorrect) {
      sfx.correct(soundEnabled);
      speakJapanese(currentCharacter.char, speechEnabled);
      setCorrectScore((prev) => prev + 1);
      onAddXp(15); // +15 XP for speed round
    } else {
      sfx.wrong(soundEnabled);
    }

    setTimeout(() => {
      nextQuestion();
    }, isCorrect ? 900 : 1300);
  };

  // Keyboard 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || isFinished) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= options.length) {
        handleSelect(options[keyNum - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isAnswered, isFinished]);

  if (isFinished) {
    const accuracy = Math.round((correctScore / totalQuestions) * 100);
    return (
      <div className="flex flex-col items-center text-center gap-6 py-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#FFD166]/15 border border-[#FFD166] flex items-center justify-center text-3xl">
          ⚡
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#F7F7F5]">
            Speed Round Finished!
          </h2>
          <p className="text-sm text-[#9AA1AA] mt-1">
            Lightning reflexes build subconscious mastery
          </p>
        </div>

        <div className="w-full p-4 rounded-3xl bg-[#14171C] border border-[#1B2027] flex items-center justify-around">
          <div>
            <span className="text-xs text-[#9AA1AA] block">Speed Hits</span>
            <span className="text-2xl font-bold text-[#F7F7F5] tabular-nums">
              {correctScore} / {totalQuestions}
            </span>
          </div>
          <div className="h-10 w-[1px] bg-[#1B2027]" />
          <div>
            <span className="text-xs text-[#9AA1AA] block">Accuracy</span>
            <span className="text-2xl font-bold text-[#42E6A4] tabular-nums">
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => {
              setQuestionCount(0);
              setCorrectScore(0);
              setTimeLeft(QUESTION_TIME);
              setIsFinished(false);
              setIsAnswered(false);
              setSelectedRomaji(null);
              setCurrentCharacter(pickSmartCharacter(charactersPool, masteryMap));
            }}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] text-[#0B0D10] font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN (+15 XP PER HIT)</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-2xl bg-[#14171C] border border-[#1B2027] text-sm font-semibold text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  // Circular timer SVG parameters
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / QUESTION_TIME) * circumference;

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto py-2">
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

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD166]/10 border border-[#FFD166]/20">
          <Zap size={14} className="text-[#FFD166]" />
          <span className="text-xs font-bold text-[#FFD166]">+15 XP Speed</span>
        </div>

        <span className="text-xs font-mono font-bold text-[#9AA1AA] tabular-nums">
          {questionCount + 1}/{totalQuestions}
        </span>
      </div>

      {/* Speed Round Card with Circular Countdown Timer */}
      <div className="flex flex-col items-center p-6 rounded-3xl bg-[#14171C] border border-[#1B2027] text-center shadow-lg relative">
        {/* Circular Countdown Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="text-[#1B2027]"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className={`transition-all duration-300 ${
                timeLeft <= 1 ? 'text-[#FF5C7A]' : 'text-[#FFD166]'
              }`}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <span
            className={`absolute font-mono font-extrabold text-xl tabular-nums ${
              timeLeft <= 1 ? 'text-[#FF5C7A] scale-110' : 'text-[#F7F7F5]'
            }`}
          >
            {timeLeft}
          </span>
        </div>

        <span className="text-xs font-semibold text-[#9AA1AA] uppercase tracking-wider mb-2">
          Quick! What sound is this?
        </span>

        {/* Character */}
        <div className="w-28 h-28 my-1 rounded-3xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center shadow-inner">
          <span className="text-7xl font-japanese font-extrabold text-[#F7F7F5]">
            {currentCharacter.char}
          </span>
        </div>

        {timeLeft === 0 && (
          <span className="text-xs font-semibold text-[#FF5C7A] mt-2">
            Time's up! It's {currentCharacter.romaji.toUpperCase()}
          </span>
        )}
      </div>

      {/* 4 Choices */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, idx) => {
          let state: AnswerState = 'neutral';
          if (isAnswered) {
            if (opt === currentCharacter.romaji) {
              state = 'correct';
            } else if (opt === selectedRomaji) {
              state = 'wrong';
            } else {
              state = 'dimmed';
            }
          }

          return (
            <AnswerButton
              key={opt}
              label={opt}
              shortcut={idx + 1}
              state={state}
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
            />
          );
        })}
      </div>
    </div>
  );
};

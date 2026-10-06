import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Brain, RotateCcw, Sparkles } from 'lucide-react';
import { HiraganaCharacter, CharacterMastery } from '../types';
import { MemoryQuestionCard } from './MemoryQuestionCard';
import { generateMemoryQuestion, MemoryQuestion, pickSmartCharacter } from '../utils/mastery';
import { sfx } from '../utils/audio';

interface MemoryChallengeGameProps {
  charactersPool: HiraganaCharacter[];
  masteryMap: Record<string, CharacterMastery>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onRecordAnswer: (char: string, isCorrect: boolean) => void;
  onRecordMemoryAnswer: (char: string, isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onCompleteGame: () => void;
  onBack: () => void;
  totalQuestions?: number;
}

export const MemoryChallengeGame: React.FC<MemoryChallengeGameProps> = ({
  charactersPool,
  masteryMap,
  soundEnabled,
  speechEnabled,
  onRecordAnswer,
  onRecordMemoryAnswer,
  onAddXp,
  onCompleteGame,
  onBack,
  totalQuestions = 6
}) => {
  const [questionCount, setQuestionCount] = useState(0);
  const [correctScore, setCorrectScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate question for current step
  const [currentQuestion, setCurrentQuestion] = useState<MemoryQuestion>(() => {
    const char = pickSmartCharacter(charactersPool, masteryMap);
    return generateMemoryQuestion(char, charactersPool);
  });

  const nextQuestion = useCallback(() => {
    if (questionCount + 1 >= totalQuestions) {
      setIsFinished(true);
      sfx.victory(soundEnabled);
      onCompleteGame();
      return;
    }

    setQuestionCount((prev) => prev + 1);
    const nextChar = pickSmartCharacter(charactersPool, masteryMap, currentQuestion.character.char);
    setCurrentQuestion(generateMemoryQuestion(nextChar, charactersPool));
  }, [questionCount, totalQuestions, charactersPool, masteryMap, currentQuestion, soundEnabled, onCompleteGame]);

  const handleAnswer = (isCorrect: boolean) => {
    onRecordMemoryAnswer(currentQuestion.character.char, isCorrect);
    onRecordAnswer(currentQuestion.character.char, isCorrect);

    if (isCorrect) {
      setCorrectScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = newStreak >= 3 ? 5 : 0;
      onAddXp(10 + bonus);
    } else {
      setStreak(0);
    }

    nextQuestion();
  };

  if (isFinished) {
    const accuracy = Math.round((correctScore / totalQuestions) * 100);
    return (
      <div className="flex flex-col items-center text-center gap-6 py-6 max-w-md mx-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-[#FFD166]/15 border border-[#FFD166] flex items-center justify-center text-3xl">
          🧠
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#F7F7F5]">
            Memory Round Complete!
          </h2>
          <p className="text-xs text-[#9AA1AA] mt-1">
            Visual Mnemonics & Vocabulary Associations Tested
          </p>
        </div>

        <div className="w-full p-4 rounded-3xl bg-[#14171C] border border-[#1B2027] flex items-center justify-around">
          <div>
            <span className="text-xs text-[#9AA1AA] block">Score</span>
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
              setStreak(0);
              setIsFinished(false);
              const char = pickSmartCharacter(charactersPool, masteryMap);
              setCurrentQuestion(generateMemoryQuestion(char, charactersPool));
            }}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] text-[#0B0D10] font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl shadow-[#FF5C7A]/20"
          >
            <RotateCcw size={18} />
            <span>PLAY ANOTHER MEMORY ROUND</span>
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

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 mx-4">
          <div className="h-2 rounded-full bg-[#1B2027] overflow-hidden">
            <div
              className="h-full bg-[#FFD166] transition-all duration-300"
              style={{ width: `${((questionCount + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#9AA1AA] tabular-nums">
          {questionCount + 1}/{totalQuestions}
        </span>
      </div>

      <MemoryQuestionCard
        question={currentQuestion}
        soundEnabled={soundEnabled}
        speechEnabled={speechEnabled}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

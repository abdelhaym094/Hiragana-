import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Zap, Sparkles, Trophy } from 'lucide-react';
import { HiraganaCharacter } from '../types';
import { AnswerButton, AnswerState } from './AnswerButton';
import { AudioButton } from './AudioButton';
import { WrongAnswerFeedback } from './WrongAnswerFeedback';
import { pickSmartCharacter, getDistractors } from '../utils/mastery';
import { sfx, speakJapanese } from '../utils/audio';

interface MultipleChoiceGameProps {
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

export const MultipleChoiceGame: React.FC<MultipleChoiceGameProps> = ({
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
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [currentCharacter, setCurrentCharacter] = useState<HiraganaCharacter>(() => 
    pickSmartCharacter(charactersPool, masteryMap)
  );
  const [selectedRomaji, setSelectedRomaji] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showLearningReview, setShowLearningReview] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Generate 4 choices
  const options = useMemo(() => {
    if (!currentCharacter) return [];
    const distractors = getDistractors(currentCharacter, charactersPool, 3);
    const all = [currentCharacter.romaji, ...distractors];
    return all.sort(() => Math.random() - 0.5);
  }, [currentCharacter, charactersPool]);

  const startTimeRef = useRef<number>(Date.now());

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
    setShowLearningReview(false);
    startTimeRef.current = Date.now();
    const nextChar = pickSmartCharacter(charactersPool, masteryMap, currentCharacter.char);
    setCurrentCharacter(nextChar);
  }, [questionCount, totalQuestions, charactersPool, masteryMap, currentCharacter, soundEnabled, onCompleteGame]);

  const handleSelectOption = (romaji: string) => {
    if (isAnswered || !currentCharacter) return;

    const responseTime = Date.now() - startTimeRef.current;
    setSelectedRomaji(romaji);
    setIsAnswered(true);
    const isCorrect = romaji === currentCharacter.romaji;

    onRecordAnswer(currentCharacter.char, isCorrect, responseTime, romaji);

    if (isCorrect) {
      sfx.correct(soundEnabled);
      speakJapanese(currentCharacter.char, speechEnabled);
      setCorrectScore((prev) => prev + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo((prev) => Math.max(prev, newCombo));

      // Combo bonus calculation: x2 for 3+, x3 for 5+
      const comboBonus = newCombo >= 5 ? 10 : newCombo >= 3 ? 5 : 0;
      onAddXp(10 + comboBonus);

      setTimeout(() => {
        nextQuestion();
      }, 950);
    } else {
      sfx.wrong(soundEnabled);
      setCombo(0);
      // Show educational review
      setTimeout(() => {
        setShowLearningReview(true);
      }, 600);
    }
  };

  // Keyboard support 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || isFinished || showLearningReview) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= options.length) {
        handleSelectOption(options[keyNum - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isAnswered, isFinished, showLearningReview]);

  // Victory Reward Screen
  if (isFinished) {
    const accuracy = Math.round((correctScore / totalQuestions) * 100);
    const isPerfect = correctScore === totalQuestions;

    return (
      <div className="flex flex-col items-center text-center gap-5 py-6 max-w-md mx-auto animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-[#FFD166]/15 border-2 border-[#FFD166] flex items-center justify-center text-4xl shadow-xl shadow-[#FFD166]/20">
          {isPerfect ? '🔥' : '🎯'}
        </div>

        <div>
          <span className="hanko-seal text-[10px] mb-1">
            ROUND CLEAR
          </span>
          <h2 className="text-2xl font-black text-[#F5F7FA]">
            {isPerfect ? 'PERFECT ACCURACY!' : 'TRAINING COMPLETE!'}
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Multiple choice sound recognition practice
          </p>
        </div>

        {/* Reward Stats */}
        <div className="w-full grid grid-cols-3 gap-2 p-3.5 rounded-3xl bg-[#11151A] border border-[#282F38]">
          <div className="p-2.5 rounded-2xl bg-[#080A0D]/50 border border-[#282F38]">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block">Score</span>
            <span className="text-xl font-black text-[#F5F7FA] tabular-nums">
              {correctScore}/{totalQuestions}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#080A0D]/50 border border-[#282F38]">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block">Accuracy</span>
            <span className="text-xl font-black text-[#42E6A4] tabular-nums">
              {accuracy}%
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#080A0D]/50 border border-[#282F38]">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block">Best Combo</span>
            <span className="text-xl font-black text-[#FFD166] tabular-nums">
              {bestCombo}x
            </span>
          </div>
        </div>

        <div className="w-full space-y-2.5 mt-2">
          <button
            type="button"
            onClick={() => {
              setQuestionCount(0);
              setCorrectScore(0);
              setCombo(0);
              setIsFinished(false);
              setIsAnswered(false);
              setShowLearningReview(false);
              setSelectedRomaji(null);
              setCurrentCharacter(pickSmartCharacter(charactersPool, masteryMap));
            }}
            className="btn-game-primary w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer uppercase shadow-xl"
          >
            <RotateCcw size={16} />
            <span>PLAY AGAIN</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="btn-game-secondary w-full py-3.5 rounded-2xl text-xs font-bold cursor-pointer uppercase"
          >
            Return to Quest
          </button>
        </div>
      </div>
    );
  }

  // Educational Review on Mistake
  if (showLearningReview) {
    return (
      <div className="max-w-md mx-auto py-2">
        <WrongAnswerFeedback
          character={currentCharacter}
          speechEnabled={speechEnabled}
          onContinue={nextQuestion}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Header with Combo & Progress */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#11151A] border border-[#282F38] text-[#8B949E] hover:text-[#F5F7FA] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Combo indicator */}
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD166]/15 border border-[#FFD166]/40 animate-in zoom-in-75">
              <Zap size={13} className="text-[#FFD166]" />
              <span className="text-xs font-black text-[#FFD166]">
                COMBO x{combo}
              </span>
            </div>
          )}
          <span className="text-xs font-mono font-bold text-[#8B949E] tabular-nums">
            {questionCount + 1}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1.5 rounded-full bg-[#11151A] overflow-hidden border border-[#282F38]">
        <div
          className="h-full bg-gradient-to-r from-[#FF5C7A] to-[#FFD166] transition-all duration-300"
          style={{ width: `${((questionCount + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Hero Question Arena */}
      <div className="flex flex-col items-center p-6 rounded-3xl bg-gradient-to-b from-[#171C22] to-[#11151A] border-2 border-[#282F38] text-center shadow-xl relative overflow-hidden">
        <span className="text-xs font-extrabold text-[#8B949E] uppercase tracking-wider mb-2">
          What sound does this make?
        </span>

        {/* Large Centered Hero Hiragana */}
        <div className="w-32 h-32 my-2 rounded-3xl bg-[#080A0D] border-2 border-[#282F38] flex items-center justify-center shadow-inner relative">
          <span className="text-8xl font-japanese font-black text-[#F5F7FA]">
            {currentCharacter.char}
          </span>
        </div>

        <div className="mt-2">
          <AudioButton
            text={currentCharacter.char}
            enabled={speechEnabled}
            size="sm"
          />
        </div>
      </div>

      {/* 4 Large Tactical Answer Buttons */}
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
              onClick={() => handleSelectOption(opt)}
            />
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Sparkles, Volume2, Brain, Zap, Check, RotateCcw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CognitiveQuestion, AnswerOutcomeResult } from '../engine';
import { HiraganaCharacter, CharacterMemory, CognitiveQuestionType } from '../types';
import { AnswerButton, AnswerState } from './AnswerButton';
import { AudioButton } from './AudioButton';
import { sfx, speakJapanese } from '../utils/audio';

interface CognitiveSessionGameProps {
  questions: CognitiveQuestion[];
  unlockedPool: HiraganaCharacter[];
  masteryMap: Record<string, CharacterMemory>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onRecordCognitiveAnswer: (
    char: string,
    isCorrect: boolean,
    responseTimeMs: number,
    questionType: CognitiveQuestionType,
    selectedOption?: string
  ) => AnswerOutcomeResult;
  onAddXp: (amount: number) => void;
  onCompleteSession: () => void;
  onBack: () => void;
}

export const CognitiveSessionGame: React.FC<CognitiveSessionGameProps> = ({
  questions,
  unlockedPool,
  masteryMap,
  soundEnabled,
  speechEnabled,
  onRecordCognitiveAnswer,
  onAddXp,
  onCompleteSession,
  onBack
}) => {
  const [sessionQuestions, setSessionQuestions] = useState<CognitiveQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<AnswerOutcomeResult | null>(null);

  // Score & Performance
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [durableRecallWins, setDurableRecallWins] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [isFatigueDetected, setIsFatigueDetected] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const currentQ = sessionQuestions[currentIndex];

  // Reset timer on question change
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedValue(null);
    setIsAnswered(false);
    setLastOutcome(null);

    // Auto-play audio if sound-to-character
    if (currentQ && currentQ.audioToPlay && speechEnabled && !isFinished) {
      const timer = setTimeout(() => {
        speakJapanese(currentQ.audioToPlay!, speechEnabled);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQ, speechEnabled, isFinished]);

  const handleSelect = (val: string) => {
    if (isAnswered || !currentQ) return;

    const responseTime = Date.now() - startTimeRef.current;
    setSelectedValue(val);
    setIsAnswered(true);

    const isCorrect = val === currentQ.correctValue;
    setResponseTimes(prev => [...prev, responseTime]);

    // Record with Cognitive Memory Engine
    const outcome = onRecordCognitiveAnswer(
      currentQ.character.char,
      isCorrect,
      responseTime,
      currentQ.type,
      val
    );
    setLastOutcome(outcome);

    if (isCorrect) {
      sfx.correct(soundEnabled);
      setCorrectCount(prev => prev + 1);

      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo(prev => Math.max(prev, newCombo));

      // XP: Base 10 XP + Combo Bonus
      const comboBonus = newCombo >= 5 ? 10 : newCombo >= 3 ? 5 : 0;
      onAddXp(10 + comboBonus);

      if (outcome.isDurableRecall) {
        setDurableRecallWins(prev => prev + 1);
        try {
          confetti({
            particleCount: 25,
            spread: 55,
            origin: { y: 0.6 }
          });
        } catch {}
      }

      // Check fatigue: if already answered 6+ questions and performing well, wrap up smoothly
      const nextDelay = outcome.isDurableRecall ? 1300 : 900;
      setTimeout(() => {
        advanceNext();
      }, nextDelay);
    } else {
      sfx.wrong(soundEnabled);
      setCombo(0);

      // Fatigue check: two consecutive mistakes or slow response
      if (combo === 0 && currentIndex >= 4 && responseTime > 4500) {
        setIsFatigueDetected(true);
      }

      // Allow learner to see explanation and click to continue
    }
  };

  const advanceNext = useCallback(() => {
    if (currentIndex + 1 >= sessionQuestions.length || isFatigueDetected) {
      setIsFinished(true);
      sfx.victory(soundEnabled);
      onCompleteSession();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, sessionQuestions.length, isFatigueDetected, soundEnabled, onCompleteSession]);

  // Keyboard shortcuts 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || !currentQ) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= currentQ.options.length) {
        handleSelect(currentQ.options[keyNum - 1].value);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, isAnswered]);

  if (!currentQ && !isFinished) {
    return null;
  }

  // Session Completed Summary
  if (isFinished) {
    const totalAttempted = currentIndex + 1;
    const accuracy = Math.round((correctCount / Math.max(1, totalAttempted)) * 100);
    const avgSpeed = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000).toFixed(1)
      : '1.8';

    return (
      <div className="flex flex-col items-center text-center gap-6 py-6 max-w-md mx-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-[#FFD166]/15 border border-[#FFD166] flex items-center justify-center text-3xl shadow-xl shadow-[#FFD166]/10">
          🧠
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#42E6A4]/15 border border-[#42E6A4]/30 text-xs font-bold text-[#42E6A4] uppercase mb-2">
            <Sparkles size={14} />
            <span>Memory Traces Strengthened</span>
          </div>
          <h2 className="text-2xl font-black text-[#F7F7F5]">
            Session Complete!
          </h2>
          <p className="text-xs text-[#9AA1AA] mt-1 max-w-xs mx-auto">
            Your brain retrieved characters across multi-dimensional pathways. Retrieval spaced into long-term memory.
          </p>
        </div>

        {/* HUD Performance Grid */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-3xl bg-[#14171C] border border-[#1B2027]">
          <div className="p-2">
            <span className="text-[10px] text-[#9AA1AA] uppercase font-bold block">Accuracy</span>
            <span className="text-xl font-black text-[#42E6A4] tabular-nums mt-0.5 block">
              {accuracy}%
            </span>
          </div>

          <div className="p-2 border-x border-[#1B2027]">
            <span className="text-[10px] text-[#9AA1AA] uppercase font-bold block">Avg Speed</span>
            <span className="text-xl font-black text-[#FFD166] tabular-nums mt-0.5 block">
              {avgSpeed}s
            </span>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-[#9AA1AA] uppercase font-bold block">Durable Wins</span>
            <span className="text-xl font-black text-[#FF5C7A] tabular-nums mt-0.5 block">
              +{durableRecallWins}
            </span>
          </div>
        </div>

        {/* Fatigue gentle wrap-up note if detected */}
        {isFatigueDetected && (
          <div className="p-3 rounded-2xl bg-[#0B0D10] border border-[#282F38] text-xs text-[#9AA1AA] max-w-xs">
            ✨ <strong className="text-[#F7F7F5]">Smart pacing:</strong> We finished early to prevent brain fatigue and preserve clean memory traces.
          </div>
        )}

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setCorrectCount(0);
              setCombo(0);
              setDurableRecallWins(0);
              setResponseTimes([]);
              setIsFatigueDetected(false);
              setIsFinished(false);
            }}
            className="btn-game-primary w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#FF5C7A]/25 uppercase"
          >
            <RotateCcw size={18} />
            <span>TRAIN ANOTHER SESSION</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-2xl bg-[#14171C] border border-[#1B2027] text-xs font-bold text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          >
            Return to Dojo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 mx-4">
          <div className="h-2 rounded-full bg-[#1B2027] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF5C7A] to-[#FFD166] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Counter & Combo */}
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <span className="text-[11px] font-black text-[#FFD166] px-2 py-0.5 rounded-full bg-[#FFD166]/15 border border-[#FFD166]/30 animate-pulse">
              ⚡ {combo}x
            </span>
          )}
          <span className="text-xs font-mono font-bold text-[#9AA1AA] tabular-nums">
            {currentIndex + 1}/{sessionQuestions.length}
          </span>
        </div>
      </div>

      {/* Delayed Recall Bonus Callout Banner */}
      {lastOutcome?.isDurableRecall && isAnswered && (
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#FFD166]/20 to-[#FF5C7A]/20 border border-[#FFD166]/50 flex items-center justify-between text-xs font-black text-[#FFD166] animate-in zoom-in-95">
          <span className="flex items-center gap-1.5">
            <Sparkles size={15} />
            <span>STILL GOT IT! Long-term recall reinforced</span>
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-[#FFD166] text-[#080A0D] font-mono text-[11px]">
            +25 XP
          </span>
        </div>
      )}

      {/* Main Question Card Frame */}
      <div className="relative p-5 rounded-3xl bg-[#14171C] border border-[#1B2027] shadow-xl text-center overflow-hidden">
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2027] border border-[#282F38] text-[11px] font-bold text-[#FFD166] uppercase mb-3">
          <Brain size={13} />
          <span>{currentQ.promptKicker}</span>
        </div>

        {/* Hero Prompt Display */}
        <div className="my-2 min-h-[90px] flex flex-col items-center justify-center">
          {currentQ.type === 'characterToRomaji' || currentQ.type === 'characterToWord' || currentQ.type === 'characterToSound' ? (
            <div className="flex items-center gap-3">
              <span className="text-7xl font-japanese font-black text-[#F5F7FA]">
                {currentQ.promptMain}
              </span>
              <AudioButton
                text={currentQ.character.char}
                enabled={speechEnabled}
                size="md"
              />
            </div>
          ) : currentQ.type === 'soundToCharacter' ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => speakJapanese(currentQ.character.char, speechEnabled)}
                className="w-20 h-20 rounded-3xl bg-[#080A0D] border-2 border-[#FFD166]/40 hover:border-[#FFD166] flex items-center justify-center text-3xl shadow-lg cursor-pointer transition-all active:scale-95 group"
                aria-label="Replay Audio"
              >
                <Volume2 size={32} className="text-[#FFD166] group-hover:scale-110 transition-transform" />
              </button>
              <span className="text-[11px] font-bold text-[#8B949E] uppercase">
                Tap to hear again
              </span>
            </div>
          ) : currentQ.type === 'romajiToCharacter' ? (
            <div className="w-24 h-24 rounded-3xl bg-[#080A0D] border border-[#282F38] flex items-center justify-center text-5xl font-mono font-black text-[#FFD166]">
              {currentQ.promptMain}
            </div>
          ) : currentQ.type === 'discrimination' ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-[#F5F7FA]">
                {currentQ.promptMain}
              </span>
              <span className="text-xs text-[#FFD166] font-medium">
                Sharpen your eye between similar shapes
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {currentQ.conceptIcon && (
                <span className="text-4xl mb-0.5">{currentQ.conceptIcon}</span>
              )}
              <span className="text-2xl font-bold text-[#F5F7FA]">
                {currentQ.promptMain}
              </span>
            </div>
          )}
        </div>

        {/* Prompt subtitle instructions */}
        {currentQ.promptSub && (
          <p className="text-xs text-[#9AA1AA] max-w-xs mx-auto mt-2 leading-relaxed">
            {currentQ.promptSub}
          </p>
        )}

        {/* Explanation callout on answer */}
        {isAnswered && (
          <div className={`mt-3.5 p-3 rounded-2xl border text-xs font-medium animate-in fade-in ${
            selectedValue === currentQ.correctValue
              ? 'bg-[#42E6A4]/10 border-[#42E6A4]/30 text-[#42E6A4]'
              : 'bg-[#FF5C7A]/10 border-[#FF5C7A]/30 text-[#F5F7FA]'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              {selectedValue === currentQ.correctValue ? (
                <span>✓ Clean Recall</span>
              ) : (
                <span>Almost! Let's lock this in:</span>
              )}
            </div>
            <span>{currentQ.explanation}</span>
          </div>
        )}
      </div>

      {/* Answer Options Grid */}
      <div className={`grid gap-2.5 ${currentQ.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
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
              key={`${opt.value}_${idx}`}
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

      {/* Manual Continue Button on mistake to let user absorb feedback */}
      {isAnswered && selectedValue !== currentQ.correctValue && (
        <button
          type="button"
          onClick={advanceNext}
          className="w-full py-4 px-6 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] text-[#080A0D] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C7A]/25 transition-all uppercase"
        >
          <Check size={16} strokeWidth={3} />
          <span>GOT IT — CONTINUE</span>
        </button>
      )}
    </div>
  );
};

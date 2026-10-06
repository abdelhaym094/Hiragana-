import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check, Volume2 } from 'lucide-react';
import { MemoryQuestion } from '../utils/mastery';
import { AnswerButton, AnswerState } from './AnswerButton';
import { sfx, speakJapanese } from '../utils/audio';

interface MemoryQuestionCardProps {
  question: MemoryQuestion;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onAnswer: (isCorrect: boolean) => void;
  showContinueButton?: boolean;
}

export const MemoryQuestionCard: React.FC<MemoryQuestionCardProps> = ({
  question,
  soundEnabled,
  speechEnabled,
  onAnswer,
  showContinueButton = false
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedValue(null);
    setIsAnswered(false);
  }, [question]);

  const handleSelect = (val: string) => {
    if (isAnswered) return;

    setSelectedValue(val);
    setIsAnswered(true);
    const isCorrect = val === question.correctValue;

    if (isCorrect) {
      sfx.correct(soundEnabled);
      if (question.character.char) {
        speakJapanese(question.character.char, speechEnabled);
      }
    } else {
      sfx.wrong(soundEnabled);
    }

    if (!showContinueButton) {
      setTimeout(() => {
        onAnswer(isCorrect);
      }, isCorrect ? 900 : 1400);
    }
  };

  // Keyboard 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= question.options.length) {
        handleSelect(question.options[keyNum - 1].value);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, isAnswered]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Question Card Box */}
      <div className="p-5 rounded-3xl bg-[#14171C] border border-[#1B2027] text-center shadow-lg relative overflow-hidden">
        {/* Memory Test Kicker */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD166]/10 border border-[#FFD166]/20 text-[11px] font-bold text-[#FFD166] uppercase mb-2">
          <Brain size={13} />
          <span>{question.promptKicker}</span>
        </div>

        {/* Hero Prompt Display */}
        <div className="my-2">
          {question.type === 'concept_to_char' ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl">{question.conceptIcon}</span>
              <span className="text-2xl font-bold text-[#F7F7F5] capitalize">
                {question.character.word.meaning}
              </span>
            </div>
          ) : question.type === 'word_to_char' ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-japanese font-bold text-[#F7F7F5]">
                {question.promptMain}
              </span>
            </div>
          ) : question.type === 'sound_to_char' ? (
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center text-4xl font-mono font-black text-[#FFD166]">
              {question.promptMain}
            </div>
          ) : (
            // char_to_word
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center text-5xl font-japanese font-bold text-[#F7F7F5]">
              {question.promptMain}
            </div>
          )}
        </div>

        {/* Subtitle instructions */}
        {question.promptSub && (
          <p className="text-xs text-[#9AA1AA] max-w-xs mx-auto mt-2 leading-relaxed">
            {question.promptSub}
          </p>
        )}

        {/* Explanation text on answer */}
        {isAnswered && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#0B0D10]/60 border border-[#1B2027] text-xs font-medium text-[#42E6A4] animate-in fade-in">
            ✓ {question.explanation}
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {question.options.map((opt, idx) => {
          let state: AnswerState = 'neutral';
          if (isAnswered) {
            if (opt.value === question.correctValue) {
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

      {/* Optional Manual Continue Button if showContinueButton */}
      {showContinueButton && isAnswered && (
        <button
          type="button"
          onClick={() => onAnswer(selectedValue === question.correctValue)}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] text-[#0B0D10] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          <Check size={16} strokeWidth={3} />
          <span>CONTINUE</span>
        </button>
      )}
    </div>
  );
};

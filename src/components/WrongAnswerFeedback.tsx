import React from 'react';
import { Volume2, ArrowRight, Brain } from 'lucide-react';
import { HiraganaCharacter } from '../types';
import { AudioButton } from './AudioButton';

interface WrongAnswerFeedbackProps {
  character: HiraganaCharacter;
  speechEnabled: boolean;
  onContinue: () => void;
}

export const WrongAnswerFeedback: React.FC<WrongAnswerFeedbackProps> = ({
  character,
  speechEnabled,
  onContinue
}) => {
  return (
    <div className="w-full max-w-sm mx-auto p-5 rounded-3xl bg-[#171C22] border-2 border-[#FF5C7A] shadow-2xl animate-in zoom-in-95 duration-150 text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5C7A]/15 text-xs font-black text-[#FF5C7A] uppercase mb-2">
        <span>Not quite! Let's remember:</span>
      </div>

      {/* Target Character Hero */}
      <div className="flex flex-col items-center my-3">
        <div className="w-24 h-24 rounded-2xl bg-[#080A0D] border-2 border-[#282F38] flex items-center justify-center mb-2">
          <span className="text-6xl font-japanese font-black text-[#F5F7FA]">
            {character.char}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-black text-[#FFD166] uppercase">
            {character.romaji}
          </span>
          <AudioButton text={character.char} enabled={speechEnabled} size="sm" />
        </div>
      </div>

      {/* Memory Trick Box */}
      <div className="p-3 rounded-2xl bg-[#080A0D]/70 border border-[#282F38] text-left mb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#FFD166] uppercase mb-1">
          <Brain size={13} />
          <span>Memory Trick</span>
        </div>
        <p className="text-xs text-[#F5F7FA] leading-relaxed">
          "{character.mnemonic}"
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="btn-game-primary w-full py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C7A]/20 uppercase"
      >
        <span>GOT IT — CONTINUE</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

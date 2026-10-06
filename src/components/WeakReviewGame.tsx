import React, { useState } from 'react';
import { Brain, ArrowLeft, RotateCcw, Sparkles, CheckCircle2, Eye, X, Zap } from 'lucide-react';
import { HiraganaCharacter, CognitiveQuestionType } from '../types';
import { MultipleChoiceGame } from './MultipleChoiceGame';
import { MemoryChallengeGame } from './MemoryChallengeGame';
import { CognitiveSessionGame } from './CognitiveSessionGame';
import { MemoryCard } from './MemoryCard';
import { AudioButton } from './AudioButton';
import { sfx } from '../utils/audio';
import { generateAdaptiveSession, AnswerOutcomeResult } from '../engine';

interface WeakReviewGameProps {
  weakList: {
    character: HiraganaCharacter;
    mastery: any;
    isRecognitionWeak?: boolean;
    isSoundWeak?: boolean;
    isRecallWeak?: boolean;
    isMemoryWeak?: boolean;
    isConfusionWeak?: boolean;
    isForgettingRiskHigh?: boolean;
    primaryWeakness?: string;
  }[];
  allUnlocked: HiraganaCharacter[];
  masteryMap: Record<string, any>;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onRecordAnswer: (char: string, isCorrect: boolean) => void;
  onRecordMemoryAnswer: (char: string, isCorrect: boolean) => void;
  onRecordCognitiveAnswer?: (
    char: string,
    isCorrect: boolean,
    responseTimeMs: number,
    questionType: CognitiveQuestionType,
    selectedOption?: string
  ) => AnswerOutcomeResult;
  onAddXp: (amount: number) => void;
  onBack: () => void;
}

export const WeakReviewGame: React.FC<WeakReviewGameProps> = ({
  weakList,
  allUnlocked,
  masteryMap,
  soundEnabled,
  speechEnabled,
  onRecordAnswer,
  onRecordMemoryAnswer,
  onRecordCognitiveAnswer,
  onAddXp,
  onBack
}) => {
  const [drillMode, setDrillMode] = useState<'none' | 'recognition' | 'memory' | 'cognitive'>('none');
  const [inspectingChar, setInspectingChar] = useState<HiraganaCharacter | null>(null);

  const drillPool = weakList.length >= 2 
    ? weakList.map(w => (w as any).character || w)
    : allUnlocked;

  // Active Adaptive Cognitive Drill
  if (drillMode === 'cognitive' && onRecordCognitiveAnswer) {
    const session = generateAdaptiveSession(drillPool, masteryMap, { totalQuestions: 8 });
    return (
      <CognitiveSessionGame
        questions={session.questions}
        unlockedPool={allUnlocked}
        masteryMap={masteryMap}
        soundEnabled={soundEnabled}
        speechEnabled={speechEnabled}
        onRecordCognitiveAnswer={onRecordCognitiveAnswer}
        onAddXp={onAddXp}
        onCompleteSession={() => setDrillMode('none')}
        onBack={() => setDrillMode('none')}
      />
    );
  }

  // Active Memory Drill
  if (drillMode === 'memory') {
    return (
      <MemoryChallengeGame
        charactersPool={drillPool}
        masteryMap={masteryMap}
        soundEnabled={soundEnabled}
        speechEnabled={speechEnabled}
        onRecordAnswer={onRecordAnswer}
        onRecordMemoryAnswer={onRecordMemoryAnswer}
        onAddXp={onAddXp}
        onCompleteGame={() => setDrillMode('none')}
        onBack={() => setDrillMode('none')}
        totalQuestions={Math.max(4, Math.min(8, drillPool.length * 2))}
      />
    );
  }

  // Active Recognition Drill
  if (drillMode === 'recognition') {
    return (
      <MultipleChoiceGame
        charactersPool={drillPool}
        masteryMap={masteryMap}
        soundEnabled={soundEnabled}
        speechEnabled={speechEnabled}
        onRecordAnswer={onRecordAnswer}
        onAddXp={onAddXp}
        onCompleteGame={() => setDrillMode('none')}
        onBack={() => setDrillMode('none')}
        totalQuestions={Math.max(4, Math.min(8, drillPool.length * 2))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto py-2 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#14171C] border border-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/30">
          <Brain size={16} className="text-[#FFD166]" />
          <span className="text-xs font-bold text-[#FFD166]">Weak Characters Review</span>
        </div>

        <div className="w-8" />
      </div>

      {/* Review Banner */}
      <div className="p-5 rounded-3xl bg-[#14171C] border border-[#1B2027] text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center text-2xl mx-auto mb-3">
          🧠
        </div>
        <h2 className="text-xl font-black text-[#F7F7F5]">
          Smart Memory Repetition
        </h2>
        <p className="text-xs text-[#9AA1AA] mt-1 max-w-xs mx-auto">
          {weakList.length > 0
            ? 'Monitors visual recognition, sound comprehension, reverse recall, and forgetting curves.'
            : 'All unlocked characters currently have solid recognition and memory associations!'}
        </p>

        {/* Drill Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              sfx.click(soundEnabled);
              setDrillMode('cognitive');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF5C7A] hover:bg-[#ff4366] active:scale-[0.98] text-[#080A0D] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5C7A]/20 transition-all uppercase"
          >
            <Sparkles size={16} />
            <span>START ADAPTIVE MEMORY SESSION</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sfx.click(soundEnabled);
                setDrillMode('memory');
              }}
              className="flex-1 py-3 px-3 rounded-2xl bg-[#FFD166] hover:bg-[#ffc640] active:scale-[0.98] text-[#0B0D10] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Brain size={14} />
              <span>MEMORY CARDS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sfx.click(soundEnabled);
                setDrillMode('recognition');
              }}
              className="flex-1 py-3 px-3 rounded-2xl bg-[#1B2027] hover:bg-[#252C36] active:scale-[0.98] text-[#F7F7F5] border border-[#2D3748] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw size={14} />
              <span>SOUND QUIZ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weak Characters List */}
      {weakList.length > 0 ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#9AA1AA] uppercase tracking-wider">
              Needs Reinforcement ({weakList.length})
            </span>
            <span className="text-[11px] text-[#9AA1AA]">Tap card to view trick</span>
          </div>

          <div className="space-y-2.5">
            {weakList.map((item, idx) => {
              const character = (item as any)?.character || item;
              if (!character || !character.char) return null;
              const mastery = (item as any)?.mastery || masteryMap?.[character.char] || {};
              const isRecognitionWeak = (item as any)?.isRecognitionWeak;
              const isMemoryWeak = (item as any)?.isMemoryWeak;
              const primaryWeakness = (item as any)?.primaryWeakness;
              const memScore = mastery?.memoryStrength ?? (mastery?.visualMemoryStrength ? Math.round(mastery.visualMemoryStrength / 20) : 0);
              const memPct = Math.round((memScore / 5) * 100);
              const accuracy = mastery?.accuracy ?? 100;

              return (
                <div
                  key={character.char || idx}
                  onClick={() => setInspectingChar(character)}
                  className="p-3.5 rounded-2xl bg-[#14171C] hover:bg-[#1B2027] border border-[#1B2027] hover:border-[#FF5C7A]/50 flex items-center justify-between shadow-sm cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B0D10] border border-[#1B2027] flex items-center justify-center font-japanese text-2xl font-bold text-[#F7F7F5] group-hover:text-[#FF5C7A] transition-colors">
                      {character.char}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-base font-bold text-[#FFD166] uppercase">
                          {character.romaji}
                        </span>
                        <span className="text-xs text-[#9AA1AA]">·</span>
                        <span className="text-xs font-japanese font-semibold text-[#F7F7F5]">
                          {character.word?.jp}
                        </span>
                        <span className="text-xs text-[#9AA1AA]">
                          {character.word?.conceptIcon}
                        </span>
                      </div>
                      
                      {/* Diagnostic badges: Sound vs Memory */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {primaryWeakness && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#FF5C7A]/20 text-[#FF5C7A] border border-[#FF5C7A]/30">
                            {primaryWeakness}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${isRecognitionWeak ? 'bg-[#FF5C7A]/15 text-[#FF5C7A]' : 'bg-[#42E6A4]/15 text-[#42E6A4]'}`}>
                          Recog: {accuracy}%
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${isMemoryWeak ? 'bg-[#FFD166]/15 text-[#FFD166]' : 'bg-[#42E6A4]/15 text-[#42E6A4]'}`}>
                          Memory: {memPct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setInspectingChar(character)}
                      className="p-2 rounded-xl bg-[#0B0D10] text-[#9AA1AA] hover:text-[#FFD166] cursor-pointer"
                      title="View Memory Card"
                    >
                      <Eye size={16} />
                    </button>
                    <AudioButton
                      text={character.char}
                      enabled={speechEnabled}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#14171C]/40 border border-[#1B2027] text-center flex flex-col items-center">
          <CheckCircle2 size={36} className="text-[#42E6A4] mb-2" />
          <h3 className="text-sm font-bold text-[#F7F7F5]">
            Memory Connections Strong!
          </h3>
          <p className="text-xs text-[#9AA1AA] mt-1 max-w-xs">
            As you practice and answer quiz or memory questions, the smart repetition engine will identify characters that need an association boost.
          </p>
        </div>
      )}

      {/* Inspecting Memory Card Modal */}
      {inspectingChar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectingChar(null)}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setInspectingChar(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-[#1B2027] text-[#9AA1AA] hover:text-[#F7F7F5] border border-[#2D3748] cursor-pointer shadow-lg"
            >
              <X size={16} />
            </button>
            <MemoryCard
              character={inspectingChar}
              day={inspectingChar.day}
              speechEnabled={speechEnabled}
              soundEnabled={soundEnabled}
              onGotIt={() => setInspectingChar(null)}
              mastery={masteryMap[inspectingChar.char]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

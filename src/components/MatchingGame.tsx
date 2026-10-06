import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, Check } from 'lucide-react';
import { HiraganaCharacter } from '../types';
import { sfx, speakJapanese } from '../utils/audio';

interface MatchingGameProps {
  charactersPool: HiraganaCharacter[];
  soundEnabled: boolean;
  speechEnabled: boolean;
  onRecordAnswer: (char: string, isCorrect: boolean) => void;
  onAddXp: (amount: number) => void;
  onCompleteGame: () => void;
  onBack: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  charactersPool,
  soundEnabled,
  speechEnabled,
  onRecordAnswer,
  onAddXp,
  onCompleteGame,
  onBack
}) => {
  const [round, setRound] = useState(1);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedKana, setSelectedKana] = useState<string | null>(null);
  const [selectedRomaji, setSelectedRomaji] = useState<string | null>(null);
  const [shakingKana, setShakingKana] = useState<string | null>(null);
  const [shakingRomaji, setShakingRomaji] = useState<string | null>(null);

  // Pick 4 characters for current matching board
  const [currentSet, setCurrentSet] = useState<HiraganaCharacter[]>(() => {
    return [...charactersPool].sort(() => Math.random() - 0.5).slice(0, 4);
  });

  const [shuffledKana, setShuffledKana] = useState<HiraganaCharacter[]>([]);
  const [shuffledRomaji, setShuffledRomaji] = useState<{ id: string; romaji: string; char: string; icon: string }[]>([]);

  useEffect(() => {
    const pool = [...charactersPool].sort(() => Math.random() - 0.5);
    const chosen = pool.slice(0, Math.min(4, pool.length));
    setCurrentSet(chosen);
    setShuffledKana([...chosen].sort(() => Math.random() - 0.5));
    setShuffledRomaji(
      [...chosen]
        .map(c => ({ id: c.char, romaji: c.romaji, char: c.char, icon: c.word.conceptIcon }))
        .sort(() => Math.random() - 0.5)
    );
    setSelectedKana(null);
    setSelectedRomaji(null);
    setMatchedPairs([]);
  }, [round, charactersPool]);

  const checkMatch = (kanaChar: string, romajiId: string) => {
    if (kanaChar === romajiId) {
      // MATCH SUCCESS
      sfx.match(soundEnabled);
      speakJapanese(kanaChar, speechEnabled);
      onRecordAnswer(kanaChar, true);
      onAddXp(10);

      setMatchedPairs((prev) => {
        const next = [...prev, kanaChar];
        if (next.length === currentSet.length) {
          setTimeout(() => {
            sfx.victory(soundEnabled);
            onCompleteGame();
          }, 400);
        }
        return next;
      });

      setSelectedKana(null);
      setSelectedRomaji(null);
    } else {
      // MISMATCH
      sfx.wrong(soundEnabled);
      onRecordAnswer(kanaChar, false);
      setShakingKana(kanaChar);
      setShakingRomaji(romajiId);

      setTimeout(() => {
        setShakingKana(null);
        setShakingRomaji(null);
        setSelectedKana(null);
        setSelectedRomaji(null);
      }, 450);
    }
  };

  const handleKanaClick = (char: string) => {
    if (matchedPairs.includes(char) || shakingKana) return;
    sfx.click(soundEnabled);
    speakJapanese(char, speechEnabled);

    if (selectedRomaji) {
      checkMatch(char, selectedRomaji);
    } else {
      setSelectedKana(char);
    }
  };

  const handleRomajiClick = (romajiId: string) => {
    if (matchedPairs.includes(romajiId) || shakingRomaji) return;
    sfx.click(soundEnabled);

    if (selectedKana) {
      checkMatch(selectedKana, romajiId);
    } else {
      setSelectedRomaji(romajiId);
    }
  };

  const isRoundFinished = matchedPairs.length === currentSet.length && currentSet.length > 0;

  if (isRoundFinished) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-6 max-w-md mx-auto animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-[#42E6A4]/15 border-2 border-[#42E6A4] flex items-center justify-center text-4xl shadow-xl shadow-[#42E6A4]/20">
          ⚡
        </div>

        <div>
          <span className="hanko-seal text-[10px] mb-1">
            ROUND CLEAR
          </span>
          <h2 className="text-2xl font-black text-[#F5F7FA]">
            ALL PAIRS CONNECTED!
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Fast pair recognition builds visual memory reflexes
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 p-3.5 rounded-3xl bg-[#11151A] border border-[#282F38]">
          <div className="p-3 rounded-2xl bg-[#080A0D]/50 border border-[#282F38]">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block">Connected</span>
            <span className="text-2xl font-black text-[#42E6A4] tabular-nums">
              {currentSet.length} Pairs
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#080A0D]/50 border border-[#282F38]">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block">Reward</span>
            <span className="text-2xl font-black text-[#FFD166] tabular-nums">
              +{currentSet.length * 10} XP
            </span>
          </div>
        </div>

        <div className="w-full space-y-2.5 mt-2">
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="btn-game-primary w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer uppercase shadow-xl"
          >
            <RotateCcw size={16} />
            <span>PLAY NEXT 4 PAIRS</span>
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

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-[#11151A] border border-[#282F38] text-[#8B949E] hover:text-[#F5F7FA] cursor-pointer transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <span className="text-xs font-black text-[#F5F7FA] uppercase tracking-wider block">
            Matching Pairs
          </span>
          <span className="text-[10px] text-[#8B949E]">
            Connect Kana on left with Romaji on right
          </span>
        </div>

        <span className="text-xs font-mono font-bold text-[#42E6A4] tabular-nums">
          {matchedPairs.length}/{currentSet.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-[#11151A] overflow-hidden border border-[#282F38]">
        <div
          className="h-full bg-[#42E6A4] transition-all duration-300"
          style={{ width: `${(matchedPairs.length / currentSet.length) * 100}%` }}
        />
      </div>

      {/* Matching Columns */}
      <div className="grid grid-cols-2 gap-3.5 my-1">
        {/* Left Column: Hiragana */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-extrabold text-[#8B949E] uppercase tracking-wider text-center">
            Hiragana
          </span>
          {shuffledKana.map((item) => {
            const isMatched = matchedPairs.includes(item.char);
            const isSelected = selectedKana === item.char;
            const isShaking = shakingKana === item.char;

            let cardStyle = 'bg-[#171C22] border-[#282F38] border-b-4 border-b-[#11151A] text-[#F5F7FA] hover:border-[#384250]';
            if (isMatched) {
              cardStyle = 'bg-[#42E6A4]/15 border-[#42E6A4] border-b-2 text-[#42E6A4] opacity-70 cursor-not-allowed';
            } else if (isSelected) {
              cardStyle = 'bg-[#FF5C7A]/20 border-[#FF5C7A] border-b-4 border-b-[#c93652] text-[#FF5C7A] scale-[1.02] shadow-lg shadow-[#FF5C7A]/25';
            } else if (isShaking) {
              cardStyle = 'bg-[#FF5C7A]/30 border-[#FF5C7A] border-b-2 text-[#FF5C7A] animate-shake';
            }

            return (
              <button
                key={item.char}
                type="button"
                onClick={() => handleKanaClick(item.char)}
                disabled={isMatched}
                className={`h-20 rounded-2xl border-2 flex items-center justify-center font-japanese text-4xl font-black transition-all duration-100 cursor-pointer ${cardStyle}`}
              >
                {item.char}
                {isMatched && <span className="absolute top-2 right-2 text-xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Right Column: Romaji */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-extrabold text-[#8B949E] uppercase tracking-wider text-center">
            Romaji
          </span>
          {shuffledRomaji.map((item) => {
            const isMatched = matchedPairs.includes(item.char);
            const isSelected = selectedRomaji === item.char;
            const isShaking = shakingRomaji === item.char;

            let cardStyle = 'bg-[#171C22] border-[#282F38] border-b-4 border-b-[#11151A] text-[#F5F7FA] hover:border-[#384250]';
            if (isMatched) {
              cardStyle = 'bg-[#42E6A4]/15 border-[#42E6A4] border-b-2 text-[#42E6A4] opacity-70 cursor-not-allowed';
            } else if (isSelected) {
              cardStyle = 'bg-[#FFD166]/20 border-[#FFD166] border-b-4 border-b-[#cf9e26] text-[#FFD166] scale-[1.02] shadow-lg shadow-[#FFD166]/25';
            } else if (isShaking) {
              cardStyle = 'bg-[#FF5C7A]/30 border-[#FF5C7A] border-b-2 text-[#FF5C7A] animate-shake';
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRomajiClick(item.char)}
                disabled={isMatched}
                className={`h-20 rounded-2xl border-2 flex items-center justify-center gap-2 font-mono text-2xl font-black uppercase tracking-wider transition-all duration-100 cursor-pointer relative ${cardStyle}`}
              >
                <span>{item.romaji}</span>
                <span className="text-base">{item.icon}</span>
                {isMatched && <span className="absolute top-2 right-2 text-xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

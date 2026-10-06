import React from 'react';
import { Play, Sparkles, Brain, CheckCircle2, Circle, Lock, Trophy, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { UserProgress, ViewMode, HiraganaCharacter } from '../types';
import { DAY_INFO, HIRAGANA_DATA } from '../data/hiragana';
import { sfx } from '../utils/audio';
import { getPlayerRank } from '../utils/achievements';
import { PracticeRecommendation } from '../engine';

interface HomeViewProps {
  progress: UserProgress;
  onStartQuest: (day: number) => void;
  onNavigate: (view: ViewMode) => void;
  weakCount: number;
  masteredCount: number;
  practiceRecommendation?: PracticeRecommendation;
  onStartAdaptiveSession?: (options?: { forcedChar?: HiraganaCharacter }) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  progress,
  onStartQuest,
  onNavigate,
  weakCount,
  masteredCount,
  practiceRecommendation,
  onStartAdaptiveSession
}) => {
  const currentDay = progress.currentDay;
  const currentQuest = progress.dayQuests[currentDay] || {
    newCharsLearned: false,
    miniGamesCount: 0,
    bossBeaten: false
  };

  const dayInfo = DAY_INFO[currentDay] || DAY_INFO[1];
  const dayChars = HIRAGANA_DATA.filter((c) => c.day === currentDay);
  const dayMasteredCount = dayChars.filter((c) => (progress.characters[c.char]?.masteryScore || 0) >= 4).length;

  const isDayFinished = currentQuest.newCharsLearned && currentQuest.miniGamesCount >= 2 && currentQuest.bossBeaten;
  const isStarted = currentQuest.newCharsLearned || currentQuest.miniGamesCount > 0;

  const handleStartToday = () => {
    sfx.click(progress.settings.soundEffects);
    if (!currentQuest.newCharsLearned) {
      onStartQuest(currentDay);
    } else if (currentQuest.miniGamesCount < 2) {
      onNavigate('mini-game-mc');
    } else {
      onNavigate('boss');
    }
  };

  const playerRank = getPlayerRank(progress.totalXp);

  return (
    <div className="flex flex-col gap-5 pb-24 pt-1 max-w-md mx-auto w-full">
      {/* 1. COMPACT PLAYER STATUS HUD */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#11151A] border border-[#282F38] shadow-sm">
        {/* Streak */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-[#FFD166]/10 border border-[#FFD166]/30 flex items-center justify-center text-base shrink-0">
            🔥
          </div>
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block leading-none">
              Streak
            </span>
            <span className="text-xs font-black text-[#FFD166] tabular-nums mt-0.5 block">
              {progress.streak} Day{progress.streak === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 px-2 py-1 border-x border-[#282F38]">
          <div className="w-8 h-8 rounded-xl bg-[#FF5C7A]/10 border border-[#FF5C7A]/30 flex items-center justify-center text-base shrink-0">
            ⭐
          </div>
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block leading-none">
              Score
            </span>
            <span className="text-xs font-black text-[#F5F7FA] tabular-nums mt-0.5 block">
              {progress.totalXp} XP
            </span>
          </div>
        </div>

        {/* Mastered */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-[#42E6A4]/10 border border-[#42E6A4]/30 flex items-center justify-center text-base shrink-0">
            🎌
          </div>
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block leading-none">
              Mastered
            </span>
            <span className="text-xs font-black text-[#42E6A4] tabular-nums mt-0.5 block">
              {masteredCount} / 46
            </span>
          </div>
        </div>
      </div>

      {/* COGNITIVE INTELLIGENCE: WHAT TO PRACTICE RIGHT NOW */}
      {practiceRecommendation && practiceRecommendation.type !== 'ready_for_quest' && (
        <div className={`p-4 rounded-3xl border shadow-xl flex items-center justify-between gap-3 animate-in fade-in ${
          practiceRecommendation.type === 'rusty_alert'
            ? 'bg-gradient-to-r from-[#FF5C7A]/15 via-[#1D232B] to-[#14171C] border-[#FF5C7A]/50'
            : practiceRecommendation.type === 'due_reviews'
            ? 'bg-gradient-to-r from-[#FFD166]/15 via-[#1D232B] to-[#14171C] border-[#FFD166]/40'
            : 'bg-gradient-to-r from-[#42E6A4]/15 via-[#1D232B] to-[#14171C] border-[#42E6A4]/40'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-2xl bg-[#0B0D10] border flex items-center justify-center shrink-0 ${
              practiceRecommendation.type === 'rusty_alert'
                ? 'border-[#FF5C7A]/40 text-[#FF5C7A] text-2xl font-japanese font-black'
                : practiceRecommendation.type === 'due_reviews'
                ? 'border-[#FFD166]/30 text-2xl'
                : 'border-[#42E6A4]/30 text-[#42E6A4] text-2xl font-japanese font-black'
            }`}>
              {practiceRecommendation.characterToHighlight?.char || (practiceRecommendation.type === 'due_reviews' ? '⏰' : '🧠')}
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                practiceRecommendation.type === 'rusty_alert' ? 'text-[#FF5C7A]' : practiceRecommendation.type === 'due_reviews' ? 'text-[#FFD166]' : 'text-[#42E6A4]'
              }`}>
                {practiceRecommendation.type === 'rusty_alert' ? 'Cognitive Memory Alert' : practiceRecommendation.type === 'due_reviews' ? 'Spaced Repetition Due' : 'Discrimination Drill'}
              </span>
              <h3 className="text-xs font-black text-[#F5F7FA] truncate mt-0.5">
                {practiceRecommendation.headline}
              </h3>
              <p className="text-[11px] text-[#8B949E] mt-0.5 line-clamp-1">
                {practiceRecommendation.subtext}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartAdaptiveSession?.({ forcedChar: practiceRecommendation.characterToHighlight })}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-black tracking-wide cursor-pointer uppercase shrink-0 shadow-lg ${
              practiceRecommendation.type === 'rusty_alert'
                ? 'btn-game-primary shadow-[#FF5C7A]/25'
                : practiceRecommendation.type === 'due_reviews'
                ? 'btn-game-gold shadow-[#FFD166]/25'
                : 'bg-[#42E6A4] text-[#080A0D]'
            }`}
          >
            {practiceRecommendation.ctaText}
          </button>
        </div>
      )}

      {/* 2. CURRENT QUEST HERO ARENA */}
      <div className="relative p-5 rounded-3xl bg-gradient-to-b from-[#171C22] to-[#11151A] border-2 border-[#282F38] shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF5C7A]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="hanko-seal text-[10px]">
                DAY {currentDay} OF 7
              </span>
              <span className="text-xs font-bold text-[#FFD166]">
                {dayInfo.icon} {dayInfo.title}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#F5F7FA] tracking-tight">
              Master {dayInfo.chars.length} Characters
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              {dayInfo.subtitle}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
              Row Mastery
            </span>
            <span className="text-sm font-black text-[#42E6A4] tabular-nums">
              {dayMasteredCount} / {dayInfo.chars.length}
            </span>
          </div>
        </div>

        {/* Character Preview Pills */}
        <div className="flex items-center gap-2 my-4 overflow-x-auto py-1 scrollbar-none">
          {dayChars.map((item) => {
            const mastery = progress.characters[item.char];
            const isMastered = (mastery?.masteryScore || 0) >= 4;

            return (
              <div
                key={item.char}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
                  isMastered
                    ? 'bg-[#42E6A4]/10 border-[#42E6A4]/40 text-[#42E6A4]'
                    : 'bg-[#080A0D]/70 border-[#282F38] text-[#F5F7FA]'
                }`}
              >
                <span className="font-japanese text-lg font-bold">
                  {item.char}
                </span>
                <span className="text-[11px] font-mono text-[#FFD166] uppercase font-bold">
                  {item.romaji}
                </span>
                <span className="text-xs">{item.word.conceptIcon}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[11px] font-semibold text-[#8B949E]">
            <span>Today's Progress</span>
            <span className="text-[#FFD166] font-mono">
              {currentQuest.bossBeaten
                ? 'Boss Defeated (100%)'
                : currentQuest.miniGamesCount >= 2
                ? 'Boss Ready (66%)'
                : currentQuest.newCharsLearned
                ? 'Games Ready (33%)'
                : 'Not Started (0%)'}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[#080A0D] overflow-hidden p-0.5 border border-[#282F38]">
            <div
              className="h-full bg-gradient-to-r from-[#FF5C7A] to-[#FFD166] rounded-full transition-all duration-300"
              style={{
                width: currentQuest.bossBeaten
                  ? '100%'
                  : currentQuest.miniGamesCount >= 2
                  ? '66%'
                  : currentQuest.newCharsLearned
                  ? '33%'
                  : '5%'
              }}
            />
          </div>
        </div>

        {/* PRIMARY CTA */}
        <button
          type="button"
          onClick={handleStartToday}
          className="btn-game-primary w-full py-4 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-[#FF5C7A]/25 cursor-pointer uppercase"
        >
          <Play size={18} fill="#080A0D" />
          <span>
            {isDayFinished
              ? `TRAIN DAY ${currentDay} AGAIN`
              : isStarted
              ? 'CONTINUE QUEST'
              : 'START QUEST'}
          </span>
        </button>

        {/* Weak spots shortcut if any */}
        {weakCount > 0 && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                sfx.click(progress.settings.soundEffects);
                onNavigate('review-weak');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD166] hover:text-white transition-colors cursor-pointer"
            >
              <Brain size={14} />
              <span>Strengthen {weakCount} Weak Spots</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* 3. TODAY'S QUEST CHECKLIST */}
      <div className="p-4 rounded-3xl bg-[#11151A] border border-[#282F38]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FFD166]" />
            <h3 className="text-xs font-black tracking-wider text-[#F5F7FA] uppercase">
              Today's 3 Steps
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#8B949E]">
            ~10 minutes
          </span>
        </div>

        <div className="space-y-2">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => onStartQuest(currentDay)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#080A0D]/50 hover:bg-[#171C22] border border-[#282F38] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              {currentQuest.newCharsLearned ? (
                <CheckCircle2 size={18} className="text-[#42E6A4] shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[#8B949E] shrink-0" />
              )}
              <div>
                <span className={`text-xs font-bold block ${currentQuest.newCharsLearned ? 'text-[#8B949E] line-through' : 'text-[#F5F7FA]'}`}>
                  1. Learn {dayInfo.chars.length} Memory Cards
                </span>
                <span className="text-[11px] text-[#8B949E]">
                  Visual shape tricks & beginner words
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#FFD166]">
              {currentQuest.newCharsLearned ? 'Clear' : 'Start'}
            </span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => onNavigate('mini-game-mc')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#080A0D]/50 hover:bg-[#171C22] border border-[#282F38] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              {currentQuest.miniGamesCount >= 2 ? (
                <CheckCircle2 size={18} className="text-[#42E6A4] shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[#8B949E] shrink-0" />
              )}
              <div>
                <span className={`text-xs font-bold block ${currentQuest.miniGamesCount >= 2 ? 'text-[#8B949E] line-through' : 'text-[#F5F7FA]'}`}>
                  2. Complete 2 Mini-Games
                </span>
                <span className="text-[11px] text-[#8B949E]">
                  Multiple choice, audio, speed & matching
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#8B949E] tabular-nums">
              {currentQuest.miniGamesCount} / 2
            </span>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => onNavigate('boss')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#080A0D]/50 hover:bg-[#171C22] border border-[#282F38] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              {currentQuest.bossBeaten ? (
                <CheckCircle2 size={18} className="text-[#42E6A4] shrink-0" />
              ) : (
                <span className="text-base shrink-0">👹</span>
              )}
              <div>
                <span className={`text-xs font-bold block ${currentQuest.bossBeaten ? 'text-[#8B949E] line-through' : 'text-[#F5F7FA]'}`}>
                  3. Defeat Day {currentDay} Boss
                </span>
                <span className="text-[11px] text-[#8B949E]">
                  10-question mixed battle gauntlet
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#FF5C7A]">
              {currentQuest.bossBeaten ? 'Defeated' : '+50 XP'}
            </span>
          </button>
        </div>
      </div>

      {/* 4. THE 7-DAY JOURNEY MAP */}
      <div className="p-5 rounded-3xl bg-[#11151A] border border-[#282F38]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-[#F5F7FA] uppercase tracking-wide">
              The 7-Day Journey Path
            </h3>
            <span className="text-xs text-[#8B949E]">
              {progress.completedDays.length} of 7 Day Portals Cleared
            </span>
          </div>
          <span className="hanko-seal text-[10px]">
            MAP
          </span>
        </div>

        {/* Winding Adventure Nodes */}
        <div className="relative flex flex-col gap-4 py-2">
          {/* Subtle background dotted trail */}
          <div className="absolute top-6 bottom-6 left-6 w-0.5 bg-gradient-to-b from-[#FF5C7A] via-[#FFD166] to-[#282F38] pointer-events-none" />

          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const info = DAY_INFO[d];
            const isDone = progress.completedDays.includes(d);
            const isCurrent = d === currentDay;
            const isUnlocked = d <= progress.unlockedDay;

            return (
              <div key={d} className="relative z-10 flex items-center gap-3.5">
                {/* Node Orb */}
                <button
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      sfx.click(progress.settings.soundEffects);
                      onStartQuest(d);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-all cursor-pointer shadow-lg ${
                    isDone
                      ? 'bg-[#42E6A4] text-[#080A0D] ring-4 ring-[#42E6A4]/20'
                      : isCurrent
                      ? 'bg-[#FF5C7A] text-[#080A0D] ring-4 ring-[#FF5C7A]/30 animate-pulse-glow'
                      : isUnlocked
                      ? 'bg-[#1D232B] text-[#F5F7FA] border-2 border-[#282F38] hover:border-[#FF5C7A]'
                      : 'bg-[#080A0D] text-[#8B949E] border border-[#282F38]/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isDone ? (
                    '✓'
                  ) : !isUnlocked ? (
                    <Lock size={16} />
                  ) : (
                    <span>{d}</span>
                  )}
                </button>

                {/* Node Details Card */}
                <button
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      sfx.click(progress.settings.soundEffects);
                      onStartQuest(d);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`flex-1 p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#171C22] border-[#FF5C7A] shadow-md'
                      : isDone
                      ? 'bg-[#080A0D]/50 border-[#282F38] hover:border-[#42E6A4]/50'
                      : isUnlocked
                      ? 'bg-[#080A0D]/50 border-[#282F38] hover:border-[#384250]'
                      : 'bg-[#080A0D]/20 border-transparent opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-[#F5F7FA]">
                        Day {d}
                      </span>
                      <span className="text-[#8B949E]">·</span>
                      <span className="text-xs text-[#FFD166] font-semibold">
                        {info.title}
                      </span>
                    </div>
                    <div className="text-sm font-japanese font-bold text-[#F5F7FA] mt-0.5">
                      {info.chars.join(' ')}
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <span className="text-[11px] font-bold text-[#42E6A4] flex items-center gap-1">
                        <CheckCircle2 size={14} /> Cleared
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-xs font-bold text-[#FF5C7A]">
                        Play →
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8B949E]">Locked</span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          {/* 5. GRAND SHRINE: THE FINAL TRIAL */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                sfx.click(progress.settings.soundEffects);
                onNavigate('final-challenge');
              }}
              disabled={progress.completedDays.length < 7}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                progress.completedDays.length >= 7
                  ? 'bg-gradient-to-r from-[#FFD166]/15 to-[#FF5C7A]/15 border-[#FFD166] hover:border-[#ffdb80] cursor-pointer shadow-xl'
                  : 'bg-[#080A0D]/30 border-[#282F38] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#080A0D] border border-[#282F38] flex items-center justify-center text-2xl shrink-0">
                  🏯
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#F5F7FA] uppercase tracking-wide">
                      The Final Trial
                    </span>
                    <span className="hanko-seal text-[9px]">46 KANA</span>
                  </div>
                  <span className="text-[11px] text-[#8B949E] block mt-0.5">
                    {progress.completedDays.length >= 7
                      ? 'Unlocked! Prove full Hiragana mastery'
                      : 'Clear all 7 Days to unlock the ultimate challenge'}
                  </span>
                </div>
              </div>

              {progress.finalChallengeCompleted ? (
                <Trophy size={20} className="text-[#FFD166]" />
              ) : progress.completedDays.length >= 7 ? (
                <span className="text-xs font-black text-[#FFD166] uppercase">
                  ENTER →
                </span>
              ) : (
                <Lock size={16} className="text-[#8B949E]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

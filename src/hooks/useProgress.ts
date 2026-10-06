import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProgress, CognitiveQuestionType, HiraganaCharacter } from '../types';
import { HIRAGANA_DATA } from '../data/hiragana';
import { loadProgress, saveProgress, updateStreak, resetAllProgress } from '../utils/storage';
import { recordAnswerResult, recordMemoryResult, getWeakCharacters, initCharacterMastery } from '../utils/mastery';
import {
  updateCharacterMemory,
  calculateForgettingRisk,
  generateAdaptiveSession as engineGenerateSession,
  getWhatToPracticeRecommendation,
  AnswerOutcomeResult,
  PracticeRecommendation,
  AdaptiveSessionPlan
} from '../engine';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [floatingXp, setFloatingXp] = useState<{ id: number; amount: number; key: number } | null>(null);

  // Sync to localStorage on state changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Add XP with animation trigger and streak verification
  const addXp = useCallback((amount: number) => {
    setProgress((prev) => {
      const { newStreak, newDate } = updateStreak(prev.streak, prev.lastActiveDate);
      const newXp = prev.totalXp + amount;
      return {
        ...prev,
        totalXp: newXp,
        streak: newStreak,
        lastActiveDate: newDate,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });

    setFloatingXp({
      id: Date.now(),
      amount,
      key: Math.random()
    });
  }, []);

  // Primary Cognitive Memory record method with multi-dimensional tracking
  const recordCognitiveAnswer = useCallback((
    char: string,
    isCorrect: boolean,
    responseTimeMs = 2000,
    questionType: CognitiveQuestionType = 'characterToRomaji',
    selectedOption?: string
  ): AnswerOutcomeResult => {
    let outcome!: AnswerOutcomeResult;

    setProgress((prev) => {
      const romaji = HIRAGANA_DATA.find(c => c.char === char)?.romaji || '';
      outcome = updateCharacterMemory(prev.characters[char], char, romaji, {
        isCorrect,
        responseTimeMs,
        questionType,
        selectedOption
      });

      const durableCount = outcome.isDurableRecall
        ? (prev.durableRecallCount || 0) + 1
        : (prev.durableRecallCount || 0);

      const totalRetrievals = (prev.totalRetrievals || 0) + 1;

      return {
        ...prev,
        characters: {
          ...prev.characters,
          [char]: outcome.updatedMemory
        },
        durableRecallCount: durableCount,
        totalRetrievals
      };
    });

    // Reward durable delayed recall: "STILL GOT IT / MEMORY COMEBACK" (+25 XP)
    if (outcome && outcome.isDurableRecall) {
      addXp(25);
    }

    return outcome;
  }, [addXp]);

  // Backward compatibility legacy answer record
  const recordAnswer = useCallback((
    char: string,
    isCorrect: boolean,
    responseTimeMs?: number,
    selectedOption?: string
  ) => {
    recordCognitiveAnswer(char, isCorrect, responseTimeMs || (isCorrect ? 1800 : 3200), 'characterToRomaji', selectedOption);
  }, [recordCognitiveAnswer]);

  // Backward compatibility memory answer record
  const recordMemoryAnswer = useCallback((
    char: string,
    isCorrect: boolean,
    responseTimeMs?: number,
    selectedOption?: string
  ) => {
    recordCognitiveAnswer(char, isCorrect, responseTimeMs || (isCorrect ? 1900 : 3400), 'wordToCharacter', selectedOption);
  }, [recordCognitiveAnswer]);

  // Mark today's new characters as introduced
  const markNewCharsLearned = useCallback((day: number) => {
    setProgress((prev) => {
      const currentQuest = prev.dayQuests[day] || { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false };
      return {
        ...prev,
        dayQuests: {
          ...prev.dayQuests,
          [day]: {
            ...currentQuest,
            newCharsLearned: true
          }
        }
      };
    });
  }, []);

  // Track mini-game completion count
  const incrementMiniGames = useCallback((day: number) => {
    setProgress((prev) => {
      const currentQuest = prev.dayQuests[day] || { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false };
      return {
        ...prev,
        dayQuests: {
          ...prev.dayQuests,
          [day]: {
            ...currentQuest,
            miniGamesCount: Math.min(2, currentQuest.miniGamesCount + 1)
          }
        }
      };
    });
  }, []);

  // Mark boss beaten and unlock next day if applicable
  const recordBossBeaten = useCallback((day: number, score: number, maxScore: number) => {
    setProgress((prev) => {
      const completedDays = prev.completedDays.includes(day)
        ? prev.completedDays
        : [...prev.completedDays, day];
      
      const nextUnlocked = day < 7 ? Math.max(prev.unlockedDay, day + 1) : prev.unlockedDay;
      const todayDate = new Date().toISOString().split('T')[0];

      return {
        ...prev,
        unlockedDay: nextUnlocked,
        completedDays,
        dayQuests: {
          ...prev.dayQuests,
          [day]: {
            ...(prev.dayQuests[day] || { newCharsLearned: true, miniGamesCount: 2 }),
            bossBeaten: true
          }
        },
        bossScores: {
          ...prev.bossScores,
          [day]: { score, maxScore, date: todayDate }
        }
      };
    });
  }, []);

  const recordFinalChallengeComplete = useCallback((_score: number) => {
    setProgress((prev) => ({
      ...prev,
      finalChallengeCompleted: true
    }));
  }, []);

  const setCurrentDay = useCallback((day: number) => {
    setProgress((prev) => ({
      ...prev,
      currentDay: Math.min(7, Math.max(1, day))
    }));
  }, []);

  const toggleSoundEffects = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEffects: !prev.settings.soundEffects
      }
    }));
  }, []);

  const toggleSpeechAudio = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        speechAudio: !prev.settings.speechAudio
      }
    }));
  }, []);

  const handleReset = useCallback(() => {
    const fresh = resetAllProgress();
    setProgress(fresh);
  }, []);

  // Computed data
  const unlockedCharacters = useMemo(() => {
    return HIRAGANA_DATA.filter(item => item.day <= progress.unlockedDay);
  }, [progress.unlockedDay]);

  const currentDayCharacters = useMemo(() => {
    return HIRAGANA_DATA.filter(item => item.day === progress.currentDay);
  }, [progress.currentDay]);

  const masteredCount = useMemo(() => {
    return Object.values(progress.characters).filter(m => m.status === 'mastered' || (m.masteryScore || 0) >= 4).length;
  }, [progress.characters]);

  const weakCharacters = useMemo(() => {
    return getWeakCharacters(HIRAGANA_DATA, progress.characters);
  }, [progress.characters]);

  const dueCharacters = useMemo(() => {
    const now = Date.now();
    return unlockedCharacters.filter(c => {
      const m = progress.characters[c.char];
      if (!m || m.repetitionCount === 0) return false;
      const risk = calculateForgettingRisk(m, now);
      return now >= m.nextReviewAt || risk >= 55;
    });
  }, [unlockedCharacters, progress.characters]);

  // Intelligent "What to practice right now" recommendation
  const practiceRecommendation = useMemo<PracticeRecommendation>(() => {
    return getWhatToPracticeRecommendation(unlockedCharacters, progress.characters);
  }, [unlockedCharacters, progress.characters]);

  // Generates an adaptive session using the cognitive scheduler
  const generateSession = useCallback((options?: { totalQuestions?: number; forcedChar?: HiraganaCharacter }): AdaptiveSessionPlan => {
    return engineGenerateSession(unlockedCharacters, progress.characters, options);
  }, [unlockedCharacters, progress.characters]);

  const getCharacterMastery = useCallback((char: string) => {
    return progress.characters[char] || initCharacterMastery(char);
  }, [progress.characters]);

  return {
    progress,
    floatingXp,
    setFloatingXp,
    addXp,
    recordAnswer,
    recordMemoryAnswer,
    recordCognitiveAnswer,
    markNewCharsLearned,
    incrementMiniGames,
    recordBossBeaten,
    recordFinalChallengeComplete,
    setCurrentDay,
    toggleSoundEffects,
    toggleSpeechAudio,
    handleReset,
    unlockedCharacters,
    currentDayCharacters,
    masteredCount,
    weakCharacters,
    dueCharacters,
    practiceRecommendation,
    generateSession,
    getCharacterMastery
  };
}

import { UserProgress, CharacterMemory } from '../types';
import { HIRAGANA_DATA } from '../data/hiragana';
import { initCharacterMemory, calculateForgettingRisk } from '../engine';

const STORAGE_KEY = 'hiragana_quest_progress_v2';
export const CURRENT_MEMORY_SCHEMA_VERSION = 2;

export const DEFAULT_PROGRESS: UserProgress = {
  currentDay: 1,
  unlockedDay: 1,
  streak: 0,
  lastActiveDate: '',
  totalXp: 0,
  completedDays: [],
  characters: {},
  dayQuests: {
    1: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false },
    2: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false },
    3: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false },
    4: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false },
    5: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false },
    6: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false },
    7: { newCharsLearned: false, miniGamesCount: 0, bossBeaten: false }
  },
  bossScores: {},
  finalChallengeCompleted: false,
  bestStreak: 0,
  settings: {
    soundEffects: true,
    speechAudio: true
  },
  memorySchemaVersion: CURRENT_MEMORY_SCHEMA_VERSION,
  totalRetrievals: 0,
  durableRecallCount: 0
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Migrates and normalizes existing character records into full CharacterMemory objects.
 * Guarantees zero loss of learner history, XP, streak, or accuracy.
 */
function migrateCharacters(rawCharacters: Record<string, any>): Record<string, CharacterMemory> {
  const migrated: Record<string, CharacterMemory> = {};
  const romajiMap = new Map<string, string>();
  for (const item of HIRAGANA_DATA) {
    romajiMap.set(item.char, item.romaji);
  }

  const now = Date.now();

  for (const [char, oldData] of Object.entries(rawCharacters || {})) {
    const romaji = romajiMap.get(char) || oldData.romaji || '';
    const base = initCharacterMemory(char, romaji);

    // Merge existing accuracy counts
    base.correctCount = oldData.correctCount || 0;
    base.wrongCount = oldData.wrongCount || 0;
    base.repetitionCount = oldData.repetitionCount || (base.correctCount + base.wrongCount);
    base.lastSeenAt = oldData.lastSeenAt || oldData.lastSeen || (base.repetitionCount > 0 ? now : 0);
    base.lastSeen = base.lastSeenAt;
    base.lastCorrectAt = oldData.lastCorrectAt || (base.correctCount > 0 ? base.lastSeenAt : 0);
    base.lastWrongAt = oldData.lastWrongAt || (base.wrongCount > 0 ? base.lastSeenAt : 0);
    base.averageResponseTime = oldData.averageResponseTime || 2200;

    // Multi-dimensional retrieval strengths: calculate or preserve
    const legacyMasteryPct = Math.min(100, (oldData.masteryScore || 0) * 20);
    const legacyMemoryPct = Math.min(100, (oldData.memoryStrength || 0) * 20);

    base.recognitionStrength = oldData.recognitionStrength !== undefined ? oldData.recognitionStrength : legacyMasteryPct;
    base.soundStrength = oldData.soundStrength !== undefined ? oldData.soundStrength : Math.round(legacyMasteryPct * 0.85);
    base.recallStrength = oldData.recallStrength !== undefined ? oldData.recallStrength : Math.round(legacyMasteryPct * 0.8);
    base.wordAssociationStrength = oldData.wordAssociationStrength !== undefined ? oldData.wordAssociationStrength : legacyMemoryPct;
    base.visualMemoryStrength = oldData.visualMemoryStrength !== undefined ? oldData.visualMemoryStrength : legacyMemoryPct;

    base.overallMemoryStrength = oldData.overallMemoryStrength !== undefined
      ? oldData.overallMemoryStrength
      : Math.round(0.35 * Math.min(base.recognitionStrength, base.soundStrength, base.recallStrength) + 0.65 * base.recognitionStrength);

    base.automaticityScore = oldData.automaticityScore || (base.correctCount >= 3 ? 50 : 0);
    base.interval = oldData.interval || (base.correctCount >= 3 ? 24 : 0.16);
    base.ease = oldData.ease || 2.5;
    base.nextReviewAt = oldData.nextReviewAt || (base.lastSeenAt ? base.lastSeenAt + base.interval * 3600 * 1000 : now);
    base.confusionPairs = oldData.confusionPairs || {};
    base.confusionRisk = oldData.confusionRisk || 0;
    base.questionTypePerformance = oldData.questionTypePerformance || { ...base.questionTypePerformance };

    base.forgettingRisk = calculateForgettingRisk(base, now);

    // Status evaluation
    if (oldData.status) {
      base.status = oldData.status;
    } else if (base.overallMemoryStrength >= 80 && base.correctCount >= 5) {
      base.status = 'mastered';
    } else if (base.overallMemoryStrength >= 65) {
      base.status = 'strong';
    } else if (base.overallMemoryStrength >= 40) {
      base.status = 'familiar';
    } else if (base.repetitionCount > 0) {
      base.status = 'learning';
    } else {
      base.status = 'new';
    }

    // Legacy sync
    const total = base.correctCount + base.wrongCount;
    base.accuracy = total > 0 ? Math.round((base.correctCount / total) * 100) : 100;
    base.masteryScore = Math.min(5, Math.floor(base.overallMemoryStrength / 20));
    base.memoryStrength = Math.min(5, Math.floor(base.visualMemoryStrength / 20));

    migrated[char] = base;
  }

  return migrated;
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;

    const migratedCharacters = migrateCharacters(parsed.characters || {});

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      characters: migratedCharacters,
      dayQuests: {
        ...DEFAULT_PROGRESS.dayQuests,
        ...(parsed.dayQuests || {})
      },
      bossScores: parsed.bossScores || {},
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...(parsed.settings || {})
      },
      memorySchemaVersion: CURRENT_MEMORY_SCHEMA_VERSION,
      totalRetrievals: parsed.totalRetrievals || 0,
      durableRecallCount: parsed.durableRecallCount || 0
    };
  } catch (err) {
    console.error('Failed to load progress from localStorage, using default', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function updateStreak(currentStreak: number, lastDate: string): { newStreak: number; newDate: string } {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (lastDate === today) {
    return { newStreak: Math.max(1, currentStreak), newDate: today };
  } else if (lastDate === yesterday) {
    return { newStreak: currentStreak + 1, newDate: today };
  } else {
    return { newStreak: 1, newDate: today };
  }
}

export function resetAllProgress(): UserProgress {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return DEFAULT_PROGRESS;
}

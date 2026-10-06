import { HiraganaCharacter, CharacterMemory, CognitiveQuestionType } from '../types';
import { calculateForgettingRisk } from './scheduler';
import { generateCognitiveQuestion, CognitiveQuestion } from './questionGenerator';
import { getTopConfusionPair } from './confusionPairs';

export interface AdaptiveSessionPlan {
  title: string;
  subtitle: string;
  questions: CognitiveQuestion[];
  targetCharacters: HiraganaCharacter[];
  dueCount: number;
  weakCount: number;
  confusionCount: number;
}

export interface PracticeRecommendation {
  type: 'rusty_alert' | 'due_reviews' | 'confusion_focus' | 'ready_for_quest' | 'all_mastered';
  headline: string;
  subtext: string;
  ctaText: string;
  characterToHighlight?: HiraganaCharacter;
  dueCount: number;
}

/**
 * Generates an adaptive session balanced across:
 * - Due reviews (spaced repetition schedule)
 * - Weak pathway characters (sound weak, recall weak, etc.)
 * - Active confusion discrimination
 * - New characters if any
 * - Mastered reinforcement
 */
export function generateAdaptiveSession(
  unlockedChars: HiraganaCharacter[],
  memoryMap: Record<string, CharacterMemory>,
  options: {
    totalQuestions?: number;
    forcedChar?: HiraganaCharacter;
    now?: number;
  } = {}
): AdaptiveSessionPlan {
  const now = options.now || Date.now();
  const targetCount = options.totalQuestions || 8;

  // 1. Categorize unlocked characters into memory bands
  const dueChars: HiraganaCharacter[] = [];
  const weakChars: HiraganaCharacter[] = [];
  const confusionChars: HiraganaCharacter[] = [];
  const strongChars: HiraganaCharacter[] = [];

  for (const item of unlockedChars) {
    const mem = memoryMap[item.char];
    if (!mem || mem.repetitionCount === 0) {
      dueChars.push(item);
      continue;
    }

    const risk = calculateForgettingRisk(mem, now);
    const topConfusion = getTopConfusionPair(mem);

    if (now >= mem.nextReviewAt || risk >= 55) {
      dueChars.push(item);
    }

    if (mem.overallMemoryStrength < 65 || mem.soundStrength < 50 || mem.recallStrength < 50) {
      weakChars.push(item);
    }

    if (topConfusion && mem.confusionRisk > 30) {
      confusionChars.push(item);
    }

    if (mem.status === 'strong' || mem.status === 'mastered') {
      strongChars.push(item);
    }
  }

  // 2. Build the question sequence with smart interleaving
  const selectedChars: HiraganaCharacter[] = [];

  if (options.forcedChar) {
    selectedChars.push(options.forcedChar);
  }

  // Prioritize due reviews
  const shuffledDue = [...dueChars].sort(() => Math.random() - 0.5);
  for (const c of shuffledDue) {
    if (selectedChars.length >= targetCount) break;
    if (!selectedChars.some(s => s.char === c.char)) {
      selectedChars.push(c);
    }
  }

  // Next, prioritize confusion characters
  const shuffledConfusion = [...confusionChars].sort(() => Math.random() - 0.5);
  for (const c of shuffledConfusion) {
    if (selectedChars.length >= targetCount) break;
    if (!selectedChars.some(s => s.char === c.char)) {
      selectedChars.push(c);
    }
  }

  // Next, weak characters
  const shuffledWeak = [...weakChars].sort(() => Math.random() - 0.5);
  for (const c of shuffledWeak) {
    if (selectedChars.length >= targetCount) break;
    if (!selectedChars.some(s => s.char === c.char)) {
      selectedChars.push(c);
    }
  }

  // If still below target, fill with unlocked characters
  const shuffledAll = [...unlockedChars].sort(() => Math.random() - 0.5);
  for (const c of shuffledAll) {
    if (selectedChars.length >= targetCount) break;
    if (!selectedChars.some(s => s.char === c.char)) {
      selectedChars.push(c);
    }
  }

  // Fallback: repeat characters if pool is small
  while (selectedChars.length < targetCount && unlockedChars.length > 0) {
    const randomPick = unlockedChars[Math.floor(Math.random() * unlockedChars.length)];
    selectedChars.push(randomPick);
  }

  // Smart interleaving: shuffle order so same character doesn't appear back-to-back
  const interleaved: HiraganaCharacter[] = [];
  const remainingList = [...selectedChars];

  while (remainingList.length > 0) {
    const last = interleaved[interleaved.length - 1];
    let nextIndex = remainingList.findIndex(c => !last || c.char !== last.char);
    if (nextIndex === -1) nextIndex = 0;
    interleaved.push(remainingList.splice(nextIndex, 1)[0]);
  }

  // 3. Generate questions with retrieval diversity
  const questions: CognitiveQuestion[] = [];
  const recentTypes: CognitiveQuestionType[] = [];

  for (const charItem of interleaved) {
    const mem = memoryMap[charItem.char];
    const q = generateCognitiveQuestion(charItem, unlockedChars, mem, undefined, recentTypes);
    questions.push(q);
    recentTypes.push(q.type);
    if (recentTypes.length > 3) recentTypes.shift();
  }

  return {
    title: 'Adaptive Memory Session',
    subtitle: `${dueChars.length} due · ${weakChars.length} weak · ${confusionChars.length} confusion checks`,
    questions,
    targetCharacters: Array.from(new Set(selectedChars)),
    dueCount: dueChars.length,
    weakCount: weakChars.length,
    confusionCount: confusionChars.length
  };
}

/**
 * Calculates "WHAT SHOULD I PRACTICE RIGHT NOW?" for returning users.
 * Gives immediate human-friendly clarity on the next optimal micro-action.
 */
export function getWhatToPracticeRecommendation(
  unlockedChars: HiraganaCharacter[],
  memoryMap: Record<string, CharacterMemory>,
  now = Date.now()
): PracticeRecommendation {
  if (unlockedChars.length === 0) {
    return {
      type: 'ready_for_quest',
      headline: 'Begin Your Adventure',
      subtext: 'Start Day 1 to unlock your first set of Hiragana characters.',
      ctaText: 'START DAY 1',
      dueCount: 0
    };
  }

  // Check for the character with highest forgetting risk
  let highestRisk = 0;
  let rustiestChar: HiraganaCharacter | null = null;
  let dueCount = 0;

  for (const c of unlockedChars) {
    const m = memoryMap[c.char];
    if (m && m.repetitionCount > 0) {
      const risk = calculateForgettingRisk(m, now);
      if (now >= m.nextReviewAt || risk >= 55) {
        dueCount += 1;
      }
      if (risk > highestRisk) {
        highestRisk = risk;
        rustiestChar = c;
      }
    }
  }

  // If a character has high forgetting risk (>= 60%), generate a targeted alert
  if (rustiestChar && highestRisk >= 60) {
    return {
      type: 'rusty_alert',
      headline: `Your memory is getting rusty on ${rustiestChar.char}`,
      subtext: `Spaced review is due for "${rustiestChar.char}" (${rustiestChar.romaji.toUpperCase()}). 30 seconds will lock it back in.`,
      ctaText: `REFRESH ${rustiestChar.char}`,
      characterToHighlight: rustiestChar,
      dueCount
    };
  }

  // If several characters are due for spaced review
  if (dueCount > 0) {
    return {
      type: 'due_reviews',
      headline: `${dueCount} character${dueCount > 1 ? 's' : ''} ready for review`,
      subtext: 'Spaced repetition schedule: a quick session will cement these into long-term memory.',
      ctaText: 'START MEMORY CHECK',
      dueCount
    };
  }

  // Check if any character has a high confusion risk
  for (const c of unlockedChars) {
    const m = memoryMap[c.char];
    if (m) {
      const topConfusion = getTopConfusionPair(m);
      if (topConfusion && m.confusionRisk >= 40) {
        return {
          type: 'confusion_focus',
          headline: `${c.char} and ${topConfusion.confusingChar} are trying to trick you`,
          subtext: `You have confused these two ${topConfusion.mistakeCount} time${topConfusion.mistakeCount > 1 ? 's' : ''}. Sharpen the visual difference!`,
          ctaText: `TRAIN ${c.char} vs ${topConfusion.confusingChar}`,
          characterToHighlight: c,
          dueCount: 0
        };
      }
    }
  }

  // All clear and fresh
  return {
    type: 'ready_for_quest',
    headline: 'Memory connections are strong',
    subtext: 'All reviewed characters are fresh in your mind. Ready for your daily quest!',
    ctaText: 'CONTINUE QUEST',
    dueCount: 0
  };
}

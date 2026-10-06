import { CharacterMemory, HiraganaCharacter } from '../types';
import { HIRAGANA_DATA } from '../data/hiragana';
import {
  initCharacterMemory,
  updateCharacterMemory,
  calculateForgettingRisk,
  getTopConfusionPair,
  AnswerOutcomeParams
} from '../engine';

/**
 * Initializes mastery and memory state for a character
 */
export function initCharacterMastery(char: string, romaji?: string): CharacterMemory {
  const r = romaji || HIRAGANA_DATA.find(c => c.char === char)?.romaji || '';
  return initCharacterMemory(char, r);
}

/**
 * Updates memory profile after a standard game answer (e.g. multiple choice or recognition)
 */
export function recordAnswerResult(
  current: CharacterMemory | undefined,
  char: string,
  isCorrect: boolean,
  options?: {
    responseTimeMs?: number;
    selectedOption?: string;
    questionType?: any;
  }
): CharacterMemory {
  const romaji = HIRAGANA_DATA.find(c => c.char === char)?.romaji || '';
  const params: AnswerOutcomeParams = {
    isCorrect,
    responseTimeMs: options?.responseTimeMs || (isCorrect ? 1800 : 3200),
    questionType: options?.questionType || 'characterToRomaji',
    selectedOption: options?.selectedOption
  };

  const outcome = updateCharacterMemory(current, char, romaji, params);
  return outcome.updatedMemory;
}

/**
 * Updates memory profile after a vocabulary / mnemonic memory test question
 */
export function recordMemoryResult(
  current: CharacterMemory | undefined,
  char: string,
  isCorrect: boolean,
  options?: {
    responseTimeMs?: number;
    selectedOption?: string;
  }
): CharacterMemory {
  const romaji = HIRAGANA_DATA.find(c => c.char === char)?.romaji || '';
  const params: AnswerOutcomeParams = {
    isCorrect,
    responseTimeMs: options?.responseTimeMs || (isCorrect ? 1900 : 3400),
    questionType: 'wordToCharacter',
    selectedOption: options?.selectedOption
  };

  const outcome = updateCharacterMemory(current, char, romaji, params);
  return outcome.updatedMemory;
}

export interface WeakItem {
  character: HiraganaCharacter;
  mastery: CharacterMemory;
  isRecognitionWeak: boolean;
  isSoundWeak: boolean;
  isRecallWeak: boolean;
  isMemoryWeak: boolean;
  isConfusionWeak: boolean;
  isForgettingRiskHigh: boolean;
  primaryWeakness: string;
}

/**
 * Identify weak characters considering multi-dimensional retrieval strengths:
 * - Recognition weakness (characterToRomaji)
 * - Sound weakness (audio recognition)
 * - Recall weakness (reverse recall)
 * - Visual/vocabulary memory weakness
 * - Confusion risk (frequent mixup with another kana)
 * - Forgetting risk (time decay overdue)
 */
export function getWeakCharacters(
  allChars: HiraganaCharacter[],
  masteryMap: Record<string, CharacterMemory>,
  now = Date.now()
): WeakItem[] {
  const weakList: WeakItem[] = [];

  for (const item of allChars) {
    const m = masteryMap[item.char];
    if (m && (m.repetitionCount > 0 || (m.memoryCorrectCount || 0) > 0 || (m.memoryWrongCount || 0) > 0)) {
      const risk = calculateForgettingRisk(m, now);
      const isRecognitionWeak = (m.recognitionStrength || 0) < 65 || (m.accuracy < 75 && m.wrongCount > 0);
      const isSoundWeak = (m.soundStrength || 0) < 55 && m.repetitionCount >= 2;
      const isRecallWeak = (m.recallStrength || 0) < 55 && m.repetitionCount >= 2;
      const isMemoryWeak = (m.overallMemoryStrength || 0) < 60 || (m.visualMemoryStrength || 0) < 55;
      const isConfusionWeak = (m.confusionRisk || 0) > 30;
      const isForgettingRiskHigh = risk >= 55;

      const isWeak =
        isRecognitionWeak ||
        isSoundWeak ||
        isRecallWeak ||
        isMemoryWeak ||
        isConfusionWeak ||
        isForgettingRiskHigh;

      if (isWeak) {
        let primaryWeakness = 'Needs practice';
        const topConfusion = getTopConfusionPair(m);

        if (isForgettingRiskHigh) {
          primaryWeakness = 'Rusty (due for review)';
        } else if (isConfusionWeak && topConfusion) {
          primaryWeakness = `Confused with ${topConfusion.confusingChar}`;
        } else if (isSoundWeak && (m.recognitionStrength || 0) > 65) {
          primaryWeakness = 'Sound recognition weak';
        } else if (isRecallWeak && (m.recognitionStrength || 0) > 65) {
          primaryWeakness = 'Reverse recall weak';
        } else if (isMemoryWeak) {
          primaryWeakness = 'Memory trick needs reinforcement';
        }

        weakList.push({
          character: item,
          mastery: m,
          isRecognitionWeak,
          isSoundWeak,
          isRecallWeak,
          isMemoryWeak,
          isConfusionWeak,
          isForgettingRiskHigh,
          primaryWeakness
        });
      }
    }
  }

  return weakList.sort((a, b) => {
    // Prioritize high forgetting risk, then lowest overall memory strength
    const riskDiff = (b.mastery.forgettingRisk || 0) - (a.mastery.forgettingRisk || 0);
    if (Math.abs(riskDiff) > 15) return riskDiff;

    return (a.mastery.overallMemoryStrength || 0) - (b.mastery.overallMemoryStrength || 0);
  });
}

/**
 * Smart weighted selection considering multi-dimensional cognitive deficits:
 * Prioritizes characters with high forgetting risk, low automaticity, and active confusion.
 */
export function pickSmartCharacter(
  candidates: HiraganaCharacter[],
  masteryMap: Record<string, CharacterMemory>,
  excludeChar?: string
): HiraganaCharacter {
  const filtered = candidates.length > 1 && excludeChar 
    ? candidates.filter(c => c.char !== excludeChar)
    : candidates;

  if (filtered.length === 0) {
    return candidates[0];
  }

  let totalWeight = 0;
  const weights: number[] = [];

  for (const item of filtered) {
    const m = masteryMap[item.char] || initCharacterMemory(item.char, item.romaji);
    
    // Lower memory strength = higher weight
    const memoryDeficit = Math.max(1, (100 - (m.overallMemoryStrength || 0)) / 12);
    
    // High forgetting risk increases weight significantly
    const forgettingBonus = (m.forgettingRisk || 0) / 15;
    
    // Confusion error bonus
    const confusionBonus = (m.confusionRisk || 0) / 20;

    // Recent mistakes add weight
    const wrongBonus = (m.wrongCount * 1.5) + (m.recentCorrectStreak === 0 && m.wrongCount > 0 ? 3 : 0);

    const finalWeight = Math.max(1, memoryDeficit + forgettingBonus + confusionBonus + wrongBonus);
    weights.push(finalWeight);
    totalWeight += finalWeight;
  }

  let random = Math.random() * totalWeight;
  for (let i = 0; i < filtered.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return filtered[i];
    }
  }

  return filtered[filtered.length - 1];
}

/**
 * Generate 3 incorrect distractors from candidate pool for multiple choice
 */
export function getDistractors(
  correctItem: HiraganaCharacter,
  allAvailable: HiraganaCharacter[],
  count = 3
): string[] {
  const others = allAvailable.filter(c => c.char !== correctItem.char);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(c => c.romaji);
}

export type MemoryQuestionType = 
  | 'concept_to_char' // TYPE 1: "☀️ morning — Which Hiragana starts the word?"
  | 'word_to_char'    // TYPE 2: "あさ (asa) — Which character are we learning?"
  | 'sound_to_char'   // TYPE 3: "A — Which Hiragana represents this sound?"
  | 'char_to_word';   // TYPE 4: "あ — Which word did you learn with this character?"

export interface MemoryQuestionOption {
  label: string;
  value: string;
  subLabel?: string;
  isJapanese?: boolean;
}

export interface MemoryQuestion {
  type: MemoryQuestionType;
  character: HiraganaCharacter;
  promptKicker: string;
  promptMain: string;
  promptSub?: string;
  conceptIcon?: string;
  options: MemoryQuestionOption[];
  correctValue: string;
  explanation: string;
}

/**
 * Generates a specific memory test question from the 4 legacy types
 */
export function generateMemoryQuestion(
  targetChar: HiraganaCharacter,
  pool: HiraganaCharacter[],
  specificType?: MemoryQuestionType
): MemoryQuestion {
  const types: MemoryQuestionType[] = [
    'concept_to_char',
    'word_to_char',
    'sound_to_char',
    'char_to_word'
  ];

  const type = specificType || types[Math.floor(Math.random() * types.length)];
  let others = pool.filter(c => c.char !== targetChar.char);
  if (others.length < 3) {
    const fallback = HIRAGANA_DATA.filter(c => c.char !== targetChar.char && !others.some(o => o.char === c.char));
    others = [...others, ...fallback];
  }
  const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  const charCandidates = [targetChar, ...shuffledOthers].sort(() => Math.random() - 0.5);

  switch (type) {
    case 'concept_to_char': {
      return {
        type,
        character: targetChar,
        promptKicker: 'Visual Concept & Word',
        promptMain: `${targetChar.word.conceptIcon} ${targetChar.word.meaning}`,
        promptSub: `Which Hiragana starts the word "${targetChar.word.jp}" (${targetChar.word.romaji})?`,
        conceptIcon: targetChar.word.conceptIcon,
        correctValue: targetChar.char,
        options: charCandidates.map(c => ({
          label: c.char,
          value: c.char,
          subLabel: c.romaji.toUpperCase(),
          isJapanese: true
        })),
        explanation: `${targetChar.char} starts ${targetChar.word.jp} (${targetChar.word.romaji}) = ${targetChar.word.meaning}`
      };
    }

    case 'word_to_char': {
      return {
        type,
        character: targetChar,
        promptKicker: 'Identify Target Character',
        promptMain: targetChar.word.jp,
        promptSub: `Pronounced "${targetChar.word.romaji}" (${targetChar.word.meaning}). Which character are we focusing on?`,
        conceptIcon: targetChar.word.conceptIcon,
        correctValue: targetChar.char,
        options: charCandidates.map(c => ({
          label: c.char,
          value: c.char,
          subLabel: c.romaji.toUpperCase(),
          isJapanese: true
        })),
        explanation: `${targetChar.char} (${targetChar.romaji}) is the hero character in ${targetChar.word.jp}`
      };
    }

    case 'sound_to_char': {
      return {
        type,
        character: targetChar,
        promptKicker: 'Sound to Kana',
        promptMain: targetChar.romaji.toUpperCase(),
        promptSub: 'Which Hiragana represents this sound?',
        correctValue: targetChar.char,
        options: charCandidates.map(c => ({
          label: c.char,
          value: c.char,
          isJapanese: true
        })),
        explanation: `${targetChar.char} makes the sound "${targetChar.romaji}"`
      };
    }

    case 'char_to_word': {
      const wordCandidates = [targetChar, ...shuffledOthers].sort(() => Math.random() - 0.5);
      return {
        type,
        character: targetChar,
        promptKicker: 'Word Association',
        promptMain: targetChar.char,
        promptSub: 'Which vocabulary word did you learn with this character?',
        correctValue: targetChar.word.jp,
        options: wordCandidates.map(c => ({
          label: `${c.word.conceptIcon} ${c.word.jp}`,
          value: c.word.jp,
          subLabel: `${c.word.romaji} · ${c.word.meaning}`
        })),
        explanation: `${targetChar.char} connects to ${targetChar.word.jp} (${targetChar.word.romaji}) = ${targetChar.word.meaning}`
      };
    }
  }
}

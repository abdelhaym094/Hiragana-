import { CharacterMemory } from '../types';

/**
 * Pre-mapped visual and phonetic confusion clusters in the Japanese Hiragana syllabary.
 * These represent characters that beginners commonly confuse due to shared stroke motifs,
 * mirrored curves, or presence/absence of terminal loops.
 */
export const HIRAGANA_CONFUSION_MAP: Record<string, string[]> = {
  // Loop vs Plain loops:
  'ね': ['れ', 'わ'],
  'れ': ['ね', 'わ'],
  'わ': ['ね', 'れ'],
  
  'ぬ': ['め'],
  'め': ['ぬ'],

  'る': ['ろ'],
  'ろ': ['る'],

  // Mirrored / similar hooks:
  'さ': ['ち', 'き'],
  'ち': ['さ'],
  'き': ['さ'],

  // Crosses and loops:
  'あ': ['お'],
  'お': ['あ'],

  'は': ['ほ', 'ま'],
  'ほ': ['は', 'ま'],
  'ま': ['も', 'は', 'ほ'],
  'も': ['ま'],

  // Parallel vertical / horizontal strokes:
  'い': ['り'],
  'り': ['い'],

  'こ': ['に'],
  'に': ['こ'],

  'た': ['な'],
  'な': ['た'],

  'そ': ['て'],
  'て': ['そ'],

  'く': ['へ'],
  'へ': ['く'],

  'ふ': ['う'],
  'う': ['ふ']
};

/**
 * Returns known confusion candidates for a given character.
 */
export function getVisualConfusionCandidates(char: string): string[] {
  return HIRAGANA_CONFUSION_MAP[char] || [];
}

/**
 * Records an error where the user selected `chosenChar` instead of the correct `targetChar`.
 * Tracks historical confusion frequency to detect specific learner difficulty patterns.
 */
export function recordConfusionError(memory: CharacterMemory, chosenChar: string): void {
  if (!chosenChar || chosenChar === memory.character) return;
  const current = memory.confusionPairs[chosenChar] || 0;
  memory.confusionPairs[chosenChar] = current + 1;
}

/**
 * Identifies the top confusion antagonist for a character if mistakes have occurred.
 */
export function getTopConfusionPair(memory: CharacterMemory): { confusingChar: string; mistakeCount: number } | null {
  const pairs = Object.entries(memory.confusionPairs || {});
  if (pairs.length === 0) return null;

  pairs.sort((a, b) => b[1] - a[1]);
  const [confusingChar, mistakeCount] = pairs[0];
  if (mistakeCount <= 0) return null;

  return { confusingChar, mistakeCount };
}

/**
 * Evaluates confusion risk (0 - 100) based on real learner errors and known similarity.
 */
export function calculateConfusionRisk(memory: CharacterMemory): number {
  const top = getTopConfusionPair(memory);
  if (!top) {
    // If no mistakes yet, low baseline risk
    return 0;
  }

  // 1 error = 35% risk, 2 errors = 65% risk, 3+ errors = 90%+ risk
  const score = Math.min(100, Math.round(top.mistakeCount * 30 + (memory.wrongCount > 2 ? 15 : 0)));
  return score;
}

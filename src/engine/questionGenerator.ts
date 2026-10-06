import { HiraganaCharacter, CharacterMemory, CognitiveQuestionType } from '../types';
import { HIRAGANA_DATA } from '../data/hiragana';
import { getVisualConfusionCandidates, getTopConfusionPair } from './confusionPairs';

export interface CognitiveOption {
  label: string;
  value: string;
  subLabel?: string;
  isJapanese?: boolean;
  conceptIcon?: string;
}

export interface CognitiveQuestion {
  id: string;
  character: HiraganaCharacter;
  type: CognitiveQuestionType;
  promptKicker: string;
  promptMain: string;
  promptSub?: string;
  conceptIcon?: string;
  audioToPlay?: string;
  options: CognitiveOption[];
  correctValue: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  confusionAntagonist?: string;
  contextPhrase?: string;
}

/**
 * Intelligent distractor generator:
 * Prioritizes:
 * 1. Confusion antagonists (characters the user actually misidentified)
 * 2. Visual confusion cluster mates (e.g. れ, わ for ね)
 * 3. Same kana row members (e.g. な, に, ぬ, の for ね)
 * 4. General unlocked pool candidates
 */
export function generateSmartDistractors(
  targetChar: HiraganaCharacter,
  pool: HiraganaCharacter[],
  count = 3,
  memory?: CharacterMemory
): HiraganaCharacter[] {
  const chosen: HiraganaCharacter[] = [];
  const chosenChars = new Set<string>([targetChar.char]);

  // Priority 1: Real error confusion antagonist
  if (memory) {
    const topConfusion = getTopConfusionPair(memory);
    if (topConfusion) {
      const match = pool.find(c => c.char === topConfusion.confusingChar);
      if (match && !chosenChars.has(match.char)) {
        chosen.push(match);
        chosenChars.add(match.char);
      }
    }
  }

  // Priority 2: Inherent visual confusion mates
  const visualMatches = getVisualConfusionCandidates(targetChar.char);
  for (const vChar of visualMatches) {
    if (chosen.length >= count) break;
    const match = pool.find(c => c.char === vChar) || HIRAGANA_DATA.find(c => c.char === vChar);
    if (match && !chosenChars.has(match.char)) {
      chosen.push(match);
      chosenChars.add(match.char);
    }
  }

  // Priority 3: Same consonant group
  const sameGroup = pool.filter(c => c.group === targetChar.group && !chosenChars.has(c.char));
  const shuffledSameGroup = [...sameGroup].sort(() => Math.random() - 0.5);
  for (const item of shuffledSameGroup) {
    if (chosen.length >= count) break;
    chosen.push(item);
    chosenChars.add(item.char);
  }

  // Priority 4: Fill remaining from candidate pool or HIRAGANA_DATA
  const remaining = pool.filter(c => !chosenChars.has(c.char)).sort(() => Math.random() - 0.5);
  for (const item of remaining) {
    if (chosen.length >= count) break;
    chosen.push(item);
    chosenChars.add(item.char);
  }

  if (chosen.length < count) {
    const fallback = HIRAGANA_DATA.filter(c => !chosenChars.has(c.char)).sort(() => Math.random() - 0.5);
    for (const item of fallback) {
      if (chosen.length >= count) break;
      chosen.push(item);
      chosenChars.add(item.char);
    }
  }

  return chosen.slice(0, count);
}

/**
 * Automatically chooses the best question type to train a character based on:
 * - Which retrieval pathway is currently weakest
 * - What question type was recently served (enforces retrieval diversity)
 * - Whether confusion pairs exist
 */
export function selectQuestionTypeForCharacter(
  memory: CharacterMemory | undefined,
  targetChar: HiraganaCharacter,
  recentTypes: CognitiveQuestionType[] = []
): CognitiveQuestionType {
  if (!memory || memory.repetitionCount === 0) {
    // New character: start with visual recognition or concept connection
    const introOptions: CognitiveQuestionType[] = ['characterToRomaji', 'meaningToCharacter', 'visualCueToCharacter'];
    return introOptions[Math.floor(Math.random() * introOptions.length)];
  }

  // If there's an active confusion risk (> 40%), insert a discrimination challenge
  const confusion = getTopConfusionPair(memory);
  if (confusion && memory.confusionRisk > 35 && !recentTypes.includes('discrimination')) {
    return 'discrimination';
  }

  // Evaluate which skill dimension is lowest
  const skillScores: { type: CognitiveQuestionType; score: number }[] = [
    { type: 'characterToRomaji', score: memory.recognitionStrength },
    { type: 'romajiToCharacter', score: memory.recallStrength },
    { type: 'soundToCharacter', score: memory.soundStrength },
    { type: 'wordToCharacter', score: memory.wordAssociationStrength },
    { type: 'meaningToCharacter', score: memory.visualMemoryStrength },
    { type: 'visualCueToCharacter', score: memory.visualMemoryStrength },
    { type: 'characterToWord', score: memory.wordAssociationStrength },
    { type: 'contextRecognition', score: (memory.recognitionStrength + memory.wordAssociationStrength) / 2 }
  ];

  // Exclude last used type to enforce diversity
  const lastType = recentTypes[recentTypes.length - 1];
  const eligible = skillScores.filter(s => s.type !== lastType);

  // Sort by lowest score
  eligible.sort((a, b) => a.score - b.score);

  // Pick among the 2 lowest with slight random variability
  const pickIndex = Math.random() < 0.75 ? 0 : Math.min(1, eligible.length - 1);
  return eligible[pickIndex]?.type || 'characterToRomaji';
}

/**
 * Builds a concrete CognitiveQuestion for a given character and chosen question type.
 */
export function generateCognitiveQuestion(
  targetChar: HiraganaCharacter,
  pool: HiraganaCharacter[],
  memory?: CharacterMemory,
  forcedType?: CognitiveQuestionType,
  recentTypes: CognitiveQuestionType[] = []
): CognitiveQuestion {
  const type = forcedType || selectQuestionTypeForCharacter(memory, targetChar, recentTypes);
  const qId = `q_${targetChar.char}_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const word = targetChar.word;

  switch (type) {
    case 'characterToRomaji': {
      // 1. Visual Recognition: ね -> NE
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'easy',
        promptKicker: 'Visual Recognition',
        promptMain: targetChar.char,
        promptSub: 'Which sound does this Hiragana make?',
        correctValue: targetChar.romaji,
        explanation: `${targetChar.char} is pronounced "${targetChar.romaji.toUpperCase()}"`,
        options: allChoices.map((c, i) => ({
          label: c.romaji.toUpperCase(),
          value: c.romaji,
          subLabel: `[${i + 1}]`
        }))
      };
    }

    case 'romajiToCharacter': {
      // 2. Reverse Recall: NE -> ね (Active recall)
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        promptKicker: 'Active Recall',
        promptMain: targetChar.romaji.toUpperCase(),
        promptSub: 'Which Hiragana represents this sound?',
        correctValue: targetChar.char,
        explanation: `${targetChar.romaji.toUpperCase()} is written as ${targetChar.char}`,
        options: allChoices.map((c, i) => ({
          label: c.char,
          value: c.char,
          isJapanese: true,
          subLabel: `[${i + 1}]`
        }))
      };
    }

    case 'soundToCharacter': {
      // 3. Audio Recognition: 🔊 "ne" -> ね
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        promptKicker: 'Listening Comprehension',
        promptMain: '🔊 Listen Closely',
        promptSub: 'Which Hiragana matches the spoken syllable?',
        audioToPlay: targetChar.char,
        correctValue: targetChar.char,
        explanation: `You heard "${targetChar.romaji}" → ${targetChar.char}`,
        options: allChoices.map((c, i) => ({
          label: c.char,
          value: c.char,
          isJapanese: true,
          subLabel: `[${i + 1}]`
        }))
      };
    }

    case 'characterToSound': {
      // 4. Kana -> Audio prompt / choice
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'easy',
        promptKicker: 'Pronunciation Match',
        promptMain: targetChar.char,
        promptSub: 'Select the exact sound syllable',
        correctValue: targetChar.romaji,
        explanation: `${targetChar.char} makes the sound "${targetChar.romaji.toUpperCase()}"`,
        options: allChoices.map((c, i) => ({
          label: c.romaji.toUpperCase(),
          value: c.romaji,
          subLabel: `[${i + 1}]`
        }))
      };
    }

    case 'wordToCharacter': {
      // 5. Word Association: ねこ -> Which character are we training?
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        promptKicker: 'Word Association',
        promptMain: word.jp,
        promptSub: `Pronounced "${word.romaji}" (${word.meaning}). Which character are we training?`,
        conceptIcon: word.conceptIcon,
        correctValue: targetChar.char,
        explanation: `${targetChar.char} is the hero character in ${word.jp} (${word.meaning} ${word.conceptIcon})`,
        options: allChoices.map((c, i) => ({
          label: c.char,
          value: c.char,
          isJapanese: true,
          subLabel: c.romaji.toUpperCase()
        }))
      };
    }

    case 'meaningToCharacter': {
      // 6. Meaning / Concept: 🐱 cat -> ねこ -> ね
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        promptKicker: 'Concept to Kana',
        promptMain: `${word.conceptIcon} ${word.meaning}`,
        promptSub: `Which Hiragana begins the word "${word.jp}" (${word.romaji})?`,
        conceptIcon: word.conceptIcon,
        correctValue: targetChar.char,
        explanation: `${targetChar.char} begins ${word.jp} (${word.romaji}) = ${word.meaning} ${word.conceptIcon}`,
        options: allChoices.map(c => ({
          label: c.char,
          value: c.char,
          subLabel: c.romaji.toUpperCase(),
          isJapanese: true
        }))
      };
    }

    case 'visualCueToCharacter': {
      // 7. Shape Mnemonic: "Imagine a cat's curly tail" -> ね
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        promptKicker: 'Shape Memory Trick',
        promptMain: `"${targetChar.mnemonic}"`,
        promptSub: 'Which Hiragana matches this shape memory trick?',
        conceptIcon: word.conceptIcon,
        correctValue: targetChar.char,
        explanation: `Trick: "${targetChar.mnemonic}" → ${targetChar.char} (${targetChar.romaji})`,
        options: allChoices.map(c => ({
          label: c.char,
          value: c.char,
          subLabel: c.romaji.toUpperCase(),
          isJapanese: true
        }))
      };
    }

    case 'characterToWord': {
      // 8. Kana -> Word: ね -> ねこ (cat 🐱)
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);
      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        promptKicker: 'Vocabulary Link',
        promptMain: targetChar.char,
        promptSub: 'Which vocabulary word did you connect with this character?',
        correctValue: word.jp,
        explanation: `${targetChar.char} connects to ${word.jp} (${word.romaji} · ${word.meaning} ${word.conceptIcon})`,
        options: allChoices.map(c => ({
          label: `${c.word.conceptIcon} ${c.word.jp}`,
          value: c.word.jp,
          subLabel: `${c.word.romaji} · ${c.word.meaning}`
        }))
      };
    }

    case 'discrimination': {
      // 9. Confusion Pair: Which one is ね? [ね / れ]
      const topConfusion = memory ? getTopConfusionPair(memory)?.confusingChar : null;
      const visualCandidates = getVisualConfusionCandidates(targetChar.char);
      const antagonistChar = topConfusion 
        || visualCandidates.find(c => c !== targetChar.char)
        || (targetChar.char === 'れ' ? 'ね' : 'れ');

      let antagonistObj = pool.find(c => c.char === antagonistChar) 
        || HIRAGANA_DATA.find(c => c.char === antagonistChar) 
        || pool.find(c => c.char !== targetChar.char)
        || HIRAGANA_DATA.find(c => c.char !== targetChar.char);

      if (!antagonistObj || antagonistObj.char === targetChar.char) {
        antagonistObj = HIRAGANA_DATA.find(c => c.char !== targetChar.char)!;
      }

      const choices = [targetChar, antagonistObj].sort(() => Math.random() - 0.5);

      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'hard',
        confusionAntagonist: antagonistObj.char,
        promptKicker: 'Discrimination Duel',
        promptMain: `Which one is "${targetChar.char}" (${targetChar.romaji.toUpperCase()})?`,
        promptSub: `Notice the stroke details! Distinguish ${targetChar.char} from ${antagonistObj.char}.`,
        correctValue: targetChar.char,
        explanation: `${targetChar.char} is "${targetChar.romaji}". Notice the difference from ${antagonistObj.char}!`,
        options: choices.map(c => ({
          label: c.char,
          value: c.char,
          subLabel: c.romaji.toUpperCase(),
          isJapanese: true
        }))
      };
    }

    case 'contextRecognition': {
      // 10. Meaningful mini-phrase context
      const phrase = word.contextPhrase || `${word.jp} です。`;
      const phraseMeaning = word.contextMeaning || `It is ${word.meaning}.`;
      const distractors = generateSmartDistractors(targetChar, pool, 3, memory);
      const allChoices = [targetChar, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: qId,
        character: targetChar,
        type,
        difficulty: 'medium',
        contextPhrase: phrase,
        promptKicker: 'Phrase Context',
        promptMain: phrase,
        promptSub: `Meaning: "${phraseMeaning}" — Which character is the hero kana?`,
        conceptIcon: word.conceptIcon,
        correctValue: targetChar.char,
        explanation: `${targetChar.char} is the hero character in "${phrase}" (${phraseMeaning})`,
        options: allChoices.map(c => ({
          label: c.char,
          value: c.char,
          subLabel: c.romaji.toUpperCase(),
          isJapanese: true
        }))
      };
    }
  }
}

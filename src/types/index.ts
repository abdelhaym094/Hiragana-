export type KanaGroup = 
  | 'vowels' 
  | 'k' 
  | 's' 
  | 't' 
  | 'n' 
  | 'h' 
  | 'm' 
  | 'y' 
  | 'r' 
  | 'w-n';

export interface MemoryWord {
  jp: string;
  romaji: string;
  meaning: string;
  conceptIcon: string;
  // Optional tiny context phrase (e.g. "ねこ です" -> "It is a cat")
  contextPhrase?: string;
  contextMeaning?: string;
}

export interface HiraganaCharacter {
  char: string;
  romaji: string;
  group: KanaGroup;
  day: number;
  mnemonic: string;
  word: MemoryWord;
  // Backward compatibility alias for hint & example
  hint?: string;
  example?: { jp: string; romaji: string; en: string };
}

export type CognitiveStatus = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered';

export type CognitiveQuestionType =
  | 'characterToRomaji'    // Visual Recognition: ね -> NE
  | 'romajiToCharacter'    // Reverse Recall: NE -> ね
  | 'soundToCharacter'     // Audio Recognition: 🔊 "ne" -> ね
  | 'characterToSound'     // Kana -> Sound pronunciation check
  | 'wordToCharacter'      // Word Association: ねこ -> identify ね
  | 'meaningToCharacter'   // Meaning / Concept: 🐱 cat -> ねこ -> ね
  | 'characterToWord'      // Kana -> Word: ね -> ねこ (cat 🐱)
  | 'visualCueToCharacter' // Shape Mnemonic -> Kana
  | 'discrimination'       // Confusion Pair: Which one is ね? [ね / れ]
  | 'contextRecognition';  // Context phrase: "ねこ です" -> find target character

export interface QuestionTypePerformance {
  characterToRomaji: number;
  romajiToCharacter: number;
  soundToCharacter: number;
  characterToSound: number;
  wordToCharacter: number;
  meaningToCharacter: number;
  characterToWord: number;
  visualCueToCharacter: number;
  discrimination: number;
  contextRecognition: number;
}

/**
 * Multi-dimensional cognitive memory profile for each Hiragana character
 */
export interface CharacterMemory {
  character: string;
  romaji: string;
  introducedAt: number;

  // Multi-dimensional retrieval strengths (0 to 100)
  recognitionStrength: number;     // Can recognize when seen (ね -> NE)
  soundStrength: number;           // Can identify from sound (🔊 "ne" -> ね)
  recallStrength: number;          // Can produce character when given sound/concept (NE -> ね)
  wordAssociationStrength: number; // Connects character to real word (ねこ -> ね)
  visualMemoryStrength: number;    // Connects to shape mnemonic trick
  overallMemoryStrength: number;   // Balanced composite (does not let one hide another)

  correctCount: number;
  wrongCount: number;
  recentCorrectStreak: number;
  averageResponseTime: number; // in milliseconds
  automaticityScore: number;   // 0 to 100: fast & accurate retrieval

  lastSeenAt: number;
  lastCorrectAt: number;
  lastWrongAt: number;
  nextReviewAt: number; // timestamp in ms when review is scheduled
  interval: number;     // current spaced interval in hours
  ease: number;         // spaced repetition ease factor (default 2.5)

  forgettingRisk: number; // 0 to 100 calculated by forgetting curve
  confusionRisk: number;  // 0 to 100 based on error frequency with similar kana
  confusionPairs: Record<string, number>; // counts of mistaken candidates e.g. { 'れ': 2 }

  questionTypePerformance: QuestionTypePerformance;
  status: CognitiveStatus;

  // Backward compatibility fields for legacy CharacterMastery callers
  char: string;
  accuracy: number;
  repetitionCount: number;
  masteryScore: number; // 0 to 5
  memoryStrength: number; // 0 to 5
  lastSeen: number;
  memoryCorrectCount: number;
  memoryWrongCount: number;
}

// Backward compatibility alias:
export type CharacterMastery = CharacterMemory;

export interface DayQuestProgress {
  newCharsLearned: boolean;
  miniGamesCount: number;
  bossBeaten: boolean;
}

export interface UserProgress {
  currentDay: number; // 1 to 7
  unlockedDay: number; // 1 to 7
  streak: number;
  lastActiveDate: string; // 'YYYY-MM-DD'
  totalXp: number;
  completedDays: number[];
  characters: Record<string, CharacterMemory>;
  dayQuests: Record<number, DayQuestProgress>;
  bossScores: Record<number, { score: number; maxScore: number; date: string }>;
  finalChallengeCompleted: boolean;
  bestStreak: number;
  achievements?: string[];
  settings: {
    soundEffects: boolean;
    speechAudio: boolean;
  };
  memorySchemaVersion?: number;
  totalRetrievals?: number;
  durableRecallCount?: number;
}

export type ViewMode = 
  | 'home'
  | 'lesson-intro'
  | 'arcade'
  | 'mini-game-mc'
  | 'mini-game-sound'
  | 'mini-game-matching'
  | 'mini-game-speed'
  | 'boss'
  | 'final-challenge'
  | 'review-weak'
  | 'kana-chart'
  | 'profile'
  | 'memory-test'
  | 'cognitive-session';

import { CharacterMemory, CognitiveQuestionType, CognitiveStatus, QuestionTypePerformance } from '../types';
import { calculateConfusionRisk, recordConfusionError } from './confusionPairs';

export interface AnswerOutcomeParams {
  isCorrect: boolean;
  responseTimeMs: number;
  questionType: CognitiveQuestionType;
  selectedOption?: string; // chosen char or romaji (for error analysis)
  now?: number;
}

export interface AnswerOutcomeResult {
  updatedMemory: CharacterMemory;
  isDurableRecall: boolean; // Delayed recall after interval -> triggers MEMORY COMEBACK (+25 XP)
  isFastAutomatic: boolean; // Fast correct (< 1.5s)
  isGuessSuspected: boolean; // Super fast incorrect (< 450ms)
  previousRisk: number;
  newRisk: number;
}

const DEFAULT_QUESTION_PERF: QuestionTypePerformance = {
  characterToRomaji: 0,
  romajiToCharacter: 0,
  soundToCharacter: 0,
  characterToSound: 0,
  wordToCharacter: 0,
  meaningToCharacter: 0,
  characterToWord: 0,
  visualCueToCharacter: 0,
  discrimination: 0,
  contextRecognition: 0
};

/**
 * Initializes a full multi-dimensional cognitive memory profile for a character.
 */
export function initCharacterMemory(char: string, romaji: string): CharacterMemory {
  const now = Date.now();
  return {
    character: char,
    romaji,
    introducedAt: now,

    recognitionStrength: 0,
    soundStrength: 0,
    recallStrength: 0,
    wordAssociationStrength: 0,
    visualMemoryStrength: 0,
    overallMemoryStrength: 0,

    correctCount: 0,
    wrongCount: 0,
    recentCorrectStreak: 0,
    averageResponseTime: 2500,
    automaticityScore: 0,

    lastSeenAt: 0,
    lastCorrectAt: 0,
    lastWrongAt: 0,
    nextReviewAt: now,
    interval: 0.16, // 10 minutes initial interval in hours
    ease: 2.5,

    forgettingRisk: 0,
    confusionRisk: 0,
    confusionPairs: {},

    questionTypePerformance: { ...DEFAULT_QUESTION_PERF },
    status: 'new',

    // Legacy compatibility fields
    char,
    accuracy: 100,
    repetitionCount: 0,
    masteryScore: 0,
    memoryStrength: 0,
    lastSeen: 0,
    memoryCorrectCount: 0,
    memoryWrongCount: 0
  };
}

/**
 * Computes forgetting risk (0 - 100) using an adaptive forgetting curve model.
 * Evaluates time elapsed against scheduled interval, accuracy history, and response latency.
 */
export function calculateForgettingRisk(memory: CharacterMemory, currentTime = Date.now()): number {
  if (!memory.lastSeenAt || memory.repetitionCount === 0) {
    return 0; // Fresh character, not yet decaying
  }

  const intervalMs = Math.max(10 * 60 * 1000, memory.interval * 3600 * 1000);
  const timeSinceSeen = currentTime - memory.lastSeenAt;

  let baseRisk: number;

  if (currentTime < memory.nextReviewAt) {
    // Before review due time: risk rises smoothly from 10 to ~55
    const progress = Math.max(0, timeSinceSeen / intervalMs);
    baseRisk = Math.min(55, Math.round(progress * 55));
  } else {
    // Review is due or overdue: risk rises from 60 to 100
    const overdueMs = currentTime - memory.nextReviewAt;
    const overdueRatio = overdueMs / intervalMs;
    baseRisk = Math.min(100, Math.round(60 + overdueRatio * 35));
  }

  // Modifiers based on learner stability
  let riskModifier = 0;

  // Slow response time increases forgetting risk
  if (memory.averageResponseTime > 3500) {
    riskModifier += 10;
  } else if (memory.averageResponseTime < 1400) {
    riskModifier -= 8;
  }

  // Recent errors increase risk
  if (memory.wrongCount > 1 && memory.recentCorrectStreak <= 1) {
    riskModifier += 12;
  }

  // Consistent recent streak reduces risk
  if (memory.recentCorrectStreak >= 3) {
    riskModifier -= 10;
  }

  return Math.max(0, Math.min(100, baseRisk + riskModifier));
}

/**
 * Updates a character's cognitive memory profile after answering any question.
 */
export function updateCharacterMemory(
  current: CharacterMemory | undefined,
  char: string,
  romaji: string,
  params: AnswerOutcomeParams
): AnswerOutcomeResult {
  const now = params.now || Date.now();
  const base: CharacterMemory = current ? { ...current } : initCharacterMemory(char, romaji);

  const previousRisk = calculateForgettingRisk(base, now);

  // Check if this was a durable delayed recall (review was overdue or risk was elevated)
  const isDurableRecall = params.isCorrect && (now >= base.nextReviewAt || previousRisk >= 60) && base.repetitionCount >= 2;
  const isFastAutomatic = params.isCorrect && params.responseTimeMs < 1500;
  const isGuessSuspected = !params.isCorrect && params.responseTimeMs < 450;

  // 1. Update basic timestamps & counts
  base.lastSeenAt = now;
  base.lastSeen = now;
  base.repetitionCount += 1;

  // 2. Exponential moving average for response time
  const clampedResponseTime = Math.max(400, Math.min(12000, params.responseTimeMs));
  base.averageResponseTime = base.repetitionCount === 1
    ? clampedResponseTime
    : Math.round(0.7 * base.averageResponseTime + 0.3 * clampedResponseTime);

  // 3. Question type performance update
  const perf = { ...(base.questionTypePerformance || DEFAULT_QUESTION_PERF) };
  const currentPerfScore = perf[params.questionType] || 0;
  perf[params.questionType] = params.isCorrect
    ? Math.min(100, currentPerfScore + 18)
    : Math.max(0, currentPerfScore - 22);
  base.questionTypePerformance = perf;

  // 4. Update specific retrieval pathway dimensions
  const deltaCorrect = params.isCorrect ? (isFastAutomatic ? 22 : 14) : -20;

  switch (params.questionType) {
    case 'characterToRomaji':
      base.recognitionStrength = clamp(base.recognitionStrength + deltaCorrect);
      break;

    case 'romajiToCharacter':
      // Reverse recall is more cognitively demanding -> higher reward
      base.recallStrength = clamp(base.recallStrength + (params.isCorrect ? 25 : -22));
      base.recognitionStrength = clamp(base.recognitionStrength + (params.isCorrect ? 10 : 0));
      break;

    case 'soundToCharacter':
    case 'characterToSound':
      base.soundStrength = clamp(base.soundStrength + deltaCorrect);
      base.recallStrength = clamp(base.recallStrength + (params.isCorrect ? 8 : 0));
      break;

    case 'wordToCharacter':
    case 'characterToWord':
      base.wordAssociationStrength = clamp(base.wordAssociationStrength + deltaCorrect);
      base.recognitionStrength = clamp(base.recognitionStrength + (params.isCorrect ? 8 : 0));
      break;

    case 'meaningToCharacter':
    case 'visualCueToCharacter':
      base.visualMemoryStrength = clamp(base.visualMemoryStrength + deltaCorrect);
      base.wordAssociationStrength = clamp(base.wordAssociationStrength + (params.isCorrect ? 10 : 0));
      break;

    case 'discrimination':
      base.recognitionStrength = clamp(base.recognitionStrength + deltaCorrect);
      if (params.isCorrect) {
        // Successful discrimination drops confusion risk
        base.confusionRisk = Math.max(0, base.confusionRisk - 25);
      }
      break;

    case 'contextRecognition':
      base.recognitionStrength = clamp(base.recognitionStrength + (params.isCorrect ? 15 : -15));
      base.wordAssociationStrength = clamp(base.wordAssociationStrength + (params.isCorrect ? 20 : -15));
      break;
  }

  // 5. Automaticity score tracking
  if (params.isCorrect) {
    if (params.responseTimeMs < 1200) {
      base.automaticityScore = clamp(base.automaticityScore + 18);
    } else if (params.responseTimeMs < 2200) {
      base.automaticityScore = clamp(base.automaticityScore + 10);
    } else if (params.responseTimeMs < 3500) {
      base.automaticityScore = clamp(base.automaticityScore + 4);
    } else {
      // Slow correct
      base.automaticityScore = clamp(base.automaticityScore + 1);
    }
  } else {
    base.automaticityScore = clamp(base.automaticityScore - 15);
  }

  // 6. Handle error and confusion tracking
  if (params.isCorrect) {
    base.correctCount += 1;
    base.recentCorrectStreak += 1;
    base.lastCorrectAt = now;
  } else {
    base.wrongCount += 1;
    base.recentCorrectStreak = 0;
    base.lastWrongAt = now;

    if (params.selectedOption) {
      recordConfusionError(base, params.selectedOption);
    }
  }

  base.confusionRisk = calculateConfusionRisk(base);

  // 7. MULTI-DIMENSIONAL OVERALL MEMORY STRENGTH
  // "Do not allow one skill to hide another."
  // We use bounded minimum + average weighting so a deficit in sound or recall holds overall mastery honest.
  const activeSkills = [
    base.recognitionStrength,
    base.soundStrength,
    base.recallStrength,
    base.wordAssociationStrength,
    base.visualMemoryStrength
  ];
  const minSkill = Math.min(...activeSkills);
  const avgSkill = activeSkills.reduce((a, b) => a + b, 0) / activeSkills.length;
  base.overallMemoryStrength = Math.round(0.35 * minSkill + 0.65 * avgSkill);

  // 8. SPACED REPETITION INTERVAL & EASE UPDATE
  if (params.isCorrect) {
    if (isFastAutomatic) {
      base.ease = Math.min(3.2, Number((base.ease + 0.12).toFixed(2)));
    } else if (params.responseTimeMs > 3500) {
      base.ease = Math.max(1.3, Number((base.ease - 0.05).toFixed(2)));
    }

    if (base.repetitionCount <= 1) {
      base.interval = 0.2; // ~12 minutes
    } else if (base.repetitionCount === 2) {
      base.interval = 18; // ~18 hours
    } else if (base.repetitionCount === 3) {
      base.interval = 48; // ~2 days
    } else {
      // Interval increases dynamically based on ease
      const growthFactor = isFastAutomatic ? base.ease * 1.15 : base.ease;
      base.interval = Math.min(720, Math.round(base.interval * growthFactor)); // max 30 days
    }
    base.nextReviewAt = now + Math.round(base.interval * 3600 * 1000);
  } else {
    // On incorrect response, reset interval to immediate review (~10 mins)
    base.interval = 0.16;
    base.ease = Math.max(1.3, Number((base.ease - 0.2).toFixed(2)));
    base.nextReviewAt = now + Math.round(0.16 * 3600 * 1000);
  }

  // 9. Recompute forgetting risk for updated state
  const newRisk = calculateForgettingRisk(base, now);
  base.forgettingRisk = newRisk;

  // 10. MASTERY GATES & STATUS
  base.status = evaluateStatus(base);

  // 11. Legacy compatibility sync
  const total = base.correctCount + base.wrongCount;
  base.accuracy = total > 0 ? Math.round((base.correctCount / total) * 100) : 100;
  base.masteryScore = Math.min(5, Math.floor(base.overallMemoryStrength / 20));
  base.memoryStrength = Math.min(5, Math.floor(base.visualMemoryStrength / 20));
  base.memoryCorrectCount = base.correctCount;
  base.memoryWrongCount = base.wrongCount;

  return {
    updatedMemory: base,
    isDurableRecall,
    isFastAutomatic,
    isGuessSuspected,
    previousRisk,
    newRisk
  };
}

function clamp(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

/**
 * Strict multi-dimensional mastery gates:
 * A character cannot be declared 'mastered' simply from answering 3 times.
 * It must prove visual recognition, sound comprehension, active recall, vocabulary association, and automaticity.
 */
function evaluateStatus(m: CharacterMemory): CognitiveStatus {
  if (m.repetitionCount === 0) return 'new';

  const isMastered =
    m.overallMemoryStrength >= 82 &&
    m.recognitionStrength >= 80 &&
    m.soundStrength >= 70 &&
    m.recallStrength >= 70 &&
    m.wordAssociationStrength >= 65 &&
    m.correctCount >= 6 &&
    m.confusionRisk <= 25 &&
    m.automaticityScore >= 55;

  if (isMastered) return 'mastered';
  if (m.overallMemoryStrength >= 70) return 'strong';
  if (m.overallMemoryStrength >= 45) return 'familiar';
  return 'learning';
}

/**
 * Converts a status or score into user-friendly, human language.
 * "DO NOT expose complicated scores to the learner."
 */
export function getFriendlyStatusText(m: CharacterMemory): string {
  if (m.status === 'mastered') return 'Mastered';
  if (m.status === 'strong') return 'Strong';
  if (m.status === 'familiar') return 'Almost mastered';
  if (m.status === 'learning') {
    return m.forgettingRisk > 60 ? 'Needs practice' : 'Getting stronger';
  }
  return 'New';
}

export function getFriendlyEncouragement(isCorrect: boolean): string {
  if (isCorrect) {
    const praises = [
      'Clean recall!',
      'You just know it.',
      'Locked in memory.',
      'Nice reflex!',
      'That one is yours.'
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  } else {
    const encouragements = [
      'Almost! Your brain is still building this one.',
      "No stress — let's strengthen it.",
      'We will bring this one back to lock it in.',
      'Close! Notice the curve.',
      'Building the memory trace.'
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
}

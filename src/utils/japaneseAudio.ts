/**
 * Central Japanese Audio & SpeechSynthesis Service for Hiragana Quest
 * 
 * Provides robust, mobile-compatible Japanese text-to-speech across:
 * - iOS Safari (handles empty initial voices, cancel-speak race conditions, WebKit GC bug)
 * - Android Chrome (handles language tag selection and voice initialization)
 * - Desktop browsers
 * - Autoplay restriction resilience (fails gracefully without interrupting gameplay)
 * - Debouncing & rapid-tap handling (latest tap always wins cleanly)
 */

export interface JapaneseSpeechOptions {
  /** If true, speaks the associated Japanese vocabulary word instead of isolated kana */
  preferWord?: boolean;
  /** Force speaking the exact character even if no Japanese voice was detected */
  forceCharacter?: boolean;
  /** Speech rate (0.5 to 1.5, default ~0.88 for crisp beginner comprehension) */
  rate?: number;
  /** Pitch (default 1.0) */
  pitch?: number;
  /** Volume (0 to 1, default 1.0) */
  volume?: number;
}

/**
 * Standard Japanese vocabulary words corresponding to each of the 46 Hiragana characters.
 * Used when isolated single-character TTS is unreliable on generic speech engines,
 * ensuring the audio output remains 100% authentic Japanese phonetics.
 */
export const HIRAGANA_PRONUNCIATION_WORD_MAP: Record<string, string> = {
  'あ': 'あさ',
  'い': 'いぬ',
  'う': 'うみ',
  'え': 'えき',
  'お': 'おちゃ',
  'か': 'かさ',
  'き': 'きつね',
  'く': 'くるま',
  'け': 'けさ',
  'こ': 'こえ',
  'さ': 'さかな',
  'し': 'しお',
  'す': 'すし',
  'せ': 'せんせい',
  'そ': 'そら',
  'た': 'たまご',
  'ち': 'ちず',
  'つ': 'つき',
  'て': 'てがみ',
  'と': 'とけい',
  'な': 'なつ',
  'に': 'にく',
  'ぬ': 'ぬの',
  'ね': 'ねこ',
  'の': 'のり',
  'は': 'はな',
  'ひ': 'ひこうき',
  'ふ': 'ふね',
  'へ': 'へや',
  'ほ': 'ほし',
  'ま': 'まど',
  'み': 'みず',
  'む': 'むし',
  'め': 'めがね',
  'も': 'もり',
  'や': 'やま',
  'ゆ': 'ゆき',
  'よ': 'よる',
  'ら': 'らいおん',
  'り': 'りんご',
  'る': 'るびー',
  'れ': 'れいぞうこ',
  'ろ': 'ろうそく',
  'わ': 'わに',
  'を': 'を',
  'ん': 'ほん'
};

// Internal Module State
let cachedJapaneseVoice: SpeechSynthesisVoice | null = null;
let allVoicesCache: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null; // Crucial: prevents WebKit GC from killing audio mid-speech
let currentRequestId = 0;
let cancelDelayTimerId: ReturnType<typeof setTimeout> | null = null;
let watchdogTimerId: ReturnType<typeof setTimeout> | null = null;
let isVoicesListenerAttached = false;

/**
 * Checks whether SpeechSynthesis is available in the current browser environment.
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Safely fetches the list of available browser voices, caching when available.
 */
export function getAllVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  try {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      allVoicesCache = list;
    }
    return allVoicesCache.length > 0 ? allVoicesCache : (list || []);
  } catch {
    return allVoicesCache;
  }
}

/**
 * Selects the optimal Japanese voice using strict priority:
 * 1. Exact 'ja-JP' or 'ja_JP' match
 * 2. Any voice starting with 'ja'
 * 3. Japanese-labeled voice (e.g., Kyoko, Otoya, Google 日本語)
 * 
 * CRITICAL RULE: Never falls back to an English voice.
 * If no Japanese voice is found, returns null so the browser defaults to 'ja-JP' language tag
 * rather than forcing English phonetics.
 */
export function getJapaneseVoice(): SpeechSynthesisVoice | null {
  const voices = getAllVoices();
  if (voices.length === 0) return cachedJapaneseVoice;

  // 1. Exact ja-JP or ja_JP
  const exact = voices.find(v => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang === 'ja-jp';
  });
  if (exact) {
    cachedJapaneseVoice = exact;
    return exact;
  }

  // 2. Starts with ja (e.g. ja, ja-JP-standard)
  const prefix = voices.find(v => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('ja');
  });
  if (prefix) {
    cachedJapaneseVoice = prefix;
    return prefix;
  }

  // 3. Name indicates Japanese, ensuring language is not English or other Western language
  const byName = voices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    const isJapaneseName = name.includes('japanese') || name.includes('kyoko') || name.includes('otoya') || name.includes('日本語');
    return isJapaneseName && !lang.startsWith('en') && !lang.startsWith('es') && !lang.startsWith('fr');
  });
  if (byName) {
    cachedJapaneseVoice = byName;
    return byName;
  }

  // Never return an English or mismatched voice
  return null;
}

/**
 * Mobile-safe helper: Waits up to `timeoutMs` for voices to populate asynchronously.
 */
function waitForVoices(timeoutMs = 200): Promise<SpeechSynthesisVoice[]> {
  const existing = getAllVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(getAllVoices());
      }
    }, timeoutMs);

    const onVoices = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(getAllVoices());
      }
    };

    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.addEventListener('voiceschanged', onVoices, { once: true });
      } catch {
        // Fallback for older browsers
        window.speechSynthesis.onvoiceschanged = onVoices;
      }
    }
  });
}

/**
 * Initializes global voice event listeners once.
 */
function initVoiceListeners(): void {
  if (isVoicesListenerAttached || !isSpeechSynthesisSupported()) return;
  isVoicesListenerAttached = true;

  try {
    const handleVoices = () => {
      getAllVoices();
      getJapaneseVoice();
    };

    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
    }
    window.speechSynthesis.onvoiceschanged = handleVoices;

    // Trigger immediate check
    handleVoices();
  } catch {}
}

// Auto-initialize when file is imported in browser
if (typeof window !== 'undefined') {
  initVoiceListeners();
}

/**
 * Stops any ongoing or scheduled Japanese audio playback.
 */
export function stopJapaneseAudio(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    if (cancelDelayTimerId) {
      clearTimeout(cancelDelayTimerId);
      cancelDelayTimerId = null;
    }
    if (watchdogTimerId) {
      clearTimeout(watchdogTimerId);
      watchdogTimerId = null;
    }
    window.speechSynthesis.cancel();
    activeUtterance = null;
  } catch {}
}

/**
 * Central Japanese speech synthesis function.
 * 
 * Handles:
 * - Cancellation of active speech before new utterance
 * - 80ms sequencing delay required for mobile WebKit audio session recovery
 * - WebKit utterance garbage collection protection
 * - Fallback to associated vocabulary when isolated kana TTS is absent
 * - Watchdog timer preventing hung promises
 * - Clean rapid-tap debouncing (latest tap always wins)
 */
export function speakJapanese(
  rawText: string,
  enabled = true,
  options?: JapaneseSpeechOptions
): Promise<void> {
  // If disabled, empty, or unsupported, gracefully resolve
  if (!enabled || !rawText || !isSpeechSynthesisSupported()) {
    return Promise.resolve();
  }

  // Increment request token: any older in-flight utterance is canceled and discarded
  const requestId = ++currentRequestId;

  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;

      // 1. Clear any prior watchdog or sequencing timers
      if (cancelDelayTimerId) {
        clearTimeout(cancelDelayTimerId);
        cancelDelayTimerId = null;
      }
      if (watchdogTimerId) {
        clearTimeout(watchdogTimerId);
        watchdogTimerId = null;
      }

      // 2. Cancel current speech & resume if stuck in paused state
      try {
        if (synth.paused) {
          synth.resume();
        }
        synth.cancel();
      } catch {}

      // 3. Mobile Safe Sequencing:
      // Wait 80ms before speaking. This is critical for iOS Safari and Android Chrome,
      // which drop utterances if speak() is invoked synchronously after cancel().
      cancelDelayTimerId = setTimeout(async () => {
        // If a newer tap arrived during the 80ms window, silently abandon this one
        if (requestId !== currentRequestId) {
          resolve();
          return;
        }

        try {
          // Check for available Japanese voice, waiting briefly if voices not ready yet
          let voice = getJapaneseVoice();
          if (!voice) {
            await waitForVoices(150);
            voice = getJapaneseVoice();
          }

          // Check again if superseded by a newer tap
          if (requestId !== currentRequestId) {
            resolve();
            return;
          }

          const trimmed = rawText.trim();
          let textToSpeak = trimmed;

          // Isolated Hiragana pronunciation handling:
          // If the text is a single Hiragana character and no dedicated Japanese voice is found,
          // or if preferWord is requested, speak the corresponding Japanese word so generic
          // engines speak authentic Japanese rather than spelling Latin characters.
          if (trimmed.length === 1 && HIRAGANA_PRONUNCIATION_WORD_MAP[trimmed]) {
            if (options?.preferWord || (!voice && !options?.forceCharacter)) {
              textToSpeak = HIRAGANA_PRONUNCIATION_WORD_MAP[trimmed];
            }
          }

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'ja-JP';

          if (voice) {
            utterance.voice = voice;
          }

          // Natural beginner-friendly speed (0.88 is crisp and intelligible)
          utterance.rate = options?.rate ?? 0.88;
          utterance.pitch = options?.pitch ?? 1.0;
          utterance.volume = options?.volume ?? 1.0;

          // WebKit GC Fix: Store utterance globally until onend/onerror
          activeUtterance = utterance;

          let isDone = false;
          const cleanupAndResolve = () => {
            if (isDone) return;
            isDone = true;
            if (watchdogTimerId) {
              clearTimeout(watchdogTimerId);
              watchdogTimerId = null;
            }
            if (activeUtterance === utterance) {
              activeUtterance = null;
            }
            resolve();
          };

          utterance.onend = cleanupAndResolve;
          utterance.onerror = () => {
            // Audio failure must NEVER break gameplay or throw unhandled errors
            cleanupAndResolve();
          };

          // Watchdog timer: If browser drops onend (common on mobile screen lock/idle),
          // auto-resolve after 3.5s to prevent promise hangs.
          watchdogTimerId = setTimeout(() => {
            cleanupAndResolve();
          }, 3500);

          synth.speak(utterance);

          // Resume in case browser speech engine was suspended
          if (synth.paused) {
            synth.resume();
          }
        } catch {
          // Graceful fallback: audio failure never crashes the application
          resolve();
        }
      }, 80);
    } catch {
      resolve();
    }
  });
}

import { HiraganaCharacter } from '../types';

export const HIRAGANA_DATA: HiraganaCharacter[] = [
  // DAY 1: Vowels (5)
  {
    char: 'あ',
    romaji: 'a',
    group: 'vowels',
    day: 1,
    mnemonic: 'Imagine the shape as a person stretching and saying "Ah!" to the bright morning sun.',
    word: { jp: 'あさ', romaji: 'asa', meaning: 'morning', conceptIcon: '☀️' },
    hint: 'Imagine a person saying "Ah!" to the morning sun.',
    example: { jp: 'あさ', romaji: 'asa', en: 'morning' }
  },
  {
    char: 'い',
    romaji: 'i',
    group: 'vowels',
    day: 1,
    mnemonic: 'Two upright bamboo stalks standing side-by-side like a faithful dog\'s alert ears.',
    word: { jp: 'いぬ', romaji: 'inu', meaning: 'dog', conceptIcon: '🐕' },
    hint: 'Two tall bamboo stalks standing side-by-side like a dog\'s ears.',
    example: { jp: 'いぬ', romaji: 'inu', en: 'dog' }
  },
  {
    char: 'う',
    romaji: 'u',
    group: 'vowels',
    day: 1,
    mnemonic: 'A rolling ocean wave curling over as it splashes onto the open sea.',
    word: { jp: 'うみ', romaji: 'umi', meaning: 'sea / ocean', conceptIcon: '🌊' },
    hint: 'A rolling ocean wave curling onto the sea.',
    example: { jp: 'うみ', romaji: 'umi', en: 'sea / ocean' }
  },
  {
    char: 'え',
    romaji: 'e',
    group: 'vowels',
    day: 1,
    mnemonic: 'An energetic commuter with a backpack dashing fast to catch the train at the station.',
    word: { jp: 'えき', romaji: 'eki', meaning: 'station', conceptIcon: '🚉' },
    hint: 'An energetic commuter dashing to catch the train at the station.',
    example: { jp: 'えき', romaji: 'eki', en: 'station' }
  },
  {
    char: 'お',
    romaji: 'o',
    group: 'vowels',
    day: 1,
    mnemonic: 'A round teapot with a delicate swirl of fragrant steam rising from hot green tea.',
    word: { jp: 'おちゃ', romaji: 'ocha', meaning: 'tea', conceptIcon: '🍵' },
    hint: 'A round teapot with a swirl of steam rising from hot tea.',
    example: { jp: 'おちゃ', romaji: 'ocha', en: 'tea' }
  },

  // DAY 2: K-row (5)
  {
    char: 'か',
    romaji: 'ka',
    group: 'k',
    day: 2,
    mnemonic: 'A curved katana sword slicing rain droplets off an open umbrella canopy.',
    word: { jp: 'かさ', romaji: 'kasa', meaning: 'umbrella', conceptIcon: '☂️' },
    hint: 'A curved sword slicing rain droplets off an open umbrella.',
    example: { jp: 'かさ', romaji: 'kasa', en: 'umbrella' }
  },
  {
    char: 'き',
    romaji: 'ki',
    group: 'k',
    day: 2,
    mnemonic: 'An antique wooden key with two horizontal notches that looks like branches on a pine tree.',
    word: { jp: 'き', romaji: 'ki', meaning: 'tree', conceptIcon: '🌳' },
    hint: 'An antique key with notches resembling branches on a pine tree.',
    example: { jp: 'き', romaji: 'ki', en: 'tree' }
  },
  {
    char: 'く',
    romaji: 'ku',
    group: 'k',
    day: 2,
    mnemonic: 'A sharp bird beak opening wide, or the aerodynamic hood of a swift car.',
    word: { jp: 'くるま', romaji: 'kuruma', meaning: 'car', conceptIcon: '🚗' },
    hint: 'A sharp beak opening wide, or the front of a sleek car.',
    example: { jp: 'くるま', romaji: 'kuruma', en: 'car' }
  },
  {
    char: 'け',
    romaji: 'ke',
    group: 'k',
    day: 2,
    mnemonic: 'Two tall bamboo pillars catching the first golden rays of this morning\'s sunrise.',
    word: { jp: 'けさ', romaji: 'kesa', meaning: 'this morning', conceptIcon: '🌅' },
    hint: 'Two bamboo pillars catching the rays of this morning\'s sunrise.',
    example: { jp: 'けさ', romaji: 'kesa', en: 'this morning' }
  },
  {
    char: 'こ',
    romaji: 'ko',
    group: 'k',
    day: 2,
    mnemonic: 'Two open curved lips projecting a clear, resonant speaking voice.',
    word: { jp: 'こえ', romaji: 'koe', meaning: 'voice', conceptIcon: '🗣️' },
    hint: 'Two curved open lips projecting a clear speaking voice.',
    example: { jp: 'こえ', romaji: 'koe', en: 'voice' }
  },

  // DAY 3: S-row (5)
  {
    char: 'さ',
    romaji: 'sa',
    group: 's',
    day: 3,
    mnemonic: 'A fishing hook with a little worm ready to catch a swimming fish.',
    word: { jp: 'さかな', romaji: 'sakana', meaning: 'fish', conceptIcon: '🐟' },
    hint: 'A fishing hook ready to catch a swimming fish.',
    example: { jp: 'さかな', romaji: 'sakana', en: 'fish' }
  },
  {
    char: 'し',
    romaji: 'shi',
    group: 's',
    day: 3,
    mnemonic: 'A curved wooden spoon dipping down into pure white sea salt.',
    word: { jp: 'しお', romaji: 'shio', meaning: 'salt', conceptIcon: '🧂' },
    hint: 'A curved wooden spoon scooping pure white sea salt.',
    example: { jp: 'しお', romaji: 'shio', en: 'salt' }
  },
  {
    char: 'す',
    romaji: 'su',
    group: 's',
    day: 3,
    mnemonic: 'A swirl of chopsticks rolling fresh seaweed and rice into tasty sushi.',
    word: { jp: 'すし', romaji: 'sushi', meaning: 'sushi', conceptIcon: '🍣' },
    hint: 'Chopsticks rolling fresh seaweed and rice into tasty sushi.',
    example: { jp: 'すし', romaji: 'sushi', en: 'sushi' }
  },
  {
    char: 'せ',
    romaji: 'se',
    group: 's',
    day: 3,
    mnemonic: 'A wise teacher standing proud at the front desk sharing knowledge.',
    word: { jp: 'せんせい', romaji: 'sensei', meaning: 'teacher', conceptIcon: '👨‍🏫' },
    hint: 'A wise teacher standing at the front desk teaching the class.',
    example: { jp: 'せんせい', romaji: 'sensei', en: 'teacher' }
  },
  {
    char: 'そ',
    romaji: 'so',
    group: 's',
    day: 3,
    mnemonic: 'A zigzag shooting star streaking across the vast night sky.',
    word: { jp: 'そら', romaji: 'sora', meaning: 'sky', conceptIcon: '🌌' },
    hint: 'A zigzag shooting star streaking across the vast night sky.',
    example: { jp: 'そら', romaji: 'sora', en: 'sky' }
  },

  // DAY 4: T-row (5)
  {
    char: 'た',
    romaji: 'ta',
    group: 't',
    day: 4,
    mnemonic: 'Letters "t" and "a" linked like a skillet flipping a fresh golden egg.',
    word: { jp: 'たまご', romaji: 'tamago', meaning: 'egg', conceptIcon: '🥚' },
    hint: 'Letters "t" and "a" linked like a skillet flipping a fresh egg.',
    example: { jp: 'たまご', romaji: 'tamago', en: 'egg' }
  },
  {
    char: 'ち',
    romaji: 'chi',
    group: 't',
    day: 4,
    mnemonic: 'A traveler pointing at number 5 marking the treasure on a secret map.',
    word: { jp: 'ちず', romaji: 'chizu', meaning: 'map', conceptIcon: '🗺️' },
    hint: 'A traveler pointing at number 5 marking treasure on a secret map.',
    example: { jp: 'ちず', romaji: 'chizu', en: 'map' }
  },
  {
    char: 'つ',
    romaji: 'tsu',
    group: 't',
    day: 4,
    mnemonic: 'A colossal curved tsunami wave curling upward into the sky toward the crescent moon.',
    word: { jp: 'つき', romaji: 'tsuki', meaning: 'moon', conceptIcon: '🌙' },
    hint: 'A colossal tsunami wave curling toward the crescent moon.',
    example: { jp: 'つき', romaji: 'tsuki', en: 'moon' }
  },
  {
    char: 'て',
    romaji: 'te',
    group: 't',
    day: 4,
    mnemonic: 'An open hand and wrist curved forward ready to grasp or give a high five.',
    word: { jp: 'て', romaji: 'te', meaning: 'hand', conceptIcon: '✋' },
    hint: 'An open hand and wrist curved forward ready to grasp.',
    example: { jp: 'て', romaji: 'te', en: 'hand' }
  },
  {
    char: 'と',
    romaji: 'to',
    group: 't',
    day: 4,
    mnemonic: 'The curved housing and ticking second hand of a sturdy bedside clock.',
    word: { jp: 'とけい', romaji: 'tokei', meaning: 'clock', conceptIcon: '⏰' },
    hint: 'The curved housing and ticking hand of a bedside clock.',
    example: { jp: 'とけい', romaji: 'tokei', en: 'clock' }
  },

  // DAY 5: N-row & H-row (10)
  {
    char: 'な',
    romaji: 'na',
    group: 'n',
    day: 5,
    mnemonic: 'A knot and cross swaying in warm summer breezes under golden sunflowers.',
    word: { jp: 'なつ', romaji: 'natsu', meaning: 'summer', conceptIcon: '☀️' },
    hint: 'A knot and cross swaying like sunflowers in the warm summer breeze.',
    example: { jp: 'なつ', romaji: 'natsu', en: 'summer' }
  },
  {
    char: 'に',
    romaji: 'ni',
    group: 'n',
    day: 5,
    mnemonic: 'Two grilling skewers holding a delicious cut of savory meat over hot coals.',
    word: { jp: 'にく', romaji: 'niku', meaning: 'meat', conceptIcon: '🍖' },
    hint: 'Two grilling skewers holding a cut of savory meat over coals.',
    example: { jp: 'にく', romaji: 'niku', en: 'meat' }
  },
  {
    char: 'ぬ',
    romaji: 'nu',
    group: 'n',
    day: 5,
    mnemonic: 'A knotted loop of fine thread stitching together a roll of woven cloth.',
    word: { jp: 'ぬの', romaji: 'nuno', meaning: 'cloth', conceptIcon: '🧵' },
    hint: 'A knotted loop of thread stitching a fine roll of woven cloth.',
    example: { jp: 'ぬの', romaji: 'nuno', en: 'cloth' }
  },
  {
    char: 'ね',
    romaji: 'ne',
    group: 'n',
    day: 5,
    mnemonic: 'Imagine a friendly cat with its cute curly tail looping playfully at the back.',
    word: { jp: 'ねこ', romaji: 'neko', meaning: 'cat', conceptIcon: '🐱' },
    hint: 'Imagine a friendly cat with its cute curly tail looping at the back.',
    example: { jp: 'ねこ', romaji: 'neko', en: 'cat' }
  },
  {
    char: 'の',
    romaji: 'no',
    group: 'n',
    day: 5,
    mnemonic: 'One single circular roll wrapping up crisp dark green nori seaweed.',
    word: { jp: 'のり', romaji: 'nori', meaning: 'seaweed', conceptIcon: '🌿' },
    hint: 'One circular roll wrapping up crisp dark green nori seaweed.',
    example: { jp: 'のり', romaji: 'nori', en: 'seaweed' }
  },
  {
    char: 'は',
    romaji: 'ha',
    group: 'h',
    day: 5,
    mnemonic: 'A stem and leaf supporting a delicate pink cherry blossom flower in spring.',
    word: { jp: 'はな', romaji: 'hana', meaning: 'flower', conceptIcon: '🌸' },
    hint: 'A stem and leaf supporting a delicate blooming flower.',
    example: { jp: 'はな', romaji: 'hana', en: 'flower' }
  },
  {
    char: 'ひ',
    romaji: 'hi',
    group: 'h',
    day: 5,
    mnemonic: 'The curved cockpit windshield and wings of a swift airplane ascending high.',
    word: { jp: 'ひこうき', romaji: 'hikouki', meaning: 'airplane', conceptIcon: '✈️' },
    hint: 'The curved cockpit windshield and wings of a swift airplane.',
    example: { jp: 'ひこうき', romaji: 'hikouki', en: 'airplane' }
  },
  {
    char: 'ふ',
    romaji: 'fu',
    group: 'h',
    day: 5,
    mnemonic: 'Mount Fuji on the horizon with a sturdy passenger boat cruising the blue bay.',
    word: { jp: 'ふね', romaji: 'fune', meaning: 'boat', conceptIcon: '🚢' },
    hint: 'Mount Fuji on the horizon with a passenger boat cruising the bay.',
    example: { jp: 'ふね', romaji: 'fune', en: 'boat' }
  },
  {
    char: 'へ',
    romaji: 'he',
    group: 'h',
    day: 5,
    mnemonic: 'The triangular peaked roof protecting a warm, peaceful traditional tatami room.',
    word: { jp: 'へや', romaji: 'heya', meaning: 'room', conceptIcon: '🏠' },
    hint: 'The triangular peaked roof protecting a peaceful room.',
    example: { jp: 'へや', romaji: 'heya', en: 'room' }
  },
  {
    char: 'ほ',
    romaji: 'ho',
    group: 'h',
    day: 5,
    mnemonic: 'A chimney on a rooftop looking up into the night at a shining golden star.',
    word: { jp: 'ほし', romaji: 'hoshi', meaning: 'star', conceptIcon: '⭐' },
    hint: 'A chimney on a rooftop looking up at a shining golden star.',
    example: { jp: 'ほし', romaji: 'hoshi', en: 'star' }
  },

  // DAY 6: M-row, Y-row, R-row (13)
  {
    char: 'ま',
    romaji: 'ma',
    group: 'm',
    day: 6,
    mnemonic: 'Two crossbars like the pane of a sunny open window looking outside.',
    word: { jp: 'まど', romaji: 'mado', meaning: 'window', conceptIcon: '🪟' },
    hint: 'Two crossbars like the pane of an open sunny window.',
    example: { jp: 'まど', romaji: 'mado', en: 'window' }
  },
  {
    char: 'み',
    romaji: 'mi',
    group: 'm',
    day: 6,
    mnemonic: 'Fluid cursive curves rippling like fresh, pure mountain drinking water.',
    word: { jp: 'みず', romaji: 'mizu', meaning: 'water', conceptIcon: '💧' },
    hint: 'Fluid cursive curves rippling like fresh mountain water.',
    example: { jp: 'みず', romaji: 'mizu', en: 'water' }
  },
  {
    char: 'む',
    romaji: 'mu',
    group: 'm',
    day: 6,
    mnemonic: 'A friendly cow with a nose ring going "moo" watching a tiny spotted insect.',
    word: { jp: 'むし', romaji: 'mushi', meaning: 'insect', conceptIcon: '🐞' },
    hint: 'A cow going "moo" watching a tiny spotted insect.',
    example: { jp: 'むし', romaji: 'mushi', en: 'insect' }
  },
  {
    char: 'め',
    romaji: 'me',
    group: 'm',
    day: 6,
    mnemonic: 'An open eye with curved eyelids and iris, with no knot at the bottom loop.',
    word: { jp: 'め', romaji: 'me', meaning: 'eye', conceptIcon: '👁️' },
    hint: 'An open eye with curved eyelids and iris, with no knot loop.',
    example: { jp: 'め', romaji: 'me', en: 'eye' }
  },
  {
    char: 'も',
    romaji: 'mo',
    group: 'm',
    day: 6,
    mnemonic: 'A sturdy wooden rake gathering fallen pine branches in the deep green forest.',
    word: { jp: 'もり', romaji: 'mori', meaning: 'forest', conceptIcon: '🌲' },
    hint: 'A wooden rake gathering fallen branches in the deep green forest.',
    example: { jp: 'もり', romaji: 'mori', en: 'forest' }
  },
  {
    char: 'や',
    romaji: 'ya',
    group: 'y',
    day: 6,
    mnemonic: 'The sweeping horns of an agile mountain yak standing on a high rocky summit.',
    word: { jp: 'やま', romaji: 'yama', meaning: 'mountain', conceptIcon: '🏔️' },
    hint: 'The sweeping horns of an agile yak standing on a high mountain summit.',
    example: { jp: 'やま', romaji: 'yama', en: 'mountain' }
  },
  {
    char: 'ゆ',
    romaji: 'yu',
    group: 'y',
    day: 6,
    mnemonic: 'A curved unicycle wheel spinning smoothly across a quiet blanket of fresh snow.',
    word: { jp: 'ゆき', romaji: 'yuki', meaning: 'snow', conceptIcon: '❄️' },
    hint: 'A unicycle wheel spinning smoothly across fresh white snow.',
    example: { jp: 'ゆき', romaji: 'yuki', en: 'snow' }
  },
  {
    char: 'よ',
    romaji: 'yo',
    group: 'y',
    day: 6,
    mnemonic: 'A toy yo-yo with its looped string glowing under the stars of the quiet night.',
    word: { jp: 'よる', romaji: 'yoru', meaning: 'night', conceptIcon: '🌙' },
    hint: 'A toy yo-yo with its string glowing under the stars of the night.',
    example: { jp: 'よる', romaji: 'yoru', en: 'night' }
  },
  {
    char: 'ら',
    romaji: 'ra',
    group: 'r',
    day: 6,
    mnemonic: 'A brave rabbit sitting upright on its hind legs looking face-to-face with a lion.',
    word: { jp: 'らいおん', romaji: 'raion', meaning: 'lion', conceptIcon: '🦁' },
    hint: 'A rabbit sitting on its hind legs looking face-to-face with a lion.',
    example: { jp: 'らいおん', romaji: 'raion', en: 'lion' }
  },
  {
    char: 'り',
    romaji: 'ri',
    group: 'r',
    day: 6,
    mnemonic: 'Two river reeds swaying gracefully beside an orchard of crisp red apples.',
    word: { jp: 'りんご', romaji: 'ringo', meaning: 'apple', conceptIcon: '🍎' },
    hint: 'Two river reeds swaying beside an orchard of red apples.',
    example: { jp: 'りんご', romaji: 'ringo', en: 'apple' }
  },
  {
    char: 'る',
    romaji: 'ru',
    group: 'r',
    day: 6,
    mnemonic: 'A winding country road with a circular loop leading through a blooming spring garden.',
    word: { jp: 'はる', romaji: 'haru', meaning: 'spring', conceptIcon: '🌸' },
    hint: 'A winding country road with a loop leading through blooming spring.',
    example: { jp: 'はる', romaji: 'haru', en: 'spring' }
  },
  {
    char: 'れ',
    romaji: 're',
    group: 'r',
    day: 6,
    mnemonic: 'A tall icebox cabinet with a handle door cooling drinks in the refrigerator.',
    word: { jp: 'れいぞうこ', romaji: 'reizouko', meaning: 'refrigerator', conceptIcon: '🧊' },
    hint: 'A tall icebox cabinet with a handle door on the refrigerator.',
    example: { jp: 'れいぞうこ', romaji: 'reizouko', en: 'refrigerator' }
  },
  {
    char: 'ろ',
    romaji: 'ro',
    group: 'r',
    day: 6,
    mnemonic: 'A smooth open road with no bottom loop, illuminated by a warm burning candle.',
    word: { jp: 'ろうそく', romaji: 'rousoku', meaning: 'candle', conceptIcon: '🕯️' },
    hint: 'A smooth open road with no loop illuminated by a burning candle.',
    example: { jp: 'ろうそく', romaji: 'rousoku', en: 'candle' }
  },

  // DAY 7: W-row & N (3)
  {
    char: 'わ',
    romaji: 'wa',
    group: 'w-n',
    day: 7,
    mnemonic: 'A wide open reptile mouth with curved teeth resembling a sunbathing crocodile.',
    word: { jp: 'わに', romaji: 'wani', meaning: 'crocodile', conceptIcon: '🐊' },
    hint: 'A wide open reptile mouth resembling a sunbathing crocodile.',
    example: { jp: 'わに', romaji: 'wani', en: 'crocodile' }
  },
  {
    char: 'を',
    romaji: 'wo',
    group: 'w-n',
    day: 7,
    mnemonic: 'The Japanese action particle! Skater taking a refreshing sip: "drink water".',
    word: { jp: 'みず を のむ', romaji: 'mizu o nomu', meaning: 'drink water', conceptIcon: '💧' },
    hint: 'The Japanese action particle! Phrase: "mizu o nomu" (drink water).',
    example: { jp: 'みず を のむ', romaji: 'mizu o nomu', en: 'drink water' }
  },
  {
    char: 'ん',
    romaji: 'n',
    group: 'w-n',
    day: 7,
    mnemonic: 'A stylish lowercase cursive "n" opening the wide pages of a fascinating book.',
    word: { jp: 'ほん', romaji: 'hon', meaning: 'book', conceptIcon: '📕' },
    hint: 'A stylish cursive "n" opening the pages of a fascinating book.',
    example: { jp: 'ほん', romaji: 'hon', en: 'book' }
  }
];

export const DAY_INFO: Record<number, { title: string; subtitle: string; chars: string[]; icon: string }> = {
  1: {
    title: 'The Vowels',
    subtitle: 'Foundation of all Japanese sounds',
    chars: ['あ', 'い', 'う', 'え', 'お'],
    icon: '☀️'
  },
  2: {
    title: 'The K-Line',
    subtitle: 'Sharp, rhythmic consonant sounds',
    chars: ['か', 'き', 'く', 'け', 'こ'],
    icon: '⚔️'
  },
  3: {
    title: 'The S-Line',
    subtitle: 'Smooth, whispering syllables',
    chars: ['さ', 'し', 'す', 'せ', 'そ'],
    icon: '🌸'
  },
  4: {
    title: 'The T-Line',
    subtitle: 'Clear, dynamic taps and beats',
    chars: ['た', 'ち', 'つ', 'て', 'と'],
    icon: '🌙'
  },
  5: {
    title: 'The N & H Lines',
    subtitle: 'Gentle nasal and airy syllables',
    chars: ['な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ'],
    icon: '🐱'
  },
  6: {
    title: 'The M, Y & R Lines',
    subtitle: 'Flowing liquids and glides',
    chars: ['ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ'],
    icon: '🏔️'
  },
  7: {
    title: 'The W & N Finale',
    subtitle: 'The final characters of the syllabary',
    chars: ['わ', 'を', 'ん'],
    icon: '⛩️'
  }
};

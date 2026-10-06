import { UserProgress } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (progress: UserProgress) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_character',
    title: 'First Character',
    description: 'Learn your first Hiragana character and memory trick',
    icon: '🌱',
    isUnlocked: (p) => Object.keys(p.characters).length >= 1
  },
  {
    id: 'streak_3',
    title: 'Fire Inside',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    isUnlocked: (p) => p.streak >= 3 || p.bestStreak >= 3
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Earn over 200 XP from training and mini-games',
    icon: '⚡',
    isUnlocked: (p) => p.totalXp >= 200
  },
  {
    id: 'boss_slayer',
    title: 'Guardian Defeated',
    description: 'Conquer your first Daily Boss battle',
    icon: '👹',
    isUnlocked: (p) => Object.keys(p.bossScores).length >= 1
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Reach maximum memory strength on at least 5 characters',
    icon: '🧠',
    isUnlocked: (p) => Object.values(p.characters).filter(c => (c.memoryStrength || 0) >= 4).length >= 5
  },
  {
    id: 'hiragana_master',
    title: 'Hiragana Master',
    description: 'Conquer the 7-day journey and The Final Trial',
    icon: '🏆',
    isUnlocked: (p) => p.finalChallengeCompleted || p.completedDays.length >= 7
  }
];

export function getPlayerRank(totalXp: number): { level: number; title: string; nextLevelXp: number; currentLevelXp: number } {
  if (totalXp < 100) {
    return { level: 1, title: 'Kana Novice', currentLevelXp: totalXp, nextLevelXp: 100 };
  } else if (totalXp < 300) {
    return { level: 2, title: 'Kana Wanderer', currentLevelXp: totalXp - 100, nextLevelXp: 200 };
  } else if (totalXp < 600) {
    return { level: 3, title: 'Kana Ronin', currentLevelXp: totalXp - 300, nextLevelXp: 300 };
  } else if (totalXp < 1000) {
    return { level: 4, title: 'Kana Samurai', currentLevelXp: totalXp - 600, nextLevelXp: 400 };
  } else if (totalXp < 1600) {
    return { level: 5, title: 'Kana Sensei', currentLevelXp: totalXp - 1000, nextLevelXp: 600 };
  } else {
    return { level: 6, title: 'Hiragana Master', currentLevelXp: totalXp - 1600, nextLevelXp: 1000 };
  }
}

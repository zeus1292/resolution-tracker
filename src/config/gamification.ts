import { Badge, DeadlineType } from '../types';

// Points awarded per completion based on deadline type
export const BASE_POINTS: Record<DeadlineType, number> = {
  daily: 10,
  weekly: 50,
  monthly: 200,
  quarterly: 500,
  custom: 100,
};

// Streak multipliers - higher streaks = more points
export const STREAK_MULTIPLIERS: Record<number, number> = {
  0: 1.0,    // No streak
  3: 1.25,   // 3-day streak: 25% bonus
  7: 1.5,    // 7-day streak: 50% bonus
  14: 1.75,  // 14-day streak: 75% bonus
  30: 2.0,   // 30-day streak: 100% bonus (2x)
  60: 2.5,   // 60-day streak: 150% bonus
  90: 3.0,   // 90-day streak: 200% bonus (3x)
};

// Cost to protect streak (in points)
export const STREAK_PROTECTION_COST = 50;

// Streak milestones for badges
export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

// Badge definitions - focused on streaks
export const BADGES: Badge[] = [
  // Streak badges
  {
    id: 'streak_7',
    name: '1 Week Strong',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 7 },
    rarity: 'common',
    pointsAwarded: 50,
    sortOrder: 1,
  },
  {
    id: 'streak_14',
    name: '2 Weeks Solid',
    description: 'Maintain a 14-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 14 },
    rarity: 'common',
    pointsAwarded: 100,
    sortOrder: 2,
  },
  {
    id: 'streak_30',
    name: '1 Month Champion',
    description: 'Maintain a 30-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 30 },
    rarity: 'rare',
    pointsAwarded: 200,
    sortOrder: 3,
  },
  {
    id: 'streak_60',
    name: '2 Months Strong',
    description: 'Maintain a 60-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 60 },
    rarity: 'rare',
    pointsAwarded: 400,
    sortOrder: 4,
  },
  {
    id: 'streak_90',
    name: '3 Months Legend',
    description: 'Maintain a 90-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 90 },
    rarity: 'epic',
    pointsAwarded: 600,
    sortOrder: 5,
  },
  {
    id: 'streak_180',
    name: '6 Months Elite',
    description: 'Maintain a 180-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 180 },
    rarity: 'epic',
    pointsAwarded: 1000,
    sortOrder: 6,
  },
  {
    id: 'streak_365',
    name: 'Year of Dedication',
    description: 'Maintain a 365-day streak',
    icon: 'trophy',
    category: 'streak',
    criteria: { type: 'streak', threshold: 365 },
    rarity: 'legendary',
    pointsAwarded: 2000,
    sortOrder: 7,
  },

  // Completion milestones
  {
    id: 'complete_10',
    name: 'Getting Started',
    description: 'Complete 10 goals',
    icon: 'checkmark-circle',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 10 },
    rarity: 'common',
    pointsAwarded: 25,
    sortOrder: 10,
  },
  {
    id: 'complete_50',
    name: 'Consistent',
    description: 'Complete 50 goals',
    icon: 'checkmark-circle',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 50 },
    rarity: 'common',
    pointsAwarded: 75,
    sortOrder: 11,
  },
  {
    id: 'complete_100',
    name: 'Century Club',
    description: 'Complete 100 goals',
    icon: 'ribbon',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 100 },
    rarity: 'rare',
    pointsAwarded: 150,
    sortOrder: 12,
  },
  {
    id: 'complete_500',
    name: 'High Achiever',
    description: 'Complete 500 goals',
    icon: 'star',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 500 },
    rarity: 'epic',
    pointsAwarded: 400,
    sortOrder: 13,
  },
  {
    id: 'complete_1000',
    name: 'Goal Master',
    description: 'Complete 1000 goals',
    icon: 'trophy',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 1000 },
    rarity: 'legendary',
    pointsAwarded: 1000,
    sortOrder: 14,
  },

  // Partner badges
  {
    id: 'partner_link',
    name: 'Accountability Buddy',
    description: 'Link with a partner',
    icon: 'people',
    category: 'partner',
    criteria: { type: 'partner_challenge', threshold: 1 },
    rarity: 'common',
    pointsAwarded: 50,
    sortOrder: 20,
  },
  {
    id: 'partner_win_1',
    name: 'First Victory',
    description: 'Win your first partner challenge',
    icon: 'medal',
    category: 'partner',
    criteria: { type: 'partner_challenge', threshold: 1 },
    rarity: 'common',
    pointsAwarded: 75,
    sortOrder: 21,
  },
  {
    id: 'partner_win_5',
    name: 'Competitive Spirit',
    description: 'Win 5 partner challenges',
    icon: 'medal',
    category: 'partner',
    criteria: { type: 'partner_challenge', threshold: 5 },
    rarity: 'rare',
    pointsAwarded: 150,
    sortOrder: 22,
  },

  // Special badges
  {
    id: 'streak_protected',
    name: 'Streak Saver',
    description: 'Use points to protect your streak',
    icon: 'shield',
    category: 'special',
    criteria: { type: 'special', threshold: 1 },
    rarity: 'common',
    pointsAwarded: 25,
    sortOrder: 30,
  },
];

// Helper functions

/**
 * Calculate points for a completion based on deadline type and current streak
 */
export function calculatePoints(
  deadlineType: DeadlineType,
  currentStreak: number
): number {
  const basePoints = BASE_POINTS[deadlineType];

  // Find applicable streak multiplier
  const streakLevels = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);

  const applicableLevel = streakLevels.find((level) => currentStreak >= level) ?? 0;
  const multiplier = STREAK_MULTIPLIERS[applicableLevel];

  return Math.floor(basePoints * multiplier);
}

/**
 * Get streak multiplier for display
 */
export function getStreakMultiplier(streak: number): number {
  const streakLevels = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);

  const applicableLevel = streakLevels.find((level) => streak >= level) ?? 0;
  return STREAK_MULTIPLIERS[applicableLevel];
}

/**
 * Get next streak milestone
 */
export function getNextStreakMilestone(currentStreak: number): number | null {
  return STREAK_MILESTONES.find((m) => m > currentStreak) ?? null;
}

/**
 * Get badge by ID
 */
export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find((b) => b.id === badgeId);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return BADGES.filter((b) => b.category === category).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

/**
 * Check if user can afford streak protection
 */
export function canAffordStreakProtection(points: number): boolean {
  return points >= STREAK_PROTECTION_COST;
}

// Deprecated - keeping for backwards compatibility but not used
export const LEVELS = [];
export function getLevelFromPoints(_points: number) {
  return { level: 1, minPoints: 0, maxPoints: Infinity, title: '', color: '#6366F1' };
}
export function getProgressToNextLevel(_points: number) {
  return 0;
}

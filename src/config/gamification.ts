import { Badge, LevelInfo, DeadlineType } from '../types';

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

// Bonus points for special achievements
export const BONUS_POINTS = {
  firstCompletionOfDay: 5,
  allDailyCompleted: 25,
  weekendWarrior: 15,   // Complete on both Saturday AND Sunday
  earlyBird: 10,        // Complete before 9 AM
  nightOwl: 10,         // Complete after 9 PM
};

// Level progression
export const LEVELS: LevelInfo[] = [
  { level: 1, minPoints: 0, maxPoints: 99, title: 'Newcomer', color: '#9CA3AF' },
  { level: 2, minPoints: 100, maxPoints: 299, title: 'Beginner', color: '#10B981' },
  { level: 3, minPoints: 300, maxPoints: 599, title: 'Committed', color: '#3B82F6' },
  { level: 4, minPoints: 600, maxPoints: 999, title: 'Dedicated', color: '#8B5CF6' },
  { level: 5, minPoints: 1000, maxPoints: 1499, title: 'Achiever', color: '#F59E0B' },
  { level: 6, minPoints: 1500, maxPoints: 2499, title: 'Champion', color: '#EF4444' },
  { level: 7, minPoints: 2500, maxPoints: 3999, title: 'Master', color: '#EC4899' },
  { level: 8, minPoints: 4000, maxPoints: 5999, title: 'Legend', color: '#6366F1' },
  { level: 9, minPoints: 6000, maxPoints: 9999, title: 'Elite', color: '#14B8A6' },
  { level: 10, minPoints: 10000, maxPoints: Infinity, title: 'Unstoppable', color: '#FFD700' },
];

// Badge definitions
export const BADGES: Badge[] = [
  // Streak badges
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 3 },
    rarity: 'common',
    pointsAwarded: 25,
    sortOrder: 1,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 7 },
    rarity: 'common',
    pointsAwarded: 50,
    sortOrder: 2,
  },
  {
    id: 'streak_14',
    name: 'Two Week Titan',
    description: 'Maintain a 14-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 14 },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 3,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 30 },
    rarity: 'rare',
    pointsAwarded: 200,
    sortOrder: 4,
  },
  {
    id: 'streak_60',
    name: 'Relentless',
    description: 'Maintain a 60-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 60 },
    rarity: 'epic',
    pointsAwarded: 400,
    sortOrder: 5,
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    icon: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 100 },
    rarity: 'epic',
    pointsAwarded: 500,
    sortOrder: 6,
  },
  {
    id: 'streak_365',
    name: 'Year of Dedication',
    description: 'Maintain a 365-day streak',
    icon: 'crown',
    category: 'streak',
    criteria: { type: 'streak', threshold: 365 },
    rarity: 'legendary',
    pointsAwarded: 2000,
    sortOrder: 7,
  },

  // Completion badges
  {
    id: 'complete_10',
    name: 'First Steps',
    description: 'Complete 10 goals',
    icon: 'check',
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
    icon: 'check-circle',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 50 },
    rarity: 'common',
    pointsAwarded: 75,
    sortOrder: 11,
  },
  {
    id: 'complete_100',
    name: 'Century',
    description: 'Complete 100 goals',
    icon: 'trophy',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 100 },
    rarity: 'rare',
    pointsAwarded: 150,
    sortOrder: 12,
  },
  {
    id: 'complete_250',
    name: 'Determined',
    description: 'Complete 250 goals',
    icon: 'trophy',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 250 },
    rarity: 'rare',
    pointsAwarded: 250,
    sortOrder: 13,
  },
  {
    id: 'complete_500',
    name: 'High Achiever',
    description: 'Complete 500 goals',
    icon: 'award',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 500 },
    rarity: 'epic',
    pointsAwarded: 400,
    sortOrder: 14,
  },
  {
    id: 'complete_1000',
    name: 'Goal Machine',
    description: 'Complete 1000 goals',
    icon: 'star',
    category: 'completion',
    criteria: { type: 'total_completions', threshold: 1000 },
    rarity: 'legendary',
    pointsAwarded: 1000,
    sortOrder: 15,
  },

  // Points badges
  {
    id: 'points_500',
    name: 'Point Collector',
    description: 'Earn 500 points',
    icon: 'coins',
    category: 'points',
    criteria: { type: 'points', threshold: 500 },
    rarity: 'common',
    pointsAwarded: 25,
    sortOrder: 20,
  },
  {
    id: 'points_1000',
    name: 'Point Gatherer',
    description: 'Earn 1000 points',
    icon: 'coins',
    category: 'points',
    criteria: { type: 'points', threshold: 1000 },
    rarity: 'common',
    pointsAwarded: 50,
    sortOrder: 21,
  },
  {
    id: 'points_2500',
    name: 'Point Hoarder',
    description: 'Earn 2500 points',
    icon: 'gem',
    category: 'points',
    criteria: { type: 'points', threshold: 2500 },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 22,
  },
  {
    id: 'points_5000',
    name: 'Point Baron',
    description: 'Earn 5000 points',
    icon: 'gem',
    category: 'points',
    criteria: { type: 'points', threshold: 5000 },
    rarity: 'epic',
    pointsAwarded: 250,
    sortOrder: 23,
  },
  {
    id: 'points_10000',
    name: 'Point Master',
    description: 'Earn 10000 points',
    icon: 'crown',
    category: 'points',
    criteria: { type: 'points', threshold: 10000 },
    rarity: 'legendary',
    pointsAwarded: 500,
    sortOrder: 24,
  },

  // Partner badges
  {
    id: 'partner_link',
    name: 'Accountability Buddy',
    description: 'Link with a partner',
    icon: 'users',
    category: 'partner',
    criteria: { type: 'partner_challenge', threshold: 1 },
    rarity: 'common',
    pointsAwarded: 50,
    sortOrder: 30,
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
    sortOrder: 31,
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
    sortOrder: 32,
  },
  {
    id: 'partner_win_10',
    name: 'Dominant Force',
    description: 'Win 10 partner challenges',
    icon: 'trophy',
    category: 'partner',
    criteria: { type: 'partner_challenge', threshold: 10 },
    rarity: 'epic',
    pointsAwarded: 300,
    sortOrder: 33,
  },

  // Theme mastery badges
  {
    id: 'health_master',
    name: 'Health Champion',
    description: 'Complete 50 Health goals',
    icon: 'heart',
    category: 'special',
    criteria: { type: 'theme_mastery', threshold: 50, themeId: 'health' },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 40,
  },
  {
    id: 'finance_master',
    name: 'Money Manager',
    description: 'Complete 50 Finance goals',
    icon: 'dollar-sign',
    category: 'special',
    criteria: { type: 'theme_mastery', threshold: 50, themeId: 'finance' },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 41,
  },
  {
    id: 'career_master',
    name: 'Career Builder',
    description: 'Complete 50 Career goals',
    icon: 'briefcase',
    category: 'special',
    criteria: { type: 'theme_mastery', threshold: 50, themeId: 'career' },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 42,
  },
  {
    id: 'mindfulness_master',
    name: 'Zen Master',
    description: 'Complete 50 Mindfulness goals',
    icon: 'sun',
    category: 'special',
    criteria: { type: 'theme_mastery', threshold: 50, themeId: 'mindfulness' },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 43,
  },

  // Level badges
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: 'star',
    category: 'special',
    criteria: { type: 'level', threshold: 5 },
    rarity: 'rare',
    pointsAwarded: 100,
    sortOrder: 50,
  },
  {
    id: 'level_10',
    name: 'Ultimate Achiever',
    description: 'Reach Level 10',
    icon: 'crown',
    category: 'special',
    criteria: { type: 'level', threshold: 10 },
    rarity: 'legendary',
    pointsAwarded: 500,
    sortOrder: 51,
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
 * Get level info from total points
 */
export function getLevelFromPoints(points: number): LevelInfo {
  const level = LEVELS.find(
    (l) => points >= l.minPoints && points <= l.maxPoints
  );
  return level ?? LEVELS[0];
}

/**
 * Calculate progress percentage to next level
 */
export function getProgressToNextLevel(points: number): number {
  const currentLevel = getLevelFromPoints(points);

  // Max level reached
  if (currentLevel.level === 10) return 100;

  const pointsInLevel = points - currentLevel.minPoints;
  const levelRange = currentLevel.maxPoints - currentLevel.minPoints + 1;

  return Math.floor((pointsInLevel / levelRange) * 100);
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
  const milestones = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => a - b);

  return milestones.find((m) => m > currentStreak) ?? null;
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

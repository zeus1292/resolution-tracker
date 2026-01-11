import { Timestamp } from 'firebase/firestore';
import { ThemeId } from './resolution.types';

export type BadgeCategory = 'streak' | 'completion' | 'points' | 'partner' | 'special';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeCriteriaType =
  | 'streak'
  | 'total_completions'
  | 'points'
  | 'partner_challenge'
  | 'theme_mastery'
  | 'level'
  | 'special';

export interface BadgeCriteria {
  type: BadgeCriteriaType;
  threshold: number;
  themeId?: ThemeId;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  criteria: BadgeCriteria;
  rarity: BadgeRarity;
  pointsAwarded: number;
  sortOrder: number;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: Timestamp;
  notified: boolean;
}

export interface LevelInfo {
  level: number;
  minPoints: number;
  maxPoints: number;
  title: string;
  color: string;
}

export interface StreakEntry {
  date: string; // "YYYY-MM-DD" format
  completedResolutions: string[];
  pointsEarned: number;
}

export interface GamificationStats {
  points: number;
  level: number;
  levelInfo: LevelInfo;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  progressToNextLevel: number;
  earnedBadges: UserBadge[];
}

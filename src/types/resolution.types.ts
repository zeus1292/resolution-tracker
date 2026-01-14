import { Timestamp } from 'firebase/firestore';

export type DeadlineType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';

export type ThemeId =
  | 'health'
  | 'finance'
  | 'career'
  | 'learning'
  | 'creativity'
  | 'travel';

export interface Resolution {
  id: string;
  userId: string;

  // Content
  title: string;
  description: string | null;
  themeId: ThemeId;

  // Deadline configuration
  deadlineType: DeadlineType;
  customDeadline: Timestamp | null;

  // Status
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Tracking metadata
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompletedAt: Timestamp | null;

  // Points configuration
  pointsPerCompletion: number;

  // Partner visibility
  sharedWithPartner: boolean;
}

export interface ResolutionCreateInput {
  title: string;
  description?: string | null;
  themeId: ThemeId;
  deadlineType: DeadlineType;
  customDeadline?: Date | null;
  sharedWithPartner?: boolean;
}

export interface ResolutionUpdateInput {
  title?: string;
  description?: string | null;
  themeId?: ThemeId;
  deadlineType?: DeadlineType;
  customDeadline?: Date | null;
  sharedWithPartner?: boolean;
  isActive?: boolean;
}

export interface Completion {
  id: string;
  resolutionId: string;
  completedAt: Timestamp;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  pointsEarned: number;
  streakAtCompletion: number;
}

export interface Theme {
  id: ThemeId;
  name: string;
  icon: string;
  color: string;
  description: string;
  sortOrder: number;
}

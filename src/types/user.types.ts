import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  timezone: string;

  // Partner relationship
  partnerId: string | null;
  partnerStatus: PartnerStatus;
  partnerSince: Timestamp | null;

  // Gamification summary (denormalized for quick access)
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;

  // Notification settings
  notifications: NotificationSettings;

  // Push token for Expo notifications
  expoPushToken: string | null;

  // Onboarding status
  onboardingComplete: boolean;
}

export type PartnerStatus = 'none' | 'pending_sent' | 'pending_received' | 'active';

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string; // "HH:mm" format
  partnerActivity: boolean;
  achievements: boolean;
}

export interface UserCreateInput {
  email: string;
  displayName: string;
  photoURL?: string | null;
}

// App-wide constants

export const APP_NAME = 'Resolution Tracker';
export const APP_VERSION = '1.0.0';

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  RESOLUTIONS: 'resolutions',
  COMPLETIONS: 'completions',
  BADGES: 'badges',
  STREAK_HISTORY: 'streakHistory',
  PARTNER_INVITES: 'partnerInvites',
  PARTNER_CHALLENGES: 'partnerChallenges',
  THEMES: 'themes',
  CONFIG: 'config',
} as const;

// Partner invite settings
export const INVITE_CODE_LENGTH = 6;
export const INVITE_EXPIRY_DAYS = 7;

// Notification defaults
export const DEFAULT_REMINDER_TIME = '09:00';

// Pagination
export const PAGE_SIZE = 20;

// Date formats
export const DATE_FORMATS = {
  STREAK_KEY: 'yyyy-MM-dd',
  DISPLAY_DATE: 'MMM d, yyyy',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_DATETIME: 'MMM d, yyyy h:mm a',
} as const;

// Deadline periods (in days)
export const DEADLINE_PERIODS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
} as const;

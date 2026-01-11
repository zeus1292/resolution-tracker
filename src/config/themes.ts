import { Theme, ThemeId } from '../types';
import { colors } from '../theme';

export const RESOLUTION_THEMES: Record<ThemeId, Theme> = {
  health: {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'heart',
    color: colors.themes.health,
    description: 'Exercise, nutrition, sleep, and wellness goals',
    sortOrder: 1,
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    icon: 'dollar-sign',
    color: colors.themes.finance,
    description: 'Saving, investing, budgeting, and financial goals',
    sortOrder: 2,
  },
  career: {
    id: 'career',
    name: 'Career',
    icon: 'briefcase',
    color: colors.themes.career,
    description: 'Professional development and work goals',
    sortOrder: 3,
  },
  personal: {
    id: 'personal',
    name: 'Personal Growth',
    icon: 'user',
    color: colors.themes.personal,
    description: 'Self-improvement and personal development',
    sortOrder: 4,
  },
  relationships: {
    id: 'relationships',
    name: 'Relationships',
    icon: 'users',
    color: colors.themes.relationships,
    description: 'Family, friends, and social connections',
    sortOrder: 5,
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: 'book-open',
    color: colors.themes.education,
    description: 'Learning, courses, and skill development',
    sortOrder: 6,
  },
  creativity: {
    id: 'creativity',
    name: 'Creativity',
    icon: 'palette',
    color: colors.themes.creativity,
    description: 'Art, music, writing, and creative pursuits',
    sortOrder: 7,
  },
  mindfulness: {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: 'sun',
    color: colors.themes.mindfulness,
    description: 'Meditation, journaling, and mental wellness',
    sortOrder: 8,
  },
};

export const THEME_LIST = Object.values(RESOLUTION_THEMES).sort(
  (a, b) => a.sortOrder - b.sortOrder
);

export function getTheme(themeId: ThemeId): Theme {
  return RESOLUTION_THEMES[themeId];
}

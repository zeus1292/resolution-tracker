import { Theme, ThemeId } from '../types';
import { colors } from '../theme';

export const RESOLUTION_THEMES: Record<ThemeId, Theme> = {
  health: {
    id: 'health',
    name: 'Health',
    icon: 'heart',
    color: colors.themes.health,
    description: 'Exercise, nutrition, sleep, and wellness goals',
    sortOrder: 1,
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    icon: 'cash',
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
  learning: {
    id: 'learning',
    name: 'Learning',
    icon: 'book',
    color: colors.themes.learning,
    description: 'Education, courses, and skill development',
    sortOrder: 4,
  },
  creativity: {
    id: 'creativity',
    name: 'Creativity',
    icon: 'color-palette',
    color: colors.themes.creativity,
    description: 'Art, music, writing, and creative pursuits',
    sortOrder: 5,
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    icon: 'airplane',
    color: colors.themes.travel,
    description: 'Adventures, trips, and exploration goals',
    sortOrder: 6,
  },
};

export const THEME_LIST = Object.values(RESOLUTION_THEMES).sort(
  (a, b) => a.sortOrder - b.sortOrder
);

export function getTheme(themeId: ThemeId): Theme {
  return RESOLUTION_THEMES[themeId];
}

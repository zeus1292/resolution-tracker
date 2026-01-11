export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

export type { ThemeColors } from './colors';
export type { Typography } from './typography';
export type { Spacing, BorderRadius, Shadows } from './spacing';

// Convenience object for importing entire theme
export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  shadows: require('./spacing').shadows,
} as const;

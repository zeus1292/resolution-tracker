import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Resolution } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ThemeGroupProps {
  theme: Theme;
  resolutions: Resolution[];
  completionStatus: Record<string, boolean>;
  onToggleComplete: (resolutionId: string, isCompleted: boolean) => Promise<void>;
  renderResolutionCard: (
    resolution: Resolution,
    isCompleted: boolean,
    onToggleComplete: (resolutionId: string, isCompleted: boolean) => Promise<void>
  ) => React.ReactNode;
  defaultExpanded?: boolean;
}

export function ThemeGroup({
  theme,
  resolutions,
  completionStatus,
  onToggleComplete,
  renderResolutionCard,
  defaultExpanded = true,
}: ThemeGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedCount = resolutions.filter(
    (r) => completionStatus[r.id]
  ).length;
  const totalCount = resolutions.length;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Group Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.color + '20' },
            ]}
          >
            <Ionicons
              name={theme.icon as any}
              size={18}
              color={theme.color}
            />
          </View>
          <Text style={styles.themeName}>{theme.name}</Text>
          <View style={[styles.countBadge, { backgroundColor: theme.color + '15' }]}>
            <Text style={[styles.countText, { color: theme.color }]}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
                backgroundColor: theme.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Resolutions List */}
      {isExpanded && (
        <View style={styles.resolutionsList}>
          {resolutions.map((resolution) =>
            renderResolutionCard(
              resolution,
              completionStatus[resolution.id] ?? false,
              onToggleComplete
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[1],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  countBadge: {
    paddingVertical: spacing[0.5],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.full,
  },
  countText: {
    ...typography.styles.caption,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: spacing[1],
    marginBottom: spacing[2],
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  resolutionsList: {
    marginTop: spacing[1],
  },
});

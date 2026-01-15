import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Resolution } from '../../types';
import { getTheme } from '../../config/themes';

interface ResolutionCardProps {
  resolution: Resolution;
  isCompleted: boolean;
  onToggleComplete: (resolutionId: string, isCompleted: boolean) => Promise<void>;
  onPress?: () => void;
}

// Fallback theme for old/unknown theme IDs
const FALLBACK_THEME = {
  id: 'unknown',
  name: 'General',
  icon: 'flag',
  color: '#6366F1',
  description: 'General goal',
  sortOrder: 99,
};

export function ResolutionCard({
  resolution,
  isCompleted,
  onToggleComplete,
  onPress,
}: ResolutionCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const theme = getTheme(resolution.themeId) || FALLBACK_THEME;

  useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  const handleToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    setLocalCompleted(!localCompleted);

    try {
      await onToggleComplete(resolution.id, !localCompleted);
    } catch {
      // Revert on error
      setLocalCompleted(localCompleted);
    } finally {
      setIsToggling(false);
    }
  };

  const getDeadlineLabel = () => {
    switch (resolution.deadlineType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'custom':
        return 'Custom';
      default:
        return '';
    }
  };

  return (
    <Card
      style={[styles.card, localCompleted && styles.cardCompleted]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Completion Toggle */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            localCompleted && styles.checkboxCompleted,
            { borderColor: localCompleted ? colors.success[500] : theme.color },
          ]}
          onPress={handleToggle}
          disabled={isToggling}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color={colors.success[500]} />
          ) : localCompleted ? (
            <Ionicons name="checkmark" size={18} color={colors.text.inverse} />
          ) : null}
        </TouchableOpacity>

        {/* Resolution Info */}
        <View style={styles.info}>
          <Text
            style={[styles.title, localCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {resolution.title}
          </Text>

          <View style={styles.meta}>
            {/* Theme Badge */}
            <View style={[styles.badge, { backgroundColor: theme.color + '20' }]}>
              <Ionicons
                name={theme.icon as any}
                size={12}
                color={theme.color}
              />
              <Text style={[styles.badgeText, { color: theme.color }]}>
                {theme.name.split(' ')[0]}
              </Text>
            </View>

            {/* Deadline Badge */}
            <View style={styles.badge}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.text.tertiary}
              />
              <Text style={styles.badgeText}>{getDeadlineLabel()}</Text>
            </View>

            {/* Streak */}
            {resolution.currentStreak > 0 && (
              <View style={[styles.badge, styles.streakBadge]}>
                <Ionicons
                  name="flame"
                  size={12}
                  color={colors.streak.fire}
                />
                <Text style={[styles.badgeText, { color: colors.streak.fire }]}>
                  {resolution.currentStreak}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Points */}
        <View style={styles.points}>
          <Text style={styles.pointsValue}>+{resolution.pointsPerCompletion}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
  },
  cardCompleted: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  checkboxCompleted: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing[1],
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing[0.5],
    paddingHorizontal: spacing[1.5],
    borderRadius: borderRadius.sm,
    gap: spacing[1],
  },
  badgeText: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  streakBadge: {
    backgroundColor: colors.secondary[50],
  },
  points: {
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  pointsValue: {
    ...typography.styles.bodySmall,
    color: colors.success[600],
    fontWeight: '700',
  },
  pointsLabel: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    fontSize: 10,
  },
});

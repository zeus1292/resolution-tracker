import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useResolutions } from '../../src/hooks/useResolutions';
import { Card } from '../../src/components/common';
import { ResolutionCard } from '../../src/components/resolutions';
import { resolutionService } from '../../src/services/resolution.service';
import { getLevelFromPoints } from '../../src/config/gamification';
import { colors, typography, spacing } from '../../src/theme';

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const { resolutions, completeResolution, uncompleteResolution } = useResolutions();

  const [refreshing, setRefreshing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});

  const displayName = user?.displayName?.split(' ')[0] || 'there';
  const currentStreak = user?.currentStreak || 0;
  const points = user?.points || 0;
  const level = user?.level || 1;
  const levelInfo = getLevelFromPoints(points);

  // Get today's resolutions (daily goals)
  const todaysResolutions = resolutions.filter(
    (r) => r.deadlineType === 'daily'
  );

  // Check completion status for today's resolutions
  useEffect(() => {
    const checkCompletions = async () => {
      if (!user?.id || todaysResolutions.length === 0) return;

      const statuses: Record<string, boolean> = {};
      for (const resolution of todaysResolutions) {
        try {
          const isCompleted = await resolutionService.isCompletedForPeriod(
            user.id,
            resolution.id,
            resolution.deadlineType,
            resolution.customDeadline?.toDate()
          );
          statuses[resolution.id] = isCompleted;
        } catch {
          statuses[resolution.id] = false;
        }
      }
      setCompletionStatus(statuses);
    };

    checkCompletions();
  }, [user?.id, todaysResolutions.length]);

  const completedCount = Object.values(completionStatus).filter(Boolean).length;
  const totalCount = todaysResolutions.length;

  const handleToggleComplete = useCallback(
    async (resolutionId: string, shouldComplete: boolean) => {
      if (shouldComplete) {
        const result = await completeResolution(resolutionId);
        if (result) {
          setCompletionStatus((prev) => ({ ...prev, [resolutionId]: true }));
          refreshUser();
        }
      } else {
        const success = await uncompleteResolution(resolutionId);
        if (success) {
          setCompletionStatus((prev) => ({ ...prev, [resolutionId]: false }));
          refreshUser();
        }
      }
    },
    [completeResolution, uncompleteResolution, refreshUser]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshUser]);

  const handleAddGoal = () => {
    router.push('/(modals)/resolution-form');
  };

  const handleInvitePartner = () => {
    router.push('/(tabs)/partner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {displayName}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame" size={24} color={colors.streak.fire} />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success[50] }]}>
              <Ionicons name="star" size={24} color={colors.success[500]} />
            </View>
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: levelInfo.color + '20' }]}>
              <Ionicons name="trophy" size={24} color={levelInfo.color} />
            </View>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>{levelInfo.title}</Text>
          </Card>
        </View>

        {/* Today's Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Goals</Text>
            {totalCount > 0 && (
              <Text style={styles.progressText}>
                {completedCount}/{totalCount} done
              </Text>
            )}
          </View>

          {todaysResolutions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyTitle}>No daily goals yet</Text>
              <Text style={styles.emptySubtitle}>
                Add daily goals to track your progress!
              </Text>
            </Card>
          ) : (
            <View>
              {todaysResolutions.map((resolution) => (
                <ResolutionCard
                  key={resolution.id}
                  resolution={resolution}
                  isCompleted={completionStatus[resolution.id] ?? false}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Card style={styles.actionCard} onPress={handleAddGoal}>
              <Ionicons name="add-circle" size={32} color={colors.primary[500]} />
              <Text style={styles.actionLabel}>Add Goal</Text>
            </Card>
            <Card style={styles.actionCard} onPress={handleInvitePartner}>
              <Ionicons name="people" size={32} color={colors.secondary[500]} />
              <Text style={styles.actionLabel}>Partner</Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[6],
  },
  greeting: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  date: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  statValue: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
  progressText: {
    ...typography.styles.bodySmall,
    color: colors.success[600],
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing[6],
  },
  emptyTitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
    fontWeight: '600',
  },
  emptySubtitle: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
  },
  actionLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    marginTop: spacing[2],
    fontWeight: '500',
  },
});

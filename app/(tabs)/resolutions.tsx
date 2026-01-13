import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, LoadingSpinner } from '../../src/components/common';
import { ResolutionCard } from '../../src/components/resolutions';
import { useResolutions } from '../../src/hooks/useResolutions';
import { colors, typography, spacing } from '../../src/theme';
import { THEME_LIST } from '../../src/config/themes';
import { ThemeId, Resolution } from '../../src/types';
import { resolutionService } from '../../src/services/resolution.service';
import { useAuth } from '../../src/contexts/AuthContext';

type FilterType = 'all' | ThemeId;

export default function ResolutionsScreen() {
  const { user } = useAuth();
  const {
    resolutions,
    isLoading,
    completeResolution,
    uncompleteResolution,
  } = useResolutions();

  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});

  // Check completion status for all resolutions
  useEffect(() => {
    const checkCompletions = async () => {
      if (!user?.id || resolutions.length === 0) return;

      const statuses: Record<string, boolean> = {};
      for (const resolution of resolutions) {
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
  }, [user?.id, resolutions]);

  const filteredResolutions = resolutions.filter((r) => {
    if (filter === 'all') return true;
    return r.themeId === filter;
  });

  const handleAddResolution = () => {
    router.push('/(modals)/resolution-form');
  };

  const handleToggleComplete = useCallback(
    async (resolutionId: string, shouldComplete: boolean) => {
      if (shouldComplete) {
        const result = await completeResolution(resolutionId);
        if (result) {
          setCompletionStatus((prev) => ({ ...prev, [resolutionId]: true }));
        }
      } else {
        const success = await uncompleteResolution(resolutionId);
        if (success) {
          setCompletionStatus((prev) => ({ ...prev, [resolutionId]: false }));
        }
      }
    },
    [completeResolution, uncompleteResolution]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // The subscription will automatically update
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading goals..." />;
  }

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
          <Text style={styles.title}>My Goals</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddResolution}>
            <Ionicons name="add" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All ({resolutions.length})
            </Text>
          </TouchableOpacity>
          {THEME_LIST.map((theme) => {
            const count = resolutions.filter((r) => r.themeId === theme.id).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.filterChip,
                  filter === theme.id && styles.filterChipActive,
                ]}
                onPress={() => setFilter(theme.id)}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: theme.color }]}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filter === theme.id && styles.filterChipTextActive,
                  ]}
                >
                  {theme.name.split(' ')[0]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Resolution List or Empty State */}
        {filteredResolutions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons
              name="flag-outline"
              size={64}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No goals yet' : 'No goals in this category'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first goal and start tracking your progress!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddResolution}>
              <Ionicons name="add" size={20} color={colors.text.inverse} />
              <Text style={styles.emptyButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={styles.list}>
            {filteredResolutions.map((resolution) => (
              <ResolutionCard
                key={resolution.id}
                resolution={resolution}
                isCompleted={completionStatus[resolution.id] ?? false}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingBottom: spacing[4],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing[2],
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[1.5],
  },
  list: {
    marginTop: spacing[2],
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing[8],
    marginTop: spacing[4],
  },
  emptyTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginTop: spacing[4],
  },
  emptySubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[2],
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    marginTop: spacing[6],
    gap: spacing[2],
  },
  emptyButtonText: {
    ...typography.styles.button,
    color: colors.text.inverse,
  },
});

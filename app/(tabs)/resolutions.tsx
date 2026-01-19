import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { ResolutionCard, ThemeGroup } from '../../src/components/resolutions';
import { useResolutions } from '../../src/hooks/useResolutions';
import { colors, typography, spacing } from '../../src/theme';
import { THEME_LIST, getTheme } from '../../src/config/themes';
import { ThemeId, Resolution } from '../../src/types';
import { resolutionService } from '../../src/services/resolution.service';
import { useAuth } from '../../src/contexts/AuthContext';

type ViewMode = 'grouped' | 'list';

export default function ResolutionsScreen() {
  const { user } = useAuth();
  const {
    resolutions,
    isLoading,
    completeResolution,
    uncompleteResolution,
  } = useResolutions();

  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
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

  // Group resolutions by theme
  const groupedResolutions = useMemo(() => {
    const groups: Record<ThemeId, Resolution[]> = {} as Record<ThemeId, Resolution[]>;

    // Initialize empty arrays for each theme
    THEME_LIST.forEach((theme) => {
      groups[theme.id] = [];
    });

    // Group resolutions
    resolutions.forEach((resolution) => {
      const themeId = resolution.themeId;
      if (groups[themeId]) {
        groups[themeId].push(resolution);
      } else {
        // Fallback for unknown themes - add to first theme
        if (THEME_LIST.length > 0) {
          groups[THEME_LIST[0].id].push(resolution);
        }
      }
    });

    return groups;
  }, [resolutions]);

  // Get themes that have resolutions
  const activeThemes = useMemo(() => {
    return THEME_LIST.filter((theme) => groupedResolutions[theme.id]?.length > 0);
  }, [groupedResolutions]);

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

  const renderResolutionCard = useCallback(
    (
      resolution: Resolution,
      isCompleted: boolean,
      onToggle: (resolutionId: string, isCompleted: boolean) => Promise<void>
    ) => (
      <ResolutionCard
        key={resolution.id}
        resolution={resolution}
        isCompleted={isCompleted}
        onToggleComplete={onToggle}
      />
    ),
    []
  );

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
          <View style={styles.headerRight}>
            {/* View Mode Toggle */}
            {resolutions.length > 0 && (
              <TouchableOpacity
                style={styles.viewToggle}
                onPress={() => setViewMode(viewMode === 'grouped' ? 'list' : 'grouped')}
              >
                <Ionicons
                  name={viewMode === 'grouped' ? 'list' : 'layers'}
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.addButton} onPress={handleAddResolution}>
              <Ionicons name="add" size={24} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        {resolutions.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resolutions.length}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeThemes.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success[600] }]}>
                {Object.values(completionStatus).filter(Boolean).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        )}

        {/* Resolution List or Empty State */}
        {resolutions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons
              name="flag-outline"
              size={64}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first goal and start tracking your progress!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddResolution}>
              <Ionicons name="add" size={20} color={colors.text.inverse} />
              <Text style={styles.emptyButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </Card>
        ) : viewMode === 'grouped' ? (
          /* Grouped View */
          <View style={styles.groupedList}>
            {activeThemes.map((theme, index) => (
              <ThemeGroup
                key={theme.id}
                theme={theme}
                resolutions={groupedResolutions[theme.id]}
                completionStatus={completionStatus}
                onToggleComplete={handleToggleComplete}
                renderResolutionCard={renderResolutionCard}
                defaultExpanded={index === 0} // Only first group expanded by default
              />
            ))}
          </View>
        ) : (
          /* List View */
          <View style={styles.list}>
            {resolutions.map((resolution) => (
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.light,
  },
  groupedList: {
    marginTop: spacing[2],
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

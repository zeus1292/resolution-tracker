import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../common';
import { ResolutionForm } from '../resolutions';
import { THEME_LIST } from '../../config/themes';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Resolution, ResolutionCreateInput } from '../../types';

interface OnboardingScreenProps {
  displayName: string;
  resolutions: Resolution[];
  onCreateResolution: (input: ResolutionCreateInput) => Promise<string | null>;
  onComplete: () => void;
}

export function OnboardingScreen({
  displayName,
  resolutions,
  onCreateResolution,
  onComplete,
}: OnboardingScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const goalsAdded = resolutions.length;
  const minGoals = 2;
  const canComplete = goalsAdded >= minGoals;

  const handleCreateGoal = async (input: ResolutionCreateInput) => {
    setIsCreating(true);
    try {
      const id = await onCreateResolution(input);
      if (id) {
        setShowForm(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleGetStarted = () => {
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={48} color={colors.primary[500]} />
          </View>
          <Text style={styles.welcomeTitle}>
            Welcome, {displayName}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Let's set up your first goals to start tracking your progress.
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((goalsAdded / minGoals) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {goalsAdded}/{minGoals} goals added
          </Text>
        </View>

        {/* Goals Added */}
        {resolutions.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            {resolutions.map((resolution) => {
              const theme = THEME_LIST.find((t) => t.id === resolution.themeId);
              return (
                <Card key={resolution.id} style={styles.goalCard}>
                  <View style={styles.goalContent}>
                    <View
                      style={[
                        styles.goalIcon,
                        { backgroundColor: (theme?.color || colors.primary[500]) + '20' },
                      ]}
                    >
                      <Ionicons
                        name={(theme?.icon || 'flag') as any}
                        size={20}
                        color={theme?.color || colors.primary[500]}
                      />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle} numberOfLines={1}>
                        {resolution.title}
                      </Text>
                      <Text style={styles.goalMeta}>
                        {theme?.name} • {resolution.deadlineType}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.success[500]}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Add Goal Card */}
        {!canComplete && (
          <TouchableOpacity
            style={styles.addGoalCard}
            onPress={() => setShowForm(true)}
            activeOpacity={0.8}
          >
            <View style={styles.addGoalContent}>
              <View style={styles.addGoalIcon}>
                <Ionicons name="add" size={28} color={colors.primary[500]} />
              </View>
              <View style={styles.addGoalInfo}>
                <Text style={styles.addGoalTitle}>Add a Goal</Text>
                <Text style={styles.addGoalSubtitle}>
                  {goalsAdded === 0
                    ? 'Start by adding your first goal'
                    : 'Add one more goal to get started'}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.neutral[400]}
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Theme Suggestions */}
        {goalsAdded < minGoals && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Goal Ideas</Text>
            <Text style={styles.suggestionsSubtitle}>
              Pick a category that matters to you
            </Text>
            <View style={styles.themesGrid}>
              {THEME_LIST.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.themeCard, { borderColor: theme.color + '40' }]}
                  onPress={() => setShowForm(true)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.themeIconBg,
                      { backgroundColor: theme.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={theme.icon as any}
                      size={24}
                      color={theme.color}
                    />
                  </View>
                  <Text style={styles.themeName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Get Started Button */}
        {canComplete && (
          <View style={styles.completeSection}>
            <Card style={styles.successCard}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.success[500]}
              />
              <Text style={styles.successTitle}>You're all set!</Text>
              <Text style={styles.successSubtitle}>
                You've added {goalsAdded} goals. Ready to start tracking?
              </Text>
            </Card>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.startButton}
            />
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add" size={20} color={colors.primary[500]} />
              <Text style={styles.addMoreText}>Add More Goals</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Resolution Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Goal</Text>
            <View style={{ width: 60 }} />
          </View>
          <ResolutionForm
            onSubmit={handleCreateGoal}
            onCancel={() => setShowForm(false)}
            isLoading={isCreating}
          />
        </SafeAreaView>
      </Modal>
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
    alignItems: 'center',
    marginBottom: spacing[6],
    marginTop: spacing[4],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  welcomeTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
  },
  progressSection: {
    marginBottom: spacing[6],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  goalsSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  goalCard: {
    marginBottom: spacing[2],
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  goalMeta: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[0.5],
    textTransform: 'capitalize',
  },
  addGoalCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  addGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addGoalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  addGoalInfo: {
    flex: 1,
  },
  addGoalTitle: {
    ...typography.styles.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
  addGoalSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
  suggestionsSection: {
    marginBottom: spacing[6],
  },
  suggestionsSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    marginTop: -spacing[2],
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  themeCard: {
    width: '31%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing[3],
    alignItems: 'center',
  },
  themeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  themeName: {
    ...typography.styles.caption,
    color: colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  completeSection: {
    marginTop: spacing[4],
  },
  successCard: {
    alignItems: 'center',
    padding: spacing[6],
    marginBottom: spacing[4],
  },
  successTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginTop: spacing[3],
  },
  successSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[2],
  },
  startButton: {
    marginBottom: spacing[3],
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    gap: spacing[1],
  },
  addMoreText: {
    ...typography.styles.body,
    color: colors.primary[500],
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  cancelText: {
    ...typography.styles.body,
    color: colors.primary[500],
  },
  modalTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
});

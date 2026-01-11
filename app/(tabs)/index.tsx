import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/common';
import { colors, typography, spacing } from '../../src/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  const displayName = user?.displayName || 'there';
  const currentStreak = user?.currentStreak || 0;
  const points = user?.points || 0;
  const level = user?.level || 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="trophy" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </Card>
        </View>

        {/* Today's Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <Card style={styles.emptyCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first resolution to get started!
            </Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Card style={styles.actionCard} onPress={() => {}}>
              <Ionicons name="add-circle" size={32} color={colors.primary[500]} />
              <Text style={styles.actionLabel}>Add Goal</Text>
            </Card>
            <Card style={styles.actionCard} onPress={() => {}}>
              <Ionicons name="people" size={32} color={colors.secondary[500]} />
              <Text style={styles.actionLabel}>Invite Partner</Text>
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
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing[8],
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

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/common';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import {
  getLevelFromPoints,
  getProgressToNextLevel,
  BADGES,
} from '../../src/config/gamification';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const points = user?.points || 0;
  const levelInfo = getLevelFromPoints(points);
  const progress = getProgressToNextLevel(points);
  const totalCompletions = user?.totalCompletions || 0;
  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.neutral[400]} />
            </View>
            <View
              style={[styles.levelBadge, { backgroundColor: levelInfo.color }]}
            >
              <Text style={styles.levelBadgeText}>{levelInfo.level}</Text>
            </View>
          </View>
          <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.levelTitle}>{levelInfo.title}</Text>
        </View>

        {/* Points & Level Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsValue}>{points}</Text>
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>
            {levelInfo.level < 10 && (
              <View style={styles.nextLevelInfo}>
                <Text style={styles.nextLevelText}>
                  Next: Level {levelInfo.level + 1}
                </Text>
                <Text style={styles.nextLevelPoints}>
                  {levelInfo.maxPoints - points + 1} points to go
                </Text>
              </View>
            )}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
            <Text style={styles.statValue}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="flame" size={24} color={colors.streak.fire} />
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={colors.warning[500]} />
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.sectionCount}>0 / {BADGES.length}</Text>
          </View>
          <Card style={styles.badgesCard}>
            <View style={styles.badgesGrid}>
              {BADGES.slice(0, 6).map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <View style={[styles.badgeLocked]}>
                    <Ionicons name="lock-closed" size={20} color={colors.neutral[300]} />
                  </View>
                  <Text style={styles.badgeName} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Badges</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Card padding="none">
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.settingText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
            <View style={styles.settingDivider} />
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="person-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.settingText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
            <View style={styles.settingDivider} />
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="help-circle-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.settingText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
            <View style={styles.settingDivider} />
            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={colors.error[500]} />
              <Text style={[styles.settingText, styles.logoutText]}>Sign Out</Text>
            </TouchableOpacity>
          </Card>
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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing[3],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  levelBadgeText: {
    ...typography.styles.caption,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  displayName: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  levelTitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },

  // Progress Card
  progressCard: {
    marginBottom: spacing[4],
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  pointsInfo: {},
  pointsValue: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  pointsLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  nextLevelInfo: {
    alignItems: 'flex-end',
  },
  nextLevelText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  nextLevelPoints: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
  },
  statValue: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
    textAlign: 'center',
  },

  // Section
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
  sectionCount: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },

  // Badges
  badgesCard: {},
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
  },
  badgeLocked: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  badgeName: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  viewAllText: {
    ...typography.styles.bodySmall,
    color: colors.primary[500],
    fontWeight: '500',
  },

  // Settings
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  settingText: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4] + 22 + spacing[3],
  },
  logoutItem: {},
  logoutText: {
    color: colors.error[500],
  },
});

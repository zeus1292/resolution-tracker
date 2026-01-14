import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useBadges, BadgeWithStatus } from '../../src/hooks/useBadges';
import { Card, Button } from '../../src/components/common';
import { colors, typography, spacing } from '../../src/theme';
import {
  BADGES,
  STREAK_PROTECTION_COST,
  canAffordStreakProtection,
  getNextStreakMilestone,
} from '../../src/config/gamification';

// Badge icon mapping
const BADGE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  flame: 'flame',
  trophy: 'trophy',
  'checkmark-circle': 'checkmark-circle',
  ribbon: 'ribbon',
  star: 'star',
  people: 'people',
  medal: 'medal',
  shield: 'shield-checkmark',
};

const getBadgeIcon = (iconName: string): keyof typeof Ionicons.glyphMap => {
  return BADGE_ICON_MAP[iconName] || 'ribbon';
};

const RARITY_COLORS: Record<string, string> = {
  common: colors.neutral[400],
  rare: colors.primary[500],
  epic: colors.secondary[500],
  legendary: '#FFD700',
};

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { allBadgesWithStatus, earnedCount, totalCount } = useBadges();
  const [refreshing, setRefreshing] = useState(false);

  const points = user?.points || 0;
  const totalCompletions = user?.totalCompletions || 0;
  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;
  const nextMilestone = getNextStreakMilestone(currentStreak);
  const canProtect = canAffordStreakProtection(points);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshUser]);

  const handleStreakProtection = () => {
    if (!canProtect) {
      Alert.alert(
        'Not Enough Points',
        `You need ${STREAK_PROTECTION_COST} points to protect your streak. You have ${points} points.`
      );
      return;
    }

    Alert.alert(
      'Protect Streak',
      `Spend ${STREAK_PROTECTION_COST} points to protect your streak for one missed day?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Protect',
          onPress: () => {
            // TODO: Implement streak protection
            Alert.alert('Coming Soon', 'Streak protection will be available in the next update!');
          },
        },
      ]
    );
  };

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

  // Get first 6 badges to display (prioritize earned ones)
  const displayBadges = allBadgesWithStatus.slice(0, 6);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.neutral[400]} />
          </View>
          <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Points Card */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsInfo}>
              <Ionicons name="star" size={28} color={colors.warning[500]} />
              <Text style={styles.pointsValue}>{points}</Text>
              <Text style={styles.pointsLabel}>Points</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsInfo}>
              <Ionicons name="flame" size={28} color={colors.streak.fire} />
              <Text style={styles.pointsValue}>{currentStreak}</Text>
              <Text style={styles.pointsLabel}>Day Streak</Text>
            </View>
          </View>
          {nextMilestone && (
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneText}>
                {nextMilestone - currentStreak} days to {nextMilestone}-day badge!
              </Text>
            </View>
          )}
        </Card>

        {/* Streak Protection */}
        <Card style={styles.protectionCard}>
          <View style={styles.protectionHeader}>
            <View style={styles.protectionIcon}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.protectionInfo}>
              <Text style={styles.protectionTitle}>Streak Protection</Text>
              <Text style={styles.protectionSubtitle}>
                Missed a day? Protect your streak!
              </Text>
            </View>
          </View>
          <Button
            title={`Use ${STREAK_PROTECTION_COST} Points`}
            variant={canProtect ? 'primary' : 'outline'}
            size="sm"
            onPress={handleStreakProtection}
            disabled={!canProtect}
          />
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
            <Text style={styles.statValue}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={colors.warning[500]} />
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>
          <Card style={styles.statItem}>
            <Ionicons name="ribbon" size={24} color={colors.primary[500]} />
            <Text style={styles.statValue}>{earnedCount}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </Card>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.sectionCount}>{earnedCount} / {totalCount}</Text>
          </View>
          <Card style={styles.badgesCard}>
            <View style={styles.badgesGrid}>
              {displayBadges.map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  {badge.earned ? (
                    <View
                      style={[
                        styles.badgeEarned,
                        { backgroundColor: RARITY_COLORS[badge.rarity] + '20' },
                      ]}
                    >
                      <Ionicons
                        name={getBadgeIcon(badge.icon)}
                        size={24}
                        color={RARITY_COLORS[badge.rarity]}
                      />
                    </View>
                  ) : (
                    <View style={styles.badgeLocked}>
                      <Ionicons name="lock-closed" size={20} color={colors.neutral[300]} />
                    </View>
                  )}
                  <Text
                    style={[styles.badgeName, badge.earned && styles.badgeNameEarned]}
                    numberOfLines={1}
                  >
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
    paddingBottom: spacing[8],
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  displayName: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  email: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },

  // Points Card
  pointsCard: {
    marginBottom: spacing[4],
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pointsValue: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginTop: spacing[1],
  },
  pointsLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  pointsDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border.light,
  },
  milestoneInfo: {
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  milestoneText: {
    ...typography.styles.bodySmall,
    color: colors.primary[600],
    fontWeight: '500',
  },

  // Protection Card
  protectionCard: {
    marginBottom: spacing[4],
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  protectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  protectionInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  protectionTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  protectionSubtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
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
  badgeEarned: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  badgeName: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  badgeNameEarned: {
    color: colors.text.primary,
    fontWeight: '500',
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

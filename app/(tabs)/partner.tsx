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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { usePartner } from '../../src/hooks/usePartner';
import { Card, Button, LoadingSpinner } from '../../src/components/common';
import { colors, typography, spacing } from '../../src/theme';
import { getLevelFromPoints } from '../../src/config/gamification';

export default function PartnerScreen() {
  const { user, refreshUser } = useAuth();
  const {
    partnerInfo,
    partnerResolutions,
    activeChallenge,
    pendingInvite,
    isLoading,
    unlinkPartner,
    startChallenge,
  } = usePartner();

  const [refreshing, setRefreshing] = useState(false);

  const hasPartner = user?.partnerStatus === 'active';
  const hasPendingInvite = pendingInvite !== null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshUser]);

  const handleInvitePartner = () => {
    router.push('/(modals)/partner-invite?mode=create');
  };

  const handleEnterCode = () => {
    router.push('/(modals)/partner-invite?mode=enter');
  };

  const handleViewPendingInvite = () => {
    router.push('/(modals)/partner-invite?mode=create');
  };

  const handleUnlinkPartner = () => {
    Alert.alert(
      'Unlink Partner',
      'Are you sure you want to unlink from your partner? You can always reconnect later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            const success = await unlinkPartner();
            if (!success) {
              Alert.alert('Error', 'Failed to unlink partner');
            }
          },
        },
      ]
    );
  };

  const handleStartChallenge = async () => {
    const challenge = await startChallenge();
    if (!challenge) {
      Alert.alert('Error', 'Failed to start challenge');
    }
  };

  if (isLoading && hasPartner) {
    return <LoadingSpinner fullScreen message="Loading partner..." />;
  }

  // No partner - show invite options
  if (!hasPartner) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContentCentered}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people" size={64} color={colors.primary[500]} />
            </View>
            <Text style={styles.emptyTitle}>No Partner Yet</Text>
            <Text style={styles.emptySubtitle}>
              Partner up with someone to keep each other motivated and track progress together!
            </Text>

            {hasPendingInvite ? (
              // Show pending invite status
              <Card style={styles.pendingCard}>
                <View style={styles.pendingHeader}>
                  <Ionicons name="time" size={24} color={colors.warning[500]} />
                  <Text style={styles.pendingTitle}>Invite Pending</Text>
                </View>
                <Text style={styles.pendingCode}>{pendingInvite?.inviteCode}</Text>
                <Text style={styles.pendingHint}>
                  Waiting for your partner to enter this code
                </Text>
                <Button
                  title="View Invite"
                  variant="outline"
                  onPress={handleViewPendingInvite}
                  fullWidth
                />
              </Card>
            ) : (
              <View style={styles.actionButtons}>
                <Button
                  title="Invite Partner"
                  onPress={handleInvitePartner}
                  fullWidth
                  size="lg"
                  leftIcon={
                    <Ionicons name="person-add" size={20} color={colors.text.inverse} />
                  }
                />
                <Button
                  title="Enter Invite Code"
                  variant="outline"
                  onPress={handleEnterCode}
                  fullWidth
                  size="lg"
                  leftIcon={
                    <Ionicons name="keypad" size={20} color={colors.primary[500]} />
                  }
                />
              </View>
            )}

            {/* Features list */}
            <Card style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Partner Features</Text>
              <View style={styles.featureItem}>
                <Ionicons name="eye" size={20} color={colors.primary[500]} />
                <Text style={styles.featureText}>View each other's progress</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trophy" size={20} color={colors.warning[500]} />
                <Text style={styles.featureText}>Weekly challenges & leaderboards</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="notifications" size={20} color={colors.secondary[500]} />
                <Text style={styles.featureText}>Get notified of achievements</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color={colors.error[500]} />
                <Text style={styles.featureText}>Motivate each other daily</Text>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Partner connected - show partner view
  const partnerLevel = partnerInfo ? getLevelFromPoints(partnerInfo.points) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Partner</Text>

        {/* Partner Card */}
        {partnerInfo && (
          <Card style={styles.partnerCard}>
            <View style={styles.partnerHeader}>
              <View style={styles.partnerAvatar}>
                <Ionicons name="person" size={32} color={colors.neutral[400]} />
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partnerInfo.displayName}</Text>
                <Text style={styles.partnerStats}>
                  Level {partnerInfo.level} • {partnerInfo.points} points
                </Text>
              </View>
            </View>

            {/* Partner Stats */}
            <View style={styles.partnerStatsRow}>
              <View style={styles.partnerStat}>
                <View style={[styles.partnerStatIcon, { backgroundColor: colors.secondary[50] }]}>
                  <Ionicons name="flame" size={16} color={colors.streak.fire} />
                </View>
                <Text style={styles.partnerStatValue}>{partnerInfo.currentStreak}</Text>
                <Text style={styles.partnerStatLabel}>Streak</Text>
              </View>
              <View style={styles.partnerStat}>
                <View style={[styles.partnerStatIcon, { backgroundColor: colors.success[50] }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                </View>
                <Text style={styles.partnerStatValue}>{partnerInfo.totalCompletions}</Text>
                <Text style={styles.partnerStatLabel}>Done</Text>
              </View>
              <View style={styles.partnerStat}>
                <View style={[styles.partnerStatIcon, { backgroundColor: (partnerLevel?.color || colors.primary[500]) + '20' }]}>
                  <Ionicons name="trophy" size={16} color={partnerLevel?.color || colors.primary[500]} />
                </View>
                <Text style={styles.partnerStatValue}>{partnerLevel?.title || 'N/A'}</Text>
                <Text style={styles.partnerStatLabel}>Rank</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Challenge Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenge</Text>
          {activeChallenge ? (
            <Card style={styles.challengeCard}>
              <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
              <View style={styles.challengeScores}>
                {user?.id && (
                  <View style={styles.challengeScore}>
                    <Text style={styles.scoreLabel}>You</Text>
                    <Text style={styles.scoreValue}>
                      {activeChallenge.participants[user.id]?.score || 0}
                    </Text>
                  </View>
                )}
                <Text style={styles.vs}>vs</Text>
                {partnerInfo && (
                  <View style={styles.challengeScore}>
                    <Text style={styles.scoreLabel}>{partnerInfo.displayName.split(' ')[0]}</Text>
                    <Text style={styles.scoreValue}>
                      {activeChallenge.participants[partnerInfo.id]?.score || 0}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.challengeEnds}>
                Ends {activeChallenge.endDate.toDate().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </Card>
          ) : (
            <Card style={styles.challengeCardEmpty}>
              <Text style={styles.challengeEmpty}>No active challenge</Text>
              <TouchableOpacity style={styles.startChallengeButton} onPress={handleStartChallenge}>
                <Ionicons name="trophy" size={20} color={colors.primary[500]} />
                <Text style={styles.startChallengeText}>Start a Challenge</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Partner's Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner's Shared Goals</Text>
          {partnerResolutions.length === 0 ? (
            <Card style={styles.goalsCard}>
              <Ionicons
                name="lock-closed"
                size={32}
                color={colors.neutral[300]}
              />
              <Text style={styles.goalsEmpty}>
                Your partner hasn't shared any goals yet
              </Text>
            </Card>
          ) : (
            <View>
              {partnerResolutions.map((resolution) => (
                <Card key={resolution.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{resolution.title}</Text>
                    <View style={styles.goalBadge}>
                      <Text style={styles.goalBadgeText}>{resolution.deadlineType}</Text>
                    </View>
                  </View>
                  {resolution.description && (
                    <Text style={styles.goalDescription} numberOfLines={2}>
                      {resolution.description}
                    </Text>
                  )}
                  <View style={styles.goalStats}>
                    <View style={styles.goalStat}>
                      <Ionicons name="flame" size={14} color={colors.streak.fire} />
                      <Text style={styles.goalStatText}>{resolution.currentStreak} streak</Text>
                    </View>
                    <View style={styles.goalStat}>
                      <Ionicons name="checkmark" size={14} color={colors.success[500]} />
                      <Text style={styles.goalStatText}>{resolution.completionCount} done</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Unlink Option */}
        <TouchableOpacity style={styles.unlinkButton} onPress={handleUnlinkPartner}>
          <Ionicons name="person-remove" size={20} color={colors.error[500]} />
          <Text style={styles.unlinkText}>Unlink Partner</Text>
        </TouchableOpacity>
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
  scrollContentCentered: {
    flexGrow: 1,
    padding: spacing[4],
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  emptyTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  actionButtons: {
    width: '100%',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  pendingCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  pendingTitle: {
    ...typography.styles.h4,
    color: colors.warning[600],
  },
  pendingCode: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  pendingHint: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing[4],
  },
  featuresCard: {
    width: '100%',
  },
  featuresTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  featureText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    flex: 1,
  },

  // Partner view
  partnerCard: {
    marginBottom: spacing[6],
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  partnerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInfo: {
    marginLeft: spacing[4],
  },
  partnerName: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
  partnerStats: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
  partnerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  partnerStat: {
    alignItems: 'center',
  },
  partnerStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  partnerStatValue: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
  partnerStatLabel: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  challengeCard: {
    alignItems: 'center',
  },
  challengeCardEmpty: {
    alignItems: 'center',
    padding: spacing[6],
  },
  challengeTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing[4],
  },
  challengeScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  challengeScore: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  scoreValue: {
    ...typography.styles.h2,
    color: colors.primary[500],
  },
  vs: {
    ...typography.styles.body,
    color: colors.text.tertiary,
  },
  challengeEnds: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  challengeEmpty: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  startChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  startChallengeText: {
    ...typography.styles.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
  goalsCard: {
    alignItems: 'center',
    padding: spacing[6],
  },
  goalsEmpty: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
    textAlign: 'center',
  },
  goalCard: {
    marginBottom: spacing[3],
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  goalTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  goalBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: 4,
    marginLeft: spacing[2],
  },
  goalBadgeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  goalDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  goalStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  goalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  goalStatText: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
  },
  unlinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    marginTop: spacing[4],
  },
  unlinkText: {
    ...typography.styles.body,
    color: colors.error[500],
  },
});

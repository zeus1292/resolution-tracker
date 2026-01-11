import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card, Button } from '../../src/components/common';
import { colors, typography, spacing } from '../../src/theme';

export default function PartnerScreen() {
  const { user } = useAuth();
  const hasPartner = user?.partnerStatus === 'active';

  if (!hasPartner) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContentCentered}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people" size={64} color={colors.primary[500]} />
            </View>
            <Text style={styles.emptyTitle}>No Partner Yet</Text>
            <Text style={styles.emptySubtitle}>
              Partner up with someone to keep each other motivated and track progress together!
            </Text>

            <View style={styles.actionButtons}>
              <Button
                title="Invite Partner"
                onPress={() => {}}
                fullWidth
                size="lg"
                leftIcon={
                  <Ionicons name="person-add" size={20} color={colors.text.inverse} />
                }
              />
              <Button
                title="Enter Invite Code"
                variant="outline"
                onPress={() => {}}
                fullWidth
                size="lg"
                leftIcon={
                  <Ionicons name="keypad" size={20} color={colors.primary[500]} />
                }
              />
            </View>

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

  // Partner view (when connected)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Partner</Text>

        {/* Partner Card */}
        <Card style={styles.partnerCard}>
          <View style={styles.partnerHeader}>
            <View style={styles.partnerAvatar}>
              <Ionicons name="person" size={32} color={colors.neutral[400]} />
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>Partner Name</Text>
              <Text style={styles.partnerStats}>Level 1 • 0 points</Text>
            </View>
          </View>
        </Card>

        {/* Challenge Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenge</Text>
          <Card style={styles.challengeCard}>
            <Text style={styles.challengeEmpty}>No active challenge</Text>
            <TouchableOpacity style={styles.startChallengeButton}>
              <Text style={styles.startChallengeText}>Start a Challenge</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Partner's Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner's Goals</Text>
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
  challengeEmpty: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  startChallengeButton: {
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
});

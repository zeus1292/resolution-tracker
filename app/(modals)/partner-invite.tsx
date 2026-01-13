import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Share,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, LoadingSpinner } from '../../src/components/common';
import { usePartner } from '../../src/hooks/usePartner';
import { colors, typography, spacing } from '../../src/theme';

type Mode = 'create' | 'enter';

export default function PartnerInviteModal() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode = params.mode === 'enter' ? 'enter' : 'create';

  const { pendingInvite, createInvite, acceptInvite, cancelInvite, error } = usePartner();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [enteredCode, setEnteredCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [copied, setCopied] = useState(false);

  // If we already have a pending invite, show it
  useEffect(() => {
    if (pendingInvite && mode === 'create') {
      // We already have an invite, no need to create
    }
  }, [pendingInvite, mode]);

  const handleCreateInvite = async () => {
    if (pendingInvite) return; // Already have one

    setIsCreating(true);
    const invite = await createInvite();
    setIsCreating(false);

    if (!invite) {
      Alert.alert('Error', error || 'Failed to create invite');
    }
  };

  const handleAcceptInvite = async () => {
    if (enteredCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character invite code');
      return;
    }

    setIsAccepting(true);
    const success = await acceptInvite(enteredCode.toUpperCase());
    setIsAccepting(false);

    if (success) {
      Alert.alert('Success', 'You are now connected with your partner!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to accept invite');
    }
  };

  const handleCancelInvite = async () => {
    Alert.alert(
      'Cancel Invite',
      'Are you sure you want to cancel this invite?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setIsCanceling(true);
            const success = await cancelInvite();
            setIsCanceling(false);

            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'Failed to cancel invite');
            }
          },
        },
      ]
    );
  };

  const handleCopyCode = async () => {
    if (pendingInvite) {
      await Clipboard.setStringAsync(pendingInvite.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = async () => {
    if (pendingInvite) {
      try {
        await Share.share({
          message: `Join me on Resolution Tracker! Use my invite code: ${pendingInvite.inviteCode}`,
        });
      } catch {
        // User cancelled
      }
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Partner Invite</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'create' && styles.tabActive]}
              onPress={() => setMode('create')}
            >
              <Ionicons
                name="person-add"
                size={20}
                color={mode === 'create' ? colors.primary[500] : colors.text.secondary}
              />
              <Text style={[styles.tabText, mode === 'create' && styles.tabTextActive]}>
                Create Invite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'enter' && styles.tabActive]}
              onPress={() => setMode('enter')}
            >
              <Ionicons
                name="keypad"
                size={20}
                color={mode === 'enter' ? colors.primary[500] : colors.text.secondary}
              />
              <Text style={[styles.tabText, mode === 'enter' && styles.tabTextActive]}>
                Enter Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {mode === 'create' ? (
            <View style={styles.content}>
              {pendingInvite ? (
                // Show existing invite code
                <Card style={styles.codeCard}>
                  <Text style={styles.codeLabel}>Your Invite Code</Text>
                  <View style={styles.codeContainer}>
                    <Text style={styles.code}>{pendingInvite.inviteCode}</Text>
                  </View>
                  <Text style={styles.codeHint}>
                    Share this code with your partner. It expires in 7 days.
                  </Text>

                  <View style={styles.codeActions}>
                    <TouchableOpacity style={styles.codeAction} onPress={handleCopyCode}>
                      <Ionicons
                        name={copied ? 'checkmark' : 'copy'}
                        size={20}
                        color={colors.primary[500]}
                      />
                      <Text style={styles.codeActionText}>
                        {copied ? 'Copied!' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.codeAction} onPress={handleShareCode}>
                      <Ionicons name="share" size={20} color={colors.primary[500]} />
                      <Text style={styles.codeActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    title="Cancel Invite"
                    variant="outline"
                    onPress={handleCancelInvite}
                    isLoading={isCanceling}
                    fullWidth
                    style={styles.cancelButton}
                  />
                </Card>
              ) : (
                // Create new invite
                <Card style={styles.createCard}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="person-add" size={48} color={colors.primary[500]} />
                  </View>
                  <Text style={styles.createTitle}>Invite Your Partner</Text>
                  <Text style={styles.createSubtitle}>
                    Create an invite code to share with your partner. Once they enter it,
                    you'll be connected!
                  </Text>
                  <Button
                    title="Generate Invite Code"
                    onPress={handleCreateInvite}
                    isLoading={isCreating}
                    fullWidth
                    size="lg"
                  />
                </Card>
              )}
            </View>
          ) : (
            // Enter code mode
            <View style={styles.content}>
              <Card style={styles.enterCard}>
                <View style={styles.iconContainer}>
                  <Ionicons name="keypad" size={48} color={colors.primary[500]} />
                </View>
                <Text style={styles.createTitle}>Enter Invite Code</Text>
                <Text style={styles.createSubtitle}>
                  Enter the 6-character code your partner shared with you.
                </Text>

                <TextInput
                  style={styles.codeInput}
                  value={enteredCode}
                  onChangeText={(text) => setEnteredCode(text.toUpperCase().slice(0, 6))}
                  placeholder="XXXXXX"
                  placeholderTextColor={colors.neutral[300]}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                />

                <Button
                  title="Connect with Partner"
                  onPress={handleAcceptInvite}
                  isLoading={isAccepting}
                  disabled={enteredCode.length !== 6}
                  fullWidth
                  size="lg"
                />
              </Card>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[1],
    marginBottom: spacing[6],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: 10,
    gap: spacing[2],
  },
  tabActive: {
    backgroundColor: colors.background.primary,
  },
  tabText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary[500],
  },
  content: {
    flex: 1,
  },
  createCard: {
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  createTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  createSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  codeCard: {
    alignItems: 'center',
    padding: spacing[6],
  },
  codeLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  codeContainer: {
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: 12,
    marginBottom: spacing[3],
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    color: colors.text.primary,
  },
  codeHint: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  codeActions: {
    flexDirection: 'row',
    gap: spacing[6],
    marginBottom: spacing[6],
  },
  codeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  codeActionText: {
    ...typography.styles.body,
    color: colors.primary[500],
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: spacing[2],
  },
  enterCard: {
    alignItems: 'center',
    padding: spacing[6],
  },
  codeInput: {
    width: '100%',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.text.primary,
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[6],
  },
});

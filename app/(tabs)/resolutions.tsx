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
import { Card } from '../../src/components/common';
import { colors, typography, spacing } from '../../src/theme';
import { THEME_LIST } from '../../src/config/themes';

export default function ResolutionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {THEME_LIST.map((theme) => (
            <TouchableOpacity key={theme.id} style={styles.filterChip}>
              <View
                style={[styles.filterDot, { backgroundColor: theme.color }]}
              />
              <Text style={styles.filterChipText}>{theme.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty State */}
        <Card style={styles.emptyCard}>
          <Ionicons
            name="flag-outline"
            size={64}
            color={colors.neutral[300]}
          />
          <Text style={styles.emptyTitle}>No resolutions yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your first goal and start tracking your progress!
          </Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Ionicons name="add" size={20} color={colors.text.inverse} />
            <Text style={styles.emptyButtonText}>Add Resolution</Text>
          </TouchableOpacity>
        </Card>
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
    gap: spacing[2],
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../common';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { THEME_LIST } from '../../config/themes';
import { ResolutionCreateInput, DeadlineType, ThemeId } from '../../types';

interface ResolutionFormProps {
  onSubmit: (input: ResolutionCreateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialValues?: Partial<ResolutionCreateInput>;
}

const DEADLINE_OPTIONS: { value: DeadlineType; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Complete every day' },
  { value: 'weekly', label: 'Weekly', description: 'Complete once a week' },
  { value: 'monthly', label: 'Monthly', description: 'Complete once a month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Complete once a quarter' },
];

export function ResolutionForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues,
}: ResolutionFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [themeId, setThemeId] = useState<ThemeId>(initialValues?.themeId || 'personal');
  const [deadlineType, setDeadlineType] = useState<DeadlineType>(
    initialValues?.deadlineType || 'daily'
  );
  const [sharedWithPartner, setSharedWithPartner] = useState(
    initialValues?.sharedWithPartner ?? true
  );
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      themeId,
      deadlineType,
      sharedWithPartner,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <Input
        label="Goal Title"
        placeholder="e.g., Exercise for 30 minutes"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        autoFocus
      />

      {/* Description */}
      <Input
        label="Description (optional)"
        placeholder="Add more details about your goal"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.descriptionInput}
      />

      {/* Theme Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.themeGrid}>
          {THEME_LIST.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeItem,
                themeId === theme.id && styles.themeItemSelected,
                themeId === theme.id && { borderColor: theme.color },
              ]}
              onPress={() => setThemeId(theme.id)}
            >
              <View
                style={[styles.themeIcon, { backgroundColor: theme.color + '20' }]}
              >
                <Ionicons
                  name={theme.icon as any}
                  size={20}
                  color={theme.color}
                />
              </View>
              <Text
                style={[
                  styles.themeLabel,
                  themeId === theme.id && { color: theme.color },
                ]}
                numberOfLines={1}
              >
                {theme.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Deadline Type */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Frequency</Text>
        <View style={styles.deadlineGrid}>
          {DEADLINE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.deadlineItem,
                deadlineType === option.value && styles.deadlineItemSelected,
              ]}
              onPress={() => setDeadlineType(option.value)}
            >
              <Text
                style={[
                  styles.deadlineLabel,
                  deadlineType === option.value && styles.deadlineLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.deadlineDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Share with Partner */}
      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.switchLabel}>Share with Partner</Text>
          <Text style={styles.switchDescription}>
            Your partner can see this goal and your progress
          </Text>
        </View>
        <Switch
          value={sharedWithPartner}
          onValueChange={setSharedWithPartner}
          trackColor={{ false: colors.neutral[300], true: colors.primary[200] }}
          thumbColor={sharedWithPartner ? colors.primary[500] : colors.neutral[100]}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <Button
          title="Create Goal"
          onPress={handleSubmit}
          isLoading={isLoading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionLabel: {
    ...typography.styles.label,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  themeItem: {
    width: '23%',
    alignItems: 'center',
    padding: spacing[2],
    borderRadius: borderRadius.default,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.background.secondary,
  },
  themeItemSelected: {
    backgroundColor: colors.background.primary,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  themeLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  deadlineGrid: {
    gap: spacing[2],
  },
  deadlineItem: {
    padding: spacing[3],
    borderRadius: borderRadius.default,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  deadlineItemSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  deadlineLabel: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  deadlineLabelSelected: {
    color: colors.primary[600],
  },
  deadlineDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing[2],
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  switchLabel: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  switchDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { ResolutionForm } from '../../src/components/resolutions';
import { useResolutions } from '../../src/hooks/useResolutions';
import { ResolutionCreateInput } from '../../src/types';
import { colors } from '../../src/theme';

export default function ResolutionFormModal() {
  const { createResolution } = useResolutions();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (input: ResolutionCreateInput) => {
    setIsLoading(true);
    try {
      const id = await createResolution(input);
      if (id) {
        router.back();
      } else {
        Alert.alert('Error', 'Failed to create goal. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResolutionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

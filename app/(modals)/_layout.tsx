import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTitleStyle: {
          color: colors.text.primary,
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen
        name="resolution-form"
        options={{
          title: 'New Goal',
        }}
      />
      <Stack.Screen
        name="partner-invite"
        options={{
          title: 'Partner Invite',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

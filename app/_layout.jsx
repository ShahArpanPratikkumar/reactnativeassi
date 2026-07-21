import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SurveyProvider } from '@/context/SurveyContext';

export default function RootLayout() {
  return (
    <SurveyProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </SurveyProvider>
  );
}

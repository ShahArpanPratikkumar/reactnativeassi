// Root Layout for Travel Guardian
import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import colors from '../constants/colors';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';

// Safely load Notifications with fallback for Expo Go on Android
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  // Suppressed in Expo Go Android where remote push functionality throws at import
  console.log('[RootLayout] Notifications module bypassed in this environment:', e.message);
}

// Completely suppress the Expo Go SDK 53+ remote push notification warning.
// Travel Guardian exclusively uses local reminders/notifications — no push tokens, no Firebase.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Android Push notifications (remote notifications) functionality provided by expo-notifications was removed',
]);

// Set up local notification display behavior ONCE at app startup if available.
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (err) {
    console.log('[RootLayout] Notification handler bypassed:', err.message);
  }
}

function RootNav() {
  const { theme, isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: theme.text,
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        {/* Welcome / Onboarding / Splash */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        {/* Authentication flow (Login / Register) */}
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />

        {/* Main Tab Navigation */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Trips Screens */}
        <Stack.Screen
          name="trips/index"
          options={{
            title: 'My Trips',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="trips/create"
          options={{
            title: 'Create Trip',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="trips/[id]"
          options={{
            title: 'Trip Details',
            headerShown: true,
          }}
        />

        {/* Documents Screens */}
        <Stack.Screen
          name="documents/index"
          options={{
            title: 'Travel Documents',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="documents/scanner"
          options={{
            title: 'Scan Document',
            headerShown: true,
          }}
        />

        {/* Media / Safety Evidence */}
        <Stack.Screen
          name="media/index"
          options={{
            title: 'Safety Media',
            headerShown: true,
          }}
        />

        {/* SOS Emergency Screen */}
        <Stack.Screen
          name="sos/index"
          options={{
            title: 'Emergency SOS',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.danger,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              color: colors.white,
              fontWeight: 'bold',
            },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </UserProvider>
  );
}

// Travel Guardian - Local Reminders Service
// Uses expo-notifications for LOCAL scheduled notifications only.
// No remote push tokens, no Firebase, no Expo push token registration.
// Works with Expo Go (local notifications only — remote push is not needed here).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REMINDERS_KEY = 'travel_guardian_local_reminders';

// Safely load Notifications with fallback for Expo Go on Android where remote push was removed
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log('[ReminderService] Notifications module unavailable in this environment:', e.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Request LOCAL notification permission + set Android channel
// ─────────────────────────────────────────────────────────────────────────────
export const requestNotificationPermission = async () => {
  if (!Notifications || typeof Notifications.requestPermissionsAsync !== 'function') {
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Android requires a notification channel for local notifications
    if (Platform.OS === 'android' && typeof Notifications.setNotificationChannelAsync === 'function') {
      await Notifications.setNotificationChannelAsync('travel-reminders', {
        name: 'Travel Reminders',
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.log('[ReminderService] Permission error:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get all saved reminders from AsyncStorage
// ─────────────────────────────────────────────────────────────────────────────
export const getReminders = async () => {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('[ReminderService] Error reading reminders:', error.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Schedule a new local notification reminder
//
// Supports both scheduleReminder(title, triggerDate) and scheduleReminder({ title, triggerDate })
// Uses SchedulableTriggerInputTypes.DATE when available (SDK 54/57)
// Gracefully stores reminder in AsyncStorage regardless of client environment
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleReminder = async (titleOrObj, maybeTriggerDate) => {
  let title = '';
  let triggerDate = null;

  if (typeof titleOrObj === 'object' && titleOrObj !== null) {
    title = titleOrObj.title;
    triggerDate = titleOrObj.triggerDate;
  } else {
    title = titleOrObj;
    triggerDate = maybeTriggerDate;
  }

  const now = new Date();
  const scheduleTime = new Date(triggerDate);

  if (scheduleTime <= now || isNaN(scheduleTime.getTime())) {
    throw new Error('Please choose a future date and time for the reminder.');
  }

  let notificationId = 'rem_' + Date.now();

  // If notifications are available (Development build or supported client)
  if (Notifications && typeof Notifications.scheduleNotificationAsync === 'function') {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      try {
        const triggerType = Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date';
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🛡️ Travel Guardian',
            body: title,
            data: { title, scheduledAt: scheduleTime.toISOString() },
            sound: 'default',
            ...(Platform.OS === 'android' ? { channelId: 'travel-reminders' } : {}),
          },
          trigger: {
            type: triggerType,
            date: scheduleTime,
          },
        });
      } catch (scheduleErr) {
        console.log('[ReminderService] OS scheduling notice:', scheduleErr.message);
      }
    }
  }

  const newReminder = {
    id: String(notificationId),
    title,
    scheduledTime: scheduleTime.toISOString(),
    displayDate: scheduleTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    displayTime: scheduleTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // Persist reminder metadata to AsyncStorage
  const existing = await getReminders();
  const updated = [newReminder, ...existing];
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));

  console.log('[ReminderService] Scheduled reminder:', newReminder.id, title, scheduleTime.toISOString());
  return newReminder;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Delete / Cancel a reminder
// ─────────────────────────────────────────────────────────────────────────────
export const deleteReminder = async (id) => {
  try {
    // Cancel the scheduled OS notification if available
    if (Notifications && typeof Notifications.cancelScheduledNotificationAsync === 'function') {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    }

    // Remove from local storage
    const existing = await getReminders();
    const updated = existing.filter((r) => r.id !== id);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));

    console.log('[ReminderService] Deleted reminder:', id);
    return true;
  } catch (error) {
    console.log('[ReminderService] Error deleting reminder:', error.message);
    return false;
  }
};

export default {
  requestNotificationPermission,
  getReminders,
  scheduleReminder,
  deleteReminder,
};

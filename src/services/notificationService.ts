/**
 * services/notificationService.ts
 *
 * Manages local push notifications for activity reminders.
 * Notifications are disabled entirely when running inside Expo Go
 * (push notifications require a development build).
 *
 * Key functions:
 *  - registerForPushNotifications() -- request OS permission + create Android channel
 *  - scheduleActivityReminder()     -- batch-schedule reminders for the next 12 hours
 *  - sendTestNotification()         -- fire a one-off test notification after 2 seconds
 *  - cancelAllReminders()           -- remove every pending notification
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getSettings, getFrequencySeconds, isInTimeRange, parseTime } from './settingsService';

/** True when running inside the Expo Go client (no native module access). */
const isExpoGo = Constants.appOwnership === 'expo';

// Configure the foreground notification handler (only in dev builds)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request notification permissions from the OS.
 * On Android, also creates a high-importance notification channel.
 * Returns true if permission was granted, false otherwise.
 */
export async function registerForPushNotifications(): Promise<boolean> {
  if (isExpoGo) {
    console.log('Push notifications not available in Expo Go.');
    return false;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Android requires an explicit notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('activity-reminder', {
      name: 'Activity Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  return true;
}

/**
 * Determine whether a given Date falls inside a blocked window
 * (sleep mode or do-not-disturb). Handles overnight ranges correctly.
 */
function isTimeBlocked(date: Date, settings: { sleepModeEnabled: boolean; sleepStart: string; sleepEnd: string; dndEnabled: boolean; dndStart: string; dndEnd: string }): boolean {
  const minutes = date.getHours() * 60 + date.getMinutes();

  // Check sleep mode window
  if (settings.sleepModeEnabled) {
    const sleepS = parseTime(settings.sleepStart);
    const sleepE = parseTime(settings.sleepEnd);
    const sleepStartMin = sleepS.hours * 60 + sleepS.minutes;
    const sleepEndMin = sleepE.hours * 60 + sleepE.minutes;

    if (sleepStartMin <= sleepEndMin) {
      if (minutes >= sleepStartMin && minutes < sleepEndMin) return true;
    } else {
      if (minutes >= sleepStartMin || minutes < sleepEndMin) return true;
    }
  }

  // Check DND window
  if (settings.dndEnabled) {
    const dndS = parseTime(settings.dndStart);
    const dndE = parseTime(settings.dndEnd);
    const dndStartMin = dndS.hours * 60 + dndS.minutes;
    const dndEndMin = dndE.hours * 60 + dndE.minutes;

    if (dndStartMin <= dndEndMin) {
      if (minutes >= dndStartMin && minutes < dndEndMin) return true;
    } else {
      if (minutes >= dndStartMin || minutes < dndEndMin) return true;
    }
  }

  return false;
}

/**
 * Cancel all existing reminders, then batch-schedule new ones for the
 * next 12 hours based on the user's chosen frequency. Notifications
 * that would land in a sleep or DND window are skipped.
 */
export async function scheduleActivityReminder(): Promise<void> {
  if (isExpoGo) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const settings = await getSettings();
  const intervalMs = getFrequencySeconds(settings.notificationFrequency) * 1000;
  const now = new Date();

  // Schedule notifications for the next 12 hours
  const totalMs = 12 * 60 * 60 * 1000;
  let scheduled = 0;

  for (let offset = intervalMs; offset <= totalMs; offset += intervalMs) {
    const triggerDate = new Date(now.getTime() + offset);

    // Skip if in sleep or DND window
    if (isTimeBlocked(triggerDate, settings)) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'What are you up to? 🎯',
        body: 'Tap to log your current activity!',
        data: { screen: 'Task' },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'activity-reminder' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    scheduled++;
  }

  console.log(`Scheduled ${scheduled} notifications (frequency: ${settings.notificationFrequency})`);
}

/** Fire a quick test notification 2 seconds from now to verify setup. */
export async function sendTestNotification(): Promise<void> {
  if (isExpoGo) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ductivity Test 🎯',
      body: 'Notifications are working!',
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: 'activity-reminder' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

/** Cancel every pending scheduled notification. */
export async function cancelAllReminders(): Promise<void> {
  if (isExpoGo) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getSettings, getFrequencySeconds, isInTimeRange, parseTime } from './settingsService';

const isExpoGo = Constants.appOwnership === 'expo';

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

function isTimeBlocked(date: Date, settings: { sleepModeEnabled: boolean; sleepStart: string; sleepEnd: string; dndEnabled: boolean; dndStart: string; dndEnd: string }): boolean {
  const minutes = date.getHours() * 60 + date.getMinutes();

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

export async function cancelAllReminders(): Promise<void> {
  if (isExpoGo) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<boolean> {
  if (!Device.isDevice) {
    Alert.alert('Notice', 'Push notifications require a physical device.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Notifications Disabled',
      'Please enable notifications in your device settings for activity reminders to work.'
    );
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

export async function scheduleActivityReminder(): Promise<void> {
  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule multiple notifications at 30-min intervals
  // Expo Go doesn't support repeating TIME_INTERVAL well,
  // so we schedule individual notifications for the next 12 hours
  const now = new Date();
  const intervalMs = 1 * 60 * 1000; // 1 minute (for testing, change to 30 * 60 * 1000 for production)
  const count = 24; // 24 notifications = 24 minutes of coverage for testing

  for (let i = 1; i <= count; i++) {
    const triggerDate = new Date(now.getTime() + i * intervalMs);
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
  }

  console.log(`Scheduled ${count} notifications over the next ${count} minutes (testing mode)`);
}

// Send a test notification immediately (for debugging)
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ductivity Test 🎯',
      body: 'Notifications are working! You\'ll be reminded every 30 mins.',
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}

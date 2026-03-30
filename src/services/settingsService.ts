import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@ductivity_settings';

export type NotificationFrequency = '1m' | '2m' | '3m' | '5m' | '30m' | '1h' | '3h';

export interface AppSettings {
  notificationFrequency: NotificationFrequency;
  sleepModeEnabled: boolean;
  sleepStart: string; // "HH:MM" format e.g. "23:00"
  sleepEnd: string;   // "HH:MM" format e.g. "07:00"
  dndEnabled: boolean;
  dndStart: string;   // "HH:MM"
  dndEnd: string;     // "HH:MM"
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationFrequency: '30m',
  sleepModeEnabled: false,
  sleepStart: '23:00',
  sleepEnd: '07:00',
  dndEnabled: false,
  dndStart: '09:00',
  dndEnd: '10:00',
};

export const FREQUENCY_OPTIONS: { label: string; value: NotificationFrequency; seconds: number }[] = [
  { label: '1 min', value: '1m', seconds: 60 },
  { label: '2 min', value: '2m', seconds: 120 },
  { label: '3 min', value: '3m', seconds: 180 },
  { label: '5 min', value: '5m', seconds: 300 },
  { label: '30 min', value: '30m', seconds: 1800 },
  { label: '1 hour', value: '1h', seconds: 3600 },
  { label: '3 hours', value: '3h', seconds: 10800 },
];

export async function getSettings(): Promise<AppSettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getFrequencySeconds(freq: NotificationFrequency): number {
  return FREQUENCY_OPTIONS.find(o => o.value === freq)?.seconds ?? 1800;
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

export function isInTimeRange(startStr: string, endStr: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = parseTime(startStr);
  const end = parseTime(endStr);
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (startMinutes <= endMinutes) {
    // Same day range (e.g., 09:00 - 17:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight range (e.g., 23:00 - 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

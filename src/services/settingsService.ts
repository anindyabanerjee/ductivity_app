/**
 * services/settingsService.ts
 *
 * Manages app-wide preferences (notification frequency, sleep mode, DND)
 * using AsyncStorage for persistence. Also provides time-parsing helpers
 * consumed by the notification scheduler when deciding whether a
 * particular moment falls inside a blocked window.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage key under which serialised settings are stored. */
const SETTINGS_KEY = '@ductivity_settings';

/** Union of allowed notification interval shorthand strings. */
export type NotificationFrequency = '1m' | '2m' | '3m' | '5m' | '30m' | '1h' | '3h';

/** Full shape of the persisted settings object. */
export interface AppSettings {
  notificationFrequency: NotificationFrequency;
  sleepModeEnabled: boolean;
  sleepStart: string; // "HH:MM" format e.g. "23:00"
  sleepEnd: string;   // "HH:MM" format e.g. "07:00"
  dndEnabled: boolean;
  dndStart: string;   // "HH:MM"
  dndEnd: string;     // "HH:MM"
}

/** Factory defaults applied on first launch or after a settings reset. */
export const DEFAULT_SETTINGS: AppSettings = {
  notificationFrequency: '30m',
  sleepModeEnabled: false,
  sleepStart: '23:00',
  sleepEnd: '07:00',
  dndEnabled: false,
  dndStart: '09:00',
  dndEnd: '10:00',
};

/** UI-friendly list mapping each frequency option to its label and duration in seconds. */
export const FREQUENCY_OPTIONS: { label: string; value: NotificationFrequency; seconds: number }[] = [
  { label: '1 min', value: '1m', seconds: 60 },
  { label: '2 min', value: '2m', seconds: 120 },
  { label: '3 min', value: '3m', seconds: 180 },
  { label: '5 min', value: '5m', seconds: 300 },
  { label: '30 min', value: '30m', seconds: 1800 },
  { label: '1 hour', value: '1h', seconds: 3600 },
  { label: '3 hours', value: '3h', seconds: 10800 },
];

/** Load settings from AsyncStorage, merging with defaults for any missing keys. */
export async function getSettings(): Promise<AppSettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
}

/** Persist the full settings object to AsyncStorage. */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Convert a frequency shorthand (e.g. '30m') to seconds. Falls back to 1800 (30 min). */
export function getFrequencySeconds(freq: NotificationFrequency): number {
  return FREQUENCY_OPTIONS.find(o => o.value === freq)?.seconds ?? 1800;
}

// Re-export time utilities from the shared module for backward compatibility
export { parseTime, isCurrentTimeInRange as isInTimeRange } from '../utils/timeUtils';

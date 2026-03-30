/**
 * utils/haptics.ts
 *
 * Thin wrappers around expo-haptics that silently no-op on web.
 * Import these helpers instead of calling Haptics directly so the
 * app never crashes when running in a browser during development.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** True on iOS / Android; false when running in a web browser. */
const isNative = Platform.OS !== 'web';

/** Light tap feedback -- used for button presses. */
export function hapticLight() {
  if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium impact feedback -- used for notable interactions (e.g. "Get Started"). */
export function hapticMedium() {
  if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Success notification vibration -- used after logging an activity. */
export function hapticSuccess() {
  if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

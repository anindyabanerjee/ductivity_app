/**
 * utils/timeUtils.ts
 *
 * Shared time-parsing and range-checking utilities.
 * Used by both notificationService and settingsService to avoid duplication.
 */

/** Parse an "HH:MM" string into numeric hours and minutes. */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/** Convert "HH:MM" to total minutes since midnight. */
export function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

/**
 * Check whether a given minute-of-day value falls inside [start, end).
 * Handles overnight ranges (e.g. 23:00 - 07:00) correctly.
 */
export function isMinuteInRange(currentMinutes: number, startStr: string, endStr: string): boolean {
  const startMin = timeToMinutes(startStr);
  const endMin = timeToMinutes(endStr);

  if (startMin <= endMin) {
    return currentMinutes >= startMin && currentMinutes < endMin;
  }
  // Overnight range
  return currentMinutes >= startMin || currentMinutes < endMin;
}

/**
 * Check whether the current time falls inside the range [startStr, endStr).
 */
export function isCurrentTimeInRange(startStr: string, endStr: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return isMinuteInRange(currentMinutes, startStr, endStr);
}

/**
 * Format a remaining-milliseconds value as "Xm Ys" or "Ys".
 */
export function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return '';
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

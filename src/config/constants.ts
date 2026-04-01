/**
 * config/constants.ts
 *
 * Centralized magic numbers and timing constants used across the app.
 * Import from here instead of hardcoding values in components.
 */

// -- Animation Durations (ms) --
export const SPLASH_DURATION = 2500;
export const SPLASH_FADE_OUT = 400;
export const TOAST_DISPLAY_DURATION = 4000;
export const TOAST_SLIDE_DURATION = 300;
export const FADE_IN_DURATION = 500;
export const CARD_FADE_DURATION = 400;
export const SPRING_DAMPING = 14;

// -- Notification --
export const NOTIFICATION_WINDOW_HOURS = 12;
export const TEST_NOTIFICATION_DELAY_SECONDS = 2;

// -- Cooldown --
export const COOLDOWN_TICK_INTERVAL = 1000; // ms between countdown updates

// -- Layout --
export const TAB_BAR_HEIGHT = 90;
export const SCREEN_PADDING = 20;
export const CARD_GAP = 12;

// -- Firestore --
export const ACTIVITIES_COLLECTION = 'activities';
export const DEFAULT_USER_ID = 'default_user';

// -- Data Retention --
export const RETENTION_DAYS = 90; // 3 months

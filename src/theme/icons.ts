/**
 * theme/icons.ts
 *
 * Maps all emoji usage to Ionicons vector icon names.
 */

export const activityIcons: Record<string, string> = {
  personal_work: 'laptop-outline',
  office_work: 'business-outline',
  relaxing: 'leaf-outline',
  baal_bichi: 'help-circle-outline',
  resting: 'moon-outline',
  learning: 'book-outline',
  eating: 'restaurant-outline',
  playing_cs2: 'game-controller-outline',
};

export const tabIcons = {
  Task: { active: 'add-circle', inactive: 'add-circle-outline' },
  Dashboard: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export const chartTypeIcons: Record<string, string> = {
  pie: 'pie-chart-outline',
  bar: 'bar-chart-outline',
  timeline: 'time-outline',
  progress: 'battery-half-outline',
};

export const sectionIcons: Record<string, string> = {
  notification: 'notifications-outline',
  sleep: 'moon-outline',
  dnd: 'notifications-off-outline',
  clearData: 'trash-outline',
  wordOfDay: 'book-outline',
};

export const miscIcons = {
  logo: 'flame',
  reminder: 'notifications',
  cooldown: 'hourglass-outline',
  emptyChart: 'analytics-outline',
  undo: 'arrow-undo-outline',
};

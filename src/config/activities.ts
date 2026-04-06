/**
 * config/activities.ts
 *
 * Full catalogue of predefined activities users can pick from.
 * The first 5 are pre-selected by default during initial setup.
 */

import { Activity } from '../types';

/** Complete predefined activity catalogue (~12 options) */
export const DEFAULT_ACTIVITIES: Activity[] = [
  // Pre-selected defaults (first 5)
  { id: 'personal_work', name: 'Personal Work', emoji: '💻', icon: 'laptop-outline', category: 'productive' },
  { id: 'office_work', name: 'Office Work', emoji: '🏢', icon: 'business-outline', category: 'productive' },
  { id: 'relaxing', name: 'Relaxing', emoji: '😌', icon: 'leaf-outline', category: 'semi-productive' },
  { id: 'resting', name: 'Resting', emoji: '😴', icon: 'moon-outline', category: 'productive' },
  { id: 'learning', name: 'Learning', emoji: '📚', icon: 'book-outline', category: 'productive' },

  // Additional predefined options
  { id: 'baal_bichi', name: 'Baal Bichi', emoji: '🤷', icon: 'help-circle-outline', category: 'non-productive' },
  { id: 'eating', name: 'Eating', emoji: '🍽️', icon: 'restaurant-outline', category: 'productive' },
  { id: 'playing_cs2', name: 'Playing CS2', emoji: '🎮', icon: 'game-controller-outline', category: 'meh' },
  { id: 'commuting', name: 'Commuting', emoji: '🚌', icon: 'bus-outline', category: 'semi-productive' },
  { id: 'socializing', name: 'Socializing', emoji: '🗣️', icon: 'people-outline', category: 'semi-productive' },
  { id: 'exercise', name: 'Exercise', emoji: '🏋️', icon: 'barbell-outline', category: 'productive' },
  { id: 'meditation', name: 'Meditation', emoji: '🧘', icon: 'flower-outline', category: 'productive' },
];

/** The first 8 activities — pre-selected during initial setup */
export const PRESELECTED_IDS = DEFAULT_ACTIVITIES.slice(0, 8).map((a) => a.id);

/** Icons available for custom activity creation */
export const AVAILABLE_ICONS: string[] = [
  'laptop-outline', 'business-outline', 'leaf-outline', 'moon-outline',
  'book-outline', 'restaurant-outline', 'game-controller-outline',
  'help-circle-outline', 'bus-outline', 'people-outline', 'barbell-outline',
  'flower-outline', 'musical-notes-outline', 'camera-outline',
  'brush-outline', 'code-slash-outline', 'globe-outline', 'heart-outline',
  'cafe-outline', 'cart-outline', 'construct-outline', 'film-outline',
  'home-outline', 'walk-outline',
];

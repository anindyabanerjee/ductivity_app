/**
 * config/activities.ts
 *
 * Static catalogue of trackable activities. Each entry is shown as a
 * tappable card on the Task screen. Add, remove, or re-categorise
 * activities here and the rest of the app picks up the change
 * automatically.
 */

import { Activity } from '../types';

/** Master list of activities the user can log. */
export const ACTIVITIES: Activity[] = [
  { id: 'personal_work', name: 'Personal Work', emoji: '💻', category: 'productive' },
  { id: 'office_work', name: 'Office Work', emoji: '🏢', category: 'productive' },
  { id: 'relaxing', name: 'Relaxing', emoji: '😌', category: 'semi-productive' },
  { id: 'baal_bichi', name: 'Baal Bichi', emoji: '🤷', category: 'non-productive' },
  { id: 'resting', name: 'Resting', emoji: '😴', category: 'productive' },
  { id: 'learning', name: 'Learning', emoji: '📚', category: 'productive' },
  { id: 'eating', name: 'Eating', emoji: '🍽️', category: 'productive' },
  { id: 'playing_cs2', name: 'Playing CS2', emoji: '🎮', category: 'meh' },
];

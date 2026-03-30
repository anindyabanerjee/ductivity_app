import { Activity } from '../types';

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

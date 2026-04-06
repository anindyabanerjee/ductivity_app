/**
 * types/index.ts
 *
 * Central type definitions and constants for the Ductivity app.
 * All shared interfaces, union types, and category-related lookup
 * tables live here so every module imports from a single source.
 */

/** The four productivity buckets an activity can belong to. */
export type CategoryType = 'productive' | 'semi-productive' | 'non-productive' | 'meh';

/** Shape of a selectable activity shown on the Task screen. */
export interface Activity {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  category: CategoryType;
}

/** A single logged activity record stored in Firestore. */
export interface ActivityLog {
  id?: string;        // Firestore document ID (absent before first save)
  userId: string;
  activity: string;
  category: CategoryType;
  timestamp: Date;
}

/** Supported time-range filters used by the Dashboard. */
export type TimeFilter = '3h' | '6h' | '12h' | '24h' | 'daily' | 'weekly' | 'monthly';

/** Maps each category to its brand color (used in charts, badges, borders). */
export const CATEGORY_COLORS: Record<CategoryType, string> = {
  'productive': '#58D68D',
  'semi-productive': '#F0B429',
  'non-productive': '#FF6B6B',
  'meh': '#8B949E',
};

/** Human-readable display labels for each category. */
export const CATEGORY_LABELS: Record<CategoryType, string> = {
  'productive': 'Productive',
  'semi-productive': 'Semi-Productive',
  'non-productive': 'Non-Productive',
  'meh': 'Meh',
};

export type CategoryType = 'productive' | 'semi-productive' | 'non-productive' | 'meh';

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  category: CategoryType;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  activity: string;
  category: CategoryType;
  timestamp: Date;
}

export type TimeFilter = '3h' | '6h' | '12h' | '24h' | 'daily' | 'weekly' | 'monthly';

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  'productive': '#4CAF50',
  'semi-productive': '#FF9800',
  'non-productive': '#F44336',
  'meh': '#9E9E9E',
};

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  'productive': 'Productive',
  'semi-productive': 'Semi-Productive',
  'non-productive': 'Non-Productive',
  'meh': 'Meh',
};

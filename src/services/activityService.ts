/**
 * services/activityService.ts
 *
 * Handles all Firestore CRUD operations for activity logs.
 * - logActivity()   writes a new log document
 * - getActivities() reads logs filtered by a TimeFilter range
 *
 * Currently uses a hard-coded single-user ID; swap USER_ID for a
 * real auth uid if multi-user support is added later.
 */

import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ActivityLog, CategoryType, TimeFilter } from '../types';
import { ACTIVITIES_COLLECTION, DEFAULT_USER_ID } from '../config/constants';
import { getCached, setCache, clearCache } from './queryCache';

const COLLECTION_NAME = ACTIVITIES_COLLECTION;
const USER_ID = DEFAULT_USER_ID;

/** Write a new activity log to Firestore. Returns the document ID for undo support. Invalidates query cache. */
export async function logActivity(activityName: string, category: CategoryType): Promise<string> {
  clearCache(); // Invalidate cached dashboard queries
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId: USER_ID,
    activity: activityName,
    category,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
}

/** Delete a single activity log by its Firestore document ID (used for undo). Invalidates query cache. */
export async function deleteActivity(docId: string): Promise<void> {
  clearCache();
  await deleteDoc(doc(db, COLLECTION_NAME, docId));
}

/**
 * Convert a TimeFilter into the earliest Date that should be included.
 * For example '3h' returns a Date 3 hours ago; 'daily' returns midnight today.
 */
function getFilterStartDate(filter: TimeFilter): Date {
  const now = new Date();
  switch (filter) {
    case '3h':
      return new Date(now.getTime() - 3 * 60 * 60 * 1000);
    case '6h':
      return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    case '12h':
      return new Date(now.getTime() - 12 * 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'daily':
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    case 'weekly':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Fetch activity logs for the current user within the given time range,
 * ordered newest-first. Firestore Timestamps are converted to JS Dates.
 */
export async function getActivities(filter: TimeFilter): Promise<ActivityLog[]> {
  // Return cached result if available (avoids re-fetching on rapid filter switches)
  const cacheKey = `activities_${filter}`;
  const cached = getCached<ActivityLog[]>(cacheKey);
  if (cached) return cached;

  const startDate = getFilterStartDate(filter);
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', USER_ID),
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      activity: data.activity,
      category: data.category as CategoryType,
      timestamp: data.timestamp.toDate(),
    };
  });

  setCache(cacheKey, results);
  return results;
}

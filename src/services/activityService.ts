import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ActivityLog, CategoryType, TimeFilter } from '../types';

const COLLECTION_NAME = 'activities';
const USER_ID = 'default_user'; // Simple single-user setup

export async function logActivity(activityName: string, category: CategoryType): Promise<void> {
  await addDoc(collection(db, COLLECTION_NAME), {
    userId: USER_ID,
    activity: activityName,
    category,
    timestamp: Timestamp.now(),
  });
}

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

export async function getActivities(filter: TimeFilter): Promise<ActivityLog[]> {
  const startDate = getFilterStartDate(filter);
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', USER_ID),
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      activity: data.activity,
      category: data.category as CategoryType,
      timestamp: data.timestamp.toDate(),
    };
  });
}

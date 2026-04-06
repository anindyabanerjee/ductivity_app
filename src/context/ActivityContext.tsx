/**
 * context/ActivityContext.tsx
 *
 * Manages the user's active activity list. Activities are persisted
 * in AsyncStorage and loaded on app start. Supports adding custom
 * activities (max 10) and removing activities (min 5).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from '../types';

const ACTIVITIES_KEY = '@ductivity_activities';
export const MAX_ACTIVITIES = 10;
export const MIN_ACTIVITIES = 8;

interface ActivityContextType {
  activities: Activity[];
  setActivities: (list: Activity[]) => Promise<void>;
  addActivity: (activity: Activity) => Promise<boolean>;
  removeActivity: (id: string) => Promise<boolean>;
  isLoaded: boolean;
  hasSetup: boolean; // true if user has completed initial setup
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  setActivities: async () => {},
  addActivity: async () => false,
  removeActivity: async () => false,
  isLoaded: false,
  hasSetup: false,
});

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivitiesState] = useState<Activity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSetup, setHasSetup] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ACTIVITIES_KEY).then((stored) => {
      if (stored) {
        const parsed = JSON.parse(stored);
        setActivitiesState(parsed);
        setHasSetup(parsed.length > 0);
      }
      setIsLoaded(true);
    });
  }, []);

  const persist = async (list: Activity[]) => {
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
  };

  const setActivities = async (list: Activity[]) => {
    setActivitiesState(list);
    setHasSetup(true);
    await persist(list);
  };

  const addActivity = async (activity: Activity): Promise<boolean> => {
    if (activities.length >= MAX_ACTIVITIES) return false;
    const updated = [...activities, activity];
    setActivitiesState(updated);
    await persist(updated);
    return true;
  };

  const removeActivity = async (id: string): Promise<boolean> => {
    if (activities.length <= MIN_ACTIVITIES) return false;
    const updated = activities.filter((a) => a.id !== id);
    setActivitiesState(updated);
    await persist(updated);
    return true;
  };

  return (
    <ActivityContext.Provider value={{ activities, setActivities, addActivity, removeActivity, isLoaded, hasSetup }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  return useContext(ActivityContext);
}

/**
 * context/UserContext.tsx
 *
 * Provides the current user's name to the entire component tree via
 * React Context. The name is persisted in AsyncStorage so it survives
 * app restarts. Screens use `useUser()` to read or update the name.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage key for the user's display name. */
const USER_NAME_KEY = '@ductivity_userName';

/** Shape of the context value consumed by useUser(). */
interface UserContextType {
  userName: string;
  setUserName: (name: string) => Promise<void>;
  isLoading: boolean;
}

/** Default (empty) context -- overridden by UserProvider at runtime. */
const UserContext = createContext<UserContextType>({
  userName: '',
  setUserName: async () => {},
  isLoading: true,
});

/**
 * UserProvider
 *
 * Wraps the app and loads the stored user name on mount.
 * While loading, `isLoading` is true so consumers can show a loader.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // On mount, hydrate the user name from local storage
  useEffect(() => {
    AsyncStorage.getItem(USER_NAME_KEY).then((name) => {
      if (name) setName(name);
      setIsLoading(false);
    });
  }, []);

  /** Persist a new user name to AsyncStorage and update state. */
  const setUserName = async (name: string) => {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
    setName(name);
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

/** Convenience hook to access the UserContext from any component. */
export function useUser() {
  return useContext(UserContext);
}

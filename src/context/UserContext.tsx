import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_NAME_KEY = '@ductivity_userName';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  userName: '',
  setUserName: async () => {},
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_NAME_KEY).then((name) => {
      if (name) setName(name);
      setIsLoading(false);
    });
  }, []);

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

export function useUser() {
  return useContext(UserContext);
}

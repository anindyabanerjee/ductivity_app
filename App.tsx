import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { UserProvider } from './src/context/UserContext';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import TaskScreen from './src/screens/TaskScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {
  registerForPushNotifications,
  scheduleActivityReminder,
  sendTestNotification,
} from './src/services/notificationService';

// Refresh context to signal TaskScreen to show notification prompt
export const NotificationContext = createContext<{
  notificationTrigger: number;
}>({ notificationTrigger: 0 });

export function useNotificationTrigger() {
  return useContext(NotificationContext);
}

type TabParamList = {
  Task: undefined;
  Dashboard: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const isExpoGo = Constants.appOwnership === 'expo';

type AppScreen = 'splash' | 'welcome' | 'main';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [notificationTrigger, setNotificationTrigger] = useState(0);
  const navigationRef = useRef<NavigationContainerRef<TabParamList>>(null);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    setupNotifications();

    if (!isExpoGo) {
      // When notification received while app is open
      notificationListener.current = Notifications.addNotificationReceivedListener(() => {
        // Navigate to Task tab and trigger refresh
        if (navigationRef.current) {
          navigationRef.current.navigate('Task');
        }
        setNotificationTrigger((prev) => prev + 1);
      });

      // When user taps on notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
        if (navigationRef.current) {
          navigationRef.current.navigate('Task');
        }
        setNotificationTrigger((prev) => prev + 1);
      });
    }

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  const handleSplashFinish = async () => {
    const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
    setScreen(hasSeenWelcome === 'true' ? 'main' : 'welcome');
  };

  const setupNotifications = async () => {
    try {
      const granted = await registerForPushNotifications();
      if (granted) {
        await scheduleActivityReminder();
        await sendTestNotification();
      }
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  if (screen === 'splash') {
    return (
      <UserProvider>
        <SplashScreen onFinish={handleSplashFinish} />
      </UserProvider>
    );
  }

  if (screen === 'welcome') {
    return (
      <UserProvider>
        <WelcomeScreen onComplete={() => setScreen('main')} />
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <NotificationContext.Provider value={{ notificationTrigger }}>
        <NavigationContainer ref={navigationRef}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#0f0f23',
                borderTopColor: '#16213e',
                paddingBottom: 8,
                paddingTop: 8,
                height: 60,
              },
              tabBarActiveTintColor: '#e94560',
              tabBarInactiveTintColor: '#a0a0b0',
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
              },
            }}
          >
            <Tab.Screen
              name="Task"
              component={TaskScreen}
              options={{
                tabBarLabel: 'Log Activity',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ fontSize: size, color }}>🎯</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                tabBarLabel: 'Dashboard',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ fontSize: size, color }}>📊</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ fontSize: size, color }}>⚙️</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </NotificationContext.Provider>
    </UserProvider>
  );
}

/**
 * App.tsx
 *
 * Root component for the Ductivity app. Responsible for:
 *  1. Showing the Splash screen on cold launch
 *  2. Showing the Welcome/onboarding screen for first-time users
 *  3. Rendering the main bottom-tab navigator (Task, Dashboard, Settings)
 *  4. Setting up push notification listeners and passing a trigger
 *     counter to TaskScreen via NotificationContext
 *
 * The entire tree is wrapped in UserProvider so every screen can
 * access the user's name.
 */

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { UserProvider } from './src/context/UserContext';
import { hapticLight } from './src/utils/haptics';
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

/**
 * NotificationContext
 *
 * Provides an incrementing counter that bumps each time a notification
 * is received or tapped. TaskScreen watches this to show the reminder
 * banner and haptic nudge.
 */
export const NotificationContext = createContext<{
  notificationTrigger: number;
}>({ notificationTrigger: 0 });

/** Convenience hook for consuming the notification trigger counter. */
export function useNotificationTrigger() {
  return useContext(NotificationContext);
}

/** Type map for the three tabs in the bottom navigator. */
type TabParamList = {
  Task: undefined;
  Dashboard: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

/** True when running inside Expo Go (push notifications disabled). */
const isExpoGo = Constants.appOwnership === 'expo';

/** The three top-level screens the app can show. */
type AppScreen = 'splash' | 'welcome' | 'main';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [notificationTrigger, setNotificationTrigger] = useState(0);
  const navigationRef = useRef<NavigationContainerRef<TabParamList>>(null);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  // On mount: request notification permissions and subscribe to events
  useEffect(() => {
    setupNotifications();

    if (!isExpoGo) {
      // Foreground: notification received while app is open
      notificationListener.current = Notifications.addNotificationReceivedListener(() => {
        // Navigate to Task tab and bump the trigger counter
        if (navigationRef.current) {
          navigationRef.current.navigate('Task');
        }
        setNotificationTrigger((prev) => prev + 1);
      });

      // Background/killed: user tapped a notification to open the app
      responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
        if (navigationRef.current) {
          navigationRef.current.navigate('Task');
        }
        setNotificationTrigger((prev) => prev + 1);
      });
    }

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  /** After the splash animation, decide whether to show onboarding or main. */
  const handleSplashFinish = async () => {
    const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
    setScreen(hasSeenWelcome === 'true' ? 'main' : 'welcome');
  };

  /** Request permissions, schedule reminders, and fire a test notification. */
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
                paddingBottom: 30,
                paddingTop: 10,
                height: 90,
              },
              tabBarActiveTintColor: '#e94560',
              tabBarInactiveTintColor: '#a0a0b0',
              tabBarIconStyle: {
                marginBottom: 2,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                marginBottom: 8,
              },
            }}
            screenListeners={{
              tabPress: () => hapticLight(),
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

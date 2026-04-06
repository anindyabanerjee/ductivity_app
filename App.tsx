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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './src/theme';

import { UserProvider } from './src/context/UserContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { hapticLight } from './src/utils/haptics';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ActivitySetupScreen from './src/screens/ActivitySetupScreen';
import TaskScreen from './src/screens/TaskScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddActivityScreen from './src/screens/AddActivityScreen';
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
  AddActivity: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

/** True when running inside Expo Go (push notifications disabled). */
const isExpoGo = Constants.appOwnership === 'expo';

/** The four top-level screens the app can show. */
type AppScreen = 'splash' | 'welcome' | 'setup' | 'main';

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

  /** After the splash animation, check version and decide next screen. */
  const handleSplashFinish = async () => {
    // Version-based data reset: clear all user data on new app version
    const APP_VERSION = '1.0.0'; // Must match app.json version
    const storedVersion = await AsyncStorage.getItem('@ductivity_appVersion');
    if (storedVersion !== APP_VERSION) {
      // New version detected — clear all local data for a fresh start
      await AsyncStorage.clear();
      await AsyncStorage.setItem('@ductivity_appVersion', APP_VERSION);
      setScreen('welcome');
      return;
    }

    const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome !== 'true') {
      setScreen('welcome');
      return;
    }
    // Check if user has completed activity setup
    const activities = await AsyncStorage.getItem('@ductivity_activities');
    if (activities && JSON.parse(activities).length > 0) {
      setScreen('main');
    } else {
      setScreen('setup');
    }
  };

  /** Request permissions, schedule reminders, and fire a test notification. */
  const setupNotifications = async () => {
    try {
      const granted = await registerForPushNotifications();
      if (granted) {
        await scheduleActivityReminder();
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
        <WelcomeScreen onComplete={() => setScreen('setup')} />
      </UserProvider>
    );
  }

  if (screen === 'setup') {
    return (
      <UserProvider>
        <ActivityProvider>
          <ActivitySetupScreen onComplete={() => setScreen('main')} />
        </ActivityProvider>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <ActivityProvider>
      <NotificationContext.Provider value={{ notificationTrigger }}>
        <NavigationContainer ref={navigationRef}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarBackground: () => (
                <LinearGradient
                  colors={[colors.bg.secondary, colors.bg.primary]}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
              ),
              tabBarStyle: {
                backgroundColor: 'transparent',
                borderTopColor: colors.border.subtle,
                paddingBottom: 28,
                paddingTop: 8,
                height: 85,
              },
              tabBarActiveTintColor: colors.accent.primary,
              tabBarInactiveTintColor: colors.text.muted,
              tabBarIconStyle: {
                marginBottom: 0,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                marginTop: 2,
                marginBottom: 0,
              },
              tabBarItemStyle: {
                paddingVertical: 4,
                flex: 1,
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
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? 'add-circle' : 'add-circle-outline'}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                tabBarLabel: 'Dashboard',
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? 'stats-chart' : 'stats-chart-outline'}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? 'settings' : 'settings-outline'}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="AddActivity"
              component={AddActivityScreen}
              options={{
                tabBarButton: () => null,
                tabBarItemStyle: { display: 'none' },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </NotificationContext.Provider>
      </ActivityProvider>
    </UserProvider>
  );
}

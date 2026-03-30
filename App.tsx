import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { UserProvider } from './src/context/UserContext';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import TaskScreen from './src/screens/TaskScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import {
  registerForPushNotifications,
  scheduleActivityReminder,
  sendTestNotification,
} from './src/services/notificationService';

type TabParamList = {
  Task: undefined;
  Dashboard: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type AppScreen = 'splash' | 'welcome' | 'main';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const notificationListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    setupNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
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
      <NavigationContainer>
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
        </Tab.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

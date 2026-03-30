/**
 * components/Toast.tsx
 *
 * A top-of-screen toast notification that slides down to confirm an
 * activity was logged, then auto-dismisses after 2.5 seconds.
 * Colour-coded by the activity's category.
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { CATEGORY_COLORS, CategoryType } from '../types';

const screenWidth = Dimensions.get('window').width;

interface ToastProps {
  visible: boolean;
  emoji: string;
  activityName: string;
  category: CategoryType;
  time: string;
  /** Called once the exit animation completes so the parent can unmount the toast. */
  onHide: () => void;
}

export default function Toast({ visible, emoji, activityName, category, time, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  // Animate in when visible becomes true, then auto-hide after 2.5 seconds
  useEffect(() => {
    if (visible) {
      // Slide in from top with spring physics
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 14, stiffness: 120, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
      ]).start();

      // Auto-hide after 2.5s
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -120, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          onHide();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const accentColor = CATEGORY_COLORS[category];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          borderLeftColor: accentColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Animated.View style={styles.textContainer}>
        <Text style={styles.title}>Activity Logged!</Text>
        <Text style={styles.activity}>{activityName}</Text>
        <Text style={styles.time}>{time}</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, { backgroundColor: accentColor + '30' }]}>
        <Text style={[styles.badgeText, { color: accentColor }]}>{category}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  emoji: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    color: '#a0a0b0',
    fontWeight: '500',
    marginBottom: 2,
  },
  activity: {
    fontSize: 17,
    color: '#fff',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});

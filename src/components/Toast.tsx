/**
 * components/Toast.tsx
 *
 * A top-of-screen toast notification that slides down to confirm an
 * activity was logged, with an Undo button to delete the last entry.
 * Auto-dismisses after 4 seconds.
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS, CategoryType } from '../types';

interface ToastProps {
  visible: boolean;
  emoji: string;
  activityName: string;
  category: CategoryType;
  time: string;
  onHide: () => void;
  onUndo?: () => void;
}

function Toast({ visible, emoji, activityName, category, time, onHide, onUndo }: ToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset values for new toast
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.8);

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 14, stiffness: 120, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
      ]).start();

      // Auto-hide after 4s (longer to give time for undo)
      timerRef.current = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.8, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      onHide();
    });
  };

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onUndo) onUndo();
    hideToast();
  };

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
      <View style={styles.textContainer}>
        <Text style={styles.title}>Activity Logged!</Text>
        <Text style={styles.activity}>{activityName}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={[styles.badge, { backgroundColor: accentColor + '30' }]}>
          <Text style={[styles.badgeText, { color: accentColor }]}>{category}</Text>
        </View>
        {onUndo && (
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo} activeOpacity={0.7}>
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default React.memo(Toast);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 14,
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
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: '#a0a0b0',
    fontWeight: '500',
    marginBottom: 2,
  },
  activity: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  undoButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  undoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

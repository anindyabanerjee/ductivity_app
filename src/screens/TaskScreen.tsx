import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { ACTIVITIES } from '../config/activities';
import { logActivity } from '../services/activityService';
import { CATEGORY_COLORS } from '../types';
import { useUser } from '../context/UserContext';
import { AnimatedButton, useFadeInUp, useStaggeredList } from '../utils/animations';
import { hapticSuccess } from '../utils/haptics';

export default function TaskScreen() {
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { userName } = useUser();

  // Animations
  const header = useFadeInUp(0);
  const subheader = useFadeInUp(100);
  const cards = useStaggeredList(ACTIVITIES.length, 60);
  const lastLoggedAnim = useFadeInUp(0);

  // Flash animation for success
  const flashOpacity = useSharedValue(0);
  const flashIndex = useSharedValue(-1);

  useFocusEffect(
    useCallback(() => {
      // Reset and re-animate on tab focus
      header.reset();
      subheader.reset();
      cards.reset();

      // Small delay before animating
      const timer = setTimeout(() => {
        header.animate();
        subheader.animate();
        cards.animate();
      }, 50);

      return () => clearTimeout(timer);
    }, [])
  );

  const handleActivityPress = async (activity: typeof ACTIVITIES[0], index: number) => {
    if (loading) return;
    setLoading(true);
    setLoadingId(activity.id);
    try {
      await logActivity(activity.name, activity.category);
      setLastLogged(activity.name);
      hapticSuccess();

      // Success flash
      flashIndex.value = index;
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );

      lastLoggedAnim.reset();
      lastLoggedAnim.animate();

      Alert.alert(
        'Activity Logged!',
        `${activity.emoji} ${activity.name} logged at ${new Date().toLocaleTimeString()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to log activity. Check your connection.');
      console.error('Error logging activity:', error);
    } finally {
      setLoading(false);
      setLoadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={header.style}>
        <Text style={styles.header}>
          {userName ? `Hey ${userName}, what are you doing?` : 'What are you doing?'}
        </Text>
      </Animated.View>

      <Animated.View style={subheader.style}>
        <Text style={styles.subheader}>Tap to log your current activity</Text>
      </Animated.View>

      <View style={styles.grid}>
        {ACTIVITIES.map((activity, index) => (
          <Animated.View key={activity.id} style={[styles.cardWrapper, cards.items[index].style]}>
            <AnimatedButton
              style={[
                styles.activityCard,
                { borderLeftColor: CATEGORY_COLORS[activity.category] },
                lastLogged === activity.name && styles.activeCard,
              ]}
              onPress={() => handleActivityPress(activity, index)}
              scaleValue={0.94}
            >
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
              <Text style={styles.activityName}>{activity.name}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: CATEGORY_COLORS[activity.category] + '30' },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: CATEGORY_COLORS[activity.category] },
                  ]}
                >
                  {activity.category}
                </Text>
              </View>
              {loadingId === activity.id && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingDot}>...</Text>
                </View>
              )}
            </AnimatedButton>
          </Animated.View>
        ))}
      </View>

      {lastLogged && (
        <Animated.View style={lastLoggedAnim.style}>
          <Text style={styles.lastLoggedText}>
            Last logged: {lastLogged}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: '#a0a0b0',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardWrapper: {
    width: '47%',
  },
  activityCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  activeCard: {
    backgroundColor: '#1a2a4e',
    borderWidth: 1,
    borderColor: 'rgba(233, 69, 96, 0.3)',
  },
  activityEmoji: {
    fontSize: 36,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lastLoggedText: {
    textAlign: 'center',
    color: '#a0a0b0',
    marginTop: 20,
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingDot: {
    color: '#e94560',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

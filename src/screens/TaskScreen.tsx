import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { ACTIVITIES } from '../config/activities';
import { logActivity } from '../services/activityService';
import { CATEGORY_COLORS, CategoryType } from '../types';
import { useUser } from '../context/UserContext';
import { useNotificationTrigger } from '../../App';
import { AnimatedButton, useFadeInUp, FadeInCard } from '../utils/animations';
import { hapticSuccess, hapticMedium } from '../utils/haptics';
import Toast from '../components/Toast';

interface ToastData {
  emoji: string;
  activityName: string;
  category: CategoryType;
  time: string;
}

export default function TaskScreen() {
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const { userName } = useUser();
  const { notificationTrigger } = useNotificationTrigger();
  const reminderPulse = useRef(new Animated.Value(1)).current;

  const header = useFadeInUp(0);
  const subheader = useFadeInUp(100);
  const lastLoggedAnim = useFadeInUp(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => {
        header.animate();
        subheader.animate();
      }, 50);
    }
  }, []);

  // Show reminder banner when notification arrives
  useEffect(() => {
    if (notificationTrigger > 0) {
      setShowReminder(true);
      hapticMedium();
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(reminderPulse, { toValue: 1.02, duration: 600, useNativeDriver: true }),
          Animated.timing(reminderPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [notificationTrigger]);

  const handleActivityPress = async (activity: typeof ACTIVITIES[0]) => {
    if (loading) return;
    setLoading(true);
    setLoadingId(activity.id);
    try {
      await logActivity(activity.name, activity.category);
      setLastLogged(activity.name);
      setShowReminder(false);
      hapticSuccess();
      lastLoggedAnim.animate();

      // Show custom toast
      setToast({
        emoji: activity.emoji,
        activityName: activity.name,
        category: activity.category,
        time: new Date().toLocaleTimeString(),
      });
      setToastVisible(true);
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

      {/* Reminder Banner */}
      {showReminder && (
        <Animated.View style={[styles.reminderBanner, { transform: [{ scale: reminderPulse }] }]}>
          <Text style={styles.reminderEmoji}>🔔</Text>
          <View style={styles.reminderTextContainer}>
            <Text style={styles.reminderTitle}>Time to log!</Text>
            <Text style={styles.reminderDesc}>What have you been doing?</Text>
          </View>
        </Animated.View>
      )}

      {/* Custom Toast */}
      {toast && (
        <Toast
          visible={toastVisible}
          emoji={toast.emoji}
          activityName={toast.activityName}
          category={toast.category}
          time={toast.time}
          onHide={() => setToastVisible(false)}
        />
      )}

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
          <FadeInCard key={activity.id} delay={150 + index * 60} style={styles.cardWrapper}>
            <AnimatedButton
              style={[
                styles.activityCard,
                { borderLeftColor: CATEGORY_COLORS[activity.category] },
                lastLogged === activity.name && styles.activeCard,
              ]}
              onPress={() => handleActivityPress(activity)}
              scaleValue={0.94}
            >
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
              <Text style={styles.activityName}>{activity.name}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[activity.category] + '30' }]}>
                <Text style={[styles.categoryText, { color: CATEGORY_COLORS[activity.category] }]}>
                  {activity.category}
                </Text>
              </View>
              {loadingId === activity.id && (
                <View style={styles.loadingOverlay}>
                  <Text style={styles.loadingDot}>...</Text>
                </View>
              )}
            </AnimatedButton>
          </FadeInCard>
        ))}
      </View>
      {lastLogged && (
        <Animated.View style={lastLoggedAnim.style}>
          <Text style={styles.lastLoggedText}>Last logged: {lastLogged}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 20, paddingTop: 60 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#a0a0b0', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  cardWrapper: { width: '47%' },
  activityCard: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, borderLeftWidth: 4, alignItems: 'center', gap: 8, overflow: 'hidden' },
  activeCard: { backgroundColor: '#1a2a4e', borderWidth: 1, borderColor: 'rgba(233, 69, 96, 0.3)' },
  activityEmoji: { fontSize: 36 },
  activityName: { fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  categoryText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  lastLoggedText: { textAlign: 'center', color: '#a0a0b0', marginTop: 20, fontSize: 13 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 26, 46, 0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  loadingDot: { color: '#e94560', fontSize: 24, fontWeight: 'bold' },
  reminderBanner: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reminderEmoji: { fontSize: 28 },
  reminderTextContainer: { flex: 1 },
  reminderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  reminderDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
});

/**
 * screens/TaskScreen.tsx
 *
 * Main activity-logging screen. Uses FlatList with numColumns
 * for stable card rendering that survives state changes.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { ACTIVITIES } from '../config/activities';
import { logActivity, deleteActivity } from '../services/activityService';
import { getSettings, getFrequencySeconds } from '../services/settingsService';
import { formatCountdown } from '../utils/timeUtils';
import { COOLDOWN_TICK_INTERVAL } from '../config/constants';
import { CATEGORY_COLORS, CategoryType } from '../types';
import { useUser } from '../context/UserContext';
import { hapticSuccess, hapticMedium, hapticLight } from '../utils/haptics';
import Toast from '../components/Toast';
import { useNotificationTrigger } from '../../App';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

interface ToastData {
  emoji: string;
  activityName: string;
  category: CategoryType;
  time: string;
}

/** Individual card component — memoized to prevent unnecessary re-renders */
const ActivityCard = React.memo(({
  activity,
  isActive,
  isLoading,
  onPress,
}: {
  activity: typeof ACTIVITIES[0];
  isActive: boolean;
  isLoading: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.activityCard,
      { borderLeftColor: CATEGORY_COLORS[activity.category] },
      isActive ? styles.activeCard : null,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={isLoading}
  >
    <Text style={styles.activityEmoji}>{activity.emoji}</Text>
    <Text style={styles.activityName}>{activity.name}</Text>
    <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[activity.category] + '30' }]}>
      <Text style={[styles.categoryText, { color: CATEGORY_COLORS[activity.category] }]}>
        {activity.category}
      </Text>
    </View>
    {isLoading && (
      <View style={styles.loadingOverlay}>
        <Text style={styles.loadingDot}>...</Text>
      </View>
    )}
  </TouchableOpacity>
));

export default function TaskScreen() {
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [lastLogTime, setLastLogTime] = useState<number>(0); // when the last activity was logged
  const [cooldownEnd, setCooldownEnd] = useState<number>(0); // timestamp when user can log again
  const [cooldownText, setCooldownText] = useState<string>('');
  const { userName } = useUser();
  const { notificationTrigger } = useNotificationTrigger();
  const isFocused = useIsFocused();
  const reminderPulse = useRef(new Animated.Value(1)).current;

  // Recalculate cooldown when screen regains focus (e.g. after changing settings)
  useEffect(() => {
    if (isFocused && lastLogTime > 0) {
      getSettings().then((settings) => {
        const cooldownMs = getFrequencySeconds(settings.notificationFrequency) * 1000;
        const newEnd = lastLogTime + cooldownMs;
        if (newEnd > Date.now()) {
          setCooldownEnd(newEnd);
        } else {
          // Cooldown already expired with new frequency
          setCooldownEnd(0);
          setCooldownText('');
        }
      });
    }
  }, [isFocused]);

  // Cooldown countdown timer — pauses when screen is not focused
  useEffect(() => {
    if (!isFocused || cooldownEnd <= Date.now()) return;
    const interval = setInterval(() => {
      const remaining = cooldownEnd - Date.now();
      if (remaining <= 0) {
        setCooldownText('');
        clearInterval(interval);
      } else {
        setCooldownText(formatCountdown(remaining));
      }
    }, COOLDOWN_TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [cooldownEnd, isFocused]);

  useEffect(() => {
    if (notificationTrigger > 0) {
      setShowReminder(true);
      hapticMedium();
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

    // Check cooldown
    if (cooldownEnd > Date.now()) {
      Alert.alert(
        'Already Logged',
        `You can log again in ${cooldownText}. Only one activity per notification interval.`
      );
      return;
    }

    hapticLight();
    setLoading(true);
    setLoadingId(activity.id);
    try {
      const docId = await logActivity(activity.name, activity.category);
      setLastDocId(docId);
      setLastLogged(activity.name);
      setShowReminder(false);
      hapticSuccess();

      // Start cooldown based on notification frequency from settings
      const now = Date.now();
      setLastLogTime(now);
      const settings = await getSettings();
      const cooldownMs = getFrequencySeconds(settings.notificationFrequency) * 1000;
      setCooldownEnd(now + cooldownMs);

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

  const handleUndo = async () => {
    if (!lastDocId) return;
    try {
      await deleteActivity(lastDocId);
      setLastDocId(null);
      setLastLogged(null);
      setLastLogTime(0);
      setCooldownEnd(0);
      setCooldownText('');
      hapticLight();
    } catch (error) {
      Alert.alert('Error', 'Failed to undo. The entry may have already been removed.');
    }
  };

  const renderCard = ({ item }: { item: typeof ACTIVITIES[0] }) => (
    <ActivityCard
      activity={item}
      isActive={lastLogged === item.name}
      isLoading={loadingId === item.id}
      onPress={() => handleActivityPress(item)}
    />
  );

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

      {/* Custom Toast — rendered outside scrollable area */}
      {toast && (
        <Toast
          visible={toastVisible}
          emoji={toast.emoji}
          activityName={toast.activityName}
          category={toast.category}
          time={toast.time}
          onHide={() => setToastVisible(false)}
          onUndo={handleUndo}
        />
      )}

      <Text style={styles.header}>
        {userName ? `Hey ${userName}, what are you doing?` : 'What are you doing?'}
      </Text>
      <Text style={styles.subheader}>Tap to log your current activity</Text>

      {/* Cooldown indicator */}
      {cooldownEnd > Date.now() && cooldownText !== '' && (
        <View style={styles.cooldownBanner}>
          <Text style={styles.cooldownIcon}>⏳</Text>
          <Text style={styles.cooldownText}>
            Next log available in <Text style={styles.cooldownTime}>{cooldownText}</Text>
          </Text>
        </View>
      )}

      {/* FlatList with numColumns for stable grid rendering */}
      <FlatList
        data={ACTIVITIES}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        removeClippedSubviews={false}
        ListFooterComponent={
          lastLogged ? (
            <Text style={styles.lastLoggedText}>Last logged: {lastLogged}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: CARD_PADDING,
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
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  activityCard: {
    width: CARD_WIDTH,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  activeCard: {
    backgroundColor: '#1a2a4e',
    borderWidth: 1,
    borderColor: 'rgba(233, 69, 96, 0.3)',
  },
  activityEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
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
    marginTop: 12,
    fontSize: 13,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  reminderBanner: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 6,
  },
  reminderEmoji: { fontSize: 28 },
  reminderTextContainer: { flex: 1 },
  reminderTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  reminderDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  cooldownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF980030',
  },
  cooldownIcon: { fontSize: 18 },
  cooldownText: { color: '#a0a0b0', fontSize: 13 },
  cooldownTime: { color: '#FF9800', fontWeight: 'bold' },
});

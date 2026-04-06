/**
 * screens/TaskScreen.tsx
 *
 * Main activity-logging screen. Uses FlatList with numColumns
 * for stable card rendering that survives state changes.
 * Activities are sourced from ActivityContext instead of config.
 * Supports adding custom activities and removing via long-press.
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
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useActivities, MAX_ACTIVITIES } from '../context/ActivityContext';
import { logActivity, deleteActivity } from '../services/activityService';
import { getSettings, getFrequencySeconds } from '../services/settingsService';
import { formatCountdown } from '../utils/timeUtils';
import { COOLDOWN_TICK_INTERVAL } from '../config/constants';
import { CATEGORY_COLORS, CategoryType, Activity } from '../types';
import { useUser } from '../context/UserContext';
import { hapticSuccess, hapticMedium, hapticLight } from '../utils/haptics';
import Toast from '../components/Toast';
import { useNotificationTrigger } from '../../App';
import GradientBackground from '../components/ui/GradientBackground';
import GlassCard from '../components/ui/GlassCard';
import IconCircle from '../components/ui/IconCircle';
import { colors, spacing, radius, shadows } from '../theme';

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

/** Individual card component -- memoized to prevent unnecessary re-renders */
const ActivityCard = React.memo(({
  activity,
  isActive,
  isLoading,
  onPress,
  onLongPress,
}: {
  activity: Activity;
  isActive: boolean;
  isLoading: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) => {
  const catColor = CATEGORY_COLORS[activity.category];

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      disabled={isLoading}
      style={{ width: CARD_WIDTH }}
    >
      <GlassCard
        glowColor={catColor}
        style={[
          isActive ? styles.activeCard : undefined,
          { borderWidth: 1, borderColor: catColor + '26' },
        ]}
      >
        <View style={styles.cardContent}>
          <IconCircle
            name={activity.icon as any}
            size={22}
            color={catColor}
            backgroundColor={catColor + '20'}
          />
          <Text style={styles.activityName}>{activity.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + '30' }]}>
            <Text style={[styles.categoryText, { color: catColor }]}>
              {activity.category}
            </Text>
          </View>
        </View>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingDot}>...</Text>
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
});

/** Special "Add Activity" card */
const AddCard = React.memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{ width: CARD_WIDTH }}
  >
    <GlassCard style={styles.addCard}>
      <View style={styles.cardContent}>
        <IconCircle
          name="add-circle-outline"
          size={22}
          color={colors.accent.primary}
          backgroundColor={colors.accent.muted}
        />
        <Text style={[styles.activityName, { color: colors.accent.primary }]}>Add</Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.accent.muted }]}>
          <Text style={[styles.categoryText, { color: colors.accent.primary }]}>
            custom
          </Text>
        </View>
      </View>
    </GlassCard>
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
  const [lastLogTime, setLastLogTime] = useState<number>(0);
  const [cooldownEnd, setCooldownEnd] = useState<number>(0);
  const [cooldownText, setCooldownText] = useState<string>('');
  const [showCooldownModal, setShowCooldownModal] = useState(false);

  const { activities, removeActivity } = useActivities();
  const navigation = useNavigation<any>();
  const { userName } = useUser();
  const { notificationTrigger } = useNotificationTrigger();
  const isFocused = useIsFocused();
  const reminderPulse = useRef(new Animated.Value(1)).current;

  // Build list data: activities + optional add card placeholder
  const listData: Activity[] = [
    ...activities,
    ...(activities.length < MAX_ACTIVITIES
      ? [{ id: '__add__', name: 'Add', emoji: '+', icon: 'add-circle-outline', category: 'productive' as const }]
      : []),
  ];

  // Recalculate cooldown when screen regains focus (e.g. after changing settings)
  useEffect(() => {
    if (isFocused && lastLogTime > 0) {
      getSettings().then((settings) => {
        const cooldownMs = getFrequencySeconds(settings.notificationFrequency) * 1000;
        const newEnd = lastLogTime + cooldownMs;
        if (newEnd > Date.now()) {
          setCooldownEnd(newEnd);
        } else {
          setCooldownEnd(0);
          setCooldownText('');
        }
      });
    }
  }, [isFocused]);

  // Cooldown countdown timer -- pauses when screen is not focused
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

  const handleActivityPress = async (activity: Activity) => {
    if (loading) return;

    // Check cooldown
    if (cooldownEnd > Date.now()) {
      setShowCooldownModal(true);
      hapticLight();
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

  const handleLongPress = (activity: Activity) => {
    if (activities.length <= 5) {
      Alert.alert(
        'Cannot Remove',
        `You need at least 5 activities. You currently have ${activities.length}.`
      );
      return;
    }
    Alert.alert(
      `Remove ${activity.name}?`,
      `You have ${activities.length} activities (minimum 5).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const removed = await removeActivity(activity.id);
            if (removed) {
              hapticSuccess();
            }
          },
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: Activity }) => {
    if (item.id === '__add__') {
      return <AddCard onPress={() => { hapticLight(); navigation.navigate('AddActivity'); }} />;
    }

    return (
      <ActivityCard
        activity={item}
        isActive={lastLogged === item.name}
        isLoading={loadingId === item.id}
        onPress={() => handleActivityPress(item)}
        onLongPress={() => handleLongPress(item)}
      />
    );
  };

  return (
    <GradientBackground style={{ paddingHorizontal: CARD_PADDING, paddingTop: 60 }}>
      <StatusBar barStyle="light-content" />

      {/* Reminder Banner */}
      {showReminder && (
        <Animated.View style={[styles.reminderBanner, { transform: [{ scale: reminderPulse }] }]}>
          <Ionicons name="notifications" size={24} color="#fff" />
          <View style={styles.reminderTextContainer}>
            <Text style={styles.reminderTitle}>Time to log!</Text>
            <Text style={styles.reminderDesc}>What have you been doing?</Text>
          </View>
        </Animated.View>
      )}

      {/* Custom Toast -- rendered outside scrollable area */}
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
          <Ionicons name="hourglass-outline" size={18} color={colors.category['semi-productive']} />
          <Text style={styles.cooldownText}>
            Next log available in <Text style={styles.cooldownTime}>{cooldownText}</Text>
          </Text>
        </View>
      )}

      {/* FlatList with numColumns for stable grid rendering */}
      <FlatList
        data={listData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListFooterComponent={
          lastLogged ? (
            <Text style={styles.lastLoggedText}>Last logged: {lastLogged}</Text>
          ) : null
        }
      />

      {/* Cooldown Modal */}
      <Modal
        visible={showCooldownModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCooldownModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCooldownModal(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="time-outline" size={32} color={colors.category['semi-productive']} />
            </View>
            <Text style={styles.modalTitle}>Already Logged</Text>
            <Text style={styles.modalMessage}>
              You can log again in{'\n'}
              <Text style={styles.modalTimer}>{cooldownText}</Text>
            </Text>
            <Text style={styles.modalHint}>One activity per notification interval</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCooldownModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  cardContent: {
    alignItems: 'center',
  },
  activeCard: {
    borderColor: colors.border.accent,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
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
    color: colors.text.muted,
    marginTop: 12,
    fontSize: 13,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingDot: {
    color: colors.accent.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  addCard: {
    borderWidth: 1,
    borderColor: colors.accent.muted,
    borderStyle: 'dashed',
  },
  reminderBanner: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 6,
  },
  reminderTextContainer: { flex: 1 },
  reminderTitle: { color: colors.text.primary, fontSize: 16, fontWeight: 'bold' },
  reminderDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  cooldownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.category['semi-productive'] + '30',
  },
  cooldownText: { color: colors.text.muted, fontSize: 13 },
  cooldownTime: { color: colors.category['semi-productive'], fontWeight: 'bold' },

  // Cooldown modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalCard: {
    backgroundColor: colors.bg.secondary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    width: '100%',
    shadowColor: colors.category['semi-productive'],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.category['semi-productive'] + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 4,
  },
  modalTimer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.category['semi-productive'],
  },
  modalHint: {
    fontSize: 12,
    color: colors.text.dim,
    marginBottom: 20,
    marginTop: 4,
  },
  modalButton: {
    backgroundColor: colors.category['semi-productive'] + '20',
    borderWidth: 1,
    borderColor: colors.category['semi-productive'],
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonText: {
    color: colors.category['semi-productive'],
    fontSize: 15,
    fontWeight: '600',
  },

});

/**
 * screens/SettingsScreen.tsx
 *
 * User preferences screen. Allows configuration of:
 *  - Notification frequency (1 min to 3 hours)
 *  - Sleep mode (suppress notifications overnight)
 *  - Do Not Disturb (suppress notifications during a custom window)
 *  - Data management (clear activities, reset settings, full wipe)
 *
 * Changes are persisted via settingsService and applied immediately
 * when the user taps "Save & Apply".
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
  Alert,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
import { useActivities, MIN_ACTIVITIES, MAX_ACTIVITIES } from '../context/ActivityContext';
import { AnimatedButton, useFadeInUp } from '../utils/animations';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  FREQUENCY_OPTIONS,
  NotificationFrequency,
  getSettings,
  saveSettings,
} from '../services/settingsService';
import {
  scheduleActivityReminder,
  cancelAllReminders,
} from '../services/notificationService';
import GradientBackground from '../components/ui/GradientBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionHeader from '../components/ui/SectionHeader';
import { CATEGORY_COLORS } from '../types';
import { colors } from '../theme';

/** Pre-computed list of "HH:00" strings for the 24-hour time picker. */
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});

/**
 * TimePicker -- small inline hour selector with +/- buttons.
 * Wraps around from 23:00 to 00:00 and vice-versa.
 */
function TimePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const currentIndex = HOURS.indexOf(value);

  return (
    <View style={styles.timePickerContainer}>
      <Text style={styles.timePickerLabel}>{label}</Text>
      <View style={styles.timePickerRow}>
        <AnimatedButton
          style={styles.timeArrow}
          onPress={() => {
            const newIndex = (currentIndex - 1 + 24) % 24;
            onChange(HOURS[newIndex]);
          }}
          scaleValue={0.9}
        >
          <Text style={styles.timeArrowText}>-</Text>
        </AnimatedButton>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>{value}</Text>
        </View>
        <AnimatedButton
          style={styles.timeArrow}
          onPress={() => {
            const newIndex = (currentIndex + 1) % 24;
            onChange(HOURS[newIndex]);
          }}
          scaleValue={0.9}
        >
          <Text style={styles.timeArrowText}>+</Text>
        </AnimatedButton>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const { userName } = useUser();
  const { activities, removeActivity } = useActivities();

  const header = useFadeInUp(0);
  const hasAnimated = useRef(false);

  // Load persisted settings on mount
  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  // Animate header once on first render
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => header.animate(), 50);
    }
  }, []);

  /** Update a single setting key, persist, and refresh local state. */
  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const navigation = useNavigation<any>();

  /** Persist current settings, reschedule notifications, and navigate to Task. */
  const handleSaveAndApply = async () => {
    await saveSettings(settings);
    await scheduleActivityReminder();
    hapticSuccess();
    navigation.navigate('Task');
  };

  // Don't render until settings have been loaded from storage
  if (!loaded) return null;

  return (
    <GradientBackground style={{ paddingTop: 60 }}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={header.style}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subheader}>
          {userName ? `${userName}'s preferences` : 'Your preferences'}
        </Text>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notification Frequency */}
        <GlassCard>
          <SectionHeader title="Notification Frequency" iconName="notifications-outline" />
          <Text style={styles.sectionDesc}>How often should we remind you to log activity?</Text>
          <View style={styles.frequencyGrid}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <AnimatedButton
                key={opt.value}
                style={[
                  styles.frequencyButton,
                  settings.notificationFrequency === opt.value && styles.frequencyActive,
                ]}
                onPress={() => updateSetting('notificationFrequency', opt.value)}
                scaleValue={0.93}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    settings.notificationFrequency === opt.value && styles.frequencyTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </AnimatedButton>
            ))}
          </View>
        </GlassCard>

        {/* Sleep Mode */}
        <GlassCard style={{ marginTop: 16 }}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <SectionHeader title="Sleep Mode" iconName="moon-outline" />
              <Text style={styles.sectionDesc}>No notifications during sleep hours</Text>
            </View>
            <Switch
              value={settings.sleepModeEnabled}
              onValueChange={(v) => {
                hapticLight();
                updateSetting('sleepModeEnabled', v);
              }}
              trackColor={{ false: colors.text.dim, true: colors.accent.muted }}
              thumbColor={settings.sleepModeEnabled ? colors.accent.primary : colors.text.muted}
            />
          </View>
          {settings.sleepModeEnabled && (
            <View style={styles.timeRow}>
              <TimePicker
                label="From"
                value={settings.sleepStart}
                onChange={(v) => updateSetting('sleepStart', v)}
              />
              <Text style={styles.timeSeparator}>to</Text>
              <TimePicker
                label="Until"
                value={settings.sleepEnd}
                onChange={(v) => updateSetting('sleepEnd', v)}
              />
            </View>
          )}
        </GlassCard>

        {/* Do Not Disturb */}
        <GlassCard style={{ marginTop: 16 }}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <SectionHeader title="Do Not Disturb" iconName="notifications-off-outline" />
              <Text style={styles.sectionDesc}>Pause notifications for a time span</Text>
            </View>
            <Switch
              value={settings.dndEnabled}
              onValueChange={(v) => {
                hapticLight();
                updateSetting('dndEnabled', v);
              }}
              trackColor={{ false: colors.text.dim, true: colors.accent.muted }}
              thumbColor={settings.dndEnabled ? colors.accent.primary : colors.text.muted}
            />
          </View>
          {settings.dndEnabled && (
            <View style={styles.timeRow}>
              <TimePicker
                label="From"
                value={settings.dndStart}
                onChange={(v) => updateSetting('dndStart', v)}
              />
              <Text style={styles.timeSeparator}>to</Text>
              <TimePicker
                label="Until"
                value={settings.dndEnd}
                onChange={(v) => updateSetting('dndEnd', v)}
              />
            </View>
          )}
        </GlassCard>

        {/* Your Activities Section */}
        <GlassCard style={{ marginTop: 16 }}>
          <SectionHeader title="Your Activities" iconName="grid-outline" />
          <Text style={styles.sectionDesc}>
            {activities.length}/{MAX_ACTIVITIES} activities
          </Text>
          {activities.map((activity) => {
            const catColor = CATEGORY_COLORS[activity.category];
            const canRemove = activities.length > MIN_ACTIVITIES;
            return (
              <View key={activity.id} style={styles.activityRow}>
                <Ionicons name={activity.icon as any} size={20} color={catColor} style={{ marginRight: 10 }} />
                <Text style={styles.activityRowName}>{activity.name}</Text>
                <View style={[styles.activityRowBadge, { backgroundColor: catColor + '30' }]}>
                  <Text style={[styles.activityRowBadgeText, { color: catColor }]}>
                    {activity.category}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (!canRemove) {
                      Alert.alert('Minimum Reached', `You need at least ${MIN_ACTIVITIES} activities.`);
                      return;
                    }
                    Alert.alert(
                      `Remove ${activity.name}?`,
                      `You have ${activities.length} activities (minimum ${MIN_ACTIVITIES}).`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: async () => {
                            await removeActivity(activity.id);
                            hapticSuccess();
                          },
                        },
                      ]
                    );
                  }}
                  disabled={!canRemove}
                  style={{ opacity: canRemove ? 1 : 0.3, marginLeft: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.status.danger} />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Add Activity button */}
          {activities.length < MAX_ACTIVITIES && (
            <TouchableOpacity
              style={styles.addActivityRow}
              onPress={() => {
                hapticLight();
                navigation.navigate('AddActivity');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.accent.primary} style={{ marginRight: 10 }} />
              <Text style={[styles.activityRowName, { color: colors.accent.primary }]}>
                Add New Activity
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Clear Data Section */}
        <GlassCard style={{ marginTop: 16 }}>
          <SectionHeader title="Clear Data" iconName="trash-outline" />
          <Text style={styles.sectionDesc}>Remove your data from this app</Text>

          <AnimatedButton
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Clear Activity History',
                'This will delete all your logged activities from the database. This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear Activities',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const q = query(
                          collection(db, 'activities'),
                          where('userId', '==', 'default_user')
                        );
                        const snapshot = await getDocs(q);
                        const deletes = snapshot.docs.map((doc) => deleteDoc(doc.ref));
                        await Promise.all(deletes);
                        hapticSuccess();
                        Alert.alert('Done', `Deleted ${snapshot.size} activities.`);
                      } catch (e) {
                        Alert.alert('Error', 'Failed to clear activities.');
                      }
                    },
                  },
                ]
              );
            }}
            scaleValue={0.96}
          >
            <Ionicons name="clipboard-outline" size={24} color={colors.text.muted} />
            <View>
              <Text style={styles.clearButtonText}>Clear Activity History</Text>
              <Text style={styles.clearButtonDesc}>Delete all logged activities</Text>
            </View>
          </AnimatedButton>

          <AnimatedButton
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Reset Settings',
                'This will reset all settings to defaults.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                      await saveSettings(DEFAULT_SETTINGS);
                      setSettings(DEFAULT_SETTINGS);
                      hapticSuccess();
                      Alert.alert('Done', 'Settings reset to defaults.');
                    },
                  },
                ]
              );
            }}
            scaleValue={0.96}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.muted} />
            <View>
              <Text style={styles.clearButtonText}>Reset Settings</Text>
              <Text style={styles.clearButtonDesc}>Restore default preferences</Text>
            </View>
          </AnimatedButton>

          <AnimatedButton
            style={[styles.clearButton, styles.dangerButton]}
            onPress={() => {
              Alert.alert(
                'Clear All Data',
                'This will delete ALL your data: activities, settings, name, and welcome state. The app will restart fresh. This cannot be undone!',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear Everything',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Clear Firestore activities
                        const q = query(
                          collection(db, 'activities'),
                          where('userId', '==', 'default_user')
                        );
                        const snapshot = await getDocs(q);
                        const deletes = snapshot.docs.map((doc) => deleteDoc(doc.ref));
                        await Promise.all(deletes);

                        // Clear all local storage
                        await AsyncStorage.clear();

                        // Cancel notifications
                        await cancelAllReminders();

                        hapticSuccess();
                        Alert.alert(
                          'All Data Cleared',
                          'Restart the app to begin fresh.',
                          [{ text: 'OK' }]
                        );
                      } catch (e) {
                        Alert.alert('Error', 'Failed to clear all data.');
                      }
                    },
                  },
                ]
              );
            }}
            scaleValue={0.96}
          >
            <Ionicons name="warning-outline" size={24} color={colors.status.danger} />
            <View>
              <Text style={[styles.clearButtonText, { color: colors.status.danger }]}>Clear All Data</Text>
              <Text style={styles.clearButtonDesc}>Delete everything and start fresh</Text>
            </View>
          </AnimatedButton>
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pinned Save & Apply button */}
      <View style={styles.pinnedButtonContainer}>
        <GradientButton onPress={handleSaveAndApply}>
          Save & Apply
        </GradientButton>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 28, fontWeight: 'bold', color: colors.text.primary, paddingHorizontal: 20, marginBottom: 4 },
  subheader: { fontSize: 14, color: colors.text.muted, paddingHorizontal: 20, marginBottom: 20 },
  scrollView: { flex: 1, paddingHorizontal: 20 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionDesc: { fontSize: 12, color: colors.text.muted, marginBottom: 12 },

  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  frequencyActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  frequencyText: { color: colors.text.muted, fontSize: 13, fontWeight: '600' },
  frequencyTextActive: { color: colors.text.primary },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
  },
  timeSeparator: { color: colors.text.muted, fontSize: 14 },

  timePickerContainer: { alignItems: 'center' },
  timePickerLabel: { fontSize: 11, color: colors.text.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  timeArrowText: { color: colors.accent.primary, fontSize: 20, fontWeight: 'bold' },
  timeDisplay: {
    backgroundColor: colors.bg.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: { color: colors.text.primary, fontSize: 18, fontWeight: '600' },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.primary,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  dangerButton: {
    borderColor: colors.status.danger + '30',
  },
  clearButtonText: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  clearButtonDesc: { color: colors.text.dim, fontSize: 11, marginTop: 2 },

  // Activity management styles
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  activityRowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  activityRowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityRowBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.accent.muted,
    borderStyle: 'dashed',
  },
  pinnedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});

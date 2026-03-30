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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUser } from '../context/UserContext';
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

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});

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

  const header = useFadeInUp(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => header.animate(), 50);
    }
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const navigation = useNavigation<any>();

  const handleSaveAndApply = async () => {
    await saveSettings(settings);
    await scheduleActivityReminder();
    hapticSuccess();
    navigation.navigate('Task');
  };

  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={header.style}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subheader}>
          {userName ? `${userName}'s preferences` : 'Your preferences'}
        </Text>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notification Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notification Frequency</Text>
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
        </View>

        {/* Sleep Mode */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>😴 Sleep Mode</Text>
              <Text style={styles.sectionDesc}>No notifications during sleep hours</Text>
            </View>
            <Switch
              value={settings.sleepModeEnabled}
              onValueChange={(v) => {
                hapticLight();
                updateSetting('sleepModeEnabled', v);
              }}
              trackColor={{ false: '#333', true: '#e9456080' }}
              thumbColor={settings.sleepModeEnabled ? '#e94560' : '#888'}
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
        </View>

        {/* Do Not Disturb */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🔕 Do Not Disturb</Text>
              <Text style={styles.sectionDesc}>Pause notifications for a time span</Text>
            </View>
            <Switch
              value={settings.dndEnabled}
              onValueChange={(v) => {
                hapticLight();
                updateSetting('dndEnabled', v);
              }}
              trackColor={{ false: '#333', true: '#e9456080' }}
              thumbColor={settings.dndEnabled ? '#e94560' : '#888'}
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
        </View>

        {/* Apply Button */}
        <AnimatedButton
          style={styles.applyButton}
          onPress={handleSaveAndApply}
          scaleValue={0.96}
        >
          <Text style={styles.applyButtonText}>Save & Apply</Text>
        </AnimatedButton>

        {/* Clear Data Section */}
        <View style={[styles.section, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>🗑️ Clear Data</Text>
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
            <Text style={styles.clearButtonIcon}>📋</Text>
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
            <Text style={styles.clearButtonIcon}>⚙️</Text>
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
            <Text style={styles.clearButtonIcon}>⚠️</Text>
            <View>
              <Text style={[styles.clearButtonText, { color: '#F44336' }]}>Clear All Data</Text>
              <Text style={styles.clearButtonDesc}>Delete everything and start fresh</Text>
            </View>
          </AnimatedButton>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', paddingHorizontal: 20, marginBottom: 4 },
  subheader: { fontSize: 14, color: '#a0a0b0', paddingHorizontal: 20, marginBottom: 20 },
  scrollView: { flex: 1, paddingHorizontal: 20 },

  section: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: '#a0a0b0', marginBottom: 12 },

  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  frequencyActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  frequencyText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  frequencyTextActive: { color: '#fff' },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
  },
  timeSeparator: { color: '#a0a0b0', fontSize: 14 },

  timePickerContainer: { alignItems: 'center' },
  timePickerLabel: { fontSize: 11, color: '#a0a0b0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  timeArrowText: { color: '#e94560', fontSize: 20, fontWeight: 'bold' },
  timeDisplay: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e94560',
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  applyButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  dangerButton: {
    borderColor: '#F4433630',
  },
  clearButtonIcon: { fontSize: 24 },
  clearButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  clearButtonDesc: { color: '#666', fontSize: 11, marginTop: 2 },
});

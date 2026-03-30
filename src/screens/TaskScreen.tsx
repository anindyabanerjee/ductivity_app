import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { ACTIVITIES } from '../config/activities';
import { logActivity } from '../services/activityService';
import { CATEGORY_COLORS } from '../types';

export default function TaskScreen() {
  const [lastLogged, setLastLogged] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActivityPress = async (activity: typeof ACTIVITIES[0]) => {
    if (loading) return;
    setLoading(true);
    try {
      await logActivity(activity.name, activity.category);
      setLastLogged(activity.name);
      Alert.alert(
        'Activity Logged!',
        `${activity.emoji} ${activity.name} logged at ${new Date().toLocaleTimeString()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to log activity. Please check your internet connection.');
      console.error('Error logging activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>What are you doing?</Text>
      <Text style={styles.subheader}>Tap to log your current activity</Text>

      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              { borderLeftColor: CATEGORY_COLORS[activity.category] },
              lastLogged === activity.name && styles.activeCard,
            ]}
            onPress={() => handleActivityPress(activity)}
            disabled={loading}
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
          </TouchableOpacity>
        ))}
      </View>

      {lastLogged && (
        <Text style={styles.lastLoggedText}>
          Last logged: {lastLogged}
        </Text>
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
    fontSize: 28,
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
  activityCard: {
    width: '47%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: 'center',
    gap: 8,
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
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: Props) {
  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Ductivity</Text>
        <Text style={styles.subtitle}>Track Your Productivity</Text>
        <Text style={styles.description}>
          Log your activities every 30 minutes and see how productively you spend your time.
          Get insights with visual charts and filters.
        </Text>

        <View style={styles.features}>
          <Text style={styles.featureItem}>📊 Visual productivity charts</Text>
          <Text style={styles.featureItem}>🔔 Smart 30-min reminders</Text>
          <Text style={styles.featureItem}>📈 Daily, weekly & monthly views</Text>
          <Text style={styles.featureItem}>🏷️ Categorized activities</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
    padding: 30,
    paddingTop: 80,
    paddingBottom: 50,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0b0',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#c0c0d0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    alignSelf: 'stretch',
    gap: 12,
  },
  featureItem: {
    fontSize: 16,
    color: '#d0d0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

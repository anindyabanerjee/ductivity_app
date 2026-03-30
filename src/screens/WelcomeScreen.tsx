/**
 * screens/WelcomeScreen.tsx
 *
 * First-run onboarding screen. Shows the app branding, a feature list,
 * and a name input. Once the user enters a name (>= 2 chars) and taps
 * "Let's Go", the name is saved to UserContext + AsyncStorage, the
 * 'hasSeenWelcome' flag is set, and the screen fades out to reveal
 * the main tab navigator.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { AnimatedButton, FadeInCard } from '../utils/animations';
import { hapticMedium } from '../utils/haptics';

interface Props {
  /** Called after the user completes onboarding; parent switches to main. */
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setUserName } = useUser();

  // Name must be at least 2 characters to enable the button
  const isValid = name.trim().length >= 2;

  // -- Staggered entrance animation values --
  const emojiScale = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(-20)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descY = useRef(new Animated.Value(20)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(30)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Kick off the staggered entrance sequence on mount
  useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);

    // Logo springs in with rotation
    Animated.parallel([
      Animated.spring(emojiScale, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }),
      Animated.spring(emojiRotate, { toValue: 0, damping: 12, stiffness: 80, useNativeDriver: true }),
    ]).start();

    // Helper: fade in + slide up a given pair of animated values
    const fadeIn = (opacity: Animated.Value, y: Animated.Value, delay: number) => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 500, delay, easing: easeOut, useNativeDriver: true }),
      ]).start();
    };

    // Stagger each section with increasing delays
    fadeIn(welcomeOpacity, welcomeY, 200);
    fadeIn(titleOpacity, titleY, 350);
    fadeIn(subtitleOpacity, subtitleY, 450);
    fadeIn(descOpacity, descY, 550);

    // Features animate via FadeInCard component (delay built-in)

    fadeIn(inputOpacity, inputY, 1100);
    fadeIn(buttonOpacity, buttonY, 1300);
  }, []);

  /** Save name, mark onboarding done, then fade out. */
  const handleGetStarted = async () => {
    if (!isValid) return;
    hapticMedium();
    await setUserName(name.trim());
    await AsyncStorage.setItem('hasSeenWelcome', 'true');

    Animated.timing(screenOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      onComplete();
    });
  };

  // Map numeric rotation to a CSS degree string
  const rotation = emojiRotate.interpolate({
    inputRange: [-20, 0],
    outputRange: ['-20deg', '0deg'],
  });

  /** Feature bullet points displayed during onboarding. */
  const featureTexts = [
    '📊 Visual productivity charts',
    '🔔 Smart 30-min reminders',
    '📈 Daily, weekly & monthly views',
    '🏷️ Categorized activities',
  ];

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Animated.Text
              style={[styles.emoji, { transform: [{ scale: emojiScale }, { rotate: rotation }] }]}
            >
              🎯
            </Animated.Text>

            <Animated.View style={{ opacity: welcomeOpacity, transform: [{ translateY: welcomeY }] }}>
              <Text style={styles.welcome}>Welcome</Text>
            </Animated.View>

            <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
              <Text style={styles.title}>Ductivity</Text>
            </Animated.View>

            <Animated.View style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }}>
              <Text style={styles.subtitle}>Track Your Productivity</Text>
            </Animated.View>

            <Animated.View style={{ opacity: descOpacity, transform: [{ translateY: descY }] }}>
              <Text style={styles.description}>
                Log your activities every 30 minutes and see how productively you spend your time.
              </Text>
            </Animated.View>

            <View style={styles.features}>
              {featureTexts.map((text, index) => (
                <FadeInCard key={index} delay={700 + index * 80}>
                  <Text style={styles.featureItem}>{text}</Text>
                </FadeInCard>
              ))}
            </View>

            <Animated.View style={[styles.inputContainer, { opacity: inputOpacity, transform: [{ translateY: inputY }] }]}>
              <Text style={styles.inputLabel}>What's your name?</Text>
              <TextInput
                style={[styles.textInput, isFocused && styles.textInputFocused]}
                placeholder="Enter your name..."
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: buttonOpacity, transform: [{ translateY: buttonY }] }}>
            <AnimatedButton
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleGetStarted}
              scaleValue={0.96}
              enableHaptic={false}
            >
              <Text style={styles.buttonText}>
                {isValid ? `Let's Go, ${name.trim()}!` : 'Enter your name to continue'}
              </Text>
            </AnimatedButton>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scrollContent: {
    flexGrow: 1, justifyContent: 'space-between',
    padding: 30, paddingTop: 70, paddingBottom: 50,
  },
  content: { alignItems: 'center' },
  emoji: { fontSize: 70, marginBottom: 16 },
  welcome: { fontSize: 22, color: '#a0a0b0', fontWeight: '300', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#e94560', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a0a0b0', marginBottom: 20 },
  description: { fontSize: 15, color: '#c0c0d0', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  features: { alignSelf: 'stretch', gap: 10, marginBottom: 28 },
  featureItem: { fontSize: 15, color: '#d0d0e0', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden' },
  inputContainer: { alignSelf: 'stretch', marginBottom: 8 },
  inputLabel: { fontSize: 14, color: '#a0a0b0', marginBottom: 8, marginLeft: 4 },
  textInput: { backgroundColor: '#16213e', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, fontSize: 16, color: '#fff', borderWidth: 2, borderColor: 'transparent' },
  textInputFocused: { borderColor: '#e94560' },
  button: { backgroundColor: '#e94560', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { backgroundColor: '#e9456050' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

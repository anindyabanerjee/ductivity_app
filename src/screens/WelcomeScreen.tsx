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
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { FadeInCard } from '../utils/animations';
import { hapticMedium } from '../utils/haptics';
import GradientBackground from '../components/ui/GradientBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import IconCircle from '../components/ui/IconCircle';
import { colors } from '../theme';

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
  const gearSpin = useRef(new Animated.Value(0)).current;
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

    // Logo springs in
    Animated.spring(emojiScale, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }).start();

    // Start slow continuous gear rotation
    setTimeout(() => {
      Animated.loop(
        Animated.timing(gearSpin, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, 500);

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

  // Continuous gear rotation: 0 → 1 maps to 0° → 360°
  const gearRotation = gearSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const featureItems: { icon: any; text: string }[] = [];

  return (
    <GradientBackground>
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
              <Animated.View
                style={{ transform: [{ scale: emojiScale }, { rotate: gearRotation }] }}
              >
                <IconCircle
                  name="cog-outline"
                  size={50}
                  color="#fff"
                  backgroundColor="rgba(233,69,96,0.2)"
                  circleSize={100}
                />
              </Animated.View>

              <Animated.View style={{ opacity: welcomeOpacity, transform: [{ translateY: welcomeY }], marginTop: 16 }}>
                <Text style={styles.welcome}>Welcome to</Text>
              </Animated.View>

              <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
                <Text style={styles.title}>Ductivity</Text>
              </Animated.View>

              <Animated.View style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }}>
                <Text style={styles.subtitle}>Track Your Productivity</Text>
              </Animated.View>


              <View style={styles.features}>
                {featureItems.map((item, index) => (
                  <FadeInCard key={index} delay={700 + index * 80}>
                    <GlassCard style={{ marginBottom: 0 }}>
                      <View style={styles.featureRow}>
                        <Ionicons name={item.icon} size={18} color={colors.accent.primary} />
                        <Text style={styles.featureItem}>{item.text}</Text>
                      </View>
                    </GlassCard>
                  </FadeInCard>
                ))}
              </View>

              <Animated.View style={[styles.inputContainer, { opacity: inputOpacity, transform: [{ translateY: inputY }] }]}>
                <TextInput
                  style={[styles.textInput, isFocused && styles.textInputFocused]}
                  placeholder="Enter your name to get started"
                  placeholderTextColor={colors.text.dim}
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
              <GradientButton
                onPress={handleGetStarted}
                disabled={!isValid}
              >
                Continue
              </GradientButton>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1, justifyContent: 'space-between',
    padding: 30, paddingTop: 70, paddingBottom: 50,
  },
  content: { alignItems: 'center' },
  welcome: { fontSize: 22, color: colors.text.muted, fontWeight: '300', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 42, fontWeight: 'bold', color: colors.accent.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.text.muted, marginBottom: 20 },
  description: { fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  features: { alignSelf: 'stretch', gap: 10, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureItem: { fontSize: 15, color: colors.text.secondary },
  inputContainer: { alignSelf: 'stretch', marginBottom: 8 },
  inputLabel: { fontSize: 14, color: colors.text.muted, marginBottom: 8, marginLeft: 4 },
  textInput: { backgroundColor: colors.bg.secondary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, fontSize: 16, color: colors.text.primary, borderWidth: 2, borderColor: 'transparent' },
  textInputFocused: { borderColor: colors.accent.primary },
});

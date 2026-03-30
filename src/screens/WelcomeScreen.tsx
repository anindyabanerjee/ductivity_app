import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { AnimatedButton, useStaggeredList } from '../utils/animations';
import { hapticMedium } from '../utils/haptics';

interface Props {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setUserName } = useUser();

  const isValid = name.trim().length >= 2;

  // Animations
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(-20);
  const welcomeOpacity = useSharedValue(0);
  const welcomeY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(20);
  const descOpacity = useSharedValue(0);
  const descY = useSharedValue(20);
  const inputOpacity = useSharedValue(0);
  const inputY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonY = useSharedValue(30);
  const screenOpacity = useSharedValue(1);

  const features = useStaggeredList(4, 80);

  useEffect(() => {
    // Staggered entrance animations
    emojiScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    emojiRotate.value = withSpring(0, { damping: 12, stiffness: 80 });

    welcomeOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    welcomeY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    titleOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
    titleY.value = withDelay(350, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    subtitleOpacity.value = withDelay(450, withTiming(1, { duration: 500 }));
    subtitleY.value = withDelay(450, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    descOpacity.value = withDelay(550, withTiming(1, { duration: 500 }));
    descY.value = withDelay(550, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Features stagger starting at 700ms
    setTimeout(() => features.animate(), 700);

    inputOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    inputY.value = withDelay(1100, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    buttonOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
    buttonY.value = withDelay(1300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const handleGetStarted = async () => {
    if (!isValid) return;
    hapticMedium();
    await setUserName(name.trim());
    await AsyncStorage.setItem('hasSeenWelcome', 'true');

    // Fade out then navigate
    screenOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) runOnJS(onComplete)();
    });
  };

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }, { rotate: `${emojiRotate.value}deg` }],
  }));

  const welcomeStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ translateY: welcomeY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descY.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputY.value }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const featureTexts = [
    '📊 Visual productivity charts',
    '🔔 Smart 30-min reminders',
    '📈 Daily, weekly & monthly views',
    '🏷️ Categorized activities',
  ];

  return (
    <Animated.View style={[styles.container, screenStyle]}>
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
            <Animated.Text style={[styles.emoji, emojiStyle]}>🎯</Animated.Text>

            <Animated.View style={welcomeStyle}>
              <Text style={styles.welcome}>Welcome</Text>
            </Animated.View>

            <Animated.View style={titleStyle}>
              <Text style={styles.title}>Ductivity</Text>
            </Animated.View>

            <Animated.View style={subtitleStyle}>
              <Text style={styles.subtitle}>Track Your Productivity</Text>
            </Animated.View>

            <Animated.View style={descStyle}>
              <Text style={styles.description}>
                Log your activities every 30 minutes and see how productively you spend your time.
              </Text>
            </Animated.View>

            <View style={styles.features}>
              {featureTexts.map((text, index) => (
                <Animated.View key={index} style={features.items[index].style}>
                  <Text style={styles.featureItem}>{text}</Text>
                </Animated.View>
              ))}
            </View>

            <Animated.View style={[styles.inputContainer, inputStyle]}>
              <Text style={styles.inputLabel}>What's your name?</Text>
              <TextInput
                style={[
                  styles.textInput,
                  isFocused && styles.textInputFocused,
                ]}
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

          <Animated.View style={buttonAnimStyle}>
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
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 30,
    paddingTop: 70,
    paddingBottom: 50,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 70,
    marginBottom: 16,
  },
  welcome: {
    fontSize: 22,
    color: '#a0a0b0',
    fontWeight: '300',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0b0',
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: '#c0c0d0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  features: {
    alignSelf: 'stretch',
    gap: 10,
    marginBottom: 28,
  },
  featureItem: {
    fontSize: 15,
    color: '#d0d0e0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  inputContainer: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#a0a0b0',
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textInputFocused: {
    borderColor: '#e94560',
  },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#e9456050',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

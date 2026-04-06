/**
 * screens/SplashScreen.tsx
 *
 * Animated brand splash shown for ~2.5 seconds on cold launch.
 * Sequence: logo springs in with a slight rotation, starts pulsing,
 * then the title and subtitle fade in. After the timer, the entire
 * screen fades out and calls `onFinish` so the parent can navigate
 * to the Welcome or Main screen.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import GradientBackground from '../components/ui/GradientBackground';
import IconCircle from '../components/ui/IconCircle';
import { colors } from '../theme';

interface Props {
  /** Called once the exit fade completes; parent decides next screen. */
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  // Logo entrance
  const logoScale = useRef(new Animated.Value(0)).current;
  // Continuous slow gear rotation (0 → 1 maps to 0° → 360°)
  const gearSpin = useRef(new Animated.Value(0)).current;
  // Title + subtitle staggered fade-in
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  // Whole-screen fade-out before navigation
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo springs in from scale 0
    Animated.spring(logoScale, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }).start();

    // 2. Start slow continuous gear rotation after logo lands
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

    // 3. Title fades in and slides up after 400ms
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 600, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // 4. Subtitle fades in after 700ms
    Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 700, useNativeDriver: true }).start();

    // 5. After 2.5s, fade the whole screen out and notify the parent
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Map 0-1 to 0°-360° for continuous gear rotation
  const gearRotation = gearSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <GradientBackground>
      <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Animated.View
            style={{
              transform: [
                { scale: logoScale },
                { rotate: gearRotation },
              ],
            }}
          >
            <IconCircle
              name="cog-outline"
              size={50}
              color="#fff"
              backgroundColor="rgba(233,69,96,0.2)"
              circleSize={100}
            />
          </Animated.View>
          <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }], marginTop: 20 }}>
            <Text style={styles.title}>Ductivity</Text>
          </Animated.View>
          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>Track Your Productivity</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.dots, { opacity: subtitleOpacity }]}>
          <View style={[styles.dot, { backgroundColor: colors.category.productive }]} />
          <View style={[styles.dot, { backgroundColor: colors.category['semi-productive'] }]} />
          <View style={[styles.dot, { backgroundColor: colors.accent.primary }]} />
        </Animated.View>
      </Animated.View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 8,
    letterSpacing: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

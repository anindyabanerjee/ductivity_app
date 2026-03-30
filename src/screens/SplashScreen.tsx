import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-15);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo: spring in with rotation
    logoScale.value = withSpring(1, { damping: 8, stiffness: 100, mass: 0.8 });
    logoRotate.value = withSpring(0, { damping: 12, stiffness: 100 });

    // Pulse after landing
    setTimeout(() => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 600);

    // Title fade in
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Subtitle
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Auto-transition after 2.5s
    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onFinish)();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value * pulseScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Animated.Text style={[styles.logo, logoStyle]}>🎯</Animated.Text>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Ductivity</Text>
        </Animated.View>
        <Animated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>Track Your Productivity</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.dots, subtitleStyle]}>
        <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
        <View style={[styles.dot, { backgroundColor: '#FF9800' }]} />
        <View style={[styles.dot, { backgroundColor: '#e94560' }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e94560',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0b0',
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

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing } from 'react-native';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-15)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo spring in
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }),
      Animated.spring(logoRotate, { toValue: 0, damping: 12, stiffness: 100, useNativeDriver: true }),
    ]).start();

    // Pulse loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }, 600);

    // Title
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 600, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Subtitle
    Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 700, useNativeDriver: true }).start();

    // Auto-transition
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const rotation = logoRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.logo,
            {
              transform: [
                { scale: Animated.multiply(logoScale, pulseScale) },
                { rotate: rotation },
              ],
            },
          ]}
        >
          🎯
        </Animated.Text>
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
          <Text style={styles.title}>Ductivity</Text>
        </Animated.View>
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.subtitle}>Track Your Productivity</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.dots, { opacity: subtitleOpacity }]}>
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

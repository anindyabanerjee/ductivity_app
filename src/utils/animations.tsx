/**
 * utils/animations.tsx
 *
 * Reusable animation primitives for the Ductivity UI.
 * Uses the built-in React Native Animated API (not Reanimated) so
 * everything works in Expo Go without native module issues.
 *
 * Exports:
 *  - AnimatedButton  -- pressable with spring-scale + optional haptic
 *  - useFadeInUp     -- hook that returns {style, animate} for fade+slide
 *  - FadeInCard      -- self-contained card that fades in on mount
 */

import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  Easing,
} from 'react-native';
import { hapticLight } from './haptics';

/** Props for AnimatedButton; extends Pressable so callers can use onPress etc. */
interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: any;
  /** How far to shrink on press (0-1). Default 0.95. */
  scaleValue?: number;
  /** Fire a light haptic on press-in? Default true. */
  enableHaptic?: boolean;
}

/**
 * AnimatedButton
 *
 * A Pressable that spring-scales down on press-in and back up on
 * press-out, giving every tappable element a satisfying "squish".
 */
export function AnimatedButton({
  children,
  style,
  scaleValue = 0.95,
  enableHaptic = true,
  onPress,
  ...rest
}: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: scaleValue, useNativeDriver: true }).start();
    if (enableHaptic) hapticLight();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} {...rest}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/**
 * useFadeInUp
 *
 * Returns an Animated style (opacity + translateY) and an `animate()`
 * function the caller triggers once (typically on mount). The element
 * starts invisible 20px below its final position and slides up.
 *
 * @param delay - milliseconds to wait before starting the animation
 */
export function useFadeInUp(delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const animate = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const style = { opacity, transform: [{ translateY }] };
  return { style, animate };
}

/**
 * FadeInCard
 *
 * Simple animated card wrapper -- each instance manages its own animation.
 * Use this instead of useStaggeredList to avoid hooks-in-loops issues.
 * Fades in, slides up, and scales from 0.9 to 1 after the given delay.
 */
export function FadeInCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  // Animate once after the specified delay (not on every re-render)
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }, { scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

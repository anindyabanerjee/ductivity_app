import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  Easing,
} from 'react-native';
import { hapticLight } from './haptics';

interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: any;
  scaleValue?: number;
  enableHaptic?: boolean;
}

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
 * Simple animated card wrapper - each instance manages its own animation.
 * Use this instead of useStaggeredList to avoid hooks-in-loops issues.
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

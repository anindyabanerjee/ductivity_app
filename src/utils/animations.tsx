import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { hapticLight } from './haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.8 };
export const TIMING_CONFIG = { duration: 400, easing: Easing.out(Easing.cubic) };

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(scaleValue, SPRING_CONFIG);
        if (enableHaptic) hapticLight();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_CONFIG);
      }}
      onPress={onPress}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export function useFadeInUp(delay: number = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animate = () => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  };

  const reset = () => {
    opacity.value = 0;
    translateY.value = 20;
  };

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { style, animate, reset };
}

export function useStaggeredList(count: number, staggerMs: number = 60) {
  const items = Array.from({ length: count }, (_, i) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(25);
    const scale = useSharedValue(0.9);

    const style = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    return { opacity, translateY, scale, style };
  });

  const animate = () => {
    items.forEach((item, index) => {
      const delay = index * staggerMs;
      item.opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
      item.translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
      item.scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
    });
  };

  const reset = () => {
    items.forEach((item) => {
      item.opacity.value = 0;
      item.translateY.value = 25;
      item.scale.value = 0.9;
    });
  };

  return { items, animate, reset };
}

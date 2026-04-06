/**
 * components/SkeletonLoader.tsx
 *
 * A pulsing placeholder rectangle used while data is loading.
 * Renders a dark rounded box whose opacity oscillates between
 * 0.3 and 0.7, giving the classic "shimmer" loading effect.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonLoader({ width, height, borderRadius = 12, style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  // Start an infinite pulse loop on mount
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: colors.bg.secondary, opacity },
        style,
      ]}
    />
  );
}

export default React.memo(SkeletonLoader);

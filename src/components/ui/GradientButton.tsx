import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, radius, colors } from '../../theme';
import { hapticLight } from '../../utils/haptics';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  textStyle?: any;
}

export default function GradientButton({ children, onPress, style, disabled, textStyle }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    if (!disabled) hapticLight();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={disabled ? undefined : onPress}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <LinearGradient
          colors={disabled ? [colors.bg.elevated, colors.bg.tertiary] : [colors.accent.primary, '#C13B52']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, disabled && styles.disabled]}
        >
          {typeof children === 'string' ? (
            <Text style={[styles.text, textStyle]}>{children}</Text>
          ) : (
            children
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

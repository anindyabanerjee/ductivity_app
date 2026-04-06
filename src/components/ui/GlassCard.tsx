import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, radius, shadows } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: any;
  glowColor?: string;
}

export default function GlassCard({ children, style, glowColor }: Props) {
  const glowShadow = glowColor ? shadows.glow(glowColor) : shadows.card;

  return (
    <View style={[styles.outer, glowShadow, style]}>
      <View style={styles.inner}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  inner: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    ...(Platform.OS === 'android' ? { backgroundColor: 'rgba(22, 27, 34, 0.92)' } : {}),
  },
});

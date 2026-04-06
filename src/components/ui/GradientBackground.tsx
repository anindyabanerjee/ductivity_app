import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={['#0D1117', '#161B22', '#0D1117']}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

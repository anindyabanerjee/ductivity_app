import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color: string;
  backgroundColor: string;
  circleSize?: number;
}

export default function IconCircle({ name, size = 24, color, backgroundColor, circleSize }: Props) {
  const diameter = circleSize ?? size * 2;

  return (
    <View style={[styles.circle, { width: diameter, height: diameter, borderRadius: diameter / 2, backgroundColor }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

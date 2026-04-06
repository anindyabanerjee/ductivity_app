import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../theme';

interface Props {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export default function SectionHeader({ title, iconName, iconColor }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={iconColor ?? colors.accent.primary}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <LinearGradient
        colors={[colors.accent.primary, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 8 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  line: { height: 2, width: 40, borderRadius: 1 },
});

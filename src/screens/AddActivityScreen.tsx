/**
 * screens/AddActivityScreen.tsx
 *
 * Full-screen dedicated page for adding a custom activity.
 * Displays a form with name input, icon grid picker, and
 * category pill selector. On submit, adds via ActivityContext.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useActivities, MAX_ACTIVITIES } from '../context/ActivityContext';
import { AVAILABLE_ICONS } from '../config/activities';
import { CATEGORY_COLORS, CategoryType, Activity } from '../types';
import { hapticSuccess, hapticLight } from '../utils/haptics';
import GradientBackground from '../components/ui/GradientBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionHeader from '../components/ui/SectionHeader';
import { colors, spacing, radius } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Number of icons per row in the picker grid */
const ICONS_PER_ROW = 6;
const ICON_GAP = 10;
const GRID_PADDING = 16; // GlassCard inner padding
const ICON_SIZE = Math.floor(
  (SCREEN_WIDTH - 40 - GRID_PADDING * 2 - ICON_GAP * (ICONS_PER_ROW - 1)) / ICONS_PER_ROW
);

/** Categories available for custom activity creation */
const CATEGORY_OPTIONS: CategoryType[] = ['productive', 'semi-productive', 'non-productive', 'meh'];

export default function AddActivityScreen() {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>('');
  const [nameFocused, setNameFocused] = useState(false);

  const { activities, addActivity } = useActivities();
  const navigation = useNavigation<any>();

  const canAdd = name.trim().length > 0 && selectedIcon !== '' && selectedCategory !== '';

  const handleAdd = async () => {
    if (!canAdd) return;

    const newActivity: Activity = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      emoji: '',
      icon: selectedIcon,
      category: selectedCategory as CategoryType,
    };

    const added = await addActivity(newActivity);
    if (added) {
      hapticSuccess();
      navigation.goBack();
    } else {
      Alert.alert('Limit Reached', `Maximum ${MAX_ACTIVITIES} activities allowed.`);
    }
  };

  return (
    <GradientBackground style={{ paddingTop: 60 }}>
      <StatusBar barStyle="light-content" />

      {/* Header with back arrow */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Activity</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Activity count */}
      <Text style={styles.countText}>
        {activities.length}/{MAX_ACTIVITIES} activities
      </Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Activity Name */}
        <GlassCard>
          <SectionHeader title="Activity Name" iconName="text-outline" />
          <TextInput
            style={[
              styles.nameInput,
              nameFocused && styles.nameInputFocused,
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Reading, Cooking..."
            placeholderTextColor={colors.text.dim}
            maxLength={24}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </GlassCard>

        {/* Choose Icon */}
        <GlassCard style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Choose Icon" iconName="apps-outline" />
          <View style={styles.iconGrid}>
            {AVAILABLE_ICONS.map((iconName) => {
              const isSelected = selectedIcon === iconName;
              return (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => { hapticLight(); setSelectedIcon(iconName); }}
                  style={[
                    styles.iconOption,
                    isSelected && styles.iconOptionSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={iconName as any}
                    size={22}
                    color={isSelected ? colors.accent.primary : colors.text.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Category */}
        <GlassCard style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Category" iconName="pricetag-outline" />
          <View style={styles.categoryPillRow}>
            {CATEGORY_OPTIONS.map((cat) => {
              const catColor = CATEGORY_COLORS[cat];
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { hapticLight(); setSelectedCategory(cat); }}
                  style={[
                    styles.categoryPill,
                    { borderColor: catColor + '40' },
                    isSelected && { backgroundColor: catColor + '30', borderColor: catColor },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: isSelected ? catColor : colors.text.muted },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Add Button */}
        <View style={{ marginTop: spacing.xxl }}>
          <GradientButton onPress={handleAdd} disabled={!canAdd}>
            Add Activity
          </GradientButton>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  countText: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  nameInput: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  nameInputFocused: {
    borderColor: colors.accent.primary,
    borderWidth: 2,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ICON_GAP,
  },
  iconOption: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  iconOptionSelected: {
    borderColor: colors.accent.primary,
    borderWidth: 2,
    backgroundColor: colors.accent.muted,
  },
  categoryPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.bg.primary,
    gap: 6,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

/**
 * screens/ActivitySetupScreen.tsx
 *
 * First-time onboarding screen where users pick their initial set
 * of activities (5-10). Shown after WelcomeScreen, before main tabs.
 * Uses built-in Animated API only (no reanimated).
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_ACTIVITIES, PRESELECTED_IDS } from '../config/activities';
import { useActivities } from '../context/ActivityContext';
import { CATEGORY_COLORS, CategoryType } from '../types';
import GradientBackground from '../components/ui/GradientBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import IconCircle from '../components/ui/IconCircle';
import { colors, spacing, radius } from '../theme';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

interface Props {
  onComplete: () => void;
}

export default function ActivitySetupScreen({ onComplete }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(PRESELECTED_IDS)
  );
  const { setActivities } = useActivities();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleActivity = (id: string) => {
    hapticLight();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 10) return prev; // max 10
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    const selected = DEFAULT_ACTIVITIES.filter((a) => selectedIds.has(a.id));
    await setActivities(selected);
    hapticSuccess();
    onComplete();
  };

  const selectedCount = selectedIds.size;
  const canContinue = selectedCount >= 8;

  return (
    <GradientBackground style={{ paddingTop: 60 }}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          flex: 1,
        }}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Choose Your Activities</Text>
          <Text style={styles.subtitle}>Pick 8 to get started</Text>
          <View style={styles.counterRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={canContinue ? colors.status.success : colors.accent.primary}
            />
            <Text
              style={[
                styles.counterText,
                canContinue && { color: colors.status.success },
              ]}
            >
              {selectedCount}/8 selected
            </Text>
          </View>
        </View>

        {/* Activity Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {DEFAULT_ACTIVITIES.map((activity) => {
              const isSelected = selectedIds.has(activity.id);
              const catColor = CATEGORY_COLORS[activity.category];

              return (
                <TouchableOpacity
                  key={activity.id}
                  onPress={() => toggleActivity(activity.id)}
                  activeOpacity={0.7}
                  style={{ width: CARD_WIDTH }}
                >
                  <GlassCard
                    glowColor={isSelected ? catColor : undefined}
                    style={[
                      styles.card,
                      isSelected && {
                        borderWidth: 2,
                        borderColor: colors.accent.primary,
                      },
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <IconCircle
                        name={activity.icon as any}
                        size={22}
                        color={catColor}
                        backgroundColor={catColor + '20'}
                      />
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: catColor + '30' },
                        ]}
                      >
                        <Text style={[styles.categoryText, { color: catColor }]}>
                          {activity.category}
                        </Text>
                      </View>
                    </View>

                    {/* Checkmark overlay */}
                    {isSelected && (
                      <View style={styles.checkOverlay}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.accent.primary}
                        />
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <GradientButton
              onPress={handleContinue}
              disabled={!canContinue}
            >
              Continue
            </GradientButton>
            {!canContinue && (
              <Text style={styles.hintText}>
                Select at least {8 - selectedCount} more
              </Text>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: CARD_PADDING,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  card: {
    position: 'relative',
  },
  cardContent: {
    alignItems: 'center',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  checkOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 8,
  },
});

/**
 * screens/DashboardScreen.tsx
 *
 * Productivity insights screen. Lets the user pick a time range
 * (3H - Monthly) and a chart type (Pie, Bar, Timeline, Progress),
 * then renders the matching visualisation via ActivityChart.
 * Supports pull-to-refresh and shows skeleton placeholders while loading.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivities } from '../services/activityService';
import { ActivityLog, TimeFilter } from '../types';
import ActivityChart, { ChartType } from '../components/ActivityChart';
import SkeletonLoader from '../components/SkeletonLoader';
import { useUser } from '../context/UserContext';
import { AnimatedButton, useFadeInUp } from '../utils/animations';
import WordOfTheDay from '../components/WordOfTheDay';
import GradientBackground from '../components/ui/GradientBackground';
import { colors } from '../theme';

/** Available time-range filter chips. */
const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: '3H', value: '3h' },
  { label: '6H', value: '6h' },
  { label: '12H', value: '12h' },
  { label: '24H', value: '24h' },
  { label: 'Today', value: 'daily' },
  { label: 'Week', value: 'weekly' },
  { label: 'Month', value: 'monthly' },
];

/** Icon mapping for chart type buttons. */
const chartTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  pie: 'pie-chart-outline',
  bar: 'bar-chart-outline',
  timeline: 'time-outline',
  progress: 'battery-half-outline',
};

/** Available chart-type selector buttons. */
const CHART_TYPES: { label: string; icon: string; value: ChartType }[] = [
  { label: 'Pie', icon: 'pie', value: 'pie' },
  { label: 'Bar', icon: 'bar', value: 'bar' },
  { label: 'Timeline', icon: 'timeline', value: 'timeline' },
  { label: 'Progress', icon: 'progress', value: 'progress' },
];

export default function DashboardScreen() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('daily');
  const [activeChart, setActiveChart] = useState<ChartType>('pie');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userName } = useUser();

  // Entrance animations for header, filter bar, and chart-type slider
  const header = useFadeInUp(0);
  const subheader = useFadeInUp(100);
  const filterOpacity = useRef(new Animated.Value(0)).current;
  const filterX = useRef(new Animated.Value(-30)).current;
  const sliderOpacity = useRef(new Animated.Value(0)).current;
  const sliderX = useRef(new Animated.Value(-30)).current;

  const hasAnimated = useRef(false);

  // Run entrance animations once on first render
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      setTimeout(() => {
        header.animate();
        subheader.animate();
        Animated.parallel([
          Animated.timing(filterOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
          Animated.timing(filterX, { toValue: 0, duration: 400, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(sliderOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
          Animated.timing(sliderX, { toValue: 0, duration: 400, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      }, 50);
    }
  }, []);

  /** Fetch activity logs from Firestore for the currently selected time filter. */
  const fetchData = useCallback(async () => {
    try {
      const data = await getActivities(activeFilter);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  // Re-fetch whenever the active filter changes
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  /** Pull-to-refresh handler. */
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <GradientBackground style={{ paddingTop: 60 }}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.headerContainer, header.style]}>
        <Text style={styles.header}>
          {userName ? `${userName}'s Dashboard` : 'Dashboard'}
        </Text>
      </Animated.View>
      <Animated.View style={subheader.style}>
        <Text style={styles.subheader}>Your productivity insights</Text>
      </Animated.View>

      <Animated.View style={{ opacity: filterOpacity, transform: [{ translateX: filterX }] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
          {TIME_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <AnimatedButton
                key={filter.value}
                style={[styles.filterButton, isActive && styles.activeFilterOuter]}
                onPress={() => setActiveFilter(filter.value)}
                scaleValue={0.92}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[colors.accent.primary, '#C13B52']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeFilterGradient}
                  >
                    <Text style={styles.activeFilterText}>{filter.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterText}>{filter.label}</Text>
                )}
              </AnimatedButton>
            );
          })}
        </ScrollView>
      </Animated.View>

      <Animated.View style={{ opacity: sliderOpacity, transform: [{ translateX: sliderX }] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartSliderContainer} contentContainerStyle={styles.filterContent}>
          {CHART_TYPES.map((type) => (
            <AnimatedButton
              key={type.value}
              style={[styles.chartTypeButton, activeChart === type.value && styles.activeChartType]}
              onPress={() => setActiveChart(type.value)}
              scaleValue={0.92}
            >
              <Ionicons
                name={chartTypeIcons[type.icon]}
                size={16}
                color={activeChart === type.value ? colors.accent.primary : colors.text.muted}
              />
              <Text style={[styles.chartTypeText, activeChart === type.value && styles.activeChartTypeText]}>
                {type.label}
              </Text>
            </AnimatedButton>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        style={styles.chartsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} />}
      >
        {loading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonLoader width="100%" height={120} borderRadius={12} />
            <SkeletonLoader width="100%" height={200} borderRadius={12} style={{ marginTop: 16 }} />
            <SkeletonLoader width="60%" height={20} borderRadius={8} style={{ marginTop: 16 }} />
          </View>
        ) : (
          <ActivityChart logs={logs} chartType={activeChart} />
        )}
        <WordOfTheDay />
        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: { paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: colors.text.primary, marginBottom: 4 },
  subheader: { fontSize: 14, color: colors.text.muted, paddingHorizontal: 20, marginBottom: 14 },
  filterContainer: { maxHeight: 44, marginBottom: 10 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.bg.secondary, overflow: 'hidden' },
  activeFilterOuter: { paddingHorizontal: 0, paddingVertical: 0, backgroundColor: 'transparent' },
  activeFilterGradient: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { color: colors.text.muted, fontSize: 13, fontWeight: '600' },
  activeFilterText: { color: colors.text.primary, fontSize: 13, fontWeight: '600' },
  chartSliderContainer: { maxHeight: 50, marginBottom: 14 },
  chartTypeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.bg.secondary, borderWidth: 1, borderColor: 'transparent' },
  activeChartType: { backgroundColor: colors.bg.tertiary, borderColor: colors.accent.primary },
  chartTypeText: { color: colors.text.muted, fontSize: 13, fontWeight: '600' },
  activeChartTypeText: { color: colors.accent.primary },
  chartsContainer: { flex: 1, paddingHorizontal: 20 },
  skeletonContainer: { paddingTop: 8 },
});

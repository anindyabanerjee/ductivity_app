/**
 * components/ActivityChart.tsx
 *
 * Displays productivity data in one of four visualisations selected by
 * the user on the Dashboard: pie chart, bar chart, timeline, or
 * progress bars. Also shows a "Productivity Score" card above the
 * chart and an animated empty-state when no data exists.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityLog, CategoryType, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import GlassCard from './ui/GlassCard';
import SectionHeader from './ui/SectionHeader';
import { colors } from '../theme';

/** Available chart width after accounting for horizontal padding. */
const screenWidth = Dimensions.get('window').width - 40;

/** The four visualisation modes the Dashboard can switch between. */
export type ChartType = 'pie' | 'bar' | 'timeline' | 'progress';

interface Props {
  logs: ActivityLog[];
  chartType: ChartType;
}

export default function ActivityChart({ logs, chartType }: Props) {
  // Animated values for the score card entrance
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0.9)).current;
  // Animated values for the chart entrance (slightly delayed)
  const chartOpacity = useRef(new Animated.Value(0)).current;
  const chartY = useRef(new Animated.Value(20)).current;
  // Gentle bobbing animation for the empty-state icon
  const emptyBob = useRef(new Animated.Value(0)).current;

  // Re-run entrance animations whenever the data or chart type changes
  useEffect(() => {
    scoreOpacity.setValue(0);
    scoreScale.setValue(0.9);
    chartOpacity.setValue(0);
    chartY.setValue(20);

    Animated.parallel([
      Animated.timing(scoreOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(scoreScale, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(chartOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(chartY, { toValue: 0, duration: 500, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [logs, chartType]);

  // Start a bobbing loop when there is no data to display
  useEffect(() => {
    if (logs.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emptyBob, { toValue: -8, duration: 1000, useNativeDriver: true }),
          Animated.timing(emptyBob, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [logs.length]);

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.View style={{ transform: [{ translateY: emptyBob }] }}>
          <Ionicons name="analytics-outline" size={60} color={colors.text.muted} />
        </Animated.View>
        <Text style={styles.emptyText}>No activity data yet</Text>
        <Text style={styles.emptySubtext}>Log some activities to see your charts!</Text>
      </View>
    );
  }

  // Memoize all aggregation so it only recalculates when logs change
  const { categoryCounts, activityCounts, totalLogs, productiveCount, productivePercent, sortedActivities } = useMemo(() => {
    const catCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<CategoryType, number>);

    const actCounts = logs.reduce((acc, log) => {
      acc[log.activity] = (acc[log.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = logs.length;
    const prodCount = logs.filter(l => l.category === 'productive').length;
    const prodPercent = total > 0 ? Math.round((prodCount / total) * 100) : 0;
    const sorted = Object.entries(actCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      categoryCounts: catCounts,
      activityCounts: actCounts,
      totalLogs: total,
      productiveCount: prodCount,
      productivePercent: prodPercent,
      sortedActivities: sorted,
    };
  }, [logs]);

  /** Shared configuration object for react-native-chart-kit charts. */
  const chartConfig = {
    backgroundColor: colors.bg.secondary,
    backgroundGradientFrom: colors.bg.secondary,
    backgroundGradientTo: colors.bg.tertiary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(233, 69, 96, ${opacity})`,
    labelColor: () => colors.text.muted,
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: colors.border.subtle },
  };

  /** Render the currently selected chart type. */
  const renderChart = () => {
    switch (chartType) {
      case 'pie': {
        const pieData = Object.entries(categoryCounts).map(([category, count]) => ({
          name: CATEGORY_LABELS[category as CategoryType],
          count,
          color: CATEGORY_COLORS[category as CategoryType],
          legendFontColor: colors.text.secondary,
          legendFontSize: 12,
        }));
        return (
          <>
            <SectionHeader title="Category Breakdown" iconName="pie-chart-outline" />
            <PieChart data={pieData} width={screenWidth} height={200} chartConfig={{ color: () => '#fff' }} accessor="count" backgroundColor="transparent" paddingLeft="15" absolute />
          </>
        );
      }
      case 'bar': {
        if (sortedActivities.length === 0) return null;
        const barData = {
          labels: sortedActivities.map(([name]) => name.length > 7 ? name.slice(0, 6) + '..' : name),
          datasets: [{ data: sortedActivities.map(([, count]) => count) }],
        };
        return (
          <>
            <SectionHeader title="Activity Count" iconName="bar-chart-outline" />
            <BarChart data={barData} width={screenWidth} height={220} yAxisLabel="" yAxisSuffix="" fromZero chartConfig={chartConfig} style={styles.chart} />
          </>
        );
      }
      case 'timeline': {
        // Show recent activities as a visual timeline
        const recentLogs = logs.slice(0, 15); // Last 15 activities
        return (
          <>
            <SectionHeader title="Recent Activity Timeline" iconName="time-outline" />
            <View style={styles.timelineContainer}>
              {recentLogs.map((log, index) => {
                const color = CATEGORY_COLORS[log.category];
                const time = new Date(log.timestamp);
                const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const isLast = index === recentLogs.length - 1;
                return (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <Text style={styles.timelineTime}>{timeStr}</Text>
                      <Text style={styles.timelineDate}>{dateStr}</Text>
                    </View>
                    <View style={styles.timelineLine}>
                      <View style={[styles.timelineDot, { backgroundColor: color }]} />
                      {!isLast && <View style={[styles.timelineConnector, { backgroundColor: color + '40' }]} />}
                    </View>
                    <GlassCard glowColor={color} style={styles.timelineCardOuter}>
                      <View style={styles.timelineCardInner}>
                        <Text style={styles.timelineActivity}>{log.activity}</Text>
                        <View style={[styles.timelineBadge, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.timelineBadgeText, { color }]}>
                            {CATEGORY_LABELS[log.category]}
                          </Text>
                        </View>
                      </View>
                    </GlassCard>
                  </View>
                );
              })}
            </View>
          </>
        );
      }
      case 'progress': {
        const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        return (
          <>
            <SectionHeader title="Category Progress" iconName="battery-half-outline" />
            <View style={styles.progressContainer}>
              {categories.map(([category, count]) => {
                const percent = Math.round((count / totalLogs) * 100);
                const color = CATEGORY_COLORS[category as CategoryType];
                return (
                  <View key={category} style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { color }]}>{CATEGORY_LABELS[category as CategoryType]}</Text>
                      <Text style={styles.progressPercent}>{percent}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <LinearGradient
                        colors={[color, color + '80']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${percent}%` }]}
                      />
                    </View>
                    <Text style={styles.progressCount}>{count} activities</Text>
                  </View>
                );
              })}
            </View>
          </>
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: scoreOpacity, transform: [{ scale: scoreScale }] }}>
        <GlassCard>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreLabel}>Productivity Score</Text>
            <Text style={[styles.scoreValue, { color: productivePercent >= 60 ? colors.category.productive : productivePercent >= 40 ? colors.category['semi-productive'] : colors.category['non-productive'] }]}>
              {productivePercent}%
            </Text>
            <Text style={styles.scoreSubtext}>{productiveCount} of {totalLogs} activities were productive</Text>
          </View>
        </GlassCard>
      </Animated.View>
      <Animated.View style={{ opacity: chartOpacity, transform: [{ translateY: chartY }] }}>
        {renderChart()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, color: colors.text.primary, fontWeight: '600', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.text.muted, marginTop: 4 },
  scoreContent: { alignItems: 'center' },
  scoreLabel: { fontSize: 14, color: colors.text.muted, marginBottom: 4 },
  scoreValue: { fontSize: 48, fontWeight: 'bold' },
  scoreSubtext: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
  chart: { borderRadius: 12 },
  progressContainer: { gap: 16 },
  progressItem: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressPercent: { fontSize: 14, color: colors.text.muted, fontWeight: '600' },
  progressTrack: { height: 10, backgroundColor: colors.bg.secondary, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressCount: { fontSize: 11, color: colors.text.dim },

  timelineContainer: { gap: 0 },
  timelineItem: { flexDirection: 'row', alignItems: 'stretch', minHeight: 56 },
  timelineLeft: { width: 52, alignItems: 'flex-end', paddingRight: 10, paddingTop: 4 },
  timelineTime: { fontSize: 11, color: colors.text.muted, fontWeight: '600' },
  timelineDate: { fontSize: 9, color: colors.text.dim },
  timelineLine: { width: 20, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, zIndex: 1 },
  timelineConnector: { width: 2, flex: 1 },
  timelineCardOuter: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 8,
  },
  timelineCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineActivity: { color: colors.text.primary, fontSize: 13, fontWeight: '600' },
  timelineBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timelineBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'capitalize' },
});

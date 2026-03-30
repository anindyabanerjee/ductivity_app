import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ActivityLog, CategoryType, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

const screenWidth = Dimensions.get('window').width - 40;

export type ChartType = 'pie' | 'bar' | 'line' | 'progress';

interface Props {
  logs: ActivityLog[];
  chartType: ChartType;
}

export default function ActivityChart({ logs, chartType }: Props) {
  // Animations
  const scoreOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.9);
  const chartOpacity = useSharedValue(0);
  const chartTranslateY = useSharedValue(20);
  const emptyBob = useSharedValue(0);

  useEffect(() => {
    // Reset and animate on data or chart type change
    scoreOpacity.value = 0;
    scoreScale.value = 0.9;
    chartOpacity.value = 0;
    chartTranslateY.value = 20;

    scoreOpacity.value = withTiming(1, { duration: 500 });
    scoreScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    chartOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    chartTranslateY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [logs, chartType]);

  useEffect(() => {
    if (logs.length === 0) {
      emptyBob.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [logs.length]);

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ scale: scoreScale.value }],
  }));

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ translateY: chartTranslateY.value }],
  }));

  const emptyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: emptyBob.value }],
  }));

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.Text style={[styles.emptyEmoji, emptyStyle]}>📊</Animated.Text>
        <Text style={styles.emptyText}>No activity data yet</Text>
        <Text style={styles.emptySubtext}>
          Log some activities to see your charts!
        </Text>
      </View>
    );
  }

  // Data calculations
  const categoryCounts = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<CategoryType, number>);

  const activityCounts = logs.reduce((acc, log) => {
    acc[log.activity] = (acc[log.activity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLogs = logs.length;
  const productiveCount = logs.filter(l => l.category === 'productive').length;
  const productivePercent = Math.round((productiveCount / totalLogs) * 100);

  const sortedActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Chart configs
  const chartConfig = {
    backgroundColor: '#16213e',
    backgroundGradientFrom: '#16213e',
    backgroundGradientTo: '#1a2a4e',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(233, 69, 96, ${opacity})`,
    labelColor: () => '#a0a0b0',
    barPercentage: 0.6,
    propsForBackgroundLines: {
      stroke: 'rgba(255,255,255,0.05)',
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie': {
        const pieData = Object.entries(categoryCounts).map(([category, count]) => ({
          name: CATEGORY_LABELS[category as CategoryType],
          count,
          color: CATEGORY_COLORS[category as CategoryType],
          legendFontColor: '#c0c0d0',
          legendFontSize: 12,
        }));
        return (
          <>
            <Text style={styles.chartTitle}>Category Breakdown</Text>
            <PieChart
              data={pieData}
              width={screenWidth}
              height={200}
              chartConfig={{ color: () => '#fff' }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </>
        );
      }

      case 'bar': {
        if (sortedActivities.length === 0) return null;
        const barData = {
          labels: sortedActivities.map(([name]) =>
            name.length > 7 ? name.slice(0, 6) + '..' : name
          ),
          datasets: [{ data: sortedActivities.map(([, count]) => count) }],
        };
        return (
          <>
            <Text style={styles.chartTitle}>Activity Count</Text>
            <BarChart
              data={barData}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </>
        );
      }

      case 'line': {
        // Group logs by hour
        const hourBuckets: Record<string, number> = {};
        logs.forEach((log) => {
          const hour = new Date(log.timestamp).getHours();
          const label = `${hour}:00`;
          hourBuckets[label] = (hourBuckets[label] || 0) + 1;
        });
        const sortedHours = Object.entries(hourBuckets)
          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
          .slice(-8);

        if (sortedHours.length < 2) {
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Need more data for line chart</Text>
              <Text style={styles.emptySubtext}>Log activities across different hours</Text>
            </View>
          );
        }

        const lineData = {
          labels: sortedHours.map(([label]) => label),
          datasets: [{ data: sortedHours.map(([, count]) => count) }],
        };
        return (
          <>
            <Text style={styles.chartTitle}>Activity Over Time</Text>
            <LineChart
              data={lineData}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              bezier
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(233, 69, 96, ${opacity})`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#e94560',
                },
              }}
              style={styles.chart}
            />
          </>
        );
      }

      case 'progress': {
        const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        return (
          <>
            <Text style={styles.chartTitle}>Category Progress</Text>
            <View style={styles.progressContainer}>
              {categories.map(([category, count]) => {
                const percent = Math.round((count / totalLogs) * 100);
                const color = CATEGORY_COLORS[category as CategoryType];
                return (
                  <View key={category} style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { color }]}>
                        {CATEGORY_LABELS[category as CategoryType]}
                      </Text>
                      <Text style={styles.progressPercent}>{percent}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percent}%`, backgroundColor: color },
                        ]}
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
      {/* Productivity Score */}
      <Animated.View style={[styles.scoreCard, scoreStyle]}>
        <Text style={styles.scoreLabel}>Productivity Score</Text>
        <Text
          style={[
            styles.scoreValue,
            { color: productivePercent >= 60 ? '#4CAF50' : productivePercent >= 40 ? '#FF9800' : '#F44336' },
          ]}
        >
          {productivePercent}%
        </Text>
        <Text style={styles.scoreSubtext}>
          {productiveCount} of {totalLogs} activities were productive
        </Text>
      </Animated.View>

      {/* Dynamic Chart */}
      <Animated.View style={chartStyle}>
        {renderChart()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0a0b0',
    marginTop: 4,
  },
  scoreCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#a0a0b0',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#a0a0b0',
    marginTop: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 12,
  },
  progressContainer: {
    gap: 16,
  },
  progressItem: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    color: '#a0a0b0',
    fontWeight: '600',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#16213e',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressCount: {
    fontSize: 11,
    color: '#666',
  },
});

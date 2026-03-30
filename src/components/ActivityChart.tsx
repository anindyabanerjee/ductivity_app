import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { ActivityLog, CategoryType, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

const screenWidth = Dimensions.get('window').width - 40;

interface Props {
  logs: ActivityLog[];
}

export default function ActivityChart({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyText}>No activity data yet</Text>
        <Text style={styles.emptySubtext}>
          Log some activities to see your charts!
        </Text>
      </View>
    );
  }

  // Category breakdown for pie chart
  const categoryCounts = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<CategoryType, number>);

  const pieData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: CATEGORY_LABELS[category as CategoryType],
    count,
    color: CATEGORY_COLORS[category as CategoryType],
    legendFontColor: '#c0c0d0',
    legendFontSize: 12,
  }));

  // Activity breakdown for bar chart
  const activityCounts = logs.reduce((acc, log) => {
    acc[log.activity] = (acc[log.activity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Top 6

  const barData = {
    labels: sortedActivities.map(([name]) =>
      name.length > 8 ? name.slice(0, 7) + '..' : name
    ),
    datasets: [{ data: sortedActivities.map(([, count]) => count) }],
  };

  const totalLogs = logs.length;
  const productiveCount = logs.filter(l => l.category === 'productive').length;
  const productivePercent = Math.round((productiveCount / totalLogs) * 100);

  return (
    <View style={styles.container}>
      {/* Productivity Score */}
      <View style={styles.scoreCard}>
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
      </View>

      {/* Category Pie Chart */}
      <Text style={styles.chartTitle}>Category Breakdown</Text>
      <PieChart
        data={pieData}
        width={screenWidth}
        height={200}
        chartConfig={{
          color: () => '#fff',
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Activity Bar Chart */}
      {sortedActivities.length > 0 && (
        <>
          <Text style={styles.chartTitle}>Activity Count</Text>
          <BarChart
            data={barData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            chartConfig={{
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
            }}
            style={styles.barChart}
          />
        </>
      )}
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
  },
  barChart: {
    borderRadius: 12,
  },
});

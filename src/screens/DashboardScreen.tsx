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
import { getActivities } from '../services/activityService';
import { ActivityLog, TimeFilter } from '../types';
import ActivityChart, { ChartType } from '../components/ActivityChart';
import SkeletonLoader from '../components/SkeletonLoader';
import { useUser } from '../context/UserContext';
import { AnimatedButton, useFadeInUp } from '../utils/animations';

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: '3H', value: '3h' },
  { label: '6H', value: '6h' },
  { label: '12H', value: '12h' },
  { label: '24H', value: '24h' },
  { label: 'Today', value: 'daily' },
  { label: 'Week', value: 'weekly' },
  { label: 'Month', value: 'monthly' },
];

const CHART_TYPES: { label: string; icon: string; value: ChartType }[] = [
  { label: 'Pie', icon: '🥧', value: 'pie' },
  { label: 'Bar', icon: '📊', value: 'bar' },
  { label: 'Timeline', icon: '🕐', value: 'timeline' },
  { label: 'Progress', icon: '🔋', value: 'progress' },
];

export default function DashboardScreen() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('daily');
  const [activeChart, setActiveChart] = useState<ChartType>('pie');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userName } = useUser();

  const header = useFadeInUp(0);
  const subheader = useFadeInUp(100);
  const filterOpacity = useRef(new Animated.Value(0)).current;
  const filterX = useRef(new Animated.Value(-30)).current;
  const sliderOpacity = useRef(new Animated.Value(0)).current;
  const sliderX = useRef(new Animated.Value(-30)).current;

  const hasAnimated = useRef(false);

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

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
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
          {TIME_FILTERS.map((filter) => (
            <AnimatedButton
              key={filter.value}
              style={[styles.filterButton, activeFilter === filter.value && styles.activeFilter]}
              onPress={() => setActiveFilter(filter.value)}
              scaleValue={0.92}
            >
              <Text style={[styles.filterText, activeFilter === filter.value && styles.activeFilterText]}>
                {filter.label}
              </Text>
            </AnimatedButton>
          ))}
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
              <Text style={styles.chartTypeIcon}>{type.icon}</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />}
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
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  headerContainer: { paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#a0a0b0', paddingHorizontal: 20, marginBottom: 14 },
  filterContainer: { maxHeight: 44, marginBottom: 10 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#16213e' },
  activeFilter: { backgroundColor: '#e94560' },
  filterText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  activeFilterText: { color: '#fff' },
  chartSliderContainer: { maxHeight: 50, marginBottom: 14 },
  chartTypeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#16213e', borderWidth: 1, borderColor: 'transparent' },
  activeChartType: { backgroundColor: '#1a2a4e', borderColor: '#e94560' },
  chartTypeIcon: { fontSize: 16 },
  chartTypeText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  activeChartTypeText: { color: '#e94560' },
  chartsContainer: { flex: 1, paddingHorizontal: 20 },
  skeletonContainer: { paddingTop: 8 },
});

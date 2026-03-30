import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { getActivities } from '../services/activityService';
import { ActivityLog, TimeFilter } from '../types';
import ActivityChart from '../components/ActivityChart';

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: '3H', value: '3h' },
  { label: '6H', value: '6h' },
  { label: '12H', value: '12h' },
  { label: '24H', value: '24h' },
  { label: 'Today', value: 'daily' },
  { label: 'Week', value: 'weekly' },
  { label: 'Month', value: 'monthly' },
];

export default function DashboardScreen() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('daily');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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
      <Text style={styles.header}>Dashboard</Text>
      <Text style={styles.subheader}>Your productivity insights</Text>

      {/* Time Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {TIME_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              activeFilter === filter.value && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.value && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Charts */}
      <ScrollView
        style={styles.chartsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <ActivityChart logs={logs} />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: '#a0a0b0',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContainer: {
    maxHeight: 44,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16213e',
  },
  activeFilter: {
    backgroundColor: '#e94560',
  },
  filterText: {
    color: '#a0a0b0',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  chartsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0b0',
    fontSize: 16,
  },
});

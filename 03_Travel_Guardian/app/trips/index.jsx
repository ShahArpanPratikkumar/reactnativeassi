// Travel Guardian - Trips Itinerary List Screen
// Uses FlatList, Pull-to-Refresh, Search/Filter, and Pagination for managing travel plans

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import EmptyState from '../../components/EmptyState';
import { getTrips } from '../../services/tripService';

export default function TripsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // 1. Trips Data State
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Upcoming' | 'Active' | 'Completed'
  const filterOptions = ['All', 'Upcoming', 'Active', 'Completed'];

  // 3. Loading, Refreshing & Pagination State
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10); // Simple pagination step

  // Fetch / Refresh trips from API
  const fetchTripsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTrips();
      if (response && response.data) {
        setTrips(response.data);
      }
    } catch (error) {
      console.log('Error loading trips from API:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTripsData();
  }, [fetchTripsData]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTripsData();
    setRefreshing(false);
  };

  // Pagination / Load more items on reaching end of list
  const handleLoadMore = () => {
    if (displayedCount < trips.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedCount((prev) => prev + 5);
        setLoadingMore(false);
      }, 500);
    }
  };

  // Filtered trips computation
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || trip.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const paginatedTrips = filteredTrips.slice(0, displayedCount);

  // Status badge style helper
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Upcoming':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'Active':
        return { bg: colors.secondaryLight, text: colors.secondary };
      case 'Completed':
        return { bg: '#E2E8F0', text: colors.textSecondary };
      default:
        return { bg: colors.primaryLight, text: colors.primary };
    }
  };

  // Render individual trip item
  const renderTripItem = ({ item }) => {
    const badge = getBadgeStyle(item.status);
    const tripId = item._id || item.id;

    return (
      <Pressable
        style={[styles.tripCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.push(`/trips/${tripId}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.tripTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>{item.destination}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {item.startDate} {item.endDate ? `to ${item.endDate}` : ''}
          </Text>
        </View>

        {item.hotel ? (
          <View style={styles.infoRow}>
            <Ionicons name="bed-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>{item.hotel}</Text>
          </View>
        ) : null}

        {/* Card Footer with details link & counters */}
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
          <View style={styles.metaCounters}>
            <View style={[styles.counterPill, { backgroundColor: theme.surface }]}>
              <Ionicons name="document-text" size={12} color={theme.textSecondary} />
              <Text style={[styles.counterText, { color: theme.textSecondary }]}>{item.assignedDocs || 2} Docs</Text>
            </View>
            <View style={[styles.counterPill, { backgroundColor: theme.surface }]}>
              <Ionicons name="people" size={12} color={theme.textSecondary} />
              <Text style={[styles.counterText, { color: theme.textSecondary }]}>{item.assignedContacts || 2} Contacts</Text>
            </View>
          </View>

          <View style={styles.detailsLink}>
            <Text style={[styles.detailsLinkText, { color: theme.primary }]}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. Header & New Trip Button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.screenHeading, { color: theme.text }]}>My Itineraries</Text>
          <Text style={[styles.screenSubheading, { color: theme.textSecondary }]}>
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} planned
          </Text>
        </View>
        <Pressable
          style={[styles.createBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/trips/create')}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.createBtnText}>Plan Trip</Text>
        </Pressable>
      </View>

      {/* 2. Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by destination or title..."
          placeholderTextColor={theme.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color={theme.textLight} />
          </Pressable>
        )}
      </View>

      {/* 3. Filter Status Tabs */}
      <View style={styles.filtersRow}>
        {filterOptions.map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.filterTab,
              { backgroundColor: statusFilter === filter ? theme.primary : theme.card, borderColor: theme.border },
            ]}
            onPress={() => setStatusFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: statusFilter === filter ? colors.white : theme.textSecondary },
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 4. Trips FlatList with Pull-to-Refresh & Pagination */}
      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 14 }}>Loading trips...</Text>
        </View>
      ) : (
        <FlatList
          data={paginatedTrips}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderTripItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>Loading more trips...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="airplane-outline"
              title="No Trips Found"
              description="You haven't planned any trips yet. Create your first itinerary!"
              buttonTitle="Plan a New Trip"
              onButtonPress={() => router.push('/trips/create')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  screenSubheading: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  clearSearchBtn: {
    padding: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  tripCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12,
    paddingTop: 10,
  },
  metaCounters: {
    flexDirection: 'row',
    gap: 8,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  counterText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
  },
  loadingMoreBox: {
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  loadingMoreText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

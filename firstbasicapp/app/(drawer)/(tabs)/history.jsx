import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSurveys } from '@/context/SurveyContext';
import { SurveyCard } from '@/components/SurveyCard';
import { EmptyState } from '@/components/EmptyState';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIORITY_FILTERS = ['All', 'High', 'Medium', 'Low'];

export default function HistoryScreen() {
  const { surveys, deleteSurvey, setSelectedSurvey } = useSurveys();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      !searchQuery.trim() ||
      survey.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (survey.description && survey.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'All' || survey.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleDelete = (id) => {
    Alert.alert('Delete Survey', 'Are you sure you want to delete this survey?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSurvey(id),
      },
    ]);
  };

  const handleViewDetails = (survey) => {
    setSelectedSurvey(survey);
    navigation.navigate('survey-preview');
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const renderSurvey = ({ item }) => (
    <View style={styles.cardWrapper}>
      <SurveyCard
        survey={item}
        onPress={() => handleViewDetails(item)}
        onDelete={handleDelete}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📋 Survey History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredSurveys.length} of {surveys.length} surveys
          </Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search surveys..."
            placeholderTextColor={Colors.light.textSecondary + '99'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearch}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        {PRIORITY_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              priorityFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setPriorityFilter(filter)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                priorityFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {surveys.length === 0 ? (
        <EmptyState
          icon={'📋'}
          title="No Surveys Yet"
          message="Create your first survey from the Dashboard or New Survey tab."
        />
      ) : filteredSurveys.length === 0 ? (
        <EmptyState
          icon={'🔍'}
          title="No Results Found"
          message={`No surveys match your search${searchQuery ? ' "' + searchQuery + '"' : ''}${
            priorityFilter !== 'All' ? ' with ' + priorityFilter + ' priority' : ''
          }`}
        />
      ) : (
        <FlatList
          data={filteredSurveys}
          keyExtractor={(item) => item.id}
          renderItem={renderSurvey}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
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
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.white,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight || '#F1F5F9',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.lg,
    ...Typography.body,
    color: Colors.light.text,
  },
  clearSearch: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
  },
  clearSearchText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    ...Typography.captionMedium,
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.light.white,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: Spacing.sm,
  },
});

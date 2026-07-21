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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useNavigation } from '@react-navigation/native';

const PRIORITY_FILTERS = ['All', 'High', 'Medium', 'Low'];

export default function HistoryScreen() {
  const { surveys, deleteSurvey, setSelectedSurvey } = useSurveys();
  const navigation = useNavigation();
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

      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Survey History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredSurveys.length} of {surveys.length} surveys
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search surveys..."
          placeholderTextColor={Colors.light.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearch}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>{'\u2715'}</Text>
          </TouchableOpacity>
        )}
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
          icon={'\uD83D\uDCCB'}
          title="No Surveys Yet"
          message="Create your first survey from the Dashboard or New Survey tab."
        />
      ) : filteredSurveys.length === 0 ? (
        <EmptyState
          icon={'\uD83D\uDD0D'}
          title="No Results Found"
          message={`No surveys match your search"${searchQuery ? ' "' + searchQuery + '"' : ''}${
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
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
  },
  clearSearch: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.border,
  },
  clearSearchText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
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
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.light.white,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 30,
  },
  cardWrapper: {
    marginBottom: Spacing.sm,
  },
});

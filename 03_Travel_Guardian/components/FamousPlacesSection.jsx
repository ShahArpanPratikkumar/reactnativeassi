// Travel Guardian - All-India Famous Attractions, Food & Shopping Section
// Displays famous delicacies, monuments, shopping bazaars, and cultural heritage
// for the user's current GPS location or any chosen city/state across India.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import SafeLocationImage from './SafeLocationImage';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { INDIA_DESTINATIONS, getDestinationData } from '../constants/indiaDestinationsData';

const { width } = Dimensions.get('window');

// Strip local-language hints in parentheses: "Adalaj Stepwell (Adalaj ni Vav)" → "Adalaj Stepwell"
function cleanName(name) {
  return (name || '').replace(/\(.*?\)/g, '').trim();
}

export default function FamousPlacesSection({
  currentCity = 'Ahmedabad',
  currentAddress = '',
}) {
  const { theme, isDarkMode } = useTheme();

  // Active City & Filter State
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Ahmedabad');
  const [activeCategory, setActiveCategory] = useState('food'); // 'food' | 'attractions' | 'shopping' | 'culture'
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalItem, setDetailModalItem] = useState(null);

  // Retrieve full curated or synthesized profile for selected city
  const destination = useMemo(() => {
    return getDestinationData(searchQuery.trim() || selectedCity);
  }, [selectedCity, searchQuery]);

  // City Quick-Switch Chips (Gujarat & Top Indian Destinations)
  const popularCities = [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Dwarka',
    'Somnath',
    'Kutch',
    'Gir',
    'Mumbai',
    'Pune',
    'Shirdi',
    'Jaipur',
    'Udaipur',
    'Jodhpur',
    'Delhi',
    'Varanasi',
    'Agra',
    'Ayodhya',
    'Amritsar',
    'Manali',
    'Rishikesh',
    'Ujjain',
    'Goa',
  ];

  return (
    <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* 1. Header with Badge & Current Location Indicator */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.badge, { backgroundColor: colors.secondary + '18' }]}>
            <Ionicons name="sparkles" size={13} color={colors.secondary} />
            <Text style={[styles.badgeText, { color: colors.secondary }]}>ALL-INDIA EXPLORE</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Famous in {destination.city}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {destination.tagline}
          </Text>
        </View>

        {/* GPS Auto-detect Button */}
        {currentCity && selectedCity !== currentCity && (
          <Pressable
            style={[styles.gpsResetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {
              setSelectedCity(currentCity);
              setSearchQuery('');
            }}
          >
            <Ionicons name="locate" size={14} color={theme.primary} />
            <Text style={[styles.gpsResetText, { color: theme.primary }]}>My City</Text>
          </Pressable>
        )}
      </View>

      {/* 2. City Quick Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityChipsRow}>
        {popularCities.map((c) => {
          const isSelected = selectedCity.toLowerCase() === c.toLowerCase() && !searchQuery;
          return (
            <Pressable
              key={c}
              style={[
                styles.cityChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => {
                setSelectedCity(c);
                setSearchQuery('');
              }}
            >
              <Text style={[styles.cityChipText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 3. Search Any Town/City in India */}
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textLight} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search any Indian city, town, or state…"
          placeholderTextColor={theme.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={theme.textLight} />
          </Pressable>
        )}
      </View>

      {/* 4. Category Selector Tabs */}
      <View style={[styles.categoryTabs, { borderBottomColor: theme.border }]}>
        {[
          { id: 'food', label: '🍛 Delicacies', count: destination.food.length },
          { id: 'attractions', label: '🏛️ Sights', count: destination.attractions.length },
          { id: 'shopping', label: '🛍️ Shopping', count: destination.shopping.length },
          { id: 'culture', label: '🎭 Culture' },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.categoryTab,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 },
              ]}
              onPress={() => setActiveCategory(tab.id)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  { color: isActive ? colors.primary : theme.textSecondary },
                  isActive && { fontWeight: 'bold' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 5. Category Content Feed */}
      {/* 5A. FOOD & DELICACIES */}
      {activeCategory === 'food' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {destination.food.map((item, idx) => (
            <Pressable
              key={idx}
              style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setDetailModalItem({ ...item, category: 'Food & Delicacy' })}
            >
              <SafeLocationImage
                uri={item.image}
                placeName={`${cleanName(item.name)} ${destination.city}`}
                style={styles.itemCardImage}
                fallbackCategory="food"
              />
              <View style={styles.itemCardBody}>
                <View style={styles.cardBadgeRow}>
                  <View style={[styles.typePill, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.typePillText, { color: '#10B981' }]}>MUST TRY</Text>
                  </View>
                </View>
                <Text style={[styles.itemCardTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.desc}
                </Text>
                <View style={styles.itemCardFooter}>
                  <Ionicons name="location-outline" size={12} color={colors.primary} />
                  <Text style={[styles.footerText, { color: colors.primary }]} numberOfLines={1}>
                    {item.whereToTry}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* 5B. TOP ATTRACTIONS & SIGHTS */}
      {activeCategory === 'attractions' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {destination.attractions.map((item, idx) => (
            <Pressable
              key={idx}
              style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setDetailModalItem({ ...item, category: 'Iconic Attraction' })}
            >
              <SafeLocationImage
                uri={item.image}
                placeName={`${cleanName(item.name)} ${destination.city}`}
                style={styles.itemCardImage}
                fallbackCategory="attraction"
              />
              <View style={styles.itemCardBody}>
                <View style={styles.cardBadgeRow}>
                  <View style={[styles.typePill, { backgroundColor: '#3B82F620' }]}>
                    <Text style={[styles.typePillText, { color: '#3B82F6' }]}>HERITAGE</Text>
                  </View>
                </View>
                <Text style={[styles.itemCardTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.desc}
                </Text>
                <View style={styles.itemCardFooter}>
                  <Ionicons name="time-outline" size={12} color={colors.primary} />
                  <Text style={[styles.footerText, { color: colors.primary }]} numberOfLines={1}>
                    {item.timings}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* 5C. SHOPPING & HANDICRAFTS */}
      {activeCategory === 'shopping' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
          {destination.shopping.map((item, idx) => (
            <Pressable
              key={idx}
              style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setDetailModalItem({ ...item, category: 'Shopping & Handicraft' })}
            >
              <SafeLocationImage
                uri={item.image}
                placeName={`${cleanName(item.name)} ${destination.city}`}
                style={styles.itemCardImage}
                fallbackCategory="shopping"
              />
              <View style={styles.itemCardBody}>
                <View style={styles.cardBadgeRow}>
                  <View style={[styles.typePill, { backgroundColor: '#F59E0B20' }]}>
                    <Text style={[styles.typePillText, { color: '#D97706' }]}>SOUVENIR</Text>
                  </View>
                </View>
                <Text style={[styles.itemCardTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.desc}
                </Text>
                <View style={styles.itemCardFooter}>
                  <Ionicons name="cart-outline" size={12} color={colors.primary} />
                  <Text style={[styles.footerText, { color: colors.primary }]} numberOfLines={1}>
                    {item.bazaar}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* 5D. CULTURE, SEASONS & TRAVEL TIPS */}
      {activeCategory === 'culture' && (
        <View style={[styles.cultureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cultureRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cultureLabel, { color: theme.textSecondary }]}>Best Time to Visit:</Text>
              <Text style={[styles.cultureValue, { color: theme.text }]}>{destination.culture.bestSeason}</Text>
            </View>
          </View>

          <View style={styles.cultureRow}>
            <Ionicons name="color-palette-outline" size={18} color="#9333EA" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cultureLabel, { color: theme.textSecondary }]}>Famous Festivals:</Text>
              <Text style={[styles.cultureValue, { color: theme.text }]}>{destination.culture.festivals}</Text>
            </View>
          </View>

          <View style={[styles.cultureRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cultureLabel, { color: theme.textSecondary }]}>Local Traveler Safety Advice:</Text>
              <Text style={[styles.cultureValue, { color: theme.text }]}>{destination.culture.safetyTips}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 6. Item Detail Modal */}
      <Modal
        visible={detailModalItem !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SafeLocationImage
              uri={detailModalItem?.image}
              placeName={detailModalItem ? `${cleanName(detailModalItem.name)} ${destination.city}` : ''}
              style={styles.modalHeroImage}
              fallbackCategory="city"
            />
            <Pressable style={styles.modalCloseCircle} onPress={() => setDetailModalItem(null)}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>

            <View style={styles.modalBody}>
              <View style={[styles.modalPill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.modalPillText, { color: colors.primary }]}>
                  {detailModalItem?.category || 'Speciality'} • {destination.city}
                </Text>
              </View>

              <Text style={[styles.modalItemTitle, { color: theme.text }]}>{detailModalItem?.name}</Text>
              <Text style={[styles.modalItemDesc, { color: theme.textSecondary }]}>{detailModalItem?.desc}</Text>

              {detailModalItem?.whereToTry && (
                <View style={[styles.modalInfoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalInfoTitle, { color: theme.text }]}>Where to Try / Order:</Text>
                    <Text style={[styles.modalInfoSub, { color: theme.textSecondary }]}>{detailModalItem.whereToTry}</Text>
                  </View>
                </View>
              )}

              {detailModalItem?.timings && (
                <View style={[styles.modalInfoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Ionicons name="time-outline" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalInfoTitle, { color: theme.text }]}>Timings & Entry:</Text>
                    <Text style={[styles.modalInfoSub, { color: theme.textSecondary }]}>{detailModalItem.timings}</Text>
                  </View>
                </View>
              )}

              {detailModalItem?.bazaar && (
                <View style={[styles.modalInfoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Ionicons name="bag-handle-outline" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalInfoTitle, { color: theme.text }]}>Authentic Markets / Bazaars:</Text>
                    <Text style={[styles.modalInfoSub, { color: theme.textSecondary }]}>{detailModalItem.bazaar}</Text>
                  </View>
                </View>
              )}

              <Pressable
                style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]}
                onPress={() => setDetailModalItem(null)}
              >
                <Text style={styles.modalCloseBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  gpsResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  gpsResetText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cityChipsRow: {
    marginBottom: 10,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  categoryTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardScroll: {
    paddingVertical: 4,
  },
  itemCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  itemCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#CBD5E1',
  },
  itemCardBody: {
    padding: 10,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  itemCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemCardDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  itemCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cultureCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  cultureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cultureLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cultureValue: {
    fontSize: 12,
    marginTop: 1,
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    maxHeight: '85%',
  },
  modalHeroImage: {
    width: '100%',
    height: 200,
  },
  modalCloseCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 16,
  },
  modalPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  modalPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalItemDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
  },
  modalInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalInfoSub: {
    fontSize: 11,
    marginTop: 1,
  },
  modalCloseBtn: {
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

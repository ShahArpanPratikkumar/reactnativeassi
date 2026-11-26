// Travel Guardian - Live Safety Map & Safe Zones Screen
// Uses Expo Location & React Native Maps for GPS tracking, safe havens, and search

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../hooks/useLocation';
import {
  fetchNearbyPlaces,
  getPlaceIcon,
  getPlaceColor,
  getPlaceBgColor,
} from '../../services/nearbyPlacesService';
import UniversalSafetyMap from '../../components/UniversalSafetyMap';

// Safely load MapView for native platforms
let MapView, Marker, UrlTile;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
    UrlTile = Maps.UrlTile;
  } catch (err) {
    console.log('React Native Maps not supported in this environment:', err.message);
  }
}

export default function MapScreen() {
  const { theme } = useTheme();
  // Map reference for animating camera / panning
  const mapRef = useRef(null);

  // Custom hook for location management
  const {
    location,
    latitude,
    longitude,
    address,
    errorMsg,
    loading,
    hasPermission,
    isWatching,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    searchLocation,
    requestLocationPermission,
  } = useLocation();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  // Nearby places — fetched from OpenStreetMap (real data, no hardcoding)
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Map Layer Engine: 'voyager' (CartoDB OSM, unblocked) | 'standard' (Road) | 'satellite' (Satellite Hybrid)
  const [mapLayer, setMapLayer] = useState('voyager');

  // Ref to avoid duplicate fetches when location barely moves
  const lastFetchRef = useRef(null);

  // Center map on coordinates
  const centerMap = (coords) => {
    if (mapRef.current && coords) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    }
  };

  // Center on current location whenever location updates + fetch nearby places
  useEffect(() => {
    if (!location) return;
    centerMap(location);

    // Only fetch if we moved more than ~100m from the last fetch
    const last = lastFetchRef.current;
    if (last) {
      const dLat = Math.abs(location.latitude - last.latitude);
      const dLon = Math.abs(location.longitude - last.longitude);
      if (dLat < 0.001 && dLon < 0.001) return;
    }
    lastFetchRef.current = { latitude: location.latitude, longitude: location.longitude };
    loadNearbyPlaces(location.latitude, location.longitude);
  }, [location]);

  // Jump camera directly to closest hospital or police station
  const jumpToNearest = (type) => {
    const matched = nearbyPlaces.find((p) => p.type === type);
    if (matched) {
      centerMap({ latitude: matched.latitude, longitude: matched.longitude });
      setSelectedPlace(matched);
      Alert.alert('📍 Centered on Map', `Found ${matched.name} (${matched.distanceText} away)`);
    } else {
      Alert.alert('Searching...', `Scanning area for nearby ${type}s...`);
    }
  };

  // Fetch real nearby safety places from OpenStreetMap
  const loadNearbyPlaces = async (lat, lon) => {
    try {
      setNearbyLoading(true);
      setNearbyError(null);
      const places = await fetchNearbyPlaces(lat, lon);
      setNearbyPlaces(places);
    } catch (err) {
      console.log('[Map] Nearby places error:', err.message);
      setNearbyError('Could not load nearby places. Check your connection.');
    } finally {
      setNearbyLoading(false);
    }
  };

  // Handle location search with automatic map centering and safety places update
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    const foundCoords = await searchLocation(searchQuery);
    setSearching(false);

    if (foundCoords) {
      loadNearbyPlaces(foundCoords.latitude, foundCoords.longitude);
      Alert.alert('📍 Location Found', `Centered map on "${searchQuery}"\nLat: ${foundCoords.latitude.toFixed(4)}, Lon: ${foundCoords.longitude.toFixed(4)}`);
    } else {
      Alert.alert('Not Found', `Could not locate "${searchQuery}". Please check the spelling or try another city or landmark.`);
    }
  };

  // Handle live location tracking toggle
  const handleToggleTracking = () => {
    if (isWatching) {
      stopLocationTracking();
      Alert.alert('Live Tracking Paused', 'GPS watcher unsubscribed.');
    } else {
      startLocationTracking();
      Alert.alert('Live Tracking Active', 'Your GPS location is being monitored in real-time.');
    }
  };

  // Share current location via native share sheet (Google Maps URL)
  const handleShareLocation = async () => {
    if (!location) {
      Alert.alert('Location Unavailable', 'GPS coordinates are not ready yet. Please wait and try again.');
      return;
    }
    const { latitude: lat, longitude: lon } = location;
    const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
    const message = `📍 My current location:\n${address}\n\n${mapsUrl}`;
    try {
      await Share.share({ message, title: 'My Location — Travel Guardian' });
    } catch (err) {
      Alert.alert('Share Failed', err.message || 'Could not open share sheet.');
    }
  };

  // Open native maps app for directions to a nearby place
  const handleDirections = (place) => {
    if (!location) {
      Alert.alert('Location Unavailable', 'Current GPS not available.');
      return;
    }
    const { latitude: uLat, longitude: uLon } = location;
    const { latitude: dLat, longitude: dLon, name } = place;
    const url = Platform.select({
      ios: `maps:?saddr=${uLat},${uLon}&daddr=${dLat},${dLon}`,
      android: `google.navigation:q=${dLat},${dLon}`,
    });
    const fallback = `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLon}&destination=${dLat},${dLon}`;
    Linking.canOpenURL(url)
      .then((ok) => (ok ? Linking.openURL(url) : Linking.openURL(fallback)))
      .catch(() => Linking.openURL(fallback).catch(() => Alert.alert('Error', `Cannot open maps for ${name}.`)));
  };

  // Call a place if it has a phone number
  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Cannot make phone calls on this device.')
    );
  };

  // -------------------------------------------------------------
  // 1. Permission Denied Screen
  // -------------------------------------------------------------
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.permissionIconCircle}>
          <Ionicons name="location-outline" size={56} color={colors.danger} />
        </View>
        <Text style={styles.permissionTitle}>GPS Permission Required</Text>
        <Text style={styles.permissionMessage}>
          Travel Guardian requires location permissions to display safety maps, locate nearby safe zones, and broadcast emergency coordinates.
        </Text>
        <Pressable
          style={styles.actionButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.actionButtonText}>Grant Location Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isMapInteracting}
      >
      {/* 1. Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search city, address, or landmark..."
          placeholderTextColor={theme.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color={theme.textLight} />
          </Pressable>
        )}
        <Pressable style={styles.searchButton} onPress={handleSearch} disabled={searching}>
          {searching ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          )}
        </Pressable>
      </View>

      {/* Emergency Quick Jump Pills */}
      <View style={styles.mapQuickPillsRow}>
        <Pressable
          style={[styles.mapQuickPill, { backgroundColor: colors.danger + '16', borderColor: colors.danger }]}
          onPress={() => jumpToNearest('hospital')}
        >
          <Ionicons name="medical" size={14} color={colors.danger} />
          <Text style={[styles.mapQuickPillText, { color: colors.danger }]}>Nearest Hospital</Text>
        </Pressable>

        <Pressable
          style={[styles.mapQuickPill, { backgroundColor: colors.primary + '16', borderColor: colors.primary }]}
          onPress={() => jumpToNearest('police')}
        >
          <Ionicons name="shield" size={14} color={colors.primary} />
          <Text style={[styles.mapQuickPillText, { color: colors.primary }]}>Nearest Police</Text>
        </Pressable>

        <Pressable
          style={[styles.mapQuickPill, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => location && centerMap(location)}
        >
          <Ionicons name="locate" size={14} color={theme.text} />
          <Text style={[styles.mapQuickPillText, { color: theme.text }]}>My GPS</Text>
        </Pressable>
      </View>

      {/* 2. Error Message Banner */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      )}

      {/* 3. Universal Interactive Safety Map (Zero API Key Required - OpenStreetMap & Leaflet) */}
      <View style={{ marginBottom: 16 }}>
        <UniversalSafetyMap
          latitude={latitude}
          longitude={longitude}
          address={address}
          nearbyPlaces={nearbyPlaces}
          height={380}
          showControls={true}
          onPlaceSelect={(place) => setSelectedPlace(place)}
          isWatching={isWatching}
          onMapTouchStart={() => setIsMapInteracting(true)}
          onMapTouchEnd={() => setIsMapInteracting(false)}
        />
      </View>

      {/* Selected Place Detail Card */}
      {selectedPlace && (
        <View style={[styles.selectedPlaceCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          <View style={styles.selectedPlaceHeader}>
            <View style={[styles.selectedPlaceIconBox, { backgroundColor: getPlaceBgColor(selectedPlace.type) }]}>
              <Ionicons name={getPlaceIcon(selectedPlace.type)} size={22} color={getPlaceColor(selectedPlace.type)} />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.selectedPlaceName, { color: theme.text }]} numberOfLines={1}>
                {selectedPlace.name}
              </Text>
              <Text style={[styles.selectedPlaceCategory, { color: theme.textSecondary }]}>
                {selectedPlace.categoryLabel} • <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{selectedPlace.distanceText}</Text>
              </Text>
            </View>
            <Pressable onPress={() => setSelectedPlace(null)} hitSlop={10}>
              <Ionicons name="close-circle" size={24} color={theme.textLight} />
            </Pressable>
          </View>

          <View style={styles.selectedPlaceAddressRow}>
            <Ionicons name="location-outline" size={15} color={theme.textSecondary} />
            <Text style={[styles.selectedPlaceAddress, { color: theme.textSecondary }]} numberOfLines={2}>
              {selectedPlace.address || 'Address unavailable'}
            </Text>
          </View>

          <View style={styles.selectedPlaceActions}>
            <Pressable
              style={[styles.selectedPlaceActionBtn, { backgroundColor: theme.primary }]}
              onPress={() => handleDirections(selectedPlace)}
            >
              <Ionicons name="navigate" size={15} color="#FFFFFF" />
              <Text style={styles.selectedPlaceActionText}>Directions</Text>
            </Pressable>
            {selectedPlace.phone ? (
              <Pressable
                style={[styles.selectedPlaceActionBtn, { backgroundColor: '#10B981' }]}
                onPress={() => handleCall(selectedPlace.phone)}
              >
                <Ionicons name="call" size={15} color="#FFFFFF" />
                <Text style={styles.selectedPlaceActionText}>Call</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}

      {/* 4. GPS Coordinates & Address Details Card */}
      <View style={[styles.detailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.detailsHeader}>
          <Ionicons name="pin" size={20} color={theme.primary} />
          <Text style={[styles.detailsTitle, { color: theme.text }]}>Current Location Information</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={[styles.detailsLabel, { color: theme.textSecondary }]}>Full Address:</Text>
          <Text style={[styles.detailsValue, { color: theme.text }]}>{loading ? 'Fetching address...' : address}</Text>
        </View>

        <View style={styles.coordsRow}>
          <View style={[styles.coordBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.coordLabel, { color: theme.textSecondary }]}>LATITUDE</Text>
            <Text style={[styles.coordValue, { color: theme.primary }]}>
              {latitude !== null ? latitude.toFixed(5) : '--'}
            </Text>
          </View>

          <View style={[styles.coordBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.coordLabel, { color: theme.textSecondary }]}>LONGITUDE</Text>
            <Text style={[styles.coordValue, { color: theme.primary }]}>
              {longitude !== null ? longitude.toFixed(5) : '--'}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Live Tracking & Share Action Buttons */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.toggleTrackingBtn,
            isWatching ? styles.trackingBtnActive : styles.trackingBtnInactive,
          ]}
          onPress={handleToggleTracking}
        >
          <Ionicons
            name={isWatching ? 'stop-circle' : 'radio'}
            size={20}
            color={colors.white}
          />
          <Text style={styles.btnText}>
            {isWatching ? 'Stop Live Watcher' : 'Start Live Tracking'}
          </Text>
        </Pressable>

        <Pressable style={styles.shareBtn} onPress={handleShareLocation}>
          <Ionicons name="share-social" size={20} color={colors.white} />
          <Text style={styles.btnText}>Share Location</Text>
        </Pressable>
      </View>

      {/* 6. Nearby Safety Places — Real OSM Data */}
      <View style={styles.sectionHeadingRow}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Nearby Safety Places</Text>
        {nearbyLoading && <ActivityIndicator size="small" color={theme.primary} />}
        {!nearbyLoading && location && (
          <Pressable onPress={() => loadNearbyPlaces(location.latitude, location.longitude)}>
            <Ionicons name="refresh" size={18} color={theme.primary} />
          </Pressable>
        )}
      </View>

      {nearbyError ? (
        <View style={[styles.nearbyErrorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="cloud-offline-outline" size={24} color={theme.textLight} />
          <Text style={[styles.nearbyErrorText, { color: theme.textSecondary }]}>{nearbyError}</Text>
          {location && (
            <Pressable
              style={[styles.nearbyRetryBtn, { backgroundColor: theme.primary }]}
              onPress={() => loadNearbyPlaces(location.latitude, location.longitude)}
            >
              <Text style={styles.nearbyRetryBtnText}>Retry</Text>
            </Pressable>
          )}
        </View>
      ) : nearbyPlaces.length === 0 && !nearbyLoading ? (
        <View style={[styles.nearbyErrorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="location-outline" size={24} color={theme.textLight} />
          <Text style={[styles.nearbyErrorText, { color: theme.textSecondary }]}>
            {location ? 'No safety places found within 3 km.' : 'Waiting for GPS location…'}
          </Text>
        </View>
      ) : (
        <View style={styles.safePlacesList}>
          {nearbyPlaces.map((place) => (
            <Pressable
              key={place.id}
              style={[
                styles.placeCard,
                {
                  backgroundColor: theme.card,
                  borderColor: selectedPlace?.id === place.id ? theme.primary : theme.border,
                },
              ]}
              onPress={() => {
                setSelectedPlace(place);
                centerMap({ latitude: place.latitude, longitude: place.longitude });
              }}
            >
              <View style={[styles.placeIconCircle, { backgroundColor: getPlaceBgColor(place.type) }]}>
                <Ionicons name={getPlaceIcon(place.type)} size={22} color={getPlaceColor(place.type)} />
              </View>

              <View style={styles.placeTextContainer}>
                <Text style={[styles.placeTitle, { color: theme.text }]} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={[styles.placeSub, { color: theme.textSecondary }]}>
                  {place.categoryLabel} • {place.distanceText}
                </Text>
              </View>

              <View style={styles.placeActions}>
                <Pressable
                  style={[styles.placeActionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => handleDirections(place)}
                >
                  <Ionicons name="navigate" size={13} color={colors.white} />
                </Pressable>
                {place.phone && (
                  <Pressable
                    style={[styles.placeActionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleCall(place.phone)}
                  >
                    <Ionicons name="call" size={13} color={colors.white} />
                  </Pressable>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingGeminiBtn: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9333EA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    gap: 8,
    zIndex: 99,
  },
  floatingGeminiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingGeminiText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
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
    height: 48,
    marginBottom: 12,
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
    marginRight: 6,
  },
  searchButton: {
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorBannerText: {
    color: colors.white,
    fontSize: 12,
    flex: 1,
  },
  mapCard: {
    height: 250,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#E0F2FE',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapFallbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  mapFallbackSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  coordsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coordsTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  mapFloatControls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  floatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  trackingIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trackingStatusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailsRow: {
    marginBottom: 10,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  coordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  toggleTrackingBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trackingBtnActive: {
    backgroundColor: colors.danger,
  },
  trackingBtnInactive: {
    backgroundColor: colors.primary,
  },
  shareBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  nearbyErrorCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nearbyErrorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  nearbyRetryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 4,
  },
  nearbyRetryBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  safePlacesList: {
    gap: 10,
    marginBottom: 16,
  },
  placeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  placeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  placeTextContainer: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  placeActions: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  placeActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPlaceCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 8,
  },
  selectedPlaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedPlaceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPlaceName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectedPlaceCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedPlaceAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  selectedPlaceAddress: {
    fontSize: 12,
    flex: 1,
  },
  selectedPlaceActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  selectedPlaceActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
    gap: 6,
  },
  selectedPlaceActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  mapQuickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mapQuickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  mapQuickPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  layerSelectorBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  layerBtnText: {
    fontSize: 10,
  },
  externalMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 14,
    gap: 6,
  },
  externalMapBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

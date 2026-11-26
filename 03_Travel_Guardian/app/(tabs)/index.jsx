// Travel Guardian - Modern Travel Safety Dashboard
// Features: Profile photo, SOS banner, Live Safety Map, Travel Status (Vehicle & Trip), Quick Actions, Nearby Safety Places, Travel Documents, Reminders

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { getTrips } from '../../services/tripService';
import { scheduleReminder, getReminders, deleteReminder } from '../../services/reminderService';
import { getDocuments, getCachedDocuments } from '../../services/documentService';
import { fetchNearbyPlaces, getPlaceIcon, getPlaceColor, getPlaceBgColor } from '../../services/nearbyPlacesService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useUser, getInitials, DEFAULT_AVATAR } from '../../context/UserContext';
import { useLocation } from '../../hooks/useLocation';
import { getVehicleDisplay } from '../../constants/vehicles';
import SafeWalkModal from '../../components/SafeWalkModal';
import TravelTranslatorModal from '../../components/TravelTranslatorModal';
import UniversalSafetyMap from '../../components/UniversalSafetyMap';
import FamousPlacesSection from '../../components/FamousPlacesSection';
import SideNavBarDrawer from '../../components/SideNavBarDrawer';
import OfflineSosModal from '../../components/OfflineSosModal';
import WeatherAdvisoryModal from '../../components/WeatherAdvisoryModal';
import HelplinesDirectoryModal from '../../components/HelplinesDirectoryModal';
import GeofenceAlertModal from '../../components/GeofenceAlertModal';
import ShakeToSosModal from '../../components/ShakeToSosModal';
import EmergencyMedicalCardModal from '../../components/EmergencyMedicalCardModal';
import TouristScamAlertModal from '../../components/TouristScamAlertModal';
import LowBatteryPingModal from '../../components/LowBatteryPingModal';
import AppGuideBookModal from '../../components/AppGuideBookModal';

// Safely load MapView for native platforms
let MapView, Marker, UrlTile;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
    UrlTile = Maps.UrlTile;
  } catch {}
}

export default function HomeDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const { userName, avatarUri, refreshUserFromStorage } = useUser();
  const mapRef = useRef(null);

  // ─── Side Nav & Map State ──────────────────────────────────────────────────
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  // ─── Travel & Safety Suite Modals ────────────────────────────────────────
  const [offlineSosVisible, setOfflineSosVisible] = useState(false);
  const [weatherModalVisible, setWeatherModalVisible] = useState(false);
  const [helplinesModalVisible, setHelplinesModalVisible] = useState(false);
  const [geofenceModalVisible, setGeofenceModalVisible] = useState(false);
  const [shakeSosVisible, setShakeSosVisible] = useState(false);
  const [medicalCardVisible, setMedicalCardVisible] = useState(false);
  const [scamAlertVisible, setScamAlertVisible] = useState(false);
  const [lowBatteryVisible, setLowBatteryVisible] = useState(false);
  const [guideBookVisible, setGuideBookVisible] = useState(false);

  // Automatically reset avatar error when avatarUri changes
  useEffect(() => {
    setAvatarError(false);
  }, [avatarUri]);

  // Synchronize user profile immediately on tab focus
  useFocusEffect(
    useCallback(() => {
      if (refreshUserFromStorage) refreshUserFromStorage();
    }, [refreshUserFromStorage])
  );

  // ─── Location (uses existing hook) ─────────────────────────────────────────
  const {
    location,
    address,
    errorMsg: locationError,
    loading: locationLoading,
    isWatching,
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
  } = useLocation();

  // ─── Nearby Places State ───────────────────────────────────────────────────
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const lastNearbyFetchRef = useRef(null);

  // ─── Trip State ────────────────────────────────────────────────────────────
  const [activeTrip, setActiveTrip] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripError, setTripError] = useState(null);

  // ─── Reminder State ────────────────────────────────────────────────────────
  const [reminders, setReminders] = useState([]);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [savingReminder, setSavingReminder] = useState(false);

  // ─── Guardian SafeWalk & Stealth Shield State ──────────────────────────────
  const [safeWalkModalVisible, setSafeWalkModalVisible] = useState(false);
  const [translatorModalVisible, setTranslatorModalVisible] = useState(false);
  const [translatorInitialLang, setTranslatorInitialLang] = useState('gu');

  // ─── Recent Documents State ───────────────────────────────────────────────
  const [recentDocs, setRecentDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState(null);
  const [hasLoadedDocs, setHasLoadedDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // ─── Refresh State ─────────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // ─── Smart Travel Safety Checklist State ──────────────────────────────────
  const [checklist, setChecklist] = useState([
    { id: '1', title: 'Offline ID & Passport backed up in Vault', done: true },
    { id: '2', title: 'Emergency SOS Contacts configured', done: true },
    { id: '3', title: 'Verify nearby hospital & police location', done: false },
    { id: '4', title: 'Continuous GPS tracking active', done: false },
    { id: '5', title: 'Armed Guardian SafeWalk for night journey', done: false },
  ]);

  // Load checklist from persistent storage
  useEffect(() => {
    const loadChecklist = async () => {
      try {
        const saved = await AsyncStorage.getItem('@tg_safety_checklist');
        if (saved) {
          setChecklist(JSON.parse(saved));
        }
      } catch {}
    };
    loadChecklist();
  }, []);

  const toggleChecklistItem = async (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    try {
      await AsyncStorage.setItem('@tg_safety_checklist', JSON.stringify(updated));
    } catch {}
  };

  const completedChecklistCount = checklist.filter((item) => item.done).length;

  // Safety Readiness Score calculator (0-100)
  // NOTE: This reflects YOUR preparation readiness (GPS, checklist, nearby havens)
  //       — NOT a real-time crime or area danger index.
  const calculateSafetyScore = () => {
    let score = 65;
    if (location && location.latitude) score += 14;
    if (isWatching) score += 8;
    if (nearbyPlaces.length > 0) score += 7;
    score += Math.round((completedChecklistCount / checklist.length) * 5);
    return Math.min(score, 98);
  };

  // Initial load on mount
  useEffect(() => {
    loadTrips();
    loadReminders();
    loadRecentDocs();
  }, []);

  // Fetch nearby places when location is established
  useEffect(() => {
    if (!location) return;

    const last = lastNearbyFetchRef.current;
    if (last) {
      const dLat = Math.abs(location.latitude - last.latitude);
      const dLon = Math.abs(location.longitude - last.longitude);
      if (dLat < 0.001 && dLon < 0.001) return; // Moved < 100m
    }

    lastNearbyFetchRef.current = { latitude: location.latitude, longitude: location.longitude };
    loadNearbyPlaces(location.latitude, location.longitude);
  }, [location]);

  // ─── Loaders ───────────────────────────────────────────────────────────────

  const loadTrips = async () => {
    try {
      setLoadingTrips(true);
      setTripError(null);
      const res = await getTrips();
      const list = res?.data || [];
      if (list.length > 0) {
        const active = list.find((t) => t.status === 'Active') || list[0];
        setActiveTrip({
          id: active._id || active.id,
          title: active.title,
          destination: active.destination,
          dates: `${active.startDate}${active.endDate ? ' - ' + active.endDate : ''}`,
          status: active.status || 'Upcoming',
          vehicleType: active.vehicleType || 'Car',
        });
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.log('[Home] Trips error:', err.message);
      setTripError('Unable to load travel status.');
      setActiveTrip(null);
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadReminders = async () => {
    try {
      const saved = await getReminders();
      setReminders(saved || []);
    } catch {}
  };

  const loadRecentDocs = async () => {
    try {
      setDocsError(null);
      const cached = await getCachedDocuments();
      if (cached && cached.length > 0) {
        const sorted = [...cached].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        setRecentDocs(sorted.slice(0, 3));
        setHasLoadedDocs(true);
        setLoadingDocs(false);
      }
      const res = await getDocuments();
      if (res?.data && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        setRecentDocs(sorted.slice(0, 3));
        setHasLoadedDocs(true);
      }
    } catch (err) {
      console.log('[Home] Documents load error:', err.message);
      if (!hasLoadedDocs) {
        setDocsError('Unable to load documents.');
      }
    } finally {
      setLoadingDocs(false);
      setHasLoadedDocs(true);
    }
  };

  const loadNearbyPlaces = async (lat, lon) => {
    if (!lat || !lon) return;
    try {
      setNearbyLoading(true);
      setNearbyError(null);
      const places = await fetchNearbyPlaces(lat, lon);
      setNearbyPlaces(places);
    } catch (err) {
      console.log('[Home] Nearby places error:', err.message);
      setNearbyError('Unable to load nearby safety places.');
    } finally {
      setNearbyLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadTrips(),
      loadReminders(),
      loadRecentDocs(),
      getCurrentLocation(),
    ]).finally(() => setRefreshing(false));
  }, [getCurrentLocation]);

  // ─── Location Actions ──────────────────────────────────────────────────────

  const handleShareLocation = async () => {
    if (!location) {
      Alert.alert('Location Unavailable', 'GPS location is not ready yet. Please wait a moment and try again.');
      return;
    }
    const { latitude, longitude } = location;
    const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = `📍 My current location:\n${address}\n\n${mapsUrl}`;
    try {
      await Share.share({ message, title: 'My Location — Travel Guardian' });
    } catch (err) {
      Alert.alert('Share Failed', err.message || 'Could not open share sheet.');
    }
  };

  const handleToggleTracking = () => {
    if (isWatching) {
      stopLocationTracking();
    } else {
      startLocationTracking();
    }
  };

  const handleDirections = (place) => {
    if (!location) {
      Alert.alert('Location Unavailable', 'Current GPS location not available.');
      return;
    }
    const { latitude: userLat, longitude: userLon } = location;
    const { latitude: destLat, longitude: destLon, name } = place;

    const url = Platform.select({
      ios: `maps:?saddr=${userLat},${userLon}&daddr=${destLat},${destLon}`,
      android: `google.navigation:q=${destLat},${destLon}`,
    });
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${destLat},${destLon}`;

    Linking.canOpenURL(url)
      .then((supported) => (supported ? Linking.openURL(url) : Linking.openURL(fallbackUrl)))
      .catch(() => Linking.openURL(fallbackUrl).catch(() => Alert.alert('Error', `Cannot open maps for ${name}.`)));
  };

  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Cannot make phone call on this device.');
    });
  };

  // ─── Reminder Handlers ─────────────────────────────────────────────────────

  const handleAddReminder = async () => {
    if (!reminderTitle.trim()) {
      Alert.alert('Required', 'Please enter a reminder title.');
      return;
    }
    if (!reminderDate.trim()) {
      Alert.alert('Required', 'Please enter a date (YYYY-MM-DD).');
      return;
    }
    if (!reminderTime.trim()) {
      Alert.alert('Required', 'Please enter a time (HH:MM).');
      return;
    }

    try {
      setSavingReminder(true);
      const [y, m, d] = reminderDate.split('-').map(Number);
      const [hr, min] = reminderTime.split(':').map(Number);
      const triggerDate = new Date(y, m - 1, d, hr, min, 0);

      if (isNaN(triggerDate.getTime()) || triggerDate <= new Date()) {
        Alert.alert('Invalid Time', 'Please enter a valid date/time in the future.');
        setSavingReminder(false);
        return;
      }

      await scheduleReminder(reminderTitle.trim(), triggerDate);
      await loadReminders();
      setReminderModalVisible(false);
      setReminderTitle('');
      setReminderDate('');
      setReminderTime('');
      Alert.alert('Reminder Set ⏰', `"${reminderTitle}" scheduled successfully.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not schedule reminder.');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleDeleteReminder = (item) => {
    Alert.alert('Delete Reminder', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReminder(item.id);
          await loadReminders();
        },
      },
    ]);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getTimeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const coordStr = location
    ? `${Math.abs(location.latitude).toFixed(5)}° ${location.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(location.longitude).toFixed(5)}° ${location.longitude >= 0 ? 'E' : 'W'}`
    : 'Acquiring GPS…';

  const getDocIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('passport')) return 'book-outline';
    if (t.includes('id') || t.includes('driving') || t.includes('license') || t.includes('aadhaar')) return 'card-outline';
    if (t.includes('visa')) return 'globe-outline';
    if (t.includes('insurance')) return 'shield-checkmark-outline';
    if (t.includes('ticket') || t.includes('flight') || t.includes('boarding')) return 'airplane-outline';
    if (t.includes('hotel') || t.includes('booking')) return 'bed-outline';
    return 'document-text-outline';
  };

  const getDocImageUrl = (doc) => {
    if (!doc) return null;
    if (doc.fileUrl && doc.fileUrl.startsWith('http')) return doc.fileUrl;
    if (doc.fileUrl) return API_BASE_URL.replace('/api', '') + doc.fileUrl;
    return doc.imageUri || null;
  };

  const activeVehicle = activeTrip ? getVehicleDisplay(activeTrip.vehicleType) : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isMapInteracting}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      >
      {/* ── 1. Header ───────────────────────────────────────── */}
      <View style={[styles.welcomeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Pressable
          onPress={() => setIsSideNavOpen(true)}
          style={[styles.menuButton, { backgroundColor: theme.primaryLight }]}
          accessibilityLabel="Open Navigation Menu"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="menu" size={24} color={theme.primary} />
        </Pressable>

        <View style={styles.welcomeTextContainer}>
          <View style={[styles.brandBadge, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="shield-checkmark" size={13} color={theme.primary} />
            <Text style={[styles.brandBadgeText, { color: theme.primary }]}>Travel Guardian</Text>
          </View>
          <Text style={[styles.greetingText, { color: theme.text }]}>
            {getTimeOfDay()}, {userName} 👋
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            Your personal travel safety companion
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.avatarWrapper}
          accessibilityLabel="Open Profile"
        >
          {avatarUri && !avatarError ? (
            <Image
              source={{ uri: avatarUri }}
              style={[styles.avatarImage, { borderColor: theme.primary }]}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={[styles.avatarInitialsBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarInitialsText}>{getInitials ? getInitials(userName) : 'TG'}</Text>
            </View>
          )}
          <View style={styles.avatarOnlineDot} />
        </Pressable>
      </View>

      {/* ── 2. Emergency SOS Banner ───────────────────────── */}
      <Pressable
        style={({ pressed }) => [styles.sosButton, pressed && styles.sosButtonPressed]}
        onPress={() => router.push('/sos')}
      >
        <View style={styles.sosIconContainer}>
          <Ionicons name="warning" size={28} color={colors.white} />
        </View>
        <View style={styles.sosTextWrapper}>
          <Text style={styles.sosMainText}>EMERGENCY SOS</Text>
          <Text style={styles.sosSubText}>Instant siren, live GPS beacon & responder alert</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.white} />
      </Pressable>

      {/* ── 2A. SafeWalk & Safety Readiness ──────────────────── */}
      <Pressable
        style={({ pressed }) => [
          styles.safeWalkBanner,
          { backgroundColor: theme.card, borderColor: colors.primary + '50' },
          pressed && styles.safeWalkBannerPressed,
        ]}
        onPress={() => setSafeWalkModalVisible(true)}
      >
        <View style={[styles.safeWalkIconContainer, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="shield-checkmark" size={26} color={colors.primary} />
        </View>
        <View style={styles.safeWalkTextWrapper}>
          <View style={styles.safeWalkTitleRow}>
            <Text style={[styles.safeWalkMainText, { color: theme.text }]}>Guardian SafeWalk</Text>
            <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.proBadgeText}>PRO SHIELD</Text>
            </View>
          </View>
          <Text style={[styles.safeWalkSubText, { color: theme.textSecondary }]}>
            Journey timer, fake escape call, tactical strobe & responder beacon
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </Pressable>

      {/* ── 2B. Location & Safety Radar ────────────────────── */}
      <View>
        <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="navigate" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Location & Safety Map</Text>
              {isWatching && (
                <View style={styles.liveTrackingBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTrackingText}>LIVE</Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Prominent Full Interactive Map Launcher Banner */}
            <Pressable
              style={({ pressed }) => [
                styles.openFullMapBannerBtn,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => router.push('/(tabs)/map')}
            >
              <View style={styles.openFullMapIconCircle}>
                <Ionicons name="map" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.openFullMapTitle}>Open Full Interactive Safety Map</Text>
                <Text style={styles.openFullMapSubtitle}>
                  Zero-key OSM radar, satellite view & emergency safe zones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </Pressable>

            <View style={[styles.locationInfoBox, { borderTopColor: theme.border }]}>
              <View style={styles.locationTopRow}>
                <View style={styles.locationAddressBlock}>
                  <View style={styles.locationStatusRow}>
                    <View style={[styles.locationDot, { backgroundColor: isWatching ? '#10B981' : theme.primary }]} />
                    <Text style={[styles.locationStatusLabel, { color: isWatching ? '#10B981' : theme.textSecondary }]}>
                      {isWatching ? 'Continuous Live Tracking Active' : 'Current GPS Position'}
                    </Text>
                  </View>
                  <Text style={[styles.locationAddress, { color: theme.text }]} numberOfLines={2}>
                    {locationLoading ? 'Locating address…' : address || 'Address unavailable'}
                  </Text>
                  <Text style={[styles.locationCoords, { color: theme.textSecondary }]}>
                    {coordStr}
                  </Text>
                </View>
                <Pressable
                  style={[styles.refreshGpsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Ionicons name="refresh" size={18} color={theme.primary} />
                  )}
                </Pressable>
              </View>

              <View style={styles.locationControlsRow}>
                <Pressable
                  style={[
                    styles.locationControlBtn,
                    isWatching
                      ? { backgroundColor: theme.dangerLight, borderColor: theme.danger }
                      : { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                  ]}
                  onPress={handleToggleTracking}
                >
                  <Ionicons
                    name={isWatching ? 'stop-circle' : 'radio'}
                    size={16}
                    color={isWatching ? theme.danger : theme.primary}
                  />
                  <Text style={[styles.locationControlText, { color: isWatching ? theme.danger : theme.primary }]}>
                    {isWatching ? 'Stop Tracking' : 'Live Tracking'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.locationControlBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={handleShareLocation}
                >
                  <Ionicons name="share-social-outline" size={16} color={theme.text} />
                  <Text style={[styles.locationControlText, { color: theme.text }]}>Share</Text>
                </Pressable>

                <Pressable
                  style={[styles.locationControlBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  onPress={() => router.push('/(tabs)/map')}
                >
                  <Ionicons name="map" size={16} color="#FFFFFF" />
                  <Text style={[styles.locationControlText, { color: '#FFFFFF' }]}>Full Map</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Nearby Safety Places */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="medical" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Safe Havens</Text>
              {nearbyLoading && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 4 }} />}
            </View>
            <Pressable onPress={() => router.push('/(tabs)/map')}>
              <Text style={[styles.sectionActionText, { color: theme.primary }]}>View Safety Map →</Text>
            </Pressable>
          </View>

          {nearbyLoading && nearbyPlaces.length === 0 ? (
            <View style={[styles.nearbyStatusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.nearbyStatusText, { color: theme.textSecondary }]}>
                Finding nearest verified hospitals and safe zones…
              </Text>
            </View>
          ) : nearbyError && nearbyPlaces.length === 0 ? (
            <View style={[styles.nearbyStatusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="cloud-offline-outline" size={24} color={theme.textLight} />
              <Text style={[styles.nearbyStatusText, { color: theme.textSecondary }]}>{nearbyError}</Text>
              <Pressable
                style={[styles.miniRetryBtn, { backgroundColor: theme.primary }]}
                onPress={() => location ? loadNearbyPlaces(location.latitude, location.longitude) : getCurrentLocation()}
              >
                <Text style={styles.miniRetryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : nearbyPlaces.length === 0 ? (
            <View style={[styles.nearbyStatusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="location-outline" size={24} color={theme.textLight} />
              <Text style={[styles.nearbyStatusText, { color: theme.textSecondary }]}>
                No nearby safety places found.
              </Text>
            </View>
          ) : (
            <View style={styles.nearbyCompactList}>
              {nearbyPlaces.slice(0, 3).map((place) => (
                <View
                  key={place.id}
                  style={[styles.nearbyPlaceRowCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={[styles.placeCategoryIconBox, { backgroundColor: getPlaceBgColor(place.type) }]}>
                    <Ionicons name={getPlaceIcon(place.type)} size={20} color={getPlaceColor(place.type)} />
                  </View>
                  <View style={styles.placeRowInfo}>
                    <Text style={[styles.placeRowName, { color: theme.text }]} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={[styles.placeRowCategory, { color: theme.textSecondary }]}>
                      {place.categoryLabel} • <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{place.distanceText}</Text>
                    </Text>
                  </View>
                  <View style={styles.placeRowActions}>
                    <Pressable
                      style={[styles.placeDirectionsBtn, { backgroundColor: theme.primary }]}
                      onPress={() => handleDirections(place)}
                    >
                      <Ionicons name="navigate" size={13} color="#FFFFFF" />
                      <Text style={styles.placeBtnText}>Directions</Text>
                    </Pressable>
                    {place.phone ? (
                      <Pressable
                        style={[styles.placeCallBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleCall(place.phone)}
                      >
                        <Ionicons name="call" size={13} color="#FFFFFF" />
                        <Text style={styles.placeBtnText}>Call</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── 2C. Safety Score & Checklist ───────────────────── */}
        <View style={{ marginTop: 12 }}>

          <View style={[styles.safetyScoreCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.scoreTopRow}>
              <View style={styles.scoreTitleBlock}>
                <View style={styles.scoreHeaderTag}>
                  <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                  <Text style={styles.scoreTagText}>YOUR SAFETY READINESS</Text>
                </View>
                <Text style={[styles.scoreMainTitle, { color: theme.text }]}>Safety Readiness Score</Text>
                <Text style={[styles.scoreSubtitle, { color: theme.textSecondary }]}>
                  {location ? `Based on your GPS, checklist & nearby havens` : 'Enable GPS to improve your score'}
                </Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{calculateSafetyScore()}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>

            <View style={[styles.scoreProgressBarBg, { backgroundColor: theme.surface }]}>
              <View
                style={[
                  styles.scoreProgressBarFill,
                  {
                    width: `${calculateSafetyScore()}%`,
                    backgroundColor: calculateSafetyScore() >= 80 ? '#10B981' : calculateSafetyScore() >= 60 ? '#F59E0B' : '#EF4444',
                  },
                ]}
              />
            </View>

            <View style={styles.scoreBadgesRow}>
              <View style={[styles.scoreMetricBadge, { backgroundColor: '#10B98118' }]}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={[styles.scoreMetricText, { color: '#10B981' }]}>Safe Haven Zone</Text>
              </View>
              <View style={[styles.scoreMetricBadge, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="navigate-circle" size={12} color={theme.primary} />
                <Text style={[styles.scoreMetricText, { color: theme.primary }]}>
                  {isWatching ? 'Live GPS Active' : 'GPS Armed'}
                </Text>
              </View>
              <View style={[styles.scoreMetricBadge, { backgroundColor: '#F59E0B18' }]}>
                <Ionicons name="medical" size={12} color="#D97706" />
                <Text style={[styles.scoreMetricText, { color: '#D97706' }]}>
                  {nearbyPlaces.length > 0 ? `${nearbyPlaces.length} Havens Near` : 'Havens Ready'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="shield-half" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Safety Checklist</Text>
            </View>
            <View style={[styles.checklistBadge, { backgroundColor: completedChecklistCount === checklist.length ? '#10B98120' : theme.primaryLight }]}>
              <Text style={[styles.checklistBadgeText, { color: completedChecklistCount === checklist.length ? '#10B981' : theme.primary }]}>
                {completedChecklistCount}/{checklist.length} Verified
              </Text>
            </View>
          </View>

          <View style={[styles.checklistCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.checklistDescription, { color: theme.textSecondary }]}>
              Recommended safety precautions for your journey:
            </Text>
            {checklist.map((item) => (
              <Pressable
                key={item.id}
                style={[
                  styles.checklistItemRow,
                  { borderBottomColor: theme.border },
                  item.done && { opacity: 0.9 },
                ]}
                onPress={() => toggleChecklistItem(item.id)}
              >
                <Ionicons
                  name={item.done ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={item.done ? '#10B981' : theme.textLight}
                />
                <Text
                  style={[
                    styles.checklistItemText,
                    { color: item.done ? theme.textSecondary : theme.text },
                    item.done && styles.checklistItemDone,
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── 2D. Travel Status & Active Trip ─────────────────── */}
        <View style={{ marginTop: 12 }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="airplane" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Status</Text>
            </View>
          </View>

          {loadingTrips ? (
            <View style={[styles.statusLoadingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.statusLoadingText, { color: theme.textSecondary }]}>Loading travel status…</Text>
            </View>
          ) : tripError ? (
            <View style={[styles.statusErrorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="cloud-offline-outline" size={28} color={theme.textLight} />
              <Text style={[styles.statusErrorText, { color: theme.textSecondary }]}>{tripError}</Text>
              <Pressable style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadTrips}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : activeTrip ? (
            <View style={[styles.tripCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.tripCardHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.tripStatusTag, { color: theme.primary }]}>✈️ ACTIVE TRIP</Text>
                  <Text style={[styles.tripTitle, { color: theme.text }]}>{activeTrip.title}</Text>
                </View>
                <View style={[styles.tripBadge, { backgroundColor: theme.secondaryLight }]}>
                  <Text style={[styles.tripBadgeText, { color: theme.secondary }]}>{activeTrip.status}</Text>
                </View>
              </View>

              <View style={styles.tripDetailRow}>
                <Ionicons name="location-outline" size={15} color={theme.textSecondary} />
                <Text style={[styles.tripDetailText, { color: theme.textSecondary }]}>{activeTrip.destination}</Text>
              </View>

              {activeTrip.dates && (
                <View style={styles.tripDetailRow}>
                  <Ionicons name="calendar-outline" size={15} color={theme.textSecondary} />
                  <Text style={[styles.tripDetailText, { color: theme.textSecondary }]}>Departure: {activeTrip.dates}</Text>
                </View>
              )}

              {activeVehicle && (
                <View style={styles.tripDetailRow}>
                  <Text style={{ fontSize: 14 }}>{activeVehicle.icon}</Text>
                  <Text style={[styles.tripDetailText, { color: theme.text, fontWeight: '600' }]}>
                    Vehicle: {activeVehicle.label}
                  </Text>
                </View>
              )}

              <View style={styles.tripDetailRow}>
                <View style={[styles.safetyTrackingDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.tripDetailText, { color: '#10B981', fontWeight: '600' }]}>
                  Safety Tracking: Active
                </Text>
              </View>

              <Pressable
                style={[styles.viewTripButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => router.push(`/trips/${activeTrip.id}`)}
              >
                <Text style={[styles.viewTripButtonText, { color: theme.primary }]}>View Trip Details</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.primary} />
              </Pressable>
            </View>
          ) : (
            <View style={[styles.emptyTripCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>✈️</Text>
              <Text style={[styles.emptyTripTitle, { color: theme.text }]}>No Active Trip</Text>
              <Text style={[styles.emptyTripText, { color: theme.textSecondary }]}>
                Plan your next journey with Travel Guardian. Select your destination and travel vehicle.
              </Text>
              <Pressable
                style={[styles.planTripBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/trips/create')}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.planTripBtnText}>Plan Trip</Text>
              </Pressable>
            </View>
          )}

          {/* Travel Documents Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="document-lock-outline" size={19} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Documents Vault</Text>
              {loadingDocs && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 4 }} />}
            </View>
            <Pressable onPress={() => router.push('/documents')}>
              <Text style={[styles.sectionActionText, { color: theme.primary }]}>View All →</Text>
            </Pressable>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Biometric protected • Passport, ID, visa and tickets organized offline
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.docCategoriesRow}
          >
            {[
              { label: 'Passport', icon: 'book' },
              { label: 'ID Card', icon: 'card' },
              { label: 'Visa', icon: 'globe' },
              { label: 'Insurance', icon: 'shield-checkmark' },
              { label: 'Tickets', icon: 'airplane' },
            ].map((cat) => (
              <Pressable
                key={cat.label}
                style={[styles.docCategoryChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push('/documents')}
              >
                <Ionicons name={cat.icon} size={14} color={theme.primary} />
                <Text style={[styles.docCategoryChipText, { color: theme.text }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.docsListContainer}>
            {loadingDocs && !hasLoadedDocs ? (
              <View style={[styles.docSkeletonCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.docSkeletonText, { color: theme.textSecondary }]}>Loading documents…</Text>
              </View>
            ) : docsError && recentDocs.length === 0 ? (
              <View style={[styles.docEmptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="cloud-offline-outline" size={28} color={theme.textLight} />
                <Text style={[styles.docEmptyTitle, { color: theme.text }]}>Unable to load documents</Text>
                <Text style={[styles.docEmptySub, { color: theme.textSecondary }]}>
                  Check your connection and try again.
                </Text>
                <Pressable
                  style={[styles.addDocBtnPrimary, { backgroundColor: theme.primary }]}
                  onPress={() => { setDocsError(null); setLoadingDocs(true); loadRecentDocs(); }}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.addDocBtnPrimaryText}>Retry</Text>
                </Pressable>
              </View>
            ) : recentDocs.length === 0 ? (
              <View style={[styles.docEmptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.docEmptyIconBox, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="document-text-outline" size={28} color={theme.primary} />
                </View>
                <Text style={[styles.docEmptyTitle, { color: theme.text }]}>No travel documents yet</Text>
                <Text style={[styles.docEmptySub, { color: theme.textSecondary }]}>
                  Scan or add your passport, ID, or tickets for instant offline access.
                </Text>
                <Pressable
                  style={[styles.addDocBtnPrimary, { backgroundColor: theme.primary }]}
                  onPress={() => router.push('/documents/scanner')}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addDocBtnPrimaryText}>Add First Document</Text>
                </Pressable>
              </View>
            ) : (
              recentDocs.map((doc) => (
                <Pressable
                  key={doc._id || doc.id || doc.title}
                  style={[styles.homeDocCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setPreviewDoc(doc)}
                >
                  <View style={[styles.homeDocIconBox, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name={getDocIcon(doc.documentType)} size={22} color={theme.primary} />
                  </View>
                  <View style={styles.homeDocInfo}>
                    <View style={styles.homeDocTitleRow}>
                      <Text style={[styles.homeDocTitle, { color: theme.text }]} numberOfLines={1}>
                        {doc.title}
                      </Text>
                      {doc.isFavorite && <Ionicons name="star" size={14} color="#EAB308" />}
                    </View>
                    <Text style={[styles.homeDocMeta, { color: theme.textSecondary }]}>
                      {doc.documentType || 'Travel Document'} • {doc.expiryDate ? `Exp: ${doc.expiryDate}` : 'No Expiry'}
                    </Text>
                  </View>
                  <View style={[styles.homeDocSavedBadge, { backgroundColor: theme.secondaryLight }]}>
                    <Ionicons name="checkmark-circle" size={12} color={theme.secondary} />
                    <Text style={[styles.homeDocSavedText, { color: theme.secondary }]}>Saved</Text>
                  </View>
                </Pressable>
              ))
            )}

            <View style={styles.docActionsRow}>
              <Pressable
                style={[styles.docActionBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]}
                onPress={() => router.push('/documents/scanner')}
              >
                <Ionicons name="add-circle-outline" size={16} color={theme.primary} />
                <Text style={[styles.docActionBtnText, { color: theme.primary }]}>+ Add Document</Text>
              </Pressable>
              <Pressable
                style={[styles.docActionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => router.push('/documents')}
              >
                <Ionicons name="folder-open-outline" size={16} color="#FFFFFF" />
                <Text style={[styles.docActionBtnText, { color: '#FFFFFF' }]}>View All</Text>
              </Pressable>
            </View>
          </View>

          {/* Travel Reminders */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="alarm-outline" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Reminders</Text>
            </View>
            <Pressable
              style={[styles.addReminderBtn, { backgroundColor: theme.primary }]}
              onPress={() => setReminderModalVisible(true)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addReminderText}>Add</Text>
            </Pressable>
          </View>

          <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {reminders.length === 0 ? (
              <View style={styles.reminderEmptyBox}>
                <Ionicons name="alarm-outline" size={30} color={theme.textLight} />
                <Text style={[styles.reminderEmptyText, { color: theme.textSecondary }]}>
                  No reminders set. Add one for medicine, check-in, or departure.
                </Text>
              </View>
            ) : (
              reminders.map((r) => (
                <View key={r.id} style={[styles.reminderItem, { borderBottomColor: theme.border }]}>
                  <View style={[styles.reminderIconBox, { backgroundColor: theme.primaryLight }]}>
                    <Ionicons name="alarm" size={18} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reminderTitle, { color: theme.text }]} numberOfLines={1}>
                      {r.title}
                    </Text>
                    <Text style={[styles.reminderTime, { color: theme.textSecondary }]}>
                      {r.displayDate} at {r.displayTime}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDeleteReminder(r)} style={styles.reminderDeleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ── Quick Safety Actions (6-Grid) ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="grid-outline" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Safety Tools</Text>
        </View>
      </View>

      <View style={styles.buttonGrid}>
        {[
          {
            label: 'SafeWalk',
            desc: 'PRO Shield & Timer',
            icon: 'shield-checkmark',
            color: '#EEF2FF',
            iconColor: colors.primary,
            action: () => setSafeWalkModalVisible(true),
          },
          {
            label: 'Translator',
            desc: 'Voice & Indian Langs',
            icon: 'language',
            color: '#FDF2F8',
            iconColor: '#DB2777',
            action: () => setTranslatorModalVisible(true),
          },
          {
            label: 'Safe Map',
            desc: 'Safe Havens & GPS',
            icon: 'map',
            color: '#FEF3C7',
            iconColor: '#D97706',
            action: () => router.push('/(tabs)/map'),
          },
          {
            label: 'Camera',
            desc: 'Incident Evidence',
            icon: 'camera',
            color: '#E0F2FE',
            iconColor: '#0284C7',
            action: () => router.push('/(tabs)/camera'),
          },
          {
            label: 'Documents',
            desc: 'Offline Vault',
            icon: 'document-lock',
            color: '#F3E8FF',
            iconColor: '#9333EA',
            action: () => router.push('/documents'),
          },
          {
            label: 'Contacts',
            desc: 'SOS Network',
            icon: 'people',
            color: '#DCFCE7',
            iconColor: '#16A34A',
            action: () => router.push('/(tabs)/contacts'),
          },
        ].map((btn) => (
          <Pressable
            key={btn.label}
            style={({ pressed }) => [
              styles.gridButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.gridButtonPressed,
            ]}
            onPress={btn.action}
          >
            <View style={[styles.iconCircle, { backgroundColor: btn.color }]}>
              <Ionicons name={btn.icon} size={22} color={btn.iconColor} />
            </View>
            <Text style={[styles.gridButtonTitle, { color: theme.text }]}>{btn.label}</Text>
            <Text style={[styles.gridButtonDesc, { color: theme.textSecondary }]}>{btn.desc}</Text>
          </Pressable>
        ))}
      </View>


      {/* ── Smart Travel Tools Section ──────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="briefcase-outline" size={18} color="#D97706" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Smart Travel Tools</Text>
        </View>
        <View style={[styles.sectionBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.sectionBadgeText, { color: '#D97706' }]}>7 Tools</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScrollContainer}>
        {[
          { label: 'Weather Advisory', emoji: '☀️', color: '#0284C7', bg: '#E0F2FE', badge: 'LIVE', action: () => setWeatherModalVisible(true) },
          { label: 'Scam Radar', emoji: '🛡️', color: '#D97706', bg: '#FEF3C7', badge: 'INDIA', action: () => setScamAlertVisible(true) },
          { label: 'Trip Planner', emoji: '✈️', color: '#7C3AED', bg: '#EDE9FE', badge: '10 Modes', action: () => router.push('/trips') },
          { label: 'Helplines Directory', emoji: '📞', color: '#15803D', bg: '#DCFCE7', badge: '10+ NOS', action: () => setHelplinesModalVisible(true) },
          { label: 'Travel Reminders', emoji: '⏰', color: '#06B6D4', bg: '#CFFAFE', badge: null, action: () => setReminderModalVisible(true) },
        ].map((tool) => (
          <Pressable key={tool.label} style={({ pressed }) => [styles.toolCard, { backgroundColor: theme.card, borderColor: theme.border }, pressed && { opacity: 0.85 }]} onPress={tool.action}>
            <View style={[styles.toolCardIconBox, { backgroundColor: tool.bg }]}><Text style={styles.toolCardEmoji}>{tool.emoji}</Text></View>
            <Text style={[styles.toolCardLabel, { color: theme.text }]}>{tool.label}</Text>
            {tool.badge && (<View style={[styles.toolCardBadge, { backgroundColor: tool.color + '22' }]}><Text style={[styles.toolCardBadgeText, { color: tool.color }]}>{tool.badge}</Text></View>)}
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Emergency Shield Section ─────────────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="warning-outline" size={18} color="#EF4444" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Shield</Text>
        </View>
        <View style={[styles.sectionBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.sectionBadgeText, { color: '#EF4444' }]}>8 Tools</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScrollContainer}>
        {[
          { label: 'Guardian SafeWalk', emoji: '🚶', color: '#8B5CF6', bg: '#EDE9FE', badge: 'PRO', action: () => setSafeWalkModalVisible(true) },
          { label: 'Shake to SOS', emoji: '📳', color: '#DC2626', bg: '#FEE2E2', badge: 'SHAKE', action: () => setShakeSosVisible(true) },
          { label: 'Offline SOS SMS', emoji: '📡', color: '#EF4444', bg: '#FEE2E2', badge: 'NO NET', action: () => setOfflineSosVisible(true) },
          { label: 'Medical Pass', emoji: '🩺', color: '#E11D48', bg: '#FFE4E6', badge: 'QR ID', action: () => setMedicalCardVisible(true) },
          { label: 'Geofence Alert', emoji: '🔔', color: '#D97706', bg: '#FEF3C7', badge: 'ZONE', action: () => setGeofenceModalVisible(true) },
          { label: 'Low Battery Ping', emoji: '🔋', color: '#EA580C', bg: '#FFEDD5', badge: '15%', action: () => setLowBatteryVisible(true) },
          { label: 'Emergency SOS', emoji: '🆘', color: '#EF4444', bg: '#FEE2E2', badge: '112', action: () => router.push('/sos') },
          { label: 'App Guide', emoji: '📖', color: '#7C3AED', bg: '#EDE9FE', badge: 'NEW', action: () => setGuideBookVisible(true) },
        ].map((tool) => (
          <Pressable key={tool.label} style={({ pressed }) => [styles.toolCard, { backgroundColor: theme.card, borderColor: theme.border }, pressed && { opacity: 0.85 }]} onPress={tool.action}>
            <View style={[styles.toolCardIconBox, { backgroundColor: tool.bg }]}><Text style={styles.toolCardEmoji}>{tool.emoji}</Text></View>
            <Text style={[styles.toolCardLabel, { color: theme.text }]}>{tool.label}</Text>
            {tool.badge && (<View style={[styles.toolCardBadge, { backgroundColor: tool.color + '22' }]}><Text style={[styles.toolCardBadgeText, { color: tool.color }]}>{tool.badge}</Text></View>)}
          </Pressable>
        ))}
      </ScrollView>

      
      {/* ── ALWAYS VISIBLE: Travel Reminders ──────────────── */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="alarm-outline" size={18} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Reminders</Text>
        </View>
        <Pressable
          style={[styles.addReminderBtn, { backgroundColor: theme.primary }]}
          onPress={() => setReminderModalVisible(true)}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addReminderText}>Add</Text>
        </Pressable>
      </View>

      <View style={[styles.reminderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {reminders.length === 0 ? (
          <View style={styles.reminderEmptyBox}>
            <Ionicons name="alarm-outline" size={30} color={theme.textLight} />
            <Text style={[styles.reminderEmptyText, { color: theme.textSecondary }]}>
              No reminders set. Add one for medicine, check-in, or departure.
            </Text>
          </View>
        ) : (
          reminders.map((r) => (
            <View key={r.id} style={[styles.reminderItem, { borderBottomColor: theme.border }]}>
              <View style={[styles.reminderIconBox, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="alarm" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reminderTitle, { color: theme.text }]} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={[styles.reminderTime, { color: theme.textSecondary }]}>
                  {r.displayDate} at {r.displayTime}
                </Text>
              </View>
              <Pressable onPress={() => handleDeleteReminder(r)} style={styles.reminderDeleteBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* ── Document Preview Modal ────────────────────────── */}
      <Modal
        visible={previewDoc !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.previewModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.previewHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>
                  {previewDoc?.title}
                </Text>
                <Text style={[styles.previewSub, { color: theme.textSecondary }]}>
                  {previewDoc?.documentType || 'Travel Document'}
                </Text>
              </View>
              <Pressable onPress={() => setPreviewDoc(null)}>
                <Ionicons name="close-circle" size={26} color={theme.textSecondary} />
              </Pressable>
            </View>

            {getDocImageUrl(previewDoc) ? (
              <Image
                source={{ uri: getDocImageUrl(previewDoc) }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.previewPlaceholder, { backgroundColor: theme.background }]}>
                <Ionicons name="document-text" size={48} color={theme.textLight} />
                <Text style={[styles.previewPlaceholderText, { color: theme.textSecondary }]}>
                  Document stored in secure vault
                </Text>
              </View>
            )}

            <View style={styles.previewMetaBox}>
              <View style={styles.previewMetaRow}>
                <Text style={[styles.previewMetaLabel, { color: theme.textSecondary }]}>Expiry Date:</Text>
                <Text style={[styles.previewMetaValue, { color: theme.text }]}>
                  {previewDoc?.expiryDate || 'No Expiry'}
                </Text>
              </View>
              <View style={styles.previewMetaRow}>
                <Text style={[styles.previewMetaLabel, { color: theme.textSecondary }]}>Status:</Text>
                <Text style={[styles.previewMetaValue, { color: theme.secondary }]}>✓ Offline Ready</Text>
              </View>
            </View>

            <View style={styles.previewActions}>
              <Pressable
                style={[styles.previewVaultBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setPreviewDoc(null);
                  router.push('/documents');
                }}
              >
                <Ionicons name="folder-open" size={16} color="#FFFFFF" />
                <Text style={styles.previewVaultBtnText}>Open Document Vault</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Reminder Modal ────────────────────────────────── */}
      <Modal
        visible={reminderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Set Travel Reminder</Text>
              <Pressable onPress={() => setReminderModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Reminder Title</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. Take medicine, Flight check-in, Meet guide"
              placeholderTextColor={theme.textLight}
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 2026-09-15"
              placeholderTextColor={theme.textLight}
              value={reminderDate}
              onChangeText={setReminderDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Time (HH:MM, 24-hour)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 09:30 or 14:00"
              placeholderTextColor={theme.textLight}
              value={reminderTime}
              onChangeText={setReminderTime}
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancelBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                onPress={() => setReminderModalVisible(false)}
                disabled={savingReminder}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddReminder}
                disabled={savingReminder}
              >
                {savingReminder ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Set Reminder</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Guardian SafeWalk & Stealth Shield Suite Modal ── */}
      <SafeWalkModal
        visible={safeWalkModalVisible}
        onClose={() => setSafeWalkModalVisible(false)}
        currentLocation={location}
        currentAddress={address}
        onTriggerSOS={() => router.push('/sos')}
      />

      {/* ── AI Multi-Language Travel Translator Modal ────── */}
      <TravelTranslatorModal
        visible={translatorModalVisible}
        onClose={() => setTranslatorModalVisible(false)}
        initialTargetLang={translatorInitialLang}
      />
    </ScrollView>

    {/* ── Side Navigation Bar Drawer ────────────────────── */}
    <SideNavBarDrawer
      visible={isSideNavOpen}
      onClose={() => setIsSideNavOpen(false)}
      userName={userName}
      avatarUri={avatarUri}
      onOpenSafeWalk={() => {
        setIsSideNavOpen(false);
        setSafeWalkModalVisible(true);
      }}
      onOpenTranslator={() => {
        setIsSideNavOpen(false);
        setTranslatorModalVisible(true);
      }}
      onOpenReminders={() => {
        setIsSideNavOpen(false);
        setReminderModalVisible(true);
      }}
      onOpenOfflineSos={() => {
        setIsSideNavOpen(false);
        setOfflineSosVisible(true);
      }}
      onOpenWeatherAdvisory={() => {
        setIsSideNavOpen(false);
        setWeatherModalVisible(true);
      }}
      onOpenHelplines={() => {
        setIsSideNavOpen(false);
        setHelplinesModalVisible(true);
      }}
      onOpenGeofenceAlert={() => {
        setIsSideNavOpen(false);
        setGeofenceModalVisible(true);
      }}
      onOpenShakeToSos={() => {
        setIsSideNavOpen(false);
        setShakeSosVisible(true);
      }}
      onOpenMedicalCard={() => {
        setIsSideNavOpen(false);
        setMedicalCardVisible(true);
      }}
      onOpenScamAlert={() => {
        setIsSideNavOpen(false);
        setScamAlertVisible(true);
      }}
      onOpenLowBattery={() => {
        setIsSideNavOpen(false);
        setLowBatteryVisible(true);
      }}
      onOpenGuideBook={() => {
        setIsSideNavOpen(false);
        setGuideBookVisible(true);
      }}
      isWatching={isWatching}
      safetyScore={calculateSafetyScore()}
      docCount={recentDocs.length}
    />

    {/* ── 1. Offline SOS Modal (Direct Cellular SMS) ─────── */}
    <OfflineSosModal
      visible={offlineSosVisible}
      onClose={() => setOfflineSosVisible(false)}
      latitude={location ? location.latitude : 23.0225}
      longitude={location ? location.longitude : 72.5714}
      address={address}
    />

    {/* ── 2. Live Weather & Travel Advisory Modal ─────────── */}
    <WeatherAdvisoryModal
      visible={weatherModalVisible}
      onClose={() => setWeatherModalVisible(false)}
      latitude={location ? location.latitude : 23.0225}
      longitude={location ? location.longitude : 72.5714}
      address={address}
    />

    {/* ── 5. All-India Helplines Directory Modal ──────────── */}
    <HelplinesDirectoryModal
      visible={helplinesModalVisible}
      onClose={() => setHelplinesModalVisible(false)}
    />

    {/* ── 6. Danger Zone & Geofence Shield Modal ──────────── */}
    <GeofenceAlertModal
      visible={geofenceModalVisible}
      onClose={() => setGeofenceModalVisible(false)}
      currentAddress={address}
      onTriggerSOS={() => router.push('/sos')}
    />

    {/* ── 7. Shake to SOS Guard Modal ─────────────────────── */}
    <ShakeToSosModal
      visible={shakeSosVisible}
      onClose={() => setShakeSosVisible(false)}
      onTriggerSOS={() => router.push('/sos')}
    />

    {/* ── 8. Emergency Medical Pass & QR Modal ────────────── */}
    <EmergencyMedicalCardModal
      visible={medicalCardVisible}
      onClose={() => setMedicalCardVisible(false)}
      userName={userName}
    />

    {/* ── 9. Tourist Scam & Safety Radar Modal ───────────── */}
    <TouristScamAlertModal
      visible={scamAlertVisible}
      onClose={() => setScamAlertVisible(false)}
    />

    {/* ── 10. Low Battery Auto-Ping Modal ─────────────────── */}
    <LowBatteryPingModal
      visible={lowBatteryVisible}
      onClose={() => setLowBatteryVisible(false)}
      latitude={location ? location.latitude : 23.0225}
      longitude={location ? location.longitude : 72.5714}
      address={address}
    />

    {/* ── 11. App Guide Book Modal ─────────────────────────── */}
    <AppGuideBookModal
      visible={guideBookVisible}
      onClose={() => setGuideBookVisible(false)}
    />
  </View>
  );
}

const styles = StyleSheet.create({
  openFullMapBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    margin: 12,
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  openFullMapIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openFullMapTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  openFullMapSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  // ─── 1-Tap Feature Hub Navigation ───────────────────────
  homeTabSelectorScroll: {
    marginBottom: 14,
  },
  homeTabSelectorContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  homeTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  homeTabLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  homeTabBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  homeTabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },

  // ─── Header ─────────────────────────────────────────────
  welcomeCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
  },
  welcomeTextContainer: { flex: 1, paddingRight: 12 },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 6,
  },
  brandBadgeText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.3 },
  greetingText: { fontSize: 18, fontWeight: 'bold' },
  welcomeSubtitle: { fontSize: 12, marginTop: 2 },
  avatarImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2 },
  avatarWrapper: {
    position: 'relative',
  },
  avatarInitialsBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // ─── SOS ────────────────────────────────────────────────
  sosButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  sosButtonPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  sosIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sosTextWrapper: { flex: 1 },
  sosMainText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  sosSubText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },

  // ─── Section Header ─────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold' },
  sectionSubtitle: { fontSize: 12, marginTop: -4, marginBottom: 10 },
  sectionActionText: { fontSize: 13, fontWeight: 'bold' },

  // ─── Location Card ──────────────────────────────────────
  liveTrackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginLeft: 6,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  liveTrackingText: { fontSize: 10, fontWeight: 'bold', color: '#059669' },
  locationCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1 },
  mapPreviewContainer: { height: 190, width: '100%', position: 'relative' },
  mapView: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  mapPlaceholderText: { fontSize: 13, textAlign: 'center' },
  mapRetryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 4,
  },
  mapRetryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  userMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(37,99,235,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
  recenterBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
  },
  locationInfoBox: { padding: 14, borderTopWidth: 1 },
  locationTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  locationAddressBlock: { flex: 1 },
  locationStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  locationDot: { width: 8, height: 8, borderRadius: 4 },
  locationStatusLabel: { fontSize: 11, fontWeight: '600' },
  locationAddress: { fontSize: 14, fontWeight: 'bold', lineHeight: 19, marginBottom: 2 },
  locationCoords: { fontSize: 11 },
  refreshGpsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  locationControlsRow: { flexDirection: 'row', gap: 8 },
  locationControlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  locationControlText: { fontSize: 11, fontWeight: 'bold' },

  // ─── Travel Status ──────────────────────────────────────
  statusLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusLoadingText: { fontSize: 13 },
  statusErrorCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statusErrorText: { fontSize: 13, textAlign: 'center' },
  retryButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, marginTop: 4 },
  retryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  tripCard: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1 },
  tripCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  tripStatusTag: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 2 },
  tripTitle: { fontSize: 16, fontWeight: 'bold' },
  tripBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tripBadgeText: { fontSize: 11, fontWeight: 'bold' },
  tripDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tripDetailText: { fontSize: 13 },
  safetyTrackingDot: { width: 8, height: 8, borderRadius: 4 },
  viewTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  viewTripButtonText: { fontSize: 13, fontWeight: 'bold' },
  emptyTripCard: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  emptyTripTitle: { fontSize: 15, fontWeight: 'bold' },
  emptyTripText: { fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
  planTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    gap: 4,
  },
  planTripBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

  // ─── Quick Actions Grid ─────────────────────────────────
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  gridButton: { width: '48%', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  gridButtonPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  iconCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  gridButtonTitle: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  gridButtonDesc: { fontSize: 11, textAlign: 'center', marginTop: 2 },

  // ─── Nearby Safety Places (Compact Home Rows) ───────────
  nearbyCompactList: { gap: 8, marginBottom: 16 },
  nearbyPlaceRowCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeCategoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  placeRowInfo: { flex: 1 },
  placeRowName: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  placeRowCategory: { fontSize: 11 },
  placeRowActions: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  placeDirectionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 3,
  },
  placeCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 3,
  },
  placeBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  nearbyStatusCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nearbyStatusText: { fontSize: 13, textAlign: 'center' },
  miniRetryBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, marginTop: 4 },
  miniRetryBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  // ─── Travel Documents ───────────────────────────────────
  docCategoriesRow: { gap: 8, paddingBottom: 8, marginBottom: 8 },
  docCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  docCategoryChipText: { fontSize: 12, fontWeight: '600' },
  docsListContainer: { gap: 10, marginBottom: 16 },
  docSkeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  docSkeletonText: { fontSize: 13 },
  docEmptyCard: { borderRadius: 14, padding: 22, borderWidth: 1, alignItems: 'center', gap: 6 },
  docEmptyIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  docEmptyTitle: { fontSize: 15, fontWeight: 'bold' },
  docEmptySub: { fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
  addDocBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  addDocBtnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  homeDocCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  homeDocIconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  homeDocInfo: { flex: 1 },
  homeDocTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  homeDocTitle: { fontSize: 14, fontWeight: 'bold', flex: 1 },
  homeDocMeta: { fontSize: 11, marginTop: 3 },
  homeDocSavedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  homeDocSavedText: { fontSize: 10, fontWeight: 'bold' },
  docActionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  docActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  docActionBtnText: { fontSize: 12, fontWeight: 'bold' },

  // ─── Reminders ──────────────────────────────────────────
  addReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  addReminderText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  reminderCard: { borderRadius: 14, marginBottom: 20, borderWidth: 1, overflow: 'hidden' },
  reminderEmptyBox: { alignItems: 'center', padding: 22, gap: 8 },
  reminderEmptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  reminderItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, gap: 10 },
  reminderIconBox: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reminderTitle: { fontSize: 14, fontWeight: '600' },
  reminderTime: { fontSize: 12, marginTop: 1 },
  reminderDeleteBtn: { padding: 6 },

  // ─── Modal ──────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4, marginTop: 10 },
  modalInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalCancelBtn: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  modalSaveBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  // ─── Preview Modal ──────────────────────────────────────
  previewModalCard: { borderRadius: 18, padding: 18, borderWidth: 1, maxHeight: '85%' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewTitle: { fontSize: 17, fontWeight: 'bold' },
  previewSub: { fontSize: 12, marginTop: 2 },
  previewImage: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#000', marginBottom: 12 },
  previewPlaceholder: { width: '100%', height: 160, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, gap: 8 },
  previewPlaceholderText: { fontSize: 12 },
  previewMetaBox: { gap: 6, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.15)', marginBottom: 12 },
  previewMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewMetaLabel: { fontSize: 12 },
  previewMetaValue: { fontSize: 12, fontWeight: '600' },
  previewActions: { flexDirection: 'row', gap: 10 },
  previewVaultBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: 8, gap: 6 },
  previewVaultBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

  // ─── Guardian SafeWalk Banner ───────────────────────────
  safeWalkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 12,
  },
  safeWalkBannerPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  safeWalkIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeWalkTextWrapper: {
    flex: 1,
  },
  safeWalkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safeWalkMainText: {
    fontSize: 16,
    fontWeight: '700',
  },
  proBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  safeWalkSubText: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },

  // ─── Live Area Safety Score Card ────────────────────────
  safetyScoreCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  scoreTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreTitleBlock: {
    flex: 1,
    paddingRight: 10,
  },
  scoreHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  scoreTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#10B981',
  },
  scoreMainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B98118',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  scoreMax: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    marginTop: -2,
  },
  scoreProgressBarBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scoreProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scoreMetricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  scoreMetricText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ─── Travel Safety Checklist ────────────────────────────
  checklistBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  checklistBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checklistCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  checklistDescription: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 10,
  },
  checklistItemText: {
    fontSize: 13,
    flex: 1,
  },
  checklistItemDone: {
    textDecorationLine: 'line-through',
  },

  // ─── AI Travel Translator Hub Card ──────────────────────
  translatorCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  translatorCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  translatorHeaderInfo: {
    flex: 1,
    paddingRight: 10,
  },
  translatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 5,
  },
  translatorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  translatorCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  translatorCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  translatorGlowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeLangPillsRow: {
    marginBottom: 12,
  },
  homeLangPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
  },
  homeLangPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  translatorActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  translatorActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    gap: 6,
  },
  translatorActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ── Tool Cards (horizontal scroll sections) ───────────────
  toolsScrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  toolCard: {
    width: 86,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  toolCardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolCardEmoji: {
    fontSize: 26,
  },
  toolCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  toolCardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  toolCardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ── Section Badge ─────────────────────────────────────────
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

});

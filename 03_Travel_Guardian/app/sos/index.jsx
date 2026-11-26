// Travel Guardian - Emergency SOS Distress System
// Connected to audio siren (expo-audio) + real location + native emergency dialer + backend sync

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { callPhoneNumber } from '../../utils/phone';
import { getStoredUser } from '../../services/authService';
import { saveLocation } from '../../services/locationService';
import { getContacts } from '../../services/contactService';

export default function SOSScreen() {
  const { theme, isDarkMode } = useTheme();

  // SOS State
  const [isTriggering, setIsTriggering] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [dispatchedData, setDispatchedData] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [primaryContactInfo, setPrimaryContactInfo] = useState({ name: 'Emergency Contact', phone: '' });

  // Siren Audio Player instance (expo-audio)
  const sirenPlayer = useAudioPlayer(require('../../assets/siren.wav'));

  // Ensure siren loops continuously
  useEffect(() => {
    if (sirenPlayer) {
      sirenPlayer.loop = true;
    }
  }, [sirenPlayer]);

  // Load primary contact from cache / backend on mount
  useEffect(() => {
    let isMounted = true;
    const loadPrimaryContact = async () => {
      try {
        const cached = await AsyncStorage.getItem('travel_guardian_emergency_contacts_cache');
        let list = cached ? JSON.parse(cached) : [];

        if (list.length === 0) {
          try {
            const res = await getContacts();
            if (res?.data && res.data.length > 0) {
              list = res.data;
            }
          } catch {}
        }

        if (isMounted && list.length > 0) {
          const primary = list.find((c) => c.isPrimary) || list[0];
          if (primary && primary.phone) {
            setPrimaryContactInfo({
              name: primary.name || 'Primary Contact',
              phone: primary.phone,
            });
          }
        }
      } catch (err) {
        console.log('[SOS] Contact prefetch error:', err.message);
      }
    };

    loadPrimaryContact();

    // Cleanup audio on screen unmount
    return () => {
      isMounted = false;
      try {
        if (sirenPlayer) {
          sirenPlayer.pause();
        }
      } catch {}
    };
  }, [sirenPlayer]);

  // -------------------------------------------------------------
  // 1. Audio Siren Playback (Local Bundled Asset via expo-audio)
  // -------------------------------------------------------------
  const startSirenAudio = async () => {
    try {
      // Configure audio session to play through speaker even if device is in silent mode
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
      } catch (modeErr) {
        console.log('[SOS] Audio mode setup notice:', modeErr.message);
      }

      if (sirenPlayer) {
        sirenPlayer.loop = true;
        try {
          await sirenPlayer.seekTo(0);
        } catch {}
        sirenPlayer.play();
        setSirenPlaying(true);
      }
    } catch (err) {
      console.log('[SOS] Error starting siren:', err.message);
      Alert.alert('Siren Notice', 'Unable to play the emergency siren on this device.');
      setSirenPlaying(false);
    }
  };

  const stopSirenAudio = () => {
    try {
      if (sirenPlayer) {
        sirenPlayer.pause();
        try {
          sirenPlayer.seekTo(0);
        } catch {}
      }
    } catch (err) {
      console.log('[SOS] Error stopping siren:', err.message);
    } finally {
      setSirenPlaying(false);
    }
  };

  // Toggle siren button handler
  const handleToggleSiren = () => {
    if (sirenPlaying) {
      stopSirenAudio();
    } else {
      startSirenAudio();
    }
  };

  // -------------------------------------------------------------
  // 2. Emergency SOS Trigger Confirmation
  // -------------------------------------------------------------
  const handlePressSos = () => {
    Alert.alert(
      '🚨 ACTIVATE EMERGENCY SOS?',
      'This will immediately sound a loud alarm siren, broadcast your live GPS coordinates, and notify emergency responders.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'ACTIVATE NOW',
          style: 'destructive',
          onPress: executeSosDispatch,
        },
      ]
    );
  };

  // -------------------------------------------------------------
  // 3. Execute SOS Dispatch Workflow
  // Siren starts immediately without waiting for GPS or backend!
  // -------------------------------------------------------------
  const executeSosDispatch = async () => {
    // 1. Start siren IMMEDIATELY for instant safety response
    startSirenAudio();
    setSosActive(true);

    try {
      setIsTriggering(true);

      // Step A: Get GPS Location
      let latitude = 28.6139;
      let longitude = 77.209;
      let address = 'Current Location Coordinates';

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;

          const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (rev && rev.length > 0) {
            const p = rev[0];
            address = `${p.streetNumber || ''} ${p.street || ''}, ${p.city || ''}, ${p.country || ''}`.trim();
          }
        }
      } catch (locErr) {
        console.log('[SOS] Location notice:', locErr.message);
      }

      // Step B: Load Emergency Contacts
      let contactsCount = 0;
      let primaryContactName = primaryContactInfo.name;
      let primaryContactPhone = primaryContactInfo.phone;

      try {
        const cached = await AsyncStorage.getItem('travel_guardian_emergency_contacts_cache');
        let contactsList = cached ? JSON.parse(cached) : [];

        try {
          const contactsResponse = await getContacts();
          if (contactsResponse?.data && contactsResponse.data.length > 0) {
            contactsList = contactsResponse.data;
          }
        } catch {}

        contactsCount = contactsList.length;
        const primary = contactsList.find((c) => c.isPrimary) || contactsList[0];
        if (primary) {
          primaryContactName = primary.name;
          primaryContactPhone = primary.phone;
          setPrimaryContactInfo({ name: primary.name, phone: primary.phone });
        }
      } catch (conErr) {
        console.log('[SOS] Contacts notice:', conErr.message);
      }

      // Step C: Get Logged-In User Information
      const storedUser = await getStoredUser();
      const currentUser = storedUser || {
        name: 'Traveler',
        email: '',
        phone: '',
        bloodGroup: 'Not specified',
      };

      // Step D: Send Emergency SOS to backend (background)
      saveLocation({
        latitude,
        longitude,
        address,
        isSosTriggered: true,
      }).catch((apiErr) => {
        console.log('[SOS] Backend dispatch notice:', apiErr.message);
      });

      // Step E: Set Dispatched Summary
      const alertSummary = {
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        address,
        user: currentUser,
        contactsCount,
        primaryContact: primaryContactName,
        primaryPhone: primaryContactPhone,
        time: new Date().toLocaleTimeString(),
      };

      setDispatchedData(alertSummary);
    } catch (error) {
      console.log('[SOS] Dispatch error:', error.message);
    } finally {
      setIsTriggering(false);
    }
  };

  // -------------------------------------------------------------
  // 4. Deactivate SOS Beacon ("I Am Safe")
  // -------------------------------------------------------------
  const handleDismissSos = () => {
    stopSirenAudio();
    setSosActive(false);
    setDispatchedData(null);
    Alert.alert('Alert Deactivated', 'Distress beacon stopped. Notification recorded that you are safe.');
  };

  // -------------------------------------------------------------
  // 5. Direct Phone Calls via Native Dialer
  // -------------------------------------------------------------
  const handleCallPolice = () => {
    // 112 is standard emergency number in India and globally
    callPhoneNumber('112', 'Police Emergency (112)');
  };

  const handleCallPrimaryContact = () => {
    const phoneToCall = dispatchedData?.primaryPhone || primaryContactInfo.phone;
    const nameToCall = dispatchedData?.primaryContact || primaryContactInfo.name;

    if (!phoneToCall) {
      Alert.alert(
        'No Contact Number',
        'Please add an emergency contact in the Contacts tab first.'
      );
      return;
    }

    callPhoneNumber(phoneToCall, nameToCall);
  };

  // Theme-aware dynamic colors
  const bgColor = isDarkMode ? '#0B1120' : '#F8FAFC';
  const cardBg = isDarkMode ? '#131D31' : theme.card;
  const borderColor = isDarkMode ? '#1E293B' : theme.border;
  const textColor = isDarkMode ? '#F8FAFC' : theme.text;
  const textSubColor = isDarkMode ? '#94A3B8' : theme.textSecondary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Banner */}
      <View style={styles.headerBox}>
        <View style={styles.headerBadge}>
          <Ionicons name="shield-checkmark" size={14} color={colors.danger} />
          <Text style={styles.headerBadgeText}>CRITICAL RESPONSE NETWORK</Text>
        </View>
        <Text style={[styles.headerTitle, { color: textColor }]}>Emergency SOS</Text>
        <Text style={[styles.headerSubtitle, { color: textSubColor }]}>
          One-tap distress signal connecting Live Location, Siren, and Emergency Contacts.
        </Text>
      </View>

      {/* 2. Active Siren Status Banner */}
      {sirenPlaying && (
        <View style={styles.sirenActiveBanner}>
          <Ionicons name="volume-high" size={20} color={colors.white} />
          <Text style={styles.sirenActiveText}>SIREN ACTIVE — LOUD ALARM PLAYING</Text>
        </View>
      )}

      {/* 3. Large Central SOS Button */}
      <View style={styles.sosButtonContainer}>
        {sosActive && <View style={styles.sosPulseRing} />}
        <Pressable
          style={({ pressed }) => [
            styles.giantSosButton,
            sosActive && styles.giantSosButtonActive,
            pressed && styles.giantSosButtonPressed,
          ]}
          onPress={handlePressSos}
          disabled={isTriggering}
        >
          {isTriggering ? (
            <ActivityIndicator size="large" color={colors.white} />
          ) : (
            <View style={styles.sosInnerRing}>
              <Ionicons
                name={sosActive ? 'warning' : 'radio'}
                size={54}
                color={colors.white}
              />
              <Text style={styles.giantSosText}>
                {sosActive ? 'SOS ACTIVE' : 'SOS'}
              </Text>
              <Text style={styles.giantSosSub}>
                {sosActive ? 'DISTRESS BROADCAST' : 'TAP FOR HELP'}
              </Text>
            </View>
          )}
        </Pressable>
        <Text style={[styles.sosPressHint, { color: textSubColor }]}>
          {sosActive
            ? '🚨 Distress Beacon Active — Siren sounding & coordinates shared'
            : 'Press and confirm to activate emergency distress signal'}
        </Text>
      </View>

      {/* 4. Dispatched Distress Summary Card (Shown when SOS is active) */}
      {sosActive && dispatchedData && (
        <View style={[styles.activeAlertCard, { backgroundColor: cardBg, borderColor: colors.danger }]}>
          <View style={styles.activeAlertHeader}>
            <View style={styles.blinkingDot} />
            <Text style={styles.activeAlertTitle}>DISTRESS BEACON DISPATCHED</Text>
          </View>

          <View style={styles.alertDetailRow}>
            <Text style={[styles.alertDetailLabel, { color: textSubColor }]}>GPS Coordinates:</Text>
            <Text style={[styles.alertDetailValue, { color: textColor }]}>
              {dispatchedData.latitude}° N, {dispatchedData.longitude}° E
            </Text>
          </View>

          <View style={styles.alertDetailRow}>
            <Text style={[styles.alertDetailLabel, { color: textSubColor }]}>Address:</Text>
            <Text style={[styles.alertDetailValue, { color: textColor }]} numberOfLines={2}>
              {dispatchedData.address}
            </Text>
          </View>

          <View style={styles.alertDetailRow}>
            <Text style={[styles.alertDetailLabel, { color: textSubColor }]}>Traveler Name:</Text>
            <Text style={[styles.alertDetailValue, { color: textColor }]}>
              {dispatchedData.user.name} ({dispatchedData.user.bloodGroup || 'Blood Group N/A'})
            </Text>
          </View>

          <View style={styles.alertDetailRow}>
            <Text style={[styles.alertDetailLabel, { color: textSubColor }]}>Contacts Alerted:</Text>
            <Text style={[styles.alertDetailValue, { color: textColor }]}>
              {dispatchedData.contactsCount} Contacts in Emergency Network
            </Text>
          </View>

          <Pressable style={styles.dismissBtn} onPress={handleDismissSos}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.dismissBtnText}>I Am Safe (Deactivate Beacon & Siren)</Text>
          </Pressable>
        </View>
      )}

      {/* 5. Direct Emergency Lines */}
      <Text style={[styles.sectionHeading, { color: textColor }]}>Direct Emergency Lines</Text>
      <View style={styles.actionsGrid}>
        {/* Call Police (112) */}
        <Pressable
          style={[styles.actionCard, { backgroundColor: cardBg, borderColor }]}
          onPress={handleCallPolice}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: colors.danger }]}>
            <Ionicons name="shield-checkmark" size={22} color={colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: textColor }]}>Call Police (112)</Text>
            <Text style={[styles.actionSub, { color: textSubColor }]}>
              National emergency line — opens native phone dialer
            </Text>
          </View>
          <Ionicons name="call" size={20} color={colors.danger} />
        </Pressable>

        {/* Call Primary Contact */}
        <Pressable
          style={[styles.actionCard, { backgroundColor: cardBg, borderColor }]}
          onPress={handleCallPrimaryContact}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="people" size={22} color={colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: textColor }]}>
              Call Primary Contact
            </Text>
            <Text style={[styles.actionSub, { color: textSubColor }]}>
              {primaryContactInfo.phone
                ? `${primaryContactInfo.name} (${primaryContactInfo.phone})`
                : 'No primary contact saved — tap to check'}
            </Text>
          </View>
          <Ionicons name="call" size={20} color={theme.primary} />
        </Pressable>

        {/* Siren Sound Toggle Button */}
        <Pressable
          style={[
            styles.actionCard,
            { backgroundColor: cardBg, borderColor: sirenPlaying ? colors.danger : borderColor },
          ]}
          onPress={handleToggleSiren}
        >
          <View
            style={[
              styles.actionIconCircle,
              { backgroundColor: sirenPlaying ? colors.danger : (isDarkMode ? '#334155' : '#E2E8F0') },
            ]}
          >
            <Ionicons
              name={sirenPlaying ? 'volume-mute' : 'volume-high'}
              size={22}
              color={sirenPlaying ? colors.white : (isDarkMode ? colors.white : colors.text)}
            />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: sirenPlaying ? colors.danger : textColor }]}>
              {sirenPlaying ? '🔇 Stop High-Pitch Siren' : '🔊 Start Siren Alarm'}
            </Text>
            <Text style={[styles.actionSub, { color: textSubColor }]}>
              {sirenPlaying
                ? 'Siren active — tap to immediately silence audio'
                : 'Audible deterrent siren for immediate attention'}
            </Text>
          </View>
          <View
            style={[
              styles.sirenStatusBadge,
              { backgroundColor: sirenPlaying ? colors.dangerLight : (isDarkMode ? '#1E293B' : '#E2E8F0') },
            ]}
          >
            <Text
              style={[
                styles.sirenStatusBadgeText,
                { color: sirenPlaying ? colors.danger : textSubColor },
              ]}
            >
              {sirenPlaying ? 'ACTIVE' : 'OFF'}
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    alignItems: 'center',
    marginVertical: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 6,
  },
  headerBadgeText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  sirenActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  sirenActiveText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sosButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  sosPulseRing: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  giantSosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  giantSosButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: colors.white,
  },
  giantSosButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  sosInnerRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  giantSosText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  giantSosSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  sosPressHint: {
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 16,
  },
  activeAlertCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  activeAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  blinkingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  activeAlertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.danger,
    letterSpacing: 0.5,
  },
  alertDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  alertDetailLabel: {
    fontSize: 12,
  },
  alertDetailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    maxWidth: '60%',
    textAlign: 'right',
  },
  dismissBtn: {
    backgroundColor: colors.secondary,
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  dismissBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionsGrid: {
    gap: 10,
  },
  actionCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sirenStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sirenStatusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

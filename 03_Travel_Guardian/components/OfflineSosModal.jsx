import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Linking,
  Platform,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

export default function OfflineSosModal({
  visible,
  onClose,
  latitude = 23.0225,
  longitude = 72.5714,
  address = 'Locating position...',
}) {
  const { theme } = useTheme();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (visible) {
      loadEmergencyContacts();
    }
  }, [visible]);

  const loadEmergencyContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem('emergency_contacts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContacts(parsed);
          return;
        }
      }
    } catch {}
    // Default fallback contacts
    setContacts([
      { id: '1', name: 'Primary Guardian', phone: '112' },
      { id: '2', name: 'Family Contact', phone: '' },
    ]);
  };

  const generateSmsBody = () => {
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    return `EMERGENCY! I need immediate help. My current GPS Location: ${mapsLink} (${address}). Sent via Travel Guardian Offline SOS.`;
  };

  const handleSendOfflineSms = (phone = '') => {
    const body = encodeURIComponent(generateSmsBody());
    const target = phone ? phone.replace(/\s+/g, '') : '';
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = target ? `sms:${target}${separator}body=${body}` : `sms:${separator}body=${body}`;

    Linking.openURL(smsUrl).catch(() => {
      Alert.alert(
        'SMS App Unavailable',
        'Could not launch SMS app automatically. You can copy the emergency message directly.'
      );
    });
  };

  const handleShareEmergency = async () => {
    try {
      await Share.share({
        message: generateSmsBody(),
        title: 'EMERGENCY SOS - Travel Guardian',
      });
    } catch {}
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="airplane" size={22} color={colors.danger} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Offline SOS Broadcast</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Zero Internet Required • Direct SMS
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Status Alert Banner */}
            <View style={styles.alertBanner}>
              <Ionicons name="wifi" size={18} color="#EF4444" style={{ textDecorationLine: 'line-through' }} />
              <Text style={styles.alertBannerText}>
                No mobile data or WiFi needed! This triggers standard cellular SMS containing your exact GPS coordinates.
              </Text>
            </View>

            {/* GPS Location Snapshot */}
            <View style={[styles.gpsBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="location-sharp" size={20} color={colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.gpsCoords, { color: theme.text }]}>
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </Text>
                <Text style={[styles.gpsAddress, { color: theme.textSecondary }]} numberOfLines={2}>
                  {address}
                </Text>
              </View>
            </View>

            {/* Big 1-Tap Broadcast Button */}
            <Pressable style={styles.broadcastButton} onPress={() => handleSendOfflineSms('')}>
              <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
              <Text style={styles.broadcastButtonText}>SEND OFFLINE SMS TO ALL</Text>
            </Pressable>

            {/* Quick Individual Contacts */}
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              OR DISPATCH TO SPECIFIC CONTACT:
            </Text>

            {contacts.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.contactCard, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => handleSendOfflineSms(c.phone)}
              >
                <View style={styles.contactAvatar}>
                  <Ionicons name="person" size={16} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactName, { color: theme.text }]}>{c.name}</Text>
                  <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
                    {c.phone ? c.phone : 'Set number in profile'}
                  </Text>
                </View>
                <View style={styles.smsActionBadge}>
                  <Ionicons name="chatbubble-ellipses" size={14} color="#FFFFFF" />
                  <Text style={styles.smsActionText}>SMS</Text>
                </View>
              </Pressable>
            ))}

            {/* Share / Copy Fallback */}
            <Pressable
              style={[styles.shareFallbackBtn, { borderColor: theme.border }]}
              onPress={handleShareEmergency}
            >
              <Ionicons name="share-outline" size={18} color={theme.text} />
              <Text style={[styles.shareFallbackText, { color: theme.text }]}>
                Copy GPS Coordinates / Share to Apps
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 12,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 17,
    fontWeight: '500',
  },
  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gpsCoords: {
    fontSize: 13,
    fontWeight: '700',
  },
  gpsAddress: {
    fontSize: 11,
    marginTop: 2,
  },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 3,
    shadowColor: colors.danger,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  broadcastButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  smsActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  smsActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  shareFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  shareFallbackText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

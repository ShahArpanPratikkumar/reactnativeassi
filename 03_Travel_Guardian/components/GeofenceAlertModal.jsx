import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  Vibration,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

export default function GeofenceAlertModal({
  visible,
  onClose,
  currentAddress = 'Ahmedabad, Gujarat',
  onTriggerSOS,
}) {
  const { theme } = useTheme();
  const [nightGuardActive, setNightGuardActive] = useState(true);
  const [isolatedAreaAlert, setIsolatedAreaAlert] = useState(true);
  const [vibrationAlert, setVibrationAlert] = useState(true);

  const handleTestAlert = () => {
    if (vibrationAlert) {
      Vibration.vibrate([0, 400, 200, 400]);
    }
    Alert.alert(
      '⚠️ Geofence Shield Alert (Simulation)',
      'Caution: You are moving in a low-density zone after 10 PM. Travel Guardian recommends staying on main roads and keeping emergency contacts informed.',
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'Launch SOS', style: 'destructive', onPress: onTriggerSOS },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="navigate-circle" size={22} color="#D97706" />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Danger Zone & Geofence</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Intelligent boundary & night risk monitor
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Current Status Pill */}
          <View style={[styles.statusBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.statusDot} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusHeader, { color: '#10B981' }]}>
                Geofence Active: Safe Zone Verified
              </Text>
              <Text style={[styles.statusAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                {currentAddress}
              </Text>
            </View>
          </View>

          {/* Toggle Controls */}
          <View style={styles.toggleList}>
            <View style={[styles.toggleItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Night Owl Guard (10 PM - 5 AM)</Text>
                <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                  Higher sensitivity alert if traveling after 10 PM
                </Text>
              </View>
              <Switch
                value={nightGuardActive}
                onValueChange={setNightGuardActive}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={[styles.toggleItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Isolated Zone Warning</Text>
                <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                  Notifies when leaving well-lit main transit corridors
                </Text>
              </View>
              <Switch
                value={isolatedAreaAlert}
                onValueChange={setIsolatedAreaAlert}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={[styles.toggleItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Haptic Pulsing Alert</Text>
                <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                  Vibrate pocket silently if safety boundary is crossed
                </Text>
              </View>
              <Switch
                value={vibrationAlert}
                onValueChange={setVibrationAlert}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>

          {/* Test Alert Button */}
          <Pressable style={[styles.testBtn, { backgroundColor: theme.primary }]} onPress={handleTestAlert}>
            <Ionicons name="notifications" size={18} color="#FFFFFF" />
            <Text style={styles.testBtnText}>Simulate Risk Boundary Alert</Text>
          </Pressable>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  statusHeader: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusAddress: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleList: {
    gap: 10,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

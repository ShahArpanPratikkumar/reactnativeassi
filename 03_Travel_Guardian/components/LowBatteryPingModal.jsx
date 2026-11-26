import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

export default function LowBatteryPingModal({
  visible,
  onClose,
  latitude = 23.0225,
  longitude = 72.5714,
  address = 'Ahmedabad, Gujarat',
}) {
  const { theme } = useTheme();
  const [autoPingEnabled, setAutoPingEnabled] = useState(true);
  const [threshold, setThreshold] = useState(15); // 15%

  const handleTestPing = () => {
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = `LOW BATTERY ALERT! My phone battery is down to ${threshold}%. My current GPS location: ${mapsLink} (${address}). I may be unreachable soon. Sent via Travel Guardian.`;
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:${separator}body=${encodeURIComponent(message)}`;

    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('Simulated Ping', `SMS drafted: "${message}"`);
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="battery-dead" size={22} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Low Battery Auto-Ping</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Dispatches last known GPS before phone dies
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Master Toggle */}
          <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Emergency Power Guard</Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Auto-prompts or sends SMS to guardians when battery drops below {threshold}%
              </Text>
            </View>
            <Switch
              value={autoPingEnabled}
              onValueChange={setAutoPingEnabled}
              trackColor={{ false: theme.border, true: '#EF4444' }}
            />
          </View>

          {/* Threshold Selector */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TRIGGER THRESHOLD</Text>
          <View style={styles.thresholdRow}>
            {[10, 15, 20].map((percent) => {
              const isSelected = threshold === percent;
              return (
                <Pressable
                  key={percent}
                  style={[
                    styles.thresholdPill,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: '#EF4444', borderColor: '#EF4444' },
                  ]}
                  onPress={() => setThreshold(percent)}
                >
                  <Text style={[styles.thresholdText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {percent}% Battery
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Benefit Explainer */}
          <View style={[styles.explainerCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Ionicons name="flash-outline" size={20} color="#D97706" />
            <Text style={styles.explainerText}>
              Never let family worry about why your phone switched off. This automatically sends your last recorded location pin right before power exhaustion.
            </Text>
          </View>

          {/* Simulate Ping Test */}
          <Pressable style={styles.testBtn} onPress={handleTestPing}>
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <Text style={styles.testBtnText}>TEST LOW-BATTERY SMS DISPATCH</Text>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thresholdPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  thresholdText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  explainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  explainerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '500',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

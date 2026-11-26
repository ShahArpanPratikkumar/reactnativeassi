import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

const STORAGE_KEY = 'shake_to_sos_enabled';

export default function ShakeToSosModal({ visible, onClose, onTriggerSOS }) {
  const { theme } = useTheme();
  const [enabled, setEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState('medium'); // 'high' | 'medium' | 'low'

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setEnabled(stored === 'true');
      }
    } catch {}
  };

  const toggleEnabled = async (val) => {
    setEnabled(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
    } catch {}
  };

  const handleSimulateShake = () => {
    Vibration.vibrate([0, 300, 150, 300, 150, 500]);
    Alert.alert(
      '🚨 Shake Detected! (Simulation)',
      'Vigorous shaking detected! Auto SOS countdown initiated (3s).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Launch SOS Now',
          style: 'destructive',
          onPress: () => {
            onClose();
            if (onTriggerSOS) onTriggerSOS();
          },
        },
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
              <View style={[styles.headerIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="phone-portrait" size={22} color={colors.danger} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Shake to SOS Guard</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Vigorous motion distress trigger
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Master Enable Card */}
          <View style={[styles.masterCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.masterTitle, { color: theme.text }]}>
                Shake Detection {enabled ? 'ON' : 'OFF'}
              </Text>
              <Text style={[styles.masterDesc, { color: theme.textSecondary }]}>
                When active, shaking phone 3 times launches emergency beacon immediately
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={toggleEnabled}
              trackColor={{ false: theme.border, true: colors.danger }}
            />
          </View>

          {/* Sensitivity Selector */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SENSITIVITY LEVEL</Text>
          <View style={styles.sensitivityRow}>
            {[
              { id: 'low', label: 'Low (Heavy Shake)' },
              { id: 'medium', label: 'Medium (Recommended)' },
              { id: 'high', label: 'High (Fast Response)' },
            ].map((s) => {
              const isSelected = sensitivity === s.id;
              return (
                <Pressable
                  key={s.id}
                  style={[
                    styles.sensitivityPill,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setSensitivity(s.id)}
                >
                  <Text style={[styles.sensitivityText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* How It Works Steps */}
          <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>How to use in real emergency:</Text>
            <View style={styles.stepRow}>
              <Text style={[styles.stepNum, { color: colors.danger }]}>1.</Text>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                In danger, grab your phone firmly and shake it 3 times rapidly.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={[styles.stepNum, { color: colors.danger }]}>2.</Text>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                Phone vibrates strongly and begins a 3-second loud siren countdown.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={[styles.stepNum, { color: colors.danger }]}>3.</Text>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                Instantly dials 112 and sends GPS beacon to emergency contacts.
              </Text>
            </View>
          </View>

          {/* Test Shake Button */}
          <Pressable style={styles.testBtn} onPress={handleSimulateShake}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
            <Text style={styles.testBtnText}>TEST SHAKE TRIGGER (SIMULATION)</Text>
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
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  masterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  masterDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  sensitivityRow: {
    gap: 6,
  },
  sensitivityPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sensitivityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  stepNum: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

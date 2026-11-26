import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

const STORAGE_KEY = 'emergency_medical_profile_v1';

export default function EmergencyMedicalCardModal({
  visible,
  onClose,
  userName = 'Traveler',
}) {
  const { theme } = useTheme();
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('None (Penicillin Safe)');
  const [medicalConditions, setMedicalConditions] = useState('None');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43210');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.bloodGroup) setBloodGroup(data.bloodGroup);
        if (data.allergies) setAllergies(data.allergies);
        if (data.medicalConditions) setMedicalConditions(data.medicalConditions);
        if (data.emergencyPhone) setEmergencyPhone(data.emergencyPhone);
      }
    } catch {}
  };

  const handleSave = async () => {
    try {
      const payload = { bloodGroup, allergies, medicalConditions, emergencyPhone };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setIsEditing(false);
      Alert.alert('Saved', 'Emergency Medical Pass updated successfully.');
    } catch {}
  };

  // Generate dynamic QR code data payload containing crucial life-saving medical details
  const qrData = encodeURIComponent(
    `EMERGENCY MEDICAL PASS\nName: ${userName}\nBlood Group: ${bloodGroup}\nEmergency Contact: ${emergencyPhone}\nAllergies: ${allergies}\nConditions: ${medicalConditions}`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=220x220&color=000000&bgcolor=FFFFFF`;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="medkit" size={22} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Emergency Medical Pass</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Scannable life-saving QR ID for first responders
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Scannable QR Code Box */}
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} resizeMode="contain" />
              </View>
              <Text style={styles.qrCaption}>
                Scan in emergency to reveal medical info & instant family contacts
              </Text>
            </View>

            {/* Medical Info Card */}
            <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.infoCardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>PATIENT DETAILS</Text>
                <Pressable onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
                  <Text style={[styles.editLink, { color: theme.primary }]}>
                    {isEditing ? 'Save Details' : 'Edit Details'}
                  </Text>
                </Pressable>
              </View>

              {/* Name */}
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name:</Text>
                <Text style={[styles.fieldValue, { color: theme.text }]}>{userName}</Text>
              </View>

              {/* Blood Group */}
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Blood Group:</Text>
                {isEditing ? (
                  <TextInput
                    value={bloodGroup}
                    onChangeText={setBloodGroup}
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  />
                ) : (
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodBadgeText}>{bloodGroup}</Text>
                  </View>
                )}
              </View>

              {/* Emergency Contact */}
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Guardian Phone:</Text>
                {isEditing ? (
                  <TextInput
                    value={emergencyPhone}
                    onChangeText={setEmergencyPhone}
                    keyboardType="phone-pad"
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.text }]}>{emergencyPhone}</Text>
                )}
              </View>

              {/* Known Allergies */}
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Allergies:</Text>
                {isEditing ? (
                  <TextInput
                    value={allergies}
                    onChangeText={setAllergies}
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: '#EF4444' }]}>{allergies}</Text>
                )}
              </View>

              {/* Medical Conditions */}
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Conditions:</Text>
                {isEditing ? (
                  <TextInput
                    value={medicalConditions}
                    onChangeText={setMedicalConditions}
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.text }]}>{medicalConditions}</Text>
                )}
              </View>
            </View>

            {/* First Responder Instruction */}
            <View style={styles.firstResponderBox}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <Text style={styles.firstResponderText}>
                Official Paramedic & Bystander notice: This pass assists emergency doctors in administering prompt, correct medical treatment.
              </Text>
            </View>
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
    height: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    paddingVertical: 6,
    gap: 12,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  qrCaption: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },
  infoCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  editLink: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  bloodBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bloodBadgeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    minWidth: 120,
    textAlign: 'right',
  },
  firstResponderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  firstResponderText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
  },
});

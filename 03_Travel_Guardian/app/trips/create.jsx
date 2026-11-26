// Travel Guardian - Create Trip Screen
// Simple form to create, validate, and save travel itineraries

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { VEHICLE_OPTIONS } from '../../constants/vehicles';
import { useTheme } from '../../context/ThemeContext';
import { createTrip } from '../../services/tripService';
import { isEmpty } from '../../utils/validation';

export default function CreateTripScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Form states
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hotel, setHotel] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Upcoming'); // 'Upcoming' | 'Active'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Validate form and save trip
  const handleSaveTrip = async () => {
    // 1. Validation
    if (isEmpty(title)) {
      Alert.alert('Validation Error', 'Please enter a trip title (e.g. Summer in Tokyo).');
      return;
    }

    if (isEmpty(destination)) {
      Alert.alert('Validation Error', 'Please enter a destination city or country.');
      return;
    }

    if (isEmpty(startDate)) {
      Alert.alert('Validation Error', 'Please provide a start date (YYYY-MM-DD).');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const tripPayload = {
        title: title.trim(),
        destination: destination.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        hotel: hotel.trim(),
        vehicleType,
        notes: notes.trim(),
        status,
      };

      // Call backend API
      await createTrip(tripPayload);

      Alert.alert(
        'Trip Saved! ✈️',
        `"${title}" has been added to your travel guardian itineraries. Safe travels!`,
        [
          {
            text: 'View Trips',
            onPress: () => router.replace('/trips'),
          },
        ]
      );
    } catch (error) {
      setErrorMsg('Failed to save trip: ' + error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Information */}
      <View style={styles.headerBox}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="airplane" size={28} color={colors.primary} />
        </View>
        <Text style={styles.heading}>Plan a Safe Itinerary</Text>
        <Text style={styles.subheading}>
          Keep your hotel contacts, travel dates, and safety routes organized in one place.
        </Text>
      </View>

      {/* 2. Error Banner */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      )}

      {/* 3. Form Card */}
      <View style={styles.formCard}>
        {/* Title */}
        <Text style={styles.label}>Trip Title *</Text>
        <View style={styles.inputRow}>
          <Ionicons name="briefcase-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Vacation in Kyoto & Osaka"
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Destination */}
        <Text style={styles.label}>Destination City / Country *</Text>
        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Kyoto, Japan"
            placeholderTextColor={colors.textLight}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {/* Dates */}
        <View style={styles.datesGrid}>
          <View style={styles.dateCol}>
            <Text style={styles.label}>Start Date *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textLight}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
          </View>

          <View style={styles.dateCol}>
            <Text style={styles.label}>End Date</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textLight}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        </View>

        {/* Hotel */}
        <Text style={styles.label}>Hotel / Accommodation Address</Text>
        <View style={styles.inputRow}>
          <Ionicons name="bed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Shinjuku Prince Hotel, Tokyo"
            placeholderTextColor={colors.textLight}
            value={hotel}
            onChangeText={setHotel}
          />
        </View>

        {/* Choose Your Vehicle */}
        <Text style={[styles.label, { color: theme.text }]}>Choose Your Vehicle *</Text>
        <Text style={[styles.fieldSubLabel, { color: theme.textSecondary }]}>
          Select your primary travel mode for safety tracking
        </Text>
        <View style={styles.vehicleGrid}>
          {VEHICLE_OPTIONS.map((v) => {
            const isSelected = vehicleType === v.id;
            return (
              <Pressable
                key={v.id}
                style={[
                  styles.vehicleCard,
                  {
                    backgroundColor: isSelected ? theme.primaryLight : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setVehicleType(v.id)}
              >
                <Text style={styles.vehicleIcon}>{v.icon}</Text>
                <Text
                  style={[
                    styles.vehicleLabel,
                    {
                      color: isSelected ? theme.primary : theme.text,
                      fontWeight: isSelected ? 'bold' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {isSelected ? `✓ ${v.label}` : v.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Status Toggle */}
        <Text style={[styles.label, { color: theme.text }]}>Trip Status</Text>
        <View style={styles.statusToggleRow}>
          <Pressable
            style={[
              styles.statusToggleBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              status === 'Upcoming' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setStatus('Upcoming')}
          >
            <Text
              style={[
                styles.statusToggleText,
                { color: theme.textSecondary },
                status === 'Upcoming' && { color: '#FFFFFF', fontWeight: 'bold' },
              ]}
            >
              Upcoming
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.statusToggleBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              status === 'Active' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setStatus('Active')}
          >
            <Text
              style={[
                styles.statusToggleText,
                { color: theme.textSecondary },
                status === 'Active' && { color: '#FFFFFF', fontWeight: 'bold' },
              ]}
            >
              Currently Active
            </Text>
          </Pressable>
        </View>

        {/* Emergency Notes */}
        <Text style={[styles.label, { color: theme.text }]}>Emergency Notes / Guide Contact</Text>
        <TextInput
          style={[
            styles.inputRow,
            styles.textArea,
            { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          ]}
          placeholder="e.g. Local guide: Kenji (+81 90-1234-5678). Embassy address saved."
          placeholderTextColor={theme.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.cancelBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.submitBtn, { backgroundColor: theme.primary }, loading && styles.submitBtnDisabled]}
            onPress={handleSaveTrip}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Save Itinerary</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  datesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCol: {
    flex: 1,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusToggleTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  textArea: {
    height: 90,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fieldSubLabel: {
    fontSize: 11,
    marginTop: -2,
    marginBottom: 8,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  vehicleCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  vehicleIcon: {
    fontSize: 18,
  },
  vehicleLabel: {
    fontSize: 13,
    flex: 1,
  },
});

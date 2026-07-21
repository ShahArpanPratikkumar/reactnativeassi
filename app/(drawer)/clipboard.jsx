import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useSurveys } from '@/context/SurveyContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClipboardScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { surveys } = useSurveys();
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [contactNumber, setContactNumber] = useState('');
  const [pasteNotes, setPasteNotes] = useState('');
  const [clipboardContent, setClipboardContent] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchClipboardContent();
  }, []);

  const fetchClipboardContent = async () => {
    try {
      const content = await Clipboard.getStringAsync();
      setClipboardContent(content);
    } catch (_error) {
      setClipboardContent('');
    }
  };

  const copySurveyId = async () => {
    if (!selectedSurveyId) {
      Alert.alert('Select Survey', 'Please select a survey first.');
      return;
    }
    try {
      await Clipboard.setStringAsync(selectedSurveyId);
      Alert.alert('Copied!', `Survey ID "${selectedSurveyId}" copied to clipboard.`);
    } catch (_error) {
      Alert.alert('Error', 'Failed to copy Survey ID.');
    }
  };

  const copyContactNumber = async () => {
    if (!contactNumber.trim()) {
      Alert.alert('Enter Number', 'Please enter a contact number first.');
      return;
    }
    try {
      await Clipboard.setStringAsync(contactNumber.trim());
      Alert.alert('Copied!', `Contact number "${contactNumber.trim()}" copied to clipboard.`);
    } catch (_error) {
      Alert.alert('Error', 'Failed to copy contact number.');
    }
  };

  const copyCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to copy your position.');
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
      const { latitude, longitude } = loc.coords;
      const locationText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      await Clipboard.setStringAsync(locationText);
      Alert.alert('Copied!', `Current location copied to clipboard.`);
    } catch (_error) {
      Alert.alert('Error', 'Failed to get or copy location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const pasteNotesFromClipboard = async () => {
    try {
      const content = await Clipboard.getStringAsync();
      if (content) {
        setPasteNotes(content);
        setClipboardContent(content);
        Alert.alert('Pasted!', 'Clipboard content pasted into notes.');
      } else {
        Alert.alert('Empty Clipboard', 'No text found in clipboard.');
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to read clipboard.');
    }
  };

  const clearClipboard = async () => {
    try {
      await Clipboard.setStringAsync('');
      setClipboardContent('');
      Alert.alert('Cleared!', 'Clipboard data has been cleared.');
    } catch (_error) {
      Alert.alert('Error', 'Failed to clear clipboard.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Clipboard</Text>
          <Text style={styles.headerSubtitle}>Copy & paste data</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {/* Clipboard Status */}
        <Card title="Clipboard Status" style={styles.card}>
          <View style={styles.clipboardPreviewContainer}>
            <Text style={styles.clipboardPreview}>
              {clipboardContent ? `"${clipboardContent}"` : 'Clipboard is empty'}
            </Text>
          </View>
          <PrimaryButton
            title="Refresh Status"
            onPress={fetchClipboardContent}
            variant="outline"
            icon={'🔄'}
          />
        </Card>

        {/* Copy Survey ID */}
        <Card title="Copy Survey ID" subtitle="Select a survey to copy its ID" style={styles.card}>
          <View style={styles.surveyList}>
            {surveys.map((survey) => (
              <TouchableOpacity
                key={survey.id}
                style={[
                  styles.surveyItem,
                  selectedSurveyId === survey.id && styles.surveyItemActive,
                ]}
                onPress={() => setSelectedSurveyId(survey.id)}
                activeOpacity={0.7}
              >
                <View style={styles.surveyItemContent}>
                  <Text
                    style={[
                      styles.surveyItemSite,
                      selectedSurveyId === survey.id && styles.surveyItemSiteActive,
                    ]}
                  >
                    {survey.siteName}
                  </Text>
                  <Text
                    style={[
                      styles.surveyItemId,
                      selectedSurveyId === survey.id && styles.surveyItemIdActive,
                    ]}
                  >
                    ID: {survey.id}
                  </Text>
                </View>
                {selectedSurveyId === survey.id && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton
            title="Copy Survey ID"
            onPress={copySurveyId}
            icon={'📋'}
          />
        </Card>

        {/* Copy Contact Number */}
        <Card title="Copy Contact Number" subtitle="Enter and copy a contact number" style={styles.card}>
          <Input
            label="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="e.g. +1 234 567 890"
            keyboardType="phone-pad"
            icon="📱"
          />
          <PrimaryButton
            title="Copy Contact Number"
            onPress={copyContactNumber}
            icon={'📞'}
            variant="secondary"
          />
        </Card>

        {/* Copy Current Location */}
        <Card title="Copy Current Location" subtitle="Get GPS and copy coordinates" style={styles.card}>
          {location ? (
            <View style={styles.locationInfo}>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Latitude</Text>
                <Text style={styles.locationValue}>{location.coords.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.locationDivider} />
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Longitude</Text>
                <Text style={styles.locationValue}>{location.coords.longitude.toFixed(6)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Tap below to fetch your current GPS location and copy it.
            </Text>
          )}
          <PrimaryButton
            title="Copy Current Location"
            onPress={copyCurrentLocation}
            icon={'📍'}
            loading={locationLoading}
          />
        </Card>

        {/* Paste Notes */}
        <Card title="Paste Notes" subtitle="Paste clipboard content into notes" style={styles.card}>
          <TextInput
            style={styles.notesInput}
            value={pasteNotes}
            onChangeText={setPasteNotes}
            placeholder="Pasted content will appear here..."
            placeholderTextColor={Colors.light.textSecondary + '99'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <PrimaryButton
            title="Paste from Clipboard"
            onPress={pasteNotesFromClipboard}
            icon={'📋'}
            variant="outline"
          />
        </Card>

        {/* Clear Clipboard */}
        <Card title="Clear Clipboard Data" subtitle="Remove all data from clipboard" style={styles.card}>
          <Text style={styles.warningText}>
            This will clear all text currently stored in the system clipboard.
          </Text>
          <PrimaryButton
            title="Clear Clipboard"
            onPress={clearClipboard}
            icon={'🗑️'}
            variant="danger"
          />
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backIcon: {
    fontSize: 18,
    color: Colors.light.white,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.white,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  clipboardPreviewContainer: {
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  clipboardPreview: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  surveyList: {
    marginBottom: Spacing.lg,
  },
  surveyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.white,
  },
  surveyItemActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  surveyItemContent: {
    flex: 1,
  },
  surveyItemSite: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  surveyItemSiteActive: {
    color: Colors.light.primary,
  },
  surveyItemId: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  surveyItemIdActive: {
    color: Colors.light.primaryDark,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.white,
  },
  locationInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    borderRadius: BorderRadius.lg,
  },
  locationItem: {
    flex: 1,
    alignItems: 'center',
  },
  locationDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.md,
  },
  locationLabel: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  locationValue: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
    fontVariant: ['tabular-nums'],
  },
  placeholderText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  notesInput: {
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    ...Typography.body,
    color: Colors.light.text,
    minHeight: 100,
    marginBottom: Spacing.md,
  },
  warningText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
});

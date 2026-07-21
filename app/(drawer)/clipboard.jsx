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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { useSurveys } from '@/context/SurveyContext';
import { useNavigation } from '@react-navigation/native';

export default function ClipboardScreen() {
  const navigation = useNavigation();
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Clipboard</Text>
          <Text style={styles.headerSubtitle}>Copy &amp; paste data</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Clipboard Status */}
        <Card title="Clipboard Status" style={styles.card}>
          <Text style={styles.clipboardPreview}>
            {clipboardContent ? `"${clipboardContent}"` : 'Clipboard is empty'}
          </Text>
          <PrimaryButton
            title="Refresh Status"
            onPress={fetchClipboardContent}
            variant="outline"
            icon={'\uD83D\uDD04'}
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
                  <Text style={styles.checkmark}>{'\u2713'}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton
            title="Copy Survey ID"
            onPress={copySurveyId}
            icon={'\uD83D\uDCCB'}
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
          />
          <PrimaryButton
            title="Copy Contact Number"
            onPress={copyContactNumber}
            icon={'\uD83D\uDCDE'}
            variant="secondary"
          />
        </Card>

        {/* Copy Current Location */}
        <Card title="Copy Current Location" subtitle="Get GPS and copy coordinates" style={styles.card}>
          {location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Latitude</Text>
              <Text style={styles.locationValue}>{location.coords.latitude.toFixed(6)}</Text>
              <Text style={styles.locationLabel}>Longitude</Text>
              <Text style={styles.locationValue}>{location.coords.longitude.toFixed(6)}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Tap below to fetch your current GPS location and copy it.
            </Text>
          )}
          <PrimaryButton
            title="Copy Current Location"
            onPress={copyCurrentLocation}
            icon={'\uD83D\uDCCD'}
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
            placeholderTextColor={Colors.light.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <PrimaryButton
            title="Paste from Clipboard"
            onPress={pasteNotesFromClipboard}
            icon={'\uD83D\uDCCB'}
            variant="outline"
          />
        </Card>

        {/* Clear Clipboard Data */}
        <Card title="Clear Clipboard Data" subtitle="Remove all data from clipboard" style={styles.card}>
          <Text style={styles.warningText}>
            This will clear all text currently stored in the system clipboard.
          </Text>
          <PrimaryButton
            title="Clear Clipboard"
            onPress={clearClipboard}
            icon={'\uD83D\uDDD1\uFE0F'}
            variant="danger"
          />
        </Card>

        <View style={{ height: 30 }} />
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
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.white,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  clipboardPreview: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
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
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  surveyItemActive: {
    borderColor: Colors.light.primary,
    backgroundColor: '#E8F5E9',
  },
  surveyItemContent: {
    flex: 1,
  },
  surveyItemSite: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  surveyItemSiteActive: {
    color: Colors.light.primary,
  },
  surveyItemId: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  surveyItemIdActive: {
    color: Colors.light.primaryDark,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginLeft: Spacing.md,
  },
  locationInfo: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 100,
    marginBottom: Spacing.md,
  },
  warningText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { useNavigation } from '@react-navigation/native';

export default function LocationScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  const checkPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === 'granted') {
      getCurrentLocation();
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        setErrorMsg('Location permission denied. Please enable it in settings.');
      }
    } catch (_error) {
      setErrorMsg('Failed to request location permission.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);
    } catch (_error) {
      setErrorMsg('Failed to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  const copyToClipboard = async () => {
    if (!location) return;

    const { latitude, longitude } = location.coords;
    const locationText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

    try {
      await Clipboard.setStringAsync(locationText);
      Alert.alert(
        'Copied!',
        'Location has been copied to clipboard successfully.',
        [{ text: 'OK' }]
      );
    } catch (_error) {
      Alert.alert('Error', 'Failed to copy location to clipboard.');
    }
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Location</Text>
            <Text style={styles.headerSubtitle}>Track your position</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.permissionIcon}>{'\uD83D\uDCCD'}</Text>
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need location permission to capture GPS coordinates for your field surveys.
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} />
          ) : (
            <PrimaryButton
              title="Enable Location"
              onPress={requestPermission}
              icon={'\uD83D\uDCCD'}
            />
          )}
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Location</Text>
          <Text style={styles.headerSubtitle}>Track your position</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.scrollContent}>
        {/* Map Placeholder */}
        <Card style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>{'\uD83C\uDF0D'}</Text>
            <Text style={styles.mapText}>GPS Location Tracker</Text>
            {location ? (
              <Text style={styles.mapCoords}>
                {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            ) : null}
          </View>
        </Card>

        {/* Location Data */}
        {loading && !location ? (
          <Card style={styles.dataCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Fetching location...</Text>
            </View>
          </Card>
        ) : location ? (
          <>
            <Card title="Coordinates" style={styles.dataCard}>
              <View style={styles.coordRow}>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={styles.coordValue}>{location.coords.latitude.toFixed(6)}</Text>
                  <Text style={styles.coordDirection}>
                    {location.coords.latitude >= 0 ? 'N' : 'S'}
                  </Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={styles.coordValue}>{location.coords.longitude.toFixed(6)}</Text>
                  <Text style={styles.coordDirection}>
                    {location.coords.longitude >= 0 ? 'E' : 'W'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card title="Accuracy" style={styles.dataCard}>
              <View style={styles.accuracyContainer}>
                <View style={styles.accuracyRing}>
                  <Text style={styles.accuracyValue}>
                    {location.coords.accuracy ? `${location.coords.accuracy.toFixed(1)}` : 'N/A'}
                  </Text>
                  <Text style={styles.accuracyUnit}>meters</Text>
                </View>
                <View style={styles.accuracyInfo}>
                  <Text style={styles.accuracyLabel}>GPS Accuracy</Text>
                  <Text style={styles.accuracyDescription}>
                    {location.coords.accuracy && location.coords.accuracy < 10
                      ? 'Excellent accuracy'
                      : location.coords.accuracy && location.coords.accuracy < 30
                      ? 'Good accuracy'
                      : 'Low accuracy - try moving to open area'}
                  </Text>
                </View>
              </View>
            </Card>

            {location.timestamp ? (
              <Card title="Timestamp" style={styles.dataCard}>
                <Text style={styles.timestamp}>
                  {new Date(location.timestamp).toLocaleString()}
                </Text>
              </Card>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <PrimaryButton
                title="Refresh Location"
                onPress={refreshLocation}
                icon={'\uD83D\uDD04'}
                loading={loading}
              />
              <View style={{ height: Spacing.md }} />
              <PrimaryButton
                title="Copy to Clipboard"
                onPress={copyToClipboard}
                icon={'\uD83D\uDCCB'}
                variant="secondary"
              />
            </View>
          </>
        ) : errorMsg ? (
          <Card style={styles.dataCard}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>{'\u26A0\uFE0F'}</Text>
              <Text style={styles.errorTitle}>Unable to get location</Text>
              <Text style={styles.errorMessage}>{errorMsg}</Text>
              <PrimaryButton
                title="Try Again"
                onPress={getCurrentLocation}
                variant="outline"
              />
            </View>
          </Card>
        ) : null}

        <View style={{ height: 30 }} />
      </View>
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  mapCard: {
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primaryDark,
  },
  mapCoords: {
    fontSize: 13,
    color: Colors.light.primary,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  dataCard: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordItem: {
    flex: 1,
    alignItems: 'center',
  },
  coordDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.lg,
  },
  coordLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  coordValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    fontVariant: ['tabular-nums'],
  },
  coordDirection: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xl,
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  accuracyUnit: {
    fontSize: 9,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  accuracyInfo: {
    flex: 1,
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  accuracyDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.error,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

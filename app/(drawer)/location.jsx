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
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LocationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      Alert.alert('Error', 'Failed to copy location to clipboard.');
    }
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📍 Location</Text>
            <Text style={styles.headerSubtitle}>Track your position</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <View style={styles.permissionIconContainer}>
            <Text style={styles.permissionIcon}>📍</Text>
          </View>
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need location permission to capture GPS coordinates for your field surveys.
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} />
          ) : (
            <PrimaryButton title="Enable Location" onPress={requestPermission} />
          )}
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📍 Location</Text>
          <Text style={styles.headerSubtitle}>Track your position</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.scrollContent}>
        <Card style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>🌍</Text>
            <Text style={styles.mapText}>GPS Location Tracker</Text>
            {location ? (
              <Text style={styles.mapCoords}>
                {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            ) : null}
          </View>
        </Card>

        {loading && !location ? (
          <Card style={styles.dataCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Fetching location...</Text>
            </View>
          </Card>
        ) : location ? (
          <>
            <Card title="🧭 Coordinates" style={styles.dataCard}>
              <View style={styles.coordRow}>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={styles.coordValue}>{location.coords.latitude.toFixed(6)}</Text>
                  <Text style={styles.coordDirection}>
                    {location.coords.latitude >= 0 ? 'North' : 'South'}
                  </Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={styles.coordValue}>{location.coords.longitude.toFixed(6)}</Text>
                  <Text style={styles.coordDirection}>
                    {location.coords.longitude >= 0 ? 'East' : 'West'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card title="🎯 Accuracy" style={styles.dataCard}>
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
              <Card title="🕐 Timestamp" style={styles.dataCard}>
                <Text style={styles.timestamp}>
                  {new Date(location.timestamp).toLocaleString()}
                </Text>
              </Card>
            ) : null}

            <View style={styles.actionsContainer}>
              <PrimaryButton
                title="Refresh Location"
                onPress={refreshLocation}
                icon={'🔄'}
                loading={loading}
              />
              <View style={{ height: Spacing.md }} />
              <PrimaryButton
                title={copied ? '✓ Copied!' : 'Copy to Clipboard'}
                onPress={copyToClipboard}
                icon={copied ? '✓' : '📋'}
                variant={copied ? 'secondary' : 'secondary'}
              />
            </View>
          </>
        ) : errorMsg ? (
          <Card style={styles.dataCard}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Unable to get location</Text>
              <Text style={styles.errorMessage}>{errorMsg}</Text>
              <PrimaryButton title="Try Again" onPress={getCurrentLocation} variant="outline" />
            </View>
          </Card>
        ) : null}

        <View style={{ height: 100 }} />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  permissionIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  permissionIcon: {
    fontSize: 48,
  },
  permissionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionMessage: {
    ...Typography.body,
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
    height: 160,
    backgroundColor: '#F0FAF0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  mapIcon: {
    fontSize: 44,
    marginBottom: Spacing.sm,
  },
  mapText: {
    ...Typography.bodySemibold,
    color: '#2E7D32',
  },
  mapCoords: {
    ...Typography.captionMedium,
    color: '#2E7D32',
    marginTop: Spacing.xs,
  },
  dataCard: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    ...Typography.body,
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
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  coordValue: {
    ...Typography.h3,
    color: Colors.light.text,
    fontVariant: ['tabular-nums'],
  },
  coordDirection: {
    ...Typography.captionMedium,
    color: Colors.light.primary,
    marginTop: 4,
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDF4',
    borderWidth: 3,
    borderColor: Colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xl,
  },
  accuracyValue: {
    ...Typography.h4,
    color: Colors.light.success,
  },
  accuracyUnit: {
    ...Typography.small,
    color: Colors.light.success,
  },
  accuracyInfo: {
    flex: 1,
  },
  accuracyLabel: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  accuracyDescription: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  timestamp: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
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
    fontSize: 44,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    color: Colors.light.error,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

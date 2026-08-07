import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { formatDateTime } from '@/utils/helper';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSurveys } from '@/context/SurveyContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const navigation = useNavigation();
  const { capturedPhoto, setCapturedPhoto } = useSurveys();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(capturedPhoto || null);
  const [captureTime, setCaptureTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (permission && permission.granted) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCameraReady(true);
      }, 1000);
    }
  }, [permission]);

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      setLoading(true);
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      setPhoto(result.uri);
      setCaptureTime(new Date().toISOString());
      setCameraReady(false);
    } catch (_error) {
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setCaptureTime(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCameraReady(true);
    }, 500);
  };

  const deletePhoto = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhoto(null);
            setCaptureTime(null);
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setCameraReady(true);
            }, 500);
          },
        },
      ]
    );
  };

  const usePhoto = () => {
    if (photo) {
      setCapturedPhoto(photo);
      Alert.alert('Photo Saved', 'Your photo has been saved and will be attached to the next survey.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📷 Camera</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading camera permissions...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📷 Camera</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <View style={styles.permissionIconContainer}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need camera permission to capture site photos for your field surveys.
          </Text>
          <PrimaryButton
            title="Grant Camera Permission"
            onPress={requestPermission}
          />
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
          <Text style={styles.headerTitle}>📷 Camera</Text>
          <Text style={styles.headerSubtitle}>Capture site photos</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} />

          <View style={styles.timeBanner}>
            <Text style={styles.timeLabel}>⏰ Captured at</Text>
            <Text style={styles.timeValue}>{captureTime ? formatDateTime(captureTime) : ''}</Text>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto} activeOpacity={0.7}>
              <Text style={styles.retakeIcon}>🔄</Text>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.usePhotoButton} onPress={usePhoto} activeOpacity={0.7}>
              <Text style={styles.usePhotoIcon}>✓</Text>
              <Text style={styles.usePhotoText}>Use Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={deletePhoto} activeOpacity={0.7}>
              <Text style={styles.deleteIcon}>🗑️</Text>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onCameraReady={() => {
              setCameraReady(true);
              setLoading(false);
            }}
          >
            <View style={styles.viewfinderOverlay}>
              <View style={styles.viewfinderCorner} />
              <View style={[styles.viewfinderCorner, styles.topRight]} />
              <View style={[styles.viewfinderCorner, styles.bottomLeft]} />
              <View style={[styles.viewfinderCorner, styles.bottomRight]} />
            </View>

            {loading && (
              <View style={styles.cameraLoading}>
                <ActivityIndicator size="large" color={Colors.light.white} />
                <Text style={styles.cameraLoadingText}>Opening Camera...</Text>
              </View>
            )}

            <View style={styles.cameraControls}>
              <View style={styles.controlSpacer} />
              <TouchableOpacity
                style={[styles.captureButton, (!cameraReady || loading) && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={!cameraReady || loading}
                activeOpacity={0.7}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              <View style={styles.controlSpacer} />
            </View>
          </CameraView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    backgroundColor: Colors.light.background,
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
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  viewfinderOverlay: {
    flex: 1,
    margin: 40,
  },
  viewfinderCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.light.white,
  },
  topRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    top: undefined,
    left: undefined,
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cameraLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLoadingText: {
    color: Colors.light.white,
    ...Typography.bodyMedium,
    marginTop: Spacing.md,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: Spacing.xl,
  },
  controlSpacer: {
    width: 70,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: Colors.light.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  captureButtonDisabled: {
    opacity: 0.4,
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.light.white,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  timeBanner: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  timeLabel: {
    ...Typography.smallMedium,
    color: 'rgba(255,255,255,0.6)',
  },
  timeValue: {
    ...Typography.bodyMedium,
    color: Colors.light.white,
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xl,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  retakeButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  retakeIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  retakeText: {
    color: Colors.light.white,
    ...Typography.smallMedium,
  },
  usePhotoButton: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
  },
  usePhotoIcon: {
    fontSize: 24,
    color: Colors.light.white,
    marginBottom: Spacing.xs,
  },
  usePhotoText: {
    color: Colors.light.white,
    ...Typography.smallMedium,
  },
  deleteBtn: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  deleteIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  deleteText: {
    color: Colors.light.error,
    ...Typography.smallMedium,
  },
});

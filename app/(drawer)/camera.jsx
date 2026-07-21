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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { formatDateTime } from '@/utils/helper';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSurveys } from '@/context/SurveyContext';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const navigation = useNavigation();
  const { capturedPhoto, setCapturedPhoto } = useSurveys();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(capturedPhoto || null);
  const [captureTime, setCaptureTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Camera</Text>
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Camera</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.permissionIcon}>{'\uD83D\uDCF7'}</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need camera permission to capture site photos for your field surveys.
          </Text>
          <PrimaryButton
            title="Grant Camera Permission"
            onPress={requestPermission}
            icon={'\uD83D\uDC64'}
          />
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
          <Text style={styles.headerTitle}>Camera</Text>
          <Text style={styles.headerSubtitle}>Capture site photos</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {photo ? (
        /* Preview Mode */
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} />

          {/* Capture Time Banner */}
          <View style={styles.timeBanner}>
            <Text style={styles.timeLabel}>{'\u23F0'} Captured at</Text>
            <Text style={styles.timeValue}>{captureTime ? formatDateTime(captureTime) : ''}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto} activeOpacity={0.7}>
              <Text style={styles.retakeIcon}>{'\uD83D\uDD04'}</Text>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.usePhotoButton} onPress={usePhoto} activeOpacity={0.7}>
              <Text style={styles.usePhotoIcon}>{'\u2713'}</Text>
              <Text style={styles.usePhotoText}>Use Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={deletePhoto} activeOpacity={0.7}>
              <Text style={styles.deleteIcon}>{'\uD83D\uDDD1'}</Text>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Camera Mode */
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
            {/* Viewfinder Overlay */}
            <View style={styles.viewfinderOverlay}>
              <View style={styles.viewfinderCorner} />
              <View style={[styles.viewfinderCorner, styles.topRight]} />
              <View style={[styles.viewfinderCorner, styles.bottomLeft]} />
              <View style={[styles.viewfinderCorner, styles.bottomRight]} />
            </View>

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.cameraLoading}>
                <ActivityIndicator size="large" color={Colors.light.white} />
                <Text style={styles.cameraLoadingText}>Opening Camera...</Text>
              </View>
            )}

            {/* Bottom Controls */}
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
    backgroundColor: Colors.light.background,
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
  loadingText: {
    fontSize: 14,
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
    fontSize: 16,
    marginTop: Spacing.md,
    fontWeight: '500',
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
    width: 72,
    height: 72,
    borderRadius: 36,
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
    width: 58,
    height: 58,
    borderRadius: 29,
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 15,
    color: Colors.light.white,
    fontWeight: '600',
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xl,
    paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.9)',
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
    fontSize: 13,
    fontWeight: '600',
  },
  usePhotoButton: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
  },
  usePhotoIcon: {
    fontSize: 24,
    color: Colors.light.white,
    marginBottom: Spacing.xs,
  },
  usePhotoText: {
    color: Colors.light.white,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  deleteIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  deleteText: {
    color: Colors.light.error,
    fontSize: 13,
    fontWeight: '600',
  },
});

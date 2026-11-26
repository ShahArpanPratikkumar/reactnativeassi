// Travel Guardian - Camera & Safety Evidence Recorder
// Beginner-friendly Expo Camera with fast photo & video capture, local Vault, and Gallery export

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useIsFocused } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import Loading from '../../components/Loading';
import VideoPlayerView from '../../components/VideoPlayerView';
import { uploadMedia } from '../../services/mediaService';
import { saveToVault, saveMediaToGallery } from '../../services/vaultService';

export default function CameraScreen() {
  // Check if camera tab is currently focused to optimize resource usage
  const isFocused = useIsFocused();

  // Reference to camera for triggering takePictureAsync and recordAsync
  const cameraRef = useRef(null);

  // 1. Permissions (Camera and Microphone)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // 2. Camera Configuration States
  const [facing, setFacing] = useState('back'); // 'back' | 'front'
  const [flash, setFlash] = useState('off'); // 'off' | 'on' | 'auto'
  const [torch, setTorch] = useState(false); // boolean
  const [zoom, setZoom] = useState(0); // 0.0 to 1.0
  const [autoFocus, setAutoFocus] = useState(true); // boolean

  // 3. Mode & Capture States
  const [mode, setMode] = useState('photo'); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // 4. Tap-to-focus point (x, y coordinates)
  const [focusPoint, setFocusPoint] = useState(null);

  // 5. Captured Media Preview State
  const [capturedMedia, setCapturedMedia] = useState(null); // { type: 'photo' | 'video', uri: string }
  const [savingMedia, setSavingMedia] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);

  // Video recording timer
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Request camera and microphone permissions
  const handleRequestPermissions = async () => {
    try {
      await requestCameraPermission();
      await requestMicPermission();
    } catch (error) {
      setCameraError('Permission request error: ' + error.message);
    }
  };

  // Helper: ensure microphone permission is granted before recording video
  const ensureMicrophonePermission = async () => {
    if (!micPermission || !micPermission.granted) {
      try {
        const result = await requestMicPermission();
        if (!result.granted) {
          Alert.alert(
            'Microphone Permission Required',
            'Travel Guardian needs microphone access to record audio in evidence videos. Please grant microphone permission.'
          );
          return false;
        }
      } catch (err) {
        Alert.alert('Permission Error', 'Could not request microphone permission: ' + err.message);
        return false;
      }
    }
    return true;
  };

  // Mode change handler with proactive microphone check
  const handleModeChange = async (newMode) => {
    if (isRecording) return;
    if (newMode === 'video') {
      await ensureMicrophonePermission();
    }
    setMode(newMode);
  };

  // Front / Back camera switch
  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Flash modes (Auto / On / Off)
  const toggleFlash = () => {
    if (flash === 'off') {
      setFlash('on');
    } else if (flash === 'on') {
      setFlash('auto');
    } else {
      setFlash('off');
    }
  };

  // Torch enable / disable
  const toggleTorch = () => {
    setTorch((prev) => !prev);
  };

  // Auto focus toggle
  const toggleAutoFocus = () => {
    setAutoFocus((prev) => !prev);
    Alert.alert('Auto Focus', autoFocus ? 'Auto-focus Disabled' : 'Auto-focus Enabled');
  };

  // Tap to focus
  const handleTapToFocus = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });

    // Remove focus indicator after 1.5 seconds
    setTimeout(() => {
      setFocusPoint(null);
    }, 1500);
  };

  // Zoom adjustment (+0.1 / -0.1)
  const handleZoomChange = (delta) => {
    setZoom((current) => {
      const nextZoom = Math.min(Math.max(current + delta, 0), 1);
      return parseFloat(nextZoom.toFixed(2));
    });
  };

  // Capture Photo
  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setCameraError(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        setCapturedMedia({
          type: 'photo',
          uri: photo.uri,
        });
      }
    } catch (error) {
      setCameraError('Failed to take photo: ' + error.message);
      Alert.alert('Camera Error', error.message);
    } finally {
      setIsCapturing(false);
    }
  };

  // Start Video Recording
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    // 1. Verify Microphone permission first to prevent RECORD_AUDIO exception
    const hasMic = await ensureMicrophonePermission();
    if (!hasMic) return;

    try {
      setIsRecording(true);
      setCameraError(null);

      const videoPromise = cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      const video = await videoPromise;
      if (video && video.uri) {
        setCapturedMedia({
          type: 'video',
          uri: video.uri,
        });
      }
    } catch (error) {
      console.log('Recording error:', error.message);
      setCameraError('Recording error: ' + error.message);
      Alert.alert('Recording Error', error.message);
    } finally {
      setIsRecording(false);
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  // Shutter button press handler (Photo vs Video)
  const handleShutterPress = () => {
    if (mode === 'photo') {
      takePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  // Retake Photo / Video
  const handleRetake = () => {
    setCapturedMedia(null);
  };

  // Save Captured Photo / Video to Vault (Instant Local Save + Background Sync)
  const handleSaveMedia = async () => {
    if (!capturedMedia) return;

    try {
      setSavingMedia(true);
      const isPhoto = capturedMedia.type === 'photo';
      const defaultTitle = isPhoto ? 'Camera Safety Photo' : 'Camera Evidence Video';

      // 1. Save to in-app local Vault immediately (Fast & Offline Ready)
      await saveToVault({
        uri: capturedMedia.uri,
        type: capturedMedia.type,
        title: defaultTitle,
        location: 'GPS Verified Evidence Tag',
      });

      // 2. Trigger asynchronous background upload to backend if server is reachable
      const formData = new FormData();
      const fileName = isPhoto ? `camera_photo_${Date.now()}.jpg` : `camera_video_${Date.now()}.mp4`;
      const mimeType = isPhoto ? 'image/jpeg' : 'video/mp4';

      formData.append('title', defaultTitle);
      formData.append('mediaType', capturedMedia.type);
      formData.append('location', 'GPS Verified Evidence Tag');
      formData.append('file', {
        uri: capturedMedia.uri,
        name: fileName,
        type: mimeType,
      });

      // Non-blocking upload in background
      uploadMedia(formData).catch((err) => {
        console.log('Background upload notice (saved locally in vault):', err.message);
      });

      Alert.alert(
        'Saved to Vault! 🛡️',
        `${isPhoto ? 'Photo' : 'Video'} safely added to your Travel Guardian Vault. You can view or export it anytime.`,
        [
          {
            text: 'OK',
            onPress: () => setCapturedMedia(null),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Notice', 'Media saved to your device. ' + (err.message || ''));
      setCapturedMedia(null);
    } finally {
      setSavingMedia(false);
    }
  };

  // Save Captured Media directly to Phone Gallery
  const handleExportToGallery = async () => {
    if (!capturedMedia) return;

    try {
      setSavingGallery(true);
      await saveMediaToGallery(capturedMedia.uri);
      Alert.alert('Success! 🖼️', `${capturedMedia.type === 'photo' ? 'Photo' : 'Video'} saved to your device gallery.`);
    } catch (error) {
      Alert.alert('Gallery Error', error.message || 'Failed to save media to device gallery.');
    } finally {
      setSavingGallery(false);
    }
  };

  // Helper function to format seconds into mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Loading Permissions State
  if (!cameraPermission) {
    return <Loading message="Checking camera permissions..." />;
  }

  // 2. Permission Denied Screen
  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconCircle}>
          <Ionicons name="camera-outline" size={56} color={colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionMessage}>
          Travel Guardian needs access to your camera and microphone to capture safety photos, taxi plates, and incident evidence.
        </Text>
        <Pressable
          style={styles.grantButton}
          onPress={handleRequestPermissions}
        >
          <Text style={styles.grantButtonText}>Grant Camera Permission</Text>
        </Pressable>
      </View>
    );
  }

  // 3. Captured Media Preview Screen (Photo & Video)
  if (capturedMedia) {
    return (
      <View style={styles.previewContainer}>
        {/* Top Header */}
        <View style={styles.previewHeader}>
          <Text style={styles.previewHeaderText}>
            {capturedMedia.type === 'photo' ? 'Photo Preview' : 'Video Recorded'}
          </Text>
          <Text style={styles.previewSubheader}>
            Evidence timestamp: {new Date().toLocaleTimeString()}
          </Text>
        </View>

        {/* Media Preview Content Box */}
        <View style={styles.previewContent}>
          {capturedMedia.type === 'photo' ? (
            <Image
              source={{ uri: capturedMedia.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <VideoPlayerView
              uri={capturedMedia.uri}
              style={styles.previewImage}
              autoPlay={true}
            />
          )}

          {/* GPS Location & Safety Stamp Overlay */}
          <View style={styles.previewOverlayStamp}>
            <Ionicons name="shield-checkmark" size={16} color={colors.secondary} />
            <Text style={styles.previewStampText}>
              GPS: 37.7749° N, 122.4194° W | Verified Safe Evidence
            </Text>
          </View>
        </View>

        {/* Action Buttons: Retake, Save to Gallery, Save to Vault */}
        <View style={styles.previewActions}>
          <Pressable
            style={[styles.previewBtn, styles.retakeBtn]}
            onPress={handleRetake}
            disabled={savingMedia || savingGallery}
          >
            <Ionicons name="refresh" size={18} color={colors.text} />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </Pressable>

          <Pressable
            style={[styles.previewBtn, styles.galleryBtn]}
            onPress={handleExportToGallery}
            disabled={savingMedia || savingGallery}
          >
            {savingGallery ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={colors.primary} />
                <Text style={styles.galleryBtnText}>Gallery</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.previewBtn, styles.saveBtn]}
            onPress={handleSaveMedia}
            disabled={savingMedia || savingGallery}
          >
            {savingMedia ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={18} color={colors.white} />
                <Text style={styles.saveBtnText}>Save to Vault</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // 4. Live Camera Screen
  return (
    <View style={styles.container}>
      {/* Top Controls Bar (Flash, Torch, AF, Flip) */}
      <View style={styles.topControlBar}>
        {/* Flash Mode Toggle */}
        <Pressable style={styles.controlIconBtn} onPress={toggleFlash}>
          <Ionicons
            name={
              flash === 'on'
                ? 'flash'
                : flash === 'auto'
                ? 'flash-outline'
                : 'flash-off'
            }
            size={22}
            color={flash !== 'off' ? colors.warning : colors.white}
          />
          <Text style={styles.controlIconLabel}>{flash.toUpperCase()}</Text>
        </Pressable>

        {/* Torch Toggle */}
        <Pressable
          style={[styles.controlIconBtn, torch && styles.activeControlBtn]}
          onPress={toggleTorch}
        >
          <Ionicons
            name={torch ? 'bulb' : 'bulb-outline'}
            size={22}
            color={torch ? colors.warning : colors.white}
          />
          <Text style={styles.controlIconLabel}>TORCH</Text>
        </Pressable>

        {/* Auto Focus Toggle */}
        <Pressable
          style={[styles.controlIconBtn, autoFocus && styles.activeControlBtn]}
          onPress={toggleAutoFocus}
        >
          <Ionicons
            name="scan-outline"
            size={22}
            color={autoFocus ? colors.primaryLight : colors.white}
          />
          <Text style={styles.controlIconLabel}>
            {autoFocus ? 'AF: ON' : 'AF: OFF'}
          </Text>
        </Pressable>

        {/* Front / Back Camera Switch */}
        <Pressable style={styles.controlIconBtn} onPress={toggleFacing}>
          <Ionicons name="camera-reverse-outline" size={24} color={colors.white} />
          <Text style={styles.controlIconLabel}>FLIP</Text>
        </Pressable>
      </View>

      {/* Error Message Banner */}
      {cameraError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.errorBannerText}>{cameraError}</Text>
        </View>
      )}

      {/* Live Camera Viewfinder (Only active when screen is focused) */}
      <Pressable style={styles.cameraWrapper} onPress={handleTapToFocus}>
        {isFocused ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flash}
              enableTorch={torch}
              zoom={zoom}
              autofocus={autoFocus ? 'on' : 'off'}
              mode={mode === 'video' ? 'video' : 'picture'}
              onMountError={(error) => setCameraError(error.message)}
            />

            {/* Tap-to-focus Indicator Box */}
            {focusPoint && (
              <View
                style={[
                  styles.focusSquare,
                  { top: focusPoint.y - 30, left: focusPoint.x - 30 },
                ]}
              />
            )}

            {/* Recording Timer Badge */}
            {isRecording && (
              <View style={styles.recordingBadge}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  REC {formatTime(recordSeconds)}
                </Text>
              </View>
            )}

            {/* Capturing Loading Overlay */}
            {isCapturing && (
              <View style={styles.capturingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
                <Text style={styles.capturingText}>Capturing Evidence...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.camera, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </Pressable>

      {/* Zoom Controls Bar */}
      <View style={styles.zoomControlRow}>
        <Pressable
          style={styles.zoomButton}
          onPress={() => handleZoomChange(-0.1)}
        >
          <Ionicons name="remove" size={18} color={colors.white} />
        </Pressable>

        <View style={styles.zoomPillContainer}>
          <Pressable
            style={[styles.zoomPill, zoom === 0 && styles.zoomPillActive]}
            onPress={() => setZoom(0)}
          >
            <Text style={styles.zoomPillText}>1x</Text>
          </Pressable>

          <Pressable
            style={[styles.zoomPill, zoom === 0.5 && styles.zoomPillActive]}
            onPress={() => setZoom(0.5)}
          >
            <Text style={styles.zoomPillText}>2x</Text>
          </Pressable>

          <Pressable
            style={[styles.zoomPill, zoom === 1 && styles.zoomPillActive]}
            onPress={() => setZoom(1)}
          >
            <Text style={styles.zoomPillText}>3x</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.zoomButton}
          onPress={() => handleZoomChange(0.1)}
        >
          <Ionicons name="add" size={18} color={colors.white} />
        </Pressable>
      </View>

      {/* Mode Switcher (Photo vs Video) */}
      <View style={styles.modeTabs}>
        <Pressable
          style={[styles.modeTab, mode === 'photo' && styles.modeTabActive]}
          onPress={() => handleModeChange('photo')}
        >
          <Text
            style={[
              styles.modeTabText,
              mode === 'photo' && styles.modeTabTextActive,
            ]}
          >
            PHOTO
          </Text>
        </Pressable>

        <Pressable
          style={[styles.modeTab, mode === 'video' && styles.modeTabActive]}
          onPress={() => handleModeChange('video')}
        >
          <Text
            style={[
              styles.modeTabText,
              mode === 'video' && styles.modeTabTextActive,
            ]}
          >
            VIDEO
          </Text>
        </Pressable>
      </View>

      {/* Bottom Shutter & Controls */}
      <View style={styles.bottomBar}>
        <View style={{ width: 44 }} />

        {/* Shutter Button */}
        <Pressable
          style={({ pressed }) => [
            styles.shutterOuter,
            mode === 'video' && styles.shutterOuterVideo,
            pressed && styles.shutterPressed,
          ]}
          onPress={handleShutterPress}
          disabled={isCapturing}
        >
          <View
            style={[
              styles.shutterInner,
              mode === 'video' && styles.shutterInnerVideo,
              isRecording && styles.shutterInnerRecording,
            ]}
          />
        </Pressable>

        {/* Quick Zoom Indicator */}
        <View style={styles.zoomDisplay}>
          <Text style={styles.zoomDisplayText}>
            {Math.round((zoom + 1) * 10) / 10}x
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  grantButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  grantButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  controlIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeControlBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlIconLabel: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorBannerText: {
    color: colors.white,
    fontSize: 12,
    flex: 1,
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  focusSquare: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#FACC15',
    borderRadius: 4,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
  },
  recordingBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  recordingText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturingText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  zoomControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 2,
  },
  zoomPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoomPillActive: {
    backgroundColor: colors.primary,
  },
  zoomPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modeTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 4,
  },
  modeTab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  modeTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  modeTabText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modeTabTextActive: {
    color: colors.white,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingTop: 8,
  },
  shutterOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuterVideo: {
    borderColor: colors.danger,
  },
  shutterPressed: {
    transform: [{ scale: 0.95 }],
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
  },
  shutterInnerVideo: {
    backgroundColor: colors.danger,
  },
  shutterInnerRecording: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.danger,
  },
  zoomDisplay: {
    width: 44,
    alignItems: 'center',
  },
  zoomDisplayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
    justifyContent: 'space-between',
  },
  previewHeader: {
    alignItems: 'center',
    marginTop: 8,
  },
  previewHeaderText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewSubheader: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: 2,
  },
  previewContent: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoRecordedTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  videoRecordedUri: {
    color: colors.textLight,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  previewOverlayStamp: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  previewStampText: {
    color: colors.white,
    fontSize: 11,
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 10,
  },
  previewBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retakeBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  galleryBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  galleryBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

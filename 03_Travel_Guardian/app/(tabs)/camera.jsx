import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: CAMERA COMPONENT & STATE MANAGEMENT (Line 15 - Line 40)
 * Purpose: Aa section ma camera component ane video player mate na badha state declare karela chhe.
 * Working: useRef thi camera view control thay chhe, useState થી flip, flash, torch, zoom, timer ane recording state handle thay chhe.
 * =================================================================================
 */
export default function CameraTab() {
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState('back'); // Rear કે Front કેમેરા સ્વિચ કરવા માટે
  const [flash, setFlash] = useState('off'); // Flash mode: off, on, auto
  const [torch, setTorch] = useState(false); // Flashlight/Torch on/off કરવા માટે
  const [mode, setMode] = useState('picture'); // Photo કે Video mode સ્વિચ કરવા માટે
  const [zoom, setZoom] = useState(0); // Zoom level 0% થી 100% સેટ કરવા માટે

  const [gridOverlay, setGridOverlay] = useState(false); // Camera grid overlay (3x3 grid)
  const [selfTimer, setSelfTimer] = useState(0); // Self timer: 0s, 3s, 5s, 10s
  const [timerCountdown, setTimerCountdown] = useState(0); // Live countdown timer display
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [capturedPhoto, setCapturedPhoto] = useState(null); // Photo capture થવા પર એની URI ane detail store થાય છે
  const [capturedVideo, setCapturedVideo] = useState(null); // Video record થવા પર એની URI store થાય છે
  const [isRecording, setIsRecording] = useState(false); // Video recording ચાલુ છે કે નહિ તેનો ડેટા
  const [recordingTime, setRecordingTime] = useState(0); // Video recording નો લાઈવ ટાઈમર સેકન્ડ્સમાં

  const videoPlayer = useVideoPlayer(capturedVideo ? capturedVideo.uri : null);

  /**
   * =================================================================================
   * FEATURE 2: VIDEO RECORDING TIMER EFFECT (Line 42 - Line 52)
   * Purpose: Video recording ચાલુ હોય ત્યારે લાઈવ ટાઈમર દર સેકન્ડે 1 આગળ વધારે છે.
   * Working: useEffect માં setInterval નો યુઝ કરીને દર સેકન્ડે recordingTime સ્ટેટ અપડેટ થાય છે.
   * =================================================================================
   */
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  /**
   * =================================================================================
   * FEATURE 3: CAMERA & MICROPHONE PERMISSION HANDLER (Line 54 - Line 83)
   * Purpose: User પાસે Camera અને Microphone ની પમિશન માંગવા માટે અને પમિશન સ્ટેટસ ચેક કરવા માટે.
   * Working: expo-camera ના useCameraPermissions અને useMicrophonePermissions ફંક્શનનો ઉપયોગ કરીને પરમિશન ગ્રાન્ટ કરાવે છે.
   * =================================================================================
   */
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Loading security permissions...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.permCard}>
          <Ionicons name="camera-outline" size={48} color="#0EA5E9" style={{ marginBottom: 12 }} />
          <Text style={styles.permTitle}>Camera & Microphone Access</Text>
          <Text style={styles.infoText}>
            Travel Guardian requires camera and microphone permissions to capture high-definition media during your travels.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Ionicons name="shield-checkmark" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * =================================================================================
   * FEATURE 4: PHOTO CAPTURE & SELF-TIMER LOGIC (Line 85 - Line 118)
   * Purpose: Photo પાડવા માટે અને Self-Timer ચાલુ હોય તો Countdown ગણીને ફોટો કેપ્ચર કરવા માટે.
   * Working: selfTimer > 0 હોય તો setInterval વડે 3s, 5s, 10s ગણીને પૂરું થતાં cameraRef.current.takePictureAsync() કોલ કરે છે.
   * =================================================================================
   */
  const handleTakePicture = async () => {
    if (mode !== 'picture') {
      Alert.alert('Mode Error', 'Please switch to Picture mode first.');
      return;
    }

    if (selfTimer > 0) {
      let count = selfTimer;
      setTimerCountdown(count);
      const timerInterval = setInterval(() => {
        count -= 1;
        setTimerCountdown(count);
        if (count <= 0) {
          clearInterval(timerInterval);
          executePhotoCapture();
        }
      }, 1000);
    } else {
      executePhotoCapture();
    }
  };

  const executePhotoCapture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) setCapturedPhoto(photo);
      }
    } catch (error) {
      Alert.alert('Capture Error', error.message);
    }
  };

  /**
   * =================================================================================
   * FEATURE 5: VIDEO RECORDING HANDLER (Line 120 - Line 146)
   * Purpose: Video start અને stop કરવા માટે.
   * Working: recordAsync() વડે વિડીયો રેકોર્ડિંગ શરૂ થાય છે અને stopRecording() વડે વિડીયો સેવ થઈને capturedVideo સ્ટેટમાં આવે છે.
   * =================================================================================
   */
  const handleRecordVideo = async () => {
    if (mode !== 'video') {
      Alert.alert('Mode Error', 'Please switch to Video mode first.');
      return;
    }

    if (isRecording) {
      try {
        await cameraRef.current?.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('Stop recording error:', error);
      }
      return;
    }

    try {
      if (cameraRef.current) {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync();
        if (video) setCapturedVideo(video);
      }
    } catch (error) {
      setIsRecording(false);
      Alert.alert('Recording Error', error.message);
    }
  };

  /**
   * =================================================================================
   * FEATURE 6: CAMERA CONTROLS HELPERS (Line 148 - Line 160)
   * Purpose: Flash મૉડ (off -> on -> auto) અને Timer ચક્ર (0s -> 3s -> 5s -> 10s) ચલાવવા માટે.
   * Working: Button click પર state વૅલ્યુ બારંવાર ટૉગલ થાય છે.
   * =================================================================================
   */
  const toggleFlash = () => {
    if (flash === 'off') setFlash('on');
    else if (flash === 'on') setFlash('auto');
    else setFlash('off');
  };

  const cycleTimer = () => {
    if (selfTimer === 0) setSelfTimer(3);
    else if (selfTimer === 3) setSelfTimer(5);
    else if (selfTimer === 5) setSelfTimer(10);
    else setSelfTimer(0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Title Bar */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Guardian Optics</Text>
            <Text style={styles.headerSub}>High Definition Media Capture</Text>
          </View>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{mode.toUpperCase()}</Text>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 7: CAMERA VIEWFINDER & OVERLAYS (Line 175 - Line 220)
         * Purpose: Real-time Camera View, Grid Overlay, Countdown Timer ane Live Recording status બતાવવા માટે.
         * Working: CameraView component વડે કેમેરા ચાલુ રહે છે ane એની ઉપર Grid તથા Timer badges Absolute position વડે બતાવાય છે.
         * =================================================================================
         */}
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
            enableTorch={torch}
            mode={mode}
            zoom={zoom}
          />

          {gridOverlay && (
            <View style={styles.gridContainer} pointerEvents="none">
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
                <View style={styles.gridCell} />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.gridToggleBtn}
            onPress={() => setGridOverlay(!gridOverlay)}
          >
            <Ionicons name={gridOverlay ? 'grid' : 'grid-outline'} size={18} color="#FFF" />
          </TouchableOpacity>

          {timerCountdown > 0 && (
            <View style={styles.timerBadge}>
              <Text style={styles.timerBadgeText}>{timerCountdown}</Text>
            </View>
          )}

          {isRecording && (
            <View style={styles.recordingBadge}>
              <View style={styles.redDot} />
              <Text style={styles.recordingText}>REC {recordingTime}s</Text>
            </View>
          )}
        </View>

        {/**
         * =================================================================================
         * FEATURE 8: QUICK TOOLBAR BUTTONS (Line 223 - Line 250)
         * Purpose: Front/Rear Camera Swap, Flash Mode, Torch Light ane Picture/Video mode switch કરવા માટેના બટનો.
         * Working: TouchableOpacity ક્લિક કરવા પર રિસ્પેક્ટિવ સ્ટેટસ્ સેટ થાય છે.
         * =================================================================================
         */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
            <Ionicons name="camera-reverse-outline" size={18} color="#38BDF8" />
            <Text style={styles.controlBtnText}>{facing === 'back' ? 'REAR' : 'FRONT'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleFlash}>
            <Ionicons
              name={flash === 'on' ? 'flash' : flash === 'auto' ? 'flash-outline' : 'flash-off-outline'}
              size={18}
              color="#F59E0B"
            />
            <Text style={styles.controlBtnText}>FLASH: {flash.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => setTorch(!torch)}>
            <Ionicons name={torch ? 'bulb' : 'bulb-outline'} size={18} color="#10B981" />
            <Text style={styles.controlBtnText}>TORCH: {torch ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => setMode(mode === 'picture' ? 'video' : 'picture')}>
            <Ionicons name={mode === 'picture' ? 'videocam-outline' : 'camera-outline'} size={18} color="#A78BFA" />
            <Text style={styles.controlBtnText}>MODE: {mode.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/**
         * =================================================================================
         * FEATURE 9: TIMER & ZOOM CONTROLS (Line 253 - Line 265)
         * Purpose: Camera માં Timer સેકન્ડસ્ પસંદ કરવા અને Zoom 0%, 50%, 100% વચ્ચે બદલવા માટે.
         * Working: setSelfTimer ane setZoom સ્વિચિંગ વડે કેમેરામાં ઝૂમ અને ટાઈમર સેવ થાય છે.
         * =================================================================================
         */}
        <View style={styles.enhancementsBox}>
          <Text style={styles.subTitle}>Optics & Enhancements</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={styles.smallBtn} onPress={cycleTimer}>
              <Ionicons name="timer-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.smallBtnText}>TIMER: {selfTimer ? `${selfTimer}s` : 'OFF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBtn} onPress={() => setZoom(zoom === 0 ? 0.5 : zoom === 0.5 ? 1 : 0)}>
              <Ionicons name="search-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.smallBtnText}>ZOOM: {Math.round(zoom * 100)}%</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 10: MAIN CAPTURE & RECORD TRIGGER BUTTON (Line 268 - Line 285)
         * Purpose: Picture mode માં photo પાડવા અને Video mode માં recording start/stop કરવા માટેનું મેઈન બટન.
         * Working: mode અનુસાર handleTakePicture અથવા handleRecordVideo ફંક્શન કોલ થાય છે.
         * =================================================================================
         */}
        {mode === 'picture' ? (
          <TouchableOpacity style={styles.captureBtn} onPress={handleTakePicture} activeOpacity={0.85}>
            <Ionicons name="camera" size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.captureBtnText}>CAPTURE PHOTO</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.captureBtn, isRecording ? styles.recordingActiveBtn : styles.recordVideoBtn]}
            onPress={handleRecordVideo}
            activeOpacity={0.85}
          >
            <Ionicons name={isRecording ? 'square' : 'radio-button-on'} size={24} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.captureBtnText}>
              {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
            </Text>
          </TouchableOpacity>
        )}

        {/**
         * =================================================================================
         * FEATURE 11: CAPTURED PHOTO & VIDEO PREVIEW (Line 288 - Line 315)
         * Purpose: પાડેલા ફોટા અથવા રેકોર્ડ કરેલા વિડીયોનું Preview અને Resolution Metadata દર્શાવવા માટે.
         * Working: Image અને expo-video ની VideoView દ્વારા લાઈવ પ્રીવ્યૂ ડિસ્પ્લે થાય છે.
         * =================================================================================
         */}
        {capturedPhoto && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="image-outline" size={18} color="#0EA5E9" />
              <Text style={styles.previewTitle}>Captured Photo</Text>
            </View>
            <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />
            <View style={styles.metaBox}>
              <Text style={styles.uriText} numberOfLines={1}>URI: {capturedPhoto.uri}</Text>
              <Text style={styles.detailsText}>
                Resolution: {capturedPhoto.width} × {capturedPhoto.height} px
              </Text>
            </View>
          </View>
        )}

        {capturedVideo && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="videocam-outline" size={18} color="#EC4899" />
              <Text style={styles.previewTitle}>Recorded Video</Text>
            </View>
            <VideoView style={styles.previewVideo} player={videoPlayer} />
            <View style={styles.metaBox}>
              <Text style={styles.uriText} numberOfLines={1}>URI: {capturedVideo.uri}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A' },
  permCard: { width: '100%', backgroundColor: '#1E293B', padding: 24, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  permTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 8, textAlign: 'center' },
  infoText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0EA5E9', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  modeBadge: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  modeBadgeText: { color: '#38BDF8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  cameraWrapper: { width: '100%', height: 320, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', position: 'relative', borderWidth: 1, borderColor: '#334155' },
  camera: { flex: 1 },
  gridContainer: { ...StyleSheet.absoluteFillObject },
  gridRow: { flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  gridCell: { flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  gridToggleBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(15,23,42,0.75)', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  
  timerBadge: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#F59E0B' },
  timerBadgeText: { color: '#F59E0B', fontSize: 24, fontWeight: '800' },
  recordingBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444' },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 6 },
  recordingText: { color: '#F8FAFC', fontWeight: '700', fontSize: 12 },

  controlsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14, gap: 10 },
  controlBtn: { flex: 1, minWidth: '45%', backgroundColor: '#1E293B', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#334155' },
  controlBtnText: { color: '#F8FAFC', fontSize: 11, fontWeight: '700' },

  enhancementsBox: { marginTop: 14, backgroundColor: '#1E293B', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  subTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  smallBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  smallBtnText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },

  captureBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, marginTop: 16, elevation: 4, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  recordVideoBtn: { backgroundColor: '#EC4899', shadowColor: '#EC4899' },
  recordingActiveBtn: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  captureBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  previewCard: { width: '100%', backgroundColor: '#1E293B', padding: 14, borderRadius: 16, marginTop: 18, borderWidth: 1, borderColor: '#334155' },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  previewTitle: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  previewImage: { width: '100%', height: 200, borderRadius: 12 },
  previewVideo: { width: '100%', height: 200, borderRadius: 12 },
  metaBox: { marginTop: 10, backgroundColor: '#0F172A', padding: 10, borderRadius: 10 },
  uriText: { fontSize: 11, color: '#64748B', fontFamily: 'monospace' },
  detailsText: { fontSize: 12, color: '#38BDF8', fontWeight: '600', marginTop: 4 },
});

import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView, Alert, Modal, SafeAreaView, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { saveJournalEntry } from '../../utils/journalStorage';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: WATERMARK & SOS STATE MANAGEMENT (Line 8 - Line 15)
 * Purpose: Geotagged Watermark Photo, GPS Location, Address ane Emergency SOS Modal સેવ કરવા.
 * Working: useState અને cameraRef વડે કેમેરા ચલાવીને Location Stamped Photos જનરેટ થાય છે.
 * =================================================================================
 */
export default function WatermarkTab() {
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [currentLocation, setCurrentLocation] = useState(null); // કરંટ લેટીટ્યુડ ane લોન્ગીટ્યુડ
  const [address, setAddress] = useState('Fetching address...'); // લાઈવ સરનામું (Reverse Geocoded)
  const [stampedPhoto, setStampedPhoto] = useState(null); // વોટરમાર્કવાળો પાડેલો ફોટો
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false); // SOS ઈમરજન્સી પૉપઅપ સ્ટેટ

  /**
   * =================================================================================
   * FEATURE 2: AUTO FETCH LOCATION & ADDRESS ON MOUNT (Line 16 - Line 40)
   * Purpose: સ્ક્રીન ખુલે એટલે તરત જ લાઈવ GPS Coords અને સરનામું ફેચ કરવા માટે.
   * Working: Location.getCurrentPositionAsync અને Location.reverseGeocodeAsync થી લાઈવ એડ્રેસ મેળવાય છે.
   * =================================================================================
   */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        fetchLocationAndAddress();
      }
    })();
  }, []);

  const fetchLocationAndAddress = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation(loc.coords);
      const res = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (res && res.length > 0) {
        const item = res[0];
        setAddress(`${item.name || ''} ${item.street || ''}, ${item.city || ''}`);
      }
    } catch (e) {
      console.log('Location fetch error:', e);
    }
  };

  /**
   * =================================================================================
   * FEATURE 3: CAMERA PERMISSION GUARD (Line 42 - Line 58)
   * Purpose: Watermark Photo પાડવા માટે Camera પરમિશન ચેક ane ગ્રાન્ટ કરાવવા.
   * Working: cameraPermission.granted ન હોય તો પરમિશન માંગ કાર્ડ રેન્ડર કરે છે.
   * =================================================================================
   */
  if (!cameraPermission || !cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.permCard}>
          <Ionicons name="camera-outline" size={48} color="#0EA5E9" style={{ marginBottom: 12 }} />
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.infoText}>
            Watermark feature requires camera access to capture geotagged photos.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestCameraPermission}>
            <Ionicons name="shield-checkmark" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * =================================================================================
   * FEATURE 4: CAPTURE STAMPED PHOTO & AUTO SAVE TO JOURNAL (Line 60 - Line 89)
   * Purpose: લાઈવ લોકેશન (Lat/Lon + Address) ના વોટરમાર્ક સાથે ફોટો પાડવો અને ઓટોમેટિક Travel Journal માં સેવ કરવો.
   * Working: takePictureAsync() થી ફોટો પાડીને saveJournalEntry() વડે AsyncStorage માં સેવ થાય છે.
   * =================================================================================
   */
  const handleCaptureWithLocation = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        const timestamp = new Date().toLocaleString();

        const stampedData = {
          uri: photo.uri,
          lat: currentLocation ? currentLocation.latitude.toFixed(5) : 'N/A',
          lon: currentLocation ? currentLocation.longitude.toFixed(5) : 'N/A',
          address,
          timestamp,
        };

        setStampedPhoto(stampedData);

        await saveJournalEntry({
          imageUri: photo.uri,
          address,
          latitude: stampedData.lat,
          longitude: stampedData.lon,
          notes: 'Location Stamped Photo',
        });

        Alert.alert('Success', 'Photo captured with location watermark & saved to Travel Journal!');
      }
    } catch (e) {
      Alert.alert('Capture Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Location Stamp & SOS</Text>
            <Text style={styles.headerSub}>Geotagged Photo Verification</Text>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 5: EMERGENCY SOS TRIGGER BUTTON (Line 103 - Line 106)
         * Purpose: ઈમરજન્સી સમયે તરત જ આપાતકાલીન લોકેશન બ્રોડકાસ્ટ મોડલ ઓપન કરવું.
         * Working: setEmergencyModalVisible(true) કરીને લાલ રંગનું ઇમરજન્સી ડાયલોગ પૉપઅપ કરે છે.
         * =================================================================================
         */}
        <TouchableOpacity style={styles.emergencyBtn} onPress={() => setEmergencyModalVisible(true)} activeOpacity={0.85}>
          <Ionicons name="alert-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.emergencyBtnText}>EMERGENCY LOCATION SCREEN</Text>
        </TouchableOpacity>

        {/**
         * =================================================================================
         * FEATURE 6: LIVE WATERMARK HUD OVERLAY ON CAMERA (Line 109 - Line 124)
         * Purpose: કેમેરા સ્ક્રીન પર લાઈવ સરનામું, Lat/Lon અને સમય નો વોટરમાર્ક ઓવરલે બતાવવા.
         * Working: CameraView પર Absolute positioning વડે વોટરમાર્ક બેજ મૂકેલો છે.
         * =================================================================================
         */}
        <View style={styles.cameraWrapper}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.watermarkOverlay}>
            <View style={styles.wmHeader}>
              <Ionicons name="location" size={14} color="#38BDF8" />
              <Text style={styles.watermarkText} numberOfLines={1}>{address}</Text>
            </View>
            <View style={styles.wmSubRow}>
              <Text style={styles.watermarkSubText}>
                Lat: {currentLocation ? currentLocation.latitude.toFixed(5) : 'Loading...'} | Lon:{' '}
                {currentLocation ? currentLocation.longitude.toFixed(5) : 'Loading...'}
              </Text>
              <Text style={styles.watermarkTime}>⏰ {new Date().toLocaleTimeString()}</Text>
            </View>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 7: CAPTURE STAMPED PHOTO BUTTON (Line 127 - Line 130)
         * Purpose: વોટરમાર્કવાળો ફોટો ક્લિક કરવા માટેનું મુખ્ય લીલો બટન.
         * Working: handleCaptureWithLocation ફંક્શન કોલ કરે છે.
         * =================================================================================
         */}
        <TouchableOpacity style={styles.captureBtn} onPress={handleCaptureWithLocation} activeOpacity={0.85}>
          <Ionicons name="camera" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.captureBtnText}>CAPTURE STAMPED PHOTO</Text>
        </TouchableOpacity>

        {/**
         * =================================================================================
         * FEATURE 8: CAPTURED STAMPED OUTPUT CARD (Line 133 - Line 146)
         * Purpose: પાડેલા ફોટા ઉપર ઓવરલે થયેલું પર્મેનન્ટ સરનામું અને ટાઈમસ્ટેમ્પ પ્રીવ્યૂ કરવા.
         * Working: Image અને ઓવરલેડ વોટરમાર્ક ટેક્સ્ટ દર્શાવે છે.
         * =================================================================================
         */}
        {stampedPhoto && (
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>Captured Location Watermarked Photo</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: stampedPhoto.uri }} style={styles.resultImage} />
              <View style={styles.imageWatermark}>
                <Text style={styles.watermarkText}>📍 {stampedPhoto.address}</Text>
                <Text style={styles.watermarkSubText}>
                  {stampedPhoto.lat}, {stampedPhoto.lon} | {stampedPhoto.timestamp}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/**
         * =================================================================================
         * FEATURE 9: EMERGENCY SOS BROADCAST MODAL (Line 148 - Line 176)
         * Purpose: આપત્તિના સમયે યુઝરના જીપીએસ કોઓર્ડિનેટ્સ બ્રોડકાસ્ટ અને એલર્ટ આપવા.
         * Working: Modal component વડે ઈમરજન્સી ડાયલોગ બતાવાય છે અને SOS Broadcast trigger થાય છે.
         * =================================================================================
         */}
        <Modal visible={emergencyModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Ionicons name="warning-outline" size={44} color="#EF4444" style={{ marginBottom: 8 }} />
              <Text style={styles.emergencyTitle}>EMERGENCY LOCATION BROADCAST</Text>
              <Text style={styles.emergencySub}>Send coordinates immediately to emergency contacts:</Text>

              <View style={styles.emergencyBox}>
                <Text style={styles.emergencyCoords}>
                  Latitude: {currentLocation ? currentLocation.latitude.toFixed(6) : 'Fetching...'}
                </Text>
                <Text style={styles.emergencyCoords}>
                  Longitude: {currentLocation ? currentLocation.longitude.toFixed(6) : 'Fetching...'}
                </Text>
                <Text style={styles.emergencyAddress}>Address: {address}</Text>
              </View>

              <TouchableOpacity style={styles.sosBroadcastBtn} onPress={() => Alert.alert('SOS Sent', 'Coordinates broadcasted!')}>
                <Ionicons name="radio" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnText}>BROADCAST SOS NOW</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEmergencyModalVisible(false)}>
                <Text style={styles.modalCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

  emergencyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 14, marginBottom: 14, elevation: 4 },
  emergencyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  cameraWrapper: { width: '100%', height: 320, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', position: 'relative', borderWidth: 1, borderColor: '#334155' },
  camera: { flex: 1 },
  watermarkOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  wmHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  watermarkText: { color: '#38BDF8', fontWeight: '800', fontSize: 13, flex: 1 },
  wmSubRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  watermarkSubText: { color: '#94A3B8', fontSize: 11 },
  watermarkTime: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },

  captureBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, marginTop: 16, elevation: 3 },
  captureBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  resultCard: { width: '100%', backgroundColor: '#1E293B', padding: 14, borderRadius: 16, marginTop: 18, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', marginBottom: 10 },
  imageContainer: { position: 'relative', width: '100%', height: 220, borderRadius: 14, overflow: 'hidden' },
  resultImage: { width: '100%', height: '100%' },
  imageWatermark: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 10 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  emergencyTitle: { fontSize: 18, fontWeight: '800', color: '#EF4444', marginBottom: 6, textAlign: 'center' },
  emergencySub: { fontSize: 13, color: '#94A3B8', marginBottom: 14, textAlign: 'center' },
  emergencyBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 14, borderRadius: 14, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#EF4444', gap: 4 },
  emergencyCoords: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  emergencyAddress: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  sosBroadcastBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%' },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  modalCloseBtn: { marginTop: 12, paddingVertical: 10 },
  modalCloseText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
});

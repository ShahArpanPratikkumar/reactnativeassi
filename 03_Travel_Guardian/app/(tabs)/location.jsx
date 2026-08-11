import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: GPS TELEMETRY STATE MANAGEMENT (Line 8 - Line 19)
 * Purpose: GPS Coords, Live Tracking, Reverse Geocoding Address ane Heading Data સેવ કરવા માટે.
 * Working: useState વડે lat, lon, altitude, speed, address સ્ટોર થાય છે અને useRef વડે live watch listeners ના રેફરન્સ જળવાય છે.
 * =================================================================================
 */
export default function LocationTab() {

  const [currentLocation, setCurrentLocation] = useState(null); // લાઈવ કરંટ જીપીએસ લોકેશન ઓબ્જેક્ટ
  const [lastLocation, setLastLocation] = useState(null); // કેશ થયેલું લાસ્ટ નોન લોકેશન
  const [liveLocation, setLiveLocation] = useState(null); // કન્ટીન્યુઅસ ટ્રેકિંગ ડેટા
  const [address, setAddress] = useState(null); // Reverse Geocoding થી મળેલો સરનામાનો ઓબ્જેક્ટ
  const [geocodedResult, setGeocodedResult] = useState(null); // Forward Geocoding થી મળેલા કોઓર્ડિનેટ્સ
  const [heading, setHeading] = useState(null); // કંપાસ હેડિંગ (Degree)
  const [isTracking, setIsTracking] = useState(false); // Live tracking ચાલુ/બંધ સ્ટેટસ

  const liveRef = useRef(null); // Location.watchPositionAsync લીસનર ઓબ્જેક્ટ સેવ કરવા
  const headingRef = useRef(null); // Location.watchHeadingAsync લીસનર ઓબ્જેક્ટ સેવ કરવા

  /**
   * =================================================================================
   * FEATURE 2: FOREGROUND LOCATION PERMISSION HANDLER (Line 20 - Line 27)
   * Purpose: User પાસેથી Mobile Device ના Location ની પમિશન માંગવા માટે.
   * Working: Location.requestForegroundPermissionsAsync() કોલ કરીને યુઝર પરમિશન કન્ફર્મ કરાવે છે.
   * =================================================================================
   */
  const handleGrantPermission = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission?.granted) {
      Alert.alert("Permission Denied!", "Please give permission to access these features!!");
      return;
    }
    Alert.alert("Permission Granted!", "You can now use all location features.");
  };

  /**
   * =================================================================================
   * FEATURE 3: GET CURRENT POSITION (HIGH ACCURACY) (Line 29 - Line 46)
   * Purpose: અત્યારના તાત્કાલિક સાચા જીપીએસ કોઓર્ડિનેટ્સ Fetch કરવા માટે.
   * Working: Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }) વડે હાલના Latitude, Longitude મેળવાય છે.
   * =================================================================================
   */
  const handleGetCurrentLocation = async () => {
    const checkPermission = await Location.getForegroundPermissionsAsync();
    if (!checkPermission?.granted) {
      Alert.alert("Permission Denied!", "Please give permission to access these features!!");
      return;
    }
    try {
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (currentLoc) {
        setCurrentLocation(currentLoc);
        console.log("Current Location:", currentLoc);
      }
    } catch (error) {
      Alert.alert("Error", `Unable to fetch current location: ${error.message}`);
    }
  };

  /**
   * =================================================================================
   * FEATURE 4: GET LAST KNOWN CACHED LOCATION (Line 48 - Line 65)
   * Purpose: ઇન્ટરનેટ/GPS સ્લો હોય ત્યારે મોબાઈલ કેશ માંથી છેલ્લું સેવ થયેલું લોકેશન મેળવવા માટે.
   * Working: Location.getLastKnownPositionAsync() કોલ કરીને લાસ્ટ સિંક થયેલ ડેટા આપે છે.
   * =================================================================================
   */
  const handleGetLastLocation = async () => {
    const checkPermission = await Location.getForegroundPermissionsAsync();
    if (!checkPermission?.granted) {
      Alert.alert("Permission Denied!", "Please give permission to access these features!!");
      return;
    }
    try {
      const lastLoc = await Location.getLastKnownPositionAsync();
      if (lastLoc) {
        setLastLocation(lastLoc);
        console.log("Last Known Location:", lastLoc);
      } else {
        Alert.alert("Not Found", "No last known location cached on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to fetch last location!!");
    }
  };

  /**
   * =================================================================================
   * FEATURE 5: LIVE POSITION & HEADING CONTINUOUS TRACKER (Line 67 - Line 91)
   * Purpose: યુઝર જેમ ચાલશે કે વાહન ચલાવશે તેમ રિયલ-ટાઇમમાં લોકેશન અને કંપાસ દિશા અપડેટ કરવા.
   * Working: Location.watchPositionAsync અને Location.watchHeadingAsync નો ઉપયોગ કરીને દર 2 સેકન્ડે ડેટા સિંક કરે છે.
   * =================================================================================
   */
  const handleTrackLocation = async () => {
    const checkPermission = await Location.getForegroundPermissionsAsync();
    if (!checkPermission?.granted) {
      Alert.alert("Permission Denied!", "Please give permission to access these features!!");
      return;
    }
    try {
      setIsTracking(true);

      liveRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 1 },
        (resLocation) => {
          setLiveLocation(resLocation);
          console.log("Live Location Update:", resLocation);
        }
      );

      headingRef.current = await Location.watchHeadingAsync((headData) => {
        setHeading(Math.round(headData.trueHeading || headData.magHeading));
      });
    } catch (error) {
      setIsTracking(false);
      Alert.alert("Error!", "Unable to start location tracking!");
    }
  };

  /**
   * =================================================================================
   * FEATURE 6: STOP LIVE TRACKING LISTENER (Line 93 - Line 105)
   * Purpose: ચાલુ રિયલ-ટાઇમ ટ્રેકિંગ બેકગ્રાઉન્ડ સબસ્ક્રિપ્શન બંધ કરવા માટે.
   * Working: liveRef.current.remove() વડે લિસનર રીમુવ કરીને બેટરી ane મેમરી સેવ કરે છે.
   * =================================================================================
   */
  const handleStopTracker = () => {
    if (liveRef.current) {
      liveRef.current.remove();
      liveRef.current = null;
    }
    if (headingRef.current) {
      headingRef.current.remove();
      headingRef.current = null;
    }
    setIsTracking(false);
    setLiveLocation(null);
    setHeading(null);
  };

  /**
   * =================================================================================
   * FEATURE 7: REVERSE GEOCODING (Coords -> Address) (Line 107 - Line 130)
   * Purpose: Latitude ane Longitude પરથી સિટી, એરિયા, પિનકોડ અને દેશનું નામ શોધી આપવા માટે.
   * Working: Location.reverseGeocodeAsync({ latitude, longitude }) નો ઉપયોગ થાય છે.
   * =================================================================================
   */
  const handleReverseGeocode = async () => {
    const checkPermission = await Location.getForegroundPermissionsAsync();
    if (!checkPermission?.granted) {
      Alert.alert("Permission Denied!", "Please give permission to access these features!!");
      return;
    }
    const source = currentLocation || liveLocation;
    if (!source) {
      Alert.alert("No Location", "Please fetch current location first.");
      return;
    }
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: source.coords.latitude,
        longitude: source.coords.longitude,
      });
      if (res && res.length > 0) {
        setAddress(res[0]);
        console.log("Reverse Geocode Result:", res);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to get address from coordinates.");
    }
  };

  /**
   * =================================================================================
   * FEATURE 8: FORWARD GEOCODING (Address -> Coords) (Line 132 - Line 144)
   * Purpose: કોઈ શહેર અથવા સ્થળનું નામ આપીને તેનાં બરાબર Latitude-Longitude મેળવવા.
   * Working: Location.geocodeAsync('Ahmedabad, Gujarat') કોલ કરીને Latitude અને Longitude મેળવાય છે.
   * =================================================================================
   */
  const handleForwardGeocode = async () => {
    try {
      const res = await Location.geocodeAsync('Ahmedabad, Gujarat');
      if (res && res.length > 0) {
        setGeocodedResult(res[0]);
        console.log("Forward Geocode Result:", res);
      } else {
        Alert.alert("Not Found", "No coordinates found.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  /**
   * =================================================================================
   * FEATURE 9: AUTO START TRACKING ON SCREEN MOUNT (Line 146 - Line 152)
   * Purpose: સ્ક્રીન ઓપન થતાં જ આપોઆપ લાઈવ ટ્રેકિંગ સ્ટાર્ટ કરવા અને સ્ક્રીન બંધ થતાં ક્લીનઅપ કરવા.
   * Working: useEffect Mount થતાં handleTrackLocation() રન કરે છે.
   * =================================================================================
   */
  useEffect(() => {
    handleTrackLocation();
    return () => {
      if (liveRef.current) liveRef.current.remove();
      if (headingRef.current) headingRef.current.remove();
    };
  }, []);

  const getAccuracyLabel = (accuracy) => {
    if (!accuracy) return 'Unknown';
    if (accuracy <= 5) return `${accuracy.toFixed(1)}m (Excellent)`;
    if (accuracy <= 15) return `${accuracy.toFixed(1)}m (Good)`;
    if (accuracy <= 50) return `${accuracy.toFixed(1)}m (Fair)`;
    return `${accuracy.toFixed(1)}m (Poor)`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Geo-Tracker Pro</Text>
            <Text style={styles.headerSub}>Live Telemetry & GPS Controller</Text>
          </View>
          <View style={[styles.statusBadge, isTracking ? styles.activeBadge : styles.idleBadge]}>
            <View style={[styles.statusDot, isTracking ? styles.activeDot : styles.idleDot]} />
            <Text style={[styles.statusText, isTracking ? styles.activeText : styles.idleText]}>
              {isTracking ? 'TRACKING LIVE' : 'STOPPED'}
            </Text>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 10: LOCATION CONTROL BUTTONS (Line 180 - Line 201)
         * Purpose: Grant Permission, Current Position, Last Known ane Refresh GPS નાં સરળ કંટ્રોલ બટનો.
         * Working: TouchableOpacity ક્લિક કરવા પર રિસ્પેક્ટિવ લોકેશન ફંક્શન કોલ થાય છે.
         * =================================================================================
         */}
        <Text style={styles.sectionTitle}>LOCATION CONTROLS</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionChip} onPress={handleGrantPermission}>
            <Ionicons name="key-outline" size={18} color="#0EA5E9" />
            <Text style={styles.actionChipText}>Grant Permission</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionChip} onPress={handleGetCurrentLocation}>
            <Ionicons name="locate-outline" size={18} color="#38BDF8" />
            <Text style={styles.actionChipText}>Get Current Position</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionChip} onPress={handleGetLastLocation}>
            <Ionicons name="time-outline" size={18} color="#A78BFA" />
            <Text style={styles.actionChipText}>Get Last Known</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionChip} onPress={handleGetCurrentLocation}>
            <Ionicons name="refresh-outline" size={18} color="#10B981" />
            <Text style={styles.actionChipText}>Refresh GPS</Text>
          </TouchableOpacity>
        </View>

        {/**
         * =================================================================================
         * FEATURE 11: LIVE TRACK & GEOCODING CONTROLS (Line 204 - Line 225)
         * Purpose: Live Tracking Start/Stop કરવા અને Geocoding ફિચર્સ ટ્રિગર કરવા.
         * Working: handleTrackLocation, handleStopTracker, Reverse/Forward Geocode બટનો.
         * =================================================================================
         */}
        <Text style={styles.sectionTitle}>ADVANCED TELEMETRY & GEOCODING</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionChip, styles.startTrackChip]} onPress={handleTrackLocation}>
            <Ionicons name="play-outline" size={18} color="#FFF" />
            <Text style={styles.actionChipTextLight}>Start Live Track</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionChip, styles.stopTrackChip]} onPress={handleStopTracker}>
            <Ionicons name="stop-outline" size={18} color="#FFF" />
            <Text style={styles.actionChipTextLight}>Stop Live Track</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionChip} onPress={handleReverseGeocode}>
            <Ionicons name="map-outline" size={18} color="#F59E0B" />
            <Text style={styles.actionChipText}>Reverse Geocode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionChip} onPress={handleForwardGeocode}>
            <Ionicons name="search-outline" size={18} color="#EC4899" />
            <Text style={styles.actionChipText}>Forward Geocode</Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry Output Display Cards */}
        {currentLocation && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="disc-outline" size={20} color="#0EA5E9" />
              <Text style={styles.cardTitle}>Current Position (High Accuracy)</Text>
            </View>
            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LATITUDE</Text>
                <Text style={styles.metricValue}>{currentLocation.coords.latitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LONGITUDE</Text>
                <Text style={styles.metricValue}>{currentLocation.coords.longitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>ALTITUDE</Text>
                <Text style={styles.metricValue}>{currentLocation.coords.altitude?.toFixed(1) ?? 'N/A'} m</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>SPEED</Text>
                <Text style={styles.metricValue}>{currentLocation.coords.speed?.toFixed(2) ?? '0.00'} m/s</Text>
              </View>
            </View>
            <View style={styles.metaFooter}>
              <Text style={styles.metaFooterText}>Accuracy: {getAccuracyLabel(currentLocation.coords.accuracy)}</Text>
              <Text style={styles.metaFooterText}>{new Date(currentLocation.timestamp).toLocaleTimeString()}</Text>
            </View>
          </View>
        )}

        {lastLocation && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={20} color="#A78BFA" />
              <Text style={styles.cardTitle}>Last Known Position</Text>
            </View>
            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LATITUDE</Text>
                <Text style={styles.metricValue}>{lastLocation.coords.latitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LONGITUDE</Text>
                <Text style={styles.metricValue}>{lastLocation.coords.longitude.toFixed(6)}°</Text>
              </View>
            </View>
            <View style={styles.metaFooter}>
              <Text style={styles.metaFooterText}>Accuracy: {getAccuracyLabel(lastLocation.coords.accuracy)}</Text>
              <Text style={styles.metaFooterText}>Cached: {new Date(lastLocation.timestamp).toLocaleTimeString()}</Text>
            </View>
          </View>
        )}

        {liveLocation && (
          <View style={[styles.card, styles.liveCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="radio-outline" size={20} color="#10B981" />
              <Text style={[styles.cardTitle, { color: '#10B981' }]}>Live Location Feed Active</Text>
            </View>
            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LIVE LATITUDE</Text>
                <Text style={styles.metricValue}>{liveLocation.coords.latitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LIVE LONGITUDE</Text>
                <Text style={styles.metricValue}>{liveLocation.coords.longitude.toFixed(6)}°</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>SPEED</Text>
                <Text style={styles.metricValue}>{liveLocation.coords.speed?.toFixed(2) ?? '0.00'} m/s</Text>
              </View>
              {heading !== null && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>COMPASS HEADING</Text>
                  <Text style={styles.metricValue}>{heading}°</Text>
                </View>
              )}
            </View>
            <View style={styles.metaFooter}>
              <Text style={styles.metaFooterText}>Accuracy: {getAccuracyLabel(liveLocation.coords.accuracy)}</Text>
            </View>
          </View>
        )}

        {address && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>Reverse Geocoded Address</Text>
            </View>
            <View style={styles.addressBox}>
              <Text style={styles.addressLine}><Text style={styles.addressLabel}>Street:</Text> {address.name} {address.street}</Text>
              <Text style={styles.addressLine}><Text style={styles.addressLabel}>City/District:</Text> {address.city}, {address.district}</Text>
              <Text style={styles.addressLine}><Text style={styles.addressLabel}>Region/Postal:</Text> {address.region} - {address.postalCode}</Text>
              <Text style={styles.addressLine}><Text style={styles.addressLabel}>Country:</Text> {address.country} ({address.isoCountryCode})</Text>
            </View>
          </View>
        )}

        {geocodedResult && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pin-outline" size={20} color="#EC4899" />
              <Text style={styles.cardTitle}>Forward Geocoded (Ahmedabad, GJ)</Text>
            </View>
            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LATITUDE</Text>
                <Text style={styles.metricValue}>{geocodedResult.latitude}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>LONGITUDE</Text>
                <Text style={styles.metricValue}>{geocodedResult.longitude}</Text>
              </View>
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

  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 6 },
  activeBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
  idleBadge: { backgroundColor: '#1E293B', borderColor: '#334155' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: '#10B981' },
  idleDot: { backgroundColor: '#64748B' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  activeText: { color: '#10B981' },
  idleText: { color: '#94A3B8' },

  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginTop: 14, marginBottom: 10 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  actionChip: { flex: 1, minWidth: '45%', backgroundColor: '#1E293B', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#334155' },
  actionChipText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
  actionChipTextLight: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  startTrackChip: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stopTrackChip: { backgroundColor: '#EF4444', borderColor: '#EF4444' },

  card: { width: '100%', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: '#334155', gap: 12 },
  liveCard: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricItem: { flex: 1, minWidth: '40%', backgroundColor: '#0F172A', padding: 10, borderRadius: 10 },
  metricLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 2 },
  metricValue: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  metaFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderColor: '#334155' },
  metaFooterText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

  addressBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, gap: 6 },
  addressLine: { fontSize: 13, color: '#F8FAFC' },
  addressLabel: { fontWeight: '700', color: '#38BDF8' },
});

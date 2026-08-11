import { View, Text, Alert, StyleSheet, TextInput, ScrollView, Share, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: MAPS & DISTANCE CALCULATOR STATE MANAGEMENT (Line 9 - Line 19)
 * Purpose: Map View, Address Search Query, Target Coords ane Haversine Distance ડેટા સ્ટોર કરવા.
 * Working: useState વડે કંટ્રોલર્સ ane locationHistory array મેનેજ થાય છે.
 * =================================================================================
 */
export default function MapsTab() {

  const [currentCoords, setCurrentCoords] = useState(null); // કરંટ જીપીએસ કોઓર્ડિનેટ્સ (Lat, Lon)
  const [searchedLocation, setSearchedLocation] = useState(null); // સર્ચ કરેલું ડેસ્ટિનેશન પિન લોકેશન
  const [locationHistory, setLocationHistory] = useState([]); // સર્ચ કરેલા સ્થળોની હિસ્ટ્રી લિસ્ટ
  const [searchQuery, setSearchQuery] = useState(''); // ટેક્સ્ટ ઈનપુટ માં લખેલું સરનામું
  const [targetLat, setTargetLat] = useState(''); // Haversine કેલ્ક્યુલેટર માટે ટાર્ગેટ લેટીટ્યુડ
  const [targetLon, setTargetLon] = useState(''); // Haversine કેલ્ક્યુલેટર માટે ટાર્ગેટ લોન્ગીટ્યુડ
  const [calculatedDistance, setCalculatedDistance] = useState(null); // ગણતરી કરેલું અંતર (KM માં)

  const activeLocation = searchedLocation || currentCoords;

  /**
   * =================================================================================
   * FEATURE 2: INITIAL MAP GPS FIX ON MOUNT (Line 20 - Line 35)
   * Purpose: સ્ક્રીન ઓપન થતાં જ કરંટ લોકેશન પિન મેપ પર બતાવવા માટે.
   * Working: useEffect Mount થતાં Location.getCurrentPositionAsync() ચલાવે છે.
   * =================================================================================
   */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (loc) {
        setCurrentCoords(loc.coords);
        console.log("Current Coords:", loc.coords);
      }
    })();
  }, []);

  /**
   * =================================================================================
   * FEATURE 3: ADDRESS SEARCH & MAP JUMP (Line 37 - Line 66)
   * Purpose: કોઈપણ સરનામું ટાઈપ કરીને સર્ચ કરતાં જ મેપ તેના પર જમ્પ કરશે અને પિન મૂકશે.
   * Working: Location.geocodeAsync(searchQuery) વડે Coords મેળવીને searchedLocation સેટ થાય છે.
   * =================================================================================
   */
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Input Required", "Please enter an address to search.");
      return;
    }
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const found = results[0];
        setSearchedLocation({ latitude: found.latitude, longitude: found.longitude });

        const newRecord = {
          id: Date.now().toString(),
          query: searchQuery,
          lat: found.latitude,
          lon: found.longitude,
        };
        setLocationHistory((prev) => [newRecord, ...prev]);

        setTargetLat(found.latitude.toString());
        setTargetLon(found.longitude.toString());

        console.log("Geocoded Result:", found);
      } else {
        Alert.alert("Not Found", "No location results for this address.");
      }
    } catch (error) {
      Alert.alert("Search Error", error.message);
    }
  };

  /**
   * =================================================================================
   * FEATURE 4: HAVERSINE DISTANCE CALCULATOR FORMULA (Line 68 - Line 102)
   * Purpose: કરંટ લોકેશન અને આપેલાં લેટીટ્યુડ-લોન્ગીટ્યુડ વચ્ચેનું સીધું હવાઈ અંતર (Kilometers) ગણવું.
   * Working: Haversine Formula (Spherical Trigonometry math equation) વડે KM ની ચોક્કસ ગણતરી થાય છે.
   * =================================================================================
   */
  const handleCalculateDistance = () => {
    if (!currentCoords) {
      Alert.alert("No Location", "Please wait for current location to load.");
      return;
    }
    if (!targetLat || !targetLon) {
      Alert.alert("Input Error", "Please enter target Latitude and Longitude.");
      return;
    }

    const lat1 = currentCoords.latitude;
    const lon1 = currentCoords.longitude;
    const lat2 = parseFloat(targetLat);
    const lon2 = parseFloat(targetLon);

    if (isNaN(lat2) || isNaN(lon2)) {
      Alert.alert("Invalid Input", "Latitude and Longitude must be numbers.");
      return;
    }

    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setCalculatedDistance(dist.toFixed(2));
    console.log("Distance:", dist.toFixed(2), "km");
  };

  /**
   * =================================================================================
   * FEATURE 5: SHARE COORDINATES NATIVE DIALOG (Line 104 - Line 116)
   * Purpose: પોતાનું કરંટ જીપીએસ લોકેશન અને ગૂગલ મેપ્સની લિંક મિત્રો સાથે શેર કરવા.
   * Working: React Native ના Native Share API વડે WhatsApp, SMS વગેરેમાં ડેટા સેન્ડ થાય છે.
   * =================================================================================
   */
  const handleShareCoordinates = async () => {
    if (!currentCoords) {
      Alert.alert("No Location", "Please wait for current location to load.");
      return;
    }
    try {
      await Share.share({
        message: `My Location:\nLatitude: ${currentCoords.latitude}\nLongitude: ${currentCoords.longitude}\n\nMaps: https://maps.google.com/?q=${currentCoords.latitude},${currentCoords.longitude}`,
      });
    } catch (error) {
      Alert.alert("Share Error", error.message);
    }
  };

  /**
   * =================================================================================
   * FEATURE 6: SEARCH HISTORY SELECTION (Line 118 - Line 122)
   * Purpose: અગાઉ શોધેલા લોકેશન હિસ્ટ્રી માંથી ક્લિક કરીને સીધા મેપ પર જમ્પ થવા.
   * Working: setSearchedLocation ane target lat/lon વૅલ્યૂસ સેટ થઈ જાય છે.
   * =================================================================================
   */
  const handleSelectHistory = (item) => {
    setSearchedLocation({ latitude: item.lat, longitude: item.lon });
    setTargetLat(item.lat.toString());
    setTargetLon(item.lon.toString());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Radar & Maps</Text>
            <Text style={styles.headerSub}>Interactive Positioning & Trajectory</Text>
          </View>
          <TouchableOpacity style={styles.shareHeaderBtn} onPress={handleShareCoordinates}>
            <Ionicons name="share-social-outline" size={18} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/**
         * =================================================================================
         * FEATURE 7: INTERACTIVE MAPVIEW WITH BLUE & RED MARKERS (Line 139 - Line 181)
         * Purpose: Real-time Google Map View પર પોતાના અને ડેસ્ટિનેશનના Markers બતાવવા.
         * Working: MapView component અને Marker components નો ઉપયોગ કરીને લાઈવ વિઝ્યુઅલ રેન્ડર થાય છે.
         * =================================================================================
         */}
        {activeLocation ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: activeLocation.latitude,
                longitude: activeLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
            >
              {currentCoords && (
                <Marker
                  coordinate={{
                    latitude: currentCoords.latitude,
                    longitude: currentCoords.longitude,
                  }}
                  title="My Position"
                  description="Current GPS Fix"
                  pinColor="blue"
                />
              )}

              {searchedLocation && (
                <Marker
                  coordinate={{
                    latitude: searchedLocation.latitude,
                    longitude: searchedLocation.longitude,
                  }}
                  title="Searched Target"
                  description={searchQuery}
                  pinColor="red"
                />
              )}
            </MapView>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="compass-outline" size={36} color="#64748B" style={{ marginBottom: 6 }} />
            <Text style={styles.placeholderText}>Acquiring GPS Fix for Radar...</Text>
          </View>
        )}

        {/* Current Location Badge */}
        {currentCoords && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="locate-outline" size={18} color="#38BDF8" />
              <Text style={styles.infoTitle}>GPS Coordinates</Text>
            </View>
            <Text style={styles.coordText}>
              Lat: <Text style={styles.coordVal}>{currentCoords.latitude.toFixed(6)}°</Text>  |  Lon: <Text style={styles.coordVal}>{currentCoords.longitude.toFixed(6)}°</Text>
            </Text>
          </View>
        )}

        {/**
         * =================================================================================
         * FEATURE 8: ADDRESS SEARCH INPUT CARD (Line 197 - Line 211)
         * Purpose: યુઝર પાસેથી સરનામાનું ટેક્સ્ટ ઈનપુટ લઈને સર્ચ ટ્રિગર કરવું.
         * Working: TextInput ની વેલ્યુ સબમિટ થતાં handleSearchLocation રન થાય છે.
         * =================================================================================
         */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SEARCH LOCATION BY ADDRESS</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter address or destination..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchLocation}>
              <Ionicons name="search" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 9: HAVERSINE FORM CARD & RESULT DISPLAY (Line 214 - Line 245)
         * Purpose: Latitude અને Longitude ઈનપુટ આપીને બંને બિંદુઓ વચ્ચેનું અંતર ગણવું.
         * Working: Calculate Distance બટન ક્લિક થતાં અંતર ગણાઈને Result Box માં શો થાય છે.
         * =================================================================================
         */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>HAVERSINE DISTANCE CALCULATOR</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Target Latitude (e.g., 28.6139)"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={targetLat}
              onChangeText={setTargetLat}
            />
            <TextInput
              style={styles.input}
              placeholder="Target Longitude (e.g., 77.2090)"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={targetLon}
              onChangeText={setTargetLon}
            />
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={handleCalculateDistance}>
            <Ionicons name="calculator-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.calcBtnText}>Calculate Distance</Text>
          </TouchableOpacity>

          {calculatedDistance !== null && (
            <View style={styles.resultBox}>
              <Ionicons name="navigate-circle-outline" size={24} color="#10B981" />
              <Text style={styles.resultText}>Distance: {calculatedDistance} km</Text>
            </View>
          )}
        </View>

        {/* Recent Search History */}
        {locationHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>RECENT SEARCH HISTORY</Text>
            {locationHistory.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyQuery}>{item.query}</Text>
                  <Text style={styles.historyCoords}>
                    {item.lat.toFixed(4)}°, {item.lon.toFixed(4)}°
                  </Text>
                </View>
                <TouchableOpacity style={styles.viewHistoryBtn} onPress={() => handleSelectHistory(item)}>
                  <Text style={styles.viewHistoryText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  shareHeaderBtn: { backgroundColor: '#1E293B', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },

  mapContainer: { width: '100%', height: 280, borderRadius: 20, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: { width: '100%', height: 220, backgroundColor: '#1E293B', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  placeholderText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  infoCard: { width: '100%', backgroundColor: '#1E293B', padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  coordText: { fontSize: 13, color: '#64748B' },
  coordVal: { color: '#F8FAFC', fontWeight: '700' },

  card: { width: '100%', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#334155', gap: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 2 },
  
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, color: '#F8FAFC', fontSize: 13, borderWidth: 1, borderColor: '#334155' },
  searchBtn: { backgroundColor: '#0EA5E9', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  inputGroup: { gap: 8 },
  input: { backgroundColor: '#0F172A', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, color: '#F8FAFC', fontSize: 13, borderWidth: 1, borderColor: '#334155' },
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 12, borderRadius: 12 },
  calcBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  resultBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10B981', marginTop: 4 },
  resultText: { fontSize: 15, fontWeight: '800', color: '#10B981' },

  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: 10, borderRadius: 12 },
  historyQuery: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  historyCoords: { fontSize: 11, color: '#64748B', marginTop: 2 },
  viewHistoryBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewHistoryText: { color: '#38BDF8', fontSize: 11, fontWeight: '700' },
});

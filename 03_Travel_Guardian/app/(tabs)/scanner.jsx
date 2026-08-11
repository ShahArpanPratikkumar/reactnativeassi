import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: SCANNER STATE MANAGEMENT (Line 7 - Line 11)
 * Purpose: QR code ane Barcode scan થવા પર ડેટા સેવ કરવા ane સ્કૅનર લૉક/અનલૉક કરવા માટે.
 * Working: useState વડે scanned boolean અને scannedData object સ્ટોર થાય છે.
 * =================================================================================
 */
export default function ScannerTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); // Code scan થઇ ગયો છે કે બાકી છે તે દર્શાવે છે
  const [scannedData, setScannedData] = useState(null); // Scan થયેલ QR Code/Barcode નો ડેટા સ્ટોર કરે છે

  /**
   * =================================================================================
   * FEATURE 2: SCANNER CAMERA PERMISSION UI & HANDLER (Line 12 - Line 36)
   * Purpose: QR/Barcode scan કરવા માટે Camera Permission ચેક ane ગ્રાન્ટ કરાવે છે.
   * Working: useCameraPermissions hook વડે permission status ચેક કરીને જો ગ્રાન્ટ ન હોય તો Request Button બતાવે છે.
   * =================================================================================
   */
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Initializing scanner permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.permCard}>
          <Ionicons name="qr-code-outline" size={48} color="#0EA5E9" style={{ marginBottom: 12 }} />
          <Text style={styles.permTitle}>Scanner Camera Permission</Text>
          <Text style={styles.infoText}>
            Camera permission is required to scan QR codes and barcodes during travel inspection.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Ionicons name="shield-checkmark" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * =================================================================================
   * FEATURE 3: BARCODE SCAN DETECTION EVENT HANDLER (Line 38 - Line 45)
   * Purpose: જ્યારે કેમેરા સામે કોઈ QR કે Barcode આવે ત્યારે ઓટોમેટિક ડેટા રીડ કરવા માટે.
   * Working: onBarcodeScanned event માંથી type અને data મેળવીને Alert દર્શાવે છે અને scannedData સ્ટેટમાં સેવ કરે છે.
   * =================================================================================
   */
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    const result = { type, data, timestamp: new Date().toLocaleTimeString() };
    setScannedData(result);
    console.log(result);
    Alert.alert('Code Detected!', `Type: ${type}\nData: ${data}`);
  };

  /**
   * =================================================================================
   * FEATURE 4: SCANNER RESET HANDLER (Line 47 - Line 50)
   * Purpose: ફરીથી નવો QR/Barcode scan કરવા માટે scanner ને reset કરવા.
   * Working: setScanned(false) કરીને કેમેરા સિંગનલ ફરીથી બારકોડ સ્કેન માટે ઓપન કરે છે.
   * =================================================================================
   */
  const handleResetScanner = () => {
    setScanned(false);
    setScannedData(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Sentinel Scanner</Text>
            <Text style={styles.headerSub}>QR & Multi-Format Barcode Engine</Text>
          </View>
          <View style={[styles.statusBadge, scanned ? styles.lockedBadge : styles.activeBadge]}>
            <View style={[styles.statusDot, scanned ? styles.lockedDot : styles.activeDot]} />
            <Text style={[styles.statusText, scanned ? styles.lockedText : styles.activeText]}>
              {scanned ? 'LOCKED' : 'SCANNING'}
            </Text>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 5: LIVE SCANNER CAMERA VIEWFINDER & TARGET FRAME (Line 70 - Line 95)
         * Purpose: Real-time QR Code અને Multi-format Barcode (EAN13, Code128, Aztec, PDF417) Scan કરવા માટે.
         * Working: CameraView ની અંદર barcodeScannerSettings પ્રોપર્ટી દ્વારા બધી બારકોડ ટાઈપ્સ લાઈવ સ્કૅન થાય છે.
         * =================================================================================
         */}
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'ean13',
                'ean8',
                'code128',
                'code39',
                'upc_a',
                'upc_e',
                'pdf417',
                'aztec',
              ],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.scanTargetFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 6: RESET SCANNER BUTTON (Line 98 - Line 103)
         * Purpose: Code ડિટૅક્ટ થઈ ગયા પછી ફરીથી નવો સ્કેન કરવા માટેનું બટન.
         * Working: scanned === true હોય ત્યારે બટન શો થાય છે અને ક્લિક કરવા પર handleResetScanner રન થાય છે.
         * =================================================================================
         */}
        {scanned && (
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetScanner} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>RESET SCANNER (SCAN AGAIN)</Text>
          </TouchableOpacity>
        )}

        {/**
         * =================================================================================
         * FEATURE 7: SCANNED RESULT PAYLOAD CARD (Line 106 - Line 130)
         * Purpose: Scan થયેલા QR/Barcode નો Type, Value અને Scanned Time સુંદર રીતે બતાવવા માટે.
         * Working: scannedData માં રહેલ result.type, result.data અને timestamp ને UI Card માં રેન્ડર કરે છે.
         * =================================================================================
         */}
        {scannedData && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#10B981" />
              <Text style={styles.resultTitle}>Scanned Payload</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>TYPE</Text>
              <View style={styles.typeTag}>
                <Text style={styles.typeTagText}>{scannedData.type}</Text>
              </View>
            </View>

            <View style={styles.resultRowVertical}>
              <Text style={styles.resultLabel}>VALUE</Text>
              <Text style={styles.resultValueText}>{scannedData.data}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>TIME</Text>
              <Text style={styles.resultTimeText}>{scannedData.timestamp}</Text>
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 6 },
  activeBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
  lockedBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: '#10B981' },
  lockedDot: { backgroundColor: '#F59E0B' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  activeText: { color: '#10B981' },
  lockedText: { color: '#F59E0B' },

  cameraWrapper: { width: '100%', height: 340, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', position: 'relative', borderWidth: 1, borderColor: '#334155' },
  camera: { flex: 1 },
  scanTargetFrame: { width: 200, height: 200, position: 'absolute', top: 70, alignSelf: 'center' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#38BDF8' },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 4 },

  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#0EA5E9', paddingVertical: 14, borderRadius: 14, marginTop: 16, elevation: 3 },
  resetBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  resultCard: { width: '100%', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginTop: 18, borderWidth: 1, borderColor: '#334155', gap: 12 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#334155' },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultRowVertical: { gap: 4 },
  resultLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  typeTag: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeTagText: { color: '#38BDF8', fontSize: 12, fontWeight: '700' },
  resultValueText: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', backgroundColor: '#0F172A', padding: 10, borderRadius: 10, fontFamily: 'monospace' },
  resultTimeText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
});

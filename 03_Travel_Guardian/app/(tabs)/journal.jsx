import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView, TextInput, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { getJournalEntries, saveJournalEntry, deleteJournalEntry, exportJournalAsJSON } from '../../utils/journalStorage';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: JOURNAL STATE & INITIAL LOAD (Line 7 - Line 19)
 * Purpose: AsyncStorage માંથી બધી જર્નલ એન્ટ્રીઓ લોડ કરવી અને ઈનપુટ ફોર્મ ફિલ સ્ટોર કરવું.
 * Working: useState અને useEffect Mount થતાં loadEntries() ફંક્શન કોલ કરે છે.
 * =================================================================================
 */
export default function JournalTab() {
  const [entries, setEntries] = useState([]); // AsyncStorage માંથી મળેલા લિસ્ટનો એરે
  const [notesInput, setNotesInput] = useState(''); // જર્નલ નોટ્સનું ટેક્સ્ટ ઈનપુટ
  const [locationInput, setLocationInput] = useState(''); // લોકેશન / સ્થળનું નામ

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await getJournalEntries();
    setEntries(data);
  };

  /**
   * =================================================================================
   * FEATURE 2: ADD MANUAL JOURNAL ENTRY TO ASYNCSTORAGE (Line 20 - Line 37)
   * Purpose: યુઝર દ્વારા લખેલી નવી જર્નલ નોટ્સને મોબાઇલના AsyncStorage મેમરીમાં કાયમી સ્ટોર કરવી.
   * Working: saveJournalEntry() યુટિલિટી કોલ કરીને એન્ટ્રી ઉમેરાય છે અને લિસ્ટ રીફ્રેશ થાય છે.
   * =================================================================================
   */
  const handleAddManualEntry = async () => {
    if (!notesInput.trim()) {
      Alert.alert('Validation Error', 'Please enter notes for your journal entry.');
      return;
    }

    await saveJournalEntry({
      notes: notesInput,
      address: locationInput || 'Manual Entry Location',
      latitude: '28.6139',
      longitude: '77.2090',
    });

    setNotesInput('');
    setLocationInput('');
    loadEntries();
    Alert.alert('Success', 'Journal entry saved to AsyncStorage!');
  };

  /**
   * =================================================================================
   * FEATURE 3: DELETE JOURNAL ENTRY FROM ASYNCSTORAGE (Line 39 - Line 42)
   * Purpose: લિસ્ટમાંથી કોઈપણ જર્નલ આઈટમ કાયમી માટે ડીલીટ કરવા.
   * Working: deleteJournalEntry(id) કોલ કરીને એન્ટ્રી રિમૂવ થાય છે અને ફિલ્ટર થયેલું લિસ્ટ સેટ થાય છે.
   * =================================================================================
   */
  const handleDelete = async (id) => {
    const updated = await deleteJournalEntry(id);
    setEntries(updated);
  };

  /**
   * =================================================================================
   * FEATURE 4: EXPORT JOURNAL DATA AS JSON (Line 44 - Line 51)
   * Purpose: બધી સેવ થયેલી જર્નલ હિસ્ટ્રીનો JSON ડેટા એક્સપોર્ટ/શેર અથવા વ્યુ કરવા.
   * Working: exportJournalAsJSON() કોલ કરીને સર્વર અથવા યુઝર માટે પ્યોર JSON String જનરેટ થાય છે.
   * =================================================================================
   */
  const handleExportJSON = async () => {
    try {
      const jsonStr = await exportJournalAsJSON();
      Alert.alert('Travel Journal JSON Export', jsonStr.slice(0, 300) + (jsonStr.length > 300 ? '...' : ''));
    } catch (e) {
      Alert.alert('Export Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Travel Journal</Text>
            <Text style={styles.headerSub}>Persistent Trip Log & Storage</Text>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 5: EXPORT JOURNAL BUTTON (Line 65 - Line 68)
         * Purpose: JSON ડેટા એક્સપોર્ટ ફંકશનલ બટન.
         * Working: handleExportJSON ફંક્શન ટ્રિગર કરે છે.
         * =================================================================================
         */}
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportJSON} activeOpacity={0.85}>
          <Ionicons name="download-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.exportBtnText}>EXPORT JOURNAL AS JSON</Text>
        </TouchableOpacity>

        {/**
         * =================================================================================
         * FEATURE 6: QUICK ADD JOURNAL FORM CARD (Line 71 - Line 98)
         * Purpose: ડેસ્ટિનેશન અને ટ્રાવેલ નોટ્સ એન્ટર કરીને કાયમી સેવ કરવા માટેનું ફોર્મ.
         * Working: TextInput ની વેલ્યુસ handleAddManualEntry ફંક્શનમાં પાસ થઈ સેવ થાય છે.
         * =================================================================================
         */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Quick Journal Entry</Text>
          <View style={styles.inputBox}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Destination / Location..."
              placeholderTextColor="#64748B"
              value={locationInput}
              onChangeText={setLocationInput}
            />
          </View>
          <View style={styles.inputBox}>
            <Ionicons name="document-text-outline" size={16} color="#64748B" />
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Travel notes & memories..."
              placeholderTextColor="#64748B"
              multiline
              value={notesInput}
              onChangeText={setNotesInput}
            />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleAddManualEntry} activeOpacity={0.85}>
            <Ionicons name="save-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>SAVE TO ASYNCSTORAGE</Text>
          </TouchableOpacity>
        </View>

        {/**
         * =================================================================================
         * FEATURE 7: STORED JOURNAL LOGS LIST (Line 101 - Line 131)
         * Purpose: સેવ થયેલી તમામ જર્નલ એન્ટ્રીઓ (ફોટા, એડ્રેસ, નોટ્સ, ટાઈમસ્ટેમ્પ) લિસ્ટમાં દર્શાવવી.
         * Working: entries.map વડે દરેક આઈટમ માટે કસ્ટમ કાર્ડ અને Delete બટન રેન્ડર થાય છે.
         * =================================================================================
         */}
        <Text style={styles.subTitle}>STORED JOURNAL LOGS ({entries.length})</Text>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="journal-outline" size={36} color="#64748B" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyText}>No travel journal entries logged yet.</Text>
          </View>
        ) : (
          entries.map((item) => (
            <View key={item.id} style={styles.journalCard}>
              {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.journalImage} />}
              <View style={styles.journalContent}>
                <View style={styles.journalHeaderRow}>
                  <Ionicons name="pin" size={14} color="#38BDF8" />
                  <Text style={styles.journalTitle} numberOfLines={1}>{item.address || 'Location'}</Text>
                </View>
                <Text style={styles.journalNotes}>{item.notes}</Text>
                <Text style={styles.journalMeta}>
                  Lat: {item.latitude} | Lon: {item.longitude}
                </Text>
                <View style={styles.journalFooter}>
                  <Text style={styles.journalTime}>📅 {item.timestamp}</Text>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={12} color="#EF4444" style={{ marginRight: 2 }} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
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

  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 14, marginBottom: 16, elevation: 3 },
  exportBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  card: { width: '100%', backgroundColor: '#1E293B', padding: 16, borderRadius: 16, marginBottom: 18, borderWidth: 1, borderColor: '#334155', gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', gap: 8 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 13, paddingVertical: 10 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  subTitle: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 12 },
  emptyCard: { width: '100%', backgroundColor: '#1E293B', padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  journalCard: { width: '100%', backgroundColor: '#1E293B', borderRadius: 16, marginBottom: 12, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: '#334155' },
  journalImage: { width: 100, height: '100%' },
  journalContent: { flex: 1, padding: 12 },
  journalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  journalTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC', flex: 1 },
  journalNotes: { fontSize: 12, color: '#94A3B8', marginVertical: 4 },
  journalMeta: { fontSize: 10, color: '#64748B', fontFamily: 'monospace' },
  journalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderColor: '#334155' },
  journalTime: { fontSize: 10, color: '#94A3B8' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  deleteBtnText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
});

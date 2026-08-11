import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView, Modal, TextInput, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * =================================================================================
 * FEATURE 1: MEDIA VAULT STATE MANAGEMENT (Line 6 - Line 11)
 * Purpose: ગેલરી ફોટોસ, ફેવરિટ ફિલ્ટર, અને મોડલ રીનેમ સ્ટેટ કંટ્રોલ કરવા.
 * Working: useState વડે galleryItems array, filterFavorite boolean અને editingItem object સ્ટોર થાય છે.
 * =================================================================================
 */
export default function GalleryTab() {
  const [galleryItems, setGalleryItems] = useState([]); // Vault ફોટોસનો એરે
  const [filterFavorite, setFilterFavorite] = useState(false); // All Photos vs Favorites ફિલ્ટર ટૉગલ
  const [editingItem, setEditingItem] = useState(null); // Rename માટે પસંદ થયેલ ફોટો
  const [renameInput, setRenameInput] = useState(''); // Rename મોડલનું ટેક્સ્ટ ઈનપુટ

  /**
   * =================================================================================
   * FEATURE 2: TOGGLE FAVORITE HEART (Line 12 - Line 16)
   * Purpose: ફોટા પર Heart Icon પ્રેસ કરીને તેને Favorites લિસ્ટમાં ઉમેરવા અથવા દૂર કરવા.
   * Working: isFavorite boolean property ને (true/false) ટૉગલ કરે છે.
   * =================================================================================
   */
  const toggleFavorite = (id) => {
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  /**
   * =================================================================================
   * FEATURE 3: DELETE PHOTO WITH CONFIRMATION ALERT (Line 18 - Line 29)
   * Purpose: મીડિયા વોલ્ટ માંથી ફોટો કાયમી માટે ડીલીટ કરતા પહેલાં Confirmation Pop-up આપવું.
   * Working: Alert.alert વડે Confirm કરાવ્યા પછી galleryItems માંથી filter કરીને રિમૂવ કરે છે.
   * =================================================================================
   */
  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Delete this photo from vault?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setGalleryItems((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  /**
   * =================================================================================
   * FEATURE 4: RENAME PHOTO MODAL CONTROLLER (Line 31 - Line 42)
   * Purpose: ફોટાનું નામ બદલવા માટે Rename Modal ખોલવું અને નવી ફાઈલ નેમ સેવ કરવી.
   * Working: openRenameModal વડે મોડલ ઓપન થાય છે અને handleSaveRename વડે નવું નામ અપડેટ થાય છે.
   * =================================================================================
   */
  const openRenameModal = (item) => {
    setEditingItem(item);
    setRenameInput(item.name);
  };

  const handleSaveRename = () => {
    if (!renameInput.trim()) return;
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? { ...item, name: renameInput } : item))
    );
    setEditingItem(null);
  };

  /**
   * =================================================================================
   * FEATURE 5: FAVORITES FILTER COMPUTATION (Line 44 - Line 46)
   * Purpose: યુઝરે પસંદ કરેલ ફિલ્ટર (All Photos કે Favorites) મુજબ ફોટા દર્શાવવા.
   * Working: filterFavorite = true હોય ત્યારે ફક્ત isFavorite === true વાળા ફોટા દેખાય છે.
   * =================================================================================
   */
  const displayedItems = filterFavorite
    ? galleryItems.filter((item) => item.isFavorite)
    : galleryItems;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Media Vault</Text>
            <Text style={styles.headerSub}>Secured Media Storage & Favorites</Text>
          </View>
        </View>

        {/**
         * =================================================================================
         * FEATURE 6: SEGMENTED FILTER TABS (Line 60 - Line 78)
         * Purpose: All Photos (0) અને Favorites (0) વચ્ચે સ્વિચ કરવા માટેની ટેબ લિસ્ટ.
         * Working: TouchableOpacity ક્લીક પર setFilterFavorite(true/false) સેટ થાય છે.
         * =================================================================================
         */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, !filterFavorite && styles.activeFilterBtn]}
            onPress={() => setFilterFavorite(false)}
          >
            <Text style={[styles.filterText, !filterFavorite && styles.activeFilterText]}>
              All Photos ({galleryItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filterFavorite && styles.activeFilterBtn]}
            onPress={() => setFilterFavorite(true)}
          >
            <Text style={[styles.filterText, filterFavorite && styles.activeFilterText]}>
              Favorites ({galleryItems.filter((i) => i.isFavorite).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/**
         * =================================================================================
         * FEATURE 7: MEDIA GRID CARDS WITH HEART, RENAME & DELETE ACTIONS (Line 81 - Line 118)
         * Purpose: સેવ થયેલા ફોટા 2-Column Grid માં રેન્ડર કરવા અને દરેક ફોટા પર Favorite, Edit Name અને Delete બટન્સ આપવા.
         * Working: displayedItems.map વડે ફોટાનું કાર્ડ બને છે અને Ionicons Action Triggers રન થાય છે.
         * =================================================================================
         */}
        <View style={styles.grid}>
          {displayedItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="images-outline" size={40} color="#64748B" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>No photos found in media vault.</Text>
            </View>
          ) : (
            displayedItems.map((item) => (
              <View key={item.id} style={styles.gridCard}>
                <Image source={{ uri: item.uri }} style={styles.gridImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemTime}>{item.timestamp}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                      <Ionicons
                        name={item.isFavorite ? 'heart' : 'heart-outline'}
                        size={18}
                        color={item.isFavorite ? '#EF4444' : '#64748B'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openRenameModal(item)}>
                      <Ionicons name="pencil-outline" size={18} color="#0EA5E9" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/**
         * =================================================================================
         * FEATURE 8: RENAME MEDIA DIALOG MODAL (Line 121 - Line 141)
         * Purpose: પસંદ કરેલ ફોટાનું નામ બદલવા માટેનું કસ્ટમ પૉપઅપ મોડલ.
         * Working: TextInput ની વૅલ્યુ સબમિટ કરતાં handleSaveRename ફંક્શન વડે ફાઈલ નેમ બદલાઈ જાય છે.
         * =================================================================================
         */}
        <Modal visible={!!editingItem} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Rename Media File</Text>
              <TextInput
                style={styles.input}
                value={renameInput}
                onChangeText={setRenameInput}
                placeholderTextColor="#64748B"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingItem(null)}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveRename}>
                  <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
              </View>
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

  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  filterRow: { flexDirection: 'row', width: '100%', marginBottom: 16, gap: 10, backgroundColor: '#1E293B', padding: 4, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  activeFilterBtn: { backgroundColor: '#0EA5E9' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  activeFilterText: { color: '#FFF' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  gridCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 16, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  gridImage: { width: '100%', height: 130 },
  cardInfo: { padding: 10 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  itemTime: { fontSize: 10, color: '#64748B', marginTop: 2 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#334155' },

  emptyCard: { width: '100%', backgroundColor: '#1E293B', padding: 36, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '90%', backgroundColor: '#1E293B', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },
  input: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, color: '#F8FAFC', fontSize: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  saveBtn: { backgroundColor: '#10B981', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  cancelBtn: { backgroundColor: '#334155', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});

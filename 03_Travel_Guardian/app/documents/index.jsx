// Travel Guardian - Secure Document Vault Screen
// Features: Offline-first caching, live search, category filter, favorites, rename, preview, export to gallery, theme support

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import EmptyState from '../../components/EmptyState';
import {
  getDocuments,
  getCachedDocuments,
  updateDocument,
  deleteDocument,
} from '../../services/documentService';
import { saveMediaToGallery } from '../../services/vaultService';
import { API_BASE_URL } from '../../services/api';
import BiometricLockModal from '../../components/BiometricLockModal';

export default function DocumentsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();

  // Biometric & Authorization Lock State
  const [isVaultLocked, setIsVaultLocked] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const filters = ['All', 'Passport', 'ID Card', 'Visa', 'Insurance', 'Tickets', 'Other'];

  // Documents List State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal Preview State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Rename Modal State
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');
  const [docToRename, setDocToRename] = useState(null);

  // -------------------------------------------------------------
  // Load Documents (Local Cache First, then Backend Sync)
  // -------------------------------------------------------------
  const loadDocuments = useCallback(async (isPullRefresh = false) => {
    try {
      if (!isPullRefresh) {
        // Fast local-first render
        const cached = await getCachedDocuments();
        if (cached && cached.length > 0) {
          setDocuments(cached);
          setLoading(false);
        }
      }

      // Sync latest from backend
      const res = await getDocuments();
      if (res?.data && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.log('[Documents] Load notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments(true);
  };

  // -------------------------------------------------------------
  // Filtered & Sorted Documents (Favorites first, then search & category)
  // -------------------------------------------------------------
  const filteredDocs = useMemo(() => {
    let result = [...documents];

    // Category filter
    if (selectedFilter !== 'All') {
      const f = selectedFilter.toLowerCase();
      result = result.filter((doc) => {
        const type = (doc.documentType || '').toLowerCase();
        if (f === 'id card') return type.includes('id') || type.includes('driving') || type.includes('license') || type.includes('aadhaar');
        if (f === 'tickets') return type.includes('ticket') || type.includes('flight') || type.includes('hotel') || type.includes('booking');
        return type.includes(f);
      });
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((doc) => {
        const titleMatch = (doc.title || '').toLowerCase().includes(q);
        const typeMatch = (doc.documentType || '').toLowerCase().includes(q);
        const dateMatch = (doc.expiryDate || '').toLowerCase().includes(q);
        return titleMatch || typeMatch || dateMatch;
      });
    }

    // Sort favorites to top, then newest
    return result.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [documents, selectedFilter, searchQuery]);

  // Document type icon helper
  const getDocumentIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('passport')) return 'book-outline';
    if (t.includes('id') || t.includes('driving') || t.includes('license') || t.includes('aadhaar')) return 'card-outline';
    if (t.includes('visa')) return 'globe-outline';
    if (t.includes('insurance')) return 'shield-checkmark-outline';
    if (t.includes('ticket') || t.includes('flight') || t.includes('boarding')) return 'airplane-outline';
    if (t.includes('hotel') || t.includes('booking')) return 'bed-outline';
    return 'document-text-outline';
  };

  const getDocImageUrl = (doc) => {
    if (!doc) return null;
    if (doc.fileUrl && doc.fileUrl.startsWith('http')) return doc.fileUrl;
    if (doc.fileUrl) return API_BASE_URL.replace('/api', '') + doc.fileUrl;
    return doc.imageUri || null;
  };

  // -------------------------------------------------------------
  // Favorite Toggle Action
  // -------------------------------------------------------------
  const handleToggleFavorite = async (doc) => {
    const docId = doc._id || doc.id;
    const nextFav = !doc.isFavorite;

    // Optimistic state update
    setDocuments((prev) =>
      prev.map((d) => ((d._id || d.id) === docId ? { ...d, isFavorite: nextFav } : d))
    );

    if (previewDoc && (previewDoc._id || previewDoc.id) === docId) {
      setPreviewDoc((prev) => (prev ? { ...prev, isFavorite: nextFav } : null));
    }

    try {
      await updateDocument(docId, { isFavorite: nextFav });
    } catch (err) {
      console.log('[Documents] Favorite error:', err.message);
    }
  };

  // -------------------------------------------------------------
  // Rename Document Action
  // -------------------------------------------------------------
  const openRenameModal = (doc) => {
    setDocToRename(doc);
    setRenameTitle(doc.title || '');
    setRenameModalVisible(true);
  };

  const handleSaveRename = async () => {
    if (!renameTitle.trim() || !docToRename) {
      Alert.alert('Required', 'Please enter a document title.');
      return;
    }

    const docId = docToRename._id || docToRename.id;
    const newTitle = renameTitle.trim();

    // Optimistic UI update
    setDocuments((prev) =>
      prev.map((d) => ((d._id || d.id) === docId ? { ...d, title: newTitle } : d))
    );

    if (previewDoc && (previewDoc._id || previewDoc.id) === docId) {
      setPreviewDoc((prev) => (prev ? { ...prev, title: newTitle } : null));
    }

    setRenameModalVisible(false);

    try {
      await updateDocument(docId, { title: newTitle });
    } catch (err) {
      console.log('[Documents] Rename notice:', err.message);
    }
  };

  // -------------------------------------------------------------
  // Save / Export to Gallery Action
  // -------------------------------------------------------------
  const handleExportToGallery = async (doc) => {
    const imgUrl = getDocImageUrl(doc);
    if (!imgUrl) {
      Alert.alert('Export Notice', 'No image file found to export.');
      return;
    }

    try {
      setExporting(true);
      await saveMediaToGallery(imgUrl);
      Alert.alert('Saved to Gallery! 📥', `"${doc.title}" has been saved to your device photos.`);
    } catch (err) {
      Alert.alert('Export Failed', err.message || 'Could not save to gallery.');
    } finally {
      setExporting(false);
    }
  };

  // -------------------------------------------------------------
  // Delete Document with Confirmation
  // -------------------------------------------------------------
  const handleDeleteDoc = (doc) => {
    Alert.alert(
      'Delete Document?',
      `Are you sure you want to remove "${doc.title}" from your vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const docId = doc._id || doc.id;

            // Optimistic removal
            setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== docId));

            if (previewDoc && (previewDoc._id || previewDoc.id) === docId) {
              setPreviewDoc(null);
            }

            try {
              await deleteDocument(docId);
            } catch (err) {
              console.log('[Documents] Delete error:', err.message);
            }
          },
        },
      ]
    );
  };

  // -------------------------------------------------------------
  // Render Document Card
  // -------------------------------------------------------------
  const renderDocCard = ({ item }) => (
    <Pressable
      style={[
        styles.docCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() => setPreviewDoc(item)}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
        <Ionicons name={getDocumentIcon(item.documentType)} size={22} color={theme.primary} />
      </View>

      <View style={styles.docDetails}>
        <View style={styles.titleRow}>
          <Text style={[styles.docTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: theme.surface }]}>
            <Text style={[styles.typeBadgeText, { color: theme.textSecondary }]}>
              {item.documentType || 'Document'}
            </Text>
          </View>
        </View>

        <Text style={[styles.docExpiry, { color: theme.textSecondary }]}>
          {item.expiryDate ? `Expires: ${item.expiryDate}` : 'No Expiration Date'}
        </Text>

        <View style={styles.offlineStatusRow}>
          <Ionicons name="shield-checkmark" size={12} color={theme.secondary} />
          <Text style={[styles.offlineStatusText, { color: theme.secondary }]}>Offline Safe</Text>
        </View>
      </View>

      <View style={styles.cardActionGroup}>
        <Pressable
          style={styles.starButton}
          onPress={() => handleToggleFavorite(item)}
        >
          <Ionicons
            name={item.isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={item.isFavorite ? '#EAB308' : theme.textLight}
          />
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteDoc(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. Vault Security Header Banner */}
      <View style={[styles.banner, { backgroundColor: isDarkMode ? '#131D31' : '#F1F5F9', borderColor: theme.border }]}>
        <View style={[styles.bannerIcon, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerHeading, { color: theme.text }]}>🔐 Secure Travel Documents</Text>
          <Text style={[styles.bannerDesc, { color: theme.textSecondary }]}>
            Biometric-protected vault for your passport, Aadhaar, IDs, and tickets.
          </Text>
        </View>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isVaultLocked ? colors.danger : colors.primary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            gap: 4,
          }}
          onPress={() => setIsVaultLocked(true)}
        >
          <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>Lock Vault</Text>
        </Pressable>
      </View>

      {/* 2. Top Action Bar & Live Search */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textLight} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search documents by name or type…"
            placeholderTextColor={theme.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textLight} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.scanBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/documents/scanner')}
        >
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.scanBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* 3. Filter Category Pills */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterPill,
                { backgroundColor: selectedFilter === item ? theme.primary : theme.card, borderColor: theme.border },
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: selectedFilter === item ? colors.white : theme.textSecondary },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* 4. Documents FlatList */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading secure documents…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          renderItem={renderDocCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title={searchQuery ? 'No Matching Documents' : 'No Travel Documents Yet'}
              description={
                searchQuery
                  ? `No files found matching "${searchQuery}". Try a different search.`
                  : 'Keep your passport, ID, visa and tickets organized for quick access.'
              }
              buttonTitle="+ Add Document"
              onButtonPress={() => router.push('/documents/scanner')}
            />
          }
        />
      )}

      {/* 5. Clean Document Preview Modal */}
      <Modal
        visible={previewDoc !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                  {previewDoc?.title}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {previewDoc?.documentType || 'Travel Document'}
                </Text>
              </View>
              <Pressable onPress={() => setPreviewDoc(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {/* Document Image Preview */}
            {getDocImageUrl(previewDoc) ? (
              <Image
                source={{ uri: getDocImageUrl(previewDoc) }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.modalImagePlaceholder, { backgroundColor: theme.background }]}>
                <Ionicons name="document-text" size={54} color={theme.textLight} />
                <Text style={[styles.modalImagePlaceholderText, { color: theme.textSecondary }]}>
                  Document stored securely in local vault
                </Text>
              </View>
            )}

            {/* Document Metadata Details */}
            <View style={[styles.modalInfoBox, { backgroundColor: theme.surface }]}>
              <View style={styles.modalInfoRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Document Type:</Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>{previewDoc?.documentType || 'General'}</Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Valid Until:</Text>
                <Text style={[styles.modalValue, { color: theme.text }]}>
                  {previewDoc?.expiryDate || 'No Expiry Date'}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Storage Status:</Text>
                <Text style={[styles.modalValue, { color: theme.secondary }]}>
                  ✓ Available Offline
                </Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.modalActionGrid}>
              <Pressable
                style={[styles.modalActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => previewDoc && handleToggleFavorite(previewDoc)}
              >
                <Ionicons
                  name={previewDoc?.isFavorite ? 'star' : 'star-outline'}
                  size={18}
                  color={previewDoc?.isFavorite ? '#EAB308' : theme.text}
                />
                <Text style={[styles.modalActionBtnText, { color: theme.text }]}>
                  {previewDoc?.isFavorite ? 'Favorited' : 'Favorite'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => previewDoc && openRenameModal(previewDoc)}
              >
                <Ionicons name="pencil" size={16} color={theme.text} />
                <Text style={[styles.modalActionBtnText, { color: theme.text }]}>Rename</Text>
              </Pressable>

              <Pressable
                style={[styles.modalActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => previewDoc && handleExportToGallery(previewDoc)}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={18} color={theme.primary} />
                    <Text style={[styles.modalActionBtnText, { color: theme.primary }]}>Export</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.modalActionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
                onPress={() => previewDoc && handleDeleteDoc(previewDoc)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={[styles.modalActionBtnText, { color: colors.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. Rename Title Modal */}
      <Modal
        visible={renameModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.renameCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.renameTitle, { color: theme.text }]}>Rename Document</Text>
            <TextInput
              style={[
                styles.renameInput,
                { backgroundColor: theme.inputBg || theme.background, color: theme.text, borderColor: theme.border },
              ]}
              value={renameTitle}
              onChangeText={setRenameTitle}
              placeholder="Enter new document title"
              placeholderTextColor={theme.textLight}
              autoFocus
            />
            <View style={styles.renameActionsRow}>
              <Pressable
                style={[styles.renameCancelBtn, { borderColor: theme.border }]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={[styles.renameCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.renameSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveRename}
              >
                <Text style={styles.renameSaveText}>Save Name</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* 7. Biometric & Authorization Security Lock Shield */}
      <BiometricLockModal
        visible={isVaultLocked}
        onUnlock={() => setIsVaultLocked(false)}
        onCancel={() => router.back()}
        title="Personal Documents Vault Locked"
        subtitle="Authorize with Fingerprint, Face ID, or 4-digit PIN to access your passport, IDs & tickets."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    gap: 4,
  },
  scanBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  docExpiry: {
    fontSize: 11,
    marginBottom: 3,
  },
  offlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offlineStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  // Modal Preview Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#000',
    marginBottom: 12,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modalImagePlaceholderText: {
    fontSize: 12,
  },
  modalInfoBox: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalLabel: {
    fontSize: 12,
  },
  modalValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  modalActionBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Rename Modal
  renameCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  renameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  renameInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  renameActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  renameCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  renameSaveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameSaveText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});


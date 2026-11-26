// Travel Guardian - Safety Media & Evidence Vault
// Complete in-app vault with local offline storage, backend sync, and Gallery export

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import EmptyState from '../../components/EmptyState';
import { getMedia, uploadMedia, deleteMedia } from '../../services/mediaService';
import { getVaultItems, saveToVault, deleteFromVault, saveMediaToGallery } from '../../services/vaultService';
import { isEmpty } from '../../utils/validation';
import { API_BASE_URL } from '../../services/api';
import VideoPlayerView from '../../components/VideoPlayerView';

export default function MediaScreen() {
  // Combined Media list (Local Vault + Backend Server)
  const [mediaList, setMediaList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected Media Pending Upload State
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaLocation, setMediaLocation] = useState('');

  // Processing & Action States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savingGalleryId, setSavingGalleryId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState(null);

  // Load both local vault items and backend items on mount
  useEffect(() => {
    loadAllMedia();
  }, []);

  const loadAllMedia = async () => {
    try {
      setLoadingList(true);
      setErrorMsg(null);

      // 1. Load local vault items first (Fast & Offline)
      const localItems = await getVaultItems();

      // 2. Try loading backend items
      let backendItems = [];
      try {
        const response = await getMedia();
        backendItems = response.data || [];
      } catch (backendErr) {
        console.log('Backend media sync notice (using local vault):', backendErr.message);
      }

      // 3. Merge lists, placing newest items on top and avoiding duplicate IDs
      const combined = [...localItems];
      for (const bItem of backendItems) {
        const exists = combined.some((l) => l.id === (bItem._id || bItem.id));
        if (!exists) {
          combined.push(bItem);
        }
      }

      setMediaList(combined);
    } catch (error) {
      console.log('Could not load media:', error.message);
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllMedia();
  }, []);

  // Validation Helper
  const validateMedia = (asset) => {
    if (!asset || !asset.uri) {
      setErrorMsg('Invalid media file selected.');
      return false;
    }

    // Check file size (limit to 50MB)
    if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
      Alert.alert('File Too Large', 'Please select a video or photo smaller than 50MB.');
      return false;
    }

    return true;
  };

  // Image Compression & Resizing using Expo Image Manipulator
  const compressAndResizeImage = async (imageUri) => {
    try {
      setIsProcessing(true);
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult;
    } catch (error) {
      console.log('Image manipulation error:', error.message);
      return { uri: imageUri, width: 1080, height: 1080 };
    } finally {
      setIsProcessing(false);
    }
  };

  // Pick Image from Device Gallery
  const pickImageFromGallery = async () => {
    try {
      setErrorMsg(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to select media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!validateMedia(asset)) return;

        const compressed = await compressAndResizeImage(asset.uri);

        setSelectedMedia({
          uri: compressed.uri,
          type: 'photo',
          name: asset.fileName || 'safety_photo.jpg',
          size: asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : 'Compressed JPEG',
          width: compressed.width,
          height: compressed.height,
        });

        setMediaTitle('Incident Evidence Photo');
      }
    } catch (error) {
      setErrorMsg('Failed to pick image: ' + error.message);
    }
  };

  // Pick Video from Device Gallery
  const pickVideoFromGallery = async () => {
    try {
      setErrorMsg(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to select videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!validateMedia(asset)) return;

        const durationSeconds = asset.duration ? Math.round(asset.duration / 1000) : 0;

        setSelectedMedia({
          uri: asset.uri,
          type: 'video',
          name: asset.fileName || 'safety_video.mp4',
          size: asset.fileSize ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Video File',
          duration: `${durationSeconds}s duration`,
        });

        setMediaTitle('Incident Evidence Video');
      }
    } catch (error) {
      setErrorMsg('Failed to pick video: ' + error.message);
    }
  };

  // Save selected media to Vault (Local + Backend)
  const handleSaveToVault = async () => {
    if (!selectedMedia) return;

    if (isEmpty(mediaTitle)) {
      Alert.alert('Validation Error', 'Please give this evidence item a title.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);

      // 1. Immediately save to local Vault
      const localItem = await saveToVault({
        uri: selectedMedia.uri,
        type: selectedMedia.type,
        title: mediaTitle.trim(),
        location: mediaLocation.trim() || 'Safe Vault Archive',
      });

      // Update UI immediately with new item at top
      setMediaList((prev) => [localItem, ...prev]);

      // 2. Trigger asynchronous background upload to backend
      const formData = new FormData();
      formData.append('title', mediaTitle.trim());
      formData.append('mediaType', selectedMedia.type);
      formData.append('location', mediaLocation.trim());
      formData.append('file', {
        uri: selectedMedia.uri,
        name: selectedMedia.name || (selectedMedia.type === 'photo' ? 'upload.jpg' : 'upload.mp4'),
        type: selectedMedia.type === 'photo' ? 'image/jpeg' : 'video/mp4',
      });

      uploadMedia(formData).catch((err) => {
        console.log('Background upload notice:', err.message);
      });

      setSelectedMedia(null);
      setMediaTitle('');
      setMediaLocation('');

      Alert.alert('Saved to Vault! 🛡️', 'Evidence safely stored in your Travel Guardian Vault.');
    } catch (error) {
      setErrorMsg('Failed to save: ' + error.message);
      Alert.alert('Notice', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Export any Vault media item to Device Gallery
  const handleExportMedia = async (item) => {
    const itemUri = item.uri || getFileUrl(item);
    if (!itemUri) {
      Alert.alert('Error', 'Cannot find media source file to export.');
      return;
    }

    const itemId = item._id || item.id;
    try {
      setSavingGalleryId(itemId);
      await saveMediaToGallery(itemUri);
      Alert.alert('Saved to Gallery! 🖼️', `"${item.title || 'Evidence'}" has been exported to your device gallery.`);
    } catch (error) {
      Alert.alert('Gallery Error', error.message || 'Could not export media to gallery.');
    } finally {
      setSavingGalleryId(null);
    }
  };

  // Delete Media Item (Local Vault and/or Backend)
  const handleDeleteMedia = (item) => {
    Alert.alert(
      'Delete Evidence',
      `Are you sure you want to remove "${item.title || 'this item'}" from your Vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const itemId = item._id || item.id;
            try {
              // Delete locally
              if (item.isLocal || (item.id && item.id.startsWith('vault_'))) {
                await deleteFromVault(item.id);
              }

              // Delete from backend if backend ID exists
              if (item._id) {
                await deleteMedia(item._id).catch(() => {});
              }

              // Update state immediately
              setMediaList((prev) => prev.filter((m) => (m._id || m.id) !== itemId));
              if (previewItem && (previewItem._id || previewItem.id) === itemId) {
                setPreviewItem(null);
              }
            } catch (error) {
              Alert.alert('Delete Error', error.message);
            }
          },
        },
      ]
    );
  };

  // Build the full URL for a media item
  const getFileUrl = (item) => {
    if (!item) return null;
    if (item.uri) return item.uri;
    if (item.fileUrl && item.fileUrl.startsWith('http')) return item.fileUrl;
    if (item.fileUrl) return API_BASE_URL.replace('/api', '') + item.fileUrl;
    return null;
  };

  // Render individual media item in FlatList
  const renderMediaItem = ({ item }) => {
    const fileUrl = getFileUrl(item);
    const isVideo = item.mediaType === 'video';
    const itemId = item._id || item.id;
    const isExporting = savingGalleryId === itemId;

    return (
      <Pressable
        style={styles.mediaCard}
        onPress={() => setPreviewItem(item)}
      >
        {/* Thumbnail Box */}
        <View style={styles.thumbnailWrapper}>
          {fileUrl && !isVideo ? (
            <Image source={{ uri: fileUrl }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.videoThumbPlaceholder]}>
              <Ionicons name={isVideo ? 'videocam' : 'image'} size={28} color={colors.white} />
            </View>
          )}

          <View style={[styles.typeBadge, isVideo && styles.typeBadgeVideo]}>
            <Ionicons
              name={isVideo ? 'videocam' : 'camera'}
              size={11}
              color={colors.white}
            />
            <Text style={styles.typeBadgeText}>{isVideo ? 'VIDEO' : 'PHOTO'}</Text>
          </View>
        </View>

        {/* Info Column */}
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaTitle} numberOfLines={1}>{item.title || 'Safety Evidence'}</Text>
          <Text style={styles.mediaDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
          </Text>
          {item.location ? (
            <Text style={styles.mediaLocation} numberOfLines={1}>📍 {item.location}</Text>
          ) : null}
        </View>

        {/* Action Buttons: Save to Gallery & Delete */}
        <View style={styles.cardActionsRow}>
          <Pressable
            style={styles.cardActionBtn}
            onPress={() => handleExportMedia(item)}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="download-outline" size={20} color={colors.primary} />
            )}
          </Pressable>

          <Pressable
            style={styles.cardActionBtn}
            onPress={() => handleDeleteMedia(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Action Buttons (Pick Image & Pick Video) */}
      <View style={styles.actionButtonsRow}>
        <Pressable
          style={[styles.actionBtn, styles.photoBtn]}
          onPress={pickImageFromGallery}
          disabled={isProcessing || isUploading}
        >
          <Ionicons name="image" size={18} color={colors.white} />
          <Text style={styles.actionBtnText}>Pick Photo</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.videoBtn]}
          onPress={pickVideoFromGallery}
          disabled={isProcessing || isUploading}
        >
          <Ionicons name="videocam" size={18} color={colors.white} />
          <Text style={styles.actionBtnText}>Pick Video</Text>
        </Pressable>
      </View>

      {/* 2. Processing Banner */}
      {isProcessing && (
        <View style={styles.processingBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>Optimizing media...</Text>
        </View>
      )}

      {/* 3. Error Banner */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      )}

      {/* 4. Selected Media Staging Box */}
      {selectedMedia && (
        <View style={styles.uploadCard}>
          <View style={styles.uploadCardHeader}>
            <Text style={styles.uploadCardTitle}>Add Evidence to Vault</Text>
            <Pressable onPress={() => setSelectedMedia(null)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.selectedMediaRow}>
            {selectedMedia.type === 'photo' ? (
              <Image source={{ uri: selectedMedia.uri }} style={styles.selectedThumbnail} />
            ) : (
              <View style={[styles.selectedThumbnail, styles.videoSelectedThumb]}>
                <Ionicons name="videocam" size={24} color={colors.white} />
              </View>
            )}
            <View style={styles.selectedDetails}>
              <Text style={styles.selectedName} numberOfLines={1}>{selectedMedia.name}</Text>
              <Text style={styles.selectedMeta}>
                {selectedMedia.size || selectedMedia.duration || 'Evidence item'}
              </Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Taxi License Plate, Hotel Receipt"
            placeholderTextColor={colors.textLight}
            value={mediaTitle}
            onChangeText={setMediaTitle}
          />

          <Text style={styles.inputLabel}>Location Tag</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Rome Airport, Central Station"
            placeholderTextColor={colors.textLight}
            value={mediaLocation}
            onChangeText={setMediaLocation}
          />

          <Pressable
            style={[styles.uploadSubmitBtn, isUploading && styles.uploadSubmitDisabled]}
            onPress={handleSaveToVault}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={18} color={colors.white} />
                <Text style={styles.uploadSubmitText}>Save to Vault</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* 5. Header Title */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionHeading}>Vault Archive ({mediaList.length})</Text>
      </View>

      {/* 6. Media List (FlatList) */}
      {loadingList ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Opening Vault...</Text>
        </View>
      ) : (
        <FlatList
          data={mediaList}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderMediaItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="shield-outline"
              title="Vault is Empty"
              description="Capture safety photos, record evidence videos, or import files to keep them safe in your encrypted vault."
            />
          }
        />
      )}

      {/* 7. Preview Modal */}
      <Modal
        visible={!!previewItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {previewItem?.title || 'Evidence Preview'}
              </Text>
              <Pressable onPress={() => setPreviewItem(null)}>
                <Ionicons name="close-circle" size={24} color={colors.white} />
              </Pressable>
            </View>

            {previewItem && (
              <View style={styles.modalBody}>
                {previewItem.mediaType === 'photo' && getFileUrl(previewItem) ? (
                  <Image
                    source={{ uri: getFileUrl(previewItem) }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <VideoPlayerView
                    uri={getFileUrl(previewItem)}
                    style={styles.modalImage}
                    autoPlay={true}
                  />
                )}

                <View style={styles.modalMetaBox}>
                  <Text style={styles.modalMetaText}>
                    📅 {previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleString() : 'Recent'}
                  </Text>
                  {previewItem.location ? (
                    <Text style={styles.modalMetaText}>📍 {previewItem.location}</Text>
                  ) : null}
                </View>

                {/* Modal Action Buttons */}
                <View style={styles.modalActionsRow}>
                  <Pressable
                    style={[styles.modalBtn, styles.modalGalleryBtn]}
                    onPress={() => handleExportMedia(previewItem)}
                  >
                    <Ionicons name="download-outline" size={18} color={colors.white} />
                    <Text style={styles.modalBtnText}>Save to Gallery</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalBtn, styles.modalDeleteBtn]}
                    onPress={() => handleDeleteMedia(previewItem)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.white} />
                    <Text style={styles.modalBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoBtn: {
    backgroundColor: colors.primary,
  },
  videoBtn: {
    backgroundColor: '#7C3AED',
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  processingText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorBannerText: {
    color: colors.white,
    fontSize: 12,
    flex: 1,
  },
  uploadCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedMediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  selectedThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  videoSelectedThumb: {
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDetails: {
    flex: 1,
  },
  selectedName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
    color: colors.text,
  },
  uploadSubmitBtn: {
    backgroundColor: colors.secondary,
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  uploadSubmitDisabled: {
    opacity: 0.6,
  },
  uploadSubmitText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  listHeaderRow: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 10,
  },
  mediaCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailWrapper: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbPlaceholder: {
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  typeBadgeVideo: {
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
  },
  typeBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  mediaInfo: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  mediaDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mediaLocation: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionBtn: {
    padding: 8,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    marginRight: 8,
  },
  modalBody: {
    padding: 14,
  },
  modalImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  modalVideoPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalVideoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalVideoPath: {
    color: colors.textLight,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  modalMetaBox: {
    marginTop: 12,
    gap: 4,
  },
  modalMetaText: {
    color: colors.textLight,
    fontSize: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalGalleryBtn: {
    backgroundColor: colors.primary,
  },
  modalDeleteBtn: {
    backgroundColor: colors.danger,
  },
  modalBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});

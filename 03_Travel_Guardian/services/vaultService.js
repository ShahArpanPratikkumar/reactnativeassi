// Travel Guardian - Local Media Vault & Gallery Export Service
// Beginner-friendly local storage for safety photos, videos, and gallery saving

import AsyncStorage from '@react-native-async-storage/async-storage';

const VAULT_STORAGE_KEY = 'travel_guardian_media_vault';

// Safely load MediaLibrary with fallback for Expo Go where ExpoMediaLibraryNext may be absent
let MediaLibrary = null;
try {
  MediaLibrary = require('expo-media-library/legacy');
} catch (e1) {
  try {
    MediaLibrary = require('expo-media-library');
  } catch (e2) {
    console.log('[VaultService] MediaLibrary module unavailable in this environment:', e2.message);
  }
}

// -------------------------------------------------------------
// 1. Get all saved media items from local Vault
// -------------------------------------------------------------
export const getVaultItems = async () => {
  try {
    const data = await AsyncStorage.getItem(VAULT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Error reading vault items:', error.message);
    return [];
  }
};

// -------------------------------------------------------------
// 2. Save a captured or picked media item to local Vault immediately
// -------------------------------------------------------------
export const saveToVault = async ({ uri, type = 'photo', title = '', location = '' }) => {
  try {
    const existing = await getVaultItems();

    const newItem = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      uri,
      mediaType: type, // 'photo' | 'video'
      title: title || (type === 'photo' ? 'Safety Photo' : 'Evidence Video'),
      location: location || '',
      createdAt: new Date().toISOString(),
      isLocal: true,
    };

    // Prepend to top of list
    const updated = [newItem, ...existing];
    await AsyncStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));

    return newItem;
  } catch (error) {
    console.log('Error saving to vault:', error.message);
    throw new Error('Failed to save to local Vault.');
  }
};

// -------------------------------------------------------------
// 3. Delete an item from local Vault
// -------------------------------------------------------------
export const deleteFromVault = async (id) => {
  try {
    const existing = await getVaultItems();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.log('Error deleting from vault:', error.message);
    return false;
  }
};

// -------------------------------------------------------------
// 4. Save any photo or video to Device Gallery using Expo MediaLibrary
// -------------------------------------------------------------
export const saveMediaToGallery = async (uri) => {
  if (!uri) {
    throw new Error('No media file specified to save to gallery.');
  }

  if (!MediaLibrary || typeof MediaLibrary.saveToLibraryAsync !== 'function') {
    throw new Error(
      'Device gallery saving is not supported in this client (Expo Go). Your media is safely stored in the Travel Guardian Vault!'
    );
  }

  try {
    // Request permission to write to device gallery
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Gallery permission denied. Please allow access in device settings.');
    }

    // Save the file to phone's camera roll / gallery
    await MediaLibrary.saveToLibraryAsync(uri);
    return { success: true, message: 'Saved to device Gallery!' };
  } catch (error) {
    console.log('Gallery save error:', error.message);
    throw error;
  }
};

export default {
  getVaultItems,
  saveToVault,
  deleteFromVault,
  saveMediaToGallery,
};

// Travel Guardian - Storage Utility
// Safe AsyncStorage helper with automatic JSON serialization and error handling

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Read and parse JSON from local storage
  async get(key, defaultValue = null) {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (err) {
      console.log(`[Storage] Read error for "${key}":`, err.message);
      return defaultValue;
    }
  },

  // Serialize and save to local storage
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.log(`[Storage] Write error for "${key}":`, err.message);
      return false;
    }
  },

  // Delete key from local storage
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (err) {
      console.log(`[Storage] Remove error for "${key}":`, err.message);
      return false;
    }
  },
};

export default storage;

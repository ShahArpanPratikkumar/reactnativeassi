// Travel Guardian - Authentication Service
// Connects login, register, profile to the backend REST API
// Sensitive user medical & profile data is stored securely using Expo SecureStore
// with fallback to AsyncStorage for Web environments

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, put, saveToken, deleteToken } from './api';

const SECURE_USER_KEY = 'tg_secure_user_data';
const LEGACY_USER_KEY = 'userData';

// -------------------------------------------------------
// Secure Storage Helpers for Sensitive User Profile Data
// -------------------------------------------------------
const setSecureUserData = async (user) => {
  try {
    const serialized = JSON.stringify(user);
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(SECURE_USER_KEY, serialized);
    }
    // Also save in AsyncStorage for fast offline retrieval & web support
    await AsyncStorage.setItem(LEGACY_USER_KEY, serialized);
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[authService] Error saving secure user data:', error.message);
    }
  }
};

const removeSecureUserData = async () => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(SECURE_USER_KEY);
    }
    await AsyncStorage.removeItem(LEGACY_USER_KEY);
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[authService] Error clearing secure user data:', error.message);
    }
  }
};

// -------------------------------------------------------
// Register a new user account
// Sends: { name, email, password, phone, bloodGroup }
// Returns: { success, token, user }
// -------------------------------------------------------
export const registerUser = async (userData) => {
  const data = await post('/auth/register', userData);

  // Save JWT and sensitive profile securely
  if (data.token) {
    await saveToken(data.token);
  }
  if (data.user) {
    await setSecureUserData(data.user);
  }

  return data;
};

// -------------------------------------------------------
// Login existing user
// Sends: { email, password }
// Returns: { success, token, user }
// -------------------------------------------------------
export const loginUser = async (email, password) => {
  const data = await post('/auth/login', { email, password });

  // Save JWT and sensitive profile securely
  if (data.token) {
    await saveToken(data.token);
  }
  if (data.user) {
    await setSecureUserData(data.user);
  }

  return data;
};

// -------------------------------------------------------
// Log out — clears JWT and encrypted cached user data
// -------------------------------------------------------
export const logoutUser = async () => {
  try {
    await deleteToken();
    await removeSecureUserData();
    return true;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[authService] Logout error:', error.message);
    }
    return false;
  }
};

// -------------------------------------------------------
// Get current logged-in user from backend (GET /auth/me)
// Requires valid JWT in SecureStore
// -------------------------------------------------------
export const getUserProfile = async () => {
  return await get('/auth/me');
};

// -------------------------------------------------------
// Update user profile on backend
// Sends: { name, phone, bloodGroup, allergies, emergencyNotes }
// -------------------------------------------------------
export const updateUserProfile = async (profileData) => {
  const data = await put('/auth/profile', profileData);

  // Update encrypted local cache
  if (data.user) {
    await setSecureUserData(data.user);
  }

  return data;
};

// -------------------------------------------------------
// Read cached user data securely (SecureStore first, then fallback)
// -------------------------------------------------------
export const getStoredUser = async () => {
  try {
    // 1. Try SecureStore on mobile
    if (Platform.OS !== 'web') {
      const secureJson = await SecureStore.getItemAsync(SECURE_USER_KEY);
      if (secureJson) return JSON.parse(secureJson);
    }

    // 2. Fallback to AsyncStorage (web or pre-migration cache)
    const legacyJson = await AsyncStorage.getItem(LEGACY_USER_KEY);
    if (legacyJson) {
      const parsed = JSON.parse(legacyJson);
      // Migrate to SecureStore if on native device
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(SECURE_USER_KEY, legacyJson);
      }
      return parsed;
    }
    return null;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('[authService] Error reading stored user:', error.message);
    }
    return null;
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getStoredUser,
};

// Travel Guardian - Shared User Context
// Provides a single source of truth for user profile, name, avatar, and emergency data.
// Updates are instant across Home, Profile, and all screens.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SECURE_USER_KEY = 'tg_secure_user_data';
const LEGACY_USER_KEY = 'userData';

// Write to both SecureStore (native) and AsyncStorage (fallback / web)
const persistUserData = async (data) => {
  const serialized = JSON.stringify(data);
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(SECURE_USER_KEY, serialized);
    }
    await AsyncStorage.setItem(LEGACY_USER_KEY, serialized);
  } catch (err) {
    console.log('[UserContext] persistUserData error:', err.message);
  }
};

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

// Helper to compute stylish 1-2 letter initials
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'TG';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserContext = createContext({
  userName: 'Traveler',
  userEmail: '',
  userPhone: '',
  avatarUri: DEFAULT_AVATAR,
  bloodGroup: '',
  allergies: '',
  emergencyNotes: '',
  updateUser: () => {},
  updateAvatar: () => {},
  refreshUserFromStorage: () => {},
  getInitials: () => 'TG',
});

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('Traveler');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState(DEFAULT_AVATAR);
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');

  // Load saved user data from AsyncStorage and SecureStore
  const loadSavedUser = useCallback(async () => {
    try {
      let userData = null;

      // 1. Try SecureStore on native (most up-to-date after profile saves)
      if (Platform.OS !== 'web') {
        try {
          const secureJson = await SecureStore.getItemAsync(SECURE_USER_KEY);
          if (secureJson) userData = JSON.parse(secureJson);
        } catch {}
      }

      // 2. Fallback: AsyncStorage (web or if SecureStore is empty)
      if (!userData) {
        const json = await AsyncStorage.getItem(LEGACY_USER_KEY);
        if (json) userData = JSON.parse(json);
      }

      // 3. Apply all fields from the merged data
      if (userData) {
        if (userData.name) setUserName(userData.name);
        if (userData.email) setUserEmail(userData.email);
        if (userData.phone) setUserPhone(userData.phone);
        if (userData.bloodGroup) setBloodGroup(userData.bloodGroup);
        if (userData.allergies) setAllergies(userData.allergies);
        if (userData.emergencyNotes) setEmergencyNotes(userData.emergencyNotes);
      }

      // 4. Avatar: dedicated key takes priority (freshest), then userData
      const savedAvatar = await AsyncStorage.getItem('user_avatar_uri');
      const avatarFromData = userData && (userData.profileImage || userData.avatar);
      setAvatarUri(savedAvatar || avatarFromData || DEFAULT_AVATAR);
    } catch (err) {
      console.log('[UserContext] Error loading saved user:', err.message);
    }
  }, []);

  useEffect(() => {
    loadSavedUser();
  }, [loadSavedUser]);

  // Call this when profile name, email, phone, or medical info changes
  // Updates state synchronously AND writes to BOTH SecureStore and AsyncStorage immediately
  const updateUser = async (fields = {}) => {
    if (!fields || typeof fields !== 'object') return;

    if (fields.name !== undefined) setUserName(fields.name);
    if (fields.email !== undefined) setUserEmail(fields.email);
    if (fields.phone !== undefined) setUserPhone(fields.phone);
    if (fields.bloodGroup !== undefined) setBloodGroup(fields.bloodGroup);
    if (fields.allergies !== undefined) setAllergies(fields.allergies);
    if (fields.emergencyNotes !== undefined) setEmergencyNotes(fields.emergencyNotes);

    try {
      // Read current userData and merge from AsyncStorage
      const json = await AsyncStorage.getItem(LEGACY_USER_KEY);
      const current = json ? JSON.parse(json) : {};
      const updated = { ...current, ...fields };
      // Write to both stores so next reload gets fresh data from SecureStore too
      await persistUserData(updated);
    } catch (err) {
      console.log('[UserContext] Error saving updated user data:', err.message);
    }
  };

  // Call this immediately when user picks a new avatar
  // Updates state synchronously AND writes to BOTH SecureStore and AsyncStorage
  const updateAvatar = async (uri) => {
    const finalUri = uri || DEFAULT_AVATAR;
    setAvatarUri(finalUri);

    try {
      if (uri) {
        await AsyncStorage.setItem('user_avatar_uri', uri);
        // Also sync into stored userData in both stores
        const json = await AsyncStorage.getItem(LEGACY_USER_KEY);
        const data = json ? JSON.parse(json) : {};
        data.profileImage = uri;
        data.avatar = uri;
        await persistUserData(data);
      } else {
        await AsyncStorage.removeItem('user_avatar_uri');
        const json = await AsyncStorage.getItem(LEGACY_USER_KEY);
        if (json) {
          const data = JSON.parse(json);
          delete data.profileImage;
          delete data.avatar;
          await persistUserData(data);
        }
      }
    } catch (err) {
      console.log('[UserContext] Error saving avatar:', err.message);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userName,
        userEmail,
        userPhone,
        avatarUri,
        bloodGroup,
        allergies,
        emergencyNotes,
        updateUser,
        updateAvatar,
        refreshUserFromStorage: loadSavedUser,
        getInitials: () => getInitials(userName),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;

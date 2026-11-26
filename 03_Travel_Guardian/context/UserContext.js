// Travel Guardian - Shared User Context
// Provides a single source of truth for user profile, name, avatar, and emergency data.
// Updates are instant across Home, Profile, and all screens.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Load saved user data from AsyncStorage
  const loadSavedUser = useCallback(async () => {
    try {
      let loadedAvatar = null;

      // 1. Check persistent avatar key first
      const savedAvatar = await AsyncStorage.getItem('user_avatar_uri');
      if (savedAvatar) {
        loadedAvatar = savedAvatar;
      }

      // 2. Check full userData
      const json = await AsyncStorage.getItem('userData');
      if (json) {
        const data = JSON.parse(json);
        if (data.name) setUserName(data.name);
        if (data.email) setUserEmail(data.email);
        if (data.phone) setUserPhone(data.phone);
        if (data.bloodGroup) setBloodGroup(data.bloodGroup);
        if (data.allergies) setAllergies(data.allergies);
        if (data.emergencyNotes) setEmergencyNotes(data.emergencyNotes);

        if (!loadedAvatar && (data.profileImage || data.avatar)) {
          loadedAvatar = data.profileImage || data.avatar;
        }
      }

      setAvatarUri(loadedAvatar || DEFAULT_AVATAR);
    } catch (err) {
      console.log('[UserContext] Error loading saved user:', err.message);
    }
  }, []);

  useEffect(() => {
    loadSavedUser();
  }, [loadSavedUser]);

  // Call this when profile name, email, phone, or medical info changes
  // Updates state synchronously AND writes directly to AsyncStorage immediately
  const updateUser = async (fields = {}) => {
    if (!fields || typeof fields !== 'object') return;

    if (fields.name !== undefined) setUserName(fields.name);
    if (fields.email !== undefined) setUserEmail(fields.email);
    if (fields.phone !== undefined) setUserPhone(fields.phone);
    if (fields.bloodGroup !== undefined) setBloodGroup(fields.bloodGroup);
    if (fields.allergies !== undefined) setAllergies(fields.allergies);
    if (fields.emergencyNotes !== undefined) setEmergencyNotes(fields.emergencyNotes);

    try {
      // Read current userData and merge
      const json = await AsyncStorage.getItem('userData');
      const current = json ? JSON.parse(json) : {};
      const updated = {
        ...current,
        ...fields,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updated));
    } catch (err) {
      console.log('[UserContext] Error saving updated user data:', err.message);
    }
  };

  // Call this immediately when user picks a new avatar
  // Updates state synchronously AND writes to user_avatar_uri and userData in AsyncStorage
  const updateAvatar = async (uri) => {
    const finalUri = uri || DEFAULT_AVATAR;
    setAvatarUri(finalUri);

    try {
      if (uri) {
        await AsyncStorage.setItem('user_avatar_uri', uri);
        // Also sync into stored userData
        const json = await AsyncStorage.getItem('userData');
        const data = json ? JSON.parse(json) : {};
        data.profileImage = uri;
        data.avatar = uri;
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem('user_avatar_uri');
        const json = await AsyncStorage.getItem('userData');
        if (json) {
          const data = JSON.parse(json);
          delete data.profileImage;
          delete data.avatar;
          await AsyncStorage.setItem('userData', JSON.stringify(data));
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

// Travel Guardian - Profile & Medical Safety ID Screen
// Handles: User profile, Profile Image Avatar, Profile Editing, Medical ID, Dark/Light theme toggle, and Secure Logout

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import CustomButton from '../../components/CustomButton';
import { getStoredUser, getUserProfile, updateUserProfile, logoutUser } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useUser, getInitials, DEFAULT_AVATAR } from '../../context/UserContext';
import { isEmpty } from '../../utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRAVEL_AVATAR_PRESETS = [
  { id: 'explorer', label: 'Explorer', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'backpacker', label: 'Backpacker', uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'nomad', label: 'Nomad', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'aviator', label: 'Aviator', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { id: 'guardian', label: 'Guardian', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'adventurer', label: 'Adventurer', uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  // Use shared user context — changes here will update Home instantly
  const { userName: contextUserName, avatarUri: contextAvatarUri, updateUser, updateAvatar } = useUser();

  // User profile state (extra fields not in context)
  const [user, setUser] = useState({
    name: 'Traveler',
    email: '',
    phone: '',
    bloodGroup: '',
    allergies: '',
    emergencyNotes: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  // Edit Profile Modal / Form State
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const [formEmergencyNotes, setFormEmergencyNotes] = useState('');
  const [formAvatar, setFormAvatar] = useState(null);

  // Preferences
  const [locationSharing, setLocationSharing] = useState(true);
  const [sosVibration, setSosVibration] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  // Load saved preferences from AsyncStorage
  const loadPreferences = async () => {
    try {
      const locSharing = await AsyncStorage.getItem('@tg_pref_location_sharing');
      const sosVib = await AsyncStorage.getItem('@tg_pref_sos_vibration');
      if (locSharing !== null) setLocationSharing(JSON.parse(locSharing));
      if (sosVib !== null) setSosVibration(JSON.parse(sosVib));
    } catch {}
  };

  // Toggle handlers that also persist preferences
  const handleLocationSharingToggle = async (value) => {
    setLocationSharing(value);
    try {
      await AsyncStorage.setItem('@tg_pref_location_sharing', JSON.stringify(value));
    } catch {}
  };

  const handleSosVibrationToggle = async (value) => {
    setSosVibration(value);
    try {
      await AsyncStorage.setItem('@tg_pref_sos_vibration', JSON.stringify(value));
    } catch {}
  };

  const loadProfile = async () => {
    try {
      // 1. Try reading stored cache first (Instant)
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
        // Also sync name/email into context if we got fresh data
        if (stored.name) updateUser({ name: stored.name, email: stored.email });
      }

      // 2. Fetch fresh profile from backend (background, non-blocking)
      try {
        const res = await getUserProfile();
        if (res && res.user) {
          setUser(res.user);
          updateUser({ name: res.user.name, email: res.user.email });
        }
      } catch (apiErr) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('Profile backend sync notice:', apiErr.message);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, []);

  // Pick Profile Avatar from Device Gallery (with Base64 for permanent offline storage)
  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to change profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const persistentUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setFormAvatar(persistentUri);
      }
    } catch (err) {
      Alert.alert('Image Error', 'Could not pick image: ' + err.message);
    }
  };

  // Open Edit Profile Modal
  const handleOpenEdit = () => {
    setFormName(user.name || contextUserName || '');
    setFormPhone(user.phone || '');
    setFormBloodGroup(user.bloodGroup || '');
    setFormAllergies(user.allergies || '');
    setFormEmergencyNotes(user.emergencyNotes || '');
    // Use the shared context avatar (same as what Home shows)
    setFormAvatar(contextAvatarUri);
    setEditProfileModal(true);
  };

  // Save Profile Changes
  // Optimistic: update UI immediately, sync backend in background
  const handleSaveProfile = async () => {
    if (isEmpty(formName)) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    setSavingProfile(true);

    // Step 1: Update avatar in context immediately (Home will update too)
    await updateAvatar(formAvatar);

    // Step 2: Update all profile fields in context immediately (Home will update too)
    const newName = formName.trim();
    const newPhone = formPhone.trim();
    const newBloodGroup = formBloodGroup.trim();
    const newAllergies = formAllergies.trim();
    const newEmergencyNotes = formEmergencyNotes.trim();

    await updateUser({
      name: newName,
      phone: newPhone,
      bloodGroup: newBloodGroup,
      allergies: newAllergies,
      emergencyNotes: newEmergencyNotes,
    });

    // Step 3: Update local user state immediately
    const updatedUser = {
      ...user,
      name: newName,
      phone: newPhone,
      bloodGroup: newBloodGroup,
      allergies: newAllergies,
      emergencyNotes: newEmergencyNotes,
    };
    setUser(updatedUser);

    // Step 4: Close modal instantly — don't wait for backend
    setEditProfileModal(false);
    setSavingProfile(false);
    Alert.alert('Profile Updated! 👤', 'Your profile has been saved.');

    // Step 5: Sync to backend in background (non-blocking)
    updateUserProfile({
      name: newName,
      phone: formPhone.trim(),
      bloodGroup: formBloodGroup.trim(),
      allergies: formAllergies.trim(),
      emergencyNotes: formEmergencyNotes.trim(),
    }).catch((err) => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('Profile backend sync error:', err.message);
      }
    });
  };

  // Sign out and clear stored JWT token
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your Travel Guardian account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
      }
    >
      {/* 1. Profile Header Card */}
      <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: contextAvatarUri || DEFAULT_AVATAR }}
            style={styles.avatarImage}
          />
          <Pressable style={styles.cameraIconBadge} onPress={handleOpenEdit}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </Pressable>
        </View>

        <Text style={[styles.userName, { color: theme.text }]}>{contextUserName || user.name || 'Traveler'}</Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {user.email || 'traveler@travelguardian.com'}
        </Text>
        {user.phone ? (
          <Text style={[styles.userPhone, { color: theme.textSecondary }]}>📞 {user.phone}</Text>
        ) : null}

        <View style={[styles.verifiedBadge, { backgroundColor: theme.secondaryLight }]}>
          <Ionicons name="checkmark-circle" size={14} color={theme.secondary} />
          <Text style={[styles.verifiedText, { color: theme.secondary }]}>Traveler Account Verified</Text>
        </View>

        {/* Edit Profile Button */}
        <Pressable
          style={[styles.editProfileBtn, { backgroundColor: theme.primary }]}
          onPress={handleOpenEdit}
        >
          <Ionicons name="create-outline" size={16} color={colors.white} />
          <Text style={styles.editProfileBtnText}>Edit Profile & Photo</Text>
        </Pressable>
      </View>

      {/* 2. Emergency Medical ID Card */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>Emergency Medical ID</Text>
        <Pressable onPress={handleOpenEdit}>
          <Text style={[styles.editLink, { color: theme.primary }]}>Edit Info</Text>
        </Pressable>
      </View>

      <View style={[styles.medicalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.medicalRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.medicalLabel, { color: theme.textSecondary }]}>Blood Type:</Text>
          <Text style={[styles.medicalValue, { color: theme.text }]}>
            {user.bloodGroup || 'Not specified'}
          </Text>
        </View>

        <View style={[styles.medicalRow, { borderBottomColor: theme.border }]}>
          <Text style={[styles.medicalLabel, { color: theme.textSecondary }]}>Allergies:</Text>
          <Text style={[styles.medicalValue, { color: theme.text }]}>
            {user.allergies || 'None reported'}
          </Text>
        </View>

        <View style={[styles.medicalRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.medicalLabel, { color: theme.textSecondary }]}>Emergency Notes:</Text>
          <Text style={[styles.medicalValue, { color: theme.text }]}>
            {user.emergencyNotes || 'None'}
          </Text>
        </View>
      </View>

      {/* 3. Safety & Display Preferences */}
      <Text style={[styles.sectionHeading, { color: theme.text }]}>Preferences & App Theme</Text>
      <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Dark Mode Switch */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Dark Theme</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              {isDarkMode ? 'Dark safety palette active' : 'Light daytime palette active'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: theme.primary }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Location Sharing */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>Background GPS Sharing</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              Allow emergency contacts to receive coordinates
            </Text>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={handleLocationSharingToggle}
            trackColor={{ false: colors.border, true: theme.primary }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* SOS Vibration */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>SOS Haptic Feedback</Text>
            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
              Vibrate device repeatedly during distress alerts
            </Text>
          </View>
          <Switch
            value={sosVibration}
            onValueChange={handleSosVibrationToggle}
            trackColor={{ false: colors.border, true: theme.danger }}
          />
        </View>
      </View>

      {/* 4. Logout Button */}
      <View style={styles.buttonSection}>
        <CustomButton
          title="Sign Out"
          onPress={handleLogout}
          type="outline"
          style={styles.logoutBtn}
        />
      </View>

      {/* 5. Edit Profile Modal */}
      <Modal
        visible={editProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Traveler Profile</Text>
              <Pressable onPress={() => setEditProfileModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Image Edit Selector */}
              <View style={styles.avatarEditRow}>
                <Image
                  source={{ uri: formAvatar || DEFAULT_AVATAR }}
                  style={styles.modalAvatarPreview}
                />
                <View style={styles.avatarEditButtons}>
                  <Pressable
                    style={[styles.avatarBtn, { backgroundColor: theme.primary }]}
                    onPress={handlePickAvatar}
                  >
                    <Ionicons name="image-outline" size={16} color={colors.white} />
                    <Text style={styles.avatarBtnText}>Pick From Gallery</Text>
                  </Pressable>

                  {formAvatar && (
                    <Pressable
                      style={[styles.avatarBtn, styles.removeAvatarBtn]}
                      onPress={() => setFormAvatar(null)}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.danger} />
                      <Text style={styles.removeAvatarText}>Reset</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Travel Avatar Presets */}
              <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 6, marginBottom: 8 }]}>
                Or Choose a Travel Avatar:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                {TRAVEL_AVATAR_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.id}
                    style={[
                      styles.presetAvatarBtn,
                      formAvatar === preset.uri && { borderColor: theme.primary, borderWidth: 2.5 },
                    ]}
                    onPress={() => setFormAvatar(preset.uri)}
                  >
                    <Image source={{ uri: preset.uri }} style={styles.presetAvatarImg} />
                    <Text style={[styles.presetAvatarLabel, { color: theme.textSecondary }]}>
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.fieldLabel, { color: theme.text }]}>Full Name *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Your full name"
                placeholderTextColor={colors.textLight}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.fieldLabel, { color: theme.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. +1 555-0199"
                placeholderTextColor={colors.textLight}
                value={formPhone}
                onChangeText={setFormPhone}
                keyboardType="phone-pad"
              />

              <Text style={[styles.fieldLabel, { color: theme.text }]}>Blood Group / Type</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. O+, A+, B-, AB+"
                placeholderTextColor={colors.textLight}
                value={formBloodGroup}
                onChangeText={setFormBloodGroup}
              />

              <Text style={[styles.fieldLabel, { color: theme.text }]}>Known Allergies</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Peanuts, Penicillin, None"
                placeholderTextColor={colors.textLight}
                value={formAllergies}
                onChangeText={setFormAllergies}
              />

              <Text style={[styles.fieldLabel, { color: theme.text }]}>Emergency Medical Notes</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Inhaler in backpack, diabetic, contact doctor"
                placeholderTextColor={colors.textLight}
                value={formEmergencyNotes}
                onChangeText={setFormEmergencyNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActionsRow}>
                <Pressable
                  style={[styles.modalBtn, styles.modalCancelBtn, { borderColor: theme.border }]}
                  onPress={() => setEditProfileModal(false)}
                  disabled={savingProfile}
                >
                  <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryLight,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
    gap: 6,
  },
  editProfileBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  editLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  medicalCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  medicalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  medicalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  buttonSection: {
    marginTop: 4,
  },
  logoutBtn: {
    borderColor: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  avatarEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 16,
  },
  modalAvatarPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.border,
  },
  avatarEditButtons: {
    gap: 6,
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  avatarBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeAvatarBtn: {
    backgroundColor: colors.dangerLight,
  },
  removeAvatarText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    height: 70,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetAvatarBtn: {
    alignItems: 'center',
    marginRight: 12,
    padding: 3,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetAvatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  presetAvatarLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

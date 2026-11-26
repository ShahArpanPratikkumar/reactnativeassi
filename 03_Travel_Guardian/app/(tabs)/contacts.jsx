// Travel Guardian - Emergency Contacts Screen
// Uses Expo Contacts to load device contacts on demand, manage emergency contacts, and trigger calls

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import EmptyState from '../../components/EmptyState';
import { isEmpty } from '../../utils/validation';
import { callPhoneNumber } from '../../utils/phone';
import { getContacts, addContact, updateContact, deleteContact } from '../../services/contactService';

const CONTACTS_CACHE_KEY = 'travel_guardian_emergency_contacts_cache';

// Helper to normalize phone numbers for comparison and dialer
const normalizePhone = (num) => {
  if (!num) return '';
  return String(num).replace(/[^0-9+]/g, '');
};

export default function ContactsScreen() {
  const { theme } = useTheme();

  // 1. Contact Lists State
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loadingEmergency, setLoadingEmergency] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [deviceContacts, setDeviceContacts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [loadingDevice, setLoadingDevice] = useState(false);
  const deviceContactsLoadedRef = useRef(false);

  // 2. Filter & Search State
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' | 'device'
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Modal Form State (Add / Edit)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(false);

  // Persist emergency contacts locally to AsyncStorage
  const saveToLocalCache = async (list) => {
    try {
      await AsyncStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('Error caching emergency contacts:', e.message);
      }
    }
  };

  // Initial load: fast local cache first, then backend sync in background
  useEffect(() => {
    let isMounted = true;
    const initContacts = async () => {
      try {
        const cached = await AsyncStorage.getItem(CONTACTS_CACHE_KEY);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEmergencyContacts(parsed);
          }
        }
      } catch (err) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('Cache read error:', err.message);
        }
      }
      // Background sync from backend
      loadEmergencyContacts(false);
    };

    initContacts();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadEmergencyContacts = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingEmergency(true);
      const res = await getContacts();
      if (res && res.data) {
        setEmergencyContacts(res.data);
        saveToLocalCache(res.data);
      }
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('Backend contacts notice (using local):', err.message);
      }
    } finally {
      setLoadingEmergency(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'emergency') {
      loadEmergencyContacts(false);
    } else {
      loadDeviceContacts(true);
    }
  }, [activeTab]);

  // Request device contacts permission and load contacts on-demand
  const loadDeviceContacts = async (forceRefresh = false) => {
    if (deviceContactsLoadedRef.current && !forceRefresh && deviceContacts.length > 0) {
      return;
    }
    try {
      setLoadingDevice(true);
      let perm = await Contacts.getPermissionsAsync();
      if (perm.status !== 'granted') {
        perm = await Contacts.requestPermissionsAsync();
      }

      if (perm.status === 'granted') {
        setHasPermission(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
          sort: Contacts.SortTypes.FirstName,
        });

        if (data && data.length > 0) {
          const formatted = data
            .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0 && c.phoneNumbers[0].number)
            .map((c) => ({
              id: c.id || String(Math.random()),
              name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Contact',
              phone: c.phoneNumbers[0].number || '',
            }));

          setDeviceContacts(formatted);
          deviceContactsLoadedRef.current = true;
        } else {
          setDeviceContacts([]);
        }
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('Error loading device contacts:', error.message);
      }
      setHasPermission(false);
    } finally {
      setLoadingDevice(false);
      setRefreshing(false);
    }
  };

  // Switch tab handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'device' && !deviceContactsLoadedRef.current && !loadingDevice) {
      loadDeviceContacts();
    }
  };

  // Check if a phone number is already added as an emergency contact
  const isAlreadyEmergency = useCallback(
    (phoneNumber) => {
      if (!phoneNumber) return false;
      const clean = normalizePhone(phoneNumber);
      if (!clean) return false;
      return emergencyContacts.some((c) => {
        const cClean = normalizePhone(c.phone);
        if (cClean === clean) return true;
        // Check last 10 digits match (accounts for country code differences)
        if (clean.length >= 10 && cClean.length >= 10) {
          return clean.slice(-10) === cClean.slice(-10);
        }
        return false;
      });
    },
    [emergencyContacts]
  );

  // 5. Dial / Call Contact using Native Phone Dialer via reliable phone utility
  const handleCall = useCallback((phoneNumber, contactName) => {
    callPhoneNumber(phoneNumber, contactName);
  }, []);

  // 6. Open Modal to Add Contact
  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormName('');
    setFormPhone('');
    setFormRelationship('Family');
    setFormIsPrimary(false);
    setModalVisible(true);
  };

  // 7. Open Modal to Edit Existing Contact
  const openEditModal = (contact) => {
    setModalMode('edit');
    setEditingId(contact._id || contact.id);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormRelationship(contact.relationship || '');
    setFormIsPrimary(contact.isPrimary || false);
    setModalVisible(true);
  };

  // 8. Save Contact (Create or Update) - Local-First & Optimistic
  const handleSaveContact = async () => {
    const trimmedName = formName.trim();
    const trimmedPhone = formPhone.trim();

    if (isEmpty(trimmedName)) {
      Alert.alert('Validation Error', 'Please enter a contact name.');
      return;
    }
    if (isEmpty(trimmedPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    // Modal closes immediately for responsive UI
    setModalVisible(false);

    if (modalMode === 'add') {
      // Check duplicate
      if (isAlreadyEmergency(trimmedPhone)) {
        Alert.alert('Already Added', `${trimmedName} is already in your emergency contacts.`);
        return;
      }

      const tempId = 'local_' + Date.now();
      const newContact = {
        _id: tempId,
        id: tempId,
        name: trimmedName,
        phone: trimmedPhone,
        relationship: formRelationship.trim() || 'Emergency Contact',
        isPrimary: formIsPrimary,
        source: 'manual',
      };

      const updated = formIsPrimary
        ? [newContact, ...emergencyContacts.map((c) => ({ ...c, isPrimary: false }))]
        : [newContact, ...emergencyContacts];

      setEmergencyContacts(updated);
      saveToLocalCache(updated);
      Alert.alert('Contact Added 🛡️', `${trimmedName} has been added to your Emergency SOS network.`);

      // Background sync with backend
      addContact({
        name: trimmedName,
        phone: trimmedPhone,
        relationship: formRelationship.trim() || 'Emergency Contact',
        isPrimary: formIsPrimary,
      })
        .then((res) => {
          if (res?.data?._id) {
            setEmergencyContacts((prev) => {
              const synced = prev.map((c) => (c._id === tempId ? res.data : c));
              saveToLocalCache(synced);
              return synced;
            });
          }
        })
        .catch((err) => {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.log('Background add contact sync notice:', err.message);
          }
        });
    } else {
      // Edit Mode: update in local state immediately
      const updated = emergencyContacts.map((c) => {
        if ((c._id || c.id) === editingId) {
          return {
            ...c,
            name: trimmedName,
            phone: trimmedPhone,
            relationship: formRelationship.trim(),
            isPrimary: formIsPrimary,
          };
        }
        return formIsPrimary ? { ...c, isPrimary: false } : c;
      });

      setEmergencyContacts(updated);
      saveToLocalCache(updated);
      Alert.alert('Updated', 'Emergency contact information updated.');

      // Background sync with backend
      if (!editingId.startsWith('local_')) {
        updateContact(editingId, {
          name: trimmedName,
          phone: trimmedPhone,
          relationship: formRelationship.trim(),
          isPrimary: formIsPrimary,
        }).catch((err) => {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.log('Background update contact sync notice:', err.message);
          }
        });
      }
    }
  };

  // 9. Delete Contact with confirmation dialog - Local-First & Optimistic
  const handleDeleteContact = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove "${contact.name}" from your emergency network?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const targetId = contact._id || contact.id;
            const updated = emergencyContacts.filter((c) => (c._id || c.id) !== targetId);
            setEmergencyContacts(updated);
            saveToLocalCache(updated);
            Alert.alert('Deleted', `${contact.name} has been removed.`);

            // Background delete
            if (targetId && !String(targetId).startsWith('local_')) {
              deleteContact(targetId).catch((err) => {
                if (typeof __DEV__ !== 'undefined' && __DEV__) {
                  console.log('Background delete sync notice:', err.message);
                }
              });
            }
          },
        },
      ]
    );
  };

  // 10. Link / Import Contact from Device List to Emergency SOS - Local-First & Optimistic
  const handleLinkDeviceContact = (deviceContact) => {
    if (isAlreadyEmergency(deviceContact.phone)) {
      Alert.alert('Already Added', `${deviceContact.name} is already in your emergency contacts list.`);
      return;
    }

    const tempId = 'local_' + Date.now();
    const newEmergencyItem = {
      _id: tempId,
      id: tempId,
      name: deviceContact.name,
      phone: deviceContact.phone,
      relationship: 'Phonebook Contact',
      isPrimary: false,
      source: 'phonebook',
    };

    // Update emergency list immediately
    const updated = [newEmergencyItem, ...emergencyContacts];
    setEmergencyContacts(updated);
    saveToLocalCache(updated);

    // Switch to emergency tab immediately so user sees the added contact right away
    setActiveTab('emergency');
    Alert.alert('Contact Linked! 🛡️', `${deviceContact.name} added to your Emergency SOS network.`);

    // Background sync to backend
    addContact({
      name: deviceContact.name,
      phone: deviceContact.phone,
      relationship: 'Phonebook Contact',
      isPrimary: false,
    })
      .then((res) => {
        if (res?.data?._id) {
          setEmergencyContacts((prev) => {
            const synced = prev.map((c) => (c._id === tempId ? res.data : c));
            saveToLocalCache(synced);
            return synced;
          });
        }
      })
      .catch((err) => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('Background link device contact sync notice:', err.message);
        }
      });
  };

  // Filter lists based on search query with useMemo for high performance
  const displayedEmergencyList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return emergencyContacts;
    return emergencyContacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [emergencyContacts, searchQuery]);

  const displayedDeviceList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deviceContacts;
    return deviceContacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [deviceContacts, searchQuery]);

  // Render individual emergency contact card
  const renderEmergencyItem = useCallback(
    ({ item }) => (
      <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="person" size={22} color={theme.primary} />
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isPrimary && (
              <View style={[styles.primaryBadge, { backgroundColor: theme.secondaryLight }]}>
                <Text style={[styles.primaryBadgeText, { color: theme.secondary }]}>PRIMARY SOS</Text>
              </View>
            )}
          </View>

          <Text style={[styles.relationshipText, { color: theme.textSecondary }]}>
            {item.relationship || 'Emergency Contact'}
          </Text>
          <Text style={[styles.phoneText, { color: theme.text }]}>{item.phone}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          <Pressable
            style={[styles.callBtn, { backgroundColor: theme.secondary }]}
            onPress={() => handleCall(item.phone, item.name)}
          >
            <Ionicons name="call" size={16} color={colors.white} />
          </Pressable>

          <Pressable
            style={[styles.editBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={15} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.deleteBtn, { backgroundColor: theme.dangerLight }]}
            onPress={() => handleDeleteContact(item)}
          >
            <Ionicons name="trash-outline" size={15} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    ),
    [theme, handleCall]
  );

  // Render device contact card with "Call" and "Add to SOS" button
  const renderDeviceItem = useCallback(
    ({ item }) => {
      const alreadyInSOS = isAlreadyEmergency(item.phone);

      return (
        <View style={[styles.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.border }]}>
            <Ionicons name="phone-portrait-outline" size={20} color={theme.textSecondary} />
          </View>

          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.phoneText, { color: theme.textSecondary }]}>{item.phone}</Text>
          </View>

          <View style={styles.phonebookActions}>
            {/* Call button for phonebook contact */}
            <Pressable
              style={[styles.callBtn, { backgroundColor: theme.secondary }]}
              onPress={() => handleCall(item.phone, item.name)}
            >
              <Ionicons name="call" size={16} color={colors.white} />
            </Pressable>

            {/* Add to SOS or Already Added Indicator */}
            {alreadyInSOS ? (
              <View style={[styles.linkEmergencyBtnDisabled, { backgroundColor: theme.secondaryLight, borderColor: theme.secondary }]}>
                <Ionicons name="checkmark-circle" size={14} color={theme.secondary} />
                <Text style={[styles.linkEmergencyTextDisabled, { color: theme.secondary }]}>Added</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.linkEmergencyBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleLinkDeviceContact(item)}
              >
                <Ionicons name="shield-checkmark" size={14} color={colors.white} />
                <Text style={styles.linkEmergencyText}>Add to SOS</Text>
              </Pressable>
            )}
          </View>
        </View>
      );
    },
    [theme, isAlreadyEmergency, handleCall]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. Header Banner */}
      <View style={[styles.headerBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.bannerIcon, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={[styles.bannerTitle, { color: theme.text }]}>Emergency Guardian Network</Text>
          <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>
            Contacts notified with live GPS coordinates during an SOS distress alert.
          </Text>
        </View>
      </View>

      {/* 2. Tab Switcher (Emergency vs Device Contacts) */}
      <View style={[styles.tabContainer, { backgroundColor: theme.border }]}>
        <Pressable
          style={[styles.tabButton, activeTab === 'emergency' && { backgroundColor: theme.primary }]}
          onPress={() => handleTabChange('emergency')}
        >
          <Ionicons
            name="warning"
            size={16}
            color={activeTab === 'emergency' ? colors.white : theme.textSecondary}
          />
          <Text
            style={[styles.tabText, { color: activeTab === 'emergency' ? colors.white : theme.textSecondary }, activeTab === 'emergency' && styles.tabTextActive]}
          >
            Emergency ({emergencyContacts.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === 'device' && { backgroundColor: theme.primary }]}
          onPress={() => handleTabChange('device')}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeTab === 'device' ? colors.white : theme.textSecondary}
          />
          <Text
            style={[styles.tabText, { color: activeTab === 'device' ? colors.white : theme.textSecondary }, activeTab === 'device' && styles.tabTextActive]}
          >
            Phonebook ({deviceContacts.length})
          </Text>
        </Pressable>
      </View>

      {/* 3. Search & Add Button Bar */}
      <View style={styles.searchBarRow}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={
              activeTab === 'emergency'
                ? 'Search emergency contacts...'
                : 'Search phonebook contacts...'
            }
            placeholderTextColor={theme.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {activeTab === 'emergency' && (
          <Pressable style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={openAddModal}>
            <Ionicons name="add" size={22} color={colors.white} />
          </Pressable>
        )}
      </View>

      {/* 4. Contacts FlatList */}
      {activeTab === 'emergency' ? (
        loadingEmergency && emergencyContacts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading emergency contacts...</Text>
          </View>
        ) : (
          <FlatList
            data={displayedEmergencyList}
            keyExtractor={(item, index) => item._id || item.id || item.phone || String(index)}
            renderItem={renderEmergencyItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={15}
            windowSize={5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No Emergency Contacts"
                description="Add family members or local emergency hotlines so they can be notified."
                buttonTitle="+ Add Emergency Contact"
                onButtonPress={openAddModal}
              />
            }
          />
        )
      ) : loadingDevice && deviceContacts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading device phonebook...</Text>
        </View>
      ) : hasPermission === false ? (
        <View style={[styles.permissionDeniedBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.danger} />
          <Text style={[styles.permissionDeniedTitle, { color: theme.text }]}>Contacts Access Denied</Text>
          <Text style={[styles.permissionDeniedMessage, { color: theme.textSecondary }]}>
            Grant contacts permission to easily pick family and friends from your phonebook.
          </Text>
          <Pressable style={[styles.grantBtn, { backgroundColor: theme.primary }]} onPress={() => loadDeviceContacts(true)}>
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={displayedDeviceList}
          keyExtractor={(item, index) => item.id || item.phone || String(index)}
          renderItem={renderDeviceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={20}
          windowSize={5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No Phonebook Matches"
              description="Could not find any contacts matching your search."
            />
          }
        />
      )}

      {/* 5. Add / Edit Contact Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {modalMode === 'add' ? 'Add Emergency Contact' : 'Edit Contact'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Full Name *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Mom, Sarah Jenkins"
              placeholderTextColor={theme.textLight}
              value={formName}
              onChangeText={setFormName}
            />

            <Text style={[styles.label, { color: theme.text }]}>Phone Number *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. +91XXXXXXXXXX or 555-234-5678"
              placeholderTextColor={theme.textLight}
              value={formPhone}
              onChangeText={setFormPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: theme.text }]}>Relationship</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Family, Spouse, Doctor, Police"
              placeholderTextColor={theme.textLight}
              value={formRelationship}
              onChangeText={setFormRelationship}
            />

            <View style={styles.primarySwitchRow}>
              <View style={styles.primarySwitchText}>
                <Text style={[styles.primarySwitchTitle, { color: theme.text }]}>Primary Emergency Contact</Text>
                <Text style={[styles.primarySwitchDesc, { color: theme.textSecondary }]}>
                  First contact dialed and alerted on SOS trigger
                </Text>
              </View>
              <Switch
                value={formIsPrimary}
                onValueChange={setFormIsPrimary}
                trackColor={{ false: theme.border, true: theme.secondary }}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveContact}
              >
                <Text style={styles.modalSaveText}>
                  {modalMode === 'add' ? 'Save Contact' : 'Update'}
                </Text>
              </Pressable>
            </View>
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
  headerBanner: {
    backgroundColor: colors.card,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 10,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  primaryBadge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  relationshipText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkEmergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  linkEmergencyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  phonebookActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkEmergencyBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  linkEmergencyTextDisabled: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
  permissionDeniedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  permissionDeniedMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  grantBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  grantBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: colors.text,
  },
  primarySwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  primarySwitchText: {
    flex: 1,
    paddingRight: 10,
  },
  primarySwitchTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  primarySwitchDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

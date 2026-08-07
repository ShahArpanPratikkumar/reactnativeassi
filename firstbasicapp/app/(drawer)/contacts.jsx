import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { EmptyState } from '@/components/EmptyState';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ContactsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  const fetchContacts = useCallback(async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      const contactsWithPhones = data.filter(
        (c) => c.phoneNumbers && c.phoneNumbers.length > 0
      );

      contactsWithPhones.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );

      setContacts(contactsWithPhones);
      setFilteredContacts(contactsWithPhones);
    } catch (_error) {
      Alert.alert('Error', 'Failed to fetch contacts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const requestPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        setLoading(true);
        await fetchContacts();
      } else {
        Alert.alert(
          'Permission Denied',
          'Contacts permission is required to access your contacts.'
        );
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to request contacts permission.');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    const query = text.toLowerCase();
    const filtered = contacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.phoneNumbers &&
          c.phoneNumbers.some((p) => p.number && p.number.includes(query)))
    );
    setFilteredContacts(filtered);
  };

  const copyPhoneNumber = async (number) => {
    try {
      await Clipboard.setStringAsync(number);
      Alert.alert('Copied!', `Phone number "${number}" copied to clipboard.`);
    } catch (_error) {
      Alert.alert('Error', 'Failed to copy phone number.');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContacts();
  }, [fetchContacts]);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return Colors.light.textSecondary;
    const colors = [
      '#2E7D32', '#7C3AED', '#F59E0B', '#10B981',
      '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderContact = ({ item }) => {
    const phoneNumber = item.phoneNumbers && item.phoneNumbers.length > 0
      ? item.phoneNumbers[0].number
      : null;

    return (
      <View style={styles.contactCard}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name || 'Unknown Contact'}
          </Text>
          {phoneNumber ? (
            <Text style={styles.contactPhone} numberOfLines={1}>{phoneNumber}</Text>
          ) : (
            <Text style={styles.noNumber}>No Number</Text>
          )}
        </View>
        {phoneNumber && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyPhoneNumber(phoneNumber)}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>📋</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>👥 Contacts</Text>
            <Text style={styles.headerSubtitle}>Access your contacts</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <View style={styles.permissionIconContainer}>
            <Text style={styles.permissionIcon}>👥</Text>
          </View>
          <Text style={styles.permissionTitle}>Contacts Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need contacts permission to display your contacts for field survey assignments.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission} activeOpacity={0.7}>
            <Text style={styles.permissionButtonText}>Grant Contacts Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>👥 Contacts</Text>
          <Text style={styles.headerSubtitle}>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search contacts..."
            placeholderTextColor={Colors.light.textSecondary + '99'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearch}
              onPress={() => handleSearch('')}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={searchQuery ? '🔍' : '👥'}
          title={searchQuery ? 'No Results Found' : 'No Contacts Found'}
          message={
            searchQuery
              ? `No contacts match "${searchQuery}"`
              : 'No contacts with phone numbers found on this device.'
          }
        />
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backIcon: {
    fontSize: 18,
    color: Colors.light.white,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.white,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  permissionIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  permissionIcon: {
    fontSize: 48,
  },
  permissionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionMessage: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.primary,
  },
  permissionButtonText: {
    ...Typography.button,
    color: Colors.light.white,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight || '#F1F5F9',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.lg,
    ...Typography.body,
    color: Colors.light.text,
  },
  clearSearch: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
  },
  clearSearchText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight || '#F1F5F9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.bodySemibold,
    color: Colors.light.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  contactPhone: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  noNumber: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    fontSize: 16,
  },
});

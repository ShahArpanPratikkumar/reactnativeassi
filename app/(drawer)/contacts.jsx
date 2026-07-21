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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';

export default function ContactsScreen() {
  const navigation = useNavigation();
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
      '#2E7D32', '#1565C0', '#FF8F00', '#7B1FA2',
      '#C62828', '#00838F', '#4E342E', '#37474F',
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
            <Text style={styles.copyIcon}>{'\uD83D\uDCCB'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{'\u2190'}</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Contacts</Text>
            <Text style={styles.headerSubtitle}>Access your contacts</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.permissionIcon}>{'\uD83D\uDC65'}</Text>
          <Text style={styles.permissionTitle}>Contacts Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need contacts permission to display your contacts for field survey assignments.
          </Text>
          <PrimaryButton
            title="Grant Contacts Permission"
            onPress={requestPermission}
            icon={'\uD83D\uDC64'}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Contacts</Text>
          <Text style={styles.headerSubtitle}>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search contacts..."
          placeholderTextColor={Colors.light.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearch}
            onPress={() => handleSearch('')}
          >
            <Text style={styles.clearSearchText}>{'\u2715'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={searchQuery ? '\uD83D\uDD0D' : '\uD83D\uDC65'}
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
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.white,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
  },
  clearSearch: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.border,
  },
  clearSearchText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 30,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  contactPhone: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  noNumber: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIcon: {
    fontSize: 16,
  },
});

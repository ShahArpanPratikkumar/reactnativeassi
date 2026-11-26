// Travel Guardian - Trip Details Screen
// Dynamic route screen displaying itinerary, documents, media, contacts, editing, and deletion

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { getTripById, updateTrip, deleteTrip } from '../../services/tripService';
import { isEmpty } from '../../utils/validation';
import { VEHICLE_OPTIONS, getVehicleIcon } from '../../constants/vehicles';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Trip Data State
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attached Documents
  const [tripDocs] = useState([
    { id: '1', title: 'Passport (Jane Doe)', type: 'Passport', expiry: '2032-05-14' },
    { id: '2', title: 'Japan Tourist Visa', type: 'Visa', expiry: '2026-11-01' },
    { id: '3', title: 'Shinjuku Hotel Voucher', type: 'Hotel', expiry: '2026-10-22' },
  ]);

  // Attached Safety Media / Evidence
  const [tripMedia] = useState([
    {
      id: '1',
      title: 'Airport Taxi Plate Photo',
      type: 'photo',
      uri: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      title: 'Hotel Entrance Door Lock',
      type: 'photo',
      uri: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=200&auto=format&fit=crop&q=80',
    },
  ]);

  // Emergency Contacts
  const [tripContacts] = useState([
    { id: '1', name: 'Sarah Jenkins', relationship: 'Primary Contact (Spouse)', phone: '+1 555-234-5678' },
    { id: '2', name: 'Tourist Police Hotline', relationship: 'Emergency Authority', phone: '112' },
  ]);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editHotel, setEditHotel] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('Car');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch Trip Details
  const fetchTripDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getTripById(id);
      if (res && res.data) {
        setTrip(res.data);
      }
    } catch (err) {
      console.log('Error fetching trip details:', err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Open Edit Modal
  const openEditModal = () => {
    setEditTitle(trip.title);
    setEditDestination(trip.destination);
    setEditStartDate(trip.startDate);
    setEditEndDate(trip.endDate || '');
    setEditHotel(trip.hotel || '');
    setEditVehicleType(trip.vehicleType || 'Car');
    setEditNotes(trip.notes || '');
    setEditModalVisible(true);
  };

  // Save Trip Edits
  const handleSaveEdits = async () => {
    if (isEmpty(editTitle) || isEmpty(editDestination) || isEmpty(editStartDate)) {
      Alert.alert('Validation Error', 'Title, destination, and start date are required.');
      return;
    }

    try {
      setIsUpdating(true);
      const updatedPayload = {
        title: editTitle.trim(),
        destination: editDestination.trim(),
        startDate: editStartDate.trim(),
        endDate: editEndDate.trim(),
        hotel: editHotel.trim(),
        vehicleType: editVehicleType,
        notes: editNotes.trim(),
        status: trip?.status || 'Upcoming',
      };

      const tripId = trip?._id || trip?.id || id;
      const res = await updateTrip(tripId, updatedPayload);
      if (res && res.data) {
        setTrip(res.data);
      }

      setEditModalVisible(false);
      Alert.alert('Updated', 'Trip details have been saved.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update trip.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip Itinerary',
      `Are you sure you want to delete "${trip?.title || 'this trip'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const tripId = trip?._id || trip?.id || id;
              await deleteTrip(tripId);
              Alert.alert('Deleted', 'Trip removed.');
              router.replace('/trips');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete trip.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>Trip Not Found</Text>
        <Pressable
          style={[styles.editBtn, { marginTop: 16, paddingHorizontal: 20 }]}
          onPress={() => router.replace('/trips')}
        >
          <Text style={styles.editBtnText}>Go Back to Trips</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Main Trip Header Card */}
      <View style={styles.mainCard}>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{trip.status}</Text>
          </View>
        </View>

        <Text style={styles.tripTitle}>{trip.title}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={styles.infoValue}>{trip.destination}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={styles.infoValue}>
            {trip.startDate} {trip.endDate ? `to ${trip.endDate}` : ''}
          </Text>
        </View>

        {trip.hotel ? (
          <View style={styles.infoRow}>
            <Ionicons name="bed" size={18} color={colors.primary} />
            <Text style={styles.infoValue}>{trip.hotel}</Text>
          </View>
        ) : null}

        {/* Vehicle Information */}
        <View style={styles.infoRow}>
          <Text style={{ fontSize: 16 }}>{getVehicleIcon(trip.vehicleType)}</Text>
          <Text style={styles.infoValue}>Vehicle: {trip.vehicleType || 'Car'}</Text>
        </View>

        {/* Action button to open location map */}
        <Pressable
          style={styles.mapLinkBtn}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Ionicons name="navigate-circle" size={18} color={colors.primary} />
          <Text style={styles.mapLinkText}>Explore Safe Zones & Route on Map</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* 2. Safety Notes Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={18} color={colors.secondary} />
          <Text style={styles.sectionTitle}>Safety & Emergency Guide</Text>
        </View>
        <Text style={styles.notesText}>{trip.notes || 'No emergency notes provided.'}</Text>
      </View>

      {/* 3. Attached Travel Documents */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="document-text" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Trip Documents ({tripDocs.length})</Text>
          </View>
          <Pressable onPress={() => router.push('/documents')}>
            <Text style={styles.viewAllLink}>View Vault</Text>
          </Pressable>
        </View>

        {tripDocs.map((doc) => (
          <View key={doc.id} style={styles.miniDocRow}>
            <View style={styles.miniDocIcon}>
              <Ionicons name="lock-closed" size={16} color={colors.primary} />
            </View>
            <View style={styles.miniDocInfo}>
              <Text style={styles.miniDocTitle}>{doc.title}</Text>
              <Text style={styles.miniDocMeta}>Expires: {doc.expiry}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
          </View>
        ))}
      </View>

      {/* 4. Uploaded Safety Media */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="images" size={18} color={colors.danger} />
            <Text style={styles.sectionTitle}>Safety Evidence ({tripMedia.length})</Text>
          </View>
          <Pressable onPress={() => router.push('/media')}>
            <Text style={styles.viewAllLink}>Media Gallery</Text>
          </Pressable>
        </View>

        <View style={styles.mediaGrid}>
          {tripMedia.map((m) => (
            <View key={m.id} style={styles.mediaThumbCard}>
              <Image source={{ uri: m.uri }} style={styles.mediaThumbImage} />
              <Text style={styles.mediaThumbCaption} numberOfLines={1}>
                {m.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Assigned Emergency Contacts */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="people" size={18} color={colors.warning} />
            <Text style={styles.sectionTitle}>Emergency Contacts ({tripContacts.length})</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/contacts')}>
            <Text style={styles.viewAllLink}>Manage</Text>
          </Pressable>
        </View>

        {tripContacts.map((contact) => (
          <View key={contact.id} style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Ionicons name="call" size={14} color={colors.white} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 6. Action Buttons: Edit & Delete */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.editBtn} onPress={openEditModal}>
          <Ionicons name="pencil" size={18} color={colors.text} />
          <Text style={styles.editBtnText}>Edit Trip</Text>
        </Pressable>

        <Pressable style={styles.deleteBtn} onPress={handleDeleteTrip}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={styles.deleteBtnText}>Delete Trip</Text>
        </Pressable>
      </View>

      {/* 7. Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Trip Itinerary</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Trip Title</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
            />

            <Text style={styles.modalLabel}>Destination</Text>
            <TextInput
              style={styles.modalInput}
              value={editDestination}
              onChangeText={setEditDestination}
            />

            <View style={styles.modalDatesRow}>
              <View style={styles.modalDateCol}>
                <Text style={styles.modalLabel}>Start Date</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editStartDate}
                  onChangeText={setEditStartDate}
                />
              </View>

              <View style={styles.modalDateCol}>
                <Text style={styles.modalLabel}>End Date</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editEndDate}
                  onChangeText={setEditEndDate}
                />
              </View>
            </View>

            <Text style={styles.modalLabel}>Hotel / Stay</Text>
            <TextInput
              style={styles.modalInput}
              value={editHotel}
              onChangeText={setEditHotel}
            />

            {/* Choose Vehicle */}
            <Text style={styles.modalLabel}>Choose Vehicle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {VEHICLE_OPTIONS.map((v) => {
                  const isSel = editVehicleType === v.id;
                  return (
                    <Pressable
                      key={v.id}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: isSel ? colors.primary : colors.border,
                        backgroundColor: isSel ? colors.primaryLight : colors.card,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onPress={() => setEditVehicleType(v.id)}
                    >
                      <Text style={{ fontSize: 14 }}>{v.icon}</Text>
                      <Text style={{ fontSize: 12, fontWeight: isSel ? 'bold' : 'normal', color: isSel ? colors.primary : colors.text }}>
                        {isSel ? `✓ ${v.label}` : v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.modalLabel}>Emergency Notes</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalSaveBtn}
                onPress={handleSaveEdits}
                disabled={isUpdating}
              >
                <Text style={styles.modalSaveText}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Text>
              </Pressable>
            </View>
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
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tripIdText: {
    fontSize: 12,
    color: colors.textLight,
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  mapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  mapLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  miniDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  miniDocIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniDocInfo: {
    flex: 1,
  },
  miniDocTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  miniDocMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaThumbCard: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  mediaThumbImage: {
    width: '100%',
    height: 80,
  },
  mediaThumbCaption: {
    fontSize: 11,
    color: colors.text,
    padding: 6,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  contactRelation: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  contactPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.dangerLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    color: colors.text,
  },
  modalDatesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalDateCol: {
    flex: 1,
  },
  modalTextArea: {
    height: 70,
    paddingVertical: 8,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

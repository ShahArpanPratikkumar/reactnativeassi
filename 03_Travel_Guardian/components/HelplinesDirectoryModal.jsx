import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

const HELPLINES = [
  {
    category: 'CRITICAL EMERGENCY',
    items: [
      { number: '112', title: 'National Emergency Helpline', desc: 'Police, Ambulance & Fire (All-in-One)', icon: 'warning', color: '#EF4444' },
      { number: '100', title: 'Police Control Room', desc: 'Immediate local police dispatch', icon: 'shield', color: '#2563EB' },
      { number: '108', title: 'Free Medical Ambulance', desc: 'Government emergency ambulance service', icon: 'medical', color: '#10B981' },
      { number: '101', title: 'Fire Station', desc: 'Fire & rescue emergency', icon: 'flame', color: '#F97316' },
    ],
  },
  {
    category: 'HIGHWAY & TRANSIT HELPLINES',
    items: [
      { number: '1033', title: 'National Highway Helpline', desc: 'NHAI 24x7 Breakdown, Towing & Accident Aid', icon: 'car', color: '#0284C7' },
      { number: '139', title: 'Indian Railways & RPF', desc: 'Train security, medical aid & passenger assistance', icon: 'train', color: '#7C3AED' },
    ],
  },
  {
    category: 'TOURISM & SPECIALIZED SAFETY',
    items: [
      { number: '1363', title: 'Tourist Helpline (Incredible India)', desc: 'Multi-lingual Ministry of Tourism guide & assistance', icon: 'compass', color: '#D97706' },
      { number: '1091', title: 'Women Safety Helpline', desc: 'National Commission for Women 24/7 helpline', icon: 'heart-half', color: '#DB2777' },
      { number: '1098', title: 'Childline India', desc: 'Emergency assistance for children & minors', icon: 'happy', color: '#059669' },
      { number: '1077', title: 'Disaster Management Helpline', desc: 'Flood, earthquake & cyclone relief teams', icon: 'thunderstorm', color: '#DC2626' },
    ],
  },
];

export default function HelplinesDirectoryModal({ visible, onClose }) {
  const { theme } = useTheme();

  const handleCallNumber = (num) => {
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Calling Unavailable', `Could not initiate call to ${num} from this device.`);
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="call" size={22} color="#15803D" />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>All-India Helplines</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  1-Tap Government & Tourist Emergency Directory
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {HELPLINES.map((group, idx) => (
              <View key={idx} style={styles.groupContainer}>
                <Text style={[styles.groupTitle, { color: theme.textSecondary }]}>
                  {group.category}
                </Text>

                {group.items.map((item) => (
                  <Pressable
                    key={item.number}
                    style={[styles.itemCard, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => handleCallNumber(item.number)}
                  >
                    <View style={[styles.itemIconCircle, { backgroundColor: item.color + '1A' }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[styles.itemDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.desc}
                      </Text>
                    </View>

                    <View style={[styles.callBadge, { backgroundColor: item.color }]}>
                      <Ionicons name="call" size={13} color="#FFFFFF" />
                      <Text style={styles.callBadgeText}>{item.number}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 6,
    gap: 16,
  },
  groupContainer: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  itemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

const CITY_SCAMS = [
  {
    city: 'Agra & Taj Mahal',
    icon: 'business',
    color: '#F59E0B',
    scams: [
      {
        title: 'Fake Government Tour Guides',
        desc: 'Touts claiming Taj Mahal is "closed for VIPs" or offering special skip-the-line gates.',
        defense: 'Only buy official tickets on asi.payumoney.com or at ASI counters. Ask for official Ministry of Tourism ID badges.',
      },
      {
        title: 'Marble Souvenir Overcharging',
        desc: 'Claiming ordinary soapstone or alabaster is "original Mughal inlaid marble".',
        defense: 'Test genuine marble by placing your hand on it (stays cold). Never shop where autorickshaw drivers insist on taking you.',
      },
    ],
  },
  {
    city: 'Jaipur & Rajasthan',
    icon: 'trail-sign',
    color: '#EC4899',
    scams: [
      {
        title: 'Gemstone & Jewelry Export Scam',
        desc: 'Dealers ask tourists to buy cheap synthetic gems and promise to "resell them in UK/USA for huge profit".',
        defense: 'Never participate in overseas reselling schemes. Buy only certified gems with hallmark certificates.',
      },
      {
        title: 'Camel / Elephant Safari Overprice',
        desc: 'Quoting ₹200 initially then demanding ₹2,000 for "getting down".',
        defense: 'Confirm total price, duration, and round-trip cost firmly before mounting any animal safari.',
      },
    ],
  },
  {
    city: 'Goa & Coastal Beaches',
    icon: 'water',
    color: '#0284C7',
    scams: [
      {
        title: 'Unlicensed Water Sports Traps',
        desc: 'Substandard parasailing or jet-skis with zero lifejackets charging exorbitant spot fees.',
        defense: 'Book solely with Goa Tourism Development Corporation (GTDC) certified operators with safety insurance.',
      },
      {
        title: 'Scooter Rental Damage Extortion',
        desc: 'Blaming existing scratches or minor dent on tourist and demanding ₹5,000 to ₹10,000.',
        defense: 'Always take a 360-degree video of the scooter in front of the rental owner before paying deposit.',
      },
    ],
  },
  {
    city: 'Delhi & Railway Stations',
    icon: 'train',
    color: '#10B981',
    scams: [
      {
        title: '"Train is Cancelled" Ticket Office Scam',
        desc: 'Touts near NDLS claiming your train is cancelled and driving you to fake "International Tourist Bureau".',
        defense: 'Only check train status on official NTES / IRCTC app. Never trust touts outside railway stations.',
      },
      {
        title: 'Fast Auto Meter Tampering',
        desc: 'Auto meters calibrated to run twice as fast or refusal to turn meter on.',
        defense: 'Use prepaid taxi booths or Ola/Uber for transparent fixed GPS pricing.',
      },
    ],
  },
  {
    city: 'Varanasi Ghats',
    icon: 'flame',
    color: '#8B5CF6',
    scams: [
      {
        title: 'Cremation Ghat Wood Donation Coercion',
        desc: 'Fake priests at Manikarnika Ghat pressuring tourists to pay thousands for "wood for poor families".',
        defense: 'Maintain respectful distance. You are not obligated to pay any donation. Photography is prohibited.',
      },
    ],
  },
];

export default function TouristScamAlertModal({ visible, onClose }) {
  const { theme } = useTheme();
  const [activeCity, setActiveCity] = useState(0);

  if (!visible) return null;

  const current = CITY_SCAMS[activeCity];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="shield-half" size={22} color="#D97706" />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Tourist Scam & Safety Radar</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Avoid touts, traps & overcharging in India
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* City Selector Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {CITY_SCAMS.map((c, idx) => {
              const isSelected = activeCity === idx;
              return (
                <Pressable
                  key={c.city}
                  style={[
                    styles.cityPill,
                    { borderColor: theme.border },
                    isSelected && { backgroundColor: c.color, borderColor: c.color },
                  ]}
                  onPress={() => setActiveCity(idx)}
                >
                  <Ionicons
                    name={c.icon}
                    size={14}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text style={[styles.cityPillText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {c.city}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Scams & Defense Cards */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {current.scams.map((s, idx) => (
              <View
                key={idx}
                style={[styles.scamCard, { backgroundColor: theme.background, borderColor: theme.border }]}
              >
                <View style={styles.scamHeader}>
                  <View style={styles.warningCircle}>
                    <Ionicons name="alert" size={14} color="#EF4444" />
                  </View>
                  <Text style={[styles.scamTitle, { color: theme.text }]}>{s.title}</Text>
                </View>

                <Text style={[styles.scamDesc, { color: theme.textSecondary }]}>{s.desc}</Text>

                <View style={[styles.defenseBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.defenseLabel}>HOW TO PROTECT YOURSELF:</Text>
                    <Text style={styles.defenseText}>{s.defense}</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* General Golden Rule */}
            <View style={[styles.goldenRuleBox, { borderColor: theme.border }]}>
              <Ionicons name="bulb-outline" size={18} color="#D97706" />
              <Text style={[styles.goldenRuleText, { color: theme.textSecondary }]}>
                Golden Indian Travel Rule: If a deal, gem, or auto ride sounds too good to be true, it is almost certainly a commission trap.
              </Text>
            </View>
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
  cityScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  cityPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 12,
  },
  scamCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  scamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scamTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  scamDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  defenseBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  defenseLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  defenseText: {
    fontSize: 11,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '500',
  },
  goldenRuleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  goldenRuleText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

export default function SideNavBarDrawer({
  visible,
  onClose,
  userName = 'Traveler',
  avatarUri = null,
  activeSection = 'map',
  onSelectSection,
  onOpenSafeWalk,
  onOpenTranslator,
  onOpenReminders,
  onOpenOfflineSos,
  onOpenWeatherAdvisory,
  onOpenHelplines,
  onOpenGeofenceAlert,
  onOpenShakeToSos,
  onOpenMedicalCard,
  onOpenScamAlert,
  onOpenLowBattery,
  onOpenGuideBook,
  isWatching = false,
  safetyScore = 95,
  docCount = 0,
}) {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (item) => {
    onClose();
    if (item.action) {
      setTimeout(() => item.action(), 220);
    } else if (item.sectionId && onSelectSection) {
      setTimeout(() => onSelectSection(item.sectionId), 220);
    }
  };

  const navGroups = [
    {
      title: '📖 HELP & GUIDE',
      items: [
        {
          id: 'guidebook',
          label: 'App Guide Book',
          icon: 'book',
          color: '#7C3AED',
          badge: 'NEW',
          badgeColor: '#7C3AED',
          desc: 'EN / हिन्दी / ગુજ — Learn all features with steps',
          action: onOpenGuideBook,
        },
      ],
    },
    {
      title: '🗺️ EXPLORE & NAVIGATION',
      items: [
        {
          id: 'map',
          label: 'Live Safety Map',
          icon: 'map',
          color: '#2563EB',
          badge: isWatching ? 'LIVE' : null,
          badgeColor: '#10B981',
          desc: 'GPS beacon & nearby emergency pins',
          action: () => router.push('/(tabs)/map'),
        },
        {
          id: 'trips',
          label: 'Trip Planner & Vehicles',
          icon: 'airplane',
          color: '#F59E0B',
          badge: '10 Modes',
          badgeColor: '#F59E0B',
          desc: 'Journeys, transit & vehicle safety',
          action: () => router.push('/trips'),
        },
        {
          id: 'vault',
          label: 'Secure Vault & Documents',
          icon: 'shield-checkmark',
          color: '#10B981',
          badge: docCount > 0 ? `${docCount} Docs` : 'Locked',
          badgeColor: '#10B981',
          desc: 'Biometric locked ID cards & passes',
          action: () => router.push('/documents'),
        },
      ],
    },
    {
      title: '🛠️ SMART TRAVEL TOOLS',
      items: [
        {
          id: 'safewalk',
          label: 'SafeWalk & Stealth Suite',
          icon: 'walk',
          color: '#8B5CF6',
          badge: 'PRO',
          badgeColor: '#8B5CF6',
          desc: 'Fake call, siren & pin guard',
          action: onOpenSafeWalk,
        },
        {
          id: 'translator',
          label: 'AI Travel Translator',
          icon: 'language',
          color: '#EC4899',
          badge: '14+ Langs',
          badgeColor: '#EC4899',
          desc: 'Voice & text translator',
          action: onOpenTranslator,
        },
        {
          id: 'weather',
          label: 'Live Weather & Advisory',
          icon: 'partly-sunny',
          color: '#0284C7',
          badge: 'RADAR',
          badgeColor: '#0284C7',
          desc: 'Forecast & travel safety warnings',
          action: onOpenWeatherAdvisory,
        },
        {
          id: 'scams',
          label: 'Tourist Scam & Safety Radar',
          icon: 'shield-half',
          color: '#D97706',
          badge: 'INDIA GUIDE',
          badgeColor: '#D97706',
          desc: 'Avoid touts, traps & overcharging',
          action: onOpenScamAlert,
        },
        {
          id: 'reminders',
          label: 'Travel Reminders',
          icon: 'alarm',
          color: '#06B6D4',
          badge: null,
          desc: 'Medicines, flights & check-ins',
          action: onOpenReminders,
        },
      ],
    },
    {
      title: '🆘 SAFETY & EMERGENCY',
      items: [
        {
          id: 'sos',
          label: 'Emergency SOS (112)',
          icon: 'warning',
          color: colors.danger,
          badge: 'CRITICAL',
          badgeColor: colors.danger,
          desc: 'Instant siren & dispatch alert',
          action: () => router.push('/sos'),
        },
        {
          id: 'shake_sos',
          label: 'Shake to SOS Guard',
          icon: 'phone-portrait',
          color: '#DC2626',
          badge: 'SHAKE',
          badgeColor: '#DC2626',
          desc: 'Vigorous motion distress trigger',
          action: onOpenShakeToSos,
        },
        {
          id: 'medical_card',
          label: 'Emergency Medical Pass',
          icon: 'medkit',
          color: '#E11D48',
          badge: 'QR ID',
          badgeColor: '#E11D48',
          desc: 'Scannable blood group & allergy pass',
          action: onOpenMedicalCard,
        },
        {
          id: 'offline_sos',
          label: 'Offline SOS (Zero Net SMS)',
          icon: 'airplane',
          color: '#EF4444',
          badge: 'NO INTERNET',
          badgeColor: '#EF4444',
          desc: 'Direct SMS with GPS coordinates',
          action: onOpenOfflineSos,
        },
        {
          id: 'low_battery',
          label: 'Low Battery Auto-Ping',
          icon: 'battery-dead',
          color: '#EA580C',
          badge: '15% AUTO',
          badgeColor: '#EA580C',
          desc: 'Dispatches last GPS before power off',
          action: onOpenLowBattery,
        },
        {
          id: 'helplines',
          label: 'All-India Helpline Directory',
          icon: 'call',
          color: '#15803D',
          badge: '10+ NOS',
          badgeColor: '#15803D',
          desc: '112, 1033 Highway, 139 Railway',
          action: onOpenHelplines,
        },
        {
          id: 'geofence',
          label: 'Danger Zone & Geofence',
          icon: 'navigate-circle',
          color: '#D97706',
          badge: 'NIGHT OWL',
          badgeColor: '#D97706',
          desc: 'Vibration alert for risk boundaries',
          action: onOpenGeofenceAlert,
        },
        {
          id: 'profile',
          label: 'My Profile & Contacts',
          icon: 'person-circle-outline',
          color: theme.primary,
          desc: 'Emergency contacts & blood group',
          action: () => router.push('/(tabs)/profile'),
        },
      ],
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop Tap Area */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sliding Sidebar Drawer */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: theme.card,
              borderRightColor: theme.border,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* 1. Drawer Header Profile */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.headerProfileRow}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: theme.primary }]} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarFallbackText}>
                    {userName ? userName.charAt(0).toUpperCase() : 'T'}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={[styles.userNameText, { color: theme.text }]} numberOfLines={1}>
                  {userName}
                </Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Safety Guard Active</Text>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.background }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            {/* Quick Safety Score Pill */}
            <View style={[styles.scoreBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.scoreItem}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Safety Score</Text>
              </View>
              <Text style={[styles.scoreValue, { color: '#10B981' }]}>{safetyScore}% Secure</Text>
            </View>
          </View>

          {/* 2. Scrollable Navigation Menu List */}
          <ScrollView
            style={styles.drawerScroll}
            contentContainerStyle={styles.drawerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {navGroups.map((group, gIdx) => (
              <View key={group.title || gIdx} style={styles.navGroup}>
                <Text style={[styles.navGroupTitle, { color: theme.textSecondary }]}>
                  {group.title}
                </Text>

                {group.items.map((item) => {
                  const isCurrent = activeSection === item.sectionId;
                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.navItem,
                        isCurrent && {
                          backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF',
                          borderLeftColor: theme.primary,
                          borderLeftWidth: 3,
                        },
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handleItemPress(item)}
                    >
                      <View style={[styles.navIconBox, { backgroundColor: item.color + '1A' }]}>
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>

                      <View style={styles.navTextCol}>
                        <View style={styles.navLabelRow}>
                          <Text
                            style={[
                              styles.navLabel,
                              { color: isCurrent ? theme.primary : theme.text },
                              isCurrent && { fontWeight: '700' },
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.badge && (
                            <View
                              style={[
                                styles.badgePill,
                                { backgroundColor: (item.badgeColor || theme.primary) + '22' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeText,
                                  { color: item.badgeColor || theme.primary },
                                ]}
                              >
                                {item.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        {item.desc && (
                          <Text
                            style={[styles.navDesc, { color: theme.textSecondary }]}
                            numberOfLines={1}
                          >
                            {item.desc}
                          </Text>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isCurrent ? theme.primary : theme.border}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* 3. Drawer Footer Controls (Dark Mode Toggle & Quick SOS) */}
          <View style={[styles.drawerFooter, { borderTopColor: theme.border, backgroundColor: theme.card }]}>
            <Pressable
              style={[styles.footerToggleBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
                size={18}
                color={isDarkMode ? '#F59E0B' : theme.text}
              />
              <Text style={[styles.footerToggleText, { color: theme.text }]}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.sosBarBtn}
              onPress={() => {
                onClose();
                setTimeout(() => router.push('/sos'), 200);
              }}
            >
              <Ionicons name="warning" size={16} color="#FFFFFF" />
              <Text style={styles.sosBarBtnText}>Emergency SOS 112</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawerContainer: {
    height: '100%',
    borderRightWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: Platform.OS === 'ios' ? 44 : 28,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  navGroup: {
    marginBottom: 16,
  },
  navGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  navTextCol: {
    flex: 1,
  },
  navLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 4,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  navDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  drawerFooter: {
    padding: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  footerToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  footerToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sosBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.danger,
  },
  sosBarBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

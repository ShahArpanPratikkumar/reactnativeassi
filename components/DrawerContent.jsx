import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useSurveys } from '@/context/SurveyContext';

const MENU_ICONS = {
  Dashboard: '🏠',
  'Survey Preview': '📋',
  Camera: '📷',
  Contacts: '👥',
  Location: '📍',
  Clipboard: '📎',
  Settings: '⚙️',
};

export function DrawerContent({ state, navigation }) {
  const { getTodayCount, profile } = useSurveys();

  const menuItems = [
    { label: 'Dashboard', route: '(tabs)' },
    { label: 'Survey Preview', route: 'survey-preview' },
    { label: 'Camera', route: 'camera' },
    { label: 'Contacts', route: 'contacts' },
    { label: 'Location', route: 'location' },
    { label: 'Clipboard', route: 'clipboard' },
    { label: 'Settings', route: 'settings' },
  ];

  const currentRoute = state.routes[state.index];
  const currentTabName = currentRoute?.state
    ? currentRoute.state.routes[currentRoute.state.index]?.name
    : currentRoute?.name;

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.studentName}>{profile?.name || 'User'}</Text>
        <Text style={styles.studentId}>{profile?.id || ''}</Text>
        <View style={styles.statsBadge}>
          <Text style={styles.statsBadgeText}>{getTodayCount()} surveys today</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Navigation</Text>
        {menuItems.map((item) => {
          const isActive =
            item.route === '(tabs)'
              ? currentRoute?.name === '(tabs)'
              : currentTabName === item.route || currentRoute?.name === item.route;

          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
                navigation.navigate(item.route);
                navigation.closeDrawer();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{MENU_ICONS[item.label]}</Text>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.version}>Smart Survey v1.0.0</Text>
        <Text style={styles.footerSub}>Built with Expo SDK 54</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  profileSection: {
    backgroundColor: Colors.light.primary,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.white,
    letterSpacing: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.success,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  studentName: {
    ...Typography.h3,
    color: Colors.light.white,
  },
  studentId: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  statsBadgeText: {
    ...Typography.smallMedium,
    color: 'rgba(255,255,255,0.9)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  menuSectionTitle: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: 2,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: Colors.light.primary + '10',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.lg,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
    flex: 1,
  },
  menuLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -12,
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    marginBottom: Spacing.lg,
  },
  version: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
  },
  footerSub: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});

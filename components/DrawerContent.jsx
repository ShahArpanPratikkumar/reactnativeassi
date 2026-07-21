import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useSurveys } from '@/context/SurveyContext';

export function DrawerContent({ state, navigation }) {
  const { getTodayCount } = useSurveys();

  const menuItems = [
    { label: 'Dashboard', icon: '\uD83C\uDFE0', route: '(tabs)' },
    { label: 'Survey Preview', icon: '\uD83D\uDCCB', route: 'survey-preview' },
    { label: 'Camera', icon: '\uD83D\uDCF7', route: 'camera' },
    { label: 'Contacts', icon: '\uD83D\uDC65', route: 'contacts' },
    { label: 'Location', icon: '\uD83D\uDCCD', route: 'location' },
    { label: 'Clipboard', icon: '\uD83D\uDD18', route: 'clipboard' },
    { label: 'Settings', icon: '\u2699\uFE0F', route: 'settings' },
  ];

  const currentRoute = state.routes[state.index];
  const currentTabName = currentRoute?.state
    ? currentRoute.state.routes[currentRoute.state.index]?.name
    : currentRoute?.name;

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AS</Text>
        </View>
        <Text style={styles.studentName}>Arpan Shah</Text>
        <Text style={styles.studentId}>ID: STU-2026-0042</Text>
        <Text style={styles.studentDept}>Computer Engineering</Text>
      </View>

      <View style={styles.menuContainer}>
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
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Today&apos;s Surveys</Text>
          <Text style={styles.statsValue}>{getTodayCount()}</Text>
        </View>
        <Text style={styles.version}>Smart Survey v1.0.0</Text>
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
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.white,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.white,
  },
  studentId: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  studentDept: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  menuItemActive: {
    backgroundColor: '#E8F5E9',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.lg,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  menuLabelActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  version: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});

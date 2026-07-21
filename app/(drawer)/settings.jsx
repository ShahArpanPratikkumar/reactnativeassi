import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [locationTracking, setLocationTracking] = React.useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>App preferences</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <Card title="General" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🔔</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive push notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
              thumbColor={notifications ? Colors.light.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🌙</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
              thumbColor={darkMode ? Colors.light.primary : '#f4f3f4'}
            />
          </View>
          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>📍</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Location Tracking</Text>
              <Text style={styles.settingDescription}>Auto-track GPS for surveys</Text>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
              thumbColor={locationTracking ? Colors.light.primary : '#f4f3f4'}
            />
          </View>
        </Card>

        <Card title="Data" style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Clear Cache', 'Cache cleared successfully.')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#F0FAF0' }]}>
              <Text style={styles.menuIcon}>🗑️</Text>
            </View>
            <Text style={styles.menuLabel}>Clear Cache</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() =>
              Alert.alert(
                'Reset Data',
                'This will delete all surveys. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive' },
                ]
              )
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Text style={styles.menuIcon}>⚠️</Text>
            </View>
            <Text style={[styles.menuLabel, { color: Colors.light.error }]}>
              Reset All Data
            </Text>
            <Text style={[styles.menuArrow, { color: Colors.light.error }]}>›</Text>
          </TouchableOpacity>
        </Card>

        <Card title="About" style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>SDK</Text>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutValue}>Expo SDK 54</Text>
            </View>
          </View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.aboutLabel}>Framework</Text>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutValue}>React Native 0.81</Text>
            </View>
          </View>
        </Card>

        <View style={styles.logoutContainer}>
          <PrimaryButton
            title="Log Out"
            variant="danger"
            onPress={() =>
              Alert.alert('Log Out', 'Are you sure you want to log out?')
            }
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight || '#F1F5F9',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  settingDescription: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight || '#F1F5F9',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.light.textSecondary,
    fontWeight: '300',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight || '#F1F5F9',
  },
  aboutLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  aboutBadge: {
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  aboutValue: {
    ...Typography.smallMedium,
    color: Colors.light.text,
  },
  logoutContainer: {
    marginTop: Spacing.sm,
  },
});

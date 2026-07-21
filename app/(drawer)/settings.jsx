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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [locationTracking, setLocationTracking] = React.useState(true);

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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>App preferences</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card title="General" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive push notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.light.border, true: '#A5D6A7' }}
              thumbColor={notifications ? Colors.light.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Use dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.light.border, true: '#A5D6A7' }}
              thumbColor={darkMode ? Colors.light.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Location Tracking</Text>
              <Text style={styles.settingDescription}>Auto-track GPS for surveys</Text>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: Colors.light.border, true: '#A5D6A7' }}
              thumbColor={locationTracking ? Colors.light.primary : '#f4f3f4'}
            />
          </View>
        </Card>

        <Card title="Data" style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Clear Cache', 'Cache cleared successfully.')}
          >
            <Text style={styles.menuLabel}>Clear Cache</Text>
            <Text style={styles.menuArrow}>{'\u25B6'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuRow}
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
          >
            <Text style={[styles.menuLabel, { color: Colors.light.error }]}>
              Reset All Data
            </Text>
            <Text style={[styles.menuArrow, { color: Colors.light.error }]}>{'\u25B6'}</Text>
          </TouchableOpacity>
        </Card>

        <Card title="About" style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>SDK</Text>
            <Text style={styles.aboutValue}>Expo SDK 54</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Framework</Text>
            <Text style={styles.aboutValue}>React Native 0.81</Text>
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

        <View style={{ height: 30 }} />
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
  scrollContent: {
    flex: 1,
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
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  menuArrow: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  aboutLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  logoutContainer: {
    marginTop: Spacing.sm,
  },
});

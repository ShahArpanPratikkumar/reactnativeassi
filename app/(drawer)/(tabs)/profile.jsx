import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSurveys } from '@/context/SurveyContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { surveys, profile, updateProfile } = useSurveys();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profile });
  const [errors, setErrors] = useState({});

  const highCount = surveys.filter((s) => s.priority === 'High').length;
  const mediumCount = surveys.filter((s) => s.priority === 'Medium').length;
  const lowCount = surveys.filter((s) => s.priority === 'Low').length;

  const initials = profile.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  const handleEdit = () => {
    setEditData({ ...profile });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setEditData({ ...profile });
  };

  const handleSave = () => {
    const newErrors = {};
    if (!editData.name || editData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    if (!editData.email || editData.email.trim() === '') {
      newErrors.email = 'Email is required';
    }
    if (!editData.phone || editData.phone.trim() === '') {
      newErrors.phone = 'Phone is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    updateProfile(editData);
    setIsEditing(false);
    setErrors({});
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const updateField = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Your account details</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.id}>{profile.id}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile.department}</Text>
          </View>
        </View>

        {/* Personal Info */}
        <Card title="Personal Information" style={styles.card}>
          {isEditing ? (
            <>
              <Input
                label="Name *"
                value={editData.name}
                onChangeText={(v) => updateField('name', v)}
                placeholder="Enter your name"
                error={errors.name}
                icon="👤"
              />
              <Input
                label="Student ID"
                value={editData.id}
                onChangeText={(v) => updateField('id', v)}
                placeholder="Enter student ID"
                icon="🪪"
              />
              <Input
                label="Department"
                value={editData.department}
                onChangeText={(v) => updateField('department', v)}
                placeholder="Enter department"
                icon="🏛️"
              />
              <Input
                label="Semester"
                value={editData.semester}
                onChangeText={(v) => updateField('semester', v)}
                placeholder="Enter semester"
                icon="📚"
              />
              <Input
                label="Email *"
                value={editData.email}
                onChangeText={(v) => updateField('email', v)}
                placeholder="Enter email"
                keyboardType="email-address"
                error={errors.email}
                icon="📧"
              />
              <Input
                label="Phone *"
                value={editData.phone}
                onChangeText={(v) => updateField('phone', v)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                error={errors.phone}
                icon="📱"
              />
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{profile.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Student ID</Text>
                <Text style={styles.detailValue}>{profile.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Department</Text>
                <Text style={styles.detailValue}>{profile.department}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Semester</Text>
                <Text style={styles.detailValue}>{profile.semester}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{profile.email}</Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{profile.phone}</Text>
              </View>
            </>
          )}
        </Card>

        {isEditing ? (
          <View style={styles.editButtons}>
            <PrimaryButton
              title="Save Changes"
              onPress={handleSave}
              icon={'✓'}
            />
            <View style={{ height: Spacing.md }} />
            <PrimaryButton
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
            />
          </View>
        ) : (
          <View style={styles.editButtons}>
            <PrimaryButton
              title="Edit Profile"
              onPress={handleEdit}
              icon={'✏️'}
              variant="outline"
            />
          </View>
        )}

        {/* Stats */}
        <Card title="Survey Statistics" style={styles.card}>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: '#F0FAF0' }]}>
              <Text style={[styles.statNumber, { color: '#2E7D32' }]}>{surveys.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>{highCount}</Text>
              <Text style={styles.statLabel}>High</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#FFFBEB' }]}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{mediumCount}</Text>
              <Text style={styles.statLabel}>Medium</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.statNumber, { color: '#22C55E' }]}>{lowCount}</Text>
              <Text style={styles.statLabel}>Low</Text>
            </View>
          </View>
        </Card>

        {/* Quick Links */}
        <Card title="Quick Links" style={styles.card}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.linkIconContainer, { backgroundColor: '#F0FAF0' }]}>
              <Text style={styles.linkIcon}>⚙️</Text>
            </View>
            <Text style={styles.linkText}>Settings</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('(tabs)', { screen: 'history' })}
            activeOpacity={0.7}
          >
            <View style={[styles.linkIconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Text style={styles.linkIcon}>📋</Text>
            </View>
            <Text style={styles.linkText}>Survey History</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkItem, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert('About', 'Smart Survey v1.0.0\nBuilt with Expo SDK 54')}
            activeOpacity={0.7}
          >
            <View style={[styles.linkIconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.linkIcon}>ℹ️</Text>
            </View>
            <Text style={styles.linkText}>About</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.logoutContainer}>
          <PrimaryButton
            title="Log Out"
            variant="outline"
            onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?')}
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
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
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
    paddingTop: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatarOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    backgroundColor: Colors.light.primary + '20',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.white,
    letterSpacing: 1,
  },
  name: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  id: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  roleText: {
    ...Typography.smallMedium,
    color: Colors.light.primary,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight || '#F1F5F9',
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
  },
  editButtons: {
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  statNumber: {
    ...Typography.h2,
  },
  statLabel: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight || '#F1F5F9',
  },
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  linkIcon: {
    fontSize: 18,
  },
  linkText: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  linkArrow: {
    fontSize: 20,
    color: Colors.light.textSecondary,
    fontWeight: '300',
  },
  logoutContainer: {
    marginTop: Spacing.sm,
  },
});

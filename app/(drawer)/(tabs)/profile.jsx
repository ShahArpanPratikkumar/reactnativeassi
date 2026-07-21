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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSurveys } from '@/context/SurveyContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { surveys, profile, updateProfile } = useSurveys();
  const navigation = useNavigation();
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

      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Your account details</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.id}>{profile.id}</Text>
        </View>

        <Card title="Personal Information" style={styles.card}>
          {isEditing ? (
            <>
              <Input
                label="Name *"
                value={editData.name}
                onChangeText={(v) => updateField('name', v)}
                placeholder="Enter your name"
                error={errors.name}
              />
              <Input
                label="Student ID"
                value={editData.id}
                onChangeText={(v) => updateField('id', v)}
                placeholder="Enter student ID"
              />
              <Input
                label="Department"
                value={editData.department}
                onChangeText={(v) => updateField('department', v)}
                placeholder="Enter department"
              />
              <Input
                label="Semester"
                value={editData.semester}
                onChangeText={(v) => updateField('semester', v)}
                placeholder="Enter semester"
              />
              <Input
                label="Email *"
                value={editData.email}
                onChangeText={(v) => updateField('email', v)}
                placeholder="Enter email"
                keyboardType="email-address"
                error={errors.email}
              />
              <Input
                label="Phone *"
                value={editData.phone}
                onChangeText={(v) => updateField('phone', v)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                error={errors.phone}
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
              <View style={styles.detailRow}>
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
              icon={'\u2713'}
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
              icon={'\u270F\uFE0F'}
              variant="outline"
            />
          </View>
        )}

        <Card title="Survey Statistics" style={styles.card}>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statNumber, { color: Colors.light.primary }]}>{surveys.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.statNumber, { color: Colors.light.error }]}>{highCount}</Text>
              <Text style={styles.statLabel}>High</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>{mediumCount}</Text>
              <Text style={styles.statLabel}>Medium</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.statNumber, { color: Colors.light.success }]}>{lowCount}</Text>
              <Text style={styles.statLabel}>Low</Text>
            </View>
          </View>
        </Card>

        <Card title="Quick Links" style={styles.card}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('settings')}
          >
            <Text style={styles.linkIcon}>{'\u2699\uFE0F'}</Text>
            <Text style={styles.linkText}>Settings</Text>
            <Text style={styles.linkArrow}>{'\u25B6'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('(tabs)', { screen: 'history' })}
          >
            <Text style={styles.linkIcon}>{'\uD83D\uDCCB'}</Text>
            <Text style={styles.linkText}>Survey History</Text>
            <Text style={styles.linkArrow}>{'\u25B6'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Alert.alert('About', 'Smart Survey v1.0.0\nBuilt with Expo SDK 54')}
          >
            <Text style={styles.linkIcon}>{'\u2139\uFE0F'}</Text>
            <Text style={styles.linkText}>About</Text>
            <Text style={styles.linkArrow}>{'\u25B6'}</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.logoutContainer}>
          <PrimaryButton
            title="Log Out"
            variant="outline"
            onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?')}
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  id: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  linkIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 28,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  linkArrow: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  logoutContainer: {
    marginTop: Spacing.sm,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSurveys } from '@/context/SurveyContext';
import { formatDate, getPriorityColor } from '@/utils/helper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SurveyPreviewScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { selectedSurvey, updateSurvey } = useSurveys();
  const [submitting, setSubmitting] = useState(false);

  if (!selectedSurvey) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📋 Survey Preview</Text>
            <Text style={styles.headerSubtitle}>Review survey details</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>No Survey Selected</Text>
          <Text style={styles.emptyMessage}>
            Select a survey from the History tab to preview its details.
          </Text>
          <PrimaryButton
            title="Go to History"
            onPress={() => navigation.navigate('(tabs)', { screen: 'history' })}
          />
        </View>
      </View>
    );
  }

  const survey = selectedSurvey;
  const priorityColor = getPriorityColor(survey.priority, Colors.light);

  const handleSubmit = () => {
    Alert.alert(
      'Submit Survey',
      'Are you sure you want to submit this survey? This will mark it as completed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            setSubmitting(true);
            setTimeout(() => {
              updateSurvey(survey.id, { submitted: true });
              setSubmitting(false);
              Alert.alert('Success', 'Survey submitted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            }, 800);
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert('Edit Survey', 'Navigate to edit this survey?');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📋 Survey Preview</Text>
          <Text style={styles.headerSubtitle}>Review before submit</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <Card style={styles.mainCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.siteName}>{survey.siteName}</Text>
              <Text style={styles.clientName}>{survey.clientName}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '15' }]}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {survey.priority}
              </Text>
            </View>
          </View>
        </Card>

        <Card title="📝 Description" style={styles.card}>
          <Text style={styles.description}>{survey.description}</Text>
        </Card>

        <Card title="📊 Details" style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(survey.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <View style={[styles.miniBadge, { backgroundColor: priorityColor + '15' }]}>
              <Text style={[styles.miniBadgeText, { color: priorityColor }]}>
                {survey.priority}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: survey.submitted ? '#F0FDF4' : '#FFFBEB' }]}>
              <Text style={[styles.statusText, { color: survey.submitted ? '#22C55E' : '#F59E0B' }]}>
                {survey.submitted ? 'Submitted' : 'Pending'}
              </Text>
            </View>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {survey.createdAt ? formatDate(survey.createdAt.split('T')[0]) : 'N/A'}
            </Text>
          </View>
        </Card>

        {survey.photo ? (
          <Card title="📷 Captured Photo" style={styles.card}>
            <Image source={{ uri: survey.photo }} style={styles.photo} />
          </Card>
        ) : (
          <Card title="📷 Captured Photo" style={styles.card}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>📷</Text>
              <Text style={styles.photoPlaceholderText}>No photo captured</Text>
              <Text style={styles.photoPlaceholderSub}>Take a photo from the Camera to attach it</Text>
            </View>
          </Card>
        )}

        {survey.contact ? (
          <Card title="👥 Selected Contact" style={styles.card}>
            <View style={styles.contactRow}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {survey.contact.name ? survey.contact.name[0] : '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.contactName}>{survey.contact.name}</Text>
                <Text style={styles.contactPhone}>{survey.contact.phone}</Text>
              </View>
            </View>
          </Card>
        ) : null}

        {survey.location ? (
          <Card title="📍 Location" style={styles.card}>
            <View style={styles.locationRow}>
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Latitude</Text>
                <Text style={styles.locationValue}>
                  {survey.location.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.locationDivider} />
              <View style={styles.locationItem}>
                <Text style={styles.locationLabel}>Longitude</Text>
                <Text style={styles.locationValue}>
                  {survey.location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {survey.notes ? (
          <Card title="📝 Notes" style={styles.card}>
            <Text style={styles.notes}>{survey.notes}</Text>
          </Card>
        ) : null}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Edit Survey"
            variant="outline"
            onPress={handleEdit}
            icon={'✏️'}
          />
          <View style={{ height: Spacing.md }} />
          <PrimaryButton
            title="Submit Survey"
            onPress={handleSubmit}
            loading={submitting}
            icon={'✓'}
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
    paddingTop: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  emptyMessage: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  mainCard: {
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  siteName: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  clientName: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    ...Typography.smallMedium,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.body,
    color: Colors.light.text,
    lineHeight: 22,
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
  miniBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  miniBadgeText: {
    ...Typography.smallMedium,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.smallMedium,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.xl,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    borderRadius: BorderRadius.xl,
  },
  photoPlaceholderIcon: {
    fontSize: 44,
    marginBottom: Spacing.md,
  },
  photoPlaceholderText: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
  },
  photoPlaceholderSub: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactAvatarText: {
    ...Typography.bodySemibold,
    color: Colors.light.white,
  },
  contactName: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  contactPhone: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationItem: {
    flex: 1,
    alignItems: 'center',
  },
  locationDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.lg,
  },
  locationLabel: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  locationValue: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
    fontVariant: ['tabular-nums'],
  },
  notes: {
    ...Typography.body,
    color: Colors.light.text,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.sm,
  },
});

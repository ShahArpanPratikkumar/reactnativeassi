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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSurveys } from '@/context/SurveyContext';
import { formatDate, getPriorityColor } from '@/utils/helper';
import { useNavigation } from '@react-navigation/native';

export default function SurveyPreviewScreen() {
  const navigation = useNavigation();
  const { selectedSurvey, updateSurvey } = useSurveys();
  const [submitting, setSubmitting] = useState(false);

  if (!selectedSurvey) {
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
            <Text style={styles.headerTitle}>Survey Preview</Text>
            <Text style={styles.headerSubtitle}>Review survey details</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{'\uD83D\uDCCB'}</Text>
          <Text style={styles.emptyTitle}>No Survey Selected</Text>
          <Text style={styles.emptyMessage}>
            Select a survey from the History tab to preview its details.
          </Text>
          <PrimaryButton
            title="Go to History"
            onPress={() => navigation.navigate('(tabs)', { screen: 'history' })}
            icon={'\uD83D\uDCCB'}
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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Survey Preview</Text>
          <Text style={styles.headerSubtitle}>Review before submit</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.siteName}>{survey.siteName}</Text>
              <Text style={styles.clientName}>{survey.clientName}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {survey.priority}
              </Text>
            </View>
          </View>
        </Card>

        <Card title="Description" style={styles.card}>
          <Text style={styles.description}>{survey.description}</Text>
        </Card>

        <Card title="Details" style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(survey.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <View style={[styles.miniBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.miniBadgeText, { color: priorityColor }]}>
                {survey.priority}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, survey.submitted && { color: Colors.light.success }]}>
              {survey.submitted ? 'Submitted' : 'Pending'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {survey.createdAt ? formatDate(survey.createdAt.split('T')[0]) : 'N/A'}
            </Text>
          </View>
        </Card>

        {survey.photo ? (
          <Card title="Captured Photo" style={styles.card}>
            <Image source={{ uri: survey.photo }} style={styles.photo} />
          </Card>
        ) : (
          <Card title="Captured Photo" style={styles.card}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>{'\uD83D\uDCF7'}</Text>
              <Text style={styles.photoPlaceholderText}>No photo captured</Text>
              <Text style={styles.photoPlaceholderSub}>Take a photo from the Camera to attach it</Text>
            </View>
          </Card>
        )}

        {survey.contact ? (
          <Card title="Selected Contact" style={styles.card}>
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
          <Card title="Location" style={styles.card}>
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
          <Card title="Notes" style={styles.card}>
            <Text style={styles.notes}>{survey.notes}</Text>
          </Card>
        ) : null}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Edit Survey"
            variant="outline"
            onPress={handleEdit}
            icon={'\u270F\uFE0F'}
          />
          <View style={{ height: Spacing.md }} />
          <PrimaryButton
            title="Submit Survey"
            onPress={handleSubmit}
            loading={submitting}
            icon={'\u2713'}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  emptyMessage: {
    fontSize: 15,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  clientName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
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
  miniBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
  },
  photoPlaceholderIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  photoPlaceholderSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  contactPhone: {
    fontSize: 13,
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
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    fontVariant: ['tabular-nums'],
  },
  notes: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.sm,
  },
});

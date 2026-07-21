import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Input } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { useSurveys } from '@/context/SurveyContext';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { validateSurveyFields, formatDate } from '@/utils/helper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

const PRIORITY_COLORS = {
  High: { bg: '#FEF2F2', color: '#EF4444', icon: '🔴' },
  Medium: { bg: '#FFFBEB', color: '#F59E0B', icon: '🟡' },
  Low: { bg: '#F0FDF4', color: '#22C55E', icon: '🟢' },
};

export default function NewSurveyScreen() {
  const navigation = useNavigation();
  const { addSurvey, capturedPhoto } = useSurveys();
  const insets = useSafeAreaInsets();

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const survey = { siteName, clientName, description, priority, date };
    const validationErrors = validateSurveyFields(survey);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setErrors({});
    setSubmitting(true);

    setTimeout(() => {
      const surveyData = { siteName, clientName, description, priority, date };
      if (capturedPhoto) {
        surveyData.photo = capturedPhoto;
      }
      addSurvey(surveyData);
      setSubmitting(false);

      Alert.alert('Success', 'Survey created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setSiteName('');
            setClientName('');
            setDescription('');
            setPriority('');
            setDate(new Date().toISOString().split('T')[0]);
          },
        },
      ]);
    }, 800);
  };

  const handleDateChange = (increment) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + increment);
    setDate(currentDate.toISOString().split('T')[0]);
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const filledFields = [siteName, clientName, description, priority, date].filter(Boolean).length;
  const progressPercent = (filledFields / 5) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Survey</Text>
          <Text style={styles.headerSubtitle}>Create a field inspection</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {capturedPhoto ? (
            <Card style={styles.photoCard}>
              <View style={styles.photoRow}>
                <Image source={{ uri: capturedPhoto }} style={styles.photoThumb} />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoTitle}>Photo Attached</Text>
                  <Text style={styles.photoSub}>Captured from camera</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('camera')} activeOpacity={0.7}>
                  <View style={styles.changeBadge}>
                    <Text style={styles.changeText}>Change</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoCard}
              onPress={() => navigation.navigate('camera')}
              activeOpacity={0.7}
            >
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoText}>Tap to capture a site photo</Text>
              <Text style={styles.addPhotoSub}>Optional but recommended</Text>
            </TouchableOpacity>
          )}

          {/* Site Name & Client */}
          <Card style={styles.formCard}>
            <Input
              label="Site Name *"
              value={siteName}
              onChangeText={(v) => handleFieldChange('siteName', v, setSiteName)}
              placeholder="e.g. Downtown Office Complex"
              error={errors.siteName}
              icon="🏢"
            />

            <Input
              label="Client Name *"
              value={clientName}
              onChangeText={(v) => handleFieldChange('clientName', v, setClientName)}
              placeholder="e.g. ABC Corporation"
              error={errors.clientName}
              icon="👤"
            />

            <Input
              label="Description *"
              value={description}
              onChangeText={(v) => handleFieldChange('description', v, setDescription)}
              placeholder="Describe the inspection scope and objectives..."
              multiline
              numberOfLines={4}
              error={errors.description}
              icon="📝"
            />
          </Card>

          {/* Priority */}
          <Card title="Priority Level" style={styles.formCard}>
            <View style={styles.priorityGrid}>
              {PRIORITY_OPTIONS.map((option) => {
                const pc = PRIORITY_COLORS[option];
                const isSelected = priority === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.priorityCard,
                      { backgroundColor: pc.bg },
                      isSelected && { borderColor: pc.color, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      setPriority(option);
                      if (errors.priority) setErrors((prev) => ({ ...prev, priority: undefined }));
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.priorityIcon}>{pc.icon}</Text>
                    <Text style={[styles.priorityLabel, { color: pc.color }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.priority ? <Text style={styles.errorText}>{errors.priority}</Text> : null}
          </Card>

          {/* Date */}
          <Card title="Inspection Date" style={styles.formCard}>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateNavButton}
                onPress={() => handleDateChange(-1)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateNavText}>◀</Text>
              </TouchableOpacity>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={styles.dateSubtext}>{date}</Text>
              </View>
              <TouchableOpacity
                style={styles.dateNavButton}
                onPress={() => handleDateChange(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateNavText}>▶</Text>
              </TouchableOpacity>
            </View>
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
          </Card>

          {/* Submit */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Create Survey"
              onPress={handleSubmit}
              loading={submitting}
              icon={'✓'}
            />
            <View style={{ height: Spacing.md }} />
            <PrimaryButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  progressSection: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  progressPercent: {
    ...Typography.bodyMedium,
    color: Colors.light.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateNavButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary,
  },
  dateNavText: {
    fontSize: 14,
    color: Colors.light.white,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  dateText: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
  },
  dateSubtext: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.sm,
  },
  photoCard: {
    marginBottom: Spacing.lg,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoThumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    ...Typography.bodySemibold,
    color: Colors.light.primary,
  },
  photoSub: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  changeBadge: {
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  changeText: {
    ...Typography.smallMedium,
    color: Colors.light.primary,
  },
  addPhotoCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addPhotoIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  addPhotoText: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  addPhotoSub: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  priorityLabel: {
    ...Typography.bodyMedium,
  },
});

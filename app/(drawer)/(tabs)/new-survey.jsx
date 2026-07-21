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
import { Input, Select } from '@/components/Input';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { useSurveys } from '@/context/SurveyContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { validateSurveyFields, formatDate } from '@/utils/helper';
import { useNavigation } from '@react-navigation/native';

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function NewSurveyScreen() {
  const navigation = useNavigation();
  const { addSurvey, capturedPhoto } = useSurveys();

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>{'\u2190'}</Text>
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
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDotActive} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.progressLabel}>Fill in the survey details</Text>

          {capturedPhoto ? (
            <Card style={styles.photoAttachment}>
              <View style={styles.photoAttachmentRow}>
                <Image source={{ uri: capturedPhoto }} style={styles.photoThumb} />
                <View style={styles.photoAttachmentInfo}>
                  <Text style={styles.photoAttachmentTitle}>Photo Attached</Text>
                  <Text style={styles.photoAttachmentSub}>Captured from camera</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('camera')}>
                  <Text style={styles.photoChangeText}>Change</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoCard}
              onPress={() => navigation.navigate('camera')}
            >
              <Text style={styles.addPhotoIcon}>{'\uD83D\uDCF7'}</Text>
              <Text style={styles.addPhotoText}>Tap to capture a site photo</Text>
            </TouchableOpacity>
          )}

          {/* Site Name */}
          <Card style={styles.formCard}>
            <Input
              label="Site Name *"
              value={siteName}
              onChangeText={(v) => handleFieldChange('siteName', v, setSiteName)}
              placeholder="e.g. Downtown Office Complex"
              error={errors.siteName}
            />

            {/* Client Name */}
            <Input
              label="Client Name *"
              value={clientName}
              onChangeText={(v) => handleFieldChange('clientName', v, setClientName)}
              placeholder="e.g. ABC Corporation"
              error={errors.clientName}
            />

            {/* Description */}
            <Input
              label="Description *"
              value={description}
              onChangeText={(v) => handleFieldChange('description', v, setDescription)}
              placeholder="Describe the inspection scope and objectives..."
              multiline
              numberOfLines={4}
              error={errors.description}
            />
          </Card>

          {/* Priority Selection */}
          <Card title="Priority Level" style={styles.formCard}>
            <Select
              label="Priority *"
              value={priority}
              options={PRIORITY_OPTIONS}
              onValueChange={(v) => {
                setPriority(v);
                if (errors.priority) {
                  setErrors((prev) => ({ ...prev, priority: undefined }));
                }
              }}
              placeholder="Select priority"
              error={errors.priority}
            />
          </Card>

          {/* Date Selection */}
          <Card title="Inspection Date" style={styles.formCard}>
            <Text style={styles.dateLabel}>Date *</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateNavButton}
                onPress={() => handleDateChange(-1)}
              >
                <Text style={styles.dateNavText}>{'\u25C0'}</Text>
              </TouchableOpacity>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={styles.dateSubtext}>{date}</Text>
              </View>
              <TouchableOpacity
                style={styles.dateNavButton}
                onPress={() => handleDateChange(1)}
              >
                <Text style={styles.dateNavText}>{'\u25B6'}</Text>
              </TouchableOpacity>
            </View>
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
          </Card>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Create Survey"
              onPress={handleSubmit}
              loading={submitting}
              icon={'\u2713'}
            />
            <View style={{ height: Spacing.md }} />
            <PrimaryButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
          </View>

          <View style={{ height: 40 }} />
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.border,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.sm,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
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
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
  },
  dateNavText: {
    fontSize: 16,
    color: Colors.light.white,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.light.background,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dateSubtext: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.sm,
  },
  photoAttachment: {
    marginBottom: Spacing.lg,
  },
  photoAttachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoThumb: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  photoAttachmentInfo: {
    flex: 1,
  },
  photoAttachmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  photoAttachmentSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  photoChangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  addPhotoCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addPhotoIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  addPhotoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});

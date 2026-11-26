// Travel Guardian - Document Scanner & Add Document Screen
// Simple document image capture, preview, validation, and upload into offline vault

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { uploadDocument, getCachedDocuments, setCachedDocuments } from '../../services/documentService';
import { isEmpty } from '../../utils/validation';

export default function DocumentScannerScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Document types
  const documentTypes = [
    'Passport',
    'ID Card',
    'Driving License',
    'Visa',
    'Travel Insurance',
    'Flight Ticket',
    'Hotel Booking',
    'Other',
  ];

  // Form & Image State
  const [selectedType, setSelectedType] = useState('Passport');
  const [documentTitle, setDocumentTitle] = useState('Official Passport Copy');
  const [expiryDate, setExpiryDate] = useState('2032-12-31');
  const [capturedImage, setCapturedImage] = useState(null); // URI of scanned document

  // Loading & Error States
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Update default title when type changes
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    switch (type) {
      case 'Passport':
        setDocumentTitle('Official Passport Copy');
        break;
      case 'ID Card':
        setDocumentTitle('Identity Card / Aadhaar');
        break;
      case 'Driving License':
        setDocumentTitle('Driver License ID');
        break;
      case 'Visa':
        setDocumentTitle('Tourist Entry Visa');
        break;
      case 'Travel Insurance':
        setDocumentTitle('Travel Health Insurance Policy');
        break;
      case 'Flight Ticket':
        setDocumentTitle('Flight Boarding Pass');
        break;
      case 'Hotel Booking':
        setDocumentTitle('Hotel Booking Voucher');
        break;
      default:
        setDocumentTitle('Travel Document');
    }
  };

  // 1. Scan / Capture Document with Camera
  const handleCaptureWithCamera = async () => {
    try {
      setErrorMsg(null);
      setIsScanning(true);

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is needed to scan travel documents.');
        setIsScanning(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert('Scan Error', 'Invalid document image captured.');
          return;
        }
        setCapturedImage(asset.uri);
      }
    } catch (error) {
      setErrorMsg('Camera error: ' + error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsScanning(false);
    }
  };

  // 2. Pick Document from Photo Library
  const handlePickFromLibrary = async () => {
    try {
      setErrorMsg(null);
      setIsScanning(true);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Photo library permission is needed to select documents.');
        setIsScanning(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCapturedImage(asset.uri);
      }
    } catch (error) {
      setErrorMsg('Library error: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  // 3. Retake / Clear Document Image
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // 4. Save & Upload Document
  const handleSaveAndUpload = async () => {
    if (!capturedImage) {
      Alert.alert('Validation Error', 'Please capture or pick a document image first.');
      return;
    }

    if (isEmpty(documentTitle)) {
      Alert.alert('Validation Error', 'Please give this document a name.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('title', documentTitle.trim());
      formData.append('documentType', selectedType);
      formData.append('expiryDate', expiryDate.trim());

      formData.append('file', {
        uri: capturedImage,
        name: `${selectedType.toLowerCase().replace(/\s+/g, '_')}.jpg`,
        type: 'image/jpeg',
      });

      // Optimistic local cache insertion so it appears right away
      try {
        const cached = await getCachedDocuments();
        const tempDoc = {
          _id: 'temp_' + Date.now(),
          title: documentTitle.trim(),
          documentType: selectedType,
          expiryDate: expiryDate.trim(),
          imageUri: capturedImage,
          fileUrl: capturedImage,
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };
        await setCachedDocuments([tempDoc, ...cached]);
      } catch {}

      // Upload to backend API
      await uploadDocument(formData);

      Alert.alert(
        'Document Saved! 📄',
        `"${documentTitle}" has been saved and is ready for offline access in your Travel Vault.`,
        [
          {
            text: 'View Vault',
            onPress: () => router.replace('/documents'),
          },
        ]
      );
    } catch (error) {
      setErrorMsg('Save error: ' + error.message);
      Alert.alert('Error', error.message || 'Could not upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Document Category Type Selector */}
      <Text style={[styles.sectionLabel, { color: theme.text }]}>Select Document Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typesList}
      >
        {documentTypes.map((type) => (
          <Pressable
            key={type}
            style={[
              styles.typeTab,
              { backgroundColor: selectedType === type ? theme.primary : theme.card, borderColor: theme.border },
            ]}
            onPress={() => handleTypeSelect(type)}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: selectedType === type ? colors.white : theme.textSecondary },
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 2. Error Message */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.white} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      )}

      {/* 3. Document Scan Frame OR Captured Preview */}
      {capturedImage ? (
        // Preview State
        <View style={styles.previewBox}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewBadge}>
            <Ionicons name="checkmark-circle" size={16} color={theme.secondary} />
            <Text style={styles.previewBadgeText}>Document Captured & Validated</Text>
          </View>
        </View>
      ) : (
        // Scanner Target Frame
        <View style={[styles.scannerFrame, { backgroundColor: theme.card, borderColor: theme.primaryLight }]}>
          <Ionicons name="scan" size={140} color={theme.primary} />
          <Text style={[styles.scannerInstruction, { color: theme.text }]}>
            Align your {selectedType} inside the frame
          </Text>
          <Text style={[styles.scannerSubtext, { color: theme.textSecondary }]}>
            Ensure all 4 corners and text details are clearly visible.
          </Text>

          {/* Action Buttons to capture */}
          <View style={styles.captureOptionsRow}>
            <Pressable
              style={[styles.captureBtn, { backgroundColor: theme.primary }]}
              onPress={handleCaptureWithCamera}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="camera" size={20} color={colors.white} />
                  <Text style={styles.captureBtnText}>Open Camera</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.captureBtn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
              onPress={handlePickFromLibrary}
              disabled={isScanning}
            >
              <Ionicons name="images" size={20} color={theme.text} />
              <Text style={[styles.galleryBtnText, { color: theme.text }]}>Choose from Gallery</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 4. Form Fields for Document Title & Expiry */}
      {capturedImage && (
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.inputHeading, { color: theme.text }]}>Document Details</Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Document Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg || theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Passport, Visa"
            placeholderTextColor={theme.textLight}
            value={documentTitle}
            onChangeText={setDocumentTitle}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Expiry Date (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg || theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textLight}
            value={expiryDate}
            onChangeText={setExpiryDate}
          />

          {/* Action Buttons: Retake vs Save */}
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.retakeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handleRetake}
              disabled={isUploading}
            >
              <Ionicons name="refresh" size={18} color={theme.text} />
              <Text style={[styles.retakeBtnText, { color: theme.text }]}>Retake Photo</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, { backgroundColor: theme.primary }, isUploading && styles.saveBtnDisabled]}
              onPress={handleSaveAndUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={18} color={colors.white} />
                  <Text style={styles.saveBtnText}>Save to Vault</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  typesList: {
    gap: 8,
    paddingBottom: 12,
  },
  typeTab: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeTabTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorBannerText: {
    color: colors.white,
    fontSize: 12,
    flex: 1,
  },
  scannerFrame: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  scannerInstruction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  scannerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  captureOptionsRow: {
    width: '100%',
    gap: 10,
  },
  captureBtn: {
    height: 46,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraBtn: {
    backgroundColor: colors.primary,
  },
  galleryBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  captureBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  galleryBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  previewBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    height: 240,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  previewBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  inputHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  retakeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.2,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

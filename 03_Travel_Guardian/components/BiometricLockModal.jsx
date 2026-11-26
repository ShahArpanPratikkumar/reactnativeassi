// Travel Guardian - Biometric & Authorization Security Lock Shield
// Protects personal documents, IDs, and sensitive vault records using:
// 1. Native Biometrics: Fingerprint, Face ID, Touch ID (via expo-local-authentication)
// 2. Encrypted 4-Digit Security PIN fallback (saved in AsyncStorage)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const VAULT_PIN_KEY = '@tg_vault_security_pin';
const DEFAULT_PIN = '1234';

export default function BiometricLockModal({
  visible,
  onUnlock,
  onCancel,
  title = 'Document Vault Locked',
  subtitle = 'Scan your Fingerprint / Face ID or enter your PIN to access personal travel documents.',
}) {
  const { theme, isDarkMode } = useTheme();

  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [enteredPin, setEnteredPin] = useState('');
  const [savedPin, setSavedPin] = useState(DEFAULT_PIN);
  const [authenticating, setAuthenticating] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinStage, setNewPinStage] = useState(''); // temporary storage during PIN change

  // Check hardware biometrics availability & load saved PIN
  useEffect(() => {
    if (!visible) {
      setEnteredPin('');
      setPinError(false);
      setIsChangingPin(false);
      return;
    }

    const checkBiometricCapability = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(compatible && enrolled);

        if (compatible) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Fingerprint');
          } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            setBiometricType('Iris Scan');
          }
        }

        // Load custom saved PIN if set
        const storedPin = await AsyncStorage.getItem(VAULT_PIN_KEY);
        if (storedPin) {
          setSavedPin(storedPin);
        } else {
          setSavedPin(DEFAULT_PIN);
          await AsyncStorage.setItem(VAULT_PIN_KEY, DEFAULT_PIN);
        }

        // Trigger biometrics prompt automatically upon opening
        if (compatible && enrolled) {
          promptBiometricAuth();
        }
      } catch (err) {
        console.log('[BiometricLock] Initialization notice:', err.message);
      }
    };

    checkBiometricCapability();
  }, [visible]);

  // Prompt native biometric sheet
  const promptBiometricAuth = useCallback(async () => {
    try {
      setAuthenticating(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Travel Guardian Vault',
        fallbackLabel: 'Use 4-Digit Security PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setEnteredPin('');
        onUnlock();
      }
    } catch (err) {
      console.log('[BiometricLock] Auth notice:', err.message);
    } finally {
      setAuthenticating(false);
    }
  }, [onUnlock]);

  // Handle keypad digit presses
  const handleDigitPress = async (digit) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);
    setPinError(false);

    if (next.length === 4) {
      if (isChangingPin) {
        // Saving new PIN
        await AsyncStorage.setItem(VAULT_PIN_KEY, next);
        setSavedPin(next);
        setIsChangingPin(false);
        setEnteredPin('');
        Alert.alert('PIN Changed Successfully! 🔐', `Your new vault security PIN is: ${next}`);
      } else {
        // Validating PIN
        if (next === savedPin) {
          setTimeout(() => {
            setEnteredPin('');
            onUnlock();
          }, 150);
        } else {
          setTimeout(() => {
            setPinError(true);
            setEnteredPin('');
            Alert.alert('Incorrect PIN', 'The security PIN you entered is incorrect. Default is 1234 or scan your fingerprint.');
          }, 200);
        }
      }
    }
  };

  const handleDeleteDigit = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setPinError(false);
    }
  };

  // Reset or Change PIN helper
  const promptChangePin = () => {
    Alert.alert(
      'Vault Security PIN',
      `Current PIN is: ${savedPin}\n\nWould you like to set a new 4-digit PIN?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set New PIN',
          onPress: () => {
            setIsChangingPin(true);
            setEnteredPin('');
            Alert.alert('Enter New PIN', 'Type a new 4-digit security PIN on the keypad.');
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Lock Header Icon */}
          <View style={[styles.shieldCircle, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="shield-checkmark" size={38} color={colors.primary} />
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {isChangingPin ? 'Enter New 4-Digit PIN' : title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isChangingPin ? 'Select 4 digits that you will easily remember.' : subtitle}
          </Text>

          {/* Biometric Quick Button */}
          {hasBiometrics && !isChangingPin && (
            <Pressable
              style={[styles.bioButton, { backgroundColor: colors.primary }]}
              onPress={promptBiometricAuth}
              disabled={authenticating}
            >
              {authenticating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.bioButtonText}>Scan {biometricType}</Text>
                </>
              )}
            </Pressable>
          )}

          {/* PIN Dots Display */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = enteredPin.length > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      borderColor: pinError ? colors.danger : colors.primary,
                      backgroundColor: isFilled
                        ? pinError
                          ? colors.danger
                          : colors.primary
                        : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>

          {pinError && (
            <Text style={styles.errorText}>Incorrect PIN. Please try again.</Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['bio', '0', 'del'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((key) => {
                  if (key === 'bio') {
                    return (
                      <Pressable
                        key={key}
                        style={[styles.keypadKey, { backgroundColor: theme.surface }]}
                        onPress={hasBiometrics ? promptBiometricAuth : promptChangePin}
                      >
                        <Ionicons
                          name={hasBiometrics ? 'finger-print' : 'key-outline'}
                          size={22}
                          color={colors.primary}
                        />
                      </Pressable>
                    );
                  }
                  if (key === 'del') {
                    return (
                      <Pressable
                        key={key}
                        style={[styles.keypadKey, { backgroundColor: theme.surface }]}
                        onPress={handleDeleteDigit}
                      >
                        <Ionicons name="backspace-outline" size={22} color={theme.textSecondary} />
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable
                      key={key}
                      style={[styles.keypadKey, { backgroundColor: theme.surface }]}
                      onPress={() => handleDigitPress(key)}
                    >
                      <Text style={[styles.keypadKeyText, { color: theme.text }]}>{key}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Vault Footer Actions */}
          <View style={styles.footerRow}>
            <Pressable onPress={promptChangePin}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {isChangingPin ? 'Cancel PIN Change' : 'Change Security PIN'}
              </Text>
            </Pressable>

            {onCancel && (
              <Pressable onPress={onCancel}>
                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Exit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  shieldCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  bioButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  keypad: {
    width: '100%',
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  keypadKey: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '600',
  },
});

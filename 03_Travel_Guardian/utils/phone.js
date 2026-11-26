// Travel Guardian - Phone Number Utility & Native Dialer Handler
// Provides reliable phone number normalization and direct native dialer opening
// Works around Android 11+ package visibility issues with Linking.canOpenURL

import { Linking, Alert } from 'react-native';

/**
 * Normalizes phone numbers from various inputs (strings, objects, arrays)
 * Preserves leading '+' for international numbers and removes spaces, dashes, brackets
 * Handles Indian numbers (e.g. 7878533800, +917878533800, 07878533800)
 */
export const normalizePhoneNumber = (rawNumber) => {
  if (!rawNumber) return '';

  let numberStr = rawNumber;

  // Handle object or array from contact picker
  if (typeof rawNumber === 'object') {
    if (Array.isArray(rawNumber)) {
      numberStr = rawNumber[0]?.number || rawNumber[0]?.phone || rawNumber[0] || '';
    } else {
      numberStr = rawNumber.number || rawNumber.phone || '';
    }
  }

  const str = String(numberStr).trim();
  if (!str) return '';

  const hasPlus = str.startsWith('+');
  const digitsOnly = str.replace(/[^0-9]/g, '');

  if (!digitsOnly) return '';

  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

/**
 * Opens native device phone dialer with prefilled number.
 * Does NOT silently place a call - user confirms and presses Call in native dialer.
 * Does NOT rely strictly on canOpenURL which fails on Android 11+ due to package visibility.
 */
export const callPhoneNumber = async (rawNumber, contactName = 'Contact') => {
  const normalized = normalizePhoneNumber(rawNumber);

  if (!normalized || normalized.length < 3) {
    Alert.alert('Invalid Phone Number', `No valid phone number found for ${contactName}.`);
    return false;
  }

  const dialUrl = `tel:${normalized}`;

  try {
    // Directly open the dialer URL. On Android and iOS, Linking.openURL with tel:
    // launches the native phone app with the number prefilled.
    await Linking.openURL(dialUrl);
    return true;
  } catch (primaryErr) {
    console.log('[Phone] Direct openURL failed, trying fallback:', primaryErr.message);

    try {
      const canOpen = await Linking.canOpenURL(dialUrl);
      if (canOpen) {
        await Linking.openURL(dialUrl);
        return true;
      }
    } catch {}

    Alert.alert(
      'Dialer Unavailable',
      'Phone dialer is not available on this device.'
    );
    return false;
  }
};

export default {
  normalizePhoneNumber,
  callPhoneNumber,
};

// Travel Guardian - Toast Notification Component
// Provides feedback banner for success, error, and warning events

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export const Toast = ({ message, type = 'success', onDismiss, visible = true }) => {
  if (!visible || !message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  const bgColor = isSuccess
    ? colors.secondary
    : isError
    ? colors.danger
    : isWarning
    ? colors.warning
    : colors.primary;

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isError
    ? 'alert-circle'
    : isWarning
    ? 'warning'
    : 'information-circle';

  return (
    <View style={[styles.toastContainer, { backgroundColor: bgColor }]}>
      <Ionicons name={iconName} size={20} color={colors.white} style={styles.icon} />
      <Text style={styles.toastText} numberOfLines={2}>
        {message}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} style={styles.dismissBtn}>
          <Ionicons name="close" size={18} color={colors.white} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 8,
  },
  toastText: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    padding: 4,
    marginLeft: 6,
  },
});

export default Toast;

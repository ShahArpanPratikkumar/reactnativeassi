import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

export function PrimaryButton({ title, onPress, variant, disabled, loading, style, icon }) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';

  const buttonStyle = [
    styles.button,
    isSecondary && styles.secondaryButton,
    isDanger && styles.dangerButton,
    isOutline && styles.outlineButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyle = [
    styles.text,
    isSecondary && styles.secondaryText,
    isDanger && styles.dangerText,
    isOutline && styles.outlineText,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={isOutline || isSecondary ? Colors.light.primary : Colors.light.white} size="small" />
      ) : (
        <>
          {icon ? <Text style={textStyle}>{icon} </Text> : null}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: Colors.light.secondary,
    shadowColor: Colors.light.secondary,
  },
  dangerButton: {
    backgroundColor: Colors.light.error,
    shadowColor: Colors.light.error,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    color: Colors.light.white,
  },
  dangerText: {
    color: Colors.light.white,
  },
  outlineText: {
    color: Colors.light.primary,
  },
  disabledText: {
    opacity: 0.7,
  },
});

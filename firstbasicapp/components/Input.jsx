import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  secureTextEntry,
  keyboardType,
  icon,
}) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon ? <Text style={styles.inputIcon}>{icon}</Text> : null}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            multiline && styles.multiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textSecondary + '99'}
          multiline={multiline}
          numberOfLines={numberOfLines || 1}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Select({ label, value, options, onValueChange, placeholder, error, style }) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <Text
            key={option}
            style={[styles.optionChip, value === option && styles.optionChipActive]}
            onPress={() => onValueChange(option)}
          >
            {option}
          </Text>
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  inputWrapperError: {
    borderColor: Colors.light.error + '60',
    backgroundColor: Colors.light.error + '08',
  },
  inputIcon: {
    fontSize: 18,
    paddingLeft: Spacing.lg,
    color: Colors.light.textSecondary,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    ...Typography.body,
    color: Colors.light.text,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
    overflow: 'hidden',
  },
  optionChipActive: {
    backgroundColor: Colors.light.primary,
    color: Colors.light.white,
  },
  errorText: {
    ...Typography.small,
    color: Colors.light.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

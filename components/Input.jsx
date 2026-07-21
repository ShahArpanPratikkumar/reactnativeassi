import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

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
}) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        multiline={multiline}
        numberOfLines={numberOfLines || 1}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Select({ label, value, options, onValueChange, placeholder, error, style }) {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.selectContainer}>
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {value || placeholder || 'Select an option'}
        </Text>
      </View>
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.light.text,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  selectContainer: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  selectText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  placeholder: {
    color: Colors.light.textSecondary,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    overflow: 'hidden',
  },
  optionChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    color: Colors.light.white,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
});

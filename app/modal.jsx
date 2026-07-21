import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.modalCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.modalIcon}>ℹ️</Text>
        </View>
        <Text style={styles.modalTitle}>About Smart Survey</Text>
        <Text style={styles.modalText}>
          Smart Survey is a field inspection and survey management app built with React Native and
          Expo.
        </Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to Dashboard</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.light.background,
  },
  modalCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxxl,
    alignItems: 'center',
    ...Shadows.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.borderLight || '#F1F5F9',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  modalText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  versionBadge: {
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xl,
  },
  versionText: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
  },
  link: {
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.primary,
  },
  linkText: {
    color: Colors.light.white,
    ...Typography.button,
  },
});

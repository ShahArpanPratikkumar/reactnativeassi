import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.modalCard}>
        <Text style={styles.modalIcon}>{'\u2139\uFE0F'}</Text>
        <Text style={styles.modalTitle}>About Smart Survey</Text>
        <Text style={styles.modalText}>
          Smart Survey is a field inspection and survey management app built with React Native and
          Expo.
        </Text>
        <Text style={styles.modalVersion}>Version 1.0.0</Text>
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  modalText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalVersion: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
    fontWeight: '500',
  },
  link: {
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
  },
  linkText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

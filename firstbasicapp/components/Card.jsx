import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

export function Card({ children, style, title, subtitle }) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.headerContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight || '#F1F5F9',
  },
  headerContainer: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.light.text,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});

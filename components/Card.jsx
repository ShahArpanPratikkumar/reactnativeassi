import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerContainer: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});

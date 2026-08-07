import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import { formatDate } from '@/utils/helper';

export function SurveyCard({ survey, onPress, onDelete }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#FEF2F2', color: Colors.light.error, dot: Colors.light.error };
      case 'Medium':
        return { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' };
      case 'Low':
        return { bg: '#F0FDF4', color: Colors.light.success, dot: Colors.light.success };
      default:
        return { bg: Colors.light.surfaceLight || '#F1F5F9', color: Colors.light.textSecondary, dot: Colors.light.textSecondary };
    }
  };

  const ps = getPriorityStyle(survey.priority);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.siteName} numberOfLines={1}>{survey.siteName}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: ps.bg }]}>
              <View style={[styles.priorityDot, { backgroundColor: ps.dot }]} />
              <Text style={[styles.priorityText, { color: ps.color }]}>{survey.priority}</Text>
            </View>
          </View>
          <Text style={styles.clientName}>{survey.clientName}</Text>
        </View>
      </View>
      {survey.description ? (
        <Text style={styles.description} numberOfLines={2}>{survey.description}</Text>
      ) : null}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.date}>{formatDate(survey.date)}</Text>
        </View>
        {onDelete ? (
          <TouchableOpacity onPress={() => onDelete(survey.id)} style={styles.deleteButton} activeOpacity={0.6}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight || '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  siteName: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  clientName: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    ...Typography.smallMedium,
  },
  description: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight || '#F1F5F9',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateIcon: {
    fontSize: 12,
  },
  date: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  deleteText: {
    ...Typography.smallMedium,
    color: Colors.light.error,
  },
});

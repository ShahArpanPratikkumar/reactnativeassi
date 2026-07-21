import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { formatDate } from '@/utils/helper';

export function SurveyCard({ survey, onPress, onDelete }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { backgroundColor: '#FEE2E2', color: Colors.light.error };
      case 'Medium':
        return { backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'Low':
        return { backgroundColor: '#D1FAE5', color: Colors.light.success };
      default:
        return { backgroundColor: Colors.light.background, color: Colors.light.textSecondary };
    }
  };

  const priorityStyle = getPriorityStyle(survey.priority);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.siteName}>{survey.siteName}</Text>
          <Text style={styles.clientName}>{survey.clientName}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.backgroundColor }]}>
          <Text style={[styles.priorityText, { color: priorityStyle.color }]}>{survey.priority}</Text>
        </View>
      </View>
      {survey.description ? (
        <Text style={styles.description} numberOfLines={2}>{survey.description}</Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(survey.date)}</Text>
        {onDelete ? (
          <TouchableOpacity onPress={() => onDelete(survey.id)} style={styles.deleteButton}>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  clientName: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  deleteText: {
    fontSize: 13,
    color: Colors.light.error,
    fontWeight: '600',
  },
});

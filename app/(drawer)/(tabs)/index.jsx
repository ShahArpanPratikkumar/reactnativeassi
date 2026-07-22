import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSurveys } from '@/context/SurveyContext';
import { Card } from '@/components/Card';
import { SurveyCard } from '@/components/SurveyCard';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { getGreeting } from '@/utils/helper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STUDENT = {
  name: 'Arpan Shah',
  id: 'STU-2026-0042',
  department: 'Computer Engineering',
  semester: '3rd Semester',
};

export default function DashboardScreen() {
  const { getTodayCount, getRecentSurveys, surveys } = useSurveys();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const todayCount = getTodayCount();
  const recentSurveys = getRecentSurveys(3);

  const quickActions = [
    { label: 'New Survey', icon: '📝', route: 'new-survey', color: '#2E7D32', bgColor: '#F0FAF0', isTab: true },
    { label: 'Camera', icon: '📷', route: 'camera', color: '#7C3AED', bgColor: '#F5F3FF', isTab: false },
    { label: 'Location', icon: '📍', route: 'location', color: '#F59E0B', bgColor: '#FFFBEB', isTab: false },
    { label: 'History', icon: '📋', route: 'history', color: '#10B981', bgColor: '#ECFDF5', isTab: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>AS</Text>
            </View>
          </View>
        </View>

        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.studentName}>{STUDENT.name}</Text>
          <Text style={styles.welcomeSubtext}>
            Here&apos;s your field survey overview for today 🌿
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#F0FAF0' }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statNumber, { color: '#2E7D32' }]}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={[styles.statNumber, { color: '#22C55E' }]}>{surveys.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{surveys.filter(s => s.priority === 'High').length}</Text>
            <Text style={styles.statLabel}>Priority</Text>
          </View>
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>🎓 Student Details</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>{STUDENT.id}</Text>
            </View>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{STUDENT.name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>{STUDENT.department}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Semester</Text>
              <Text style={styles.detailValue}>{STUDENT.semester}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { backgroundColor: action.bgColor }]}
              onPress={() => {
                if (action.isTab) {
                  navigation.navigate('(tabs)', { screen: action.route });
                } else {
                  navigation.navigate(action.route);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>🌿 Recent Surveys</Text>
          <TouchableOpacity onPress={() => navigation.navigate('(tabs)', { screen: 'history' })} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        {recentSurveys.length > 0 ? (
          recentSurveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>📋 No surveys yet. Create your first one!</Text>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.light.white,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.white,
  },
  greetingSection: {
    paddingBottom: Spacing.xs,
  },
  greeting: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  studentName: {
    ...Typography.h1,
    color: Colors.light.white,
    marginTop: Spacing.xs,
  },
  welcomeSubtext: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.65)',
    marginTop: Spacing.xs,
  },
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  statNumber: {
    ...Typography.h2,
  },
  statLabel: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  idBadge: {
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  idBadgeText: {
    ...Typography.smallMedium,
    color: Colors.light.primary,
  },
  detailGrid: {
    gap: Spacing.md,
  },
  detailItem: {
    backgroundColor: Colors.light.surfaceLight || '#F1F5F9',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  detailLabel: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...Typography.bodySemibold,
    color: Colors.light.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    width: '47.5%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  actionLabel: {
    ...Typography.bodySemibold,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAll: {
    ...Typography.bodyMedium,
    color: Colors.light.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});

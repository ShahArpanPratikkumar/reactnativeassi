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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getGreeting } from '@/utils/helper';
import { useNavigation } from '@react-navigation/native';

const STUDENT = {
  name: 'Arpan Shah',
  id: 'STU-2026-0042',
  department: 'Computer Engineering',
  semester: '3rd Semester',
};

export default function DashboardScreen() {
  const { getTodayCount, getRecentSurveys, surveys } = useSurveys();
  const navigation = useNavigation();
  const todayCount = getTodayCount();
  const recentSurveys = getRecentSurveys(3);

  const quickActions = [
    { label: 'New Survey', icon: '\uD83D\uDCDD', route: 'new-survey', color: '#2E7D32', isTab: true },
    { label: 'Camera', icon: '\uD83D\uDCF7', route: 'camera', color: '#1565C0', isTab: false },
    { label: 'Location', icon: '\uD83D\uDCCD', route: 'location', color: '#FF8F00', isTab: false },
    { label: 'History', icon: '\uD83D\uDCCB', route: 'history', color: '#7B1FA2', isTab: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={styles.menuIcon}>{'\u2630'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Smart Survey</Text>
          <Text style={styles.headerSubtitle}>Field Inspection App</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>AS</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.welcomeCard}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.studentName}>{STUDENT.name}</Text>
          <Text style={styles.welcomeSubtext}>
            Here&apos;s your field survey overview for today
          </Text>
        </Card>

        <Card title="Student Details" style={styles.sectionCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{STUDENT.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID</Text>
            <Text style={styles.detailValue}>{STUDENT.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>{STUDENT.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Semester</Text>
            <Text style={styles.detailValue}>{STUDENT.semester}</Text>
          </View>
        </Card>

        <Card style={styles.countCard}>
          <View style={styles.countContainer}>
            <View style={styles.countIconContainer}>
              <Text style={styles.countIcon}>{'\uD83D\uDCCA'}</Text>
            </View>
            <View style={styles.countInfo}>
              <Text style={styles.countNumber}>{todayCount}</Text>
              <Text style={styles.countLabel}>Surveys Today</Text>
            </View>
            <View style={styles.countTotal}>
              <Text style={styles.countTotalNumber}>{surveys.length}</Text>
              <Text style={styles.countTotalLabel}>Total</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
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
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Surveys</Text>
          <TouchableOpacity onPress={() => navigation.navigate('(tabs)', { screen: 'history' })}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentSurveys.length > 0 ? (
          recentSurveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>{'\uD83D\uDCCB'} No surveys yet. Create your first one!</Text>
          </Card>
        )}

        <View style={{ height: 20 }} />
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
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuIcon: {
    fontSize: 22,
    color: Colors.light.white,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.white,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  welcomeCard: {
    backgroundColor: Colors.light.primary,
    borderWidth: 0,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.white,
    marginTop: Spacing.xs,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  countCard: {
    marginBottom: Spacing.lg,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  countIcon: {
    fontSize: 28,
  },
  countInfo: {
    flex: 1,
  },
  countNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  countLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  countTotal: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  countTotalNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  countTotalLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});

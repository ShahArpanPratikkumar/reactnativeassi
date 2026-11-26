// Travel Guardian - Welcome / Entry Screen
// Redesigned to match the dark navy security aesthetic (#0A1128) of the dashboard
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getStoredUser } from '../services/authService';
import { getToken } from '../services/api';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [existingUser, setExistingUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const user = await getStoredUser();
          setExistingUser(user);
        }
      } catch (err) {
        console.log('Session check notice:', err.message);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* App Logo & Header */}
        <View style={styles.header}>
          <View style={[styles.brandPill, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
            <View style={styles.livePulseDot} />
            <Text style={[styles.brandPillText, { color: theme.primary }]}>TRAVEL GUARDIAN 2.0</Text>
          </View>

          <View style={[styles.iconCircle, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconGlowRing, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="shield-checkmark" size={48} color={theme.primary} />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Travel Guardian</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your Smart & Safe Travel Companion
          </Text>
        </View>

        {/* Highlighted Safety Features */}
        <View style={[styles.featuresCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.featuresHeading, { color: theme.text }]}>Security & Protection Suite</Text>

          {/* Feature 1: Instant SOS */}
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="warning" size={22} color="#EF4444" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Instant Emergency SOS</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                One-tap siren, responder dispatch and live GPS beacon sharing.
              </Text>
            </View>
          </View>

          {/* Feature 2: SafeWalk & Live GPS */}
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="navigate" size={22} color={theme.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Guardian SafeWalk & Radar</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Real-time route tracking, nearby police & hospital safe havens.
              </Text>
            </View>
          </View>

          {/* Feature 3: Encrypted Vault */}
          <View style={[styles.featureItem, { marginBottom: 0 }]}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="lock-closed" size={22} color="#10B981" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>Biometric Document Vault</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Secure offline storage for passport, tickets, and medical cards.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {checkingAuth ? (
            <ActivityIndicator color={theme.primary} style={{ marginVertical: 14 }} />
          ) : existingUser ? (
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: theme.primary },
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Continue as {existingUser.name || 'Traveler'}</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: theme.primary },
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push('/(auth)/login')}
            >
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Log In to Account</Text>
            </Pressable>
          )}

          {!existingUser && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Ionicons name="person-add-outline" size={18} color={theme.text} style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Create New Account</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.btnPressed,
            ]}
            onPress={() => (existingUser ? router.push('/(auth)/login') : router.push('/(tabs)'))}
          >
            <Ionicons
              name={existingUser ? 'swap-horizontal' : 'sparkles-outline'}
              size={18}
              color={theme.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
              {existingUser ? 'Switch Account / Re-login' : 'Explore App (Demo Mode)'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="lock-closed" size={12} color={theme.textLight} />
          <Text style={[styles.footerText, { color: theme.textLight }]}>
            End-to-End Encrypted Personal Safety Network
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  brandPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconGlowRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
  },
  featuresHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

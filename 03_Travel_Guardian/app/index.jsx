// Travel Guardian - Welcome / Entry Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import CustomButton from '../components/CustomButton';
import { getStoredUser } from '../services/authService';
import { getToken } from '../services/api';

export default function WelcomeScreen() {
  const router = useRouter();
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* App Logo & Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={54} color={colors.primary} />
          </View>
          <Text style={styles.title}>Travel Guardian</Text>
          <Text style={styles.subtitle}>Your Smart & Safe Travel Companion</Text>
        </View>

        {/* Highlighted Safety Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresHeading}>Key Features</Text>

          <View style={styles.featureItem}>
            <Ionicons name="alert-circle" size={24} color={colors.danger} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Instant SOS Alert</Text>
              <Text style={styles.featureDesc}>One-tap emergency siren and location sharing.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="map" size={24} color={colors.primary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Live GPS & Safe Zones</Text>
              <Text style={styles.featureDesc}>Find hospitals, police stations & safety checkpoints.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="document-text" size={24} color={colors.secondary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Document Vault</Text>
              <Text style={styles.featureDesc}>Keep your passport, visa & insurance handy offline.</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {checkingAuth ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 10 }} />
          ) : existingUser ? (
            <CustomButton
              title={`Continue as ${existingUser.name || 'Traveler'}`}
              onPress={() => router.replace('/(tabs)')}
              type="primary"
            />
          ) : (
            <CustomButton
              title="Login to Account"
              onPress={() => router.push('/(auth)/login')}
              type="primary"
            />
          )}

          {!existingUser && (
            <CustomButton
              title="Create New Account"
              onPress={() => router.push('/(auth)/register')}
              type="outline"
            />
          )}

          <CustomButton
            title={existingUser ? 'Switch Account / Log In' : 'Explore App (Demo Mode)'}
            onPress={() => (existingUser ? router.push('/(auth)/login') : router.push('/(tabs)'))}
            type={existingUser ? 'outline' : 'secondary'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  featureTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    gap: 8,
  },
});

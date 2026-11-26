// Travel Guardian - Simple Dark/Light Theme Context
// Beginner-friendly theme switcher with AsyncStorage persistence

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Light Theme Colors (Clean Modern Travel Dashboard)
export const lightColors = {
  isDark: false,
  primary: '#2563EB',        // Trustworthy cobalt blue
  primaryLight: '#DBEAFE',   // Light soft blue
  secondary: '#10B981',      // Emerald safety green
  secondaryLight: '#D1FAE5', // Light green badge
  danger: '#EF4444',         // Emergency red
  dangerLight: '#FEE2E2',    // Light red
  warning: '#F59E0B',        // Amber warning
  warningLight: '#FEF3C7',   // Light amber
  background: '#F1F5F9',     // Soft clean slate-white background
  card: '#FFFFFF',           // Pure white card surfaces
  surface: '#E2E8F0',        // Secondary surface for chips/inputs
  inputBg: '#F8FAFC',        // Text input background
  text: '#0F172A',           // Deep navy headings & body text
  textSecondary: '#475569',  // Muted subtitles
  textLight: '#94A3B8',      // Soft placeholders & icons
  border: '#CBD5E1',         // Soft crisp border
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
  white: '#FFFFFF',
  black: '#000000',
};

// 2. Dark Theme Colors ("Modern Travel Safety Dashboard")
export const darkColors = {
  isDark: true,
  primary: '#3B82F6',        // Vibrant safety blue
  primaryLight: 'rgba(59, 130, 246, 0.2)', // Tinted blue badge
  secondary: '#10B981',      // Safety green
  secondaryLight: 'rgba(16, 185, 129, 0.2)', // Tinted green badge
  danger: '#EF4444',         // Emergency red
  dangerLight: 'rgba(239, 68, 68, 0.2)', // Tinted red
  warning: '#F59E0B',        // Amber caution
  warningLight: 'rgba(245, 158, 11, 0.2)', // Tinted amber
  background: '#0A1128',     // Deep midnight navy background
  card: '#141E36',           // Elevated modern navy card
  surface: '#1E2C4F',        // Secondary surface for chips/cards
  inputBg: '#0F182F',        // Deep inset input background
  text: '#FFFFFF',           // Crisp pure white headings
  textSecondary: '#94A3B8',  // Muted subtitle slate
  textLight: '#64748B',      // Soft placeholders & icons
  border: '#223254',         // Subtle crisp border defining cards
  tabActive: '#3B82F6',
  tabInactive: '#64748B',
  white: '#FFFFFF',
  black: '#000000',
};

const ThemeContext = createContext({
  theme: darkColors,
  isDarkMode: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load saved theme preference on start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('user_theme_mode');
        if (saved === 'light') {
          setIsDarkMode(false);
        } else if (saved === 'dark') {
          setIsDarkMode(true);
        }
      } catch (err) {
        console.log('Error loading theme:', err.message);
      }
    };
    loadTheme();
  }, []);

  // Toggle theme mode and save to storage
  const toggleTheme = async (value) => {
    const nextMode = value !== undefined ? value : !isDarkMode;
    setIsDarkMode(nextMode);
    try {
      await AsyncStorage.setItem('user_theme_mode', nextMode ? 'dark' : 'light');
    } catch (err) {
      console.log('Error saving theme:', err.message);
    }
  };

  const currentTheme = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming theme
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;

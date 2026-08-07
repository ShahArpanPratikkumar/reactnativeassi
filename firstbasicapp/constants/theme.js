import { Platform } from 'react-native';

const tintColorLight = '#2E7D32';
const tintColorDark = '#66BB6A';

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    background: '#F5FFF5',
    card: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#D8F3DC',
    primary: '#2E7D32',
    primaryLight: '#66BB6A',
    primaryDark: '#1B5E20',
    secondary: '#1B5E20',
    accent: '#4CAF50',
    success: '#2E7D32',
    warning: '#F59E0B',
    error: '#EF4444',
    white: '#FFFFFF',
    black: '#111827',
    overlay: 'rgba(0,0,0,0.5)',
    headerGradientStart: '#2E7D32',
    headerGradientEnd: '#1B5E20',
    surfaceLight: '#F0FAF0',
    surfaceHover: '#F5FFF5',
    borderLight: '#D8F3DC',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0A1A0A',
    card: '#1E2E1E',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    border: '#2A4A2A',
    primary: '#4CAF50',
    primaryLight: '#66BB6A',
    primaryDark: '#2E7D32',
    secondary: '#66BB6A',
    accent: '#81C784',
    success: '#66BB6A',
    warning: '#FBBF24',
    error: '#F87171',
    white: '#1E2E1E',
    black: '#F9FAFB',
    overlay: 'rgba(0,0,0,0.7)',
    headerGradientStart: '#1E2E1E',
    headerGradientEnd: '#0A1A0A',
    surfaceLight: '#1E2E1E',
    surfaceHover: '#2A4A2A',
    borderLight: '#2A4A2A',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
  },
  bodySemibold: {
    fontSize: 15,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
  },
  captionMedium: {
    fontSize: 13,
    fontWeight: '500',
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
  },
  smallMedium: {
    fontSize: 12,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

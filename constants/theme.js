import { Platform } from 'react-native';

const tintColorLight = '#2E7D32';
const tintColorDark = '#81C784';

export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    background: '#F5F7FA',
    card: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    secondary: '#1565C0',
    accent: '#FF8F00',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    white: '#FFFFFF',
    black: '#1A1A2E',
    overlay: 'rgba(0,0,0,0.5)',
    headerGradientStart: '#2E7D32',
    headerGradientEnd: '#1B5E20',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9CA3AF',
    background: '#121212',
    card: '#1E1E2E',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#2D2D3F',
    primary: '#81C784',
    primaryLight: '#A5D6A7',
    primaryDark: '#4CAF50',
    secondary: '#64B5F6',
    accent: '#FFB74D',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    white: '#1E1E2E',
    black: '#ECEDEE',
    overlay: 'rgba(0,0,0,0.7)',
    headerGradientStart: '#1B5E20',
    headerGradientEnd: '#0D3B0F',
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
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
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

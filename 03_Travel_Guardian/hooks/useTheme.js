// Travel Guardian - useTheme Hook
// Direct hook to access current theme mode, colors, and switcher

import { useContext } from 'react';
import { useTheme as useThemeFromContext } from '../context/ThemeContext';

export const useTheme = () => {
  return useThemeFromContext();
};

export default useTheme;

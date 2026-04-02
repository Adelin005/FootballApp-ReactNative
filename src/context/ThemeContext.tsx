import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    backgroundCenter: string;
    card: string;
    cardLight: string;
    text: string;
    textDim: string;
    border: string;
    primary: string;
    error: string;
    success: string;
    accent: string;
    white: string;
  };
};

const THEME_STORAGE_KEY = '@app_theme_mode';

const darkColors = {
  background: '#0B132B',
  backgroundCenter: '#0B132B',
  card: '#111827',
  cardLight: '#1A2436',
  text: '#FFFFFF',
  textDim: '#94A3B8',
  border: '#1E293B',
  primary: '#3B82F6',
  error: '#EF4444',
  success: '#22C55E',
  accent: '#F59E0B',
  white: '#FFFFFF',
};

const lightColors = {
  background: '#F8FAFC',
  backgroundCenter: '#F8FAFC',
  card: '#FFFFFF',
  cardLight: '#E2E8F0', // or #F1F5F9
  text: '#0F172A',
  textDim: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  error: '#DC2626',
  success: '#16A34A',
  accent: '#D97706',
  white: '#FFFFFF',
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
  colors: darkColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (e) {
      console.log('Error loading theme:', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

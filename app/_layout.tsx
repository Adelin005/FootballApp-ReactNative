import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LanguageProvider } from '../src/context/LanguageContext';

function RootLayoutNav() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Hide the Android system navigation bar (immersive mode)
      NavigationBar.setVisibilityAsync('hidden');
      // When user swipes up from bottom, the bar appears temporarily then hides again
      NavigationBar.setBehaviorAsync('overlay-swipe');
      // Make navigation bar transparent for edge-to-edge
      NavigationBar.setBackgroundColorAsync('transparent');
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RootLayoutNav />
      </LanguageProvider>
    </ThemeProvider>
  );
}

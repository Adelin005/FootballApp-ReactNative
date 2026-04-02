import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Linking,
  AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
// Import Firebase auth if needed here, but keeping it generic as per the ui
import { auth } from '../../src/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../src/context/ThemeContext';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [deviceLanguage, setDeviceLanguage] = useState<string>('English (US)');
  const [greetingName, setGreetingName] = useState<string>('User');

  useFocusEffect(
    useCallback(() => {
      // Refresh user's display name when settings screen is shown (e.g. returning from profile page)
      if (auth.currentUser) {
        setGreetingName(auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User');
      }
    }, [])
  );

  useEffect(() => {
    // Initial fetch of language
    detectLanguage();

    // Listen to AppState changes to detect if user returned from Settings and changed language
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        detectLanguage();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const detectLanguage = () => {
    try {
      // Basic way to get device locale in RN without extra packages like expo-localization
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      
      // Map common locales to readable names
      const languageMap: Record<string, string> = {
        'en': 'English',
        'en-US': 'English (US)',
        'en-GB': 'English (UK)',
        'ro': 'Romanian',
        'ro-RO': 'Romanian',
        'it': 'Italian',
        'it-IT': 'Italian',
        'es': 'Spanish',
        'es-ES': 'Spanish',
        'fr': 'French',
        'fr-FR': 'French',
        'de': 'German',
        'de-DE': 'German',
      };
      
      if (locale && languageMap[locale]) {
        setDeviceLanguage(languageMap[locale]);
      } else if (locale) {
        setDeviceLanguage(locale);
      }
    } catch (e) {
      console.log('Language detection error:', e);
    }
  };

  const handleLanguagePress = () => {
    // Prompt exactly as user requested: tell them they need to change it in OS settings
    Alert.alert(
      'Change Language',
      'Language is automatically synced with your device settings. Would you like to open device settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
              Linking.openSettings();
            } else {
              alert('Please open your computer settings to change the language.');
            }
          } 
        }
      ]
    );
  };

  const handleLogOut = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      // Index handles routing based on auth state, but we can explicitly route to / if needed
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  // Styles using theme colors
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700' as '700',
    },
    userCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    greetingText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700' as '700',
    },
    sectionTitle: {
      color: colors.textDim,
    },
    sectionContainer: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    rowText: {
      color: colors.text,
    },
    valueText: {
      color: colors.primary,
    },
    borderBottom: {
      borderBottomColor: colors.border,
    },
    logoutButton: {
      backgroundColor: isDarkMode ? '#1e0f13' : '#FEF2F2',
      borderColor: isDarkMode ? '#450a0a' : '#FECACA',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* We can hide back button in a tab, or keep it if desired. The design showed one, but tabs generally don't navigate back. */}
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Settings</Text>
      </View>

      {/* User Card */}
      <View style={[styles.userCard, dynamicStyles.userCard]}>
        <Text style={[styles.greetingText, dynamicStyles.greetingText]}>Hello {greetingName}</Text>
      </View>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>ACCOUNT</Text>
      <View style={[styles.sectionContainer, dynamicStyles.sectionContainer]}>
        <TouchableOpacity 
          style={styles.row}
          onPress={() => router.push('/profile-info')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="person" size={20} color={colors.primary} style={styles.icon} />
            <Text style={[styles.rowText, dynamicStyles.rowText]}>Profile Information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>PREFERENCES</Text>
      <View style={[styles.sectionContainer, dynamicStyles.sectionContainer]}>
        <View style={[styles.row, styles.borderBottom, dynamicStyles.borderBottom]}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon" size={20} color={colors.primary} style={styles.icon} />
            <Text style={[styles.rowText, dynamicStyles.rowText]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.textDim, true: colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={styles.row} onPress={handleLanguagePress}>
          <View style={styles.rowLeft}>
            <Ionicons name="language" size={20} color={colors.primary} style={styles.icon} />
            <Text style={[styles.rowText, dynamicStyles.rowText]}>Language</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.valueText, dynamicStyles.valueText]}>{deviceLanguage}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textDim} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Log Out Button */}
      <TouchableOpacity style={[styles.logoutButton, dynamicStyles.logoutButton]} onPress={handleLogOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={[styles.versionText, { color: colors.textDim }]}>Version 4.12.0 (Build 829)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  userCard: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 10,
  },
  sectionContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    marginRight: 12,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  logoutButton: {
    marginTop: 40,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
  },
});

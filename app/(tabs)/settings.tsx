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
import { auth } from '../../src/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { t, locale } = useLanguage();
  const [deviceLanguage, setDeviceLanguage] = useState<string>('English (US)');
  const [greetingName, setGreetingName] = useState<string>('User');

  useFocusEffect(
    useCallback(() => {
      if (auth.currentUser) {
        setGreetingName(auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User');
      }
    }, [])
  );

  useEffect(() => {
    detectLanguage();

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
      const loc = Intl.DateTimeFormat().resolvedOptions().locale;
      
      const languageMap: Record<string, string> = {
        'en': 'English',
        'en-US': 'English (US)',
        'en-GB': 'English (UK)',
        'ro': 'Română',
        'ro-RO': 'Română',
        'it': 'Italiano',
        'it-IT': 'Italiano',
        'es': 'Español',
        'es-ES': 'Español',
        'fr': 'Français',
        'fr-FR': 'Français',
        'de': 'Deutsch',
        'de-DE': 'Deutsch',
      };
      
      if (loc && languageMap[loc]) {
        setDeviceLanguage(languageMap[loc]);
      } else if (loc) {
        setDeviceLanguage(loc);
      }
    } catch (e) {
      console.log('Language detection error:', e);
    }
  };

  const handleLanguagePress = () => {
    if (Platform.OS === 'android') {
      try {
        Linking.sendIntent('android.settings.LOCALE_SETTINGS');
      } catch (e) {
        Linking.openSettings();
      }
    } else {
      Linking.openSettings();
    }
  };

  const handleLogOut = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(t('error'), t('settings_logout_error'));
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
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>{t('settings_title')}</Text>
      </View>

      {/* User Card */}
      <View style={[styles.userCard, dynamicStyles.userCard]}>
        <Text style={[styles.greetingText, dynamicStyles.greetingText]}>{t('settings_hello')} {greetingName}</Text>
      </View>

      {/* Account Section */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('settings_account')}</Text>
      <View style={[styles.sectionContainer, dynamicStyles.sectionContainer]}>
        <TouchableOpacity 
          style={styles.row}
          onPress={() => router.push('/profile-info')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="person" size={20} color={colors.primary} style={styles.icon} />
            <Text style={[styles.rowText, dynamicStyles.rowText]}>{t('settings_profile')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{t('settings_preferences')}</Text>
      <View style={[styles.sectionContainer, dynamicStyles.sectionContainer]}>
        <View style={[styles.row, styles.borderBottom, dynamicStyles.borderBottom]}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon" size={20} color={colors.primary} style={styles.icon} />
            <Text style={[styles.rowText, dynamicStyles.rowText]}>{t('settings_dark_mode')}</Text>
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
            <Text style={[styles.rowText, dynamicStyles.rowText]}>{t('settings_language')}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.valueText, dynamicStyles.valueText]}>{deviceLanguage}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textDim} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Log Out Button */}
      <TouchableOpacity style={[styles.logoutButton, dynamicStyles.logoutButton]} onPress={handleLogOut}>
        <Text style={styles.logoutText}>{t('settings_logout')}</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={[styles.versionText, { color: colors.textDim }]}>{t('settings_version')}</Text>
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

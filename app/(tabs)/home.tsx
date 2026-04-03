import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../../src/firebaseConfig';
import { useLanguage } from '../../src/context/LanguageContext';

const { height } = Dimensions.get('window');

export default function HomeTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const navigateToProfile = () => {
    router.push('/profile-info');
  };

  return (
    <View style={styles.container}>
      {/* Background Image & Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={require('../../assets/images/stadium_background.jpg')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(11, 19, 43, 0.2)', 'rgba(11, 19, 43, 0.6)', '#0B132B']}
            locations={[0, 0.55, 1]}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          />
        </ImageBackground>
      </View>

      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={[styles.iconButton, { width: 36 }]} />

        <Text style={styles.headerTitle}>{t('home_title')}</Text>

        <TouchableOpacity style={styles.iconButton} onPress={navigateToProfile}>
          <Ionicons name="person-circle-outline" size={28} color="#E2E8F0" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.mainTitle}>
          {t('home_main_title')}
        </Text>

        <Text style={styles.subtitle}>
          {t('home_subtitle')}
        </Text>

        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/leagues')}>
          <Text style={styles.exploreButtonText}>{t('home_explore')}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Text */}
      <View style={[styles.footer, { paddingBottom: 100 }]}>
        <Text style={styles.footerText}>
          {t('home_footer')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 20,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  footerText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateProfile, updatePassword, signOut } from 'firebase/auth';
import { auth } from '../src/firebaseConfig';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

export default function ProfileInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Custom Dialog State
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    isError: false,
    onConfirm: () => {},
  });

  const showDialog = (title: string, message: string, isError: boolean, onConfirm: () => void = () => {}) => {
    setDialogConfig({ title, message, isError, onConfirm });
    setDialogVisible(true);
  };

  useEffect(() => {
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
    }
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    
    if (!displayName.trim()) {
      showDialog(t('error'), t('profile_name_empty'), true);
      return;
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      
      showDialog(t('success'), t('profile_updated'), false, () => {
        handleBack();
      });
    } catch (error: any) {
      console.error(error);
      showDialog(t('error'), error.message || t('profile_update_fail'), true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser) return;

    if (!newPassword || newPassword.length < 6) {
      showDialog(t('error'), t('profile_pass_short'), true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showDialog(t('error'), t('profile_pass_mismatch'), true);
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      
      showDialog(t('success'), t('profile_pass_success'), false, async () => {
        try {
          await signOut(auth);
          router.replace('/');
        } catch (e) {
          router.replace('/');
        }
      });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        showDialog(
          t('profile_relogin_title'), 
          t('profile_relogin_msg'),
          true
        );
      } else {
        showDialog(t('error'), error.message || t('profile_pass_fail'), true);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.cardLight }]} 
              onPress={handleBack}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                {t('profile_title')}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Display Name Section */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile_personal')}</Text>
              
              <Text style={[styles.label, { color: colors.textDim }]}>{t('profile_email')}</Text>
              <TextInput
                style={[styles.input, styles.disabledInput, { backgroundColor: colors.cardLight, color: colors.textDim, borderColor: colors.border }]}
                value={auth.currentUser?.email || ''}
                editable={false}
              />

              <Text style={[styles.label, { color: colors.textDim }]}>{t('profile_name')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder={t('profile_name_placeholder')}
                placeholderTextColor={colors.textDim}
                value={displayName}
                onChangeText={setDisplayName}
              />

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]} 
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.white }]}>{t('profile_save')}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Password Section */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile_security')}</Text>
              
              <Text style={[styles.label, { color: colors.textDim }]}>{t('profile_new_pass')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder={t('profile_new_pass_placeholder')}
                placeholderTextColor={colors.textDim}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={[styles.label, { color: colors.textDim }]}>{t('profile_confirm_pass')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder={t('profile_confirm_pass_placeholder')}
                placeholderTextColor={colors.textDim}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.error }]} 
                onPress={handleUpdatePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: colors.white }]}>{t('profile_change_pass')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Popup Dialog */}
      <Modal
        visible={dialogVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setDialogVisible(false);
          dialogConfig.onConfirm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons 
                name={dialogConfig.isError ? "warning" : "checkmark-circle"} 
                size={48} 
                color={dialogConfig.isError ? colors.error : colors.success} 
              />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{dialogConfig.title}</Text>
            <Text style={[styles.modalMessage, { color: colors.textDim }]}>{dialogConfig.message}</Text>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: dialogConfig.isError ? colors.cardLight : colors.primary }]}
              onPress={() => {
                setDialogVisible(false);
                dialogConfig.onConfirm();
              }}
            >
              <Text style={[styles.modalButtonText, { color: dialogConfig.isError ? colors.text : colors.white }]}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
  },
  disabledInput: {
    opacity: 0.7,
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

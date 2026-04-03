import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getLocales } from 'expo-localization';
import { translations, TranslationKeys, en } from '../i18n/translations';

type LanguageContextType = {
  locale: string;
  t: (key: TranslationKeys) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: (key) => en[key] || key,
});

function getDeviceLanguage(): string {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const langCode = locales[0].languageCode || 'en';
      // Return full locale if we have it, otherwise just language code
      return langCode;
    }
  } catch (e) {
    console.log('Language detection error:', e);
  }
  return 'en';
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<string>(getDeviceLanguage());

  useEffect(() => {
    // Re-detect language when app comes back to foreground (user may have changed it in settings)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const newLocale = getDeviceLanguage();
        setLocale(newLocale);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const t = (key: TranslationKeys): string => {
    const dict = translations[locale] || translations['en'] || en;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

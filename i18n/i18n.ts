import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { useEffect, useState } from 'react';

// Import translations
import en from './locales/en.json';
import es from './locales/es.json';
import ru from './locales/ru.json';

// Create i18n instance
const i18n = new I18n({
  en,
  ru,
  es
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.locale.split('-')[0]; // Use device locale
i18n.enableFallback = true; // Use English if a translation is missing
i18n.defaultLocale = 'en'; // English is the default fallback

/**
 * Custom hook to use i18n in components
 * @returns {Object} i18n instance and current locale
 */
export const useTranslation = () => {
  const [locale, setLocale] = useState(i18n.locale);

  // Function to change the locale
  const changeLocale = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  // Get current device locale on mount
  useEffect(() => {
    const deviceLocale = Localization.locale.split('-')[0];
    // Only use supported locales (en, ru, es)
    if (deviceLocale === 'en' || deviceLocale === 'ru' || deviceLocale === 'es') {
      i18n.locale = deviceLocale;
      setLocale(deviceLocale);
    } else {
      i18n.locale = 'en'; // Default to English
      setLocale('en');
    }
  }, []);

  return {
    t: (scope: string, options?: object) => i18n.t(scope, options),
    locale,
    changeLocale,
    i18n
  };
};

export default i18n;

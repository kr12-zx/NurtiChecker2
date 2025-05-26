import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useTranslation } from '../i18n/i18n';

interface LanguageSwitcherProps {
  style?: object;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const { t, locale, changeLocale } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ru' : 'en';
    changeLocale(newLocale);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          locale === 'en' ? styles.activeButton : styles.inactiveButton,
          isDark && locale === 'en' ? styles.darkActiveButton : {},
          isDark && locale !== 'en' ? styles.darkInactiveButton : {}
        ]}
        onPress={() => changeLocale('en')}
      >
        <Text
          style={[
            styles.buttonText,
            locale === 'en' ? styles.activeText : styles.inactiveText,
            isDark && styles.darkText
          ]}
        >
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.languageButton,
          locale === 'ru' ? styles.activeButton : styles.inactiveButton,
          isDark && locale === 'ru' ? styles.darkActiveButton : {},
          isDark && locale !== 'ru' ? styles.darkInactiveButton : {}
        ]}
        onPress={() => changeLocale('ru')}
      >
        <Text
          style={[
            styles.buttonText,
            locale === 'ru' ? styles.activeText : styles.inactiveText,
            isDark && styles.darkText
          ]}
        >
          Русский
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  inactiveButton: {
    backgroundColor: '#F8F8F8',
  },
  darkActiveButton: {
    backgroundColor: '#0A84FF',
  },
  darkInactiveButton: {
    backgroundColor: '#1C1C1E',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#333333',
  },
  darkText: {
    color: '#FFFFFF',
  },
});

export default LanguageSwitcher;

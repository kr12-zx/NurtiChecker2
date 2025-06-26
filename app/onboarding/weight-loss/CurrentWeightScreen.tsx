import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';
import SimplePicker from '../../../components/SimplePicker';
import { useTranslation } from '../../../i18n/i18n';

interface CurrentWeightScreenProps {
  onContinue: () => void;
  onBack: () => void;
  currentWeight: number; // в кг
  onCurrentWeightChange: (weight: number) => void;
  units: 'kg' | 'lb';
  onUnitsChange: (units: 'kg' | 'lb') => void;
}

const CurrentWeightScreen: React.FC<CurrentWeightScreenProps> = ({ 
  onContinue, 
  onBack, 
  currentWeight,
  onCurrentWeightChange,
  units,
  onUnitsChange
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  // Генерация значений для выбора веса
  const generateWeightValues = () => {
    if (units === 'kg') {
      // от 40 кг до 180 кг
      return Array.from({ length: 141 }, (_, i) => {
        const value = i + 40;
        return `${value} ${t('onboarding.heightWeight.units.kg')}`;
      });
    } else {
      // от 88 фунтов до 396 фунтов (40-180 кг)
      return Array.from({ length: 309 }, (_, i) => {
        const value = i + 88;
        return `${value} ${t('onboarding.heightWeight.units.lb')}`;
      });
    }
  };

  const weightValues = generateWeightValues();

  // Конвертация между единицами измерения
  const kgToLb = (kg: number): number => {
    return Math.round(kg * 2.20462);
  };

  const lbToKg = (lb: number): number => {
    return Math.round(lb / 2.20462);
  };

  // Получаем текущее значение в правильных единицах и формате для отображения
  const getCurrentDisplayValue = (): string => {
    if (units === 'kg') {
      return `${currentWeight} ${t('onboarding.heightWeight.units.kg')}`;
    } else {
      return `${kgToLb(currentWeight)} ${t('onboarding.heightWeight.units.lb')}`;
    }
  };

  // Обработчик изменения веса
  const handleWeightChange = (value: string | number) => {
    if (typeof value === 'string') {
      // Извлекаем числовое значение из строки (например, "70 кг" -> 70)
      const numericValue = parseInt(value.split(' ')[0]);
      
      if (!isNaN(numericValue)) {
        if (units === 'kg') {
          onCurrentWeightChange(numericValue);
        } else {
          // Если значение в фунтах, конвертируем в кг для сохранения
          onCurrentWeightChange(lbToKg(numericValue));
        }
      }
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkTextPrimary]}>{t('onboarding.heightWeight.weightTitle')}</Text>

      <View style={styles.unitsContainer}>
        <TouchableOpacity
          style={[
            styles.unitButton,
            isDark ? styles.unitButtonDark : styles.unitButtonLight,
            units === 'kg' && (isDark ? styles.activeUnitButtonDark : styles.activeUnitButtonLight)
          ]}
          onPress={() => onUnitsChange('kg')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.unitButtonText,
              isDark ? styles.unitButtonTextDark : styles.unitButtonTextLight,
              units === 'kg' && styles.activeUnitButtonText
            ]}
          >
            {t('onboarding.heightWeight.units.kg')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.unitButton,
            isDark ? styles.unitButtonDark : styles.unitButtonLight,
            units === 'lb' && (isDark ? styles.activeUnitButtonDark : styles.activeUnitButtonLight)
          ]}
          onPress={() => onUnitsChange('lb')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.unitButtonText,
              isDark ? styles.unitButtonTextDark : styles.unitButtonTextLight,
              units === 'lb' && styles.activeUnitButtonText
            ]}
          >
            {t('onboarding.heightWeight.units.lb')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        {/* TODO: SimplePicker needs to be updated to support dark mode (e.g., accept an isDark prop) 
            and adjust its internal text/background colors based on the design system. */}
        <SimplePicker
          values={weightValues}
          selectedValue={getCurrentDisplayValue()}
          onChange={handleWeightChange}
          pickerWidth={120}
          pickerHeight={200}
        />
      </View>
      
      <Text style={[styles.infoText, isDark && styles.darkTextSecondary]}>
        {t('onboarding.heightWeight.weightSubtitle')}
      </Text>

      <OnboardingNavButtons
        onContinue={onContinue}
        onBack={onBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24, // Design system spacing
    backgroundColor: '#FFFFFF', // Светлая тема фон
  },
  darkContainer: {
    backgroundColor: '#121212', // Темная тема фон
  },
  title: { // H1 Onboarding
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24, // Spacing
    textAlign: 'center',
    color: '#333333', // Светлая тема основной текст
  },
  darkTextPrimary: {
    color: '#F5F5F5', // Темная тема основной текст
  },
  unitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24, // Spacing
  },
  unitButton: { // Option Button style
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 10, // Design system corner radius
    borderWidth: 1, // Optional: for better definition or remove if bg is enough
  },
  unitButtonLight: {
    backgroundColor: '#F0F0F0', // Светлая тема неактивный фон
    borderColor: '#F0F0F0', 
  },
  unitButtonDark: {
    backgroundColor: '#2C2C2E', // Темная тема неактивный фон
    borderColor: '#2C2C2E', 
  },
  activeUnitButtonLight: {
    backgroundColor: '#007AFF', // Светлая тема активный фон
    borderColor: '#007AFF',
  },
  activeUnitButtonDark: {
    backgroundColor: '#0A84FF', // Темная тема активный фон
    borderColor: '#0A84FF',
  },
  unitButtonText: { // Option Button text style
    fontSize: 15,
    fontWeight: '500',
  },
  unitButtonTextLight: {
    color: '#333333', // Светлая тема неактивный текст
  },
  unitButtonTextDark: {
    color: '#F5F5F5', // Темная тема неактивный текст
  },
  activeUnitButtonText: {
    color: '#FFFFFF', // Активный текст (для обеих тем)
  },
  pickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginBottom: 24, // Spacing
  },
  infoText: { // Body 2 style
    fontSize: 13,
    fontWeight: '400', // Regular
    textAlign: 'center',
    marginBottom: 32, // Spacing before nav buttons
    paddingHorizontal: 20, // Adjusted padding
    color: '#666666', // Светлая тема вторичный текст
  },
  darkTextSecondary: {
    color: '#A0A0A0', // Темная тема вторичный текст
  },
});

export default CurrentWeightScreen;

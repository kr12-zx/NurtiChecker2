import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
// Удалили import { useRouter }, т.к. теперь навигация идет через пропсы
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { MealFrequency } from '../../types/onboarding';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';
import { unifiedStyles } from './unifiedStyles'; // Исправлен импорт на именованный

interface MealFrequencyScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function MealFrequencyScreen({ onContinue, onBack }: MealFrequencyScreenProps) {
  // Удалили router, т.к. теперь навигация идет через пропсы
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { mealFrequency, setMealFrequency, validateOnboardingStep } = useOnboardingStore();

  // Активируем кнопку Далее только если выбрана частота приемов пищи
  const [isNextEnabled, setIsNextEnabled] = useState(!!mealFrequency);

  // Цвета из дизайн-системы
  const lightThemeColors = {
    accent: '#007AFF',
    primaryText: '#333333',
    secondaryText: '#666666',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF', // Фон карточки опции (в данном случае светлее, чем фон экрана если бы он был серым)
    cardBorder: '#E0E0E0', // Рамка карточки опции (невыбранная)
    cardBorderSelected: '#007AFF',
    iconWrapperBg: '#F0F0F0',
    iconWrapperSelectedBg: '#E6F2FF', // Светлый акцентный фон для иконки
    iconColor: '#666666', // Цвет иконки (невыбранная)
    iconSelectedColor: '#007AFF', // Цвет иконки (выбранная)
    radioBorder: '#CCCCCC',
    radioCheckmark: '#FFFFFF',
  };

  const darkThemeColors = {
    accent: '#0A84FF',
    primaryText: '#F5F5F5',
    secondaryText: '#A0A0A0',
    background: '#121212', // Основной фон экрана в темной теме
    cardBackground: '#1C1C1E', // Фон карточки опции
    cardBorder: '#3A3A3C', // Рамка карточки опции (невыбранная)
    cardBorderSelected: '#0A84FF',
    iconWrapperBg: '#2C2C2E',
    iconWrapperSelectedBg: '#003366', // Темный акцентный фон для иконки
    iconColor: '#A0A0A0', // Цвет иконки (невыбранная)
    iconSelectedColor: '#0A84FF', // Цвет иконки (выбранная)
    radioBorder: '#48484A',
    radioCheckmark: '#FFFFFF', // Галочка всегда белая на акцентном фоне
  };

  const currentThemeColors = isDark ? darkThemeColors : lightThemeColors;

  // Определяем варианты частоты приемов пищи
  const frequencyOptions: { id: MealFrequency; label: string; description: string; icon: string }[] = [
    {
      id: '3-meals',
      label: '3 приема пищи',
      description: 'Завтрак, обед и ужин',
      icon: 'restaurant-outline',
    },
    {
      id: '4-meals',
      label: '4 приема пищи',
      description: 'Завтрак, обед, полдник и ужин',
      icon: 'cafe-outline',
    },
    {
      id: '5-meals',
      label: '5 приемов пищи',
      description: 'Завтрак, перекус, обед, полдник и ужин',
      icon: 'nutrition-outline',
    },
    {
      id: '6-meals',
      label: '6 приемов пищи',
      description: 'Частые небольшие приемы пищи в течение дня',
      icon: 'timer-outline',
    },
    {
      id: 'intermittent',
      label: 'Интервальное голодание',
      description: 'Приемы пищи в определенное время дня (например, 16/8)',
      icon: 'time-outline',
    },
  ];

  // Обработчик выбора частоты приемов пищи
  const onMealFrequencyChange = (newFrequency: MealFrequency) => {
    setMealFrequency(newFrequency);
    setIsNextEnabled(true);
  };

  // Переход на следующий экран
  const handleNext = () => {
    if (validateOnboardingStep('mealFrequency')) {
      onContinue();
    }
  };

  return (
    <View style={[unifiedStyles.container, isDark && unifiedStyles.darkContainer]}>
      <Text style={[unifiedStyles.title, isDark && unifiedStyles.darkTitle]}>Сколько раз в день вы планируете есть?</Text>

      <Text style={[unifiedStyles.subtitle, isDark && unifiedStyles.darkSubtitle]}>
        Выберите комфортную для вас схему питания
      </Text>

      <View style={styles.optionsContainer}>
        {frequencyOptions.map((option) => {
          const isSelected = mealFrequency === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: currentThemeColors.cardBackground,
                  borderColor: isSelected ? currentThemeColors.cardBorderSelected : currentThemeColors.cardBorder,
                },
              ]}
              onPress={() => onMealFrequencyChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContentWrapper}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: isSelected ? currentThemeColors.iconWrapperSelectedBg : currentThemeColors.iconWrapperBg },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={isSelected ? currentThemeColors.iconSelectedColor : currentThemeColors.iconColor}
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? currentThemeColors.accent : currentThemeColors.primaryText },
                    ]}
                  >
                    {option.label}
                  </Text>

                  <Text
                    style={[
                      styles.optionDescription,
                      { color: isSelected ? currentThemeColors.accent : currentThemeColors.secondaryText },
                    ]}
                    numberOfLines={2}
                  >
                    {option.description}
                  </Text>
                </View>
              </View>

              <View style={styles.radioContainer}>
                {isSelected ? (
                  <View style={[styles.radioSelected, { backgroundColor: currentThemeColors.accent }]}>
                    <Ionicons name="checkmark" size={14} color={currentThemeColors.radioCheckmark} />
                  </View>
                ) : (
                  <View style={[styles.radioUnselected, { borderColor: currentThemeColors.radioBorder }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <OnboardingNavButtons
        onContinue={handleNext}
        onBack={onBack}
        continueText="Далее"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optionContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  radioContainer: {},
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

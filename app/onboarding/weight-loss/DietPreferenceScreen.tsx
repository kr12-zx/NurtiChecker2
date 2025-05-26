import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { DietPreference } from '../../types/onboarding';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';
import { unifiedStyles } from './unifiedStyles';

interface DietPreferenceScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function DietPreferenceScreen({ onContinue, onBack }: DietPreferenceScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { dietPreference, setDietPreference, validateOnboardingStep } = useOnboardingStore();

  const [isNextEnabled, setIsNextEnabled] = useState(!!dietPreference);

  const lightThemeColors = {
    accent: '#007AFF',
    primaryText: '#333333',
    secondaryText: '#666666',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    cardBorder: '#E0E0E0',
    cardBorderSelected: '#007AFF',
    iconWrapperBg: '#F0F0F0',
    iconWrapperSelectedBg: '#E6F2FF',
    iconColor: '#666666',
    iconSelectedColor: '#007AFF',
    radioBorder: '#CCCCCC',
    radioCheckmark: '#FFFFFF',
  };

  const darkThemeColors = {
    accent: '#0A84FF',
    primaryText: '#F5F5F5',
    secondaryText: '#A0A0A0',
    background: '#121212',
    cardBackground: '#1C1C1E',
    cardBorder: '#3A3A3C',
    cardBorderSelected: '#0A84FF',
    iconWrapperBg: '#2C2C2E',
    iconWrapperSelectedBg: '#003366',
    iconColor: '#A0A0A0',
    iconSelectedColor: '#0A84FF',
    radioBorder: '#48484A',
    radioCheckmark: '#FFFFFF',
  };

  const currentThemeColors = isDark ? darkThemeColors : lightThemeColors;

  const dietOptions: { id: DietPreference; label: string; description: string; icon: string }[] = [
    {
      id: 'standard',
      label: 'Стандартное',
      description: 'Сбалансированный рацион, включающий все группы продуктов',
      icon: 'restaurant-outline',
    },
    {
      id: 'vegetarian',
      label: 'Вегетарианское',
      description: 'Без мяса, но с молочными продуктами и яйцами',
      icon: 'leaf-outline',
    },
    {
      id: 'vegan',
      label: 'Веганское',
      description: 'Полностью растительная диета без продуктов животного происхождения',
      icon: 'nutrition-outline',
    },
    {
      id: 'low-carb',
      label: 'Низкоуглеводное',
      description: 'Минимум углеводов, акцент на белки и полезные жиры',
      icon: 'fast-food-outline',
    },
    {
      id: 'keto',
      label: 'Кето',
      description: 'Очень низкое содержание углеводов, высокое содержание жиров',
      icon: 'pizza-outline',
    },
  ];

  const onDietPreferenceChange = (newDiet: DietPreference) => {
    setDietPreference(newDiet);
    setIsNextEnabled(true);
  };

  const handleNext = () => {
    if (validateOnboardingStep('dietPreference')) {
      onContinue();
    }
  };

  return (
    <View style={[unifiedStyles.container, isDark && unifiedStyles.darkContainer]}>
      <Text style={[unifiedStyles.title, isDark && unifiedStyles.darkTitle]}>Какой тип питания вы предпочитаете?</Text>

      <Text style={[unifiedStyles.subtitle, isDark && unifiedStyles.darkSubtitle]}>
        Мы адаптируем ваш план питания в соответствии с вашими предпочтениями
      </Text>

      <View style={styles.dietOptionsContainer}>
        {dietOptions.map((option) => {
          const isSelected = dietPreference === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dietOptionButton,
                {
                  backgroundColor: currentThemeColors.cardBackground,
                  borderColor: isSelected ? currentThemeColors.cardBorderSelected : currentThemeColors.cardBorder,
                },
                isSelected && styles.dietSelectedOption,
              ]}
              onPress={() => onDietPreferenceChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.dietOptionContent}>
                <View
                  style={[
                    styles.dietIconWrapper,
                    { backgroundColor: isSelected ? currentThemeColors.iconWrapperSelectedBg : currentThemeColors.iconWrapperBg },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={isSelected ? currentThemeColors.iconSelectedColor : currentThemeColors.iconColor}
                  />
                </View>

                <View style={styles.dietTextContainer}>
                  <Text
                    style={[
                      styles.dietOptionLabel,
                      { color: isSelected ? currentThemeColors.accent : currentThemeColors.primaryText },
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>

                  <Text
                    style={[
                      styles.dietOptionDescription,
                      { color: isSelected ? currentThemeColors.accent : currentThemeColors.secondaryText },
                    ]}
                    numberOfLines={1}
                  >
                    {option.description}
                  </Text>
                </View>
              </View>

              <View style={styles.radioContainer}>
                {isSelected ? (
                  <View style={[styles.dietRadioSelected, { backgroundColor: currentThemeColors.accent }]}>
                    <Ionicons name="checkmark" size={14} color={currentThemeColors.radioCheckmark} />
                  </View>
                ) : (
                  <View style={[styles.dietRadioUnselected, { borderColor: currentThemeColors.radioBorder }]} />
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
  dietOptionsContainer: {
    width: '100%',
    marginVertical: 8,
  },
  dietOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  dietSelectedOption: {
    // This style can be used for additional effects not covered by dynamic borderColor/backgroundColor
  },
  dietOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dietIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dietTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  dietOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dietOptionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  radioContainer: {
    marginLeft: 12,
  },
  dietRadioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  dietRadioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

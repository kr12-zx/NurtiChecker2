import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';
import { UserProfile, DietPreference as DietPreferenceType } from '../../types/onboarding';
import { Ionicons } from '@expo/vector-icons';

interface DietPreferenceScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const dietPreferences: { value: DietPreferenceType; label: string; description: string }[] = [
  { value: 'standard', label: 'Стандартная', description: 'Нет особых ограничений.' },
  { value: 'vegetarian', label: 'Вегетарианская', description: 'Без мяса и рыбы.' },
  { value: 'vegan', label: 'Веганская', description: 'Без продуктов животного происхождения.' },
  { value: 'low-carb', label: 'Низкоуглеводная', description: 'Сниженное потребление углеводов.' },
  { value: 'keto', label: 'Кето', description: 'Очень низкое содержание углеводов, высокое — жиров.' },
  { value: 'paleo', label: 'Палео', description: 'Продукты, доступные в эпоху палеолита.' },
  {
    value: 'mediterranean',
    label: 'Средиземноморская',
    description: 'Овощи, фрукты, орехи, рыба, оливковое масло.',
  },
];

const DietPreferenceScreen: React.FC<DietPreferenceScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [selectedDiet, setSelectedDiet] = useState<DietPreferenceType | undefined>(
    userProfile.dietPreference
  );

  const handleSelect = (diet: DietPreferenceType) => {
    setSelectedDiet(diet);
  };

  const handleContinue = () => {
    if (selectedDiet) {
      updateUserProfile({ dietPreference: selectedDiet });
      onContinue();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Предпочтения в питании
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary, textAlign: 'center' }]}>
              Есть ли у вас особые предпочтения или ограничения в питании?
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {dietPreferences.map((option) => {
              const isSelected = selectedDiet === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    sharedOnboardingStyles.optionContainer,
                    styles.optionBtn,
                    {
                      backgroundColor: isSelected ? themeColors.optionBackgroundSelected : themeColors.optionBackground,
                      borderColor: isSelected ? themeColors.optionBorderColorSelected : themeColors.optionBorderColor,
                    },
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={{flex:1}}>
                    <Text style={[
                      sharedOnboardingStyles.optionText,
                      styles.optionLabel,
                      { color: isSelected ? themeColors.primaryAccent : themeColors.textPrimary } 
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      { color: isSelected ? themeColors.primaryAccent : themeColors.textSecondary }
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={[
                    sharedOnboardingStyles.selectionIndicator,
                    {
                      borderColor: isSelected ? themeColors.selectionIndicatorBackground : themeColors.selectionIndicatorBorder,
                      backgroundColor: isSelected ? themeColors.selectionIndicatorBackground : 'transparent',
                    }
                  ]}>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark-outline" 
                        size={18} 
                        color={themeColors.selectionIndicatorCheckmark} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[sharedOnboardingStyles.navButtonContainer, { paddingBottom: 16 }]}>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            sharedOnboardingStyles.navButtonSecondary,
            { backgroundColor: themeColors.navButtonSecondaryBackground, borderColor: themeColors.navButtonSecondaryBorder, marginRight: 8 }
          ]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={[sharedOnboardingStyles.navButtonText, { color: themeColors.navButtonSecondaryText }]}>
            Назад
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            { 
              backgroundColor: selectedDiet ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground,
              borderColor: selectedDiet ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!selectedDiet}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: selectedDiet ? themeColors.navButtonPrimaryText : themeColors.navButtonDisabledText }
            ]}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default DietPreferenceScreen;

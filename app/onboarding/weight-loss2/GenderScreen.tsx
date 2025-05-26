import React from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';
import { UserProfile, Gender } from '../../types/onboarding';

interface GenderScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const genderOptions: Array<{ id: Gender; label: string; iconName: keyof typeof Ionicons.glyphMap }> = [
  { id: 'male', label: 'Мужской', iconName: 'male-outline' },
  { id: 'female', label: 'Женский', iconName: 'female-outline' },
  { id: 'prefer-not-to-say', label: 'Предпочитаю не указывать', iconName: 'person-outline' },
];

const GenderScreen: React.FC<GenderScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const selectedGender = userProfile.gender;

  const handleSelectGender = (gender: Gender) => {
    updateUserProfile({ gender });
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Укажите ваш пол
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary }]}>
              Это нужно для более точного расчета энергетических потребностей вашего организма.
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {genderOptions.map((option) => {
              const isSelected = selectedGender === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    sharedOnboardingStyles.optionContainer,
                    {
                      backgroundColor: isSelected ? themeColors.optionBackgroundSelected : themeColors.optionBackground,
                      borderColor: isSelected ? themeColors.optionBorderColorSelected : themeColors.optionBorderColor,
                    },
                  ]}
                  onPress={() => handleSelectGender(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    sharedOnboardingStyles.optionIconContainer,
                    {
                      backgroundColor: isSelected 
                        ? themeColors.iconContainerBackgroundSelected 
                        : themeColors.iconContainerBackground,
                    }
                  ]}>
                    <Ionicons 
                      name={option.iconName} 
                      size={24} 
                      color={isSelected ? themeColors.iconColorSelected : themeColors.iconColor} 
                    />
                  </View>
                  <Text style={[
                    sharedOnboardingStyles.optionText,
                    { color: isSelected ? themeColors.primaryAccent : themeColors.textPrimary } 
                  ]}>
                    {option.label}
                  </Text>
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
                        size={16} 
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
            { backgroundColor: themeColors.navButtonPrimaryBackground, borderColor: themeColors.navButtonPrimaryBackground }
          ]}
          onPress={onContinue}
          activeOpacity={0.7}
          disabled={!selectedGender} // Кнопка Далее неактивна, если пол не выбран
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: themeColors.navButtonPrimaryText },
            !selectedGender && { color: themeColors.textSecondary } // Затемнение текста, если неактивна
            ]}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GenderScreen;

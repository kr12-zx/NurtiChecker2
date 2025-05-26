import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';
import { UserProfile, Challenge as ChallengeType } from '../../types/onboarding';
import { Ionicons } from '@expo/vector-icons';

interface ChallengesScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const challengeOptions: { value: ChallengeType; label: string }[] = [
  { value: 'emotional-eating', label: 'Эмоциональное питание' },
  { value: 'busy-schedule', label: 'Напряженный график' },
  { value: 'lack-of-motivation', label: 'Недостаток мотивации' },
  { value: 'social-situations', label: 'Социальные ситуации (вечеринки, рестораны)' },
  { value: 'food-cravings', label: 'Тяга к определенным продуктам (сладкое, жирное)' },
  { value: 'night-eating', label: 'Ночные приемы пищи или перекусы' },
  { value: 'stress', label: 'Стресс' },
  { value: 'lack-of-knowledge', label: 'Недостаток знаний о правильном питании' },
  { value: 'lack-of-time', label: 'Нехватка времени на готовку' },
  { value: 'social-pressure', label: 'Социальное давление (семья, друзья)' },
  { value: 'cravings', label: 'Общая сильная тяга к еде' }, 
];

const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [selectedChallenges, setSelectedChallenges] = useState<ChallengeType[]>(userProfile.challenges || []);

  const handleSelect = (challengeValue: ChallengeType) => {
    setSelectedChallenges((prevSelected) => {
      if (prevSelected.includes(challengeValue)) {
        return prevSelected.filter((c) => c !== challengeValue);
      } else {
        return [...prevSelected, challengeValue];
      }
    });
  };

  const handleContinue = () => {
    updateUserProfile({ challenges: selectedChallenges });
    onContinue();
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Основные трудности
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary, textAlign: 'center' }]}>
              С чем вы чаще всего сталкиваетесь? Выберите одно или несколько.
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {challengeOptions.map((option) => {
              const isSelected = selectedChallenges.includes(option.value);
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
                  <Text style={[
                    sharedOnboardingStyles.optionText,
                    styles.optionLabel,
                    { color: isSelected ? themeColors.primaryAccent : themeColors.textPrimary, flexShrink: 1 } 
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
              backgroundColor: themeColors.navButtonPrimaryBackground, // Кнопка всегда активна
              borderColor: themeColors.navButtonPrimaryBackground
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: themeColors.navButtonPrimaryText }
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
    minHeight: 50,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default ChallengesScreen;

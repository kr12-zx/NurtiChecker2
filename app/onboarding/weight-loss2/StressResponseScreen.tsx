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
import { UserProfile } from '../../types/onboarding';
import { Ionicons } from '@expo/vector-icons';

interface StressResponseScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

type StressResponseType = 'eat_more' | 'eat_less' | 'no_change' | 'exercise' | 'other';

const stressResponseOptions: { value: StressResponseType; label: string }[] = [
  { value: 'eat_more', label: 'Заедаю стресс' },
  { value: 'eat_less', label: 'Теряю аппетит' },
  { value: 'no_change', label: 'Не влияет на аппетит' },
  { value: 'exercise', label: 'Занимаюсь спортом / физическая активность' },
  { value: 'other', label: 'Другое' },
];

const StressResponseScreen: React.FC<StressResponseScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [selectedStressResponse, setSelectedStressResponse] = useState<StressResponseType | undefined>(
    userProfile.stressResponse as StressResponseType | undefined
  );

  const handleSelectStressResponse = (response: StressResponseType) => {
    setSelectedStressResponse(response);
  };

  const handleContinue = () => {
    if (selectedStressResponse) {
      updateUserProfile({ stressResponse: selectedStressResponse });
      onContinue();
    }
  };

  const canContinue = selectedStressResponse !== undefined;

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Реакция на стресс
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary, textAlign: 'center' }]}>
              Как вы обычно реагируете на стресс?
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {stressResponseOptions.map((option) => {
              const isSelected = selectedStressResponse === option.value;
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
                  onPress={() => handleSelectStressResponse(option.value)}
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
                      <Ionicons name="checkmark-outline" size={18} color={themeColors.selectionIndicatorCheckmark} />
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
              backgroundColor: canContinue ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground,
              borderColor: canContinue ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!canContinue}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: canContinue ? themeColors.navButtonPrimaryText : themeColors.navButtonDisabledText }
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

export default StressResponseScreen;

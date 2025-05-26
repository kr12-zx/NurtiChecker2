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
import { UserProfile, MealFrequency as MealFrequencyType } from '../../types/onboarding';
import { Ionicons } from '@expo/vector-icons';

interface MealFrequencyScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const mealFrequencyOptions: { value: MealFrequencyType; label: string; description?: string }[] = [
  { value: '2-meals', label: '2 раза в день' },
  { value: '3-meals', label: '3 раза в день' },
  { value: '4-meals', label: '4 раза в день' },
  { value: '5-meals', label: '5 раз в день' },
  { value: '6-meals', label: '6 раз в день' },
  { value: 'intermittent', label: 'Интервальное голодание', description: 'Периоды приема пищи чередуются с периодами голодания.' },
];

const MealFrequencyScreen: React.FC<MealFrequencyScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [selectedFrequency, setSelectedFrequency] = useState<MealFrequencyType | undefined>(
    userProfile.mealFrequency
  );

  const handleSelect = (frequency: MealFrequencyType) => {
    setSelectedFrequency(frequency);
  };

  const handleContinue = () => {
    if (selectedFrequency) {
      updateUserProfile({ mealFrequency: selectedFrequency });
      onContinue();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Частота приемов пищи
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary, textAlign: 'center' }]}>
              Как часто вы обычно едите в течение дня?
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {mealFrequencyOptions.map((option) => {
              const isSelected = selectedFrequency === option.value;
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
                    {option.description && (
                       <Text style={[
                        styles.optionDescription,
                        { color: isSelected ? themeColors.primaryAccent : themeColors.textSecondary }
                      ]}>
                        {option.description}
                      </Text>
                    )}
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
              backgroundColor: selectedFrequency ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground,
              borderColor: selectedFrequency ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!selectedFrequency}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: selectedFrequency ? themeColors.navButtonPrimaryText : themeColors.navButtonDisabledText }
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
    minHeight: 60, // Ensure consistent height for options with and without description
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2, // Reduced margin if no description
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2, // Add a bit of space if there is a description
  },
});

export default MealFrequencyScreen;

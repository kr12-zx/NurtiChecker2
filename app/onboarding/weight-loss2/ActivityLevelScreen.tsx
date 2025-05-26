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
import { UserProfile, ActivityLevel as ActivityLevelType } from '../../types/onboarding'; // Переименовываем импортируемый тип, чтобы избежать конфликта имен
import { Ionicons } from '@expo/vector-icons';

interface ActivityLevelScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const activityLevels: { value: ActivityLevelType; label: string; description: string }[] = [
  {
    value: 'sedentary',
    label: 'Сидячий',
    description: 'Мало или нет физической активности, работа за столом.',
  },
  {
    value: 'lightly-active',
    label: 'Низкая активность',
    description: 'Легкие упражнения/прогулки 1-3 раза в неделю.',
  },
  {
    value: 'moderately-active',
    label: 'Умеренная активность',
    description: 'Умеренные упражнения/спорт 3-5 раз в неделю.',
  },
  {
    value: 'very-active',
    label: 'Высокая активность',
    description: 'Интенсивные упражнения/спорт 6-7 раз в неделю.',
  },
  {
    value: 'extremely-active',
    label: 'Очень высокая активность',
    description: 'Очень интенсивные упражнения, физическая работа, тренировки дважды в день.',
  },
];

const ActivityLevelScreen: React.FC<ActivityLevelScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [selectedActivityLevel, setSelectedActivityLevel] = useState<ActivityLevelType | undefined>(
    userProfile.activityLevel
  );

  const handleSelect = (level: ActivityLevelType) => {
    setSelectedActivityLevel(level);
  };

  const handleContinue = () => {
    if (selectedActivityLevel) {
      updateUserProfile({ activityLevel: selectedActivityLevel });
      onContinue();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Уровень активности
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary, textAlign: 'center' }]}>
              Выберите ваш обычный уровень физической активности.
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {activityLevels.map((option) => {
              const isSelected = selectedActivityLevel === option.value;
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
              backgroundColor: selectedActivityLevel ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground,
              borderColor: selectedActivityLevel ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!selectedActivityLevel}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: selectedActivityLevel ? themeColors.navButtonPrimaryText : themeColors.navButtonDisabledText }
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
    marginBottom: 4, // небольшой отступ между заголовком и описанием
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ActivityLevelScreen;

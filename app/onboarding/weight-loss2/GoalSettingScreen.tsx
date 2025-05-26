import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';
import { UserProfile, UnitSettings } from '../../types/onboarding';
import { Ionicons } from '@expo/vector-icons';

interface GoalSettingScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  unitSettings: UnitSettings;
}

const GoalSettingScreen: React.FC<GoalSettingScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
  unitSettings,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [goalWeight, setGoalWeight] = useState<string>(userProfile.goalWeight?.toString() || '');
  const [error, setError] = useState<string | undefined>(undefined);
  const [weightLossRate, setWeightLossRate] = useState<number | undefined>(userProfile.weightLossRate);

  const isMetric = unitSettings.system === 'metric';
  const weightUnit = unitSettings.weight;
  const weightLossRateUnitLabel = isMetric ? 'кг/нед' : 'фунтов/нед';

  const rateOptions = [
    { label: 'Легкий', valueKg: 0.25, valueLb: 0.5 },
    { label: 'Рекомендуемый', valueKg: 0.5, valueLb: 1.0 },
    { label: 'Интенсивный', valueKg: 0.75, valueLb: 1.5 },
    { label: 'Очень интенсивный', valueKg: 1.0, valueLb: 2.0 },
  ];

  useEffect(() => {
    if (userProfile.goalWeight) {
      setGoalWeight(userProfile.goalWeight.toString());
    }
  }, [userProfile.goalWeight]);

  const validateInput = () => {
    const currentWeightKg = userProfile.currentWeight; 
    if (!currentWeightKg) {
      setError('Сначала укажите текущий вес на предыдущем экране.');
      return false;
    }

    const goalWeightNum = parseFloat(goalWeight);
    if (!goalWeight || isNaN(goalWeightNum) || goalWeightNum <= 0) {
      setError(`Введите корректный целевой вес в ${weightUnit}.`);
      return false;
    }
    
    let goalWeightKg = goalWeightNum;
    if (!isMetric) {
      goalWeightKg = goalWeightNum * 0.453592; 
    }

    if (goalWeightKg >= currentWeightKg) {
      setError('Целевой вес должен быть меньше текущего.');
      return false;
    }
    if (isMetric && (goalWeightKg < 20 || goalWeightKg > currentWeightKg -1 )) {
      setError(`Целевой вес должен быть от 20 кг и меньше текущего.`);
      return false;
    }
    if (!isMetric && (goalWeightKg * 2.20462 < 40 || goalWeightKg * 2.20462 > currentWeightKg * 2.20462 - 2.2 )) { 
      setError(`Целевой вес должен быть от 40 lbs и меньше текущего.`);
      return false;
    }

    setError(undefined);
    return true;
  };

  const handleContinue = () => {
    if (validateInput()) {
      let goalWeightToSave = parseFloat(goalWeight);
      if (!isMetric) {
        goalWeightToSave = parseFloat(goalWeight) * 0.453592; 
      }
      updateUserProfile({ 
        goalWeight: parseFloat(goalWeightToSave.toFixed(2)),
        weightLossRate: weightLossRate 
      });
      onContinue();
    }
  };

  const commonInputStyle = [
    sharedOnboardingStyles.input,
    { 
      backgroundColor: themeColors.inputBackground,
      borderColor: themeColors.inputBorder,
      color: themeColors.inputText 
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Ваша цель по весу
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary }]}>
              Укажите вес, которого вы хотели бы достичь.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Целевой вес</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[commonInputStyle, styles.inputField, error && sharedOnboardingStyles.inputError, {flex:1}] }
                placeholder={`Цель (${weightUnit})`}
                placeholderTextColor={themeColors.placeholderText}
                keyboardType="numeric"
                value={goalWeight}
                onChangeText={setGoalWeight}
              />
              <Text style={[styles.unitLabel, { color: themeColors.textSecondary }]}>{weightUnit}</Text>
            </View>
            {error && <Text style={[sharedOnboardingStyles.errorText, {color: themeColors.error}]}>{error}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textPrimary, marginBottom: 12 }]}>Желаемый темп</Text>
            <View style={sharedOnboardingStyles.optionsGroupContainer}>
              {rateOptions.map((option) => {
                const displayValue = isMetric ? option.valueKg : option.valueLb;
                const isSelected = weightLossRate === option.valueKg; 
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      sharedOnboardingStyles.optionContainer,
                      {
                        backgroundColor: isSelected ? themeColors.optionBackgroundSelected : themeColors.optionBackground,
                        borderColor: isSelected ? themeColors.optionBorderColorSelected : themeColors.optionBorderColor,
                      },
                    ]}
                    onPress={() => setWeightLossRate(option.valueKg)} 
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      sharedOnboardingStyles.optionText,
                      { color: isSelected ? themeColors.primaryAccent : themeColors.textPrimary } 
                    ]}>
                      {option.label} ({displayValue.toFixed(isMetric ? 2 : 1)} {weightLossRateUnitLabel})
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
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!goalWeight || weightLossRate === undefined} 
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: themeColors.navButtonPrimaryText },
            (!goalWeight || weightLossRate === undefined) && { color: themeColors.textSecondary } 
            ]}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
  },
  unitLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default GoalSettingScreen;

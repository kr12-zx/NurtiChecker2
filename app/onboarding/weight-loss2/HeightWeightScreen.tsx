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

interface HeightWeightScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  unitSettings: UnitSettings;
}

const HeightWeightScreen: React.FC<HeightWeightScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
  unitSettings,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const [height, setHeight] = useState<string>(userProfile.height?.toString() || '');
  const [heightFeet, setHeightFeet] = useState<string>(''); // Для имперской системы
  const [heightInches, setHeightInches] = useState<string>(''); // Для имперской системы
  const [weight, setWeight] = useState<string>(userProfile.currentWeight?.toString() || '');
  const [errors, setErrors] = useState<{ height?: string; weight?: string }>({});

  const isMetric = unitSettings.system === 'metric';

  // Эффект для конвертации при смене единиц (если нужно)
  useEffect(() => {
    if (userProfile.height) {
      if (isMetric) {
        setHeight(userProfile.height.toString());
      } else {
        // Конвертировать см в футы и дюймы
        const totalInches = userProfile.height / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
    }
    if (userProfile.currentWeight) {
        setWeight(userProfile.currentWeight.toString()); // Вес не требует такой сложной конвертации при отображении начального значения
    }
  }, [userProfile.height, userProfile.currentWeight, isMetric]);

  const validateInput = () => {
    const newErrors: { height?: string; weight?: string } = {};
    let isValid = true;

    // Валидация веса
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = 'Введите корректный вес';
      isValid = false;
    } else if (isMetric && (weightNum < 20 || weightNum > 300)) {
      newErrors.weight = 'Вес должен быть от 20 до 300 кг';
      isValid = false;
    } else if (!isMetric && (weightNum < 40 || weightNum > 660)) {
      newErrors.weight = 'Вес должен быть от 40 до 660 фунтов';
      isValid = false;
    }

    // Валидация роста
    if (isMetric) {
      const heightNum = parseFloat(height);
      if (!height || isNaN(heightNum) || heightNum <= 0) {
        newErrors.height = 'Введите корректный рост';
        isValid = false;
      } else if (heightNum < 50 || heightNum > 250) {
        newErrors.height = 'Рост должен быть от 50 до 250 см';
        isValid = false;
      }
    } else {
      const feetNum = parseFloat(heightFeet);
      const inchesNum = parseFloat(heightInches);
      if (!heightFeet || isNaN(feetNum) || feetNum < 1 || feetNum > 8) {
        newErrors.height = 'Футы: 1-8';
        isValid = false;
      }
      if (!heightInches || isNaN(inchesNum) || inchesNum < 0 || inchesNum >= 12) {
        newErrors.height = (newErrors.height ? newErrors.height + ', ' : '') + 'Дюймы: 0-11';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateInput()) {
      let heightInCm: number;
      if (isMetric) {
        heightInCm = parseFloat(height);
      } else {
        const feet = parseFloat(heightFeet) || 0;
        const inches = parseFloat(heightInches) || 0;
        heightInCm = Math.round((feet * 12 + inches) * 2.54);
      }
      updateUserProfile({ 
        height: heightInCm, 
        currentWeight: parseFloat(weight) 
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
              Рост и вес
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary }]}>
              Эти данные помогут нам точнее рассчитать ваши потребности.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Рост</Text>
            {isMetric ? (
              <View style={styles.inputRow}>
                <TextInput
                  style={[commonInputStyle, styles.inputField, errors.height && sharedOnboardingStyles.inputError, {flex:1}] }
                  placeholder={`Рост (${unitSettings.height})`}
                  placeholderTextColor={themeColors.placeholderText}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text style={[styles.unitLabel, { color: themeColors.textSecondary }]}>{unitSettings.height}</Text>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <TextInput
                  style={[commonInputStyle, styles.inputField, errors.height && sharedOnboardingStyles.inputError, { flex: 0.45 } ]}
                  placeholder="Футы"
                  placeholderTextColor={themeColors.placeholderText}
                  keyboardType="numeric"
                  value={heightFeet}
                  onChangeText={setHeightFeet}
                />
                <Text style={[styles.unitLabel, { color: themeColors.textSecondary, marginHorizontal: 5 }]}>ft</Text>
                <TextInput
                  style={[commonInputStyle, styles.inputField, errors.height && sharedOnboardingStyles.inputError, { flex: 0.45 } ]}
                  placeholder="Дюймы"
                  placeholderTextColor={themeColors.placeholderText}
                  keyboardType="numeric"
                  value={heightInches}
                  onChangeText={setHeightInches}
                />
                 <Text style={[styles.unitLabel, { color: themeColors.textSecondary, marginLeft: 5 }]}>in</Text>
              </View>
            )}
            {errors.height && <Text style={[sharedOnboardingStyles.errorText, {color: themeColors.error}]}>{errors.height}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Текущий вес</Text>
            <View style={styles.inputRow}>
                <TextInput
                  style={[commonInputStyle, styles.inputField, errors.weight && sharedOnboardingStyles.inputError, {flex:1}] }
                  placeholder={`Вес (${unitSettings.weight})`}
                  placeholderTextColor={themeColors.placeholderText}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text style={[styles.unitLabel, { color: themeColors.textSecondary }]}>{unitSettings.weight}</Text>
            </View>
            {errors.weight && <Text style={[sharedOnboardingStyles.errorText, {color: themeColors.error}]}>{errors.weight}</Text>}
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
        >
          <Text style={[sharedOnboardingStyles.navButtonText, { color: themeColors.navButtonPrimaryText }]}>
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
    // Removed flex: 1 here, will be applied conditionally or per input
  },
  unitLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HeightWeightScreen;

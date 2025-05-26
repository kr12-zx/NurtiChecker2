import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { UnitSettings } from '../../types/onboarding'; // Предполагается, что UnitSettings уже определен
import { darkThemeColors, lightThemeColors, sharedOnboardingStyles } from './sharedOnboardingStyles';

interface UnitsScreenProps {
  onContinue: () => void;
  onBack: () => void;
  unitSettings: UnitSettings;
  updateUnitSettings: (settings: UnitSettings) => void;
}

const unitOptions: Array<{ id: 'metric' | 'imperial'; label: string; description: string }> = [
  {
    id: 'metric',
    label: 'Метрическая система',
    description: 'Килограммы (кг), (см)',
  },
  {
    id: 'imperial',
    label: 'Имперская система',
    description: 'Фунты (lb), футы (ft) и дюймы (in)',
  },
];

const UnitsScreen: React.FC<UnitsScreenProps> = ({
  onContinue,
  onBack,
  unitSettings,
  updateUnitSettings,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const selectedSystem = unitSettings.system;

  const handleSelectSystem = (system: 'metric' | 'imperial') => {
    // При смене системы, устанавливаем соответствующие единицы по умолчанию
    let newUnits: { weight: 'kg' | 'lb'; height: 'cm' | 'ft' };
    if (system === 'metric') {
      newUnits = { weight: 'kg', height: 'cm' };
    } else {
      newUnits = { weight: 'lb', height: 'ft' }; 
    }
    updateUnitSettings({ 
      system,
      ...newUnits 
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Единицы измерения
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary }]}>
              Выберите предпочитаемую систему единиц для ввода данных.
            </Text>
          </View>

          <View style={sharedOnboardingStyles.optionsGroupContainer}>
            {unitOptions.map((option) => {
              const isSelected = selectedSystem === option.id;
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
                  onPress={() => handleSelectSystem(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      sharedOnboardingStyles.optionText, 
                      { 
                        fontWeight: 'bold',
                        color: isSelected ? themeColors.primaryAccent : themeColors.textPrimary 
                      }
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      sharedOnboardingStyles.subtitleText, // Используем стиль подзаголовка для описания
                      { 
                        fontSize: 14, 
                        color: isSelected ? themeColors.primaryAccent : themeColors.textSecondary,
                        marginTop: 2 
                      }
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
          disabled={!selectedSystem} 
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: themeColors.navButtonPrimaryText },
            !selectedSystem && { color: themeColors.textSecondary }
            ]}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UnitsScreen;

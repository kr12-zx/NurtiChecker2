import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { UnitSettings } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { options, typography, usePalette } from './unifiedStyles';

interface UnitsScreenProps {
  onContinue: () => void;
  onBack: () => void;
  unitSettings: UnitSettings;
  onUnitSettingsChange: (settings: UnitSettings) => void;
}

const UnitsScreen: React.FC<UnitsScreenProps> = ({ 
  onContinue, 
  onBack, 
  unitSettings,
  onUnitSettingsChange
}) => {
  const palette = usePalette();
  const { t } = useTranslation();

  const unitOptions = [
    { id: 'metric', label: t('onboarding.units.options.metric'), icon: 'calculator' },
    { id: 'imperial', label: t('onboarding.units.options.imperial'), icon: 'calculator-outline' },
  ];

  const handleUnitChange = (system: 'metric' | 'imperial') => {
    const newSettings: UnitSettings = {
      system,
      weight: system === 'metric' ? 'kg' : 'lb',
      height: system === 'metric' ? 'cm' : 'ft',
    };
    onUnitSettingsChange(newSettings);
  };

  return (
    <OnboardingLayout
      title={t('onboarding.units.title')}
      subtitle={t('onboarding.units.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {unitOptions.map((option) => {
          const isSelected = unitSettings.system === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption
              ]}
              onPress={() => handleUnitChange(option.id as 'metric' | 'imperial')}
              activeOpacity={0.5}
            >
              <View style={options.optionIconContainer}>
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={isSelected ? palette.primary : palette.text.secondary}
                />
              </View>
              
              <View style={options.optionTextContainer}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
              </View>
              
              <View style={[
                options.checkIconContainer,
                isSelected ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={palette.text.white} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default UnitsScreen;

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { DietPreference } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { dietPreferences, options, typography, usePalette } from './unifiedStyles';

interface DietPreferenceScreenProps {
  onContinue: () => void;
  onBack: () => void;
  dietPreference: DietPreference;
  onDietPreferenceChange: (preference: DietPreference) => void;
}

const DietPreferenceScreen: React.FC<DietPreferenceScreenProps> = ({ 
  onContinue, 
  onBack, 
  dietPreference,
  onDietPreferenceChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localDietPreference, setLocalDietPreference] = React.useState<DietPreference>(dietPreference);
  
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalDietPreference(dietPreference);
  }, [dietPreference]);
  
  // Функция обработки выбора типа питания
  const handleDietPreferenceSelect = (selectedPreference: DietPreference) => {
    console.log('Выбран тип питания:', selectedPreference);
    // Обновляем локальное состояние немедленно
    setLocalDietPreference(selectedPreference);
    // Обновляем состояние в родительском компоненте
    onDietPreferenceChange(selectedPreference);
  };

  const dietOptions: {id: DietPreference; label: string; icon: string; description: string}[] = [
    { 
      id: 'standard', 
      label: t('onboarding.dietPreference.options.standard.label'), 
      icon: 'restaurant-outline',
      description: t('onboarding.dietPreference.options.standard.description')
    },
    { 
      id: 'vegetarian', 
      label: t('onboarding.dietPreference.options.vegetarian.label'), 
      icon: 'leaf-outline',
      description: t('onboarding.dietPreference.options.vegetarian.description')
    },
    { 
      id: 'vegan', 
      label: t('onboarding.dietPreference.options.vegan.label'), 
      icon: 'nutrition-outline',
      description: t('onboarding.dietPreference.options.vegan.description')
    },
    { 
      id: 'low-carb', 
      label: t('onboarding.dietPreference.options.lowCarb.label'), 
      icon: 'fast-food-outline',
      description: t('onboarding.dietPreference.options.lowCarb.description')
    },
    { 
      id: 'keto', 
      label: t('onboarding.dietPreference.options.keto.label'), 
      icon: 'analytics-outline',
      description: t('onboarding.dietPreference.options.keto.description')
    },
    { 
      id: 'paleo', 
      label: t('onboarding.dietPreference.options.paleo.label'), 
      icon: 'bonfire-outline',
      description: t('onboarding.dietPreference.options.paleo.description')
    },
    { 
      id: 'mediterranean', 
      label: t('onboarding.dietPreference.options.mediterranean.label'), 
      icon: 'fish-outline',
      description: t('onboarding.dietPreference.options.mediterranean.description')
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.dietPreference.title')}
      subtitle={t('onboarding.dietPreference.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={dietPreferences.optionsContainer}>
        {dietOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localDietPreference === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption
              ]}
              onPress={() => handleDietPreferenceSelect(option.id)}
              activeOpacity={0.5}
              // Увеличиваем область нажатия для лучшего отклика
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                <Text style={typography.optionDescription}>
                  {option.description}
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

export default DietPreferenceScreen;

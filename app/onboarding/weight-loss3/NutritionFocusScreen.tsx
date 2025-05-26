import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { nutritionFocus as nutritionFocusStyles, options, typography, usePalette } from './unifiedStyles';

interface NutritionFocusScreenProps {
  onContinue: () => void;
  onBack: () => void;
  nutritionFocus: string | null;
  onNutritionFocusChange: (focus: string) => void;
}

const NutritionFocusScreen: React.FC<NutritionFocusScreenProps> = ({ 
  onContinue, 
  onBack, 
  nutritionFocus,
  onNutritionFocusChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localNutritionFocus, setLocalNutritionFocus] = React.useState<string | null>(nutritionFocus || 'balanced');
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalNutritionFocus(nutritionFocus);
  }, [nutritionFocus]);
  
  // Используем хук usePalette вместо прямого useColorScheme
  const palette = usePalette();
  
  // Функция обработки выбора фокуса питания
  const handleNutritionFocusSelect = (focus: string) => {
    console.log('Выбран фокус питания:', focus);
    // Обновляем локальное состояние немедленно
    setLocalNutritionFocus(focus);
    // Обновляем состояние в родительском компоненте
    onNutritionFocusChange(focus);
  };

  const nutritionOptions = [
    { 
      id: 'calories-only', 
      label: t('onboarding.nutritionFocus.options.caloriesOnly.label'), 
      icon: 'flame-outline',
      description: t('onboarding.nutritionFocus.options.caloriesOnly.description')
    },
    { 
      id: 'balanced', 
      label: t('onboarding.nutritionFocus.options.balanced.label'), 
      icon: 'nutrition-outline',
      description: t('onboarding.nutritionFocus.options.balanced.description'),
      recommended: true
    },
    { 
      id: 'high-protein', 
      label: t('onboarding.nutritionFocus.options.highProtein.label'), 
      icon: 'barbell-outline',
      description: t('onboarding.nutritionFocus.options.highProtein.description')
    },
    { 
      id: 'low-carb', 
      label: t('onboarding.nutritionFocus.options.lowCarb.label'), 
      icon: 'leaf-outline',
      description: t('onboarding.nutritionFocus.options.lowCarb.description')
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.nutritionFocus.title')}
      subtitle={t('onboarding.nutritionFocus.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
            <View style={{ marginTop: 20 }}>
              {nutritionOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localNutritionFocus === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      option.recommended && nutritionFocusStyles.recommendedOption,
                      nutritionFocusStyles.nutritionOption
                    ]}
                    onPress={() => handleNutritionFocusSelect(option.id)}
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
                    
                    <View style={[options.optionTextContainer, nutritionFocusStyles.nutritionTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={nutritionFocusStyles.descriptionText}>
                        {option.description}
                      </Text>
                      {option.recommended && (
                        <Text style={nutritionFocusStyles.recommendedText}>{t('onboarding.nutritionFocus.recommended')}</Text>
                      )}
                    </View>
                    
                    <View style={[
                      options.checkIconContainer,
                      isSelected ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={palette.white} />
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

export default NutritionFocusScreen;

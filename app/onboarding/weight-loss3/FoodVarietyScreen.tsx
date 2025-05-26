import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { foodVarietyStyles, options, palette, typography } from './unifiedStyles';

interface FoodVarietyScreenProps {
  onContinue: () => void;
  onBack: () => void;
  foodVariety: string | null;
  onFoodVarietyChange: (variety: string) => void;
}

const FoodVarietyScreen: React.FC<FoodVarietyScreenProps> = ({ 
  onContinue, 
  onBack, 
  foodVariety,
  onFoodVarietyChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localFoodVariety, setLocalFoodVariety] = React.useState<string | null>(foodVariety || 'sometimes');
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalFoodVariety(foodVariety);
  }, [foodVariety]);
  
  // Функция обработки выбора открытости к новым продуктам
  const handleFoodVarietySelect = (variety: string) => {
    console.log('Выбрана открытость к новым продуктам:', variety);
    // Обновляем локальное состояние немедленно
    setLocalFoodVariety(variety);
    // Обновляем состояние в родительском компоненте
    onFoodVarietyChange(variety);
  };

  const varietyOptions = [
    { 
      id: 'often', 
      label: t('onboarding.foodVariety.options.often'),
      description: t('onboarding.foodVariety.descriptions.often'),
      icon: 'planet-outline'
    },
    { 
      id: 'sometimes', 
      label: t('onboarding.foodVariety.options.sometimes'),
      description: t('onboarding.foodVariety.descriptions.sometimes'),
      icon: 'add-circle-outline'
    },
    { 
      id: 'rarely', 
      label: t('onboarding.foodVariety.options.rarely'),
      description: t('onboarding.foodVariety.descriptions.rarely'),
      icon: 'heart-outline'
    },
    { 
      id: 'never', 
      label: t('onboarding.foodVariety.options.never'),
      description: t('onboarding.foodVariety.descriptions.never'),
      icon: 'repeat-outline'
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.foodVariety.title')}
      subtitle={t('onboarding.foodVariety.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {varietyOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localFoodVariety === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                foodVarietyStyles.varietyOption
              ]}
              onPress={() => handleFoodVarietySelect(option.id)}
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
              
              <View style={[options.optionTextContainer, foodVarietyStyles.varietyTextContainer]}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
                <Text style={foodVarietyStyles.descriptionText}>
                  {option.description}
                </Text>
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

export default FoodVarietyScreen;

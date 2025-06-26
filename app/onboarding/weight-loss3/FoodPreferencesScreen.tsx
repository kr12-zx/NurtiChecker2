import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface FoodPreferencesScreenProps {
  onContinue: () => void;
  onBack: () => void;
  foodPriority: string | null;
  onFoodPriorityChange: (priority: string) => void;
}

const FoodPreferencesScreen: React.FC<FoodPreferencesScreenProps> = ({ 
  onContinue, 
  onBack, 
  foodPriority,
  onFoodPriorityChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localFoodPriority, setLocalFoodPriority] = React.useState<string | null>(foodPriority || 'taste');
  const { t } = useTranslation();
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalFoodPriority(foodPriority);
  }, [foodPriority]);
  
  // Функция обработки выбора приоритета в питании
  const handleFoodPrioritySelect = (priority: string) => {
    console.log('Выбран приоритет в питании:', priority);
    // Обновляем локальное состояние немедленно
    setLocalFoodPriority(priority);
    // Обновляем состояние в родительском компоненте
    onFoodPriorityChange(priority);
  };

  const priorityOptions = [
    { 
      id: 'taste', 
      label: t('onboarding.foodPreferences.options.taste.label'),
      description: t('onboarding.foodPreferences.options.taste.description'),
      icon: 'happy-outline'
    },
    { 
      id: 'nutrition', 
      label: t('onboarding.foodPreferences.options.health.label'),
      description: t('onboarding.foodPreferences.options.health.description'),
      icon: 'leaf-outline'
    },
    { 
      id: 'convenience', 
      label: t('onboarding.foodPreferences.options.convenience.label'),
      description: t('onboarding.foodPreferences.options.convenience.description'),
      icon: 'time-outline'
    },
    { 
      id: 'affordability', 
      label: t('onboarding.foodPreferences.options.price.label'),
      description: t('onboarding.foodPreferences.options.price.description'),
      icon: 'wallet-outline'
    },
    { 
      id: 'balance', 
      label: t('onboarding.foodPreferences.options.tradition.label'),
      description: t('onboarding.foodPreferences.options.tradition.description'),
      icon: 'fitness-outline'
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.foodPreferences.title')}
      subtitle={t('onboarding.foodPreferences.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {priorityOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localFoodPriority === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                { marginBottom: 16 }
              ]}
              onPress={() => handleFoodPrioritySelect(option.id)}
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
              
              <View style={[options.optionTextContainer, { flex: 1 }]}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
                <Text style={[typography.optionDescription, { marginTop: 4 }]}>
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

export default FoodPreferencesScreen;

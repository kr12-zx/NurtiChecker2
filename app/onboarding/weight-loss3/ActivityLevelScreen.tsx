import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { ActivityLevel } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { activityLevel as activityLevelStyles, options, typography, usePalette } from './unifiedStyles';

interface ActivityLevelScreenProps {
  onContinue: () => void;
  onBack: () => void;
  activityLevel: ActivityLevel;
  onActivityLevelChange: (level: ActivityLevel) => void;
}

const ActivityLevelScreen: React.FC<ActivityLevelScreenProps> = ({ 
  onContinue, 
  onBack, 
  activityLevel,
  onActivityLevelChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localActivityLevel, setLocalActivityLevel] = React.useState<ActivityLevel>(activityLevel);
  
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalActivityLevel(activityLevel);
  }, [activityLevel]);
  
  // Функция обработки выбора уровня активности
  const handleActivityLevelSelect = (selectedLevel: ActivityLevel) => {
    console.log('Выбран уровень активности:', selectedLevel);
    // Обновляем локальное состояние немедленно
    setLocalActivityLevel(selectedLevel);
    // Обновляем состояние в родительском компоненте
    onActivityLevelChange(selectedLevel);
  };

  const activityOptions: {id: ActivityLevel; label: string; icon: string; description: string}[] = [
    { 
      id: 'sedentary', 
      label: t('onboarding.activityLevel.options.sedentary.label'), 
      icon: 'bed-outline',
      description: t('onboarding.activityLevel.options.sedentary.description')
    },
    { 
      id: 'lightly-active', 
      label: t('onboarding.activityLevel.options.lightlyActive.label'), 
      icon: 'walk-outline',
      description: t('onboarding.activityLevel.options.lightlyActive.description')
    },
    { 
      id: 'moderately-active', 
      label: t('onboarding.activityLevel.options.moderatelyActive.label'), 
      icon: 'bicycle-outline',
      description: t('onboarding.activityLevel.options.moderatelyActive.description')
    },
    { 
      id: 'very-active', 
      label: t('onboarding.activityLevel.options.veryActive.label'), 
      icon: 'fitness-outline',
      description: t('onboarding.activityLevel.options.veryActive.description')
    },
    { 
      id: 'extremely-active', 
      label: t('onboarding.activityLevel.options.extremelyActive.label'), 
      icon: 'barbell-outline',
      description: t('onboarding.activityLevel.options.extremelyActive.description')
    },
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.activityLevel.title')}
      subtitle={t('onboarding.activityLevel.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={activityLevelStyles.optionsContainer}>
        {activityOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localActivityLevel === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption
              ]}
              onPress={() => handleActivityLevelSelect(option.id)}
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

export default ActivityLevelScreen;

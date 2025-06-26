import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface CalorieScheduleScreenProps {
  onContinue: () => void;
  onBack: () => void;
  useFlexibleCalories: boolean | null;
  onUseFlexibleCaloriesChange: (use: boolean) => void;
}

const CalorieScheduleScreen: React.FC<CalorieScheduleScreenProps> = ({ 
  onContinue, 
  onBack, 
  useFlexibleCalories,
  onUseFlexibleCaloriesChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localUseCalorieSchedule, setLocalUseCalorieSchedule] = React.useState<boolean | null>(useFlexibleCalories);
  const { t } = useTranslation();
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalUseCalorieSchedule(useFlexibleCalories);
  }, [useFlexibleCalories]);
  
  // Функция обработки выбора графика калорий
  const handleCalorieScheduleSelect = (use: boolean) => {
    console.log('Выбран график калорий:', use ? 'Да' : 'Нет');
    // Обновляем локальное состояние немедленно
    setLocalUseCalorieSchedule(use);
    // Обновляем состояние в родительском компоненте
    onUseFlexibleCaloriesChange(use);
  };

  const scheduleOptions = [
    { 
      id: false, 
      label: t('onboarding.calorieSchedule.options.fixed'), 
      icon: 'calendar-outline',
      description: t('onboarding.calorieSchedule.descriptions.fixed'),
      recommended: true 
    },
    { 
      id: true, 
      label: t('onboarding.calorieSchedule.options.flexible'), 
      icon: 'stats-chart-outline',
      description: t('onboarding.calorieSchedule.descriptions.flexible')
    },
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.calorieSchedule.title')}
      subtitle={t('onboarding.calorieSchedule.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
            <View style={{ marginTop: 20 }}>
              {scheduleOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localUseCalorieSchedule === option.id;
                
                return (
                  <TouchableOpacity
                    key={String(option.id)}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      option.recommended && { 
                        borderColor: palette.primary, 
                        borderWidth: 2 
                      },
                      { marginBottom: 16 }
                    ]}
                    onPress={() => handleCalorieScheduleSelect(option.id)}
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
                      {option.recommended && (
                        <Text style={[typography.optionDescription, { color: palette.primary, fontWeight: '600', marginTop: 8 }]}>
                          {t('onboarding.calorieSchedule.recommended')}
                        </Text>
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

export default CalorieScheduleScreen;

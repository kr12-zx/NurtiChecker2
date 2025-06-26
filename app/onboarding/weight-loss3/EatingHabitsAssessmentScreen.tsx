import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface EatingHabitsAssessmentScreenProps {
  onContinue: () => void;
  onBack: () => void;
  eatingHabitsAssessment: string | null;
  onEatingHabitsAssessmentChange: (assessment: string) => void;
}

const EatingHabitsAssessmentScreen: React.FC<EatingHabitsAssessmentScreenProps> = ({ 
  onContinue, 
  onBack, 
  eatingHabitsAssessment,
  onEatingHabitsAssessmentChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localAssessment, setLocalAssessment] = React.useState<string | null>(eatingHabitsAssessment || 'improving');
  const { t } = useTranslation();
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalAssessment(eatingHabitsAssessment);
  }, [eatingHabitsAssessment]);
  
  // Функция обработки выбора оценки пищевых привычек
  const handleAssessmentSelect = (assessment: string) => {
    console.log('Выбрана оценка пищевых привычек:', assessment);
    // Обновляем локальное состояние немедленно
    setLocalAssessment(assessment);
    // Обновляем состояние в родительском компоненте
    onEatingHabitsAssessmentChange(assessment);
  };

  const assessmentOptions = [
    { 
      id: 'confident', 
      label: t('onboarding.eatingHabitsAssessment.options.excellent'),
      description: t('onboarding.eatingHabitsAssessment.descriptions.excellent'),
      icon: 'shield-checkmark-outline'
    },
    { 
      id: 'improving', 
      label: t('onboarding.eatingHabitsAssessment.options.good'),
      description: t('onboarding.eatingHabitsAssessment.descriptions.good'),
      icon: 'trending-up-outline'
    },
    { 
      id: 'figuring-out', 
      label: t('onboarding.eatingHabitsAssessment.options.improving'),
      description: t('onboarding.eatingHabitsAssessment.descriptions.improving'),
      icon: 'search-outline'
    },
    { 
      id: 'need-guidance', 
      label: t('onboarding.eatingHabitsAssessment.options.needWork'),
      description: t('onboarding.eatingHabitsAssessment.descriptions.needWork'),
      icon: 'help-buoy-outline'
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.eatingHabitsAssessment.title')}
      subtitle={t('onboarding.eatingHabitsAssessment.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {assessmentOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localAssessment === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                { marginBottom: 16 }
              ]}
              onPress={() => handleAssessmentSelect(option.id)}
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
      
      <View style={{ marginTop: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
        <Ionicons name="bulb-outline" size={20} color={palette.primary} style={{ marginRight: 12, marginTop: 2 }} />
        <Text style={[typography.caption, { flex: 1 }]}>
          {t('onboarding.eatingHabitsAssessment.tip')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default EatingHabitsAssessmentScreen;

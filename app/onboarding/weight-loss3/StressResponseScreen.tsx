import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface StressResponseScreenProps {
  onContinue: () => void;
  onBack: () => void;
  stressResponse: string;
  onStressResponseChange: (response: string) => void;
}

const StressResponseScreen: React.FC<StressResponseScreenProps> = ({ 
  onContinue, 
  onBack, 
  stressResponse,
  onStressResponseChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localStressResponse, setLocalStressResponse] = React.useState<string>(stressResponse || 'emotional-eating');
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Динамические стили для этого экрана
  const optionsContainerStyle = {
    marginTop: 20,
  };

  const responseOptionStyle = {
    marginBottom: 16,
  };

  const responseTextContainerStyle = {
    flex: 1,
  };

  const descriptionTextStyle = {
    fontSize: 14,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  };

  const noteContainerStyle = {
    backgroundColor: palette.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const noteTextStyle = {
    fontSize: 12,
    color: palette.text.secondary,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    lineHeight: 16,
  };
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalStressResponse(stressResponse);
  }, [stressResponse]);
  
  // Функция обработки выбора реакции на стресс
  const handleStressResponseSelect = (selectedResponse: string) => {
    console.log('Выбрана реакция на стресс:', selectedResponse);
    // Обновляем локальное состояние немедленно
    setLocalStressResponse(selectedResponse);
    // Обновляем состояние в родительском компоненте
    onStressResponseChange(selectedResponse);
  };

  const responseOptions: {id: string; label: string; icon: string; description: string}[] = [
    { 
      id: 'emotional-eating', 
      label: t('onboarding.stressResponse.options.emotionalEating'), 
      icon: 'fast-food-outline',
      description: t('onboarding.stressResponse.descriptions.emotionalEating')
    },
    { 
      id: 'physical-activity', 
      label: t('onboarding.stressResponse.options.exercise'), 
      icon: 'fitness-outline',
      description: t('onboarding.stressResponse.descriptions.exercise')
    },
    { 
      id: 'mindfulness', 
      label: t('onboarding.stressResponse.options.mindfulness'), 
      icon: 'flower-outline',
      description: t('onboarding.stressResponse.descriptions.mindfulness')
    },
    { 
      id: 'avoidance', 
      label: t('onboarding.stressResponse.options.avoidance'), 
      icon: 'eye-off-outline',
      description: t('onboarding.stressResponse.descriptions.avoidance')
    },
    { 
      id: 'social-support', 
      label: t('onboarding.stressResponse.options.socializing'), 
      icon: 'people-outline',
      description: t('onboarding.stressResponse.descriptions.socializing')
    },
    { 
      id: 'creative-outlet', 
      label: t('onboarding.stressResponse.options.creative'), 
      icon: 'brush-outline',
      description: t('onboarding.stressResponse.descriptions.creative')
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.stressResponse.title')}
      subtitle={t('onboarding.stressResponse.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={optionsContainerStyle}>
        {responseOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localStressResponse === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                responseOptionStyle
              ]}
              onPress={() => handleStressResponseSelect(option.id)}
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
              
              <View style={[options.optionTextContainer, responseTextContainerStyle]}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
                <Text style={descriptionTextStyle}>
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
      
      <View style={noteContainerStyle}>
        <Text style={noteTextStyle}>
          {t('onboarding.stressResponse.note')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default StressResponseScreen;

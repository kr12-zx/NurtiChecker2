import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface WeightManagementObstacleScreenProps {
  onContinue: () => void;
  onBack: () => void;
  mainObstacle: string | null;
  onMainObstacleChange: (obstacle: string) => void;
}

const WeightManagementObstacleScreen: React.FC<WeightManagementObstacleScreenProps> = ({ 
  onContinue, 
  onBack, 
  mainObstacle,
  onMainObstacleChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localMainObstacle, setLocalMainObstacle] = React.useState<string | null>(mainObstacle || 'emotional-eating');
  const { t } = useTranslation();
  
  // Получаем текущую палитру цветов
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalMainObstacle(mainObstacle);
  }, [mainObstacle]);
  
  // Функция обработки выбора основного препятствия
  const handleObstacleSelect = (obstacle: string) => {
    console.log('Selected main obstacle:', obstacle);
    // Обновляем локальное состояние немедленно
    setLocalMainObstacle(obstacle);
    // Обновляем состояние в родительском компоненте
    onMainObstacleChange(obstacle);
  };

  const obstacleOptions = [
    { 
      id: 'self-control', 
      label: t('onboarding.weightManagementObstacle.options.selfControl'),
      description: t('onboarding.weightManagementObstacle.descriptions.selfControl'),
      icon: 'hand-left-outline'
    },
    { 
      id: 'long-term-motivation', 
      label: t('onboarding.weightManagementObstacle.options.lackOfMotivation'),
      description: t('onboarding.weightManagementObstacle.descriptions.lackOfMotivation'),
      icon: 'flag-outline'
    },
    { 
      id: 'emotional-eating', 
      label: t('onboarding.weightManagementObstacle.options.emotionalEating'),
      description: t('onboarding.weightManagementObstacle.descriptions.emotionalEating'),
      icon: 'sad-outline'
    },
    { 
      id: 'lack-of-time', 
      label: t('onboarding.weightManagementObstacle.options.timeConstraints'),
      description: t('onboarding.weightManagementObstacle.descriptions.timeConstraints'),
      icon: 'time-outline'
    },
    { 
      id: 'something-else', 
      label: t('onboarding.weightManagementObstacle.options.other'),
      description: t('onboarding.weightManagementObstacle.descriptions.other'),
      icon: 'help-circle-outline'
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.weightManagementObstacle.title')}
      subtitle={t('onboarding.weightManagementObstacle.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {obstacleOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localMainObstacle === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                { marginBottom: 16 }
              ]}
              onPress={() => handleObstacleSelect(option.id)}
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
      
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Text style={[typography.caption, { textAlign: 'center' }]}>
          {t('onboarding.weightManagementObstacle.helpNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default WeightManagementObstacleScreen;

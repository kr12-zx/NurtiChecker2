import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { confidenceLevel as confidenceLevelStyles, options, typography, usePalette } from './unifiedStyles';

interface ConfidenceLevelScreenProps {
  onContinue: () => void;
  onBack: () => void;
  confidenceLevel: number;
  onConfidenceLevelChange: (level: number) => void;
}

const ConfidenceLevelScreen: React.FC<ConfidenceLevelScreenProps> = ({ 
  onContinue, 
  onBack, 
  confidenceLevel,
  onConfidenceLevelChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localConfidenceLevel, setLocalConfidenceLevel] = React.useState<number>(confidenceLevel);
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalConfidenceLevel(confidenceLevel);
  }, [confidenceLevel]);
  
  // Функция обработки выбора уровня уверенности
  const handleConfidenceLevelSelect = (selectedLevel: number) => {
    console.log('Выбран уровень уверенности:', selectedLevel);
    // Обновляем локальное состояние немедленно
    setLocalConfidenceLevel(selectedLevel);
    // Обновляем состояние в родительском компоненте
    onConfidenceLevelChange(selectedLevel);
  };
  
  // Получаем палитру цветов используя хук
  const palette = usePalette();

  const confidenceOptions = [
    { level: 1, label: t('onboarding.confidenceLevel.options.notConfident'), icon: 'sad-outline' },
    { level: 2, label: t('onboarding.confidenceLevel.options.slightlyConfident'), icon: 'remove-circle-outline' },
    { level: 3, label: t('onboarding.confidenceLevel.options.moderatelyConfident'), icon: 'radio-button-off-outline' },
    { level: 4, label: t('onboarding.confidenceLevel.options.quiteConfident'), icon: 'add-circle-outline' },
    { level: 5, label: t('onboarding.confidenceLevel.options.veryConfident'), icon: 'happy-outline' },
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.confidenceLevel.title')}
      subtitle={t('onboarding.confidenceLevel.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={confidenceLevelStyles.confidenceContainer}>
            {confidenceOptions.map((option) => {
              // Используем локальное состояние для отображения выбранного варианта
              const isSelected = localConfidenceLevel === option.level;
              
              return (
                <TouchableOpacity
                  key={option.level}
                  style={[
                    options.optionContainer,
                    isSelected ? options.selectedOption : options.unselectedOption,
                    confidenceLevelStyles.confidenceOption
                  ]}
                  onPress={() => handleConfidenceLevelSelect(option.level)}
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

          <View style={confidenceLevelStyles.scaleContainer}>
            <View style={confidenceLevelStyles.scaleBar}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View 
                  key={level} 
                  style={[
                    confidenceLevelStyles.scalePoint,
                    level <= localConfidenceLevel ? confidenceLevelStyles.activeScalePoint : {}
                  ]} 
                />
              ))}
            </View>
            <View style={confidenceLevelStyles.scaleLabels}>
              <Text style={confidenceLevelStyles.scaleLabel}>{t('onboarding.confidenceLevel.low')}</Text>
              <Text style={confidenceLevelStyles.scaleLabel}>{t('onboarding.confidenceLevel.high')}</Text>
            </View>
          </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts



export default ConfidenceLevelScreen;

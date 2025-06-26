import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

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
  
  // Получаем стили используя хуки
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Функция обработки выбора уровня уверенности
  const handleConfidenceLevelSelect = (selectedLevel: number) => {
    console.log('Выбран уровень уверенности:', selectedLevel);
    // Обновляем локальное состояние немедленно
    setLocalConfidenceLevel(selectedLevel);
    // Обновляем состояние в родительском компоненте
    onConfidenceLevelChange(selectedLevel);
  };

  const confidenceOptions = [
    { level: 1, label: t('onboarding.confidenceLevel.options.notConfident'), icon: 'sad-outline' },
    { level: 2, label: t('onboarding.confidenceLevel.options.slightlyConfident'), icon: 'remove-circle-outline' },
    { level: 3, label: t('onboarding.confidenceLevel.options.moderatelyConfident'), icon: 'radio-button-off-outline' },
    { level: 4, label: t('onboarding.confidenceLevel.options.quiteConfident'), icon: 'add-circle-outline' },
    { level: 5, label: t('onboarding.confidenceLevel.options.veryConfident'), icon: 'happy-outline' },
  ];

  const scaleContainerStyle = {
    marginTop: 32,
    paddingHorizontal: 16,
  };

  const scaleBarStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    paddingHorizontal: 20,
  };

  const scalePointStyle = {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.border,
  };

  const activeScalePointStyle = {
    backgroundColor: palette.primary,
  };

  const scaleLabelsStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
  };

  return (
    <OnboardingLayout
      title={t('onboarding.confidenceLevel.title')}
      subtitle={t('onboarding.confidenceLevel.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {confidenceOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localConfidenceLevel === option.level;
          
          return (
            <TouchableOpacity
              key={option.level}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                { marginBottom: 16 }
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
              
              <View style={[options.optionTextContainer, { flex: 1 }]}>
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

      <View style={scaleContainerStyle}>
        <View style={scaleBarStyle}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View 
              key={level} 
              style={[
                scalePointStyle,
                level <= localConfidenceLevel ? activeScalePointStyle : {}
              ]} 
            />
          ))}
        </View>
        <View style={scaleLabelsStyle}>
          <Text style={[typography.caption, { color: palette.text.secondary }]}>
            {t('onboarding.confidenceLevel.low')}
          </Text>
          <Text style={[typography.caption, { color: palette.text.secondary }]}>
            {t('onboarding.confidenceLevel.high')}
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default ConfidenceLevelScreen;

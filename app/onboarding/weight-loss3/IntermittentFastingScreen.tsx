import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface IntermittentFastingScreenProps {
  onContinue: () => void;
  onBack: () => void;
  useIntermittentFasting: boolean | null;
  onUseIntermittentFastingChange: (use: boolean) => void;
}

const IntermittentFastingScreen: React.FC<IntermittentFastingScreenProps> = ({ 
  onContinue, 
  onBack, 
  useIntermittentFasting,
  onUseIntermittentFastingChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localUseIntermittentFasting, setLocalUseIntermittentFasting] = React.useState<boolean | null>(useIntermittentFasting);
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalUseIntermittentFasting(useIntermittentFasting);
  }, [useIntermittentFasting]);
  
  // Используем хуки для динамических стилей
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Функция обработки выбора интервального голодания
  const handleIntermittentFastingSelect = (use: boolean) => {
    console.log('Выбрано интервальное голодание:', use ? 'Да' : 'Нет');
    // Обновляем локальное состояние немедленно
    setLocalUseIntermittentFasting(use);
    // Обновляем состояние в родительском компоненте
    onUseIntermittentFastingChange(use);
  };

  const fastingOptions = [
    { id: false, label: t('onboarding.intermittentFasting.options.skip'), icon: 'time-outline', recommended: true },
    { id: true, label: t('onboarding.intermittentFasting.options.add'), icon: 'calendar-outline' },
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.intermittentFasting.title')}
      subtitle={t('onboarding.intermittentFasting.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <Text style={[typography.screenSubtitle, { marginTop: 8, marginBottom: 16 }]}>
        Перед началом интервального голодания рекомендуется проконсультироваться с врачом.
      </Text>

      <View style={{ marginTop: 20 }}>
        {fastingOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localUseIntermittentFasting === option.id;
          
          return (
            <TouchableOpacity
              key={String(option.id)}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                option.recommended && { borderColor: palette.success, borderWidth: 2 },
                { marginBottom: 16 }
              ]}
              onPress={() => handleIntermittentFastingSelect(option.id)}
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
                {option.recommended && (
                  <Text style={[typography.caption, { color: palette.success, marginTop: 4 }]}>
                    Рекомендуется
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

export default IntermittentFastingScreen;

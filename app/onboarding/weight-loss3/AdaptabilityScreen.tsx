import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { adaptability as adaptabilityStyles, options, typography, usePalette } from './unifiedStyles';

interface AdaptabilityScreenProps {
  onContinue: () => void;
  onBack: () => void;
  adaptability: string | null;
  onAdaptabilityChange: (adaptability: string) => void;
}

const AdaptabilityScreen: React.FC<AdaptabilityScreenProps> = ({ 
  onContinue, 
  onBack, 
  adaptability,
  onAdaptabilityChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localAdaptability, setLocalAdaptability] = React.useState<string | null>(adaptability || 'adapt-time');
  
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalAdaptability(adaptability);
  }, [adaptability]);
  
  // Функция обработки выбора адаптивности
  const handleAdaptabilitySelect = (adapt: string) => {
    console.log('Выбрана адаптивность:', adapt);
    // Обновляем локальное состояние немедленно
    setLocalAdaptability(adapt);
    // Обновляем состояние в родительском компоненте
    onAdaptabilityChange(adapt);
  };

  const adaptabilityOptions = [
    { 
      id: 'embrace-quickly', 
      label: t('onboarding.adaptability.options.embraceQuickly.label'),
      description: t('onboarding.adaptability.options.embraceQuickly.description'),
      icon: 'flash-outline'
    },
    { 
      id: 'adapt-time', 
      label: t('onboarding.adaptability.options.adaptTime.label'),
      description: t('onboarding.adaptability.options.adaptTime.description'),
      icon: 'time-outline'
    },
    { 
      id: 'struggle-try', 
      label: t('onboarding.adaptability.options.struggleTry.label'),
      description: t('onboarding.adaptability.options.struggleTry.description'),
      icon: 'trending-up-outline'
    },
    { 
      id: 'find-overwhelming', 
      label: t('onboarding.adaptability.options.findOverwhelming.label'),
      description: t('onboarding.adaptability.options.findOverwhelming.description'),
      icon: 'alert-outline'
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.adaptability.title')}
      subtitle={t('onboarding.adaptability.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={adaptabilityStyles.optionsContainer}>
        {adaptabilityOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localAdaptability === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                adaptabilityStyles.adaptabilityOption
              ]}
              onPress={() => handleAdaptabilitySelect(option.id)}
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
              
              <View style={[options.optionTextContainer, adaptabilityStyles.adaptabilityTextContainer]}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
                <Text style={adaptabilityStyles.descriptionText}>
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

export default AdaptabilityScreen;

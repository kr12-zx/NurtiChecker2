import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { medication as medicationStyles, options, typography, usePalette } from './unifiedStyles';

interface MedicationScreenProps {
  onContinue: () => void;
  onBack: () => void;
  medication: string | null;
  onMedicationChange: (medication: string) => void;
}

const MedicationScreen: React.FC<MedicationScreenProps> = ({ 
  onContinue, 
  onBack, 
  medication,
  onMedicationChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localMedication, setLocalMedication] = React.useState<string | null>(medication || 'not-using');
  const { t } = useTranslation();
  
  // Получаем палитру цветов
  const palette = usePalette();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalMedication(medication);
  }, [medication]);
  
  // Функция обработки выбора лекарства
  const handleMedicationSelect = (med: string) => {
    console.log('Выбрано лекарство/добавка:', med);
    // Обновляем локальное состояние немедленно
    setLocalMedication(med);
    // Обновляем состояние в родительском компоненте
    onMedicationChange(med);
  };

  const medicationOptions = [
    { 
      id: 'appetite-reducer', 
      label: t('onboarding.medication.options.prescription'),
      description: t('onboarding.medication.descriptions.prescription'),
      icon: 'fitness-outline'
    },
    { 
      id: 'fat-absorption', 
      label: t('onboarding.medication.options.overTheCounter'),
      description: t('onboarding.medication.descriptions.overTheCounter'),
      icon: 'water-outline'
    },
    { 
      id: 'supplements', 
      label: t('onboarding.medication.options.supplements'),
      description: t('onboarding.medication.descriptions.supplements'),
      icon: 'leaf-outline'
    },
    { 
      id: 'interested', 
      label: t('onboarding.medication.options.herbal'),
      description: t('onboarding.medication.descriptions.herbal'),
      icon: 'help-circle-outline'
    },
    { 
      id: 'not-using', 
      label: t('onboarding.medication.options.notUsing'),
      description: t('onboarding.medication.descriptions.notUsing'),
      icon: 'close-circle-outline'
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.medication.title')}
      subtitle={t('onboarding.medication.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={medicationStyles.optionsContainer}>
        {medicationOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localMedication === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption,
                medicationStyles.medicationOption
              ]}
              onPress={() => handleMedicationSelect(option.id)}
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
              
              <View style={[options.optionTextContainer, medicationStyles.medicationTextContainer]}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
                <Text style={medicationStyles.descriptionText}>
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
      
      <Text style={medicationStyles.disclaimerText}>
        {t('onboarding.medication.disclaimer')}
      </Text>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default MedicationScreen;

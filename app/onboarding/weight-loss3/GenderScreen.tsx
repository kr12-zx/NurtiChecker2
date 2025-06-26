import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { Gender } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { useContainerStyles, useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface GenderScreenProps {
  onContinue: () => void;
  onBack: () => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
}

const GenderScreen: React.FC<GenderScreenProps> = ({ 
  onContinue, 
  onBack, 
  gender,
  onGenderChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localGender, setLocalGender] = React.useState<Gender>(gender);
  
  // Используем хуки для получения динамических стилей в зависимости от текущей темы
  const palette = usePalette();
  const containers = useContainerStyles();
  const optionsStyles = useOptionsStyles();
  const typography = useTypographyStyles();
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalGender(gender);
  }, [gender]);
  
  // Функция обработки выбора пола
  const handleGenderSelect = (selectedGender: Gender) => {
    console.log('Выбран пол:', selectedGender);
    // Обновляем локальное состояние немедленно
    setLocalGender(selectedGender);
    // Обновляем состояние в родительском компоненте
    onGenderChange(selectedGender);
  };

  const genderOptions: {id: Gender; label: string; icon: string}[] = [
    { id: 'male', label: t('onboarding.gender.options.male'), icon: 'male' },
    { id: 'female', label: t('onboarding.gender.options.female'), icon: 'female' },
    { id: 'non-binary', label: t('onboarding.gender.options.nonBinary'), icon: 'people' },
    { id: 'prefer-not-to-say', label: t('onboarding.gender.options.preferNotToSay'), icon: 'person' },
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.gender.title')}
      subtitle={t('onboarding.gender.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
      disableScrollView={true} // Отключаем ScrollView для избежания возможных конфликтов с виртуализированными списками
    >
      <View style={containers.optionsList}>
        {genderOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localGender === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                optionsStyles.optionContainer,
                isSelected ? optionsStyles.selectedOption : optionsStyles.unselectedOption
              ]}
              onPress={() => handleGenderSelect(option.id)}
              activeOpacity={0.5}
              // Увеличиваем область нажатия для лучшего отклика
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={optionsStyles.optionIconContainer}>
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={isSelected ? palette.primary : palette.text.secondary}
                />
              </View>
              
              <View style={optionsStyles.optionTextContainer}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
              </View>

              <View style={[
                optionsStyles.checkIconContainer,
                isSelected ? optionsStyles.selectedCheckIconContainer : optionsStyles.unselectedCheckIconContainer
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

export default GenderScreen;

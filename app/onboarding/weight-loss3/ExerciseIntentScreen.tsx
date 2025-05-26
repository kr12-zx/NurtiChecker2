import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { options, palette } from './unifiedStyles';

interface ExerciseIntentScreenProps {
  onContinue: () => void;
  onBack: () => void;
  exerciseIntent: boolean | null;
  onExerciseIntentChange: (intent: boolean) => void;
}

const ExerciseIntentScreen: React.FC<ExerciseIntentScreenProps> = ({ 
  onContinue, 
  onBack, 
  exerciseIntent,
  onExerciseIntentChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localExerciseIntent, setLocalExerciseIntent] = React.useState<boolean | null>(exerciseIntent);
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalExerciseIntent(exerciseIntent);
  }, [exerciseIntent]);
  
  // Функция обработки выбора намерения заниматься
  const handleExerciseIntentSelect = (intent: boolean) => {
    console.log('Выбрано намерение заниматься:', intent ? 'Да' : 'Нет');
    // Обновляем локальное состояние немедленно
    setLocalExerciseIntent(intent);
    // Обновляем состояние в родительском компоненте
    onExerciseIntentChange(intent);
  };

  const exerciseOptions = [
    { id: true, label: t('onboarding.exerciseIntent.options.yes'), icon: 'checkmark-circle' },
    { id: false, label: t('onboarding.exerciseIntent.options.no'), icon: 'close-circle' },
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.exerciseIntent.title')}
      subtitle={t('onboarding.exerciseIntent.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {exerciseOptions.map((option) => {
          // Используем локальное состояние для отображения выбранного варианта
          const isSelected = localExerciseIntent === option.id;
          
          return (
            <TouchableOpacity
              key={String(option.id)}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption
              ]}
              onPress={() => handleExerciseIntentSelect(option.id)}
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
                <Text style={{ fontSize: 18, fontWeight: '600', color: palette.text.primary, marginBottom: 4 }}>
                  {option.label}
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

export default ExerciseIntentScreen;

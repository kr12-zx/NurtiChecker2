import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import { MealFrequency } from '../../types/onboarding';
import ButtonFooter from './components/ButtonFooter';
import { containers, options, palette, typography } from './unifiedStyles';

interface MealFrequencyScreenProps {
  onContinue: () => void;
  onBack: () => void;
  mealFrequency: MealFrequency;
  onMealFrequencyChange: (frequency: MealFrequency) => void;
}

const MealFrequencyScreen: React.FC<MealFrequencyScreenProps> = ({ 
  onContinue, 
  onBack, 
  mealFrequency,
  onMealFrequencyChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localMealFrequency, setLocalMealFrequency] = React.useState<MealFrequency>(mealFrequency || '3-meals');
  const { t } = useTranslation();
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalMealFrequency(mealFrequency);
  }, [mealFrequency]);
  
  // Функция обработки выбора частоты приема пищи
  const handleMealFrequencySelect = (selectedFrequency: MealFrequency) => {
    console.log('Выбрана частота приема пищи:', selectedFrequency);
    // Обновляем локальное состояние немедленно
    setLocalMealFrequency(selectedFrequency);
    // Обновляем состояние в родительском компоненте
    onMealFrequencyChange(selectedFrequency);
  };
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const frequencyOptions: {id: MealFrequency; label: string; icon: string; description: string}[] = [
    { 
      id: '2-meals', 
      label: t('onboarding.mealFrequency.options.twoMeals.label'), 
      icon: 'timer-outline',
      description: t('onboarding.mealFrequency.options.twoMeals.description')
    },
    { 
      id: '3-meals', 
      label: t('onboarding.mealFrequency.options.threeMeals.label'), 
      icon: 'restaurant-outline',
      description: t('onboarding.mealFrequency.options.threeMeals.description')
    },
    { 
      id: '4-meals', 
      label: t('onboarding.mealFrequency.options.fourMeals.label'), 
      icon: 'fast-food-outline',
      description: t('onboarding.mealFrequency.options.fourMeals.description')
    },
    { 
      id: '5-meals', 
      label: t('onboarding.mealFrequency.options.fiveMeals.label'), 
      icon: 'cafe-outline',
      description: t('onboarding.mealFrequency.options.fiveMeals.description')
    },
    { 
      id: '6-meals', 
      label: t('onboarding.mealFrequency.options.sixMeals.label'), 
      icon: 'pizza-outline',
      description: t('onboarding.mealFrequency.options.sixMeals.description')
    },
    { 
      id: 'intermittent', 
      label: t('onboarding.mealFrequency.options.intermittent.label'), 
      icon: 'hourglass-outline',
      description: t('onboarding.mealFrequency.options.intermittent.description')
    }
  ];

  return (
    <SafeAreaView edges={["top"]} style={containers.safeArea}>
      <View style={containers.screen}>
        <ScrollView 
          style={containers.scrollView}
          contentContainerStyle={containers.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={typography.screenTitle}>{t('onboarding.mealFrequency.title')}</Text>
          
          <Text style={typography.screenSubtitle}>
            {t('onboarding.mealFrequency.subtitle')}
          </Text>

          <View style={containers.optionsList}>
            {frequencyOptions.map((option) => {
              // Используем локальное состояние для отображения выбранного варианта
              const isSelected = localMealFrequency === option.id;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    options.optionContainer,
                    isSelected ? options.selectedOption : options.unselectedOption
                  ]}
                  onPress={() => handleMealFrequencySelect(option.id)}
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
                    <Text style={typography.optionDescription}>
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
        </ScrollView>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue} 
          disableContinue={!localMealFrequency}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальные стили не требуются

export default MealFrequencyScreen;

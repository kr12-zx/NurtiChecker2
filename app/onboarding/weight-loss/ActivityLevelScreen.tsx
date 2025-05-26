import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { ActivityLevel } from '../../types/onboarding';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';
import { unifiedStyles } from './unifiedStyles';

interface ActivityLevelScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function ActivityLevelScreen({ onContinue, onBack }: ActivityLevelScreenProps) {
  // Удалили router, т.к. теперь навигация идет через пропсы
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { activityLevel, setActivityLevel, validateOnboardingStep } = useOnboardingStore();
  
  // Активируем кнопку Далее только если выбран уровень активности
  const [isNextEnabled, setIsNextEnabled] = useState(!!activityLevel);

  // Определяем уровни активности с описаниями и outline иконками
  const activityLevels: {id: ActivityLevel; label: string; description: string; icon: string}[] = [
    { 
      id: 'sedentary', 
      label: 'Малоподвижный', 
      description: 'Мало или совсем нет физической активности, сидячая работа',
      icon: 'body-outline' 
    },
    { 
      id: 'lightly-active', 
      label: 'Немного активный', 
      description: 'Легкие упражнения или прогулки 1-3 раза в неделю',
      icon: 'walk-outline' 
    },
    { 
      id: 'moderately-active', 
      label: 'Умеренно активный', 
      description: 'Умеренная активность 3-5 раз в неделю',
      icon: 'bicycle-outline' 
    },
    { 
      id: 'very-active', 
      label: 'Очень активный', 
      description: 'Интенсивные тренировки 6-7 раз в неделю',
      icon: 'fitness-outline' 
    },
    { 
      id: 'extremely-active', 
      label: 'Экстремально активный', 
      description: 'Профессиональный спорт или физическая работа ежедневно',
      icon: 'barbell-outline' 
    },
  ];
  
  // Цвета из дизайн-системы
  const lightThemeColors = {
    accent: '#007AFF',
    secondaryText: '#666666',
    iconSelectedBg: '#FFFFFF', // Цвет иконки на фоне цвета акцента
  };

  const darkThemeColors = {
    accent: '#0A84FF',
    secondaryText: '#A0A0A0',
    iconSelectedBg: '#FFFFFF', // Цвет иконки на фоне цвета акцента
  };

  const currentThemeColors = isDark ? darkThemeColors : lightThemeColors;

  // Обработчик выбора уровня активности
  const onActivityLevelChange = (newLevel: ActivityLevel) => {
    setActivityLevel(newLevel);
    setIsNextEnabled(true);
  };
  
  // Переход на следующий экран
  const handleNext = () => {
    if (validateOnboardingStep('activityLevel')) {
      onContinue();
    }
  };

  return (
    <View style={[unifiedStyles.container, isDark && unifiedStyles.darkContainer]}>
      <Text style={[unifiedStyles.title, isDark && unifiedStyles.darkTitle]}>Укажите уровень вашей физической активности</Text>
      
      <Text style={[unifiedStyles.subtitle, isDark && unifiedStyles.darkSubtitle]}>
        Это поможет нам точнее рассчитать ваши ежедневные энергозатраты
      </Text>

      <View style={unifiedStyles.optionsContainer}>
        {activityLevels.map((option) => {
          const isSelected = activityLevel === option.id;
          const iconColor = isSelected ? currentThemeColors.iconSelectedBg : currentThemeColors.secondaryText;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                unifiedStyles.optionButton,
                isSelected && unifiedStyles.selectedOption
              ]}
              onPress={() => onActivityLevelChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={[
                unifiedStyles.iconWrapper,
                isSelected && unifiedStyles.selectedIconWrapper
              ]}>
                <Ionicons
                  name={option.icon as any}
                  size={20} // Размер иконки согласно дизайн-системе (20-24px)
                  color={iconColor}
                />
              </View>
              
              <View style={unifiedStyles.textContainer}>
                <Text 
                  style={[
                    unifiedStyles.optionLabel,
                    isSelected && unifiedStyles.selectedLabel
                  ]}
                >
                  {option.label}
                </Text>
                
                <Text 
                  style={[
                    unifiedStyles.optionDescription,
                    isSelected && unifiedStyles.selectedDescription
                  ]}
                  numberOfLines={1} // Ensure description fits well
                >
                  {option.description}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[unifiedStyles.radioWrapper, isSelected && unifiedStyles.radioWrapperSelected]}
                onPress={() => onActivityLevelChange(option.id)} // Дополнительный onPress
              >
                {isSelected && <Ionicons name="checkmark-circle" size={16} color={currentThemeColors.accent} />}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      <OnboardingNavButtons 
        onContinue={handleNext} 
        onBack={onBack} 
        continueText="Далее"
      />
    </View>
  );
}

// Локальные стили больше не нужны, так как используем унифицированные стили
const styles = StyleSheet.create({});

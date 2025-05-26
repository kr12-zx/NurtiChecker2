import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';
import { unifiedStyles } from './unifiedStyles';

interface WeightLossRateScreenProps {
  onContinue: () => void;
  onBack: () => void;
  weightLossRate: number; // в кг/неделю
  onWeightLossRateChange: (rate: number) => void;
}

const WeightLossRateScreen: React.FC<WeightLossRateScreenProps> = ({ 
  onContinue, 
  onBack, 
  weightLossRate,
  onWeightLossRateChange
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Варианты темпа снижения веса
  const rateOptions = [
    { 
      id: 0.25, 
      label: '0.25 кг в неделю', 
      description: 'Медленное, но устойчивое снижение веса', 
      icon: 'leaf-outline', 
      recommendation: 'Рекомендуется для долгосрочных целей'
    },
    { 
      id: 0.5, 
      label: '0.5 кг в неделю', 
      description: 'Умеренное снижение веса, подходит большинству людей', 
      icon: 'bicycle-outline',
      recommendation: 'Оптимальный выбор для большинства'
    },
    { 
      id: 0.75, 
      label: '0.75 кг в неделю', 
      description: 'Более быстрое снижение веса', 
      icon: 'car-outline',
      recommendation: 'Требует больше дисциплины'
    },
    { 
      id: 1, 
      label: '1 кг в неделю', 
      description: 'Максимально рекомендуемый темп снижения веса', 
      icon: 'rocket-outline',
      recommendation: 'Для тех, кто имеет значительный излишек веса'
    },
  ];

  // Цвета из дизайн-системы
  const lightThemeColors = {
    accent: '#007AFF',
    secondaryText: '#666666',
    iconSelectedBg: '#FFFFFF', 
  };

  const darkThemeColors = {
    accent: '#0A84FF',
    secondaryText: '#A0A0A0',
    iconSelectedBg: '#FFFFFF', 
  };

  const currentThemeColors = isDark ? darkThemeColors : lightThemeColors;

  // Расчет примерного времени достижения цели (в неделях)
  const calculateWeeksToGoal = (rate: number): number => {
    // Заглушка, предполагаем, что эти данные будут доступны в реальном приложении
    const goalWeightDiff = 5; // Разница между текущим и целевым весом в кг
    return Math.ceil(goalWeightDiff / rate);
  };

  // Форматирование времени в читаемый вид
  const formatTimeToGoal = (weeks: number): string => {
    if (weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'неделя' : weeks < 5 ? 'недели' : 'недель'}`;
    } else {
      const months = Math.floor(weeks / 4);
      const remainingWeeks = weeks % 4;
      let result = `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`;
      if (remainingWeeks > 0) {
        result += ` и ${remainingWeeks} ${remainingWeeks === 1 ? 'неделя' : remainingWeeks < 5 ? 'недели' : 'недель'}`;
      }
      return result;
    }
  };

  return (
    <View style={[unifiedStyles.container, isDark && unifiedStyles.darkContainer]}>
      <Text style={[unifiedStyles.title, isDark && unifiedStyles.darkTitle]}>Выберите темп снижения веса</Text>
      
      <Text style={[unifiedStyles.subtitle, isDark && unifiedStyles.darkSubtitle]}>
        Выберите комфортный для вас темп снижения веса. Помните, что устойчивое, постепенное снижение веса
        более эффективно в долгосрочной перспективе.
      </Text>

      <View style={unifiedStyles.optionsContainer}>
        {rateOptions.map((option) => {
          const isSelected = weightLossRate === option.id;
          const iconColor = isSelected ? currentThemeColors.iconSelectedBg : currentThemeColors.secondaryText;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                unifiedStyles.optionButton,
                isSelected && unifiedStyles.selectedOption
              ]}
              onPress={() => onWeightLossRateChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={[
                unifiedStyles.iconWrapper, 
                isSelected && unifiedStyles.selectedIconWrapper
              ]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
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
                  numberOfLines={1} 
                >
                  {option.description}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[unifiedStyles.radioWrapper, isSelected && unifiedStyles.radioWrapperSelected]}
                onPress={() => onWeightLossRateChange(option.id)} 
              >
                {isSelected && <Ionicons name="checkmark-circle" size={16} color={currentThemeColors.accent} />}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      <OnboardingNavButtons
        onContinue={onContinue}
        onBack={onBack}
      />
    </View>
  );
};

// Локальные стили больше не нужны, так как используем унифицированные стили
const styles = StyleSheet.create({});

export default WeightLossRateScreen;

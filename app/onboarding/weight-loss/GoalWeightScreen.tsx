import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SimplePicker from '../../../components/SimplePicker';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';

interface GoalWeightScreenProps {
  onContinue: () => void;
  onBack: () => void;
  currentWeight: number; // в кг
  goalWeight: number; // в кг
  onGoalWeightChange: (weight: number) => void;
  units: 'kg' | 'lb';
}

const GoalWeightScreen: React.FC<GoalWeightScreenProps> = ({ 
  onContinue, 
  onBack, 
  currentWeight,
  goalWeight,
  onGoalWeightChange,
  units
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Генерация значений для выбора целевого веса (должен быть меньше текущего)
  const generateWeightValues = () => {
    // Минимальное допустимое значение веса (минимальный ИМТ 18.5 для роста 160 см)
    const minWeight = 45;
    // Максимальное значение = текущий вес (нельзя выбрать целевой вес больше текущего)
    const maxWeight = Math.max(currentWeight - 1, minWeight); // минимум на 1 кг меньше текущего

    if (units === 'kg') {
      // от minWeight до maxWeight в кг
      return Array.from({ length: maxWeight - minWeight + 1 }, (_, i) => {
        const value = minWeight + i;
        return `${value} кг`;
      });
    } else {
      // то же самое в фунтах
      const minLbs = Math.round(minWeight * 2.20462);
      const maxLbs = Math.round(maxWeight * 2.20462);
      return Array.from({ length: maxLbs - minLbs + 1 }, (_, i) => {
        const value = minLbs + i;
        return `${value} lb`;
      });
    }
  };

  const weightValues = generateWeightValues();

  // Конвертация между единицами измерения
  const kgToLb = (kg: number): number => {
    return Math.round(kg * 2.20462);
  };

  const lbToKg = (lb: number): number => {
    return Math.round(lb / 2.20462);
  };

  // Получаем целевой вес в правильных единицах и формате для отображения
  const getGoalDisplayValue = (): string => {
    if (units === 'kg') {
      return `${goalWeight} кг`;
    } else {
      return `${kgToLb(goalWeight)} lb`;
    }
  };

  // Расчет рекомендуемого веса на основе текущего (обычно 5-10% от текущего)
  const getRecommendedWeight = (): number => {
    // Целевой вес = текущий минус 10%
    return Math.round(currentWeight * 0.9);
  };

  // Расчет потери веса
  const getWeightLossAmount = (): string => {
    const loss = currentWeight - goalWeight;
    if (units === 'kg') {
      return `${loss} кг`;
    } else {
      return `${kgToLb(loss)} lb`;
    }
  };

  // Обработчик изменения веса
  const handleWeightChange = (value: string | number) => {
    if (typeof value === 'string') {
      // Извлекаем числовое значение из строки (например, "70 кг" -> 70)
      const numericValue = parseInt(value.split(' ')[0]);
      
      if (!isNaN(numericValue)) {
        if (units === 'kg') {
          onGoalWeightChange(numericValue);
        } else {
          // Если значение в фунтах, конвертируем в кг для сохранения
          onGoalWeightChange(lbToKg(numericValue));
        }
      }
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkTextPrimary]}>Какой вес вы хотите достичь?</Text>

      <View style={styles.pickerContainer}>
        {/* TODO: SimplePicker needs to be updated to support dark mode (e.g., accept an isDark prop) 
            and adjust its internal text/background colors based on the design system. */}
        <SimplePicker
          values={weightValues}
          selectedValue={getGoalDisplayValue()}
          onChange={handleWeightChange}
          pickerWidth={120}
          pickerHeight={200}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.darkTextSecondary]}>
            Текущий вес
          </Text>
          <Text style={[styles.statValue, isDark && styles.darkTextPrimary]}>
            {units === 'kg' ? `${currentWeight} кг` : `${kgToLb(currentWeight)} lb`}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.darkTextSecondary]}>
            Цель потери
          </Text>
          <Text style={[styles.statValue, isDark && styles.darkTextPrimary]}>
            {getWeightLossAmount()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.infoText, isDark && styles.darkTextSecondary]}>
        Рекомендуемый целевой вес для достижения устойчивых и здоровых результатов:
        {units === 'kg' ? ` ${getRecommendedWeight()} кг` : ` ${kgToLb(getRecommendedWeight())} lb`}
      </Text>

      <OnboardingNavButtons
        onContinue={onContinue}
        onBack={onBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24, // Design system spacing
    backgroundColor: '#FFFFFF', // Светлая тема фон
  },
  darkContainer: {
    backgroundColor: '#121212', // Темная тема фон
  },
  title: { // H1 Onboarding
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24, // Spacing
    textAlign: 'center',
    color: '#333333', // Светлая тема основной текст
  },
  darkTextPrimary: {
    color: '#F5F5F5', // Темная тема основной текст
  },
  pickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginBottom: 24, // Spacing
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute space evenly
    width: '100%',
    // paddingHorizontal: 0, // Removed, as main container has padding
    marginBottom: 24, // Spacing
  },
  statItem: {
    alignItems: 'center',
    flex: 1, // Ensure items take up equal space if needed, or adjust width
  },
  statLabel: { // Body 2 or similar for labels
    fontSize: 13,
    fontWeight: '400', // Regular
    color: '#666666', // Светлая тема вторичный текст
    marginBottom: 4, 
  },
  statValue: { // Subtitle 1 or similar for values
    fontSize: 17,
    fontWeight: '600', // Semibold
    color: '#333333', // Светлая тема основной текст
  },
  infoText: { // Body 2 style
    fontSize: 13,
    fontWeight: '400', // Regular
    textAlign: 'center',
    marginBottom: 32, // Spacing before nav buttons
    paddingHorizontal: 20, // Adjusted padding
    color: '#666666', // Светлая тема вторичный текст
  },
  darkTextSecondary: {
    color: '#A0A0A0', // Темная тема вторичный текст
  },
});

export default GoalWeightScreen;

import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { calorieBudget, usePalette } from './unifiedStyles';

interface CalorieBudgetInfoScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile?: {
    gender: 'male' | 'female';
    age: number;
    weight: number; // в кг
    height: number; // в см
    activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
  };
}

const CalorieBudgetInfoScreen: React.FC<CalorieBudgetInfoScreenProps> = ({ 
  onContinue, 
  onBack,
  userProfile
}) => {
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Расчет BMR по формуле Mifflin-St Jeor (более точная, чем Harris-Benedict)
  const calculateBMR = () => {
    if (!userProfile) return 2000; // fallback для совместимости
    
    const { gender, age, weight, height } = userProfile;
    
    // Формула Mifflin-St Jeor
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Учитываем уровень активности (TDEE)
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extra-active': 1.9
    };
    
    const tdee = bmr * (activityMultipliers[userProfile.activityLevel] || 1.375);
    
    // Безопасный дефицит для снижения веса (500 ккал = ~0.5 кг в неделю)
    const targetCalories = Math.max(
      tdee - 500, // дефицит 500 ккал
      gender === 'male' ? 1500 : 1200 // минимальные безопасные значения
    );
    
    return Math.round(targetCalories);
  };
  
  const calculatedCalories = calculateBMR();
  
  // Этапы расчета калорийного бюджета
  const calorieSteps = [
    {
      icon: 'calculator-outline',
      title: t('onboarding.calorieBudgetInfo.steps.bmr'),
      description: t('onboarding.calorieBudgetInfo.bmrDescription')
    },
    {
      icon: 'walk-outline',
      title: t('onboarding.calorieBudgetInfo.steps.activity'),
      description: t('onboarding.calorieBudgetInfo.activityDescription')
    },
    {
      icon: 'trending-down-outline',
      title: t('onboarding.calorieBudgetInfo.steps.deficit'),
      description: t('onboarding.calorieBudgetInfo.deficitDescription')
    },
    {
      icon: 'shield-checkmark-outline',
      title: t('onboarding.calorieBudgetInfo.steps.result'),
      description: userProfile?.gender === 'male' 
        ? t('onboarding.calorieBudgetInfo.limitMale')
        : t('onboarding.calorieBudgetInfo.limitFemale')
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.calorieBudgetInfo.title', { calories: calculatedCalories })}
      subtitle={t('onboarding.calorieBudgetInfo.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={calorieBudget.stepsContainer}>
        {calorieSteps.map((step, index) => (
          <View key={index} style={calorieBudget.stepItem}>
            <View style={calorieBudget.stepTextContainer}>
              <Text style={calorieBudget.stepTitle}>{step.title}</Text>
              <Text style={calorieBudget.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={calorieBudget.calorieContainer}>
        <Text style={calorieBudget.calorieLabel}>{t('onboarding.calorieBudgetInfo.dailyBudgetLabel')}</Text>
        <Text style={calorieBudget.calorieValue}>{calculatedCalories} {t('common.kcal')}</Text>
        <Text style={calorieBudget.calorieNote}>
          {t('onboarding.calorieBudgetInfo.budgetNote', { calories: calculatedCalories })}
        </Text>
      </View>
      
      <View style={calorieBudget.noteContainer}>
        <Text style={calorieBudget.noteText}>
          {t('onboarding.calorieBudgetInfo.adjustmentNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default CalorieBudgetInfoScreen;

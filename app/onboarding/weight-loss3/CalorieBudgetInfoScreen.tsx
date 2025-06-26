import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { calculateCompleteNutrition } from '../../../utils/nutritionCalculator';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, usePalette } from './unifiedStyles';

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
  fullUserProfile?: any; // Полный профиль пользователя для точного расчета
}

const CalorieBudgetInfoScreen: React.FC<CalorieBudgetInfoScreenProps> = ({ 
  onContinue, 
  onBack,
  userProfile,
  fullUserProfile
}) => {
  // Получаем палитру цветов
  const palette = usePalette();
  const cardStyles = useCardStyles();
  const { t } = useTranslation();
  
  // Используем правильную логику в зависимости от доступных данных
  const calculateCalories = () => {
    // Проверяем, есть ли у нас достаточно данных для полного калькулятора
    const hasCompleteData = fullUserProfile && 
                           fullUserProfile.activityLevel && 
                           fullUserProfile.stressResponse &&
                           fullUserProfile.dietPreference;
    
    if (hasCompleteData) {
      try {
        // Используем полный калькулятор только если есть все данные
        const profileForCalculation = {
          ...fullUserProfile,
          currentWeight: fullUserProfile.weight || fullUserProfile.currentWeight,
          // Базовые значения для первичного расчета
          primaryGoal: fullUserProfile.primaryGoal || 'lose-weight',
          activityLevel: fullUserProfile.activityLevel || 'lightly-active',
          dietPreference: fullUserProfile.dietPreference || 'standard',
          weightLossRate: fullUserProfile.weightLossRate || 0.25,
          weightLossPlan: fullUserProfile.weightLossPlan || 'steady',
          exerciseIntent: fullUserProfile.exerciseIntent || false,
          nutritionFocus: fullUserProfile.nutritionFocus || 'balanced',
          mealFrequency: fullUserProfile.mealFrequency || '3-meals',
          intermittentFasting: fullUserProfile.intermittentFasting || false,
          confidenceLevel: fullUserProfile.confidenceLevel || 3,
          stressResponse: fullUserProfile.stressResponse || 'exercise',
          temptationResponse: fullUserProfile.temptationResponse || 'usually-control',
          medicationUse: fullUserProfile.medicationUse || 'not-using'
        };
        
        console.log('🧮 CalorieBudgetInfoScreen: calculation via full calculator (all data available):', profileForCalculation);
        
        const nutrition = calculateCompleteNutrition(profileForCalculation);
        console.log('📊 CalorieBudgetInfoScreen: full calculation result:', nutrition.targetCalories, 'kcal');
        
        return nutrition.targetCalories;
      } catch (error) {
        console.error('❌ Full calculation error, using simple:', error);
        // Fallback к простому расчету
        const simpleCalories = calculateSimpleCalories();
        return simpleCalories;
      }
    }
    
    // На раннем этапе используем простой расчет
    console.log('📝 CalorieBudgetInfoScreen: using simple calculation (insufficient data for full)');
    return calculateSimpleCalories();
  };
  
  // Fallback: простой расчет как раньше (только для случаев ошибки)
  const calculateSimpleCalories = () => {
    if (!userProfile) return 2000; // fallback для совместимости
    
    const { gender, age, weight, height, activityLevel } = userProfile;
    
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
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.375);
    
    // Безопасный дефицит для снижения веса (соответствует выбранной скорости 0.25 кг/неделю)
    const weightLossRate = fullUserProfile?.weightLossRate || 0.25; // Используем выбранную пользователем скорость
    const dailyDeficit = (weightLossRate * 7000) / 7; // 7000 ккал на кг жира
    
    const targetCalories = Math.max(
      tdee - dailyDeficit, // дефицит на основе выбранной скорости
      gender === 'male' ? 1500 : 1200 // минимальные безопасные значения
    );
    
    return Math.round(targetCalories);
  };
  
  const calculatedCalories = calculateCalories();
  
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

  const hasCompleteData = fullUserProfile && 
                         fullUserProfile.activityLevel && 
                         fullUserProfile.stressResponse &&
                         fullUserProfile.dietPreference;

  return (
    <OnboardingLayout
      title={t('onboarding.calorieBudgetInfo.title', { calories: calculatedCalories })}
      subtitle={t('onboarding.calorieBudgetInfo.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        {calorieSteps.map((step, index) => (
          <View key={index} style={cardStyles.section}>
            <Text style={cardStyles.infoTitle}>{step.title}</Text>
            <Text style={cardStyles.infoText}>{step.description}</Text>
          </View>
        ))}
      </View>
      
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <View style={cardStyles.budgetCard}>
          <Text style={[cardStyles.infoTitle, { textAlign: 'center' }]}>
            {t('onboarding.calorieBudgetInfo.dailyBudgetLabel')}
          </Text>
          <Text style={cardStyles.calorieValue}>{calculatedCalories} {t('common.kcal')}</Text>
          <Text style={cardStyles.infoText}>
            {t('onboarding.calorieBudgetInfo.budgetNote', { calories: calculatedCalories })}
          </Text>
          
          {/* Подпись о предварительных данных */}
          {!hasCompleteData && (
            <View style={{ marginTop: 12 }}>
              <Text style={[cardStyles.infoText, { fontSize: 12, fontStyle: 'italic', color: palette.text.secondary }]}>
                {t('onboarding.calorieBudgetInfo.preliminaryNote')}
              </Text>
              <Text style={[cardStyles.infoText, { fontSize: 11, color: palette.text.disabled, marginTop: 4 }]}>
                {t('onboarding.calorieBudgetInfo.willBeRefinedNote')}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={cardStyles.noteContainer}>
        <Text style={cardStyles.noteText}>
          {t('onboarding.calorieBudgetInfo.adjustmentNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default CalorieBudgetInfoScreen;

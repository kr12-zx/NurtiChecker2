import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import { calculateCompleteNutrition } from '../../../utils/nutritionCalculator';
import ButtonFooter from './components/ButtonFooter';
import { useContainerStyles, useOptionsStyles, usePalette, useSpecialOptionStyles, useTypographyStyles } from './unifiedStyles';

interface WeightLossPlanScreenProps {
  onContinue: () => void;
  onBack: () => void;
  weightLossPlan: string | null;
  onWeightLossPlanChange: (plan: string) => void;
  onCalorieSelectionChange?: (calories: number) => void;
  userProfile?: {
    gender: 'male' | 'female';
    age: number;
    weight: number; // в кг
    height: number; // в см
    activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
  };
  fullUserProfile?: any; // Полный профиль пользователя для точного расчета
}

const WeightLossPlanScreen: React.FC<WeightLossPlanScreenProps> = ({ 
  onContinue, 
  onBack, 
  weightLossPlan,
  onWeightLossPlanChange,
  onCalorieSelectionChange,
  userProfile,
  fullUserProfile
}) => {
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const containers = useContainerStyles();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  const palette = usePalette();
  const specialOptions = useSpecialOptionStyles();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localWeightLossPlan, setLocalWeightLossPlan] = React.useState<string | null>(weightLossPlan || 'steady');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalWeightLossPlan(weightLossPlan);
  }, [weightLossPlan]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Проверяем, есть ли у нас достаточно данных для полного калькулятора
  const hasCompleteData = fullUserProfile && 
                         fullUserProfile.activityLevel && 
                         fullUserProfile.stressResponse &&
                         fullUserProfile.dietPreference;
  
  // Функция для получения калорий через полный калькулятор (как на главном экране)
  const getCaloriesForPlan = (planType: string): number => {
    // Проверяем, есть ли у нас достаточно данных для полного калькулятора
    const hasCompleteData = fullUserProfile && 
                           fullUserProfile.activityLevel && 
                           fullUserProfile.stressResponse &&
                           fullUserProfile.dietPreference;
    
    if (hasCompleteData) {
      try {
        // Определяем скорость похудения для каждого плана (согласованно с CalorieBudgetInfoScreen)
        const weightLossRateForPlan = planType === 'steady' ? 0.25 : planType === 'moderate' ? 0.5 : 0.75; // Изменено: steady = 0.25
        
        // Создаем профиль с нужным планом похудения и скоростью
        const profileForPlan = {
          ...fullUserProfile,
          weightLossPlan: planType,
          weightLossRate: weightLossRateForPlan, // Используем скорость для конкретного плана
          currentWeight: fullUserProfile.weight || fullUserProfile.currentWeight
        };
        
        console.log(`🧮 WeightLossPlanScreen: full calculation for plan "${planType}" (rate: ${weightLossRateForPlan} kg/week):`, profileForPlan);
        
        const nutrition = calculateCompleteNutrition(profileForPlan);
        console.log(`📊 WeightLossPlanScreen: full calculation result for "${planType}":`, nutrition.targetCalories, 'kcal');
        
        return nutrition.targetCalories;
      } catch (error) {
        console.error(`❌ Full calculation error for plan ${planType}, using simple:`, error);
        return getSimpleCaloriesForPlan(planType);
      }
    }
    
    // На раннем этапе используем простой расчет
    console.log(`📝 WeightLossPlanScreen: simple calculation for plan "${planType}" (insufficient data for full)`);
    return getSimpleCaloriesForPlan(planType);
  };

  // Fallback: простой расчет как раньше
  const getSimpleCaloriesForPlan = (planType: string): number => {
    if (!userProfile) return 2000;
    
    const { gender, age, weight, height, activityLevel } = userProfile;
    
    // Формула Mifflin-St Jeor
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extra-active': 1.9
    };
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.375);
    const minCalories = gender === 'male' ? 1500 : 1200;

    // Определяем скорость похудения для каждого плана (согласованно с CalorieBudgetInfoScreen)
    let weightLossRate;
    if (planType === 'steady') {
      weightLossRate = 0.25; // Изменено: было 0.5, теперь 0.25 кг/неделю для согласованности
    } else if (planType === 'moderate') {
      weightLossRate = 0.5; // Изменено: было 0.75, теперь 0.5 кг/неделю
    } else {
      weightLossRate = 0.75; // Изменено: было 1.0, теперь 0.75 кг/неделю
    }
    
    // Рассчитываем дефицит на основе скорости
    const dailyDeficit = (weightLossRate * 7000) / 7; // 7000 ккал на кг жира
    
    return Math.max(Math.round(tdee - dailyDeficit), minCalories);
  };

  const planOptions = [
    { 
      id: 'steady', 
      label: t('onboarding.weightLossPlan.plans.steady.label'),
      description: t('onboarding.weightLossPlan.plans.steady.description'),
      calories: getCaloriesForPlan('steady'),
      weightLossPerWeek: 0.25,
      recommendedForYou: true,
      icon: 'trending-down-outline'
    },
    { 
      id: 'moderate', 
      label: t('onboarding.weightLossPlan.plans.moderate.label'),
      description: t('onboarding.weightLossPlan.plans.moderate.description'),
      calories: getCaloriesForPlan('moderate'),
      weightLossPerWeek: 0.5,
      recommendedForYou: false,
      icon: 'speedometer-outline'
    },
    { 
      id: 'aggressive', 
      label: t('onboarding.weightLossPlan.plans.aggressive.label'),
      description: t('onboarding.weightLossPlan.plans.aggressive.description'),
      calories: getCaloriesForPlan('aggressive'),
      weightLossPerWeek: 0.75,
      recommendedForYou: false,
      icon: 'flash-outline',
      disabled: getCaloriesForPlan('aggressive') <= 1500 // отключаем если калории слишком низкие
    }
  ];
  
  // Функция обработки выбора плана снижения веса
  const handlePlanSelect = (plan: string) => {
    console.log('Selected weight loss plan:', plan);
    // Обновляем локальное состояние немедленно
    setLocalWeightLossPlan(plan);
    // Обновляем состояние в родительском компоненте
    onWeightLossPlanChange(plan);
    
    // Передаем выбранные калории в родительский компонент
    const selectedOption = planOptions.find(option => option.id === plan);
    if (selectedOption && onCalorieSelectionChange) {
      console.log('Passing selected calories:', selectedOption.calories);
      onCalorieSelectionChange(selectedOption.calories);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      <View style={containers.rootContainer}>
        {/* Основной контент */}
        <View style={containers.contentContainer}>
          <ScrollView 
            style={containers.scrollView}
            contentContainerStyle={containers.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={typography.screenTitle}>
              {t('onboarding.weightLossPlan.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.weightLossPlan.subtitle')}
            </Text>
            
            {/* Подпись о предварительных данных */}
            {!hasCompleteData && (
              <View style={{ marginTop: 12, marginBottom: 8 }}>
                <Text style={[typography.screenSubtitle, { fontSize: 12, fontStyle: 'italic', color: palette.text.secondary }]}>
                  {t('onboarding.weightLossPlan.preliminaryNote')}
                </Text>
                <Text style={[typography.screenSubtitle, { fontSize: 11, color: palette.text.disabled, marginTop: 4 }]}>
                  {t('onboarding.weightLossPlan.refinementNote')}
                </Text>
              </View>
            )}

            <View style={[options.optionsList, { marginTop: 20 }]}>
              {planOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localWeightLossPlan === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      specialOptions.planOption,
                      option.recommendedForYou && specialOptions.recommendedOption,
                      option.disabled && { opacity: 0.5 }
                    ]}
                    onPress={() => !option.disabled && handlePlanSelect(option.id)}
                    activeOpacity={option.disabled ? 1 : 0.5}
                    disabled={option.disabled}
                    // Увеличиваем область нажатия для лучшего отклика
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {option.recommendedForYou && (
                      <View style={specialOptions.recommendedBadge}>
                        <Text style={specialOptions.recommendedBadgeText}>{t('onboarding.weightLossPlan.recommended')}</Text>
                      </View>
                    )}
                    
                    <View style={options.optionIconContainer}>
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={isSelected ? palette.primary : palette.text.secondary}
                      />
                    </View>
                    
                    <View style={[options.optionTextContainer, specialOptions.planTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={specialOptions.descriptionText}>
                        {option.description}
                      </Text>
                      
                      <View style={specialOptions.planDetails}>
                        <View style={specialOptions.planDetailItem}>
                          <Text style={specialOptions.planDetailLabel}>{t('onboarding.weightLossPlan.caloriesPerDay')}</Text>
                          <Text style={specialOptions.planDetailValue}>{option.calories}</Text>
                        </View>
                        <View style={specialOptions.planDetailItem}>
                          <Text style={specialOptions.planDetailLabel}>{t('onboarding.weightLossPlan.lossPerWeek')}</Text>
                          <Text style={specialOptions.planDetailValue}>{option.weightLossPerWeek} {t('onboarding.weightLossPlan.kg')}</Text>
                        </View>
                      </View>
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
            
            <Text style={specialOptions.disclaimerText}>
              {t('onboarding.weightLossPlan.disclaimer')}
            </Text>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue} 
          disableContinue={!localWeightLossPlan}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default WeightLossPlanScreen;

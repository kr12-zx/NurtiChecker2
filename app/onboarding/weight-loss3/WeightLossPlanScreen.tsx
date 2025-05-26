import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, options, palette, typography, weightLossPlan as weightLossPlanStyles } from './unifiedStyles';

interface WeightLossPlanScreenProps {
  onContinue: () => void;
  onBack: () => void;
  weightLossPlan: string | null;
  onWeightLossPlanChange: (plan: string) => void;
  userProfile?: {
    gender: 'male' | 'female';
    age: number;
    weight: number; // в кг
    height: number; // в см
    activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
  };
}

const WeightLossPlanScreen: React.FC<WeightLossPlanScreenProps> = ({ 
  onContinue, 
  onBack, 
  weightLossPlan,
  onWeightLossPlanChange,
  userProfile
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localWeightLossPlan, setLocalWeightLossPlan] = React.useState<string | null>(weightLossPlan || 'steady');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalWeightLossPlan(weightLossPlan);
  }, [weightLossPlan]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Функция обработки выбора плана снижения веса
  const handleWeightLossPlanSelect = (plan: string) => {
    console.log('Выбран план снижения веса:', plan);
    // Обновляем локальное состояние немедленно
    setLocalWeightLossPlan(plan);
    // Обновляем состояние в родительском компоненте
    onWeightLossPlanChange(plan);
  };

  // Расчет TDEE пользователя
  const calculateTDEE = () => {
    if (!userProfile) return 2000; // fallback
    
    const { gender, age, weight, height, activityLevel } = userProfile;
    
    // Формула Mifflin-St Jeor (более точная)
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Коэффициенты активности
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extra-active': 1.9
    };
    
    return bmr * (activityMultipliers[activityLevel] || 1.375);
  };
  
  const tdee = calculateTDEE();
  const minCalories = userProfile?.gender === 'male' ? 1500 : 1200;

  // Расчет калорий для каждого плана с безопасными ограничениями
  const steadyCalories = Math.max(Math.round(tdee - 500), minCalories); // 0.5 кг/неделю
  const moderateCalories = Math.max(Math.round(tdee - 750), minCalories); // 0.75 кг/неделю  
  const aggressiveCalories = Math.max(Math.round(tdee - 1000), minCalories); // 1 кг/неделю (только если TDEE достаточно высокий)

  const planOptions = [
    { 
      id: 'steady', 
      label: t('onboarding.weightLossPlan.plans.steady.label'),
      description: t('onboarding.weightLossPlan.plans.steady.description'),
      calories: steadyCalories,
      weightLossPerWeek: 0.5,
      recommendedForYou: true,
      icon: 'trending-down-outline'
    },
    { 
      id: 'moderate', 
      label: t('onboarding.weightLossPlan.plans.moderate.label'),
      description: t('onboarding.weightLossPlan.plans.moderate.description'),
      calories: moderateCalories,
      weightLossPerWeek: 0.75,
      recommendedForYou: false,
      icon: 'speedometer-outline'
    },
    { 
      id: 'aggressive', 
      label: t('onboarding.weightLossPlan.plans.aggressive.label'),
      description: tdee >= 2500 
        ? t('onboarding.weightLossPlan.plans.aggressive.descriptionAvailable')
        : t('onboarding.weightLossPlan.plans.aggressive.descriptionUnavailable'),
      calories: aggressiveCalories,
      weightLossPerWeek: 1.0,
      recommendedForYou: false,
      icon: 'flash-outline',
      disabled: tdee < 2500 // отключаем агрессивный план при низком TDEE
    }
  ];

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

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {planOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localWeightLossPlan === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      weightLossPlanStyles.planOption,
                      option.recommendedForYou && weightLossPlanStyles.recommendedOption,
                      option.disabled && { opacity: 0.5 }
                    ]}
                    onPress={() => !option.disabled && handleWeightLossPlanSelect(option.id)}
                    activeOpacity={option.disabled ? 1 : 0.5}
                    disabled={option.disabled}
                    // Увеличиваем область нажатия для лучшего отклика
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {option.recommendedForYou && (
                      <View style={weightLossPlanStyles.recommendedBadge}>
                        <Text style={weightLossPlanStyles.recommendedBadgeText}>{t('onboarding.weightLossPlan.recommended')}</Text>
                      </View>
                    )}
                    
                    <View style={options.optionIconContainer}>
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={isSelected ? palette.primary : palette.text.secondary}
                      />
                    </View>
                    
                    <View style={[options.optionTextContainer, weightLossPlanStyles.planTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={weightLossPlanStyles.descriptionText}>
                        {option.description}
                      </Text>
                      
                      <View style={weightLossPlanStyles.planDetails}>
                        <View style={weightLossPlanStyles.planDetailItem}>
                          <Text style={weightLossPlanStyles.planDetailLabel}>{t('onboarding.weightLossPlan.caloriesPerDay')}</Text>
                          <Text style={weightLossPlanStyles.planDetailValue}>{option.calories}</Text>
                        </View>
                        <View style={weightLossPlanStyles.planDetailItem}>
                          <Text style={weightLossPlanStyles.planDetailLabel}>{t('onboarding.weightLossPlan.lossPerWeek')}</Text>
                          <Text style={weightLossPlanStyles.planDetailValue}>{option.weightLossPerWeek} {t('onboarding.weightLossPlan.kg')}</Text>
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
            
            <Text style={weightLossPlanStyles.disclaimerText}>
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

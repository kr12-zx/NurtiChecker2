import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SimplePicker from '../../../components/SimplePicker';
import { useTranslation } from '../../../i18n/i18n';
import { PrimaryGoal, UnitSettings } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { goalSetting, options, typography, usePalette } from './unifiedStyles';

interface GoalSettingScreenProps {
  onContinue: () => void;
  onBack: () => void;
  primaryGoal: PrimaryGoal;
  onGoalChange: (goal: PrimaryGoal) => void;
  currentWeight: number;
  goalWeight: number;
  onGoalWeightChange: (weight: number) => void;
  weightLossRate: number;
  onWeightLossRateChange: (rate: number) => void;
  unitSettings: UnitSettings;
}

const GoalSettingScreen: React.FC<GoalSettingScreenProps> = ({ 
  onContinue, 
  onBack, 
  primaryGoal,
  onGoalChange,
  currentWeight,
  goalWeight,
  onGoalWeightChange,
  weightLossRate,
  onWeightLossRateChange,
  unitSettings
}) => {
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Локальное состояние для отображения значений
  const [localGoal, setLocalGoal] = useState<PrimaryGoal>(primaryGoal);
  const [localGoalWeight, setLocalGoalWeight] = useState<number>(goalWeight);
  const [localWeightLossRate, setLocalWeightLossRate] = useState<number>(weightLossRate);
  // Состояние для хранения расчетной даты достижения цели
  const [targetDate, setTargetDate] = useState<string | null>(null);
  
  // Обновляем локальное состояние при изменении пропсов
  useEffect(() => {
    setLocalGoal(primaryGoal);
  }, [primaryGoal]);
  
  useEffect(() => {
    setLocalGoalWeight(goalWeight);
  }, [goalWeight]);
  
  useEffect(() => {
    setLocalWeightLossRate(weightLossRate);
  }, [weightLossRate]);
  
  // Обновляем дату при изменении любого из параметров, влияющих на расчет
  useEffect(() => {
    // Используем localGoal вместо primaryGoal
    if (localGoal === 'lose-weight' && localWeightLossRate > 0) {
      const date = calculateTargetDate();
      setTargetDate(date);
    } else {
      setTargetDate(null);
    }
  }, [localGoalWeight, currentWeight, localWeightLossRate, localGoal]);
  
  // Активный шаг (выбор цели, целевого веса, скорости)
  const [activeStep, setActiveStep] = useState<'goal' | 'target' | 'rate'>('goal');
  
  // Функция обработки выбора цели
  const handleGoalSelect = (selectedGoal: PrimaryGoal) => {
    console.log('Выбрана цель:', selectedGoal);
    // Обновляем локальное состояние немедленно
    setLocalGoal(selectedGoal);
    // Обновляем состояние в родительском компоненте
    onGoalChange(selectedGoal);
    
    // Переходим к следующему шагу, если выбрано снижение веса
    if (selectedGoal === 'lose-weight') {
      setActiveStep('target');
    }
  };

  // Опции для выбора цели
  const goalOptions: {id: PrimaryGoal; label: string; icon: string; description: string}[] = [
    { 
      id: 'lose-weight', 
      label: t('onboarding.goalSetting.options.loseWeight.label'), 
      icon: 'trending-down', 
      description: t('onboarding.goalSetting.options.loseWeight.description')
    },
    { 
      id: 'maintain-weight', 
      label: t('onboarding.goalSetting.options.maintainWeight.label'), 
      icon: 'fitness', 
      description: t('onboarding.goalSetting.options.maintainWeight.description')
    },
    { 
      id: 'gain-muscle', 
      label: t('onboarding.goalSetting.options.gainMuscle.label'), 
      icon: 'trending-up', 
      description: t('onboarding.goalSetting.options.gainMuscle.description')
    },
    { 
      id: 'improve-health', 
      label: t('onboarding.goalSetting.options.improveHealth.label'), 
      icon: 'heart', 
      description: t('onboarding.goalSetting.options.improveHealth.description')
    },
    { 
      id: 'track-nutrition', 
      label: t('onboarding.goalSetting.options.trackNutrition.label'), 
      icon: 'nutrition', 
      description: t('onboarding.goalSetting.options.trackNutrition.description')
    },
  ];

  // Функции для конвертации между метрической и имперской системами
  const kgToLbs = (kg: number): number => {
    return Math.round(kg * 2.20462);
  };

  const lbsToKg = (lbs: number): number => {
    return Math.round(lbs / 2.20462);
  };

  // Генерация простых значений для выбора веса и скорости
  const generateSimpleWeightValues = () => {
    if (unitSettings.weight === 'kg') {
      // от 40 кг до 150 кг
      return Array.from({ length: 111 }, (_, i) => i + 40);
    } else {
      // от 88 фунтов до 330 фунтов
      return Array.from({ length: 243 }, (_, i) => i + 88);
    }
  };

  const generateSimpleRateValues = () => {
    if (unitSettings.weight === 'kg') {
      // от 0.25 до 1 кг в неделю с шагом 0.25
      return [0.25, 0.5, 0.75, 1];
    } else {
      // от 0.5 до 2 фунтов в неделю с шагом 0.5
      return [0.5, 1, 1.5, 2];
    }
  };
  
  // Функции для обновления значений
  const updateGoalWeight = (newWeight: number | string) => {
    console.log('Выбран целевой вес:', newWeight);
    const numericValue = typeof newWeight === 'number' ? newWeight : parseFloat(newWeight.toString());
    
    if (unitSettings.weight === 'kg') {
      setLocalGoalWeight(numericValue);
      onGoalWeightChange(numericValue);
    } else {
      const kgValue = lbsToKg(numericValue);
      setLocalGoalWeight(kgValue);
      onGoalWeightChange(kgValue);
    }
  };
  
  const updateWeightLossRate = (newRate: number | string) => {
    console.log('Выбрана скорость:', newRate);
    const numericValue = typeof newRate === 'number' ? newRate : parseFloat(newRate.toString());
    
    let newWeightLossRate;
    if (unitSettings.weight === 'kg') {
      newWeightLossRate = numericValue;
      setLocalWeightLossRate(newWeightLossRate);
      onWeightLossRateChange(newWeightLossRate);
    } else {
      newWeightLossRate = numericValue / 2.2; // Конвертируем фунты в кг
      setLocalWeightLossRate(newWeightLossRate);
      onWeightLossRateChange(newWeightLossRate);
    }
    
    // Сразу обновляем дату при изменении скорости (используем localGoal)
    if (localGoal === 'lose-weight' && newWeightLossRate > 0) {
      const date = calculateTargetDate(newWeightLossRate);
      setTargetDate(date);
    }
  };
  
  // Получаем отображаемые значения для крутилок
  const displayGoalWeight = unitSettings.weight === 'kg' ? localGoalWeight : kgToLbs(localGoalWeight);
  const displayWeightLossRate = unitSettings.weight === 'kg' ? localWeightLossRate : localWeightLossRate * 2.2;

  const simpleWeightValues = generateSimpleWeightValues();
  const simpleRateValues = generateSimpleRateValues();

  // Рассчитываем примерную дату достижения цели
  const calculateTargetDate = (rate?: number) => {
    // Используем localGoal вместо primaryGoal, так как локальное состояние обновляется быстрее
    if (localGoal !== 'lose-weight') {
      return null;
    }
    
    // Используем переданную скорость или текущую из состояния
    const currentRate = rate !== undefined ? rate : localWeightLossRate;
    if (currentRate === 0) {
      return null;
    }
    
    const currentDate = new Date();
    const weightToLose = currentWeight - localGoalWeight;
    
    if (weightToLose <= 0) {
      return null;
    }
    
    const weeksNeeded = weightToLose / currentRate;
    const daysNeeded = Math.ceil(weeksNeeded * 7);
    
    const calculatedDate = new Date(currentDate);
    calculatedDate.setDate(currentDate.getDate() + daysNeeded);
    
    return calculatedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Определяем заголовок и подзаголовок в зависимости от текущего шага
  const getTitle = () => {
    switch (activeStep) {
      case 'goal':
        return t('onboarding.goalSetting.title');
      case 'target':
        return t('onboarding.goalSetting.targetWeightTitle');
      case 'rate':
        return t('onboarding.goalSetting.rateTitle');
    }
  };

  const getSubtitle = () => {
    switch (activeStep) {
      case 'goal':
        return t('onboarding.goalSetting.subtitle');
      case 'target':
        return t('onboarding.goalSetting.targetWeightSubtitle', {
          weight: unitSettings.weight === 'kg' ? 
            `${currentWeight} ${t('onboarding.heightWeight.units.kg')}` : 
            `${kgToLbs(currentWeight)} ${t('onboarding.heightWeight.units.lb')}`
        });
      case 'rate':
        return t('onboarding.goalSetting.rateSubtitle');
    }
  };

  return (
    <OnboardingLayout
      title={getTitle()}
      subtitle={getSubtitle()}
      onContinue={onContinue}
      onBack={onBack}
      disableScrollView={activeStep === 'target' || activeStep === 'rate'} // Отключаем ScrollView когда используется SimplePicker
    >
      {activeStep === 'goal' && (
        <>
          <View style={goalSetting.optionsContainer}>
            {goalOptions.map((option) => {
              // Используем локальное состояние для отображения выбранного варианта
              const isSelected = localGoal === option.id;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    options.optionContainer,
                    isSelected ? options.selectedOption : options.unselectedOption
                  ]}
                  onPress={() => handleGoalSelect(option.id)}
                  activeOpacity={0.5}
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
                      <Ionicons name="checkmark" size={16} color={palette.text.white} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {primaryGoal === 'lose-weight' && (
            <TouchableOpacity 
              style={goalSetting.nextStepButton}
              onPress={() => setActiveStep('target')}
            >
              <Text style={[goalSetting.nextStepText, { color: palette.primary }]}>{t('onboarding.goalSetting.setTargetWeight')}</Text>
              <Ionicons name="arrow-forward" size={18} color={palette.primary} />
            </TouchableOpacity>
          )}
        </>
      )}

      {activeStep === 'target' && (
        <>
          <View style={goalSetting.pickerContainer}>
            <SimplePicker
              values={simpleWeightValues}
              selectedValue={displayGoalWeight}
              onChange={updateGoalWeight}
              pickerWidth={150}
              pickerHeight={200}
              formatValue={unitSettings.weight === 'kg' ? 
                (value) => `${value} кг` : 
                (value) => `${value} lb`}
            />
          </View>
          
          <View style={goalSetting.navigationButtons}>
            <TouchableOpacity 
              style={goalSetting.navigationButton}
              onPress={() => setActiveStep('goal')}
            >
              <Ionicons name="arrow-back" size={18} color={palette.primary} />
              <Text style={[goalSetting.nextStepText, { color: palette.primary }]}>{t('onboarding.goalSetting.backToGoal')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={goalSetting.navigationButton}
              onPress={() => setActiveStep('rate')}
            >
              <Text style={[goalSetting.nextStepText, { color: palette.primary }]}>{t('onboarding.goalSetting.weightLossSpeed')}</Text>
              <Ionicons name="arrow-forward" size={18} color={palette.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {activeStep === 'rate' && (
        <>
          <View style={goalSetting.pickerContainer}>
            <SimplePicker
              values={simpleRateValues}
              selectedValue={displayWeightLossRate}
              onChange={updateWeightLossRate}
              pickerWidth={150}
              pickerHeight={200}
              formatValue={unitSettings.weight === 'kg' ? 
                (value) => `${value} кг/нед` : 
                (value) => `${value} lb/нед`}
            />
          </View>
          

          {targetDate && (
            <View style={goalSetting.targetDateContainer}>
              <Text style={[goalSetting.targetDateLabel, { color: palette.text.secondary }]}>{t('onboarding.goalSetting.estimatedDate')}</Text>
              <Text style={[goalSetting.targetDate, { color: palette.text.primary }]}>{targetDate}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={goalSetting.nextStepButton}
            onPress={() => setActiveStep('target')}
          >
            <Ionicons name="arrow-back" size={18} color={palette.primary} />
            <Text style={[goalSetting.nextStepText, { color: palette.primary }]}>{t('onboarding.goalSetting.backToTargetWeight')}</Text>
          </TouchableOpacity>
        </>
      )}
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default GoalSettingScreen;

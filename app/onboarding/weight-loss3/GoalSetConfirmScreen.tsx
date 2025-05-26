import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { goalSetConfirm, palette } from './unifiedStyles';

interface GoalSetConfirmScreenProps {
  onContinue: () => void;
  onBack: () => void;
  currentWeight: number;
  goalWeight: number;
  weightUnits: string;
  primaryGoal: string;
}

const GoalSetConfirmScreen: React.FC<GoalSetConfirmScreenProps> = ({
  onContinue,
  onBack,
  currentWeight = 80,
  goalWeight = 70,
  weightUnits = 'кг',
  primaryGoal = 'lose-weight'
}) => {
  const { t } = useTranslation();
  
  // Определяем разницу в весе
  const weightDifference = Math.abs(currentWeight - goalWeight);
  
  // Получаем понятное название для основной цели
  const getPrimaryGoalName = () => {
    switch(primaryGoal) {
      case 'lose-weight': return t('onboarding.goalSetConfirm.goals.loseWeight');
      case 'improve-health': return t('onboarding.goalSetConfirm.goals.improveHealth');
      case 'gain-control': return t('onboarding.goalSetConfirm.goals.gainControl');
      case 'build-habits': return t('onboarding.goalSetConfirm.goals.buildHabits');
      case 'feel-confident': return t('onboarding.goalSetConfirm.goals.feelConfident');
      default: return t('onboarding.goalSetConfirm.goals.loseWeight');
    }
  };

  return (
    <OnboardingLayout
      title={t('onboarding.goalSetConfirm.title')}
      subtitle={t('onboarding.goalSetConfirm.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
            
            <View style={goalSetConfirm.programContainer}>
              <Text style={goalSetConfirm.programTitle}>{t('onboarding.welcome.program')}</Text>
              
              <View style={goalSetConfirm.programContent}>
                <View style={[goalSetConfirm.programItem, goalSetConfirm.activeItem]}>
                  <View style={goalSetConfirm.programIconContainer}>
                    <Ionicons name="trending-down-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={goalSetConfirm.programText}>
                    {t('onboarding.goalSetConfirm.weightReduction', { amount: weightDifference, units: weightUnits })}
                  </Text>
                  <View style={goalSetConfirm.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.primary} />
                  </View>
                </View>
                
                <View style={[goalSetConfirm.programItem, goalSetConfirm.activeItem]}>
                  <View style={goalSetConfirm.programIconContainer}>
                    <Ionicons name="scale-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={goalSetConfirm.programText}>
                    {t('onboarding.goalSetConfirm.targetWeight', { weight: goalWeight, units: weightUnits })}
                  </Text>
                  <View style={goalSetConfirm.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.primary} />
                  </View>
                </View>
                
                <View style={[goalSetConfirm.programItem, goalSetConfirm.inactiveItem]}>
                  <View style={goalSetConfirm.programIconContainer}>
                    <Ionicons name="calculator-outline" size={20} color={palette.text.disabled} />
                  </View>
                  <Text style={[goalSetConfirm.programText, goalSetConfirm.inactiveText]}>
                    {t('onboarding.goalSetConfirm.calorieBudget')}
                  </Text>
                </View>
                
                <View style={[goalSetConfirm.programItem, goalSetConfirm.inactiveItem]}>
                  <View style={goalSetConfirm.programIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color={palette.text.disabled} />
                  </View>
                  <Text style={[goalSetConfirm.programText, goalSetConfirm.inactiveText]}>
                    {t('onboarding.goalSetConfirm.calorieSchedule')}
                  </Text>
                </View>
                
                <View style={[goalSetConfirm.programItem, goalSetConfirm.inactiveItem]}>
                  <View style={goalSetConfirm.programIconContainer}>
                    <Ionicons name="nutrition-outline" size={20} color={palette.text.disabled} />
                  </View>
                  <Text style={[goalSetConfirm.programText, goalSetConfirm.inactiveText]}>
                    {t('onboarding.goalSetConfirm.nutritionStrategy')}
                  </Text>
                </View>
                
                <View style={[goalSetConfirm.programItem, goalSetConfirm.inactiveItem]}>
                  <View style={goalSetConfirm.programIconContainer}>
                    <Ionicons name="time-outline" size={20} color={palette.text.disabled} />
                  </View>
                  <Text style={[goalSetConfirm.programText, goalSetConfirm.inactiveText]}>
                    {t('onboarding.goalSetConfirm.intermittentFasting')}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={goalSetConfirm.goalInfoContainer}>
              <Text style={goalSetConfirm.goalInfoTitle}>{t('onboarding.goalSetConfirm.primaryGoal')}:</Text>
              <Text style={goalSetConfirm.goalInfoText}>{getPrimaryGoalName()}</Text>
              
              <Text style={goalSetConfirm.goalInfoHint}>
                {t('onboarding.goalSetConfirm.planMessage')}
              </Text>
            </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default GoalSetConfirmScreen;

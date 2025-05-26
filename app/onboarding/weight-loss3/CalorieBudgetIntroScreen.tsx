import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { calorieBudgetIntro, usePalette } from './unifiedStyles';

interface CalorieBudgetIntroScreenProps {
  onContinue: () => void;
  onBack: () => void;
  currentWeight?: number;
  goalWeight?: number;
  weightUnits?: string;
}

const CalorieBudgetIntroScreen: React.FC<CalorieBudgetIntroScreenProps> = ({
  onContinue,
  onBack,
  currentWeight = 80,
  goalWeight = 70,
  weightUnits = 'кг'
}) => {
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();

  // Определяем разницу в весе
  const weightDifference = Math.abs(currentWeight - goalWeight);

  return (
    <OnboardingLayout
      title={t('onboarding.calorieBudgetIntro.title')}
      subtitle={t('onboarding.calorieBudgetIntro.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={calorieBudgetIntro.programContainer}>
        <Text style={calorieBudgetIntro.programTitle}>{t('onboarding.welcome.program')}</Text>
        
        <View style={calorieBudgetIntro.programContent}>
          <View style={[calorieBudgetIntro.programItem, calorieBudgetIntro.activeItem]}>
            <View style={calorieBudgetIntro.programIconContainer}>
              <Ionicons name="trending-down-outline" size={20} color={palette.primary} />
            </View>
            <Text style={calorieBudgetIntro.programText}>
              {t('onboarding.calorieBudgetIntro.weightReduction', { amount: weightDifference, units: weightUnits })}
            </Text>
            <View style={calorieBudgetIntro.programCheckmark}>
              <Ionicons name="checkmark" size={16} color={palette.primary} />
            </View>
          </View>
          
          <View style={[calorieBudgetIntro.programItem, calorieBudgetIntro.activeItem]}>
            <View style={calorieBudgetIntro.programIconContainer}>
              <Ionicons name="scale-outline" size={20} color={palette.primary} />
            </View>
            <Text style={calorieBudgetIntro.programText}>
              {t('onboarding.calorieBudgetIntro.targetWeight', { weight: goalWeight, units: weightUnits })}
            </Text>
            <View style={calorieBudgetIntro.programCheckmark}>
              <Ionicons name="checkmark" size={16} color={palette.primary} />
            </View>
          </View>
          
          <View style={[calorieBudgetIntro.programItem, calorieBudgetIntro.nextStepItem]}>
            <View style={calorieBudgetIntro.programIconContainer}>
              <Ionicons name="calculator-outline" size={20} color={palette.primary} />
            </View>
            <Text style={calorieBudgetIntro.programText}>
              {t('onboarding.calorieBudgetIntro.calorieBudget')}
            </Text>
          </View>
          
          <View style={[calorieBudgetIntro.programItem, calorieBudgetIntro.inactiveItem]}>
            <View style={calorieBudgetIntro.programIconContainer}>
              <Ionicons name="calendar-outline" size={20} color={palette.text.disabled} />
            </View>
            <Text style={[calorieBudgetIntro.programText, calorieBudgetIntro.inactiveText]}>
              {t('onboarding.calorieBudgetIntro.calorieSchedule')}
            </Text>
          </View>
          
          <View style={[calorieBudgetIntro.programItem, calorieBudgetIntro.inactiveItem]}>
            <View style={calorieBudgetIntro.programIconContainer}>
              <Ionicons name="nutrition-outline" size={20} color={palette.text.disabled} />
            </View>
            <Text style={[calorieBudgetIntro.programText, calorieBudgetIntro.inactiveText]}>
              {t('onboarding.calorieBudgetIntro.nutritionStrategy')}
            </Text>
          </View>
          
          <View style={[calorieBudgetIntro.programItem, calorieBudgetIntro.inactiveItem]}>
            <View style={calorieBudgetIntro.programIconContainer}>
              <Ionicons name="time-outline" size={20} color={palette.text.disabled} />
            </View>
            <Text style={[calorieBudgetIntro.programText, calorieBudgetIntro.inactiveText]}>
              {t('onboarding.calorieBudgetIntro.intermittentFasting')}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={calorieBudgetIntro.infoContainer}>
        <Text style={calorieBudgetIntro.infoTitle}>{t('onboarding.calorieBudgetIntro.whatIs')}</Text>
        <Text style={calorieBudgetIntro.infoText}>
          {t('onboarding.calorieBudgetIntro.explanation')}
        </Text>
        
        <View style={calorieBudgetIntro.infoIcon}>
          <Ionicons name="flame-outline" size={20} color={palette.primary} />
        </View>
        <Text style={calorieBudgetIntro.infoText}>
          {t('onboarding.calorieBudgetIntro.deficitExplanation')}
        </Text>
        
        <View style={calorieBudgetIntro.infoIcon}>
          <Ionicons name="calculator-outline" size={20} color={palette.primary} />
        </View>
        <Text style={calorieBudgetIntro.infoText}>
          {t('onboarding.calorieBudgetIntro.personalCalculation')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default CalorieBudgetIntroScreen;

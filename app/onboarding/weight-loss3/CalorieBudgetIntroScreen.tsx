import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, usePalette, useProgramContainerStyles } from './unifiedStyles';

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
  // Получаем палитру цветов и динамические стили
  const palette = usePalette();
  const programStyles = useProgramContainerStyles();
  const cardStyles = useCardStyles();
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
      <View style={programStyles.programContainer}>
        <Text style={programStyles.programTitle}>{t('onboarding.welcome.program')}</Text>
        
        <View style={programStyles.programContent}>
          <View style={[programStyles.programItem, programStyles.activeItem]}>
            <View style={programStyles.programIconContainer}>
              <Ionicons name="trending-down-outline" size={20} color={palette.white} />
            </View>
            <Text style={programStyles.programText}>
              {t('onboarding.calorieBudgetIntro.weightReduction', { amount: weightDifference, units: weightUnits })}
            </Text>
            <View style={programStyles.programCheckmark}>
              <Ionicons name="checkmark" size={16} color={palette.white} />
            </View>
          </View>
          
          <View style={[programStyles.programItem, programStyles.activeItem]}>
            <View style={programStyles.programIconContainer}>
              <Ionicons name="scale-outline" size={20} color={palette.white} />
            </View>
            <Text style={programStyles.programText}>
              {t('onboarding.calorieBudgetIntro.targetWeight', { weight: goalWeight, units: weightUnits })}
            </Text>
            <View style={programStyles.programCheckmark}>
              <Ionicons name="checkmark" size={16} color={palette.white} />
            </View>
          </View>
          
          <View style={[programStyles.programItem, programStyles.nextStepItem]}>
            <View style={programStyles.programIconContainer}>
              <Ionicons name="calculator-outline" size={20} color={palette.white} />
            </View>
            <Text style={programStyles.programText}>
              {t('onboarding.calorieBudgetIntro.calorieBudget')}
            </Text>
          </View>
          
          <View style={[programStyles.programItem, programStyles.inactiveItem]}>
            <View style={programStyles.programIconContainer}>
              <Ionicons name="calendar-outline" size={20} color={palette.text.disabled} />
            </View>
            <Text style={[programStyles.programText, programStyles.inactiveText]}>
              {t('onboarding.calorieBudgetIntro.calorieSchedule')}
            </Text>
          </View>
          
          <View style={[programStyles.programItem, programStyles.inactiveItem]}>
            <View style={programStyles.programIconContainer}>
              <Ionicons name="nutrition-outline" size={20} color={palette.text.disabled} />
            </View>
            <Text style={[programStyles.programText, programStyles.inactiveText]}>
              {t('onboarding.calorieBudgetIntro.nutritionStrategy')}
            </Text>
          </View>
          
          <View style={[programStyles.programItem, programStyles.inactiveItem]}>
            <View style={programStyles.programIconContainer}>
              <Ionicons name="time-outline" size={20} color={palette.text.disabled} />
            </View>
            <Text style={[programStyles.programText, programStyles.inactiveText]}>
              {t('onboarding.calorieBudgetIntro.intermittentFasting')}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={cardStyles.infoContainer}>
        <Text style={cardStyles.infoTitle}>{t('onboarding.calorieBudgetIntro.whatIs')}</Text>
        <Text style={cardStyles.infoText}>
          {t('onboarding.calorieBudgetIntro.explanation')}
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Ionicons name="flame-outline" size={20} color={palette.white} />
          </View>
          <Text style={cardStyles.infoText}>
            {t('onboarding.calorieBudgetIntro.deficitExplanation')}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Ionicons name="calculator-outline" size={20} color={palette.white} />
          </View>
          <Text style={cardStyles.infoText}>
            {t('onboarding.calorieBudgetIntro.personalCalculation')}
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
};

export default CalorieBudgetIntroScreen;

import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface PlanReadyScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile?: {
    calorieTarget?: number;
    weightLossPlan?: string;
    dietPreference?: string;
    exerciseIntent?: boolean;
  };
}

const PlanReadyScreen: React.FC<PlanReadyScreenProps> = ({
  onContinue,
  onBack,
  userProfile
}) => {
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const palette = usePalette();
  const typography = useTypographyStyles();
  const cards = useCardStyles();

  // Дополнительные динамические стили для этого экрана
  const successTitleStyle = {
    fontSize: 20,
    fontWeight: '700' as const,
    color: palette.primary,
    textAlign: 'center' as const,
    marginBottom: 8,
  };

  const successSubtitleStyle = {
    fontSize: 16,
    fontWeight: '400' as const,
    color: palette.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  };

  const featuresTitleStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 16,
  };

  const featureItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  };

  const featureBulletStyle = {
    fontSize: 16,
    fontWeight: '600' as const,
    color: palette.primary,
    marginRight: 12,
    marginTop: 2,
  };

  const featureTextStyle = {
    fontSize: 16,
    fontWeight: '400' as const,
    color: palette.text.primary,
    flex: 1,
    lineHeight: 22,
  };

  const featureHighlightStyle = {
    fontWeight: '600' as const,
    color: palette.primary,
  };

  const ctaTextStyle = {
    fontSize: 16,
    fontWeight: '500' as const,
    color: palette.text.primary,
    textAlign: 'center' as const,
    lineHeight: 22,
  };

  // Функции для получения читаемых значений
  const getWeightLossPlanText = () => {
    switch(userProfile?.weightLossPlan) {
      case 'steady': return t('onboarding.planReady.weightLossPlans.steady');
      case 'moderate': return t('onboarding.planReady.weightLossPlans.moderate');
      case 'aggressive': return t('onboarding.planReady.weightLossPlans.aggressive');
      default: return t('onboarding.planReady.weightLossPlans.steady');
    }
  };
  
  const getDietPreferenceText = () => {
    switch(userProfile?.dietPreference) {
      case 'standard': return t('onboarding.planReady.dietTypes.standard');
      case 'vegetarian': return t('onboarding.planReady.dietTypes.vegetarian');
      case 'vegan': return t('onboarding.planReady.dietTypes.vegan');
      case 'low-carb': return t('onboarding.planReady.dietTypes.lowCarb');
      case 'keto': return t('onboarding.planReady.dietTypes.keto');
      case 'paleo': return t('onboarding.planReady.dietTypes.paleo');
      case 'mediterranean': return t('onboarding.planReady.dietTypes.mediterranean');
      default: return t('onboarding.planReady.dietTypes.standard');
    }
  };
  
  const getExerciseText = () => {
    return userProfile?.exerciseIntent ? t('onboarding.planReady.exercise.included') : t('onboarding.planReady.exercise.optional');
  };

  const features = [
    {
      icon: 'calculator-outline',
      title: t('onboarding.planReady.features.personalizedCalories'),
      description: t('onboarding.planReady.features.personalizedCaloriesDesc')
    },
    {
      icon: 'nutrition-outline',
      title: t('onboarding.planReady.features.nutritionBalance'),
      description: t('onboarding.planReady.features.nutritionBalanceDesc')
    },
    {
      icon: 'restaurant-outline',
      title: t('onboarding.planReady.features.mealPlanning'),
      description: t('onboarding.planReady.features.mealPlanningDesc')
    },
    {
      icon: 'trending-up-outline',
      title: t('onboarding.planReady.features.progressTracking'),
      description: t('onboarding.planReady.features.progressTrackingDesc')
    }
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.planReady.title')}
      subtitle={t('onboarding.planReady.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
      continueText={t('onboarding.planReady.startJourney')}
      headerIcon={<View />}
    >
      {/* Используем cards.section вместо inline стилей */}
      <View style={[cards.section, { alignItems: 'center', marginTop: 20, marginBottom: 24 }]}>
        <Text style={successTitleStyle}>
          {t('onboarding.planReady.congratulations')}
        </Text>
        
        <Text style={successSubtitleStyle}>
          {t('onboarding.planReady.successMessage')}
        </Text>
      </View>

      {/* Список ключевых элементов */}
      <View style={{ marginBottom: 24 }}>
        <Text style={featuresTitleStyle}>
          {t('onboarding.planReady.keyElements')}
        </Text>
        
        <View style={featureItemStyle}>
          <Text style={featureBulletStyle}>•</Text>
          <Text style={featureTextStyle}>
            {t('onboarding.planReady.dailyCalories')}: <Text style={featureHighlightStyle}>{userProfile?.calorieTarget || 1800} {t('onboarding.planReady.kcal')}</Text>
          </Text>
        </View>

        <View style={featureItemStyle}>
          <Text style={featureBulletStyle}>•</Text>
          <Text style={featureTextStyle}>
            {t('onboarding.planReady.weightLossPace')}: <Text style={featureHighlightStyle}>{getWeightLossPlanText()}</Text>
          </Text>
        </View>

        <View style={featureItemStyle}>
          <Text style={featureBulletStyle}>•</Text>
          <Text style={featureTextStyle}>
            {t('onboarding.planReady.nutritionStrategy')}: <Text style={featureHighlightStyle}>{getDietPreferenceText()}</Text>
          </Text>
        </View>

        <View style={featureItemStyle}>
          <Text style={featureBulletStyle}>•</Text>
          <Text style={featureTextStyle}>
            {t('onboarding.planReady.physicalActivity')}: <Text style={featureHighlightStyle}>{getExerciseText()}</Text>
          </Text>
        </View>
      </View>

      {/* CTA контейнер - используем cards.section */}
      <View style={[cards.section, { marginTop: 16, padding: 16 }]}>
        <Text style={ctaTextStyle}>
          {t('onboarding.planReady.readyToStart')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default PlanReadyScreen; 
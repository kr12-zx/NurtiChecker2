import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { planReady } from './unifiedStyles';

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
      <View style={planReady.successContainer}>
        <Text style={planReady.successTitle}>
          {t('onboarding.planReady.congratulations')}
        </Text>
        
        <Text style={planReady.successSubtitle}>
          {t('onboarding.planReady.successMessage')}
        </Text>
      </View>

      {/* Список ключевых элементов */}
      <View style={planReady.featuresList}>
        <Text style={planReady.featuresTitle}>
          {t('onboarding.planReady.keyElements')}
        </Text>
        
        <View style={planReady.featureItem}>
          <Text style={planReady.featureBullet}>•</Text>
          <Text style={planReady.featureText}>
            {t('onboarding.planReady.dailyCalories')}: <Text style={planReady.featureHighlight}>{userProfile?.calorieTarget || 1800} {t('onboarding.planReady.kcal')}</Text>
          </Text>
        </View>

        <View style={planReady.featureItem}>
          <Text style={planReady.featureBullet}>•</Text>
          <Text style={planReady.featureText}>
            {t('onboarding.planReady.weightLossPace')}: <Text style={planReady.featureHighlight}>{getWeightLossPlanText()}</Text>
          </Text>
        </View>

        <View style={planReady.featureItem}>
          <Text style={planReady.featureBullet}>•</Text>
          <Text style={planReady.featureText}>
            {t('onboarding.planReady.nutritionStrategy')}: <Text style={planReady.featureHighlight}>{getDietPreferenceText()}</Text>
          </Text>
        </View>

        <View style={planReady.featureItem}>
          <Text style={planReady.featureBullet}>•</Text>
          <Text style={planReady.featureText}>
            {t('onboarding.planReady.physicalActivity')}: <Text style={planReady.featureHighlight}>{getExerciseText()}</Text>
          </Text>
        </View>
      </View>

      {/* CTA контейнер */}
      <View style={planReady.ctaContainer}>
        <Text style={planReady.ctaText}>
          {t('onboarding.planReady.readyToStart')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default PlanReadyScreen; 
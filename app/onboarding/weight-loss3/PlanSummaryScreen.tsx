import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, palette, planSummary, typography } from './unifiedStyles';

interface PlanSummaryScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: {
    calorieBudget: number;
    weightLossPlan: string;
    exerciseIntent: boolean;
    nutritionFocus: string;
    challengesView: string;
    intermittentFasting: boolean;
  };
}

const PlanSummaryScreen: React.FC<PlanSummaryScreenProps> = ({ 
  onContinue, 
  onBack,
  userProfile = {
    calorieBudget: 1500,
    weightLossPlan: 'steady',
    exerciseIntent: true,
    nutritionFocus: 'balanced',
    challengesView: 'opportunities',
    intermittentFasting: false
  }
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Получаем понятные названия для выбранных опций
  const getPlanName = () => {
    switch(userProfile.weightLossPlan) {
      case 'steady': return t('onboarding.planSummary.plans.steady');
      case 'moderate': return t('onboarding.planSummary.plans.moderate');
      case 'aggressive': return t('onboarding.planSummary.plans.aggressive');
      default: return t('onboarding.planSummary.plans.steady');
    }
  };
  
  const getNutritionFocusName = () => {
    switch(userProfile.nutritionFocus) {
      case 'balanced': return t('onboarding.planSummary.nutrition.balanced');
      case 'low-carb': return t('onboarding.planSummary.nutrition.lowCarb');
      case 'high-protein': return t('onboarding.planSummary.nutrition.highProtein');
      case 'plant-based': return t('onboarding.planSummary.nutrition.plantBased');
      default: return t('onboarding.planSummary.nutrition.balanced');
    }
  };
  
  const getChallengesViewName = () => {
    switch(userProfile.challengesView) {
      case 'opportunities': return t('onboarding.planSummary.challenges.opportunities');
      case 'obstacles': return t('onboarding.planSummary.challenges.obstacles');
      case 'mixed': return t('onboarding.planSummary.challenges.mixed');
      default: return t('onboarding.planSummary.challenges.mixed');
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
              {t('onboarding.planSummary.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.planSummary.subtitle')}
            </Text>

            <View style={planSummary.summaryContainer}>
              <Text style={planSummary.sectionTitle}>{t('onboarding.planSummary.keyElements')}</Text>
              
              <View style={planSummary.summaryItem}>
                <View style={planSummary.summaryIconContainer}>
                  <Ionicons name="flame-outline" size={24} color={palette.primary} />
                </View>
                <View style={planSummary.summaryTextContainer}>
                  <Text style={planSummary.summaryLabel}>{t('onboarding.planSummary.dailyCalories')}</Text>
                  <Text style={planSummary.summaryValue}>{userProfile.calorieBudget} {t('common.kcal')}</Text>
                </View>
              </View>
              
              <View style={planSummary.summaryItem}>
                <View style={planSummary.summaryIconContainer}>
                  <Ionicons name="trending-down-outline" size={24} color={palette.primary} />
                </View>
                <View style={planSummary.summaryTextContainer}>
                  <Text style={planSummary.summaryLabel}>{t('onboarding.planSummary.weightLossPace')}</Text>
                  <Text style={planSummary.summaryValue}>{getPlanName()}</Text>
                </View>
              </View>
              
              <View style={planSummary.summaryItem}>
                <View style={planSummary.summaryIconContainer}>
                  <Ionicons name="nutrition-outline" size={24} color={palette.primary} />
                </View>
                <View style={planSummary.summaryTextContainer}>
                  <Text style={planSummary.summaryLabel}>{t('onboarding.planSummary.nutritionStrategy')}</Text>
                  <Text style={planSummary.summaryValue}>{getNutritionFocusName()}</Text>
                </View>
              </View>
              
              <View style={planSummary.summaryItem}>
                <View style={planSummary.summaryIconContainer}>
                  <Ionicons name="barbell-outline" size={24} color={palette.primary} />
                </View>
                <View style={planSummary.summaryTextContainer}>
                  <Text style={planSummary.summaryLabel}>{t('onboarding.planSummary.physicalActivity')}</Text>
                  <Text style={planSummary.summaryValue}>
                    {userProfile.exerciseIntent ? t('onboarding.planSummary.included') : t('onboarding.planSummary.notIncluded')}
                  </Text>
                </View>
              </View>
              
              <View style={planSummary.summaryItem}>
                <View style={planSummary.summaryIconContainer}>
                  <Ionicons name="time-outline" size={24} color={palette.primary} />
                </View>
                <View style={planSummary.summaryTextContainer}>
                  <Text style={planSummary.summaryLabel}>{t('onboarding.planSummary.intermittentFasting')}</Text>
                  <Text style={planSummary.summaryValue}>
                    {userProfile.intermittentFasting ? t('onboarding.planSummary.included') : t('onboarding.planSummary.notIncluded')}
                  </Text>
                </View>
              </View>
              
              <View style={planSummary.summaryItem}>
                <View style={planSummary.summaryIconContainer}>
                  <Ionicons name="compass-outline" size={24} color={palette.primary} />
                </View>
                <View style={planSummary.summaryTextContainer}>
                  <Text style={planSummary.summaryLabel}>{t('onboarding.planSummary.challengesPerception')}</Text>
                  <Text style={planSummary.summaryValue}>{getChallengesViewName()}</Text>
                </View>
              </View>
            </View>
            
            <View style={planSummary.nextStepsContainer}>
              <Text style={planSummary.sectionTitle}>{t('onboarding.planSummary.nextSteps')}</Text>
              
              <View style={planSummary.stepItem}>
                <Text style={planSummary.stepNumber}>1</Text>
                <Text style={planSummary.stepText}>
                  {t('onboarding.planSummary.steps.step1')}
                </Text>
              </View>
              
              <View style={planSummary.stepItem}>
                <Text style={planSummary.stepNumber}>2</Text>
                <Text style={planSummary.stepText}>
                  {t('onboarding.planSummary.steps.step2')}
                </Text>
              </View>
              
              <View style={planSummary.stepItem}>
                <Text style={planSummary.stepNumber}>3</Text>
                <Text style={planSummary.stepText}>
                  {t('onboarding.planSummary.steps.step3')}
                </Text>
              </View>
              
              <View style={planSummary.stepItem}>
                <Text style={planSummary.stepNumber}>4</Text>
                <Text style={planSummary.stepText}>
                  {t('onboarding.planSummary.steps.step4')}
                </Text>
              </View>
            </View>
            
            <Text style={planSummary.motivationText}>
              {t('onboarding.planSummary.motivationText')}
            </Text>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue}
          disableContinue={false}
          continueText={t('onboarding.planSummary.startButton')}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default PlanSummaryScreen;

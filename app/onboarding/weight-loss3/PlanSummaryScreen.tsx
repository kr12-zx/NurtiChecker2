import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { useContainerStyles, usePalette, useTypographyStyles } from './unifiedStyles';

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
  
  // Получаем динамические стили
  const palette = usePalette();
  const containers = useContainerStyles();
  const typography = useTypographyStyles();
  
  // Динамические стили для этого экрана
  const summaryContainerStyle = {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 16,
  };

  const summaryItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  };

  const summaryIconContainerStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
    borderWidth: 1,
    borderColor: palette.border.inactive,
  };

  const summaryTextContainerStyle = {
    flex: 1,
  };

  const summaryLabelStyle = {
    fontSize: 14,
    color: palette.text.secondary,
    marginBottom: 2,
  };

  const summaryValueStyle = {
    fontSize: 16,
    fontWeight: '500' as const,
    color: palette.text.primary,
  };

  const stepItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  };

  const stepNumberStyle = {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    color: palette.white,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    lineHeight: 24,
    marginRight: 12,
  };

  const stepTextStyle = {
    flex: 1,
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
  };

  const motivationTextStyle = {
    fontSize: 16,
    color: palette.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    fontStyle: 'italic' as const,
    marginTop: 20,
    marginBottom: 20,
  };
  
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

            <View style={summaryContainerStyle}>
              <Text style={sectionTitleStyle}>{t('onboarding.planSummary.keyElements')}</Text>
              
              <View style={summaryItemStyle}>
                <View style={summaryIconContainerStyle}>
                  <Ionicons name="flame-outline" size={24} color={palette.primary} />
                </View>
                <View style={summaryTextContainerStyle}>
                  <Text style={summaryLabelStyle}>{t('onboarding.planSummary.dailyCalories')}</Text>
                  <Text style={summaryValueStyle}>{userProfile.calorieBudget} {t('common.kcal')}</Text>
                </View>
              </View>
              
              <View style={summaryItemStyle}>
                <View style={summaryIconContainerStyle}>
                  <Ionicons name="trending-down-outline" size={24} color={palette.primary} />
                </View>
                <View style={summaryTextContainerStyle}>
                  <Text style={summaryLabelStyle}>{t('onboarding.planSummary.weightLossPace')}</Text>
                  <Text style={summaryValueStyle}>{getPlanName()}</Text>
                </View>
              </View>
              
              <View style={summaryItemStyle}>
                <View style={summaryIconContainerStyle}>
                  <Ionicons name="nutrition-outline" size={24} color={palette.primary} />
                </View>
                <View style={summaryTextContainerStyle}>
                  <Text style={summaryLabelStyle}>{t('onboarding.planSummary.nutritionStrategy')}</Text>
                  <Text style={summaryValueStyle}>{getNutritionFocusName()}</Text>
                </View>
              </View>
              
              <View style={summaryItemStyle}>
                <View style={summaryIconContainerStyle}>
                  <Ionicons name="barbell-outline" size={24} color={palette.primary} />
                </View>
                <View style={summaryTextContainerStyle}>
                  <Text style={summaryLabelStyle}>{t('onboarding.planSummary.physicalActivity')}</Text>
                  <Text style={summaryValueStyle}>
                    {userProfile.exerciseIntent ? t('onboarding.planSummary.included') : t('onboarding.planSummary.notIncluded')}
                  </Text>
                </View>
              </View>
              
              <View style={summaryItemStyle}>
                <View style={summaryIconContainerStyle}>
                  <Ionicons name="time-outline" size={24} color={palette.primary} />
                </View>
                <View style={summaryTextContainerStyle}>
                  <Text style={summaryLabelStyle}>{t('onboarding.planSummary.intermittentFasting')}</Text>
                  <Text style={summaryValueStyle}>
                    {userProfile.intermittentFasting ? t('onboarding.planSummary.included') : t('onboarding.planSummary.notIncluded')}
                  </Text>
                </View>
              </View>
              
              <View style={summaryItemStyle}>
                <View style={summaryIconContainerStyle}>
                  <Ionicons name="compass-outline" size={24} color={palette.primary} />
                </View>
                <View style={summaryTextContainerStyle}>
                  <Text style={summaryLabelStyle}>{t('onboarding.planSummary.challengesPerception')}</Text>
                  <Text style={summaryValueStyle}>{getChallengesViewName()}</Text>
                </View>
              </View>
            </View>
            
            <View style={summaryContainerStyle}>
              <Text style={sectionTitleStyle}>{t('onboarding.planSummary.nextSteps')}</Text>
              
              <View style={stepItemStyle}>
                <Text style={stepNumberStyle}>1</Text>
                <Text style={stepTextStyle}>
                  {t('onboarding.planSummary.steps.step1')}
                </Text>
              </View>
              
              <View style={stepItemStyle}>
                <Text style={stepNumberStyle}>2</Text>
                <Text style={stepTextStyle}>
                  {t('onboarding.planSummary.steps.step2')}
                </Text>
              </View>
              
              <View style={stepItemStyle}>
                <Text style={stepNumberStyle}>3</Text>
                <Text style={stepTextStyle}>
                  {t('onboarding.planSummary.steps.step3')}
                </Text>
              </View>
              
              <View style={stepItemStyle}>
                <Text style={stepNumberStyle}>4</Text>
                <Text style={stepTextStyle}>
                  {t('onboarding.planSummary.steps.step4')}
                </Text>
              </View>
            </View>
            
            <Text style={motivationTextStyle}>
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

export default PlanSummaryScreen;

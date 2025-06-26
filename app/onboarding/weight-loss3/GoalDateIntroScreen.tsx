import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette } from './unifiedStyles';

interface GoalDateIntroScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const GoalDateIntroScreen: React.FC<GoalDateIntroScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const palette = usePalette();

  // Динамические стили для этого экрана
  const infoContainerStyle = {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const infoTitleStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 20,
    textAlign: 'center' as const,
  };

  const infoItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  };

  const infoIconStyle = {
    marginRight: 12,
    marginTop: 2,
  };

  const infoTextStyle = {
    fontSize: 14,
    color: palette.text.primary,
    flex: 1,
    lineHeight: 20,
  };

  const questionsPreviewContainerStyle = {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const questionsPreviewTitleStyle = {
    fontSize: 16,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 16,
  };

  const questionItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  };

  const questionNumberStyle = {
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

  const questionTextStyle = {
    fontSize: 14,
    color: palette.text.primary,
    flex: 1,
    lineHeight: 20,
  };

  const noteContainerStyle = {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const noteTextStyle = {
    fontSize: 12,
    color: palette.text.secondary,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    lineHeight: 16,
  };

  return (
    <OnboardingLayout
      title={t('onboarding.goalDateIntro.title')}
      subtitle={t('onboarding.goalDateIntro.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={infoContainerStyle}>
        <Text style={infoTitleStyle}>
          {t('onboarding.goalDateIntro.whyNeeded')}
        </Text>
        
        <View style={infoItemStyle}>
          <Ionicons name="person-outline" size={24} color={palette.primary} style={infoIconStyle} />
          <Text style={infoTextStyle}>
            {t('onboarding.goalDateIntro.reasons.psychologicalProfile')}
          </Text>
        </View>
        
        <View style={infoItemStyle}>
          <Ionicons name="warning-outline" size={24} color={palette.primary} style={infoIconStyle} />
          <Text style={infoTextStyle}>
            {t('onboarding.goalDateIntro.reasons.anticipateChallenges')}
          </Text>
        </View>
        
        <View style={infoItemStyle}>
          <Ionicons name="rocket-outline" size={24} color={palette.primary} style={infoIconStyle} />
          <Text style={infoTextStyle}>
            {t('onboarding.goalDateIntro.reasons.useStrengths')}
          </Text>
        </View>
      </View>
      
      <View style={questionsPreviewContainerStyle}>
        <Text style={questionsPreviewTitleStyle}>
          {t('onboarding.goalDateIntro.questionsPreview')}:
        </Text>
        
        <View style={questionItemStyle}>
          <Text style={questionNumberStyle}>1</Text>
          <Text style={questionTextStyle}>
            {t('onboarding.goalDateIntro.questions.adaptability')}
          </Text>
        </View>
        
        <View style={questionItemStyle}>
          <Text style={questionNumberStyle}>2</Text>
          <Text style={questionTextStyle}>
            {t('onboarding.goalDateIntro.questions.challenges')}
          </Text>
        </View>
        
        <View style={questionItemStyle}>
          <Text style={questionNumberStyle}>3</Text>
          <Text style={questionTextStyle}>
            {t('onboarding.goalDateIntro.questions.setbacks')}
          </Text>
        </View>
        
        <View style={questionItemStyle}>
          <Text style={questionNumberStyle}>4</Text>
          <Text style={questionTextStyle}>
            {t('onboarding.goalDateIntro.questions.stress')}
          </Text>
        </View>
        
        <View style={questionItemStyle}>
          <Text style={questionNumberStyle}>5</Text>
          <Text style={questionTextStyle}>
            {t('onboarding.goalDateIntro.questions.confidence')}
          </Text>
        </View>
      </View>
      
      <View style={noteContainerStyle}>
        <Text style={noteTextStyle}>
          {t('onboarding.goalDateIntro.honestyNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default GoalDateIntroScreen;

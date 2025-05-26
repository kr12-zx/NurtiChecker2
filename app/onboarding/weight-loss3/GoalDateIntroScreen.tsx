import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { goalDateIntro, palette } from './unifiedStyles';

interface GoalDateIntroScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const GoalDateIntroScreen: React.FC<GoalDateIntroScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();

  return (
    <OnboardingLayout
      title={t('onboarding.goalDateIntro.title')}
      subtitle={t('onboarding.goalDateIntro.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={goalDateIntro.infoContainer}>
        <Text style={goalDateIntro.infoTitle}>
          {t('onboarding.goalDateIntro.whyNeeded')}
        </Text>
        
        <View style={goalDateIntro.infoItem}>
          <Ionicons name="person-outline" size={24} color={palette.primary} style={goalDateIntro.infoIcon} />
          <Text style={goalDateIntro.infoText}>
            {t('onboarding.goalDateIntro.reasons.psychologicalProfile')}
          </Text>
        </View>
        
        <View style={goalDateIntro.infoItem}>
          <Ionicons name="warning-outline" size={24} color={palette.primary} style={goalDateIntro.infoIcon} />
          <Text style={goalDateIntro.infoText}>
            {t('onboarding.goalDateIntro.reasons.anticipateChallenges')}
          </Text>
        </View>
        
        <View style={goalDateIntro.infoItem}>
          <Ionicons name="rocket-outline" size={24} color={palette.primary} style={goalDateIntro.infoIcon} />
          <Text style={goalDateIntro.infoText}>
            {t('onboarding.goalDateIntro.reasons.useStrengths')}
          </Text>
        </View>
      </View>
      
      <View style={goalDateIntro.questionsPreviewContainer}>
        <Text style={goalDateIntro.questionsPreviewTitle}>
          {t('onboarding.goalDateIntro.questionsPreview')}:
        </Text>
        
        <View style={goalDateIntro.questionItem}>
          <Text style={goalDateIntro.questionNumber}>1</Text>
          <Text style={goalDateIntro.questionText}>
            {t('onboarding.goalDateIntro.questions.adaptability')}
          </Text>
        </View>
        
        <View style={goalDateIntro.questionItem}>
          <Text style={goalDateIntro.questionNumber}>2</Text>
          <Text style={goalDateIntro.questionText}>
            {t('onboarding.goalDateIntro.questions.challenges')}
          </Text>
        </View>
        
        <View style={goalDateIntro.questionItem}>
          <Text style={goalDateIntro.questionNumber}>3</Text>
          <Text style={goalDateIntro.questionText}>
            {t('onboarding.goalDateIntro.questions.setbacks')}
          </Text>
        </View>
        
        <View style={goalDateIntro.questionItem}>
          <Text style={goalDateIntro.questionNumber}>4</Text>
          <Text style={goalDateIntro.questionText}>
            {t('onboarding.goalDateIntro.questions.stress')}
          </Text>
        </View>
        
        <View style={goalDateIntro.questionItem}>
          <Text style={goalDateIntro.questionNumber}>5</Text>
          <Text style={goalDateIntro.questionText}>
            {t('onboarding.goalDateIntro.questions.confidence')}
          </Text>
        </View>
      </View>
      
      <View style={goalDateIntro.noteContainer}>
        <Text style={goalDateIntro.noteText}>
          {t('onboarding.goalDateIntro.honestyNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default GoalDateIntroScreen;

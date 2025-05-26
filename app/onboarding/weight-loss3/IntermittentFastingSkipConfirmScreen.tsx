import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { intermittentFastingSkipConfirm, palette } from './unifiedStyles';

interface IntermittentFastingSkipConfirmScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const IntermittentFastingSkipConfirmScreen: React.FC<IntermittentFastingSkipConfirmScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();

  return (
    <OnboardingLayout
      title={t('onboarding.intermittentFastingSkipConfirm.title')}
      subtitle={t('onboarding.intermittentFastingSkipConfirm.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={intermittentFastingSkipConfirm.infoContainer}>
        <Text style={intermittentFastingSkipConfirm.infoTitle}>{t('onboarding.intermittentFastingSkipConfirm.benefitsTitle')}:</Text>
        
        <View style={intermittentFastingSkipConfirm.benefitItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" style={intermittentFastingSkipConfirm.benefitIcon} />
          <Text style={intermittentFastingSkipConfirm.benefitText}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.flexibility')}
          </Text>
        </View>
        
        <View style={intermittentFastingSkipConfirm.benefitItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" style={intermittentFastingSkipConfirm.benefitIcon} />
          <Text style={intermittentFastingSkipConfirm.benefitText}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.eatWhenHungry')}
          </Text>
        </View>
        
        <View style={intermittentFastingSkipConfirm.benefitItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" style={intermittentFastingSkipConfirm.benefitIcon} />
          <Text style={intermittentFastingSkipConfirm.benefitText}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.naturalApproach')}
          </Text>
        </View>
        
        <View style={intermittentFastingSkipConfirm.benefitItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" style={intermittentFastingSkipConfirm.benefitIcon} />
          <Text style={intermittentFastingSkipConfirm.benefitText}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.lessRisk')}
          </Text>
        </View>
      </View>
      
      <View style={intermittentFastingSkipConfirm.noteContainer}>
        <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={intermittentFastingSkipConfirm.noteIcon} />
        <Text style={intermittentFastingSkipConfirm.noteText}>
          {t('onboarding.intermittentFastingSkipConfirm.futureNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default IntermittentFastingSkipConfirmScreen;

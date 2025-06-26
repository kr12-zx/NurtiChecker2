import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette, useTypographyStyles } from './unifiedStyles';

interface IntermittentFastingSkipConfirmScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const IntermittentFastingSkipConfirmScreen: React.FC<IntermittentFastingSkipConfirmScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();
  const palette = usePalette();
  const typography = useTypographyStyles();

  const benefitItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
    paddingHorizontal: 16,
  };

  const benefitIconStyle = {
    marginRight: 12,
    marginTop: 2,
  };

  const noteContainerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: palette.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: palette.border,
  };

  const noteIconStyle = {
    marginRight: 12,
    marginTop: 2,
  };

  return (
    <OnboardingLayout
      title={t('onboarding.intermittentFastingSkipConfirm.title')}
      subtitle={t('onboarding.intermittentFastingSkipConfirm.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        <Text style={[typography.sectionTitle, { marginBottom: 16, paddingHorizontal: 16 }]}>
          {t('onboarding.intermittentFastingSkipConfirm.benefitsTitle')}:
        </Text>
        
        <View style={benefitItemStyle}>
          <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={benefitIconStyle} />
          <Text style={[typography.body, { flex: 1 }]}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.flexibility')}
          </Text>
        </View>
        
        <View style={benefitItemStyle}>
          <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={benefitIconStyle} />
          <Text style={[typography.body, { flex: 1 }]}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.eatWhenHungry')}
          </Text>
        </View>
        
        <View style={benefitItemStyle}>
          <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={benefitIconStyle} />
          <Text style={[typography.body, { flex: 1 }]}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.naturalApproach')}
          </Text>
        </View>
        
        <View style={benefitItemStyle}>
          <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={benefitIconStyle} />
          <Text style={[typography.body, { flex: 1 }]}>
            {t('onboarding.intermittentFastingSkipConfirm.benefits.lessRisk')}
          </Text>
        </View>
      </View>
      
      <View style={noteContainerStyle}>
        <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={noteIconStyle} />
        <Text style={[typography.body, { flex: 1 }]}>
          {t('onboarding.intermittentFastingSkipConfirm.futureNote')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

export default IntermittentFastingSkipConfirmScreen;

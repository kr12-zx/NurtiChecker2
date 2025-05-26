import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { fixedCalorieBudgetConfirm, palette } from './unifiedStyles';

interface FixedCalorieBudgetConfirmScreenProps {
  onContinue: () => void;
  onBack: () => void;
  calorieBudget: number;
}

const FixedCalorieBudgetConfirmScreen: React.FC<FixedCalorieBudgetConfirmScreenProps> = ({
  onContinue,
  onBack,
  calorieBudget = 1500
}) => {
  const { t } = useTranslation();

  return (
    <OnboardingLayout
      title={t('onboarding.fixedCalorieBudgetConfirm.title', { calories: calorieBudget })}
      subtitle={t('onboarding.fixedCalorieBudgetConfirm.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={fixedCalorieBudgetConfirm.budgetCardContainer}>
              <View style={fixedCalorieBudgetConfirm.budgetCard}>
                <View style={fixedCalorieBudgetConfirm.calorieDisplay}>
                  <Text style={fixedCalorieBudgetConfirm.calorieValue}>{calorieBudget}</Text>
                  <Text style={fixedCalorieBudgetConfirm.calorieUnit}>{t('onboarding.fixedCalorieBudgetConfirm.kcalPerDay')}</Text>
                </View>
                
                <View style={fixedCalorieBudgetConfirm.divider} />
                
                <View style={fixedCalorieBudgetConfirm.infoContainer}>
                  <Text style={fixedCalorieBudgetConfirm.infoText}>
                    {t('onboarding.fixedCalorieBudgetConfirm.explanation')}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={fixedCalorieBudgetConfirm.tipsContainer}>
              <Text style={fixedCalorieBudgetConfirm.tipsTitle}>{t('onboarding.fixedCalorieBudgetConfirm.tipsTitle')}</Text>
              
              <View style={fixedCalorieBudgetConfirm.tipItem}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={fixedCalorieBudgetConfirm.tipIcon} />
                <Text style={fixedCalorieBudgetConfirm.tipText}>
                  {t('onboarding.fixedCalorieBudgetConfirm.tip1')}
                </Text>
              </View>
              
              <View style={fixedCalorieBudgetConfirm.tipItem}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={fixedCalorieBudgetConfirm.tipIcon} />
                <Text style={fixedCalorieBudgetConfirm.tipText}>
                  {t('onboarding.fixedCalorieBudgetConfirm.tip2')}
                </Text>
              </View>
              
              <View style={fixedCalorieBudgetConfirm.tipItem}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={fixedCalorieBudgetConfirm.tipIcon} />
                <Text style={fixedCalorieBudgetConfirm.tipText}>
                  {t('onboarding.fixedCalorieBudgetConfirm.tip3')}
                </Text>
              </View>
            </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default FixedCalorieBudgetConfirmScreen;

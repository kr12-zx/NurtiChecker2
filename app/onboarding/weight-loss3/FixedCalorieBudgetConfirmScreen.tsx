import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, usePalette } from './unifiedStyles';

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
  const palette = usePalette();
  const cardStyles = useCardStyles();

  return (
    <OnboardingLayout
      title={t('onboarding.fixedCalorieBudgetConfirm.title', { calories: calorieBudget })}
      subtitle={t('onboarding.fixedCalorieBudgetConfirm.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
              <View style={cardStyles.budgetCard}>
                <View style={cardStyles.calorieDisplay}>
                  <Text style={cardStyles.calorieValue}>{calorieBudget}</Text>
                  <Text style={cardStyles.calorieUnit}>{t('onboarding.fixedCalorieBudgetConfirm.kcalPerDay')}</Text>
                </View>
                
                <View style={cardStyles.divider} />
                
                <View style={cardStyles.infoContainer}>
                  <Text style={cardStyles.infoText}>
                    {t('onboarding.fixedCalorieBudgetConfirm.explanation')}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={cardStyles.tipsContainer}>
              <Text style={cardStyles.tipsTitle}>{t('onboarding.fixedCalorieBudgetConfirm.tipsTitle')}</Text>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.fixedCalorieBudgetConfirm.tip1')}
                </Text>
              </View>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.fixedCalorieBudgetConfirm.tip2')}
                </Text>
              </View>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="information-circle-outline" size={20} color={palette.primary} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.fixedCalorieBudgetConfirm.tip3')}
                </Text>
              </View>
            </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default FixedCalorieBudgetConfirmScreen;

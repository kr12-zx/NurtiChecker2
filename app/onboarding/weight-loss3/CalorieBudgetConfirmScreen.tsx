import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, usePalette } from './unifiedStyles';

interface CalorieBudgetConfirmScreenProps {
  onContinue: () => void;
  onBack: () => void;
  calorieBudget: number;
  weightLossPlan: string;
  isPreliminary?: boolean; // Добавляем флаг для предварительных данных
}

const CalorieBudgetConfirmScreen: React.FC<CalorieBudgetConfirmScreenProps> = ({ 
  onContinue, 
  onBack,
  calorieBudget = 1500, // Значение по умолчанию, если не передано
  weightLossPlan = 'steady', // Значение по умолчанию, если не передано
  isPreliminary = false // Значение по умолчанию, если не передано
}) => {
  const { t } = useTranslation();
  const palette = usePalette();
  const cardStyles = useCardStyles();
  
  // Определяем темп потери веса в зависимости от плана
  let weightLossRate = t('onboarding.calorieBudgetConfirm.weightLossRates.steady');
  if (weightLossPlan === 'moderate') {
    weightLossRate = t('onboarding.calorieBudgetConfirm.weightLossRates.moderate');
  } else if (weightLossPlan === 'aggressive') {
    weightLossRate = t('onboarding.calorieBudgetConfirm.weightLossRates.aggressive');
  }
  
  // Определяем примерное количество недель до цели (это просто заглушка)
  const weeksToGoal = weightLossPlan === 'steady' ? '24' : 
                      weightLossPlan === 'moderate' ? '16' : '12';

  return (
    <OnboardingLayout
      title={t('onboarding.calorieBudgetConfirm.title', { calories: calorieBudget })}
      subtitle={t('onboarding.calorieBudgetConfirm.subtitle', { calories: calorieBudget })}
      onContinue={onContinue}
      onBack={onBack}
    >

            <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
              <View style={cardStyles.budgetCard}>
                <View style={cardStyles.calorieDisplay}>
                  <Text style={cardStyles.calorieValue}>{calorieBudget}</Text>
                  <Text style={cardStyles.calorieUnit}>{t('onboarding.calorieBudgetConfirm.kcalPerDay')}</Text>
                </View>
                
                <View style={cardStyles.divider} />
                
                <View style={cardStyles.budgetDetails}>
                  <View style={cardStyles.detailItem}>
                    <Ionicons name="trending-down-outline" size={20} color={palette.primary} />
                    <Text style={cardStyles.detailText}>
                      {t('onboarding.calorieBudgetConfirm.lossPerWeek', { rate: weightLossRate })}
                    </Text>
                  </View>
                  
                  <View style={cardStyles.detailItem}>
                    <Ionicons name="calendar-outline" size={20} color={palette.primary} />
                    <Text style={cardStyles.detailText}>
                      {t('onboarding.calorieBudgetConfirm.goalAchievement', { weeks: weeksToGoal })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Подпись о предварительных данных */}
            {isPreliminary && (
              <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
                <Text style={[cardStyles.detailText, { fontSize: 12, fontStyle: 'italic', color: palette.text.secondary, textAlign: 'center' }]}>
                  {t('onboarding.calorieBudgetConfirm.preliminaryNote')}
                </Text>
                <Text style={[cardStyles.detailText, { fontSize: 11, color: palette.text.disabled, marginTop: 4, textAlign: 'center' }]}>
                  {t('onboarding.calorieBudgetConfirm.refinementNote')}
                </Text>
              </View>
            )}
            
            <View style={cardStyles.tipsContainer}>
              <Text style={cardStyles.tipsTitle}>{t('onboarding.calorieBudgetConfirm.tipsTitle')}</Text>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip1')}
                </Text>
              </View>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip2')}
                </Text>
              </View>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip3')}
                </Text>
              </View>
              
              <View style={cardStyles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={cardStyles.tipIcon} />
                <Text style={cardStyles.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip4')}
                </Text>
              </View>
            </View>
            
            <Text style={cardStyles.noteText}>
              {t('onboarding.calorieBudgetConfirm.note')}
            </Text>
    </OnboardingLayout>
  );
};

export default CalorieBudgetConfirmScreen;

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { calorieBudgetConfirm, palette } from './unifiedStyles';

interface CalorieBudgetConfirmScreenProps {
  onContinue: () => void;
  onBack: () => void;
  calorieBudget: number;
  weightLossPlan: string;
}

const CalorieBudgetConfirmScreen: React.FC<CalorieBudgetConfirmScreenProps> = ({ 
  onContinue, 
  onBack,
  calorieBudget = 1500, // Значение по умолчанию, если не передано
  weightLossPlan = 'steady' // Значение по умолчанию, если не передано
}) => {
  const { t } = useTranslation();
  
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

            <View style={calorieBudgetConfirm.budgetCardContainer}>
              <View style={calorieBudgetConfirm.budgetCard}>
                <View style={calorieBudgetConfirm.calorieDisplay}>
                  <Text style={calorieBudgetConfirm.calorieValue}>{calorieBudget}</Text>
                  <Text style={calorieBudgetConfirm.calorieUnit}>{t('onboarding.calorieBudgetConfirm.kcalPerDay')}</Text>
                </View>
                
                <View style={calorieBudgetConfirm.divider} />
                
                <View style={calorieBudgetConfirm.budgetDetails}>
                  <View style={calorieBudgetConfirm.detailItem}>
                    <Ionicons name="trending-down-outline" size={20} color={palette.primary} />
                    <Text style={calorieBudgetConfirm.detailText}>
                      {t('onboarding.calorieBudgetConfirm.lossPerWeek', { rate: weightLossRate })}
                    </Text>
                  </View>
                  
                  <View style={calorieBudgetConfirm.detailItem}>
                    <Ionicons name="calendar-outline" size={20} color={palette.primary} />
                    <Text style={calorieBudgetConfirm.detailText}>
                      {t('onboarding.calorieBudgetConfirm.goalAchievement', { weeks: weeksToGoal })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={calorieBudgetConfirm.tipsContainer}>
              <Text style={calorieBudgetConfirm.tipsTitle}>{t('onboarding.calorieBudgetConfirm.tipsTitle')}</Text>
              
              <View style={calorieBudgetConfirm.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={calorieBudgetConfirm.tipIcon} />
                <Text style={calorieBudgetConfirm.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip1')}
                </Text>
              </View>
              
              <View style={calorieBudgetConfirm.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={calorieBudgetConfirm.tipIcon} />
                <Text style={calorieBudgetConfirm.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip2')}
                </Text>
              </View>
              
              <View style={calorieBudgetConfirm.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={calorieBudgetConfirm.tipIcon} />
                <Text style={calorieBudgetConfirm.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip3')}
                </Text>
              </View>
              
              <View style={calorieBudgetConfirm.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={palette.success} style={calorieBudgetConfirm.tipIcon} />
                <Text style={calorieBudgetConfirm.tipText}>
                  {t('onboarding.calorieBudgetConfirm.tips.tip4')}
                </Text>
              </View>
            </View>
            
            <Text style={calorieBudgetConfirm.noteText}>
              {t('onboarding.calorieBudgetConfirm.note')}
            </Text>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default CalorieBudgetConfirmScreen;

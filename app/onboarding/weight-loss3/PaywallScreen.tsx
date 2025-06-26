import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette } from './unifiedStyles';

interface PaywallScreenProps {
  onContinue: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onContinue,
  onBack,
  onSkip
}) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState('3-month');
  
  // Получаем динамические стили
  const palette = usePalette();

  // Динамические стили для этого экрана
  const headerContainerStyle = {
    alignItems: 'center' as const,
    marginBottom: 32,
  };

  const premiumBadgeStyle = {
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  };

  const premiumBadgeTextStyle = {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  };

  const mainTitleStyle = {
    fontSize: 28,
    fontWeight: '700' as const,
    color: palette.text.primary,
    textAlign: 'center' as const,
    marginBottom: 8,
  };

  const mainSubtitleStyle = {
    fontSize: 16,
    color: palette.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  };

  const plansContainerStyle = {
    marginBottom: 32,
  };

  const planOptionStyle = {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: palette.border.inactive,
    position: 'relative' as const,
  };

  const selectedPlanStyle = {
    borderColor: palette.primary,
    backgroundColor: palette.surface,
  };

  const popularBadgeStyle = {
    position: 'absolute' as const,
    top: -8,
    right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  };

  const popularBadgeTextStyle = {
    color: palette.white,
    fontSize: 12,
    fontWeight: '600' as const,
  };

  const planDurationStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 4,
  };

  const planPriceStyle = {
    fontSize: 24,
    fontWeight: '700' as const,
    color: palette.primary,
    marginBottom: 4,
  };

  const planPeriodStyle = {
    fontSize: 14,
    color: palette.text.secondary,
    marginBottom: 8,
  };

  const planSavingsStyle = {
    fontSize: 14,
    color: palette.success,
    fontWeight: '600' as const,
  };

  const benefitsListStyle = {
    marginBottom: 32,
  };

  const benefitItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  };

  const benefitIconStyle = {
    marginRight: 12,
  };

  const benefitTextStyle = {
    fontSize: 16,
    color: palette.text.primary,
    flex: 1,
  };

  const subscribeButtonStyle = {
    backgroundColor: palette.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    marginBottom: 16,
  };

  const subscribeButtonTextStyle = {
    color: palette.white,
    fontSize: 18,
    fontWeight: '600' as const,
  };

  const restoreButtonStyle = {
    padding: 16,
    alignItems: 'center' as const,
    marginBottom: 16,
  };

  const restoreButtonTextStyle = {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '500' as const,
  };

  const termsContainerStyle = {
    marginBottom: 20,
  };

  const termsTextStyle = {
    fontSize: 12,
    color: palette.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 16,
  };

  const plans = [
    {
      id: '1-month',
      duration: t('onboarding.paywall.plans.month1.duration'),
      price: t('onboarding.paywall.plans.month1.price'),
      period: t('onboarding.paywall.plans.month1.period'),
      savings: null,
      popular: false
    },
    {
      id: '3-month',
      duration: t('onboarding.paywall.plans.month3.duration'),
      price: t('onboarding.paywall.plans.month3.price'),
      period: t('onboarding.paywall.plans.month3.period'),
      savings: t('onboarding.paywall.plans.month3.savings'),
      popular: true
    },
    {
      id: '12-month',
      duration: t('onboarding.paywall.plans.month12.duration'),
      price: t('onboarding.paywall.plans.month12.price'),
      period: t('onboarding.paywall.plans.month12.period'),
      savings: t('onboarding.paywall.plans.month12.savings'),
      popular: false
    }
  ];

  const benefits = [
    t('onboarding.paywall.benefits.mealPlans'),
    t('onboarding.paywall.benefits.tracking'),
    t('onboarding.paywall.benefits.workouts'),
    t('onboarding.paywall.benefits.progress'),
    t('onboarding.paywall.benefits.recipes'),
    t('onboarding.paywall.benefits.tips'),
    t('onboarding.paywall.benefits.support')
  ];

  return (
    <OnboardingLayout
      title={t('onboarding.paywall.title')}
      subtitle=""
      onContinue={onContinue}
      onBack={onBack}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={headerContainerStyle}>
          <View style={premiumBadgeStyle}>
            <Text style={premiumBadgeTextStyle}>{t('onboarding.paywall.premiumBadge')}</Text>
          </View>
          
          <Text style={mainTitleStyle}>
            {t('onboarding.paywall.mainTitle')}
          </Text>
          
          <Text style={mainSubtitleStyle}>
            {t('onboarding.paywall.mainSubtitle')}
          </Text>
        </View>

        {/* Планы подписки */}
        <View style={plansContainerStyle}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                planOptionStyle,
                selectedPlan === plan.id && selectedPlanStyle
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={popularBadgeStyle}>
                  <Text style={popularBadgeTextStyle}>{t('onboarding.paywall.mostPopular')}</Text>
                </View>
              )}
              
              <Text style={planDurationStyle}>{plan.duration}</Text>
              <Text style={planPriceStyle}>{plan.price}</Text>
              <Text style={planPeriodStyle}>{plan.period}</Text>
              {plan.savings && (
                <Text style={planSavingsStyle}>{plan.savings}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Преимущества */}
        <View style={benefitsListStyle}>
          {benefits.map((benefit, index) => (
            <View key={index} style={benefitItemStyle}>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={palette.success} 
                style={benefitIconStyle}
              />
              <Text style={benefitTextStyle}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Кнопки подписки */}
        <TouchableOpacity 
          style={subscribeButtonStyle}
          onPress={onContinue}
        >
          <Text style={subscribeButtonTextStyle}>
            {t('onboarding.paywall.startPremium')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={restoreButtonStyle}
          onPress={() => {
            // Логика восстановления покупок
            console.log('Restore purchases');
          }}
        >
          <Text style={restoreButtonTextStyle}>
            {t('onboarding.paywall.restorePurchases')}
          </Text>
        </TouchableOpacity>

        {/* Условия использования */}
        <View style={termsContainerStyle}>
          <Text style={termsTextStyle}>
            {t('onboarding.paywall.termsText')}
          </Text>
        </View>

        {onSkip && (
          <TouchableOpacity 
            style={restoreButtonStyle}
            onPress={onSkip}
          >
            <Text style={restoreButtonTextStyle}>
              {t('onboarding.paywall.continueWithFree')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
};

export default PaywallScreen; 
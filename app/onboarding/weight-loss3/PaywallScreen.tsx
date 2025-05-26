import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { palette, paywall } from './unifiedStyles';

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
        <View style={paywall.headerContainer}>
          <View style={paywall.premiumBadge}>
            <Text style={paywall.premiumBadgeText}>{t('onboarding.paywall.premiumBadge')}</Text>
          </View>
          
          <Text style={paywall.mainTitle}>
            {t('onboarding.paywall.mainTitle')}
          </Text>
          
          <Text style={paywall.mainSubtitle}>
            {t('onboarding.paywall.mainSubtitle')}
          </Text>
        </View>

        {/* Планы подписки */}
        <View style={paywall.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                paywall.planOption,
                selectedPlan === plan.id && paywall.selectedPlan
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={paywall.popularBadge}>
                  <Text style={paywall.popularBadgeText}>{t('onboarding.paywall.mostPopular')}</Text>
                </View>
              )}
              
              <Text style={paywall.planDuration}>{plan.duration}</Text>
              <Text style={paywall.planPrice}>{plan.price}</Text>
              <Text style={paywall.planPeriod}>{plan.period}</Text>
              {plan.savings && (
                <Text style={paywall.planSavings}>{plan.savings}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Преимущества */}
        <View style={paywall.benefitsList}>
          {benefits.map((benefit, index) => (
            <View key={index} style={paywall.benefitItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={palette.success} 
                style={paywall.benefitIcon}
              />
              <Text style={paywall.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Кнопки подписки */}
        <TouchableOpacity 
          style={paywall.subscribeButton}
          onPress={onContinue}
        >
          <Text style={paywall.subscribeButtonText}>
            {t('onboarding.paywall.startPremium')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={paywall.restoreButton}
          onPress={() => {
            // Логика восстановления покупок
            console.log('Restore purchases');
          }}
        >
          <Text style={paywall.restoreButtonText}>
            {t('onboarding.paywall.restorePurchases')}
          </Text>
        </TouchableOpacity>

        {/* Условия использования */}
        <View style={paywall.termsContainer}>
          <Text style={paywall.termsText}>
            {t('onboarding.paywall.termsText')}
          </Text>
        </View>

        {onSkip && (
          <TouchableOpacity 
            style={paywall.restoreButton}
            onPress={onSkip}
          >
            <Text style={paywall.restoreButtonText}>
              {t('onboarding.paywall.continueWithFree')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
};

export default PaywallScreen; 
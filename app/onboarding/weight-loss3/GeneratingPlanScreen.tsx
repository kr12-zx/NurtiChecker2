import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { generatingPlan, palette } from './unifiedStyles';

interface GeneratingPlanScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const GeneratingPlanScreen: React.FC<GeneratingPlanScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();
  const [currentVariant, setCurrentVariant] = useState(0);
  
  const variants = [
    {
      icon: 'star' as const,
      mainText: t('onboarding.generatingPlan.variants.stars.main'),
      subText: t('onboarding.generatingPlan.variants.stars.sub')
    },
    {
      icon: 'barbell' as const,
      mainText: t('onboarding.generatingPlan.variants.pounds.main'),
      subText: t('onboarding.generatingPlan.variants.pounds.sub')
    },
    {
      icon: 'restaurant' as const,
      mainText: t('onboarding.generatingPlan.variants.foods.main'),
      subText: t('onboarding.generatingPlan.variants.foods.sub')
    },
    {
      icon: 'people' as const,
      mainText: t('onboarding.generatingPlan.variants.members.main'),
      subText: t('onboarding.generatingPlan.variants.members.sub')
    }
  ];

  useEffect(() => {
    // Автоматически переключаем варианты каждые 1.5 секунды
    const interval = setInterval(() => {
      setCurrentVariant((prev) => (prev + 1) % variants.length);
    }, 1500);

    // Автоматически переходим на следующий экран через 6 секунд
    const timeout = setTimeout(() => {
      onContinue();
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onContinue]);

  const currentVariantData = variants[currentVariant];

  return (
    <OnboardingLayout
      title={t('onboarding.generatingPlan.title')}
      subtitle=""
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={generatingPlan.loadingContainer}>
        {/* Иконка загрузки */}
        <View style={generatingPlan.loadingIconContainer}>
          <Ionicons 
            name={currentVariantData.icon} 
            size={36} 
            color={palette.primary} 
          />
        </View>

        {/* Социальное доказательство */}
        <Text style={generatingPlan.socialProofTitle}>
          {currentVariantData.mainText}
        </Text>
        
        <Text style={generatingPlan.socialProofSubtitle}>
          {currentVariantData.subText}
        </Text>

        {/* Индикатор загрузки */}
        <View style={generatingPlan.loadingIndicatorContainer}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                generatingPlan.loadingDot,
                { opacity: (currentVariant % 3) === i ? 1 : 0.3 }
              ]}
            />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

export default GeneratingPlanScreen; 
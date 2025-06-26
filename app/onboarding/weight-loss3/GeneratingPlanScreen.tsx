import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette } from './unifiedStyles';

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
  
  // Получаем динамические стили
  const palette = usePalette();

  // Динамические стили для этого экрана
  const loadingContainerStyle = {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  };

  const loadingIconContainerStyle = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const socialProofTitleStyle = {
    fontSize: 24,
    fontWeight: '700' as const,
    color: palette.text.primary,
    textAlign: 'center' as const,
    marginBottom: 8,
    paddingHorizontal: 20,
  };

  const socialProofSubtitleStyle = {
    fontSize: 16,
    color: palette.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 40,
  };

  const loadingIndicatorContainerStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 8,
  };

  const loadingDotStyle = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary,
  };
  
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
      <View style={loadingContainerStyle}>
        {/* Иконка загрузки */}
        <View style={loadingIconContainerStyle}>
          <Ionicons 
            name={currentVariantData.icon} 
            size={36} 
            color={palette.primary} 
          />
        </View>

        {/* Социальное доказательство */}
        <Text style={socialProofTitleStyle}>
          {currentVariantData.mainText}
        </Text>
        
        <Text style={socialProofSubtitleStyle}>
          {currentVariantData.subText}
        </Text>

        {/* Индикатор загрузки */}
        <View style={loadingIndicatorContainerStyle}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                loadingDotStyle,
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
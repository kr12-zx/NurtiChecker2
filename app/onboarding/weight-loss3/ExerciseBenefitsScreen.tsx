import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, usePalette } from './unifiedStyles';

interface ExerciseBenefitsScreenProps {
  onContinue: () => void;
  onBack: () => void;
  exerciseIntent: boolean;
}

const ExerciseBenefitsScreen: React.FC<ExerciseBenefitsScreenProps> = ({ 
  onContinue, 
  onBack,
  exerciseIntent
}) => {
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const palette = usePalette();
  const cardStyles = useCardStyles();
  
  // Определяем контент в зависимости от выбора пользователя
  const title = exerciseIntent 
    ? t('onboarding.exerciseBenefits.titlePositive')
    : t('onboarding.exerciseBenefits.titleNeutral');
    
  const subtitle = exerciseIntent
    ? t('onboarding.exerciseBenefits.subtitlePositive')
    : t('onboarding.exerciseBenefits.subtitleNeutral');

  const benefitItems = [
    {
      icon: 'flame-outline',
      title: t('onboarding.exerciseBenefits.benefits.calories.title'),
      description: t('onboarding.exerciseBenefits.benefits.calories.description')
    },
    {
      icon: 'barbell-outline',
      title: t('onboarding.exerciseBenefits.benefits.muscle.title'),
      description: t('onboarding.exerciseBenefits.benefits.muscle.description')
    },
    {
      icon: 'heart-outline',
      title: t('onboarding.exerciseBenefits.benefits.heart.title'),
      description: t('onboarding.exerciseBenefits.benefits.heart.description')
    },
    {
      icon: 'happy-outline',
      title: t('onboarding.exerciseBenefits.benefits.mood.title'),
      description: t('onboarding.exerciseBenefits.benefits.mood.description')
    }
  ];

  const recommendationText = exerciseIntent
    ? t('onboarding.exerciseBenefits.recommendationPositive')
    : t('onboarding.exerciseBenefits.recommendationNeutral');

  return (
    <OnboardingLayout
      title={title}
      subtitle={subtitle}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={{ marginTop: 20 }}>
        {benefitItems.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, paddingHorizontal: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <Ionicons name={item.icon as any} size={24} color={palette.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: palette.text.primary, marginBottom: 4 }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 14, color: palette.text.secondary, lineHeight: 20 }}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={[cardStyles.infoContainer, { marginTop: 20 }]}>
        <Text style={cardStyles.infoText}>
          {recommendationText}
        </Text>
      </View>
      
      <View style={[cardStyles.noteContainer, { marginTop: 16 }]}>
        <Text style={cardStyles.noteText}>
          {t('onboarding.exerciseBenefits.note')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default ExerciseBenefitsScreen;

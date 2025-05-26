import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { exerciseBenefits, palette } from './unifiedStyles';

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
      <View style={exerciseBenefits.benefitsContainer}>
        {benefitItems.map((item, index) => (
          <View key={index} style={exerciseBenefits.benefitItem}>
            <View style={exerciseBenefits.benefitIconContainer}>
              <Ionicons name={item.icon as any} size={24} color={palette.primary} />
            </View>
            <View style={exerciseBenefits.benefitTextContainer}>
              <Text style={exerciseBenefits.benefitTitle}>{item.title}</Text>
              <Text style={exerciseBenefits.benefitDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={exerciseBenefits.recommendationContainer}>
        <Text style={exerciseBenefits.recommendationText}>
          {recommendationText}
        </Text>
      </View>
      
      <View style={exerciseBenefits.noteContainer}>
        <Text style={exerciseBenefits.noteText}>
          {t('onboarding.exerciseBenefits.note')}
        </Text>
      </View>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default ExerciseBenefitsScreen;

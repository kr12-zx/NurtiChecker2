import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { program, typography, usePalette } from './unifiedStyles';

interface WelcomeScreenProps {
  onContinue: () => void;
  onBack?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue, onBack }) => {
  // Используем хук для получения палитры в зависимости от текущей темы
  const palette = usePalette();
  const { t } = useTranslation();

  return (
    <OnboardingLayout
      title={t('onboarding.welcome.title')}
      subtitle={t('onboarding.welcome.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
      hideBackButton={true}
    >
      <View style={program.container}>
        <Text style={[typography.optionTitle, program.title]}>{t('onboarding.welcome.program')}</Text>
              
        <View style={program.steps}>
          <View style={program.step}>
            <View style={program.iconContainer}>
              <Ionicons name="scale-outline" size={36} color={palette.primary} />
            </View>
            <Text style={[typography.optionDescription, program.title]}>
              {t('onboarding.welcome.steps.weightGoal')}
            </Text>
          </View>
          
          <View style={program.step}>
            <View style={program.iconContainer}>
              <Ionicons name="calculator-outline" size={36} color={palette.primary} />
            </View>
            <Text style={[typography.optionDescription, program.title]}>
              {t('onboarding.welcome.steps.calories')}
            </Text>
          </View>
          
          <View style={program.step}>
            <View style={program.iconContainer}>
              <Ionicons name="calendar-outline" size={36} color={palette.primary} />
            </View>
            <Text style={[typography.optionDescription, program.title]}>
              {t('onboarding.welcome.steps.mealSchedule')}
            </Text>
          </View>
          
          <View style={program.step}>
            <View style={program.iconContainer}>
              <Ionicons name="nutrition-outline" size={36} color={palette.primary} />
            </View>
            <Text style={[typography.optionDescription, program.title]}>
              {t('onboarding.welcome.steps.nutrition')}
            </Text>
          </View>
          
          <View style={program.step}>
            <View style={program.iconContainer}>
              <Ionicons name="fitness-outline" size={36} color={palette.primary} />
            </View>
            <Text style={[typography.optionDescription, program.title]}>
              {t('onboarding.welcome.steps.exercise')}
            </Text>
          </View>
          
          <View style={program.step}>
            <View style={program.iconContainer}>
              <Ionicons name="analytics-outline" size={36} color={palette.primary} />
            </View>
            <Text style={[typography.optionDescription, program.title]}>
              {t('onboarding.welcome.steps.progress')}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Локальные стили больше не используются - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default WelcomeScreen;

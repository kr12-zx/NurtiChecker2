import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, nutritionIntro, palette, typography } from './unifiedStyles';

interface NutritionIntroScreenProps {
  onContinue: () => void;
  onBack: () => void;
  calorieBudget: number;
  weightLossRate: number;
  useFlexibleCalories: boolean;
}

const NutritionIntroScreen: React.FC<NutritionIntroScreenProps> = ({
  onContinue,
  onBack,
  calorieBudget = 1500,
  weightLossRate = 0.75,
  useFlexibleCalories = false
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const calorieScheduleText = useFlexibleCalories 
    ? t('onboarding.nutritionIntro.flexibleSchedule')
    : t('onboarding.nutritionIntro.fixedBudget');

  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      <View style={containers.rootContainer}>
        {/* Основной контент */}
        <View style={containers.contentContainer}>
          <ScrollView
            style={containers.scrollView}
            contentContainerStyle={containers.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={typography.screenTitle}>
              {t('onboarding.nutritionIntro.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.nutritionIntro.subtitle')}
            </Text>
            
            <View style={nutritionIntro.programContainer}>
              <Text style={nutritionIntro.programTitle}>{t('onboarding.nutritionIntro.program')}</Text>
              
              <View style={nutritionIntro.programContent}>
                <View style={[nutritionIntro.programItem, nutritionIntro.activeItem]}>
                  <View style={nutritionIntro.programIconContainer}>
                    <Ionicons name="trending-down-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={nutritionIntro.programText}>
                    {t('onboarding.nutritionIntro.weightLoss')}
                  </Text>
                  <View style={nutritionIntro.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.primary} />
                  </View>
                </View>
                
                <View style={[nutritionIntro.programItem, nutritionIntro.activeItem]}>
                  <View style={nutritionIntro.programIconContainer}>
                    <Ionicons name="calculator-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={nutritionIntro.programText}>
                    {t('onboarding.nutritionIntro.kcalPerDay', { calories: calorieBudget })}
                  </Text>
                  <View style={nutritionIntro.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.primary} />
                  </View>
                </View>
                
                <View style={[nutritionIntro.programItem, nutritionIntro.activeItem]}>
                  <View style={nutritionIntro.programIconContainer}>
                    <Ionicons name="speedometer-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={nutritionIntro.programText}>
                    {t('onboarding.nutritionIntro.lossPerWeek', { rate: weightLossRate })}
                  </Text>
                  <View style={nutritionIntro.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.primary} />
                  </View>
                </View>
                
                <View style={[nutritionIntro.programItem, nutritionIntro.activeItem]}>
                  <View style={nutritionIntro.programIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={nutritionIntro.programText}>
                    {calorieScheduleText}
                  </Text>
                  <View style={nutritionIntro.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.primary} />
                  </View>
                </View>
                
                <View style={[nutritionIntro.programItem, nutritionIntro.nextStepItem]}>
                  <View style={nutritionIntro.programIconContainer}>
                    <Ionicons name="nutrition-outline" size={20} color={palette.primary} />
                  </View>
                  <Text style={nutritionIntro.programText}>
                    {t('onboarding.nutritionIntro.nutritionStrategy')}
                  </Text>
                </View>
                
                <View style={[nutritionIntro.programItem, nutritionIntro.inactiveItem]}>
                  <View style={nutritionIntro.programIconContainer}>
                    <Ionicons name="time-outline" size={20} color={palette.text.disabled} />
                  </View>
                  <Text style={[nutritionIntro.programText, nutritionIntro.inactiveText]}>
                    {t('onboarding.nutritionIntro.intermittentFasting')}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={nutritionIntro.infoContainer}>
              <Text style={nutritionIntro.infoTitle}>{t('onboarding.nutritionIntro.whyImportant')}</Text>
              
              <View style={nutritionIntro.infoItem}>
                <View style={nutritionIntro.infoIconContainer}>
                  <Ionicons name="battery-charging-outline" size={20} color={palette.primary} />
                </View>
                <Text style={nutritionIntro.infoText}>
                  {t('onboarding.nutritionIntro.infoItems.energy')}
                </Text>
              </View>
              
              <View style={nutritionIntro.infoItem}>
                <View style={nutritionIntro.infoIconContainer}>
                  <Ionicons name="pizza-outline" size={20} color={palette.primary} />
                </View>
                <Text style={nutritionIntro.infoText}>
                  {t('onboarding.nutritionIntro.infoItems.quality')}
                </Text>
              </View>
              
              <View style={nutritionIntro.infoItem}>
                <View style={nutritionIntro.infoIconContainer}>
                  <Ionicons name="pulse-outline" size={20} color={palette.primary} />
                </View>
                <Text style={nutritionIntro.infoText}>
                  {t('onboarding.nutritionIntro.infoItems.wellbeing')}
                </Text>
              </View>
            </View>
            
            <View style={nutritionIntro.nextStepsContainer}>
              <Text style={nutritionIntro.nextStepsText}>
                {t('onboarding.nutritionIntro.nextSteps')}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter
          onBack={onBack}
          onContinue={onContinue}
          disableContinue={false}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default NutritionIntroScreen;

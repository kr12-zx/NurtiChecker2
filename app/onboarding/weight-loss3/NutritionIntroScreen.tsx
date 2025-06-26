import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { useCardStyles, useContainerStyles, usePalette, useProgramContainerStyles, useTypographyStyles } from './unifiedStyles';

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

  // Используем хуки для получения динамических стилей
  const containers = useContainerStyles();
  const typography = useTypographyStyles();
  const palette = usePalette();
  const programStyles = useProgramContainerStyles();
  const cardStyles = useCardStyles();

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
            
            <View style={programStyles.programContainer}>
              <Text style={programStyles.programTitle}>{t('onboarding.nutritionIntro.program')}</Text>
              
              <View style={programStyles.programContent}>
                <View style={[programStyles.programItem, programStyles.activeItem]}>
                  <View style={programStyles.programIconContainer}>
                    <Ionicons name="trending-down-outline" size={20} color={palette.white} />
                  </View>
                  <Text style={programStyles.programText}>
                    {t('onboarding.nutritionIntro.weightLoss')}
                  </Text>
                  <View style={programStyles.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.white} />
                  </View>
                </View>
                
                <View style={[programStyles.programItem, programStyles.activeItem]}>
                  <View style={programStyles.programIconContainer}>
                    <Ionicons name="calculator-outline" size={20} color={palette.white} />
                  </View>
                  <Text style={programStyles.programText}>
                    {t('onboarding.nutritionIntro.kcalPerDay', { calories: calorieBudget })}
                  </Text>
                  <View style={programStyles.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.white} />
                  </View>
                </View>
                
                <View style={[programStyles.programItem, programStyles.activeItem]}>
                  <View style={programStyles.programIconContainer}>
                    <Ionicons name="speedometer-outline" size={20} color={palette.white} />
                  </View>
                  <Text style={programStyles.programText}>
                    {t('onboarding.nutritionIntro.lossPerWeek', { rate: weightLossRate })}
                  </Text>
                  <View style={programStyles.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.white} />
                  </View>
                </View>
                
                <View style={[programStyles.programItem, programStyles.activeItem]}>
                  <View style={programStyles.programIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color={palette.white} />
                  </View>
                  <Text style={programStyles.programText}>
                    {calorieScheduleText}
                  </Text>
                  <View style={programStyles.programCheckmark}>
                    <Ionicons name="checkmark" size={16} color={palette.white} />
                  </View>
                </View>
                
                <View style={[programStyles.programItem, programStyles.nextStepItem]}>
                  <View style={programStyles.programIconContainer}>
                    <Ionicons name="nutrition-outline" size={20} color={palette.white} />
                  </View>
                  <Text style={programStyles.programText}>
                    {t('onboarding.nutritionIntro.nutritionStrategy')}
                  </Text>
                </View>
                
                <View style={[programStyles.programItem, programStyles.inactiveItem]}>
                  <View style={programStyles.programIconContainer}>
                    <Ionicons name="time-outline" size={20} color={palette.text.disabled} />
                  </View>
                  <Text style={[programStyles.programText, programStyles.inactiveText]}>
                    {t('onboarding.nutritionIntro.intermittentFasting')}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={cardStyles.infoContainer}>
              <Text style={cardStyles.infoTitle}>{t('onboarding.nutritionIntro.whyImportant')}</Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="battery-charging-outline" size={20} color={palette.primary} />
                </View>
                <Text style={cardStyles.infoText}>
                  {t('onboarding.nutritionIntro.infoItems.energy')}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="pizza-outline" size={20} color={palette.primary} />
                </View>
                <Text style={cardStyles.infoText}>
                  {t('onboarding.nutritionIntro.infoItems.quality')}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Ionicons name="pulse-outline" size={20} color={palette.primary} />
                </View>
                <Text style={cardStyles.infoText}>
                  {t('onboarding.nutritionIntro.infoItems.wellbeing')}
                </Text>
              </View>
            </View>
            
            <View style={cardStyles.noteContainer}>
              <Text style={cardStyles.noteText}>
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

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import { UserProfile } from '../../types/onboarding';
import ButtonFooter from './components/ButtonFooter';
import { useContainerStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface SummaryPlanScreenProps {
  onContinue: () => void;
  onBack: () => void;
  onClose?: () => void;
  userProfile: Partial<UserProfile>;
}

const SummaryPlanScreen: React.FC<SummaryPlanScreenProps> = ({ 
  onContinue, 
  onBack,
  onClose,
  userProfile
}) => {
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const palette = usePalette();
  const containers = useContainerStyles();
  const typography = useTypographyStyles();
  
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [planReady, setPlanReady] = React.useState(false);
  const [planFilePath, setPlanFilePath] = React.useState<string | null>(null);
  
  // Динамические стили для этого экрана
  const planStatusContainerStyle = {
    backgroundColor: palette.surface,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const statusTextStyle = {
    fontSize: 16,
    color: palette.text.primary,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  };

  const actionButtonsContainerStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
    gap: 12,
  };

  const actionButtonStyle = {
    flex: 1,
    backgroundColor: palette.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  };

  const actionButtonTextStyle = {
    fontSize: 16,
    color: palette.white,
    fontWeight: '600' as const,
  };

  const infoContainerStyle = {
    marginBottom: 20,
  };

  const infoTitleStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 16,
  };

  const infoItemStyle = {
    flexDirection: 'row' as const,
    marginBottom: 8,
  };

  const infoBulletStyle = {
    fontSize: 16,
    color: palette.primary,
    marginRight: 8,
    fontWeight: '600' as const,
  };

  const infoTextStyle = {
    fontSize: 14,
    color: palette.text.primary,
    flex: 1,
    lineHeight: 20,
  };

  const nextStepContainerStyle = {
    backgroundColor: palette.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const nextStepTitleStyle = {
    fontSize: 16,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 8,
  };

  const nextStepTextStyle = {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
  };
  
  // Генерируем план при монтировании компонента
  React.useEffect(() => {
    generatePlan();
  }, []);
  
  // Функция генерации плана в формате HTML или текстового файла
  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      
      // Структура плана
      const planContent = generatePlanContent();
      
      // Создаем имя файла
      const fileName = `nutriplan_${new Date().toISOString().split('T')[0]}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Записываем план в файл
      await FileSystem.writeAsStringAsync(filePath, planContent);
      
      // Сохраняем ссылку на план в AsyncStorage для дальнейшего использования
      await AsyncStorage.setItem('latestNutriPlan', filePath);
      
      setPlanFilePath(filePath);
      setPlanReady(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('Ошибка при генерации плана:', error);
      setIsGenerating(false);
    }
  };
  
  // Функция для определения темпа снижения веса
  const getWeightLossPace = () => {
    if (!userProfile.weightLossPlan) return t('onboarding.summaryPlan.weightLoss.moderate');
    
    switch (userProfile.weightLossPlan) {
      case 'steady':
        return t('onboarding.summaryPlan.weightLoss.steady');
      case 'moderate':
        return t('onboarding.summaryPlan.weightLoss.moderate');
      case 'aggressive':
        return t('onboarding.summaryPlan.weightLoss.aggressive');
      default:
        return t('onboarding.summaryPlan.weightLoss.moderate');
    }
  };
  
  // Функция генерации содержимого плана на основе данных пользователя
  const generatePlanContent = () => {
    // Рассчитываем возраст
    const birthDate = userProfile.birthday ? new Date(userProfile.birthday) : new Date();
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Рассчитываем ИМТ
    const heightInMeters = (userProfile.height || 170) / 100;
    const bmi = (userProfile.weight || 70) / (heightInMeters * heightInMeters);
    
    // Получаем название активности
    const getActivityName = () => {
      const activityLevel = userProfile.activityLevel || 'moderately-active';
      switch (activityLevel) {
        case 'sedentary': return t('onboarding.summaryPlan.activityLevels.sedentary');
        case 'lightly-active': return t('onboarding.summaryPlan.activityLevels.lightlyActive');
        case 'moderately-active': return t('onboarding.summaryPlan.activityLevels.moderatelyActive');
        case 'very-active': return t('onboarding.summaryPlan.activityLevels.veryActive');
        case 'extremely-active': return t('onboarding.summaryPlan.activityLevels.extremelyActive');
        default: return t('onboarding.summaryPlan.activityLevels.moderatelyActive');
      }
    };
    
    // Примерное время достижения цели
    const calculateGoalTime = () => {
      if (!userProfile.weight || !userProfile.goalWeight) return t('onboarding.summaryPlan.goalTime.notDetermined');
      
      const weightToLose = userProfile.weight - userProfile.goalWeight;
      if (weightToLose <= 0) return t('onboarding.summaryPlan.goalTime.maintenance');
      
      let weeklyRate = 0.5; // по умолчанию 0.5 кг в неделю
      
      if (userProfile.weightLossPlan === 'moderate') {
        weeklyRate = 0.75;
      } else if (userProfile.weightLossPlan === 'aggressive') {
        weeklyRate = 1.0;
      }
      
      const weeksNeeded = Math.ceil(weightToLose / weeklyRate);
      const months = Math.floor(weeksNeeded / 4);
      const remainingWeeks = weeksNeeded % 4;
      
      if (months === 0) {
        return t('onboarding.summaryPlan.goalTime.weeks', { weeks: weeksNeeded });
      } else if (remainingWeeks === 0) {
        return t('onboarding.summaryPlan.goalTime.months', { months });
      } else {
        return t('onboarding.summaryPlan.goalTime.monthsAndWeeks', { months, weeks: remainingWeeks });
      }
    };
    
    return `${t('onboarding.summaryPlan.planContent.title')}
===========================================
${t('onboarding.summaryPlan.planContent.dateCreated')}: ${new Date().toLocaleDateString('ru-RU')}

${t('onboarding.summaryPlan.planContent.personalInfo')}
----------------------
${t('onboarding.summaryPlan.planContent.name')}: ${t('onboarding.summaryPlan.planContent.notSpecified')}
${t('onboarding.summaryPlan.planContent.gender')}: ${userProfile.gender === 'male' ? t('onboarding.summaryPlan.planContent.genders.male') : t('onboarding.summaryPlan.planContent.genders.female')}
${t('onboarding.summaryPlan.planContent.age')}: ${age} ${t('onboarding.summaryPlan.planContent.years')}
${t('onboarding.summaryPlan.planContent.height')}: ${userProfile.height} ${t('onboarding.summaryPlan.planContent.cm')}
${t('onboarding.summaryPlan.planContent.currentWeight')}: ${userProfile.weight} ${t('onboarding.summaryPlan.planContent.kg')}
${t('onboarding.summaryPlan.planContent.targetWeight')}: ${userProfile.goalWeight || userProfile.weight} ${t('onboarding.summaryPlan.planContent.kg')}
${t('onboarding.summaryPlan.planContent.bmi')}: ${bmi.toFixed(1)}
${t('onboarding.summaryPlan.planContent.activityLevel')}: ${getActivityName()}

${t('onboarding.summaryPlan.planContent.goalsAndPreferences')}
-------------------
${t('onboarding.summaryPlan.planContent.primaryGoal')}: ${userProfile.primaryGoal || t('onboarding.summaryPlan.planContent.weightLoss')}
${t('onboarding.summaryPlan.planContent.weightLossPace')}: ${getWeightLossPace()}
${t('onboarding.summaryPlan.planContent.estimatedTime')}: ${calculateGoalTime()}
${t('onboarding.summaryPlan.planContent.dietPreferences')}: ${userProfile.dietPreference || t('onboarding.summaryPlan.planContent.mixedDiet')}
${t('onboarding.summaryPlan.planContent.mealFrequency')}: ${userProfile.mealFrequency || t('onboarding.summaryPlan.planContent.threeMealsPerDay')}
${t('onboarding.summaryPlan.planContent.intermittentFasting')}: ${userProfile.intermittentFasting ? t('onboarding.summaryPlan.planContent.yes') : t('onboarding.summaryPlan.planContent.no')}

${t('onboarding.summaryPlan.planContent.nutritionPlan')}
------------
${t('onboarding.summaryPlan.planContent.targetCalories')}: ${userProfile.calorieTarget || t('onboarding.summaryPlan.planContent.willBeCalculated')} ${t('onboarding.summaryPlan.planContent.kcalPerDay')}
${t('onboarding.summaryPlan.planContent.recommendedProtein')}: ${Math.round((userProfile.weight || 70) * 1.6)} - ${Math.round((userProfile.weight || 70) * 2)} ${t('onboarding.summaryPlan.planContent.gPerDay')}
${t('onboarding.summaryPlan.planContent.recommendedWater')}: ${Math.round((userProfile.weight || 70) * 30)} ${t('onboarding.summaryPlan.planContent.mlPerDay')}

${t('onboarding.summaryPlan.planContent.macroDistribution')}:
- ${t('onboarding.summaryPlan.planContent.proteins')}: 30% (${t('onboarding.summaryPlan.planContent.proteinBenefit')})
- ${t('onboarding.summaryPlan.planContent.fats')}: 30% (${t('onboarding.summaryPlan.planContent.fatBenefit')})
- ${t('onboarding.summaryPlan.planContent.carbs')}: 40% (${t('onboarding.summaryPlan.planContent.carbBenefit')})

${userProfile.dietPreference === 'vegetarian' ? 
t('onboarding.summaryPlan.planContent.vegetarianProteinSources') : 
t('onboarding.summaryPlan.planContent.standardProteinSources')}

${t('onboarding.summaryPlan.planContent.workoutRecommendations')}
---------------------------
${userProfile.exerciseIntent ? 
t('onboarding.summaryPlan.planContent.activeWorkoutPlan') : 
t('onboarding.summaryPlan.planContent.lightActivityPlan')}

${t('onboarding.summaryPlan.planContent.psychologicalRecommendations')}
---------------------------
${userProfile.confidenceLevel && userProfile.confidenceLevel < 3 ? 
t('onboarding.summaryPlan.planContent.lowConfidenceAdvice') : 
t('onboarding.summaryPlan.planContent.motivationAdvice')}

${t('onboarding.summaryPlan.planContent.personalizedStrategies')}:
${userProfile.stressResponse === 'emotional_eating' ? 
t('onboarding.summaryPlan.planContent.emotionalEatingStrategies') : 
t('onboarding.summaryPlan.planContent.generalStressStrategies')}

${t('onboarding.summaryPlan.planContent.nextSteps')}
-------------
1. ${t('onboarding.summaryPlan.planContent.step1')}
2. ${t('onboarding.summaryPlan.planContent.step2')}
3. ${t('onboarding.summaryPlan.planContent.step3')}
4. ${t('onboarding.summaryPlan.planContent.step4')}

${t('onboarding.summaryPlan.planContent.planAdjustment')}

===========================================
${t('onboarding.summaryPlan.planContent.footer')} | ${new Date().getFullYear()}
`;
  };
  
  // Функция для отправки плана
  const sharePlan = async () => {
    if (!planFilePath) return;
    
    try {
      // Сначала читаем содержимое файла
      const fileContent = await FileSystem.readAsStringAsync(planFilePath);
      
      // Используем нативный Share API
      const shareOptions = {
        title: t('onboarding.summaryPlan.shareTitle'),
        message: fileContent, // Передаем содержимое файла как текст
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing plan:', error);
    }
  };
  
  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      {/* Кнопка закрытия в левом верхнем углу */}
      {onClose && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 60, // Отступ от верха с учетом SafeArea
            left: 20,
            zIndex: 100,
            padding: 8,
          }}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="close-outline" 
            size={24} 
            color={palette.text.secondary}
          />
        </TouchableOpacity>
      )}
      
      <View style={containers.rootContainer}>
        {/* Основной контент */}
        <View style={containers.contentContainer}>
          <ScrollView 
            style={containers.scrollView}
            contentContainerStyle={containers.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={typography.screenTitle}>
              {t('onboarding.summaryPlan.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.summaryPlan.subtitle')}
            </Text>
            
            <View style={planStatusContainerStyle}>
              {isGenerating ? (
                <>
                  <ActivityIndicator size="large" color={palette.primary} style={{ marginBottom: 16 }} />
                  <Text style={statusTextStyle}>{t('onboarding.summaryPlan.generating')}</Text>
                </>
              ) : planReady ? (
                <>
                  <Text style={statusTextStyle}>{t('onboarding.summaryPlan.planReady')}</Text>
                </>
              ) : (
                <>
                  <Text style={statusTextStyle}>{t('onboarding.summaryPlan.planError')}</Text>
                </>
              )}
            </View>
            
            {planReady && (
              <View style={actionButtonsContainerStyle}>
                <TouchableOpacity 
                  style={actionButtonStyle} 
                  onPress={sharePlan}
                  activeOpacity={0.7}
                >
                  <Text style={actionButtonTextStyle}>{t('onboarding.summaryPlan.share')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[actionButtonStyle, { backgroundColor: "#5C8BEF" }]}
                  onPress={generatePlan}
                  activeOpacity={0.7}
                >
                  <Text style={actionButtonTextStyle}>{t('onboarding.summaryPlan.regenerate')}</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={infoContainerStyle}>
              <Text style={infoTitleStyle}>{t('onboarding.summaryPlan.whatsIncluded')}</Text>
              
              <View style={infoItemStyle}>
                <Text style={infoBulletStyle}>•</Text>
                <Text style={infoTextStyle}>{t('onboarding.summaryPlan.features.nutrition')}</Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoBulletStyle}>•</Text>
                <Text style={infoTextStyle}>{t('onboarding.summaryPlan.features.workouts')}</Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoBulletStyle}>•</Text>
                <Text style={infoTextStyle}>{t('onboarding.summaryPlan.features.calories')}</Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoBulletStyle}>•</Text>
                <Text style={infoTextStyle}>{t('onboarding.summaryPlan.features.motivation')}</Text>
              </View>
            </View>
            
            <View style={nextStepContainerStyle}>
              <Text style={nextStepTitleStyle}>{t('onboarding.summaryPlan.whatsNext')}</Text>
              <Text style={nextStepTextStyle}>
                {t('onboarding.summaryPlan.nextStepsDescription')}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue} 
          continueText={t('onboarding.start')}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default SummaryPlanScreen;

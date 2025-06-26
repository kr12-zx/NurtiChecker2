import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateCompleteNutrition, NutritionCalculationResult } from '../../../utils/nutritionCalculator';
import { ActivityLevel, Challenge, DietPreference, Gender, MealFrequency, PrimaryGoal, UnitSettings, UserProfile } from '../../types/onboarding';
import { getUserEmailId, sendCompletionWebhook, sendPaywallWebhook } from '../../utils/onboardingApi';
import { useContainerStyles, usePalette } from './unifiedStyles';

// Импортируем все экраны онбординга
import ActivityLevelScreen from './ActivityLevelScreen';
import AdaptabilityScreen from './AdaptabilityScreen';
import BirthdayScreen from './BirthdayScreen';
import CalorieBudgetConfirmScreen from './CalorieBudgetConfirmScreen';
import CalorieBudgetInfoScreen from './CalorieBudgetInfoScreen';
import CalorieBudgetIntroScreen from './CalorieBudgetIntroScreen'; // Новый экран
import CalorieCountingScreen from './CalorieCountingScreen';
import CalorieScheduleScreen from './CalorieScheduleScreen';
import ChallengesScreen from './ChallengesScreen';
import ChallengesViewScreen from './ChallengesViewScreen';
import ConfidenceLevelScreen from './ConfidenceLevelScreen';
import DecisionMakingScreen from './DecisionMakingScreen';
import DietPreferenceScreen from './DietPreferenceScreen';
import DifficultSituationsScreen from './DifficultSituationsScreen';
import EatingHabitsAssessmentScreen from './EatingHabitsAssessmentScreen'; // Новый экран
import ExerciseBenefitsScreen from './ExerciseBenefitsScreen';
import ExerciseIntentScreen from './ExerciseIntentScreen';
import FixedCalorieBudgetConfirmScreen from './FixedCalorieBudgetConfirmScreen'; // Новый экран
import FoodPreferencesScreen from './FoodPreferencesScreen';
import FoodVarietyScreen from './FoodVarietyScreen';
import GenderScreen from './GenderScreen';
import GeneratingPlanScreen from './GeneratingPlanScreen'; // Новый экран
import GoalDateIntroScreen from './GoalDateIntroScreen'; // Новый экран
import GoalSetConfirmScreen from './GoalSetConfirmScreen'; // Новый экран
import GoalSettingScreen from './GoalSettingScreen';
import HeightWeightScreen from './HeightWeightScreen';
import IntermittentFastingScreen from './IntermittentFastingScreen';
import IntermittentFastingSkipConfirmScreen from './IntermittentFastingSkipConfirmScreen'; // Новый экран
import MealFeelingsScreen from './MealFeelingsScreen';
import MealFrequencyScreen from './MealFrequencyScreen';
import MedicalDisclaimerScreen from './MedicalDisclaimerScreen'; // Новый экран
import MedicationScreen from './MedicationScreen';
import NutritionFocusScreen from './NutritionFocusScreen';
import NutritionIntroScreen from './NutritionIntroScreen'; // Новый экран
import PaywallScreen from './PaywallScreen'; // Новый экран
import PlanPreviewScreen from './PlanPreviewScreen'; // Новый экран
import PlanSummaryScreen from './PlanSummaryScreen'; // Новый экран
import SetbacksResponseScreen from './SetbacksResponseScreen';
import StressResponseScreen from './StressResponseScreen';
import SummaryPlanScreen from './SummaryPlanScreen';
import SummaryScreen from './SummaryScreen';
import TemptationResponseScreen from './TemptationResponseScreen';
import UnitsScreen from './UnitsScreen';
import WeightLossPlanScreen from './WeightLossPlanScreen';
import WeightManagementObstacleScreen from './WeightManagementObstacleScreen'; // Новый экран
import WelcomeScreen from './WelcomeScreen';

const { width } = Dimensions.get('window');

interface WeightLoss3OnboardingProps {
  startAtStep?: number;
}

export default function WeightLoss3Onboarding({ startAtStep = 0 }: WeightLoss3OnboardingProps) {
  // State для отслеживания текущего шага
  const [currentStep, setCurrentStep] = useState(startAtStep);
  
  // Хуки для стилей и темы
  const colorScheme = useColorScheme();
  const palette = usePalette();
  const containers = useContainerStyles();
  
  // Смещение для анимации
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // State для настроек единиц измерения
  const [unitSettings, setUnitSettings] = useState<UnitSettings>({
    weight: 'kg',
    height: 'cm',
    system: 'metric'
  });
  
  // State для хранения выбранных пользователем калорий
  const [selectedCalories, setSelectedCalories] = useState<number | null>(null);
  
  // useEffect для автоматического пропуска шагов
  React.useEffect(() => {
    // Пропускаем FixedCalorieBudgetConfirmScreen если используется гибкий бюджет
    if (currentStep === 15 && userProfileRef.current.useFlexibleCalories) {
      setCurrentStep(16);
      return;
    }
    
    // Пропускаем IntermittentFastingSkipConfirmScreen если выбрано интервальное голодание
    if (currentStep === 25 && userProfileRef.current.intermittentFasting) {
      setCurrentStep(26);
      return;
    }
    
    // Отправляем webhook при достижении paywall (step 45)
    if (currentStep === 45) {
      const sendPaywallWebhookAsync = async () => {
        try {
          const emailId = await getUserEmailId();
          console.log('🎯 Paywall reached for user:', emailId);
          await sendPaywallWebhook(userProfileRef.current, unitSettings);
        } catch (error) {
          console.error('Error sending paywall webhook:', error);
        }
      };
      
      sendPaywallWebhookAsync();
    }
  }, [currentStep]);
  
  // Хранение данных пользователя
  const userProfileRef = useRef<Partial<UserProfile & {
    // Дополнительные поля для новых экранов
    weightLossPlan: string;
    exerciseIntent: boolean;
    showCalorieTutorial: boolean;
    useFlexibleCalories: boolean;
    nutritionFocus: string;
    mainObstacle: string;
    eatingHabitsAssessment: string;
    intermittentFasting: boolean;
    difficultSituationsHandling: string; 
    challengesView: string; 
    setbacksResponse: string;
    medicationUse: string;
    adaptability: string; 
    foodPreferences: string;
    foodVariety: string;
    mealFeelings: string;
    temptationResponse: string;
    decisionMaking: string;
  }>>({
    // Основные профильные данные
    birthday: '1992-06-15', // 32 года по умолчанию (для 2024 года)
    gender: 'male', // Устанавливаем мужской пол по умолчанию
    height: 176, // Средний рост мужчины по умолчанию
    weight: 87, // 87 кг по умолчанию как на скрине
    primaryGoal: 'lose-weight', // Основная цель - похудение
    goalWeight: 80, // 80 кг - целевой вес для похудения как на скрине
    weightLossRate: 0.25, // Скорость снижения веса (0.25 кг в неделю) - соответствует выбору пользователя
    activityLevel: 'lightly-active', // Слабая активность по умолчанию
    
    // Питание и диета
    dietPreference: 'standard', // Стандартная диета по умолчанию
    nutritionFocus: 'balanced', // Сбалансированное питание
    mealFrequency: '3-meals', // 3 приема пищи по умолчанию
    foodPreferences: 'taste', // Предпочтение вкуса
    foodVariety: 'sometimes', // Иногда пробует новое
    mealFeelings: 'energized', // Энергичность после еды
    intermittentFasting: false, // Без интервального голодания
    
    // План похудения и упражнения
    weightLossPlan: 'steady', // Постепенное снижение веса
    exerciseIntent: false, // Без намерения заниматься спортом
    
    // Калории и бюджет
    showCalorieTutorial: true, // Показывать обучение калориям
    useFlexibleCalories: false, // Фиксированный калорийный бюджет
    
    // Психологические аспекты
    confidenceLevel: 3, // Средний уровень уверенности
    challenges: ['emotional-eating'], // Дефолтный вызов - эмоциональное питание
    challengesView: 'growth-opportunity', // Видеть трудности как возможности
    mainObstacle: 'emotional-eating', // Основное препятствие - эмоциональное питание
    difficultSituationsHandling: 'cope-most', // Справляюсь в большинстве случаев
    setbacksResponse: 'bounce-back', // Быстро восстанавливается
    temptationResponse: 'usually-control', // Обычно контролирует себя
    decisionMaking: 'confident-doubt', // Уверен, но иногда сомневается
    adaptability: 'adapt-time', // Адаптируется, но требуется время
    
    // Оценки привычек
    eatingHabitsAssessment: 'improving', // Стремление к улучшениям
    
    // Медицинские данные
    medicationUse: 'not-using', // Без приема лекарств
    stressResponse: 'emotional-eating', // Заедает стресс
  });
  
  // Максимальное количество шагов
  const MAX_STEPS = 47; // Исправлено согласно оригинальному дизайну (0-46)
  
  // Функция для сохранения профиля и завершения онбординга
  const saveUserProfile = async () => {
    try {
      const userProfile = userProfileRef.current;
      
      // Получаем или создаем email ID пользователя
      const emailId = await getUserEmailId();
      console.log('User Email ID:', emailId);
      
      // Рассчитываем план питания
      const nutritionPlan = calculateNutritionPlan();
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('unitSettings', JSON.stringify(unitSettings));
      
      // Сохраняем план питания, если удалось рассчитать
      if (nutritionPlan) {
        await AsyncStorage.setItem('nutritionPlan', JSON.stringify(nutritionPlan));
        console.log('💾 План питания сохранён:', nutritionPlan);
      }
      
      // Флаг о завершении онбординга
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Отправляем webhook о завершении онбординга
      try {
        await sendCompletionWebhook(userProfile, unitSettings);
      } catch (webhookError) {
        console.error('Webhook error (non-blocking):', webhookError);
      }
      
      console.log('Профиль пользователя сохранен:', userProfile);
      console.log('Настройки единиц измерения:', unitSettings);
      
      // Перенаправление на главный экран
      router.replace('/');
    } catch (error) {
      console.error('Ошибка при сохранении профиля пользователя:', error);
    }
  };
  
  // Функция для запуска 3-дневного пробного периода
  const startTrialPeriod = async () => {
    try {
      const userProfile = userProfileRef.current;
      
      // Получаем или создаем email ID пользователя
      const emailId = await getUserEmailId();
      console.log('User Email ID for trial:', emailId);
      
      // Рассчитываем план питания
      const nutritionPlan = calculateNutritionPlan();
      
      // Устанавливаем дату начала пробного периода
      const trialStartDate = new Date().toISOString();
      const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // +3 дня
      
      // Сохраняем данные пробного периода
      await AsyncStorage.setItem('trialStartDate', trialStartDate);
      await AsyncStorage.setItem('trialEndDate', trialEndDate);
      await AsyncStorage.setItem('isTrialActive', 'true');
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('unitSettings', JSON.stringify(unitSettings));
      
      // Сохраняем план питания, если удалось рассчитать
      if (nutritionPlan) {
        await AsyncStorage.setItem('nutritionPlan', JSON.stringify(nutritionPlan));
        console.log('💾 План питания сохранён для триала:', nutritionPlan);
      }
      
      // Флаг о завершении онбординга
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Отправляем webhook о завершении онбординга с триалом
      try {
        await sendCompletionWebhook(userProfile, unitSettings);
      } catch (webhookError) {
        console.error('Webhook error (non-blocking):', webhookError);
      }
      
      console.log('🎁 Пробный период запущен:', {
        emailId,
        startDate: trialStartDate,
        endDate: trialEndDate,
        userProfile
      });
      
      // Перенаправление на главный экран с активным триалом
      router.replace('/');
    } catch (error) {
      console.error('Ошибка при запуске пробного периода:', error);
    }
  };
  
  // Функция для перехода на следующий шаг
  const goToNextStep = () => {
    if (currentStep < MAX_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Завершение онбординга
      saveUserProfile();
    }
  };
  
  // Функция для возврата на предыдущий шаг
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Обновление данных профиля пользователя
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    userProfileRef.current = {
      ...userProfileRef.current,
      ...updates,
    };
  };

  // Функция для расчета возраста из даты рождения
  const calculateAge = (birthday?: string): number => {
    if (!birthday) return 30; // значение по умолчанию
    
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(age, 18); // минимальный возраст 18 лет
  };
  
  // Функция для расчёта полного плана питания
  const calculateNutritionPlan = (): NutritionCalculationResult | null => {
    try {
      const userProfile = userProfileRef.current;
      console.log('🔍 Начинаем расчёт плана питания для:', userProfile);
      
      // Проверяем наличие всех необходимых данных
      if (!userProfile.weight || !userProfile.height || !userProfile.birthday || !userProfile.gender) {
        console.warn('❌ Недостаточно данных для расчёта питания:', {
          weight: userProfile.weight,
          height: userProfile.height,
          birthday: userProfile.birthday,
          gender: userProfile.gender
        });
        return null;
      }
      
      console.log('✅ Все необходимые данные есть, начинаем расчёт...');
      
      // Конвертируем вес в поле currentWeight для совместимости с калькулятором
      const profileForCalculation = {
        ...userProfile,
        currentWeight: userProfile.weight,
        // Убеждаемся, что все поля имеют значения по умолчанию
        primaryGoal: userProfile.primaryGoal || 'lose-weight',
        activityLevel: userProfile.activityLevel || 'lightly-active',
        dietPreference: userProfile.dietPreference || 'standard',
        weightLossRate: userProfile.weightLossRate || 0.25,
        weightLossPlan: userProfile.weightLossPlan || 'steady',
        exerciseIntent: userProfile.exerciseIntent || false,
        nutritionFocus: userProfile.nutritionFocus || 'balanced',
        mealFrequency: userProfile.mealFrequency || '3-meals',
        intermittentFasting: userProfile.intermittentFasting || false,
        confidenceLevel: userProfile.confidenceLevel || 3,
        stressResponse: userProfile.stressResponse || 'exercise',
        temptationResponse: userProfile.temptationResponse || 'usually-control',
        medicationUse: userProfile.medicationUse || 'not-using'
      };
      
      console.log('📋 Профиль для расчёта:', profileForCalculation);
      
      const nutritionPlan = calculateCompleteNutrition(profileForCalculation);
      console.log('🧮 Рассчитан план питания:', nutritionPlan);
      
      return nutritionPlan;
    } catch (error) {
      console.error('❌ Ошибка расчёта плана питания:', error);
      return null;
    }
  };
  
  // Функция для получения рассчитанных калорий
  const getCalculatedCalories = (): number => {
    // Если пользователь уже выбрал калории на экране планов, используем их
    if (selectedCalories) {
      console.log('💾 Используем выбранные пользователем калории:', selectedCalories);
      return selectedCalories;
    }
    
    // Иначе рассчитываем через полный калькулятор
    const nutritionPlan = calculateNutritionPlan();
    const calculatedValue = nutritionPlan ? nutritionPlan.targetCalories : 1800;
    console.log('🧮 Рассчитанные калории через полный калькулятор:', calculatedValue);
    return calculatedValue;
  };

  // Функция для проверки полноты данных для точного расчета
  const hasCompleteNutritionData = (): boolean => {
    const userProfile = userProfileRef.current;
    return !!(userProfile.activityLevel && 
             userProfile.stressResponse &&
             userProfile.dietPreference &&
             userProfile.nutritionFocus &&
             userProfile.mealFrequency);
  };
  
  // Рендеринг текущего экрана
  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeScreen
            onContinue={goToNextStep}
          />
        );
      case 1:
        return (
          <UnitsScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            unitSettings={unitSettings}
            onUnitSettingsChange={(newSettings: UnitSettings) => setUnitSettings(newSettings)}
          />
        );
      case 2:
        return (
          <BirthdayScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            birthday={userProfileRef.current.birthday || ''}
            onBirthdayChange={(birthday: string) => {
              updateUserProfile({ birthday });
            }}
          />
        );
      case 3:
        return (
          <GenderScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            gender={userProfileRef.current.gender || 'male'}
            onGenderChange={(gender: Gender) => {
              updateUserProfile({ gender });
            }}
          />
        );
      case 4:
        return (
          <HeightWeightScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            height={userProfileRef.current.height || 176}
            currentWeight={userProfileRef.current.weight || 50}
            unitSettings={unitSettings}
            onHeightChange={(height: number) => updateUserProfile({ height })}
            onWeightChange={(weight: number) => updateUserProfile({ weight })}
          />
        );
      case 5:
        return (
          <GoalSettingScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            primaryGoal={userProfileRef.current.primaryGoal || 'lose-weight'}
            onGoalChange={(primaryGoal: PrimaryGoal) => updateUserProfile({ primaryGoal })}
            goalWeight={userProfileRef.current.goalWeight || 45}
            currentWeight={userProfileRef.current.weight || 50}
            unitSettings={unitSettings}
            onGoalWeightChange={(goalWeight: number) => updateUserProfile({ goalWeight })}
            weightLossRate={userProfileRef.current.weightLossRate || 0.25}
            onWeightLossRateChange={(weightLossRate: number) => updateUserProfile({ weightLossRate })}
          />
        );
      case 6:
        return (
          <GoalSetConfirmScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            currentWeight={userProfileRef.current.weight || 50}
            goalWeight={userProfileRef.current.goalWeight || 45}
            weightUnits={unitSettings.weight}
            primaryGoal={userProfileRef.current.primaryGoal || 'lose-weight'}
          />
        );
      case 7:
        return (
          <CalorieBudgetIntroScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            currentWeight={userProfileRef.current.weight || 50}
            goalWeight={userProfileRef.current.goalWeight || 45}
            weightUnits={unitSettings.weight}
          />
        );
      case 8:
        return (
          <ExerciseIntentScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            exerciseIntent={userProfileRef.current.exerciseIntent || false}
            onExerciseIntentChange={(exerciseIntent: boolean) => {
              updateUserProfile({ exerciseIntent });
            }}
          />
        );
      case 9:
        return (
          <ExerciseBenefitsScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            exerciseIntent={userProfileRef.current.exerciseIntent || false}
          />
        );
      case 10:
        return (
          <CalorieBudgetInfoScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            userProfile={{
              gender: (userProfileRef.current.gender === 'male' || userProfileRef.current.gender === 'female') 
                ? userProfileRef.current.gender 
                : 'female',
              age: calculateAge(userProfileRef.current.birthday),
              weight: userProfileRef.current.weight || 50,
              height: userProfileRef.current.height || 170,
              activityLevel: userProfileRef.current.activityLevel === 'extremely-active' 
                ? 'extra-active' 
                : userProfileRef.current.activityLevel || 'moderately-active'
            }}
            fullUserProfile={userProfileRef.current}
          />
        );
      case 11:
        return (
          <CalorieCountingScreen
            onContinue={() => {
              // Проверяем, хочет ли пользователь видеть туториал
              if (userProfileRef.current.showCalorieTutorial) {
                // Если выбрано "Да, покажите мне!", просто остаемся на этом экране
                // и только когда пользователь нажмет кнопку Продолжить, переходим дальше
                goToNextStep();
              } else {
                // Если выбрано "Нет, спасибо", сразу переходим на WeightLossPlanScreen
                setCurrentStep(12);
              }
            }}
            onBack={goToPreviousStep}
            showTutorial={userProfileRef.current.showCalorieTutorial || false}
            onShowTutorialChange={(showTutorial: boolean) => {
              updateUserProfile({ showCalorieTutorial: showTutorial });
            }}
          />
        );
      case 12:
        return (
          <WeightLossPlanScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            weightLossPlan={userProfileRef.current.weightLossPlan || 'steady'}
            onWeightLossPlanChange={(plan: string) => {
              updateUserProfile({ weightLossPlan: plan });
            }}
            onCalorieSelectionChange={(calories: number) => {
              console.log('💾 Сохраняем выбранные пользователем калории:', calories);
              setSelectedCalories(calories);
            }}
            userProfile={{
              gender: (userProfileRef.current.gender === 'male' || userProfileRef.current.gender === 'female') 
                ? userProfileRef.current.gender 
                : 'female',
              age: calculateAge(userProfileRef.current.birthday),
              weight: userProfileRef.current.weight || 50,
              height: userProfileRef.current.height || 170,
              activityLevel: userProfileRef.current.activityLevel === 'extremely-active' 
                ? 'extra-active' 
                : userProfileRef.current.activityLevel || 'moderately-active'
            }}
            fullUserProfile={userProfileRef.current}
          />
        );
      case 13:
        return (
          <CalorieBudgetConfirmScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            calorieBudget={getCalculatedCalories()}
            weightLossPlan={userProfileRef.current.weightLossPlan || 'steady'}
            isPreliminary={!hasCompleteNutritionData()}
          />
        );
      case 14:
        return (
          <CalorieScheduleScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            useFlexibleCalories={userProfileRef.current.useFlexibleCalories || false}
            onUseFlexibleCaloriesChange={(useFlexible: boolean) => {
              updateUserProfile({ useFlexibleCalories: useFlexible });
            }}
          />
        );
      case 15:
        // Показываем этот экран, только если выбран фиксированный бюджет калорий
        if (!userProfileRef.current.useFlexibleCalories) {
          return (
            <FixedCalorieBudgetConfirmScreen
              onContinue={goToNextStep}
              onBack={goToPreviousStep}
              calorieBudget={getCalculatedCalories()}
            />
          );
        }
        // Если используется гибкий бюджет, возвращаем null (пропуск обрабатывается в useEffect)
        return null;
      case 16:
        return (
          <NutritionIntroScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            calorieBudget={getCalculatedCalories()}
            weightLossRate={userProfileRef.current.weightLossRate || 0.25}
            useFlexibleCalories={userProfileRef.current.useFlexibleCalories || false}
          />
        );
      case 17:
        return (
          <WeightManagementObstacleScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            mainObstacle={userProfileRef.current.mainObstacle || 'emotional-eating'}
            onMainObstacleChange={(obstacle: string) => {
              updateUserProfile({ mainObstacle: obstacle });
            }}
          />
        );
      case 18:
        return (
          <EatingHabitsAssessmentScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            eatingHabitsAssessment={userProfileRef.current.eatingHabitsAssessment || 'average'}
            onEatingHabitsAssessmentChange={(assessment: string) => {
              updateUserProfile({ eatingHabitsAssessment: assessment });
            }}
          />
        );
      case 19:
        return (
          <FoodPreferencesScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            foodPriority={userProfileRef.current.foodPreferences || 'taste'}
            onFoodPriorityChange={(preferences: string) => {
              updateUserProfile({ foodPreferences: preferences });
            }}
          />
        );
      case 20:
        return (
          <FoodVarietyScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            foodVariety={userProfileRef.current.foodVariety || 'average'}
            onFoodVarietyChange={(variety: string) => {
              updateUserProfile({ foodVariety: variety });
            }}
          />
        );
      case 21:
        return (
          <MealFeelingsScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            mealFeeling={userProfileRef.current.mealFeelings || 'satisfied'}
            onMealFeelingChange={(feelings: string) => {
              updateUserProfile({ mealFeelings: feelings } as any);
            }}
          />
        );
      case 22:
        return (
          <MedicationScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            medication={userProfileRef.current.medicationUse || 'none'}
            onMedicationChange={(medication: string) => {
              updateUserProfile({ medicationUse: medication } as any);
            }}
          />
        );
      case 23:
        return (
          <NutritionFocusScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            nutritionFocus={userProfileRef.current.nutritionFocus || 'balanced'}
            onNutritionFocusChange={(focus: string) => {
              updateUserProfile({ nutritionFocus: focus });
            }}
          />
        );
      case 24:
        return (
          <IntermittentFastingScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            useIntermittentFasting={userProfileRef.current.intermittentFasting || false}
            onUseIntermittentFastingChange={(fasting: boolean) => {
              updateUserProfile({ intermittentFasting: fasting });
            }}
          />
        );
      case 25:
        // Показываем этот экран только если отказались от интервального голодания
        if (!userProfileRef.current.intermittentFasting) {
          return (
            <IntermittentFastingSkipConfirmScreen
              onContinue={goToNextStep}
              onBack={goToPreviousStep}
            />
          );
        }
        // Если выбрано интервальное голодание, возвращаем null (пропуск обрабатывается в useEffect)
        return null;
      case 26:
        return (
          <GoalDateIntroScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 27:
        return (
          <AdaptabilityScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            adaptability={userProfileRef.current.adaptability || 'adapt-time'}
            onAdaptabilityChange={(adaptability: string) => {
              updateUserProfile({ adaptability: adaptability } as any);
            }}
          />
        );
      case 28:
        return (
          <ChallengesViewScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            challengesView={userProfileRef.current.challengesView || 'growth-opportunity'}
            onChallengesViewChange={(view: string) => {
              updateUserProfile({ challengesView: view } as any);
            }}
          />
        );
      case 29:
        return (
          <SetbacksResponseScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            setbacksResponse={userProfileRef.current.setbacksResponse || 'bounce-back'}
            onSetbacksResponseChange={(response: string) => {
              updateUserProfile({ setbacksResponse: response } as any);
            }}
          />
        );
      case 30:
        return (
          <StressResponseScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            stressResponse={userProfileRef.current.stressResponse || 'emotional-eating'}
            onStressResponseChange={(stressResponse: string) => {
              updateUserProfile({ stressResponse } as any);
            }}
          />
        );
      case 31:
        return (
          <DecisionMakingScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            decisionConfidence={userProfileRef.current.decisionMaking || 'confident-doubt'}
            onDecisionConfidenceChange={(decision: string) => {
              updateUserProfile({ decisionMaking: decision } as any);
            }}
          />
        );
      case 32:
        return (
          <DifficultSituationsScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            difficultSituationsHandling={userProfileRef.current.difficultSituationsHandling || 'cope-most'}
            onDifficultSituationsHandlingChange={(handling: string) => {
              updateUserProfile({ difficultSituationsHandling: handling } as any);
            }}
          />
        );
      case 33:
        return (
          <TemptationResponseScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            temptationResponse={userProfileRef.current.temptationResponse || 'usually-control'}
            onTemptationResponseChange={(response: string) => {
              updateUserProfile({ temptationResponse: response } as any);
            }}
          />
        );
      case 34:
        return (
          <ConfidenceLevelScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            confidenceLevel={userProfileRef.current.confidenceLevel || 3}
            onConfidenceLevelChange={(confidenceLevel: number) => {
              updateUserProfile({ confidenceLevel });
            }}
          />
        );
      case 35:
        return (
          <MedicalDisclaimerScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 36:
        return (
          <PlanSummaryScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            userProfile={{
              calorieBudget: getCalculatedCalories(),
              weightLossPlan: userProfileRef.current.weightLossPlan || 'steady',
              exerciseIntent: userProfileRef.current.exerciseIntent || false,
              nutritionFocus: userProfileRef.current.nutritionFocus || 'balanced',
              challengesView: userProfileRef.current.challengesView || 'growth-opportunity',
              intermittentFasting: userProfileRef.current.intermittentFasting || false
            }}
          />
        );
      case 37:
        return (
          <ActivityLevelScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            activityLevel={userProfileRef.current.activityLevel || 'lightly-active'}
            onActivityLevelChange={(activityLevel: ActivityLevel) => {
              updateUserProfile({ activityLevel });
            }}
          />
        );
      case 38:
        return (
          <DietPreferenceScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            dietPreference={userProfileRef.current.dietPreference || 'standard'}
            onDietPreferenceChange={(dietPreference: DietPreference) => {
              updateUserProfile({ dietPreference });
            }}
          />
        );
      case 39:
        return (
          <MealFrequencyScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            mealFrequency={userProfileRef.current.mealFrequency || '3-meals'}
            onMealFrequencyChange={(mealFrequency: MealFrequency) => {
              updateUserProfile({ mealFrequency });
            }}
          />
        );
      case 40:
        return (
          <ChallengesScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            challenges={userProfileRef.current.challenges || ['emotional-eating']}
            onChallengesChange={(challenges: Challenge[]) => {
              updateUserProfile({ challenges });
            }}
          />
        );
      case 41:
        return (
          <SummaryPlanScreen
            onContinue={() => setCurrentStep(45)} // Переход на PaywallScreen
            onBack={goToPreviousStep}
            onClose={() => setCurrentStep(45)} // Крестик тоже ведет на PaywallScreen
            userProfile={userProfileRef.current}
          />
        );
      case 42:
        return (
          <SummaryScreen
            onComplete={goToNextStep} // Изменено: теперь переходим на GeneratingPlanScreen
            onBack={goToPreviousStep}
            userProfile={userProfileRef.current}
            unitSettings={unitSettings}
          />
        );
      case 43:
        return (
          <GeneratingPlanScreen
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 44:
        return (
          <PlanPreviewScreen
            onContinue={goToNextStep} // Переход к paywall
            onBack={goToPreviousStep}
            onStartTrial={startTrialPeriod} // Запуск 3-дневного пробного периода
            userProfile={userProfileRef.current}
          />
        );
      case 45:
        return (
          <PaywallScreen
            onContinue={() => {
              // Пока ничего не делаем, как запросил пользователь
              console.log('Continue pressed on paywall - no action for now');
            }}
            onBack={goToPreviousStep}
            onSkip={saveUserProfile} // Опция пропустить ведет на главный экран
          />
        );
      case 46:
        // Финальный шаг - завершение
        React.useEffect(() => {
          saveUserProfile();
        }, []);
        return null;
      default:
        return null;
    }
  };

  // Создаем динамические стили для компонента
  const dynamicStyles = {
    progressBarContainer: {
      width: width,
      height: 4,
      backgroundColor: palette.border.inactive,
      position: 'absolute' as const,
      top: 0,
    },
    progressBar: {
      height: 4,
      backgroundColor: palette.primary,
    },
    stepIndicator: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      marginVertical: 8,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: palette.border.inactive,
      marginHorizontal: 4,
    },
    activeStepDot: {
      backgroundColor: palette.primary,
    },
    screenContainer: {
      flex: 1,
    },
  };

  // Прогресс-бар
  const renderProgressBar = () => {
    const progressWidth = (currentStep / (MAX_STEPS - 1)) * width;
    return (
      <View style={dynamicStyles.progressBarContainer}>
        <Animated.View style={[dynamicStyles.progressBar, { width: progressWidth }]} />
      </View>
    );
  };

  // Индикаторы шагов
  const renderStepIndicators = () => {
    return (
      <View style={dynamicStyles.stepIndicator}>
        {Array.from({ length: MAX_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              dynamicStyles.stepDot,
              currentStep === index && dynamicStyles.activeStepDot
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={containers.safeArea} edges={['top', 'left', 'right']}>
        {renderProgressBar()}
        <View style={dynamicStyles.screenContainer}>
          {renderCurrentScreen()}
        </View>
      </SafeAreaView>
      {/* Фиксированная область для Home Indicator */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 34, // Высота Home Indicator на iPhone
        backgroundColor: palette.background,
        zIndex: -1
      }} />
    </View>
  );
}

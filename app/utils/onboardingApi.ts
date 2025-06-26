import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserId } from '../../services/userService';
import { getTimezoneInfo } from '../../utils/timezoneUtils';
import { UnitSettings, UserProfile } from '../types/onboarding';

// Конфигурация API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';
const WEBHOOK_URL = 'https://ttagent.website/webhook/nutrichecker-onboarding';

// Получение или создание ID пользователя (теперь используем основной сервис)
export const getUserEmailId = async (): Promise<string> => {
  // Используем основной getUserId вместо дублирования логики
  return await getUserId();
};

// Интерфейс для полных данных онбординга
interface OnboardingData {
  emailId: string;
  userProfile: Partial<UserProfile>;
  unitSettings: UnitSettings;
  currentStep: number;
  timestamp: string;
}

// Сохранение данных шага онбординга
export const saveOnboardingStep = async (
  stepNumber: number,
  stepName: string,
  data: any
): Promise<void> => {
  try {
    const emailId = await getUserEmailId();
    
    // Сохраняем локально для оффлайн работы
    const stepData = {
      emailId,
      stepNumber,
      stepName,
      data,
      timestamp: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(`onboarding_step_${stepNumber}`, JSON.stringify(stepData));
    
    // Отправляем на сервер (опционально, для аналитики)
    try {
      await fetch(`${API_BASE_URL}/onboarding/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepData)
      });
    } catch (apiError) {
      console.log('API call failed, data saved locally:', apiError);
    }
  } catch (error) {
    console.error('Error saving onboarding step:', error);
  }
};

// Подготовка данных для webhook
const prepareWebhookPayload = (
  emailId: string,
  userProfile: Partial<UserProfile>,
  unitSettings: UnitSettings
) => {
  return {
    user: {
      emailId,
      createdAt: new Date().toISOString()
    },
    profile: {
      // Основные данные
      birthday: userProfile.birthday,
      gender: userProfile.gender,
      height: userProfile.height,
      currentWeight: userProfile.weight || userProfile.currentWeight,
      goalWeight: userProfile.goalWeight,
      weightLossRate: userProfile.weightLossRate,
      primaryGoal: userProfile.primaryGoal,
      primaryGoalCustom: userProfile.primaryGoalCustom,
      
      // Активность и диета
      activityLevel: userProfile.activityLevel,
      dietPreference: userProfile.dietPreference,
      mealFrequency: userProfile.mealFrequency,
      
      // План похудения
      weightLossPlan: userProfile.weightLossPlan,
      exerciseIntent: userProfile.exerciseIntent,
      showCalorieTutorial: userProfile.showCalorieTutorial,
      useFlexibleCalories: userProfile.useFlexibleCalories,
      intermittentFasting: userProfile.intermittentFasting,
      
      // Питание
      nutritionFocus: userProfile.nutritionFocus,
      foodPreferences: userProfile.foodPreferences,
      foodVariety: userProfile.foodVariety,
      mealFeelings: userProfile.mealFeeling,
      
      // Психология
      confidenceLevel: userProfile.confidenceLevel,
      stressResponse: userProfile.stressResponse,
      adaptability: userProfile.adaptability,
      challengesView: userProfile.challengesView,
      setbacksResponse: userProfile.setbacksResponse,
      decisionMaking: userProfile.decisionMaking,
      difficultSituationsHandling: userProfile.difficultSituationsHandling,
      temptationResponse: userProfile.temptationResponse,
      
      // Медицинские данные
      medicationUse: userProfile.medication,
      mainObstacle: userProfile.mainObstacle,
      eatingHabitsAssessment: userProfile.eatingHabitsAssessment,
      
      // Вызовы
      challenges: userProfile.challenges || [],
      
      // Рассчитанные значения (если есть)
      bmr: userProfile.bmr,
      tdee: userProfile.tdee,
      calorieTarget: userProfile.calorieTarget,
      proteinTarget: userProfile.proteinTarget,
      fatTarget: userProfile.fatTarget,
      carbTarget: userProfile.carbTarget,
      goalDate: userProfile.goalDate
    },
    settings: {
      weightUnit: unitSettings.weight,
      heightUnit: unitSettings.height,
      system: unitSettings.system
    },
    event: {
      type: 'paywall_reached',
      timestamp: new Date().toISOString(),
      step: 45
    }
  };
};

// Функция для сбора всех данных онбординга из AsyncStorage
export const collectAllOnboardingData = async (): Promise<{
  userProfile: Partial<UserProfile>;
  unitSettings: UnitSettings;
  stepData: any[];
}> => {
  try {
    // Основные данные
    const userProfileStr = await AsyncStorage.getItem('userProfile');
    const unitSettingsStr = await AsyncStorage.getItem('unitSettings');
    
    const userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
    const unitSettings = unitSettingsStr ? JSON.parse(unitSettingsStr) : {
      weight: 'kg',
      height: 'cm',
      system: 'metric'
    };

    // Собираем данные всех шагов
    const stepData = [];
    for (let i = 0; i < 48; i++) {
      const stepDataStr = await AsyncStorage.getItem(`onboarding_step_${i}`);
      if (stepDataStr) {
        stepData.push(JSON.parse(stepDataStr));
      }
    }

    return {
      userProfile,
      unitSettings,
      stepData
    };
  } catch (error) {
    console.error('Error collecting onboarding data:', error);
    return {
      userProfile: {},
      unitSettings: { weight: 'kg', height: 'cm', system: 'metric' },
      stepData: []
    };
  }
};

// Функция для создания полного payload со всеми данными
export const createCompleteOnboardingPayload = async (eventType: 'paywall_reached' | 'onboarding_completed', step: number) => {
  try {
    const emailId = await getUserEmailId();
    const { userProfile, unitSettings, stepData } = await collectAllOnboardingData();
    
    // Получаем информацию о часовом поясе
    const timezoneInfo = getTimezoneInfo();
    console.log('🕒 Adding timezone info to onboarding payload:', timezoneInfo);
    
    // Создаем полный payload
    const completePayload = {
      user: {
        emailId,
        createdAt: new Date().toISOString(),
        // Добавляем timezone информацию
        timezone: timezoneInfo.timezone,
        timezoneOffset: timezoneInfo.timezoneOffset
      },
      profile: {
        // Основные антропометрические данные
        birthday: userProfile.birthday,
        gender: userProfile.gender,
        height: userProfile.height,
        currentWeight: userProfile.weight || userProfile.currentWeight,
        goalWeight: userProfile.goalWeight,
        weightLossRate: userProfile.weightLossRate,
        primaryGoal: userProfile.primaryGoal,
        primaryGoalCustom: userProfile.primaryGoalCustom,
        
        // Активность и диета
        activityLevel: userProfile.activityLevel,
        dietPreference: userProfile.dietPreference,
        mealFrequency: userProfile.mealFrequency,
        
        // План похудения и упражнения
        weightLossPlan: userProfile.weightLossPlan,
        exerciseIntent: userProfile.exerciseIntent,
        showCalorieTutorial: userProfile.showCalorieTutorial,
        useFlexibleCalories: userProfile.useFlexibleCalories,
        intermittentFasting: userProfile.intermittentFasting,
        
        // Питание и фокус
        nutritionFocus: userProfile.nutritionFocus,
        foodPreferences: userProfile.foodPreferences,
        foodVariety: userProfile.foodVariety,
        mealFeelings: userProfile.mealFeeling,
        
        // Психологический профиль
        confidenceLevel: userProfile.confidenceLevel,
        stressResponse: userProfile.stressResponse,
        adaptability: userProfile.adaptability,
        challengesView: userProfile.challengesView,
        setbacksResponse: userProfile.setbacksResponse,
        decisionMaking: userProfile.decisionMaking,
        difficultSituationsHandling: userProfile.difficultSituationsHandling,
        temptationResponse: userProfile.temptationResponse,
        
        // Медицинские данные и препятствия
        medicationUse: userProfile.medication,
        mainObstacle: userProfile.mainObstacle,
        eatingHabitsAssessment: userProfile.eatingHabitsAssessment,
        
        // Препятствия и вызовы
        challenges: userProfile.challenges || [],
        
        // Рассчитанные значения
        bmr: userProfile.bmr,
        tdee: userProfile.tdee,
        calorieTarget: userProfile.calorieTarget,
        proteinTarget: userProfile.proteinTarget,
        fatTarget: userProfile.fatTarget,
        carbTarget: userProfile.carbTarget,
        goalDate: userProfile.goalDate
      },
      settings: {
        weightUnit: unitSettings.weight,
        heightUnit: unitSettings.height,
        system: unitSettings.system
      },
      event: {
        type: eventType,
        timestamp: new Date().toISOString(),
        step: step
      },
      // Дополнительные данные для аналитики
      analytics: {
        totalSteps: stepData.length,
        completedSteps: stepData.map(s => s.stepNumber),
        stepTimestamps: stepData.map(s => ({ step: s.stepNumber, timestamp: s.timestamp })),
        deviceInfo: {
          platform: 'mobile',
          userAgent: 'NutriChecker-Mobile/1.0'
        }
      }
    };

    return completePayload;
  } catch (error) {
    console.error('Error creating complete payload:', error);
    throw error as Error;
  }
};

// Отправка webhook при достижении paywall
export const sendPaywallWebhook = async (
  userProfile: Partial<UserProfile>,
  unitSettings: UnitSettings
): Promise<boolean> => {
  try {
    const payload = await createCompleteOnboardingPayload('paywall_reached', 45);
    
    console.log('Sending paywall webhook:', payload);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NutriChecker-Mobile/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const success = response.ok;
    
    // Сохраняем результат webhook локально
    const webhookLog = {
      emailId: payload.user.emailId,
      eventType: 'paywall_reached',
      payload,
      responseStatus: response.status,
      responseBody: await response.text(),
      sentAt: new Date().toISOString(),
      success
    };
    
    await AsyncStorage.setItem('webhook_paywall_log', JSON.stringify(webhookLog));
    
    if (success) {
      console.log('✅ Paywall webhook sent successfully');
    } else {
      console.error('❌ Paywall webhook failed:', response.status);
    }
    
    return success;
  } catch (error) {
    console.error('Error sending paywall webhook:', error);
    
    // Сохраняем ошибку для повторной отправки
    const emailId = await getUserEmailId();
    const errorLog = {
      emailId,
      eventType: 'paywall_reached',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
    
    await AsyncStorage.setItem('webhook_paywall_error', JSON.stringify(errorLog));
    return false;
  }
};

// Отправка webhook при завершении онбординга
export const sendCompletionWebhook = async (
  userProfile: Partial<UserProfile>,
  unitSettings: UnitSettings
): Promise<boolean> => {
  try {
    const payload = await createCompleteOnboardingPayload('onboarding_completed', 47);
    
    console.log('Sending completion webhook:', payload);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NutriChecker-Mobile/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const success = response.ok;
    
    // Сохраняем результат webhook локально
    const webhookLog = {
      emailId: payload.user.emailId,
      eventType: 'onboarding_completed',
      payload,
      responseStatus: response.status,
      responseBody: await response.text(),
      sentAt: new Date().toISOString(),
      success
    };
    
    await AsyncStorage.setItem('webhook_completion_log', JSON.stringify(webhookLog));
    
    return success;
  } catch (error) {
    console.error('Error sending completion webhook:', error);
    return false;
  }
};

// Получение всех данных онбординга для отладки
export const getOnboardingDebugData = async () => {
  try {
    const emailId = await getUserEmailId();
    const userProfile = await AsyncStorage.getItem('userProfile');
    const unitSettings = await AsyncStorage.getItem('unitSettings');
    const webhookPaywallLog = await AsyncStorage.getItem('webhook_paywall_log');
    const webhookCompletionLog = await AsyncStorage.getItem('webhook_completion_log');
    
    return {
      emailId,
      userProfile: userProfile ? JSON.parse(userProfile) : null,
      unitSettings: unitSettings ? JSON.parse(unitSettings) : null,
      webhookLogs: {
        paywall: webhookPaywallLog ? JSON.parse(webhookPaywallLog) : null,
        completion: webhookCompletionLog ? JSON.parse(webhookCompletionLog) : null
      }
    };
  } catch (error) {
    console.error('Error getting debug data:', error);
    return null;
  }
};

// Очистка данных онбординга (для тестирования)
export const clearOnboardingData = async (): Promise<void> => {
  try {
    const keys = [
      'userProfile',
      'unitSettings',
      'hasCompletedOnboarding',
      'webhook_paywall_log',
      'webhook_completion_log',
      'webhook_paywall_error'
    ];
    
    await AsyncStorage.multiRemove(keys);
    
    // Удаляем данные шагов
    for (let i = 0; i < 48; i++) {
      await AsyncStorage.removeItem(`onboarding_step_${i}`);
    }
    
    console.log('✅ Onboarding data cleared');
  } catch (error) {
    console.error('Error clearing onboarding data:', error);
  }
}; 
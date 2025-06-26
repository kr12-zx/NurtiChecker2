import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserEmailId } from './onboardingApi';

const RECOMMENDATIONS_WEBHOOK_URL = 'https://ttagent.website/webhook/get-recommendations';

export interface RecommendationsRequest {
  userId: string;
  weeklyNutritionData: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalSugar: number;
    daysWithData: number;
    averageCalories: number;
    calorieGoal: number;
    proteinGoal: number;
    fatGoal: number;
    carbGoal: number;
    sugarGoal: number;
  };
  userProfile: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    primaryGoal: string;
    goalWeight?: number;
    activityLevel: string;
    dietPreference: string;
    challenges: string[];
    confidenceLevel: number;
  };
  preferences: {
    language: string;
    units: {
      weight: string;
      height: string;
    };
  };
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: {
    title: string;
    message: string;
    tips: string[];
    priority: 'high' | 'medium' | 'low';
  }[];
  analysis: {
    calorieBalance: string;
    macroBalance: string;
    overallScore: number;
  };
  nextSteps: string[];
}

/**
 * Отправляет запрос на получение персональных рекомендаций
 */
export const requestPersonalizedRecommendations = async (
  weeklyStats: any,
  userGoals: any,
  userProfile: any
): Promise<RecommendationsResponse> => {
  try {
    console.log('🎯 Отправляем запрос на персональные рекомендации...');
    
    // Получаем ID пользователя
    const userId = await getUserEmailId();
    
    // Подготавливаем данные для отправки
    const requestData: RecommendationsRequest = {
      userId,
      weeklyNutritionData: {
        totalCalories: weeklyStats?.totalCalories || 0,
        totalProtein: weeklyStats?.totalProtein || 0,
        totalFat: weeklyStats?.totalFat || 0,
        totalCarbs: weeklyStats?.totalCarbs || 0,
        totalSugar: weeklyStats?.totalSugar || 0,
        daysWithData: weeklyStats?.totalDays || 0,
        averageCalories: weeklyStats?.averageCalories || 0,
        calorieGoal: userGoals?.calories || 2000,
        proteinGoal: userGoals?.protein || 150,
        fatGoal: userGoals?.fat || 67,
        carbGoal: userGoals?.carbs || 250,
        sugarGoal: userGoals?.sugar || 50,
      },
      userProfile: {
        age: userProfile?.age || 30,
        gender: userProfile?.gender || 'male',
        height: userProfile?.height || 175,
        weight: userProfile?.weight || 75,
        primaryGoal: userProfile?.primaryGoal || 'maintain-weight',
        goalWeight: userProfile?.goalWeight,
        activityLevel: userProfile?.activityLevel || 'lightly-active',
        dietPreference: userProfile?.dietPreference || 'standard',
        challenges: userProfile?.challenges || [],
        confidenceLevel: userProfile?.confidenceLevel || 3,
      },
      preferences: {
        language: 'ru',
        units: {
          weight: 'kg',
          height: 'cm',
        },
      },
    };

    console.log('📤 Отправляем данные:', {
      userId,
      weeklyCalories: requestData.weeklyNutritionData.totalCalories,
      goal: requestData.userProfile.primaryGoal,
      daysWithData: requestData.weeklyNutritionData.daysWithData,
    });

    // Отправляем запрос
    const response = await fetch(RECOMMENDATIONS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NutriChecker-Mobile/1.0',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Получены рекомендации:', result);

    // Сохраняем результат локально для кэширования
    await AsyncStorage.setItem(
      'last_recommendations',
      JSON.stringify({
        data: result,
        timestamp: new Date().toISOString(),
      })
    );

    return result;
  } catch (error) {
    console.error('❌ Ошибка при получении рекомендаций:', error);
    
    // Возвращаем fallback рекомендации
    return {
      success: false,
      recommendations: [
        {
          title: 'Анализ данных',
          message: 'К сожалению, не удалось получить персональные рекомендации. Попробуйте позже.',
          tips: [
            'Продолжайте отслеживать питание',
            'Соблюдайте баланс макронутриентов',
            'Пейте достаточно воды',
          ],
          priority: 'medium' as const,
        },
      ],
      analysis: {
        calorieBalance: 'Недостаточно данных',
        macroBalance: 'Недостаточно данных',
        overallScore: 50,
      },
      nextSteps: ['Продолжайте использовать приложение для получения более точных рекомендаций'],
    };
  }
};

/**
 * Получает последние сохраненные рекомендации из кэша
 */
export const getCachedRecommendations = async (): Promise<RecommendationsResponse | null> => {
  try {
    const cached = await AsyncStorage.getItem('last_recommendations');
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Проверяем, не устарели ли рекомендации (24 часа)
    const cacheAge = Date.now() - new Date(timestamp).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    
    if (cacheAge > maxAge) {
      await AsyncStorage.removeItem('last_recommendations');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Ошибка при получении кэшированных рекомендаций:', error);
    return null;
  }
}; 
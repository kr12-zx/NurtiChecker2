import AsyncStorage from '@react-native-async-storage/async-storage';

// Флаг для отслеживания в рамках текущей сессии
let hasCheckedFirstTimeInSession = false;
let isFirstTimeInSession = false;

/**
 * Получить калории за определенную дату
 */
export const getCaloriesForDate = async (date: string): Promise<number> => {
  try {
    const storageKey = `daily_calories_${date}`;
    const savedCalories = await AsyncStorage.getItem(storageKey);
    return savedCalories ? parseFloat(savedCalories) : 0;
  } catch (error) {
    console.error('Ошибка при получении калорий за дату:', error);
    return 0;
  }
};

/**
 * Получить калории за вчерашний день
 */
export const getYesterdayCalories = async (): Promise<number | null> => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const calories = await getCaloriesForDate(yesterdayString);
    return calories > 0 ? calories : null; // Возвращаем null если калорий нет
  } catch (error) {
    console.error('Ошибка при получении калорий за вчерашний день:', error);
    return null;
  }
};

/**
 * Проверить, первый ли это запуск приложения
 */
export const isFirstTimeUser = async (): Promise<boolean> => {
  try {
    // Проверяем только один раз за сессию
    if (hasCheckedFirstTimeInSession) {
      console.log('🔍 Повторный вызов isFirstTimeUser в сессии:', isFirstTimeInSession);
      return isFirstTimeInSession;
    }

    const hasUsedApp = await AsyncStorage.getItem('app_used_before');
    console.log('🔍 Проверка первого запуска:', { hasUsedApp });
    
    if (!hasUsedApp) {
      // Это первый запуск
      console.log('✅ Первый запуск приложения!');
      isFirstTimeInSession = true;
      hasCheckedFirstTimeInSession = true;
      
      // Отмечаем, что приложение уже использовалось
      await AsyncStorage.setItem('app_used_before', 'true');
      return true;
    } else {
      // Не первый запуск
      console.log('❌ Не первый запуск');
      isFirstTimeInSession = false;
      hasCheckedFirstTimeInSession = true;
      return false;
    }
  } catch (error) {
    console.error('Ошибка при проверке первого запуска:', error);
    hasCheckedFirstTimeInSession = true;
    isFirstTimeInSession = false;
    return false;
  }
};

/**
 * Получить текущую цель по калориям
 */
export const getCurrentCalorieGoal = async (): Promise<number> => {
  try {
    const savedGoal = await AsyncStorage.getItem('calorie_goal');
    return savedGoal ? parseFloat(savedGoal) : 1842; // Дефолтная цель 1842
  } catch (error) {
    console.error('Ошибка при получении цели по калориям:', error);
    return 1842;
  }
};

/**
 * Функция для сброса флага первого запуска (для тестирования)
 */
export const resetFirstTimeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('app_used_before');
    hasCheckedFirstTimeInSession = false;
    isFirstTimeInSession = false;
    console.log('🔄 Флаг первого запуска сброшен');
  } catch (error) {
    console.error('Ошибка при сбросе флага первого запуска:', error);
  }
}; 
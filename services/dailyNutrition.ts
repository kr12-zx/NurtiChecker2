import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanHistoryItem } from './scanHistory';

// Структура для хранения данных о потреблении за день
export interface DailyNutritionData {
  date: string; // Формат: DD.MM.YYYY
  caloriesConsumed: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number; // Для отслеживания скрытого сахара
  fiber: number; // Клетчатка
  saturatedFat: number; // Насыщенные жиры
  addedProducts: {
    productId: string;
    name: string;
    servingMultiplier: number; // Коэффициент порции (1.0 = стандартная порция)
    baseWeight?: number; // Базовый вес продукта в граммах (для правильного отображения)
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    fiber: number; // Клетчатка
    saturatedFat: number; // Насыщенные жиры
    image?: string; // URL изображения продукта
    timestamp?: number; // Время добавления продукта
    fullData?: string; // Полные данные анализа продукта
  }[];
}

// Ключ для хранения данных в AsyncStorage
const DAILY_NUTRITION_KEY = '@nutrichecker:daily_nutrition';

/**
 * Получает данные о питании за указанную дату
 */
export const getDailyNutrition = async (date?: string): Promise<DailyNutritionData | null> => {
  try {
    // Если дата не указана, используем сегодняшнюю
    const targetDate = date || formatDateToString(new Date());
    
    // Получаем все данные о питании
    const allData = await getAllDailyNutrition();
    
    // Ищем данные за нужный день
    const dayData = allData.find(day => day.date === targetDate);
    
    if (dayData) {
      return dayData;
    }
    
    // Если данных за этот день нет, возвращаем пустую структуру
    return {
      date: targetDate,
      caloriesConsumed: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      saturatedFat: 0,
      addedProducts: []
    };
  } catch (error) {
    console.error('Ошибка при получении данных о питании за день:', error);
    return null;
  }
};

/**
 * Получает данные о питании за все дни
 */
export const getAllDailyNutrition = async (): Promise<DailyNutritionData[]> => {
  try {
    const json = await AsyncStorage.getItem(DAILY_NUTRITION_KEY);
    if (!json) return [];
    
    return JSON.parse(json) as DailyNutritionData[];
  } catch (error) {
    console.error('Ошибка при получении всех данных о питании:', error);
    return [];
  }
};

/**
 * Добавляет продукт в статистику питания за день
 */
export const addProductToDay = async (
  product: ScanHistoryItem, 
  servingMultiplier: number = 1.0, // По умолчанию - стандартная порция
  date?: string, // Необязательный параметр, по умолчанию - сегодня
  portionDetails?: {
    portionSize: 'small' | 'regular' | 'large';
    quantity: number;
    quantityEaten: 'all' | 'three_quarters' | 'half' | 'third' | 'quarter' | 'tenth' | 'sip';
    addons: {
      sauce: number;
      sugar: number;
      oil: number;
      cream: number;
      cheese: number;
      nuts: number;
    };
    totalMultiplier: number;
    baseGrams: number;
    preparationMethod: 'raw' | 'boiled' | 'fried' | 'grilled' | 'baked';
  }
): Promise<DailyNutritionData> => {
  try {
    console.log('\n🔄 === ДОБАВЛЕНИЕ ПРОДУКТА В ДНЕВНИК ===');
    console.log('📦 Продукт:', {
      id: product.id,
      name: product.name,
      calories: product.calories,
      sugar: product.sugar || 0
    });
    console.log('🎯 Параметры:', {
      servingMultiplier,
      targetDate: date || 'сегодня',
      hasPortionDetails: !!portionDetails
    });

    const targetDate = date || formatDateToString(new Date());
    console.log('📅 Целевая дата:', targetDate);
    
    // Получаем существующие данные за день или создаем новые
    let dayData = await getDailyNutrition(targetDate);
    console.log('📊 Состояние дня ДО добавления:', {
      exists: !!dayData,
      calories: dayData?.caloriesConsumed || 0,
      sugar: dayData?.sugar || 0,
      productsCount: dayData?.addedProducts.length || 0
    });
    
    if (!dayData) {
      dayData = {
        date: targetDate,
        caloriesConsumed: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        saturatedFat: 0,
        addedProducts: []
      };
      console.log('✨ Создан новый день');
    }
    
    // Рассчитываем финальный мультипликатор
    let finalMultiplier = servingMultiplier;
    if (portionDetails) {
      finalMultiplier = portionDetails.totalMultiplier;
      console.log('🔢 Использован мультипликатор из порции:', finalMultiplier);
    }
    
    // Рассчитываем питательные вещества с учетом порции
    const adjustedCalories = Math.round(product.calories * finalMultiplier);
    const adjustedProtein = Math.round((product.protein || 0) * finalMultiplier * 10) / 10;
    const adjustedFat = Math.round((product.fat || 0) * finalMultiplier * 10) / 10;
    const adjustedCarbs = Math.round((product.carbs || 0) * finalMultiplier * 10) / 10;
    const adjustedSugar = Math.round((product.sugar || 0) * finalMultiplier * 10) / 10;
    const adjustedFiber = Math.round(((product as any).fiber || 0) * finalMultiplier * 10) / 10;
    const adjustedSaturatedFat = Math.round(((product as any).saturatedFat || 0) * finalMultiplier * 10) / 10;
    
    console.log('🧮 Рассчитанные значения для добавления:', {
      adjustedCalories,
      adjustedSugar,
      finalMultiplier
    });
    
    // Извлекаем базовый вес из полных данных анализа
    let baseWeight = 100; // Значение по умолчанию
    if ((product as any).fullData) {
      try {
        const fullData = JSON.parse((product as any).fullData);
        if (fullData.foodData?.portionInfo?.estimatedWeight) {
          baseWeight = fullData.foodData.portionInfo.estimatedWeight;
          console.log('🔍 Извлечен базовый вес из fullData:', baseWeight);
        }
      } catch (error) {
        console.error('❌ Ошибка при извлечении базового веса из fullData:', error);
      }
    }
    
    // Добавляем продукт в массив
    const productToAdd = {
      productId: product.id,
      name: product.name,
      servingMultiplier: finalMultiplier,
      baseWeight: baseWeight, // Сохраняем базовый вес продукта
      calories: adjustedCalories,
      protein: adjustedProtein,
      fat: adjustedFat,
      carbs: adjustedCarbs,
      sugar: adjustedSugar,
      fiber: adjustedFiber,
      saturatedFat: adjustedSaturatedFat,
      image: product.image,
      timestamp: Date.now(), // Добавляем текущий timestamp
      fullData: (product as any).fullData // Сохраняем полные данные анализа
    };
    
    console.log('📦 Продукт для добавления:', productToAdd);
    
    // Обновляем суммарные значения
    const updatedData: DailyNutritionData = {
      ...dayData,
      caloriesConsumed: dayData.caloriesConsumed + adjustedCalories,
      protein: Math.round((dayData.protein + adjustedProtein) * 10) / 10,
      fat: Math.round((dayData.fat + adjustedFat) * 10) / 10,
      carbs: Math.round((dayData.carbs + adjustedCarbs) * 10) / 10,
      sugar: Math.round((dayData.sugar + adjustedSugar) * 10) / 10,
      fiber: Math.round((dayData.fiber + adjustedFiber) * 10) / 10,
      saturatedFat: Math.round((dayData.saturatedFat + adjustedSaturatedFat) * 10) / 10,
      addedProducts: [...dayData.addedProducts, productToAdd]
    };
    
    console.log('📊 Состояние дня ПОСЛЕ добавления:', {
      calories: updatedData.caloriesConsumed,
      sugar: updatedData.sugar,
      productsCount: updatedData.addedProducts.length
    });
    
    // Валидация суммы
    const calculatedCalories = updatedData.addedProducts.reduce((sum, p) => sum + p.calories, 0);
    const calculatedSugar = updatedData.addedProducts.reduce((sum, p) => sum + p.sugar, 0);
    
    console.log('✅ Валидация сумм:', {
      caloriesMatch: Math.abs(calculatedCalories - updatedData.caloriesConsumed) < 1,
      sugarMatch: Math.abs(calculatedSugar - updatedData.sugar) < 0.1,
      calculatedCalories,
      storedCalories: updatedData.caloriesConsumed,
      calculatedSugar,
      storedSugar: updatedData.sugar
    });
    
    // Сохраняем обновленные данные
    await saveDailyNutrition(updatedData);
    console.log('💾 Данные сохранены');
    console.log('🔄 === ДОБАВЛЕНИЕ ЗАВЕРШЕНО ===\n');
    
    return updatedData;
  } catch (error) {
    console.error('❌ Ошибка при добавлении продукта в дневную статистику:', error);
    throw error;
  }
};

/**
 * Сохраняет данные о питании за день
 */
export const saveDailyNutrition = async (dayData: DailyNutritionData): Promise<void> => {
  try {
    // Получаем все данные
    const allData = await getAllDailyNutrition();
    
    // Находим индекс текущего дня, если он уже существует
    const existingIndex = allData.findIndex(day => day.date === dayData.date);
    
    let updatedData: DailyNutritionData[];
    
    if (existingIndex >= 0) {
      // Заменяем данные за существующий день
      updatedData = [...allData];
      updatedData[existingIndex] = dayData;
    } else {
      // Добавляем новый день
      updatedData = [...allData, dayData];
    }
    
    // Сортируем по дате (от новых к старым)
    updatedData.sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Сохраняем обновленные данные
    await AsyncStorage.setItem(DAILY_NUTRITION_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Ошибка при сохранении данных о питании за день:', error);
    throw error;
  }
};

/**
 * Удаляет продукт из статистики за день
 */
export const removeProductFromDay = async (
  productId: string,
  date?: string // Необязательный параметр, по умолчанию - сегодня
): Promise<DailyNutritionData | null> => {
  try {
    console.log('\n🗑️ === УДАЛЕНИЕ ПРОДУКТА ИЗ ДНЕВНИКА ===');
    console.log('🔍 Параметры удаления:', {
      productId,
      targetDate: date || 'сегодня'
    });

    const targetDate = date || formatDateToString(new Date());
    console.log('📅 Целевая дата:', targetDate);
    
    // Получаем данные за день
    const dayData = await getDailyNutrition(targetDate);
    if (!dayData) {
      console.log('❌ Нет данных за указанную дату');
      return null;
    }
    
    console.log('📊 Состояние дня ДО удаления:', {
      calories: dayData.caloriesConsumed,
      sugar: dayData.sugar,
      productsCount: dayData.addedProducts.length,
      products: dayData.addedProducts.map(p => `${p.name} (${p.productId})`)
    });
    
    // Находим продукт для удаления
    // Пытаемся найти точное совпадение сначала
    let productIndex = dayData.addedProducts.findIndex(product => 
      product.productId === productId
    );
    
    // Если точное совпадение не найдено, ищем по частям ID
    if (productIndex === -1) {
      console.log('🔍 Точное совпадение не найдено, ищем по частям ID...');
      
      // Сначала пробуем найти по первой части ID (базовый timestamp)
      const firstPart = productId.split('-')[0];
      console.log('🔍 Первая часть ID для поиска:', firstPart);
      
      productIndex = dayData.addedProducts.findIndex(product => 
        product.productId.startsWith(firstPart)
      );
      
      if (productIndex !== -1) {
        console.log('✅ Найден продукт по первой части ID:', dayData.addedProducts[productIndex].productId);
      } else {
        // Если не найден по первой части, пробуем по базовому ID (первые две части)
        const baseId = productId.split('-').slice(0, 2).join('-');
        console.log('🔍 Базовый ID для поиска:', baseId);
        
        productIndex = dayData.addedProducts.findIndex(product => 
          product.productId.startsWith(baseId)
        );
        
        if (productIndex !== -1) {
          console.log('✅ Найден продукт по базовому ID:', dayData.addedProducts[productIndex].productId);
        }
      }
    }
    
    console.log('📍 Найден индекс:', productIndex);
    
    if (productIndex === -1) {
      console.log('❌ Продукт не найден в дневнике');
      return dayData; // Продукт не найден
    }
    
    // Данные о продукте, который нужно удалить
    const productToRemove = dayData.addedProducts[productIndex];
    console.log('✅ Продукт найден для удаления:', {
      name: productToRemove.name,
      id: productToRemove.productId,
      calories: productToRemove.calories,
      sugar: productToRemove.sugar,
      timestamp: productToRemove.timestamp ? new Date(productToRemove.timestamp).toLocaleString() : 'НЕТ'
    });
    console.log('📊 Текущие калории дня до удаления:', dayData.caloriesConsumed);
    console.log('📊 Калории удаляемого продукта:', productToRemove.calories);
    
    // Обновляем суммарные значения
    const updatedData: DailyNutritionData = {
      ...dayData,
      caloriesConsumed: dayData.caloriesConsumed - productToRemove.calories,
      protein: Math.round((dayData.protein - productToRemove.protein) * 10) / 10,
      fat: Math.round((dayData.fat - productToRemove.fat) * 10) / 10,
      carbs: Math.round((dayData.carbs - productToRemove.carbs) * 10) / 10,
      sugar: Math.round((dayData.sugar - productToRemove.sugar) * 10) / 10,
      fiber: Math.round((dayData.fiber - productToRemove.fiber) * 10) / 10,
      saturatedFat: Math.round((dayData.saturatedFat - productToRemove.saturatedFat) * 10) / 10,
      addedProducts: dayData.addedProducts.filter((_, index) => index !== productIndex)
    };
    
    console.log('📊 Состояние дня ПОСЛЕ удаления:', {
      calories: updatedData.caloriesConsumed,
      sugar: updatedData.sugar,
      productsCount: updatedData.addedProducts.length,
      remainingProducts: updatedData.addedProducts.map(p => `${p.name} (${p.productId})`)
    });
    
    // Валидация суммы
    const calculatedCalories = updatedData.addedProducts.reduce((sum, p) => sum + p.calories, 0);
    const calculatedSugar = updatedData.addedProducts.reduce((sum, p) => sum + p.sugar, 0);
    
    console.log('✅ Валидация сумм после удаления:', {
      caloriesMatch: Math.abs(calculatedCalories - updatedData.caloriesConsumed) < 1,
      sugarMatch: Math.abs(calculatedSugar - updatedData.sugar) < 0.1,
      calculatedCalories,
      storedCalories: updatedData.caloriesConsumed,
      calculatedSugar,
      storedSugar: updatedData.sugar
    });
    
    // Сохраняем обновленные данные
    await saveDailyNutrition(updatedData);
    
    console.log('✅ Продукт успешно удален из дневника');
    console.log('🗑️ === УДАЛЕНИЕ ЗАВЕРШЕНО ===\n');
    
    return updatedData;
  } catch (error) {
    console.error('❌ Ошибка при удалении продукта из дневной статистики:', error);
    return null;
  }
};

/**
 * Очищает всю статистику питания
 */
export const clearAllNutritionData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DAILY_NUTRITION_KEY);
  } catch (error) {
    console.error('Ошибка при очистке данных о питании:', error);
    throw error;
  }
};

/**
 * Форматирует дату в строку формата DD.MM.YYYY
 */
export const formatDateToString = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Парсит строку даты формата DD.MM.YYYY в объект Date
 */
export const parseDateString = (dateString: string): Date => {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Форматирует timestamp в красивый формат "день месяц, время"
 */
export const formatAddedDateTime = (timestamp?: number, fallbackDate?: string): string => {
  const monthNames = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];

  if (timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
  }

  // Fallback для старых данных без timestamp
  if (fallbackDate) {
    const [day, month] = fallbackDate.split('.');
    const monthIndex = parseInt(month) - 1;
    return `${day} ${monthNames[monthIndex]}`;
  }

  return 'Неизвестно';
};

/**
 * Получает все продукты, добавленные в дашборд за все дни
 * Возвращает массив с данными о продуктах и дате добавления
 */
export const getDashboardAddedProducts = async (): Promise<Array<{
  productId: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  saturatedFat: number;
  dateAdded: string;
  servingMultiplier: number;
  baseWeight?: number; // Базовый вес продукта в граммах
  image?: string; // URL изображения продукта
  timestamp?: number; // Время добавления продукта
  fullData?: string; // Полные данные анализа продукта
}>> => {
  try {
    const allDays = await getAllDailyNutrition();
    const allProducts: Array<{
      productId: string;
      name: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      sugar: number;
      fiber: number;
      saturatedFat: number;
      dateAdded: string;
      servingMultiplier: number;
      baseWeight?: number; // Базовый вес продукта в граммах
      image?: string; // URL изображения продукта
      timestamp?: number; // Время добавления продукта
      fullData?: string; // Полные данные анализа продукта
    }> = [];

    // Проходим по всем дням и собираем продукты
    for (const day of allDays) {
      for (const product of day.addedProducts) {
        // Если у продукта нет изображения, пытаемся получить его из истории сканирований
        let productImage = product.image;
        if (!productImage) {
          productImage = await getProductImageById(product.productId);
        }
        
        allProducts.push({
          ...product,
          dateAdded: day.date,
          image: productImage,
          timestamp: product.timestamp,
          fullData: product.fullData,
          baseWeight: product.baseWeight // Передаем базовый вес
        });
      }
    }

    // Сортируем по времени добавления (от новых к старым)
    allProducts.sort((a, b) => {
      // Если у обоих есть timestamp, сортируем по timestamp
      if (a.timestamp && b.timestamp) {
        return b.timestamp - a.timestamp;
      }
      
      // Если timestamp есть только у одного - он идет первым
      if (a.timestamp && !b.timestamp) {
        return -1;
      }
      if (!a.timestamp && b.timestamp) {
        return 1;
      }
      
      // Если у обоих нет timestamp, сортируем по дате добавления
      const dateA = parseDateString(a.dateAdded);
      const dateB = parseDateString(b.dateAdded);
      return dateB.getTime() - dateA.getTime();
    });

    return allProducts;
  } catch (error) {
    console.error('Ошибка при получении продуктов дашборда:', error);
    return [];
  }
};

/**
 * Получает изображение продукта по ID из истории сканирований
 */
const getProductImageById = async (productId: string): Promise<string | undefined> => {
  try {
    const { getScanHistory } = await import('./scanHistory');
    const scanHistory = await getScanHistory();
    const foundProduct = scanHistory.find(item => item.id === productId);
    return foundProduct?.image;
  } catch (error) {
    console.error('Ошибка при получении изображения продукта:', error);
    return undefined;
  }
};

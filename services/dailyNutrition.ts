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
  addedProducts: {
    productId: string;
    name: string;
    servingMultiplier: number; // Коэффициент порции (1.0 = стандартная порция)
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    image?: string; // URL изображения продукта
    timestamp?: number; // Время добавления продукта
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
  date?: string // Необязательный параметр, по умолчанию - сегодня
): Promise<DailyNutritionData> => {
  try {
    // Используем текущую дату, если дата не указана
    const targetDate = date || formatDateToString(new Date());
    
    // Получаем текущие данные за день
    const dayData = await getDailyNutrition(targetDate);
    
    if (!dayData) {
      throw new Error('Не удалось получить данные о питании за день');
    }
    
    // Извлекаем данные о скрытом сахаре, если они есть
    let sugar = 0;
    
    // Отладочное логирование
    console.log('Добавление продукта:', product.name, 'ID:', product.id);
    
    if (product.fullData) {
      try {
        // Пробуем анализировать полные данные продукта
        const fullData = JSON.parse(product.fullData);
        
        // Выводим всю структуру данных полностью для отладки
        console.log('Структура данных:', JSON.stringify(fullData, null, 2));
        
        // Проверяем структуру данных API-ответа
        if (fullData && fullData.foodData && fullData.foodData.nutritionInfo) {
          console.log('Нашли nutritionInfo в ответе API');
          const { nutritionInfo } = fullData.foodData;
          
          // Ищем значение сахара в разных местах
          if (nutritionInfo.sugars !== undefined) {
            sugar = nutritionInfo.sugars;
            console.log('Значение сахара из foodData.nutritionInfo.sugars:', sugar);
          } else {
            console.log('Значение sugars не найдено в nutritionInfo');
          }
          
          // Выводим все ключи в nutritionInfo
          console.log('Ключи в nutritionInfo:', Object.keys(nutritionInfo));
        } else {
          console.log('Не нашли foodData.nutritionInfo в ответе API');
          
          // Пробуем найти другие варианты структуры
          if (fullData.nutritionInfo && fullData.nutritionInfo.sugars !== undefined) {
            sugar = fullData.nutritionInfo.sugars;
            console.log('Значение сахара из fullData.nutritionInfo.sugars:', sugar);
          } else if (fullData.sugar !== undefined) {
            sugar = fullData.sugar;
            console.log('Значение сахара из fullData.sugar:', sugar);
          } else {
            console.log('Сахар не найден в данных продукта');
          }
        }
      } catch (error) {
        console.error('Ошибка при парсинге fullData:', error);
      }
    } else {
      console.log('Нет полных данных для продукта:', product.name);
    }
    
    // Рассчитываем значения с учетом множителя порции
    const caloriesAdded = Math.round(product.calories * servingMultiplier);
    const proteinAdded = Math.round(product.protein * servingMultiplier * 10) / 10;
    const fatAdded = Math.round(product.fat * servingMultiplier * 10) / 10;
    const carbsAdded = Math.round(product.carbs * servingMultiplier * 10) / 10;
    const sugarAdded = Math.round(sugar * servingMultiplier * 10) / 10;
    
    // Добавляем продукт в список и обновляем суммарные значения
    const updatedData: DailyNutritionData = {
      ...dayData,
      caloriesConsumed: dayData.caloriesConsumed + caloriesAdded,
      protein: Math.round((dayData.protein + proteinAdded) * 10) / 10,
      fat: Math.round((dayData.fat + fatAdded) * 10) / 10,
      carbs: Math.round((dayData.carbs + carbsAdded) * 10) / 10,
      sugar: Math.round((dayData.sugar + sugarAdded) * 10) / 10,
      addedProducts: [
        ...dayData.addedProducts,
        {
          productId: product.id,
          name: product.name,
          servingMultiplier,
          calories: caloriesAdded,
          protein: proteinAdded,
          fat: fatAdded,
          carbs: carbsAdded,
          sugar: sugarAdded,
          image: product.image,
          timestamp: Date.now()
        }
      ]
    };
    
    // Сохраняем обновленные данные
    await saveDailyNutrition(updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Ошибка при добавлении продукта в дневную статистику:', error);
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
    // Используем текущую дату, если дата не указана
    const targetDate = date || formatDateToString(new Date());
    
    // Получаем текущие данные за день
    const dayData = await getDailyNutrition(targetDate);
    
    if (!dayData || dayData.addedProducts.length === 0) {
      return dayData; // Нечего удалять
    }
    
    // Ищем продукт для удаления
    const productIndex = dayData.addedProducts.findIndex(p => p.productId === productId);
    
    if (productIndex === -1) {
      return dayData; // Продукт не найден
    }
    
    // Данные о продукте, который нужно удалить
    const productToRemove = dayData.addedProducts[productIndex];
    
    // Обновляем суммарные значения
    const updatedData: DailyNutritionData = {
      ...dayData,
      caloriesConsumed: dayData.caloriesConsumed - productToRemove.calories,
      protein: Math.round((dayData.protein - productToRemove.protein) * 10) / 10,
      fat: Math.round((dayData.fat - productToRemove.fat) * 10) / 10,
      carbs: Math.round((dayData.carbs - productToRemove.carbs) * 10) / 10,
      sugar: Math.round((dayData.sugar - productToRemove.sugar) * 10) / 10,
      addedProducts: dayData.addedProducts.filter((_, index) => index !== productIndex)
    };
    
    // Сохраняем обновленные данные
    await saveDailyNutrition(updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Ошибка при удалении продукта из дневной статистики:', error);
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
  dateAdded: string;
  servingMultiplier: number;
  image?: string; // URL изображения продукта
  timestamp?: number; // Время добавления продукта
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
      dateAdded: string;
      servingMultiplier: number;
      image?: string; // URL изображения продукта
      timestamp?: number; // Время добавления продукта
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
          timestamp: product.timestamp
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

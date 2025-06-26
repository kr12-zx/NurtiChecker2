/**
 * Сервис для унифицированной навигации между экранами
 */
import { router } from 'expo-router';
import { ScanHistoryItem } from './scanHistory';
import { setTempData } from './tempStore';

/**
 * Универсальная функция для перехода на экран продукта
 * Обеспечивает одинаковый результат, независимо от источника навигации
 */
export const navigateToProductDetail = (item: ScanHistoryItem, dashboardData?: {
  actualCalories: number;
  actualProtein: number;
  actualFat: number;
  actualCarbs: number;
  actualSugar: number;
  actualFiber: number;
  actualSaturatedFat: number;
  servingMultiplier: number;
  baseWeight?: number; // Базовый вес продукта в граммах
  actualWeight?: number; // Фактически съеденный вес в граммах
}) => {
  // Сохраняем изображение во временное хранилище
  if (item.image) {
    setTempData(`image_${item.id}`, item.image);
  }

  // Подготовка данных для анализа (с приоритетом на полные данные)
  let analysisData;

  console.log('🔍 ДЕБАГ navigationService - item:', {
    id: item.id,
    name: item.name,
    hasFullData: !!item.fullData,
    fullDataLength: item.fullData?.length || 0,
    fullDataPreview: item.fullData?.substring(0, 100) || 'НЕТ ДАННЫХ'
  });

  if (item.fullData) {
    try {
      // Используем полные данные, если они есть
      const parsedData = JSON.parse(item.fullData);
      console.log('🔍 ДЕБАГ navigationService - parsedData структура:', {
        hasFoodData: !!parsedData.foodData,
        hasDirectPortionInfo: !!parsedData.portionInfo,
        hasNutritionInfo: !!parsedData.nutritionInfo,
        estimatedWeight: parsedData.portionInfo?.estimatedWeight,
        topLevelKeys: Object.keys(parsedData)
      });
      
      if (parsedData.foodData) {
        // Новая структура с foodData
        analysisData = parsedData.foodData;
        console.log('✅ ДЕБАГ navigationService - Используем parsedData.foodData, вес:', analysisData.portionInfo?.estimatedWeight);
      } else if (parsedData.portionInfo && parsedData.nutritionInfo) {
        // Старая структура - данные на верхнем уровне (КАК У НАС!)
        analysisData = parsedData;
        console.log('✅ ДЕБАГ navigationService - Используем parsedData напрямую, вес:', analysisData.portionInfo?.estimatedWeight);
      } else {
        // Если структура не соответствует ожидаемой
        console.log('❌ ДЕБАГ navigationService - Неизвестная структура, создаем базовые данные');
        analysisData = createBasicAnalysisData(item);
      }
    } catch (error) {
      console.error('❌ ДЕБАГ navigationService - Ошибка парсинга fullData:', error);
      analysisData = createBasicAnalysisData(item);
    }
  } else {
    // Создаем базовые данные анализа
    console.log('❌ ДЕБАГ navigationService - НЕТ fullData, создаем базовые данные');
    analysisData = createBasicAnalysisData(item);
  }

  // Безопасно извлекаем название продукта (может быть объектом)
  const safeProductName = typeof item.name === 'string' ? item.name : 
    (item.name as any)?.name || (item.name as any)?.title || 'Unknown product';

  // Базовые параметры навигации
  const baseParams = {
    id: item.id,
    productName: safeProductName,
    calories: item.calories.toString(),
    protein: item.protein.toString(),
    fat: item.fat.toString(),
    carbs: item.carbs.toString(),
    imgKey: `image_${item.id}`,
    date: item.date,
    scanDate: item.scanDate,
    useRealData: 'true',
    analysisData: JSON.stringify(analysisData),
    fullData: item.fullData || '',
    originalData: item.fullData ? 'true' : 'false'
  };

  // Если это продукт из дашборда, добавляем фактические съеденные значения
  const params = dashboardData ? {
    ...baseParams,
    fromDashboard: 'true',
    actualCalories: dashboardData.actualCalories.toString(),
    actualProtein: dashboardData.actualProtein.toString(),
    actualFat: dashboardData.actualFat.toString(),
    actualCarbs: dashboardData.actualCarbs.toString(),
    actualSugar: dashboardData.actualSugar.toString(),
    actualFiber: dashboardData.actualFiber.toString(),
    actualSaturatedFat: dashboardData.actualSaturatedFat.toString(),
    servingMultiplier: dashboardData.servingMultiplier.toString(),
    baseWeight: dashboardData.baseWeight?.toString() || '100', // Передаем базовый вес
    actualWeight: dashboardData.actualWeight?.toString() || '100' // Передаем фактически съеденный вес
  } : baseParams;

  // Навигация на экран продукта
  router.push({
    pathname: "/product/[id]",
    params
  });
};

/**
 * Создает базовые данные анализа из простого объекта истории
 */
function createBasicAnalysisData(item: ScanHistoryItem) {
  // Безопасно извлекаем название (может быть объектом)
  const safeName = typeof item.name === 'string' ? item.name : 
    (item.name as any)?.name || (item.name as any)?.title || 'Unknown product';
  
  // Восстанавливаем оригинальные данные из fullData
  let originalPortionDescription = 'Standard portion';
  let originalPortionInfo = {
    description: 'Standard portion',
    estimatedWeight: 100,
    measurementUnit: 'g'
  };
  
  if (item.fullData) {
    try {
      const fullData = JSON.parse(item.fullData);
      
      // Восстанавливаем полные данные порции из анализа
      if (fullData.foodData?.portionInfo) {
        originalPortionInfo = { ...fullData.foodData.portionInfo };
      }
      
      // Восстанавливаем оригинальное описание порции
      if (fullData.foodData?.portionDescription) {
        originalPortionDescription = fullData.foodData.portionDescription;
      }
      
    } catch (error) {
      console.error('Ошибка при извлечении оригинальных данных из fullData:', error);
    }
  }
    
  return {
    foodName: safeName,
    portionDescription: originalPortionDescription,
    portionInfo: originalPortionInfo,
    nutritionInfo: {
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sugars: item.sugar || 0,
      saturatedFat: 0,
      fiber: 0,
      sodium: 0,
      glycemicIndex: null,
      vitamins: [],
      minerals: []
    },
    analysis: {
      healthBenefits: [],
      healthConcerns: [],
      overallHealthScore: 50
    },
    recommendedIntake: {
      description: `Употреблять в умеренных количествах как часть сбалансированной диеты.`,
      maxFrequency: `ежедневно`
    }
  };
}

/**
 * Переход на экран истории с выбранной вкладкой дашборда
 */
export const navigateToHistoryDashboard = () => {
  router.push({
    pathname: "/history",
    params: {
      tab: 'dashboard'
    }
  });
};

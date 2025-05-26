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
export const navigateToProductDetail = (item: ScanHistoryItem) => {
  // Сохраняем изображение во временное хранилище
  if (item.image) {
    setTempData(`image_${item.id}`, item.image);
  }

  // Подготовка данных для анализа (с приоритетом на полные данные)
  let analysisData;

  if (item.fullData) {
    // Используем полные данные, если они есть
    const parsedData = JSON.parse(item.fullData);
    if (parsedData.foodData) {
      analysisData = parsedData.foodData;
    } else {
      // Если структура не соответствует ожидаемой
      analysisData = createBasicAnalysisData(item);
    }
  } else {
    // Создаем базовые данные анализа
    analysisData = createBasicAnalysisData(item);
  }

  // Навигация на экран продукта
  router.push({
    pathname: "/product/[id]",
    params: {
      id: item.id,
      productName: item.name,
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
    }
  });
};

/**
 * Создает базовые данные анализа из простого объекта истории
 */
function createBasicAnalysisData(item: ScanHistoryItem) {
  return {
    foodName: item.name,
    portionInfo: {
      description: `Стандартная порция`,
      estimatedWeight: 100, // Стандартная порция 100г вместо 280г
      measurementUnit: 'г'
    },
    nutritionInfo: {
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sugars: 5,
      saturatedFat: 3,
      fiber: 5,
      sodium: 1,
      glycemicIndex: 55,
      vitamins: ['A', 'C', 'E'],
      minerals: ['Calcium', 'Iron']
    },
    analysis: {
      healthBenefits: [
        'Содержит белок высокого качества',
        'Обеспечивает энергией'
      ],
      healthConcerns: [
        'Может содержать натрий',
        'Следите за добавленными соусами'
      ],
      overallHealthScore: 70
    },
    recommendedIntake: {
      description: `Может быть частью сбалансированного питания. Выбирайте цельнозерновой хлеб и постную индейку. Следите за добавленными соусами и размером порции.`,
      maxFrequency: `2-3 раза в неделю`
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

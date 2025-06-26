/**
 * Утилиты для отладки и тестирования данных питания
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DataIntegrityReport {
  totalDays: number;
  duplicateProducts: Array<{
    productId: string;
    dates: string[];
    count: number;
  }>;
  inconsistentCalories: Array<{
    date: string;
    calculatedCalories: number;
    storedCalories: number;
    difference: number;
  }>;
  missingTimestamps: Array<{
    date: string;
    productsWithoutTimestamp: number;
  }>;
  sugarInconsistencies: Array<{
    date: string;
    calculatedSugar: number;
    storedSugar: number;
    difference: number;
  }>;
}

/**
 * Логирует текущее состояние данных питания
 */
export const logNutritionState = async (context: string, currentDate?: Date) => {
  try {
    const { formatDateToString, getAllDailyNutrition } = await import('../services/dailyNutrition');
    
    console.log(`\n🔍 === NUTRITION STATE DEBUG [${context}] ===`);
    
    if (currentDate) {
      const dateStr = formatDateToString(currentDate);
      console.log(`📅 Текущая дата: ${dateStr}`);
    }
    
    // Получаем все данные
    const allDays = await getAllDailyNutrition();
    console.log(`📊 Общее количество дней с данными: ${allDays.length}`);
    
    for (const day of allDays) {
      console.log(`\n📅 Дата: ${day.date}`);
      console.log(`   Калории: ${day.caloriesConsumed}`);
      console.log(`   Сахар: ${day.sugar}`);
      console.log(`   Продуктов: ${day.addedProducts.length}`);
      
      // Проверяем каждый продукт
      day.addedProducts.forEach((product, index) => {
        console.log(`   [${index}] ${product.name}`);
        console.log(`       ID: ${product.productId}`);
        console.log(`       Калории: ${product.calories}`);
        console.log(`       Сахар: ${product.sugar}`);
        console.log(`       Timestamp: ${product.timestamp ? new Date(product.timestamp).toLocaleString() : 'НЕТ'}`);
      });
      
      // Валидация суммы калорий
      const calculatedCalories = day.addedProducts.reduce((sum, p) => sum + p.calories, 0);
      if (Math.abs(calculatedCalories - day.caloriesConsumed) > 1) {
        console.log(`   ⚠️ НЕСООТВЕТСТВИЕ КАЛОРИЙ: рассчитано=${calculatedCalories}, сохранено=${day.caloriesConsumed}`);
      }
      
      // Валидация суммы сахара
      const calculatedSugar = day.addedProducts.reduce((sum, p) => sum + p.sugar, 0);
      if (Math.abs(calculatedSugar - day.sugar) > 0.1) {
        console.log(`   ⚠️ НЕСООТВЕТСТВИЕ САХАРА: рассчитано=${calculatedSugar}, сохранено=${day.sugar}`);
      }
    }
    
    console.log(`🔍 === END NUTRITION STATE DEBUG ===\n`);
    
  } catch (error) {
    console.error('❌ Ошибка при логировании состояния:', error);
  }
};

/**
 * Проверяет целостность данных питания
 */
export const checkDataIntegrity = async (): Promise<DataIntegrityReport> => {
  const report: DataIntegrityReport = {
    totalDays: 0,
    duplicateProducts: [],
    inconsistentCalories: [],
    missingTimestamps: [],
    sugarInconsistencies: []
  };
  
  try {
    const { getAllDailyNutrition } = await import('../services/dailyNutrition');
    const allDays = await getAllDailyNutrition();
    report.totalDays = allDays.length;
    
    // Отслеживаем дубликаты продуктов
    const productTracker = new Map<string, string[]>();
    
    for (const day of allDays) {
      // Проверяем калории
      const calculatedCalories = day.addedProducts.reduce((sum, p) => sum + p.calories, 0);
      if (Math.abs(calculatedCalories - day.caloriesConsumed) > 1) {
        report.inconsistentCalories.push({
          date: day.date,
          calculatedCalories,
          storedCalories: day.caloriesConsumed,
          difference: calculatedCalories - day.caloriesConsumed
        });
      }
      
      // Проверяем сахар
      const calculatedSugar = day.addedProducts.reduce((sum, p) => sum + p.sugar, 0);
      if (Math.abs(calculatedSugar - day.sugar) > 0.1) {
        report.sugarInconsistencies.push({
          date: day.date,
          calculatedSugar,
          storedSugar: day.sugar,
          difference: calculatedSugar - day.sugar
        });
      }
      
      // Проверяем timestamp
      const productsWithoutTimestamp = day.addedProducts.filter(p => !p.timestamp).length;
      if (productsWithoutTimestamp > 0) {
        report.missingTimestamps.push({
          date: day.date,
          productsWithoutTimestamp
        });
      }
      
      // Отслеживаем дубликаты
      day.addedProducts.forEach(product => {
        const key = `${product.productId}-${product.name}`;
        if (!productTracker.has(key)) {
          productTracker.set(key, []);
        }
        productTracker.get(key)!.push(day.date);
      });
    }
    
    // Находим дубликаты
    for (const [key, dates] of productTracker.entries()) {
      if (dates.length > 1) {
        const [productId] = key.split('-');
        report.duplicateProducts.push({
          productId,
          dates,
          count: dates.length
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке целостности данных:', error);
  }
  
  return report;
};

/**
 * Печатает отчет о целостности данных
 */
export const printIntegrityReport = (report: DataIntegrityReport) => {
  console.log('\n📋 === ОТЧЕТ О ЦЕЛОСТНОСТИ ДАННЫХ ===');
  console.log(`📊 Всего дней с данными: ${report.totalDays}`);
  
  if (report.duplicateProducts.length > 0) {
    console.log(`\n🔄 Дублирующиеся продукты (${report.duplicateProducts.length}):`);
    report.duplicateProducts.forEach(dup => {
      console.log(`   ${dup.productId}: ${dup.count} раз в датах [${dup.dates.join(', ')}]`);
    });
  }
  
  if (report.inconsistentCalories.length > 0) {
    console.log(`\n⚠️ Несоответствия калорий (${report.inconsistentCalories.length}):`);
    report.inconsistentCalories.forEach(inc => {
      console.log(`   ${inc.date}: рассчитано=${inc.calculatedCalories}, сохранено=${inc.storedCalories}, разница=${inc.difference}`);
    });
  }
  
  if (report.sugarInconsistencies.length > 0) {
    console.log(`\n🍯 Несоответствия сахара (${report.sugarInconsistencies.length}):`);
    report.sugarInconsistencies.forEach(inc => {
      console.log(`   ${inc.date}: рассчитано=${inc.calculatedSugar}, сохранено=${inc.storedSugar}, разница=${inc.difference}`);
    });
  }
  
  if (report.missingTimestamps.length > 0) {
    console.log(`\n⏰ Отсутствующие timestamp (${report.missingTimestamps.length}):`);
    report.missingTimestamps.forEach(miss => {
      console.log(`   ${miss.date}: ${miss.productsWithoutTimestamp} продуктов без timestamp`);
    });
  }
  
  console.log('📋 === КОНЕЦ ОТЧЕТА ===\n');
};

/**
 * Проверяет и логирует состояние после добавления продукта
 */
export const logAfterProductAdd = async (productName: string, targetDate: Date) => {
  const { formatDateToString } = await import('../services/dailyNutrition');
  const dateStr = formatDateToString(targetDate);
  console.log(`\n🍽️ === ПОСЛЕ ДОБАВЛЕНИЯ ПРОДУКТА: ${productName} ===`);
  console.log(`📅 Целевая дата: ${dateStr}`);
  
  await logNutritionState(`После добавления ${productName}`, targetDate);
  
  const report = await checkDataIntegrity();
  printIntegrityReport(report);
};

/**
 * Проверяет и логирует состояние после удаления продукта
 */
export const logAfterProductDelete = async (productId: string, targetDate: Date) => {
  const { formatDateToString } = await import('../services/dailyNutrition');
  const dateStr = formatDateToString(targetDate);
  console.log(`\n🗑️ === ПОСЛЕ УДАЛЕНИЯ ПРОДУКТА: ${productId} ===`);
  console.log(`📅 Целевая дата: ${dateStr}`);
  
  await logNutritionState(`После удаления ${productId}`, targetDate);
  
  const report = await checkDataIntegrity();
  printIntegrityReport(report);
};

/**
 * Очищает все данные питания и логирует процесс
 */
export const clearAllDataWithLogging = async () => {
  console.log('\n🧹 === ОЧИСТКА ВСЕХ ДАННЫХ ===');
  
  await logNutritionState('Перед очисткой');
  
  try {
    await AsyncStorage.removeItem('dailyNutrition');
    console.log('✅ Данные питания очищены');
    
    await logNutritionState('После очистки');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке данных:', error);
  }
  
  console.log('🧹 === ОЧИСТКА ЗАВЕРШЕНА ===\n');
};

/**
 * Тестирует сценарий добавления и удаления продукта
 */
export const testProductLifecycle = async () => {
  console.log('\n🧪 === ТЕСТ ЖИЗНЕННОГО ЦИКЛА ПРОДУКТА ===');
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  console.log('📊 Исходное состояние:');
  await logNutritionState('Исходное состояние');
  
  // Имитируем добавление продукта
  console.log('\n🍽️ Имитация добавления продукта...');
  // Здесь можно добавить тестовый продукт
  
  console.log('🧪 === ТЕСТ ЗАВЕРШЕН ===\n');
}; 
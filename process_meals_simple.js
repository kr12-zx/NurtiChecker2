// Упрощенная обработка данных из meals_added
console.log('=== УПРОЩЕННАЯ ОБРАБОТКА MEALS ===');

// Получаем данные из предыдущей ноды Get meals_added
let rawData = $input.all();
console.log('Получено записей:', rawData.length);
console.log('Первая запись:', JSON.stringify(rawData[0], null, 2));
console.log('Структура первой записи:', Object.keys(rawData[0] || {}));

// Проверяем, если данные приходят в обертке
let mealsData = rawData;
if (rawData.length === 1 && Array.isArray(rawData[0])) {
  // Данные приходят как [array_of_meals]
  mealsData = rawData[0];
  console.log('✅ Данные извлечены из обертки, новое количество:', mealsData.length);
} else if (rawData.length === 1 && rawData[0].json && Array.isArray(rawData[0].json)) {
  // Данные приходят как [{json: array_of_meals}]
  mealsData = rawData[0].json;
  console.log('✅ Данные извлечены из json обертки, новое количество:', mealsData.length);
}

console.log('Финальное количество блюд для обработки:', mealsData.length);

// Функция для безопасного преобразования в число
const safeFloat = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Обрабатываем каждое блюдо
const processedMeals = mealsData.map((item, index) => {
  // Проверяем разные возможные структуры данных
  let meal = item;
  if (item.json) {
    meal = item.json;
  }
  
  const dishName = meal.dish || 'Неизвестное блюдо';
  const calories = safeFloat(meal.kcal);
  
  console.log(`Блюдо ${index + 1}: "${dishName}" - ${calories} ккал`);
  console.log(`  Исходные данные: dish="${meal.dish}", kcal="${meal.kcal}"`);
  
  return {
    dish: dishName,
    calories: calories
  };
});

// Рассчитываем общую статистику
const totalCalories = processedMeals.reduce((sum, meal) => sum + meal.calories, 0);
const averageCalories = processedMeals.length > 0 ? Math.round(totalCalories / processedMeals.length) : 0;

// Находим самое калорийное блюдо
const highestCalorieMeal = processedMeals.reduce((max, meal) => 
  meal.calories > max.calories ? meal : max, 
  { dish: '', calories: 0 }
);

// Находим самое низкокалорийное блюдо (исключая 0 калорий)
const lowestCalorieMeal = processedMeals
  .filter(meal => meal.calories > 0)
  .reduce((min, meal) => 
    meal.calories < min.calories ? meal : min, 
    { dish: '', calories: Infinity }
  );

// Формируем результат
const result = {
  // Список всех блюд
  meals: processedMeals,
  
  // Общая статистика
  summary: {
    totalMeals: processedMeals.length,
    totalCalories: totalCalories,
    averageCalories: averageCalories,
    highestCalorieMeal: highestCalorieMeal,
    lowestCalorieMeal: lowestCalorieMeal.calories !== Infinity ? lowestCalorieMeal : null
  },
  
  // Топ-5 самых калорийных блюд
  topCalorieMeals: processedMeals
    .sort((a, b) => b.calories - a.calories)
    .slice(0, 5),
  
  // Простая категоризация по калориям
  categories: {
    highCalorie: processedMeals.filter(meal => meal.calories > 300).length,  // > 300 ккал
    mediumCalorie: processedMeals.filter(meal => meal.calories >= 100 && meal.calories <= 300).length, // 100-300 ккал
    lowCalorie: processedMeals.filter(meal => meal.calories < 100).length   // < 100 ккал
  }
};

console.log('=== УПРОЩЕННАЯ СТАТИСТИКА ПИТАНИЯ ===');
console.log('Общее количество блюд:', result.summary.totalMeals);
console.log('Общие калории:', result.summary.totalCalories);
console.log('Средние калории на блюдо:', result.summary.averageCalories);
console.log('Самое калорийное блюдо:', result.summary.highestCalorieMeal.dish, '-', result.summary.highestCalorieMeal.calories, 'ккал');
console.log('Самое низкокалорийное блюдо:', result.summary.lowestCalorieMeal?.dish, '-', result.summary.lowestCalorieMeal?.calories, 'ккал');
console.log('Категории по калориям:', result.categories);
console.log('Топ-5 калорийных блюд:', result.topCalorieMeals.map(m => `${m.dish} (${m.calories} ккал)`));

return [{ json: result }]; 
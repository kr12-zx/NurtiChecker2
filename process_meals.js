// Обработка данных из meals_added
console.log('=== ОБРАБОТКА MEALS_ADDED ===');

// Получаем данные из предыдущей ноды Get meals_added
const mealsData = $input.all();
console.log('Получено блюд:', mealsData.length);

// Функция для безопасного преобразования в число
const safeFloat = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Функция для агрегации питания
const aggregateNutrition = (meals) => {
  if (!meals || meals.length === 0) {
    console.log('⚠️ Нет данных о питании');
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
      totalSugar: 0,
      totalFiber: 0,
      totalSodium: 0,
      avgCaloriesPerDay: 0,
      avgProteinPerDay: 0,
      avgFatPerDay: 0,
      avgCarbsPerDay: 0,
      daysWithData: 0,
      vitamins: [],
      minerals: [],
      avgHealthScore: 0,
      mealCount: 0,
      topDishes: [],
      dishTypes: {}
    };
  }

  console.log('Обрабатываем', meals.length, 'блюд');

  // Агрегируем данные
  const totals = meals.reduce((acc, meal, index) => {
    console.log(`Блюдо ${index + 1}: ${meal.dish} - ${meal.kcal} ккал`);
    
    acc.calories += safeFloat(meal.kcal);
    acc.protein += safeFloat(meal.prot);
    acc.fat += safeFloat(meal.fat);
    acc.carbs += safeFloat(meal.carb);
    acc.sugar += safeFloat(meal.sugar);
    acc.fiber += safeFloat(meal.fiber);
    acc.sodium += safeFloat(meal.sodium);
    acc.healthScore += safeFloat(meal.overallhealthscore);
    
    // Собираем витамины
    if (meal.vitamins && Array.isArray(meal.vitamins)) {
      meal.vitamins.forEach(vitamin => {
        if (vitamin && typeof vitamin === 'string' && !acc.vitamins.includes(vitamin)) {
          acc.vitamins.push(vitamin);
        }
      });
    }
    
    // Собираем минералы
    if (meal.minerals && Array.isArray(meal.minerals)) {
      meal.minerals.forEach(mineral => {
        if (mineral && typeof mineral === 'string' && !acc.minerals.includes(mineral)) {
          acc.minerals.push(mineral);
        }
      });
    }
    
    return acc;
  }, {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugar: 0,
    fiber: 0,
    sodium: 0,
    healthScore: 0,
    vitamins: [],
    minerals: []
  });

  // Поскольку eaten_day = null, оцениваем количество дней
  // Предполагаем 3-4 приема пищи в день
  const estimatedDays = Math.max(1, Math.min(7, Math.ceil(meals.length / 3.5)));
  
  // Топ-5 блюд по калориям
  const topDishes = meals
    .filter(meal => meal.dish && safeFloat(meal.kcal) > 0)
    .sort((a, b) => safeFloat(b.kcal) - safeFloat(a.kcal))
    .slice(0, 5)
    .map(meal => ({
      dish: meal.dish,
      calories: safeFloat(meal.kcal),
      healthScore: safeFloat(meal.overallhealthscore),
      protein: safeFloat(meal.prot),
      fat: safeFloat(meal.fat),
      carbs: safeFloat(meal.carb)
    }));

  // Анализ типов блюд
  const dishTypes = {};
  meals.forEach(meal => {
    if (meal.dish) {
      const dish = meal.dish.toLowerCase();
      if (dish.includes('салат')) dishTypes.salads = (dishTypes.salads || 0) + 1;
      else if (dish.includes('мясо') || dish.includes('котлет') || dish.includes('утка')) dishTypes.meat = (dishTypes.meat || 0) + 1;
      else if (dish.includes('фрукт') || dish.includes('яблоко') || dish.includes('мандарин') || dish.includes('апельсин')) dishTypes.fruits = (dishTypes.fruits || 0) + 1;
      else if (dish.includes('хлеб') || dish.includes('багет')) dishTypes.bread = (dishTypes.bread || 0) + 1;
      else if (dish.includes('торт') || dish.includes('печенье')) dishTypes.sweets = (dishTypes.sweets || 0) + 1;
      else if (dish.includes('кофе') || dish.includes('вино')) dishTypes.beverages = (dishTypes.beverages || 0) + 1;
      else dishTypes.other = (dishTypes.other || 0) + 1;
    }
  });

  const result = {
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    totalSugar: Math.round(totals.sugar * 10) / 10,
    totalFiber: Math.round(totals.fiber * 10) / 10,
    totalSodium: Math.round(totals.sodium * 10) / 10,
    avgCaloriesPerDay: Math.round(totals.calories / estimatedDays),
    avgProteinPerDay: Math.round((totals.protein / estimatedDays) * 10) / 10,
    avgFatPerDay: Math.round((totals.fat / estimatedDays) * 10) / 10,
    avgCarbsPerDay: Math.round((totals.carbs / estimatedDays) * 10) / 10,
    daysWithData: estimatedDays,
    vitamins: totals.vitamins.sort(),
    minerals: totals.minerals.sort(),
    avgHealthScore: meals.length > 0 ? Math.round(totals.healthScore / meals.length) : 0,
    mealCount: meals.length,
    topDishes: topDishes,
    dishTypes: dishTypes
  };

  console.log('Агрегированные данные:', {
    totalCalories: result.totalCalories,
    estimatedDays: result.daysWithData,
    mealCount: result.mealCount,
    avgHealthScore: result.avgHealthScore,
    vitaminsCount: result.vitamins.length,
    mineralsCount: result.minerals.length
  });

  return result;
};

// Обрабатываем данные о питании
const processedMealsData = aggregateNutrition(mealsData);

console.log('=== ОБРАБОТАННЫЕ ДАННЫЕ ПИТАНИЯ ===');
console.log('Общие калории:', processedMealsData.totalCalories);
console.log('Среднее калорий в день:', processedMealsData.avgCaloriesPerDay);
console.log('Количество блюд:', processedMealsData.mealCount);
console.log('Средний рейтинг здоровья:', processedMealsData.avgHealthScore);
console.log('Витамины:', processedMealsData.vitamins.join(', '));
console.log('Минералы:', processedMealsData.minerals.join(', '));
console.log('Топ блюд по калориям:', processedMealsData.topDishes.map(d => `${d.dish} (${d.calories} ккал)`));
console.log('Типы блюд:', processedMealsData.dishTypes);

return [{ json: processedMealsData }]; 
// Объединение всех обработанных данных пользователя
console.log('=== ОБЪЕДИНЕНИЕ ВСЕХ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ===');

// Получаем данные из всех предыдущих нод
const webhookProcessedData = $('process_webhook_events').all();
const profilesData = $('Get profiles').all();
const mealsProcessedData = $('Code').all(); // Нода обработки meals
const originalRequest = $('Webhook - Get Recommendations').all()[0] || {};

console.log('Webhook processed data:', webhookProcessedData.length, 'записей');
console.log('Profiles data:', profilesData.length, 'записей');
console.log('Meals processed data:', mealsProcessedData.length, 'записей');

// Проверяем наличие всех необходимых данных
if (webhookProcessedData.length === 0) {
  console.error('❌ Нет обработанных данных webhook');
  return [{ json: { error: 'No processed webhook data' } }];
}

if (profilesData.length === 0) {
  console.error('❌ Нет данных профиля');
  return [{ json: { error: 'No profile data' } }];
}

if (mealsProcessedData.length === 0) {
  console.error('❌ Нет обработанных данных питания');
  return [{ json: { error: 'No processed meals data' } }];
}

// Извлекаем обработанные данные
const webhookData = webhookProcessedData[0].json || webhookProcessedData[0];
const profileData = profilesData[0].json || profilesData[0];
const mealsData = mealsProcessedData[0].json || mealsProcessedData[0];

console.log('=== ИЗВЛЕЧЕННЫЕ ДАННЫЕ ===');
console.log('Webhook data keys:', Object.keys(webhookData));
console.log('Profile data keys:', Object.keys(profileData));
console.log('Meals data keys:', Object.keys(mealsData));

// Получаем userId из оригинального запроса
const userId = originalRequest.body?.userId || originalRequest.userId || webhookData.user?.emailId;
console.log('User ID:', userId);

// Функция для очистки и нормализации названий блюд
const cleanDishName = (dishName) => {
  if (!dishName) return 'Неизвестное блюдо';
  
  // Убираем лишние пробелы и приводим к единому формату
  return dishName.trim()
    .replace(/\s+/g, ' ') // множественные пробелы в один
    .replace(/^\w/, c => c.toUpperCase()); // первая буква заглавная
};

// Функция для проверки реалистичности калорий
const validateCalories = (dishName, calories) => {
  const dish = dishName.toLowerCase();
  
  // Базовые проверки калорийности
  const calorieRanges = {
    'кофе': { min: 0, max: 50 },
    'чай': { min: 0, max: 30 },
    'вода': { min: 0, max: 10 },
    'яблоко': { min: 50, max: 120 },
    'апельсин': { min: 40, max: 100 },
    'мандарин': { min: 30, max: 60 },
    'салат': { min: 20, max: 200 },
    'оливки': { min: 50, max: 150 }
  };
  
  // Проверяем известные продукты
  for (const [product, range] of Object.entries(calorieRanges)) {
    if (dish.includes(product)) {
      if (calories < range.min || calories > range.max) {
        console.log(`⚠️ Подозрительные калории для "${dishName}": ${calories} ккал (ожидается ${range.min}-${range.max})`);
        // Возвращаем среднее значение диапазона
        return Math.round((range.min + range.max) / 2);
      }
    }
  }
  
  // Общие проверки
  if (calories > 2000) {
    console.log(`⚠️ Очень высокие калории для "${dishName}": ${calories} ккал`);
  }
  
  return calories;
};



// Функция для расширенной агрегации питания на основе упрощенных данных
const createDetailedNutritionSummary = (simpleMealsData, userProfile = {}) => {
  console.log('Создаем детальную сводку питания');
  
  if (!simpleMealsData || !simpleMealsData.meals) {
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
      allDishes: []
    };
  }

  const rawMeals = simpleMealsData.meals || [];
  const summary = simpleMealsData.summary || {};
  
  console.log(`Обрабатываем ${rawMeals.length} блюд для пользователя`);
  
  // Очищаем и нормализуем данные о блюдах
  const cleanedMeals = rawMeals.map((meal, index) => {
    const cleanedDish = cleanDishName(meal.dish);
    const validatedCalories = validateCalories(cleanedDish, meal.calories);
    
    console.log(`Блюдо ${index + 1}: "${cleanedDish}" - ${validatedCalories} ккал`);
    
    return {
      dish: cleanedDish,
      calories: validatedCalories,
      originalCalories: meal.calories
    };
  });
  

  
  // Пересчитываем общие калории с учетом корректировок
  const totalCalories = cleanedMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const mealCount = cleanedMeals.length;
  
  // Приблизительные расчеты макронутриентов (на основе средних значений)
  // Примерное соотношение: 50% углеводы, 30% жиры, 20% белки
  const estimatedCarbs = Math.round((totalCalories * 0.5) / 4); // 4 ккал на грамм углеводов
  const estimatedFat = Math.round((totalCalories * 0.3) / 9);   // 9 ккал на грамм жиров
  const estimatedProtein = Math.round((totalCalories * 0.2) / 4); // 4 ккал на грамм белков
  
  // Оценка дней с данными (примерно 3 приема пищи в день)
  const estimatedDays = Math.max(1, Math.min(7, Math.ceil(mealCount / 3)));
  
  // ВСЕ блюда пользователя для детального анализа AI (очищенные данные)
  const allDishes = cleanedMeals.map(meal => ({
    dish: meal.dish,
    calories: meal.calories
  }));
  

  
  console.log('Детальная сводка создана:', {
    totalCalories,
    mealCount,
    estimatedDays,
    allDishesCount: allDishes.length
  });

  return {
    totalCalories: totalCalories,
    totalProtein: estimatedProtein,
    totalFat: estimatedFat,
    totalCarbs: estimatedCarbs,
    totalSugar: Math.round(estimatedCarbs * 0.3), // примерно 30% углеводов - сахар
    totalFiber: Math.round(estimatedCarbs * 0.1), // примерно 10% углеводов - клетчатка
    totalSodium: Math.round(totalCalories * 2), // примерная оценка натрия
    avgCaloriesPerDay: Math.round(totalCalories / estimatedDays),
    avgProteinPerDay: Math.round(estimatedProtein / estimatedDays),
    avgFatPerDay: Math.round(estimatedFat / estimatedDays),
    avgCarbsPerDay: Math.round(estimatedCarbs / estimatedDays),
    daysWithData: estimatedDays,
    vitamins: ['Витамин C', 'Витамин A', 'Витамин D'], // примерный список
    minerals: ['Железо', 'Кальций', 'Магний'], // примерный список
    avgHealthScore: 75, // средняя оценка здоровья
    mealCount: mealCount,
    
    // ВСЕ блюда для детального AI анализа (очищенные данные)
    allDishes: allDishes
  };
};

// Формируем финальные структурированные данные
const structuredData = {
  user: {
    emailId: userId,
    age: webhookData.user?.age || null,
    timezone: profileData.timezone || webhookData.user?.timezone || 'UTC',
    timezoneOffset: profileData.timezone_offset || webhookData.user?.timezoneOffset || 0,
    locale: profileData.locale || 'en',
    country: profileData.country || 'Unknown'
  },
  profile: {
    // Физические параметры
    gender: webhookData.profile?.gender || null,
    height: webhookData.profile?.height || null,
    currentWeight: webhookData.profile?.currentWeight || null,
    goalWeight: webhookData.profile?.goalWeight || null,
    weightLossRate: webhookData.profile?.weightLossRate || null,
    
    // Цели и активность
    primaryGoal: webhookData.profile?.primaryGoal || null,
    activityLevel: webhookData.profile?.activityLevel || null,
    
    // Пищевые предпочтения
    dietPreference: webhookData.profile?.dietPreference || null,
    nutritionFocus: webhookData.profile?.nutritionFocus || null,
    mealFrequency: webhookData.profile?.mealFrequency || null,
    foodPreferences: webhookData.profile?.foodPreferences || null,
    foodVariety: webhookData.profile?.foodVariety || null,
    
    // План похудения
    weightLossPlan: webhookData.profile?.weightLossPlan || null,
    exerciseIntent: webhookData.profile?.exerciseIntent || null,
    showCalorieTutorial: webhookData.profile?.showCalorieTutorial || null,
    useFlexibleCalories: webhookData.profile?.useFlexibleCalories || null,
    intermittentFasting: webhookData.profile?.intermittentFasting || null,
    
    // Психологический профиль
    confidenceLevel: webhookData.profile?.confidenceLevel || null,
    challenges: webhookData.profile?.challenges || [],
    mainObstacle: webhookData.profile?.mainObstacle || null,
    stressResponse: webhookData.profile?.stressResponse || null,
    adaptability: webhookData.profile?.adaptability || null,
    challengesView: webhookData.profile?.challengesView || null,
    setbacksResponse: webhookData.profile?.setbacksResponse || null,
    decisionMaking: webhookData.profile?.decisionMaking || null,
    difficultSituationsHandling: webhookData.profile?.difficultSituationsHandling || null,
    temptationResponse: webhookData.profile?.temptationResponse || null,
    eatingHabitsAssessment: webhookData.profile?.eatingHabitsAssessment || null
  },
  settings: {
    weightUnit: webhookData.settings?.weightUnit || 'kg',
    heightUnit: webhookData.settings?.heightUnit || 'cm',
    system: webhookData.settings?.system || 'metric'
  },
  weeklyNutrition: createDetailedNutritionSummary(mealsData, webhookData.profile)
};

console.log('=== ФИНАЛЬНЫЕ ОБЪЕДИНЕННЫЕ ДАННЫЕ ===');
console.log('User:', structuredData.user);
console.log('Profile - основные параметры:', {
  gender: structuredData.profile.gender,
  height: structuredData.profile.height,
  currentWeight: structuredData.profile.currentWeight,
  primaryGoal: structuredData.profile.primaryGoal,
  challenges: structuredData.profile.challenges?.length || 0
});
console.log('Weekly nutrition summary:', {
  totalCalories: structuredData.weeklyNutrition.totalCalories,
  mealCount: structuredData.weeklyNutrition.mealCount,
  avgCaloriesPerDay: structuredData.weeklyNutrition.avgCaloriesPerDay,
  daysWithData: structuredData.weeklyNutrition.daysWithData
});

return [{ json: structuredData }]; 
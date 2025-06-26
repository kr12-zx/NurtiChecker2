// Обработка и структурирование данных пользователя
console.log('=== НАЧАЛО ОБРАБОТКИ ДАННЫХ ===');

// Получаем данные из предыдущих нод
const webhookEventsData = $('Get webhook_events').all();
const profilesData = $('Get profiles').all();
const mealsData = $('Get meals_added').all();
const originalRequest = $('Webhook - Get Recommendations').all()[0] || {};

console.log('Webhook Events Data:', webhookEventsData.length, 'записей');
console.log('Profiles Data:', profilesData.length, 'записей');
console.log('Meals Data:', mealsData.length, 'записей');

// Извлекаем данные профиля из payload webhook_events
let profileData = {};
if (webhookEventsData.length > 0 && webhookEventsData[0].payload) {
  try {
    profileData = JSON.parse(webhookEventsData[0].payload);
    console.log('✅ Payload успешно распарсен');
  } catch (error) {
    console.error('❌ Ошибка парсинга payload:', error);
    profileData = {};
  }
} else {
  console.log('⚠️ Нет данных webhook_events или payload пустой');
}

// Извлекаем данные из profiles
const settingsData = profilesData.length > 0 ? profilesData[0] : {};
console.log('Settings Data:', settingsData);

// Извлекаем основные части данных
const profile = profileData.profile || {};
const settings = profileData.settings || {};
const user = profileData.user || {};

console.log('Profile keys:', Object.keys(profile));
console.log('Settings keys:', Object.keys(settings));
console.log('User keys:', Object.keys(user));

// Функция для расчета возраста
const calculateAge = (birthday) => {
  if (!birthday) return null;
  try {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  } catch (error) {
    console.error('Ошибка расчета возраста:', error);
    return null;
  }
};

// Функция для агрегации питания
const aggregateNutrition = (meals) => {
  console.log('Агрегируем питание для', meals.length, 'блюд');
  
  if (!meals || meals.length === 0) {
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
      topDishes: []
    };
  }

  // Агрегируем данные
  const totals = meals.reduce((acc, meal) => {
    // Безопасное преобразование в числа
    const safeFloat = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

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
        if (vitamin && !acc.vitamins.includes(vitamin)) {
          acc.vitamins.push(vitamin);
        }
      });
    }
    
    // Собираем минералы
    if (meal.minerals && Array.isArray(meal.minerals)) {
      meal.minerals.forEach(mineral => {
        if (mineral && !acc.minerals.includes(mineral)) {
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

  // Поскольку eaten_day = null, предполагаем что это данные за несколько дней
  // Для расчета среднего возьмем примерно 7 дней (неделя)
  const estimatedDays = Math.max(1, Math.min(7, Math.ceil(meals.length / 3))); // примерно 3 приема пищи в день
  
  // Топ-5 блюд по калориям
  const topDishes = meals
    .sort((a, b) => parseFloat(b.kcal || 0) - parseFloat(a.kcal || 0))
    .slice(0, 5)
    .map(meal => ({
      dish: meal.dish,
      calories: parseFloat(meal.kcal || 0),
      healthScore: parseFloat(meal.overallhealthscore || 0)
    }));

  console.log('Агрегированные данные:', {
    totalCalories: totals.calories,
    estimatedDays,
    mealCount: meals.length,
    vitaminsCount: totals.vitamins.length,
    mineralsCount: totals.minerals.length
  });

  return {
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
    vitamins: totals.vitamins,
    minerals: totals.minerals,
    avgHealthScore: meals.length > 0 ? Math.round(totals.healthScore / meals.length) : 0,
    mealCount: meals.length,
    topDishes: topDishes
  };
};

// Получаем userId из оригинального запроса
const userId = originalRequest.body?.userId || originalRequest.userId || user.emailId;

// Формируем структурированные данные
const structuredData = {
  user: {
    emailId: userId,
    age: calculateAge(profile.birthday),
    timezone: settingsData.timezone || 'UTC',
    timezoneOffset: settingsData.timezone_offset || 0,
    locale: settingsData.locale || 'en',
    country: settingsData.country || 'Unknown'
  },
  profile: {
    // Физические параметры
    gender: profile.gender,
    height: profile.height,
    currentWeight: profile.currentWeight,
    goalWeight: profile.goalWeight,
    weightLossRate: profile.weightLossRate,
    
    // Цели и активность
    primaryGoal: profile.primaryGoal,
    activityLevel: profile.activityLevel,
    
    // Пищевые предпочтения
    dietPreference: profile.dietPreference,
    nutritionFocus: profile.nutritionFocus,
    mealFrequency: profile.mealFrequency,
    foodPreferences: profile.foodPreferences,
    foodVariety: profile.foodVariety,
    
    // План похудения
    weightLossPlan: profile.weightLossPlan,
    exerciseIntent: profile.exerciseIntent,
    showCalorieTutorial: profile.showCalorieTutorial,
    useFlexibleCalories: profile.useFlexibleCalories,
    intermittentFasting: profile.intermittentFasting,
    
    // Психологический профиль
    confidenceLevel: profile.confidenceLevel,
    challenges: profile.challenges || [],
    mainObstacle: profile.mainObstacle,
    stressResponse: profile.stressResponse,
    adaptability: profile.adaptability,
    challengesView: profile.challengesView,
    setbacksResponse: profile.setbacksResponse,
    decisionMaking: profile.decisionMaking,
    difficultSituationsHandling: profile.difficultSituationsHandling,
    temptationResponse: profile.temptationResponse,
    eatingHabitsAssessment: profile.eatingHabitsAssessment
  },
  settings: {
    weightUnit: settings.weightUnit || 'kg',
    heightUnit: settings.heightUnit || 'cm',
    system: settings.system || 'metric'
  },
  weeklyNutrition: aggregateNutrition(mealsData)
};

console.log('=== ФИНАЛЬНЫЕ СТРУКТУРИРОВАННЫЕ ДАННЫЕ ===');
console.log('User:', structuredData.user);
console.log('Profile keys:', Object.keys(structuredData.profile));
console.log('Weekly nutrition summary:', {
  totalCalories: structuredData.weeklyNutrition.totalCalories,
  mealCount: structuredData.weeklyNutrition.mealCount,
  avgHealthScore: structuredData.weeklyNutrition.avgHealthScore
});

return [{ json: structuredData }]; 
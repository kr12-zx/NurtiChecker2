// Объединение всех обработанных данных для AI
console.log('=== ОБЪЕДИНЕНИЕ ВСЕХ ДАННЫХ ===');

// Получаем данные из всех предыдущих нод обработки
// Предполагаем, что эта нода получает данные от трех нод обработки через Merge
const allInputs = $input.all();
console.log('Получено входов:', allInputs.length);

// Инициализируем структуры данных
let webhookData = {};
let profilesData = {};
let mealsData = {};

// Разбираем входные данные по типам
allInputs.forEach((input, index) => {
  console.log(`Вход ${index + 1}:`, Object.keys(input));
  
  // Определяем тип данных по структуре
  if (input.user && input.profile && input.settings) {
    // Это данные из webhook_events
    webhookData = input;
    console.log('✅ Найдены данные webhook');
  } else if (input.locale && input.timezone) {
    // Это данные из profiles
    profilesData = input;
    console.log('✅ Найдены данные profiles');
  } else if (input.totalCalories !== undefined) {
    // Это данные из meals_added
    mealsData = input;
    console.log('✅ Найдены данные meals');
  }
});

// Проверяем, что все данные получены
if (!webhookData.user) {
  console.error('❌ Отсутствуют данные webhook');
  webhookData = {
    user: { emailId: '', age: null },
    profile: {},
    settings: { weightUnit: 'kg', heightUnit: 'cm', system: 'metric' }
  };
}

if (!profilesData.locale) {
  console.error('❌ Отсутствуют данные profiles');
  profilesData = {
    locale: 'en',
    timezone: 'UTC',
    timezone_offset: 0,
    country: 'Unknown'
  };
}

if (!mealsData.totalCalories) {
  console.error('❌ Отсутствуют данные meals');
  mealsData = {
    totalCalories: 0,
    mealCount: 0,
    avgHealthScore: 0,
    vitamins: [],
    minerals: []
  };
}

// Объединяем все данные в единую структуру для AI
const finalData = {
  user: {
    emailId: webhookData.user.emailId,
    age: webhookData.user.age,
    timezone: profilesData.timezone || 'UTC',
    timezoneOffset: profilesData.timezone_offset || 0,
    locale: profilesData.locale || 'en',
    country: profilesData.country || 'Unknown'
  },
  
  profile: {
    // Физические параметры
    birthday: webhookData.profile.birthday,
    gender: webhookData.profile.gender,
    height: webhookData.profile.height,
    currentWeight: webhookData.profile.currentWeight,
    goalWeight: webhookData.profile.goalWeight,
    weightLossRate: webhookData.profile.weightLossRate,
    
    // Цели и активность
    primaryGoal: webhookData.profile.primaryGoal,
    activityLevel: webhookData.profile.activityLevel,
    
    // Пищевые предпочтения
    dietPreference: webhookData.profile.dietPreference,
    nutritionFocus: webhookData.profile.nutritionFocus,
    mealFrequency: webhookData.profile.mealFrequency,
    foodPreferences: webhookData.profile.foodPreferences,
    foodVariety: webhookData.profile.foodVariety,
    
    // План похудения
    weightLossPlan: webhookData.profile.weightLossPlan,
    exerciseIntent: webhookData.profile.exerciseIntent,
    showCalorieTutorial: webhookData.profile.showCalorieTutorial,
    useFlexibleCalories: webhookData.profile.useFlexibleCalories,
    intermittentFasting: webhookData.profile.intermittentFasting,
    
    // Психологический профиль
    confidenceLevel: webhookData.profile.confidenceLevel,
    challenges: webhookData.profile.challenges || [],
    mainObstacle: webhookData.profile.mainObstacle,
    stressResponse: webhookData.profile.stressResponse,
    adaptability: webhookData.profile.adaptability,
    challengesView: webhookData.profile.challengesView,
    setbacksResponse: webhookData.profile.setbacksResponse,
    decisionMaking: webhookData.profile.decisionMaking,
    difficultSituationsHandling: webhookData.profile.difficultSituationsHandling,
    temptationResponse: webhookData.profile.temptationResponse,
    eatingHabitsAssessment: webhookData.profile.eatingHabitsAssessment
  },
  
  settings: {
    weightUnit: webhookData.settings.weightUnit || 'kg',
    heightUnit: webhookData.settings.heightUnit || 'cm',
    system: webhookData.settings.system || 'metric'
  },
  
  weeklyNutrition: {
    totalCalories: mealsData.totalCalories || 0,
    totalProtein: mealsData.totalProtein || 0,
    totalFat: mealsData.totalFat || 0,
    totalCarbs: mealsData.totalCarbs || 0,
    totalSugar: mealsData.totalSugar || 0,
    totalFiber: mealsData.totalFiber || 0,
    totalSodium: mealsData.totalSodium || 0,
    avgCaloriesPerDay: mealsData.avgCaloriesPerDay || 0,
    avgProteinPerDay: mealsData.avgProteinPerDay || 0,
    avgFatPerDay: mealsData.avgFatPerDay || 0,
    avgCarbsPerDay: mealsData.avgCarbsPerDay || 0,
    daysWithData: mealsData.daysWithData || 0,
    vitamins: mealsData.vitamins || [],
    minerals: mealsData.minerals || [],
    avgHealthScore: mealsData.avgHealthScore || 0,
    mealCount: mealsData.mealCount || 0,
    topDishes: mealsData.topDishes || [],
    dishTypes: mealsData.dishTypes || {}
  }
};

console.log('=== ФИНАЛЬНЫЕ ОБЪЕДИНЕННЫЕ ДАННЫЕ ===');
console.log('User:', {
  emailId: finalData.user.emailId,
  age: finalData.user.age,
  locale: finalData.user.locale,
  country: finalData.user.country
});
console.log('Profile основные данные:', {
  gender: finalData.profile.gender,
  height: finalData.profile.height,
  currentWeight: finalData.profile.currentWeight,
  primaryGoal: finalData.profile.primaryGoal,
  dietPreference: finalData.profile.dietPreference
});
console.log('Nutrition summary:', {
  totalCalories: finalData.weeklyNutrition.totalCalories,
  avgCaloriesPerDay: finalData.weeklyNutrition.avgCaloriesPerDay,
  mealCount: finalData.weeklyNutrition.mealCount,
  avgHealthScore: finalData.weeklyNutrition.avgHealthScore,
  vitaminsCount: finalData.weeklyNutrition.vitamins.length,
  mineralsCount: finalData.weeklyNutrition.minerals.length
});

return [{ json: finalData }]; 
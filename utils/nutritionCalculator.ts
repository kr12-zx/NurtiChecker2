/**
 * 🧮 Калькулятор питания NutriChecker
 * Комплексная система расчета калорий и нутриентов на основе данных онбординга
 * 
 * Основан на научных формулах:
 * - Mifflin-St Jeor для BMR
 * - Стандартные коэффициенты активности для TDEE
 * - Рекомендации ВОЗ и диетологических ассоциаций
 */

import { UserProfile } from '../app/types/onboarding';

// Интерфейс результата расчета питания
export interface NutritionCalculationResult {
  // Базовые показатели
  bmr: number;
  tdee: number;
  targetCalories: number;
  
  // Макронутриенты (дневные)
  dailyMacros: {
    protein: number;
    fat: number;
    carbs: number;
    percentages: { protein: number; fat: number; carbs: number };
  };
  
  // Скрытый сахар
  maxHiddenSugar: number;
  
  // Недельные цели
  weeklyTargets: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    hiddenSugar: number;
  };
  
  // Прогноз
  expectedWeightChange: number;
  
  // Корректировки
  appliedAdjustments: {
    diet: number;
    stress: number;
    mealFrequency: number;
    foodPreferences: number;
    total: number;
  };
}

// Интерфейс валидации результатов
export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * 1. Расчет базового метаболизма (BMR) по формуле Mifflin-St Jeor
 * Наиболее точная формула для современного населения
 */
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Для female, non-binary, prefer-not-to-say используем женскую формулу
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * 2. Расчет общего дневного расхода энергии (TDEE)
 * Учитывает уровень активности и намерение заниматься спортом
 */
export function calculateTDEE(bmr: number, activityLevel: string, exerciseIntent: boolean): number {
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'lightly-active': 1.375,
    'moderately-active': 1.55,
    'very-active': 1.725,
    'extremely-active': 1.9
  };
  
  let multiplier = activityMultipliers[activityLevel] || 1.2;
  
  // Бонус за намерение заниматься спортом
  if (exerciseIntent) {
    multiplier += 0.05; // +5% за планируемые тренировки
  }
  
  return bmr * multiplier;
}

/**
 * 3. Расчет целевых калорий с учетом цели пользователя
 * Включает безопасные ограничения и корректировки по плану
 */
export function calculateTargetCalories(
  tdee: number, 
  primaryGoal: string, 
  weightLossRate: number,
  weightLossPlan: string,
  gender: string
): number {
  const minCalories = gender === 'female' ? 1200 : 1500; // Безопасные минимумы
  
  if (primaryGoal === 'lose-weight') {
    // 1 кг жира = 7000 ккал (современная более точная формула)
    const dailyDeficit = (weightLossRate * 7000) / 7;
    
    // Корректировка по плану похудения
    const planMultipliers: Record<string, number> = {
      'steady': 1.0,    // Стандартный дефицит
      'moderate': 1.2,  // +20% к дефициту
      'aggressive': 1.5 // +50% к дефициту (максимум)
    };
    
    const adjustedDeficit = dailyDeficit * (planMultipliers[weightLossPlan] || 1.0);
    const targetCalories = tdee - adjustedDeficit;
    
    // Проверка безопасности
    return Math.max(targetCalories, minCalories);
    
  } else if (primaryGoal === 'gain-muscle') {
    return tdee + 300; // Умеренный профицит для набора мышц
    
  } else if (primaryGoal === 'maintain-weight') {
    return tdee;
    
  } else {
    return tdee; // По умолчанию поддержание веса
  }
}

/**
 * 4. Корректировки по типу диеты
 * Учитывает термогенез и особенности различных диет
 */
export function getDietAdjustments(dietPreference: string): {
  calorieMultiplier: number;
  carbs: number;
  protein: number;
  fat: number;
} {
  const dietAdjustments: Record<string, any> = {
    'standard': { 
      calorieMultiplier: 1.0, 
      carbs: 0.50, protein: 0.20, fat: 0.30 
    },
    'keto': { 
      calorieMultiplier: 1.05, // +5% из-за термогенеза
      carbs: 0.05, protein: 0.25, fat: 0.70 
    },
    'low-carb': { 
      calorieMultiplier: 1.03, 
      carbs: 0.20, protein: 0.30, fat: 0.50 
    },
    'paleo': { 
      calorieMultiplier: 1.08, // +8% из-за необработанной пищи
      carbs: 0.35, protein: 0.30, fat: 0.35 
    },
    'mediterranean': { 
      calorieMultiplier: 1.02, 
      carbs: 0.45, protein: 0.20, fat: 0.35 
    },
    'vegan': { 
      calorieMultiplier: 1.05, // +5% из-за клетчатки
      carbs: 0.55, protein: 0.15, fat: 0.30 
    },
    'vegetarian': { 
      calorieMultiplier: 1.02, 
      carbs: 0.50, protein: 0.18, fat: 0.32 
    }
  };
  
  return dietAdjustments[dietPreference] || dietAdjustments['standard'];
}

/**
 * 5. Психологические корректировки калорий
 * Учитывает стресс, уверенность и самоконтроль
 */
export function getStressAdjustment(
  stressResponse: string, 
  confidenceLevel: number,
  temptationResponse: string,
  additionalFactors?: {
    mainObstacle?: string;
    challengesView?: string;
    setbacksResponse?: string;
    difficultSituationsHandling?: string;
    adaptability?: string;
  }
): number {
  let adjustment = 0;
  
  // Корректировка по стрессу
  if (stressResponse === 'emotional-eating') {
    adjustment += 100; // +100 ккал буфер для эмоционального переедания
  } else if (stressResponse === 'loss-of-appetite') {
    adjustment -= 50; // -50 ккал при потере аппетита
  }
  
  // Корректировка по уверенности
  if (confidenceLevel <= 2) {
    adjustment += 50; // Буфер для неуверенных пользователей
  } else if (confidenceLevel >= 4) {
    adjustment -= 25; // Меньший буфер для уверенных
  }
  
  // Корректировка по контролю соблазнов
  if (temptationResponse === 'often-give-in') {
    adjustment += 75; // Больший буфер для слабого самоконтроля
  } else if (temptationResponse === 'easily-resist') {
    adjustment -= 25; // Меньший буфер для сильного самоконтроля
  }
  
  // Дополнительные психологические факторы
  if (additionalFactors) {
    // Основное препятствие
    if (additionalFactors.mainObstacle === 'emotional-eating') {
      adjustment += 50; // Дополнительный буфер
    } else if (additionalFactors.mainObstacle === 'busy-schedule') {
      adjustment += 30; // Буфер для занятых людей
    }
    
    // Отношение к неудачам
    if (additionalFactors.setbacksResponse === 'give-up-easily') {
      adjustment += 40; // Больший буфер для тех, кто легко сдается
    } else if (additionalFactors.setbacksResponse === 'bounce-back') {
      adjustment -= 20; // Меньший буфер для стойких
    }
    
    // Адаптивность
    if (additionalFactors.adaptability === 'struggle-change') {
      adjustment += 35; // Буфер для тех, кому сложно адаптироваться
    }
  }
  
  return adjustment;
}

/**
 * 6. Корректировка по частоте приемов пищи
 * Учитывает термогенез и интервальное голодание
 */
export function getMealFrequencyAdjustment(mealFrequency: string, intermittentFasting: boolean): number {
  if (intermittentFasting) {
    return -50; // -50 ккал за счет улучшенной чувствительности к инсулину
  }
  
  const frequencyAdjustments: Record<string, number> = {
    '2-meals': -30,    // Меньше перекусов
    '3-meals': 0,      // Стандарт
    '4-meals': 20,     // Небольшое увеличение метаболизма
    '5-meals': 40,     // Термогенез от частого питания
    '6-meals': 60,     // Максимальный термогенез
    'intermittent': -50 // Интервальное голодание
  };
  
  return frequencyAdjustments[mealFrequency] || 0;
}

/**
 * 7. Расчет потребности в белке
 * Приоритет по весу тела, а не по калориям
 */
export function calculateProteinNeeds(
  weight: number, 
  activityLevel: string, 
  primaryGoal: string,
  nutritionFocus: string
): number {
  let proteinPerKg = 1.2; // Базовая потребность
  
  // Корректировка по активности
  if (activityLevel === 'very-active' || activityLevel === 'extremely-active') {
    proteinPerKg = 1.8;
  } else if (activityLevel === 'moderately-active') {
    proteinPerKg = 1.5;
  }
  
  // Корректировка по цели
  if (primaryGoal === 'gain-muscle') {
    proteinPerKg = Math.max(proteinPerKg, 2.0);
  } else if (primaryGoal === 'lose-weight') {
    proteinPerKg = Math.max(proteinPerKg, 1.6); // Сохранение мышц при похудении
  }
  
  // Корректировка по фокусу питания
  if (nutritionFocus === 'high-protein') {
    proteinPerKg *= 1.2; // +20% белка
  }
  
  return weight * proteinPerKg;
}

/**
 * 8. Полный расчет макронутриентов
 * Белок фиксирован, жиры и углеводы распределяются пропорционально
 */
export function calculateMacronutrients(
  targetCalories: number,
  proteinGrams: number,
  dietPreference: string,
  nutritionFocus: string
): {
  protein: number;
  fat: number;
  carbs: number;
  percentages: { protein: number; fat: number; carbs: number };
} {
  const dietRatios = getDietAdjustments(dietPreference);
  
  // Белок фиксирован по весу тела
  const proteinCalories = proteinGrams * 4;
  
  // Корректировка соотношений по фокусу питания
  let fatRatio = dietRatios.fat;
  let carbRatio = dietRatios.carbs;
  
  if (nutritionFocus === 'low-carb') {
    carbRatio *= 0.7; // -30% углеводов
    fatRatio = 1 - (proteinCalories / targetCalories) - carbRatio;
  } else if (nutritionFocus === 'plant-based') {
    carbRatio *= 1.1; // +10% углеводов
    fatRatio = 1 - (proteinCalories / targetCalories) - carbRatio;
  }
  
  // Расчет жиров и углеводов
  const remainingCalories = targetCalories - proteinCalories;
  const fatCalories = remainingCalories * (fatRatio / (fatRatio + carbRatio));
  const carbCalories = remainingCalories - fatCalories;
  
  const fatGrams = fatCalories / 9;
  const carbGrams = carbCalories / 4;
  
  return {
    protein: Math.round(proteinGrams),
    fat: Math.round(fatGrams),
    carbs: Math.round(carbGrams),
    percentages: {
      protein: Math.round((proteinCalories / targetCalories) * 100),
      fat: Math.round((fatCalories / targetCalories) * 100),
      carbs: Math.round((carbCalories / targetCalories) * 100)
    }
  };
}

/**
 * 9. Расчет максимальной дозы скрытого сахара
 * Основан на рекомендациях ВОЗ (<10% калорий, оптимально <5%)
 */
export function calculateMaxHiddenSugar(targetCalories: number, dietPreference: string): number {
  // ВОЗ рекомендует <10% калорий от добавленного сахара, оптимально <5%
  let maxSugarPercentage = 0.10; // 10% по умолчанию
  
  // Корректировка по типу диеты
  if (dietPreference === 'keto') {
    maxSugarPercentage = 0.02; // 2% для кето
  } else if (dietPreference === 'low-carb') {
    maxSugarPercentage = 0.05; // 5% для низкоуглеводной
  } else if (dietPreference === 'mediterranean') {
    maxSugarPercentage = 0.07; // 7% для средиземноморской
  }
  
  const maxSugarCalories = targetCalories * maxSugarPercentage;
  const maxSugarGrams = maxSugarCalories / 4; // 1г сахара = 4 ккал
  
  return Math.round(maxSugarGrams);
}

/**
 * 10. Расчет недельных целей
 * Умножение дневных показателей на 7 дней
 */
export function calculateWeeklyTargets(dailyTargets: {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  hiddenSugar: number;
}): {
  weekly: typeof dailyTargets;
  expectedWeightChange: number;
} {
  return {
    weekly: {
      calories: dailyTargets.calories * 7,
      protein: dailyTargets.protein * 7,
      fat: dailyTargets.fat * 7,
      carbs: dailyTargets.carbs * 7,
      hiddenSugar: dailyTargets.hiddenSugar * 7
    },
    expectedWeightChange: 0.5 // кг/неделю по умолчанию
  };
}

/**
 * 12. Расчет возраста из даты рождения
 */
export function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(age, 18); // Минимальный возраст 18 лет
}

/**
 * 13. Валидация результатов расчета
 * Проверка безопасности и выдача рекомендаций
 */
export function validateNutritionResults(result: NutritionCalculationResult, userProfile: Partial<UserProfile>): ValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Проверка минимальных калорий
  const minCalories = userProfile.gender === 'female' ? 1200 : 1500;
  if (result.targetCalories < minCalories) {
    warnings.push(`Калории ниже безопасного минимума (${minCalories})`);
  }
  
  // Проверка агрессивного дефицита
  const deficit = result.tdee - result.targetCalories;
  if (deficit > 1000) {
    warnings.push('Слишком агрессивный дефицит калорий (>1000 ккал/день)');
  }
  
  // Проверка белка
  const weight = userProfile.currentWeight || userProfile.weight;
  if (weight) {
    const proteinPerKg = result.dailyMacros.protein / weight;
    if (proteinPerKg < 1.0) {
      recommendations.push('Рассмотрите увеличение потребления белка');
    }
  }
  
  // Медицинские рекомендации
  const medication = userProfile.medication || (userProfile as any).medicationUse;
  if (medication && medication !== 'not-using') {
    recommendations.push('Проконсультируйтесь с врачом при приеме лекарств');
  }
  
  // Рекомендации по диете
  if (userProfile.dietPreference === 'keto' || userProfile.dietPreference === 'low-carb') {
    recommendations.push('При низкоуглеводной диете следите за потреблением клетчатки');
  }
  
  if (userProfile.dietPreference === 'vegan') {
    recommendations.push('Обратите внимание на витамин B12, железо и омега-3');
  }
  
  // Психологические рекомендации
  if (userProfile.stressResponse === 'emotional-eating') {
    recommendations.push('Рассмотрите практики осознанного питания');
  }
  
  if (userProfile.confidenceLevel && userProfile.confidenceLevel <= 2) {
    recommendations.push('Начните с небольших изменений для повышения уверенности');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
}

/**
 * 🎯 ГЛАВНАЯ ФУНКЦИЯ: Комплексный расчет всех показателей питания
 * Объединяет все формулы и корректировки в единый результат
 */
export function calculateCompleteNutrition(userProfile: Partial<UserProfile>): NutritionCalculationResult {
  // Получаем вес с fallback для совместимости
  const weight = userProfile.currentWeight || userProfile.weight;
  
  // Проверка обязательных полей
  if (!weight || !userProfile.height || !userProfile.birthday || !userProfile.gender) {
    throw new Error('Недостаточно данных для расчета питания');
  }
  
  // 1. Расчет возраста
  const age = calculateAge(userProfile.birthday);
  
  // 2. BMR
  const bmr = calculateBMR(weight, userProfile.height, age, userProfile.gender);
  
  // 3. TDEE
  const tdee = calculateTDEE(
    bmr, 
    userProfile.activityLevel || 'lightly-active', 
    userProfile.exerciseIntent || false
  );
  
  // 4. Базовые целевые калории
  const baseCalories = calculateTargetCalories(
    tdee, 
    userProfile.primaryGoal || 'maintain-weight', 
    userProfile.weightLossRate || 0.5,
    userProfile.weightLossPlan || 'steady',
    userProfile.gender
  );
  
  // 5. Применение корректировок
  const dietAdjustment = getDietAdjustments(userProfile.dietPreference || 'standard');
  const stressAdjustment = getStressAdjustment(
    userProfile.stressResponse || 'exercise',
    userProfile.confidenceLevel || 3,
    userProfile.temptationResponse || 'usually-control',
    {
      mainObstacle: (userProfile as any).mainObstacle,
      challengesView: (userProfile as any).challengesView,
      setbacksResponse: (userProfile as any).setbacksResponse,
      difficultSituationsHandling: (userProfile as any).difficultSituationsHandling,
      adaptability: (userProfile as any).adaptability
    }
  );
  const mealFrequencyAdjustment = getMealFrequencyAdjustment(
    userProfile.mealFrequency || '3-meals',
    userProfile.intermittentFasting || false
  );
  const foodPreferencesAdjustment = getFoodPreferencesAdjustment(
    (userProfile as any).foodPreferences,
    (userProfile as any).foodVariety,
    (userProfile as any).mealFeelings
  );
  
  // 6. Финальные калории
  const finalCalories = Math.round(
    baseCalories * dietAdjustment.calorieMultiplier + 
    stressAdjustment + 
    mealFrequencyAdjustment +
    foodPreferencesAdjustment
  );
  
  // 7. Белки
  const proteinGrams = calculateProteinNeeds(
    weight,
    userProfile.activityLevel || 'lightly-active',
    userProfile.primaryGoal || 'maintain-weight',
    userProfile.nutritionFocus || 'balanced'
  );
  
  // 8. Макронутриенты
  const macros = calculateMacronutrients(
    finalCalories,
    proteinGrams,
    userProfile.dietPreference || 'standard',
    userProfile.nutritionFocus || 'balanced'
  );
  
  // 9. Скрытый сахар
  const maxHiddenSugar = calculateMaxHiddenSugar(finalCalories, userProfile.dietPreference || 'standard');
  
  // 10. Недельные цели
  const weeklyTargets = calculateWeeklyTargets({
    calories: finalCalories,
    protein: macros.protein,
    fat: macros.fat,
    carbs: macros.carbs,
    hiddenSugar: maxHiddenSugar
  });
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: finalCalories,
    dailyMacros: macros,
    maxHiddenSugar,
    weeklyTargets: weeklyTargets.weekly,
    expectedWeightChange: userProfile.weightLossRate || 0.5,
    appliedAdjustments: {
      diet: Math.round((dietAdjustment.calorieMultiplier - 1) * baseCalories),
      stress: stressAdjustment,
      mealFrequency: mealFrequencyAdjustment,
      foodPreferences: foodPreferencesAdjustment,
      total: finalCalories - baseCalories
    }
  };
}

/**
 * 🔄 Функция для пересчета при изменении данных пользователя
 * Оптимизированная версия для динамических обновлений
 */
export function recalculateNutrition(
  currentResult: NutritionCalculationResult,
  updatedProfile: Partial<UserProfile>
): NutritionCalculationResult {
  // Если изменились критические параметры, делаем полный пересчет
  const criticalFields = ['weight', 'height', 'birthday', 'gender', 'primaryGoal', 'activityLevel'];
  const needsFullRecalculation = criticalFields.some(field => 
    updatedProfile[field as keyof UserProfile] !== undefined
  );
  
  if (needsFullRecalculation) {
    return calculateCompleteNutrition(updatedProfile);
  }
  
  // Иначе делаем частичный пересчет только измененных параметров
  return currentResult; // Упрощенная версия, можно расширить
}

/**
 * 6.5. Корректировки по пищевым предпочтениям
 * Учитывает отношение к еде и разнообразию
 */
export function getFoodPreferencesAdjustment(
  foodPreferences?: string,
  foodVariety?: string,
  mealFeelings?: string
): number {
  let adjustment = 0;
  
  // Корректировка по предпочтениям
  if (foodPreferences === 'convenience') {
    adjustment += 50; // Буфер для тех, кто предпочитает удобство
  } else if (foodPreferences === 'health') {
    adjustment -= 30; // Меньше калорий для здоровых едоков
  }
  
  // Корректировка по разнообразию
  if (foodVariety === 'rarely') {
    adjustment += 40; // Буфер для консервативных едоков
  } else if (foodVariety === 'always') {
    adjustment -= 20; // Меньше для любителей разнообразия
  }
  
  // Корректировка по ощущениям после еды
  if (mealFeelings === 'sluggish') {
    adjustment += 60; // Больший буфер для тех, кто чувствует вялость
  } else if (mealFeelings === 'energized') {
    adjustment -= 25; // Меньше для энергичных
  }
  
  return adjustment;
}

// Экспорт всех функций для использования в приложении
export default {
  calculateCompleteNutrition,
  validateNutritionResults,
  recalculateNutrition,
  calculateBMR,
  calculateTDEE,
  calculateAge
}; 
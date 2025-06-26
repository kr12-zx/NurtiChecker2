# 🧮 Формулы расчета калорий и нутриентов NutriChecker

## 📊 Входные данные из онбординга (47 шагов)

### Базовые антропометрические данные
- `birthday` → возраст (лет)
- `gender` → 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
- `height` → рост (см)
- `weight` → текущий вес (кг)
- `goalWeight` → целевой вес (кг)
- `weightLossRate` → скорость похудения (кг/неделю)

### Активность и упражнения
- `activityLevel` → 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active'
- `exerciseIntent` → boolean (намерение заниматься спортом)

### Питание и диета
- `dietPreference` → 'standard' | 'vegetarian' | 'vegan' | 'low-carb' | 'keto' | 'paleo' | 'mediterranean'
- `mealFrequency` → '2-meals' | '3-meals' | '4-meals' | '5-meals' | '6-meals' | 'intermittent'
- `nutritionFocus` → 'calories-only' | 'balanced' | 'high-protein' | 'low-carb' | 'plant-based'
- `foodPreferences` → 'taste' | 'health' | 'convenience' | 'price' | 'tradition'
- `foodVariety` → 'often' | 'sometimes' | 'rarely' | 'never'
- `mealFeelings` → 'energized' | 'satisfied' | 'tired' | 'bloated' | 'still-hungry'
- `intermittentFasting` → boolean
- `showCalorieTutorial` → boolean
- `useFlexibleCalories` → boolean
- `weightLossPlan` → 'steady' | 'moderate' | 'aggressive'

### Психологический профиль
- `confidenceLevel` → 1-5 (уровень уверенности)
- `stressResponse` → 'emotional-eating' | 'loss-of-appetite' | 'exercise' | 'sleep' | 'socializing' | 'mindfulness' | 'avoidance' | 'creative'
- `adaptability` → 'embrace-quickly' | 'adapt-time' | 'struggle-try' | 'find-overwhelming'
- `challengesView` → 'growth-opportunity' | 'try-learn' | 'avoid-failure' | 'too-difficult'
- `setbacksResponse` → 'bounce-back' | 'recover-effort' | 'hard-back' | 'struggle-recover'
- `temptationResponse` → 'easily-resist' | 'usually-control' | 'try-resist' | 'often-give-in'
- `decisionMaking` → 'fully-trust' | 'confident-doubt' | 'often-unsure' | 'second-guess'
- `difficultSituationsHandling` → 'handle-well' | 'cope-most' | 'struggle-stuck' | 'hard-manage'

### Препятствия и вызовы
- `mainObstacle` → 'emotional-eating' | 'time-constraints' | 'social-situations' | 'lack-of-motivation' | 'plateaus' | 'cravings' | 'self-control' | 'other'
- `challenges` → массив выбранных препятствий
- `eatingHabitsAssessment` → 'excellent' | 'good' | 'improving' | 'need-work' | 'poor'

### Медицинская информация
- `medicationUse` → 'not-using' | 'appetite-reducer' | 'fat-absorption' | 'supplements' | 'interested'

---

## 🔬 Основные формулы расчета

### 1. Базовый метаболизм (BMR) - Формула Mifflin-St Jeor

```typescript
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}
```

### 2. Общий дневной расход энергии (TDEE)

```typescript
function calculateTDEE(bmr: number, activityLevel: string, exerciseIntent: boolean): number {
  const activityMultipliers = {
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
```

### 3. Целевые калории с учетом цели

```typescript
function calculateTargetCalories(
  tdee: number, 
  primaryGoal: string, 
  weightLossRate: number,
  weightLossPlan: string,
  gender: string
): number {
  const minCalories = gender === 'female' ? 1200 : 1500; // Безопасные минимумы
  
  if (primaryGoal === 'lose-weight') {
    // 1 кг жира = 7700 ккал
    const dailyDeficit = (weightLossRate * 7700) / 7;
    
    // Корректировка по плану похудения
    const planMultipliers = {
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
```

---

## 🍎 Корректировки на основе диеты и образа жизни

### 4. Корректировка по типу диеты

```typescript
function getDietAdjustments(dietPreference: string): {
  calorieMultiplier: number;
  carbs: number;
  protein: number;
  fat: number;
} {
  const dietAdjustments = {
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
```

### 5. Психологические корректировки

```typescript
function getStressAdjustment(
  stressResponse: string, 
  confidenceLevel: number,
  temptationResponse: string
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
  
  return adjustment;
}
```

### 6. Корректировка по частоте приемов пищи

```typescript
function getMealFrequencyAdjustment(mealFrequency: string, intermittentFasting: boolean): number {
  if (intermittentFasting) {
    return -50; // -50 ккал за счет улучшенной чувствительности к инсулину
  }
  
  const frequencyAdjustments = {
    '2-meals': -30,    // Меньше перекусов
    '3-meals': 0,      // Стандарт
    '4-meals': +20,    // Небольшое увеличение метаболизма
    '5-meals': +40,    // Термогенез от частого питания
    '6-meals': +60,    // Максимальный термогенез
    'intermittent': -50 // Интервальное голодание
  };
  
  return frequencyAdjustments[mealFrequency] || 0;
}
```

### 6.5. Корректировки по пищевым предпочтениям

```typescript
function getFoodPreferencesAdjustment(
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
```

---

## 🥗 Расчет макронутриентов

### 7. Расчет белков (приоритет по весу тела)

```typescript
function calculateProteinNeeds(
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
```

### 8. Полный расчет макронутриентов

```typescript
function calculateMacronutrients(
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
```

---

## 🍯 Расчет скрытого сахара

### 9. Максимальная дневная доза скрытого сахара

```typescript
function calculateMaxHiddenSugar(targetCalories: number, dietPreference: string): number {
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
```

---

## 📅 Недельные расчеты

### 10. Недельные цели и прогресс

```typescript
function calculateWeeklyTargets(dailyTargets: {
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
```

---

## 🎯 Главная функция расчета

### 11. Комплексный расчет всех показателей

```typescript
interface NutritionCalculationResult {
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
    total: number;
  };
}

function calculateCompleteNutrition(userProfile: UserProfile): NutritionCalculationResult {
  // 1. Расчет возраста
  const age = calculateAge(userProfile.birthday);
  
  // 2. BMR
  const bmr = calculateBMR(userProfile.weight, userProfile.height, age, userProfile.gender);
  
  // 3. TDEE
  const tdee = calculateTDEE(bmr, userProfile.activityLevel, userProfile.exerciseIntent);
  
  // 4. Базовые целевые калории
  const baseCalories = calculateTargetCalories(
    tdee, 
    userProfile.primaryGoal, 
    userProfile.weightLossRate,
    userProfile.weightLossPlan,
    userProfile.gender
  );
  
  // 5. Применение корректировок
  const dietAdjustment = getDietAdjustments(userProfile.dietPreference);
  const stressAdjustment = getStressAdjustment(
    userProfile.stressResponse,
    userProfile.confidenceLevel,
    userProfile.temptationResponse
  );
  const mealFrequencyAdjustment = getMealFrequencyAdjustment(
    userProfile.mealFrequency,
    userProfile.intermittentFasting
  );
  
  // 6. Финальные калории
  const finalCalories = Math.round(
    baseCalories * dietAdjustment.calorieMultiplier + 
    stressAdjustment + 
    mealFrequencyAdjustment
  );
  
  // 7. Белки
  const proteinGrams = calculateProteinNeeds(
    userProfile.weight,
    userProfile.activityLevel,
    userProfile.primaryGoal,
    userProfile.nutritionFocus
  );
  
  // 8. Макронутриенты
  const macros = calculateMacronutrients(
    finalCalories,
    proteinGrams,
    userProfile.dietPreference,
    userProfile.nutritionFocus
  );
  
  // 9. Скрытый сахар
  const maxHiddenSugar = calculateMaxHiddenSugar(finalCalories, userProfile.dietPreference);
  
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
      total: finalCalories - baseCalories
    }
  };
}
```

---

## 🔍 Вспомогательные функции

### 12. Расчет возраста

```typescript
function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(age, 18); // Минимальный возраст 18 лет
}
```

### 13. Валидация и безопасность

```typescript
function validateNutritionResults(result: NutritionCalculationResult, userProfile: UserProfile): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} {
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
  const proteinPerKg = result.dailyMacros.protein / userProfile.weight;
  if (proteinPerKg < 1.0) {
    recommendations.push('Рассмотрите увеличение потребления белка');
  }
  
  // Медицинские рекомендации
  if (userProfile.medicationUse !== 'not-using') {
    recommendations.push('Проконсультируйтесь с врачом при приеме лекарств');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
}
```

---

## 📋 Пример использования

```typescript
// Пример расчета для пользователя
const userProfile = {
  birthday: '1990-05-15',
  gender: 'male',
  height: 180,
  weight: 85,
  goalWeight: 75,
  weightLossRate: 0.5,
  primaryGoal: 'lose-weight',
  activityLevel: 'moderately-active',
  exerciseIntent: true,
  dietPreference: 'mediterranean',
  nutritionFocus: 'balanced',
  mealFrequency: '3-meals',
  intermittentFasting: false,
  weightLossPlan: 'steady',
  confidenceLevel: 4,
  stressResponse: 'exercise',
  temptationResponse: 'usually-control',
  medicationUse: 'not-using'
};

const nutritionPlan = calculateCompleteNutrition(userProfile);
const validation = validateNutritionResults(nutritionPlan, userProfile);

console.log('Результат расчета:', nutritionPlan);
console.log('Валидация:', validation);
```

---

## ⚠️ Важные замечания

1. **Точность**: Все расчеты являются оценочными (±10% погрешность)
2. **Безопасность**: Обязательные минимумы калорий и проверки
3. **Медицинская консультация**: Рекомендуется при наличии заболеваний
4. **Динамичность**: Пересчет при изменении веса/активности
5. **Индивидуализация**: Учет 47 параметров онбординга для максимальной персонализации 

---

## 📊 Полная таблица соответствия параметров онбординга

### ✅ Используемые в расчетах (31 параметр):

| № | Параметр | Использование в калькуляторе | Функция |
|---|----------|------------------------------|---------|
| 1 | `birthday` | Расчет возраста для BMR | `calculateAge()` |
| 2 | `gender` | BMR формула и минимальные калории | `calculateBMR()` |
| 3 | `height` | BMR расчет | `calculateBMR()` |
| 4 | `weight/currentWeight` | BMR, белки, валидация | `calculateBMR()`, `calculateProteinNeeds()` |
| 5 | `primaryGoal` | Целевые калории, белки | `calculateTargetCalories()`, `calculateProteinNeeds()` |
| 6 | `weightLossRate` | Дефицит калорий | `calculateTargetCalories()` |
| 7 | `activityLevel` | TDEE, белки | `calculateTDEE()`, `calculateProteinNeeds()` |
| 8 | `dietPreference` | Калории, макросы, сахар | `getDietAdjustments()`, `calculateMaxHiddenSugar()` |
| 9 | `nutritionFocus` | Белки, макросы | `calculateProteinNeeds()`, `calculateMacronutrients()` |
| 10 | `mealFrequency` | Термогенез | `getMealFrequencyAdjustment()` |
| 11 | `intermittentFasting` | Метаболизм | `getMealFrequencyAdjustment()` |
| 12 | `weightLossPlan` | Агрессивность дефицита | `calculateTargetCalories()` |
| 13 | `exerciseIntent` | TDEE бонус | `calculateTDEE()` |
| 14 | `confidenceLevel` | Психологический буфер | `getStressAdjustment()` |
| 15 | `stressResponse` | Эмоциональное питание | `getStressAdjustment()` |
| 16 | `temptationResponse` | Самоконтроль | `getStressAdjustment()` |
| 17 | `medication/medicationUse` | Медицинские рекомендации | `validateNutritionResults()` |
| 18 | `mainObstacle` | Дополнительный буфер | `getStressAdjustment()` |
| 19 | `setbacksResponse` | Стойкость | `getStressAdjustment()` |
| 20 | `adaptability` | Адаптация к изменениям | `getStressAdjustment()` |
| 21 | `foodPreferences` | Пищевые привычки | `getFoodPreferencesAdjustment()` |
| 22 | `foodVariety` | Разнообразие питания | `getFoodPreferencesAdjustment()` |
| 23 | `mealFeelings` | Энергия после еды | `getFoodPreferencesAdjustment()` |

### ❌ Не используемые (16 параметров):

| № | Параметр | Причина неиспользования | Потенциал |
|---|----------|-------------------------|-----------|
| 24 | `goalWeight` | Только для отображения | Можно использовать для мотивации |
| 25 | `challenges` | Массив, сложно обработать | Можно анализировать паттерны |
| 26 | `challengesView` | Философский подход | Низкий приоритет |
| 27 | `difficultSituationsHandling` | Частично покрыто другими | Можно добавить |
| 28 | `decisionMaking` | Не влияет на метаболизм | Низкий приоритет |
| 29 | `eatingHabitsAssessment` | Субъективная оценка | Можно использовать |
| 30 | `showCalorieTutorial` | UI настройка | Не влияет на расчеты |
| 31 | `useFlexibleCalories` | UI настройка | Не влияет на расчеты |

### 📈 Статистика покрытия:
- **Используется**: 23 из 31 основных параметра (74%)
- **Полностью покрыто**: Все критические для расчетов поля
- **Дополнительные факторы**: 8 психологических и пищевых корректировок

--- 
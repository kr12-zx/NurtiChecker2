# План системы расчета калорий NutriChecker

## Обзор

Система расчета калорий NutriChecker использует многофакторный подход, учитывающий все данные, собранные в процессе онбординга weight-loss3. Цель - создать максимально точный и персонализированный калорийный бюджет для достижения целей пользователя.

## 1. Базовые расчеты

### 1.1 Базовый метаболический уровень (BMR) vs Отдыхающий метаболический уровень (RMR)

**Важное различие:**
- **BMR**: минимум калорий для базовых функций (дыхание, кровообращение) при полном покое
- **RMR**: калории в состоянии покоя при минимальном движении
- Наши формулы технически рассчитывают RMR, но результат очень близок к BMR

### 1.2 Формулы расчета

**Формула Mifflin-St Jeor (основная - лучший выбор):**
```
Мужчины: BMR = 10 × вес(кг) + 6.25 × рост(см) - 5 × возраст(лет) + 5
Женщины: BMR = 10 × вес(кг) + 6.25 × рост(см) - 5 × возраст(лет) - 161
```

**Преимущества:**
- Точность ~10% от истинного BMR
- Подходит для "нормального" и "избыточного" ИМТ
- Простые входные данные

**Ограничения:**
- Может быть неточна для крайних ИМТ
- Не учитывает состав тела

**Формула Harris-Benedict (альтернативная):**
```
Мужчины: BMR = 88.362 + (13.397 × вес) + (4.799 × рост) - (5.677 × возраст)
Женщины: BMR = 447.593 + (9.247 × вес) + (3.098 × рост) - (4.330 × возраст)
```

**Недостатки:**
- Переоценивает BMR до 329 ккал/день
- Не учитывает состав тела (мышцы vs жир)
- Переоценивает в 88% случаев у людей с ожирением

**Формула Katch-McArdle (для продвинутых пользователей):**
```
BMR = 370 + (21.6 × Безжировая Масса Тела [кг])
```

**Расчет безжировой массы тела (LBM):**
```
Мужчины: LBM = 0.407 × вес + 0.267 × рост - 19.2
Женщины: LBM = 0.252 × вес + 0.473 × рост - 48.3
```

**Или через % жира:**
```
LBM = Вес × (1 - Процент жира / 100)
```

**Входные данные из онбординга:**
- `birthday` → возраст
- `gender` → выбор формулы
- `height` → рост в см
- `weight` → текущий вес в кг
- `bodyFatPercentage` → для Katch-McArdle (опционально)

### 1.3 Общий дневной расход энергии (TDEE)

**Формула:**
```
TDEE = BMR × коэффициент_активности
```

**Детальные коэффициенты активности:**
- `sedentary`: 1.2 (мало/нет упражнений, сидячая работа)
- `lightly-active`: 1.375 (легкие упражнения 1-3 дня/неделю)
- `moderately-active`: 1.55 (умеренные упражнения 3-5 дней/неделю)
- `very-active`: 1.725 (интенсивные упражнения 6-7 дней/неделю)
- `extremely-active`: 1.9 (очень тяжелые упражнения + физическая работа или 2 тренировки/день)

**Важность NEAT (термогенез, не связанный с упражнениями):**
- Ежедневные случайные движения
- Работа по дому, ходьба, ерзание
- Может значительно влиять на TDEE

## 2. Корректировки на основе целей

### 2.1 Целевые калории для снижения веса

**Безопасные границы дефицита:**
- Минимальный: 200-300 ккал/день (0.2-0.3 кг/неделю)
- Умеренный: 500 ккал/день (0.5 кг/неделю) - стандарт
- Агрессивный: 750-1000 ккал/день (0.75-1 кг/неделю) - максимум

**Расчет целевых калорий:**
```
targetCalories = TDEE - (weightLossRate × 7700 ккал) / 7 дней
```
*7700 ккал = 1 кг жировой ткани*

### 2.2 Минимальные пороги безопасности

**Абсолютные минимумы (критически важно!):**
- Женщины: не менее 1200 ккал/день
- Мужчины: не менее 1500 ккал/день

**Относительные минимумы:**
- Не менее 80% от BMR
- Дефицит не более 25% от TDEE

**Общие диапазоны калорий по возрасту (справочно):**

| Возраст | Женщины | Мужчины |
|---------|---------|---------|
| 19-30 лет | 1800-2400 | 2400-3000 |
| 31-60 лет | 1600-2200 | 2200-3000 |
| 61+ лет | 1600-2200 | 2000-2600 |

## 3. Персонализированные корректировки

### 3.1 Корректировки на основе физической активности

**Дополнительные факторы:**
```javascript
if (exerciseIntent === true) {
  // Добавляем резерв 10% для планируемых тренировок
  activityMultiplier += 0.1;
}

// Учет NEAT (термогенез без упражнений)
if (dailyActivity === 'high-neat') {
  // Активная работа, много движения
  activityMultiplier += 0.05;
}
```

### 3.2 Корректировки на основе медицинских факторов

**Диабет:**
```javascript
if (hasCondition('diabetes')) {
  macroRatios = {
    carbs: 0.45-0.60,      // 45-60% (индивидуально)
    protein: 0.15-0.20,    // 15-20%
    fat: 0.20-0.35         // 20-35%
  };
  
  // Рекомендации
  recommendations.push('Избегать трансжиров');
  recommendations.push('Насыщенные жиры <9% от калорий');
  recommendations.push('Добавленные сахара <10% от калорий');
  recommendations.push('Клетчатка: минимум 14г на 1000 ккал');
  recommendations.push('Акцент на цельные продукты');
}
```

**Заболевания щитовидной железы:**
```javascript
if (hasCondition('hypothyroidism')) {
  // Замедленный метаболизм
  bmrMultiplier = 0.90-0.95; // снижение на 5-10%
  
  recommendations.push('Богатая йодом, селеном, цинком диета');
  recommendations.push('Избегать: антациды, молоко, кальций, железо за 4 часа до/после приема лекарств');
  recommendations.push('Осторожно с: продуктами высокого содержания клетчатки, сои, морской капустой');
}

if (hasCondition('hyperthyroidism')) {
  // Ускоренный метаболизм
  bmrMultiplier = 1.10-1.20; // увеличение на 10-20%
  
  recommendations.push('Рассмотреть добавки карнитина');
  recommendations.push('Избегать добавок йода');
}
```

**Болезнь/стресс/лихорадка:**
```javascript
if (healthStatus === 'recovering' || stressLevel === 'high') {
  // Увеличенные потребности в энергии
  bmrMultiplier = 1.05-1.15;
}
```

### 3.3 Корректировки на основе пищевых предпочтений

**Научно обоснованные диетические соотношения:**

```javascript
const dietAdjustments = {
  'standard': { carbs: 0.45-0.65, protein: 0.10-0.35, fat: 0.20-0.35 },
  'weight-loss': { carbs: 0.40-0.50, protein: 0.25-0.35, fat: 0.25-0.35 },
  'muscle-gain': { carbs: 0.40-0.50, protein: 0.25-0.35, fat: 0.25-0.35 },
  'keto': { carbs: 0.05-0.10, protein: 0.20-0.25, fat: 0.65-0.75 },
  'low-carb': { carbs: 0.10-0.30, protein: 0.20-0.35, fat: 0.45-0.65 },
  'mediterranean': { carbs: 0.45-0.55, protein: 0.15-0.20, fat: 0.30-0.40 }
};
```

**Потребности в белке (критически важно):**
```javascript
function calculateProteinNeeds(weight, activityLevel, goal) {
  // Базовые потребности: 0.8-1.0 г/кг для sedentary
  // Активные: 1.2-2.2 г/кг
  
  let proteinPerKg;
  
  if (activityLevel === 'sedentary') {
    proteinPerKg = 1.0-1.2;
  } else if (goal === 'muscle-gain' || goal === 'weight-loss') {
    proteinPerKg = 1.6-2.2; // для сохранения мышечной массы
  } else {
    proteinPerKg = 1.2-1.6;
  }
  
  return weight * proteinPerKg;
}
```

**Термический эффект пищи (TEF):**
- Белок: 20-30% калорий идет на переваривание
- Углеводы: 5-10%
- Жиры: 0-3%

*Высокобелковая диета естественно сжигает больше калорий!*

## 4. Психологические корректировки

### 4.1 Корректировки образа жизни

**Курение:**
```javascript
if (smoker === true) {
  // Повышенный метаболизм от никотина
  bmrMultiplier = 1.05-1.10;
  
  // Дефицит питательных веществ
  recommendations.push('Увеличить витамин C');
  recommendations.push('Дополнительный витамин D, кальций, магний');
  
  // При отказе от курения
  if (quittingSmoking === true) {
    // Возможен набор веса
    targetCalories -= 100; // превентивное снижение
  }
}
```

**Стресс:**
```javascript
if (stressLevel === 'high') {
  if (stressResponse === 'emotional-eating') {
    // Хронический стресс → кортизол → тяга к сладкому/жирному
    stressBuffer = 100-200; // буферные калории
    targetCalories += stressBuffer;
    
    recommendations.push('Практики осознанного питания');
    recommendations.push('Управление стрессом');
  }
  
  if (stressResponse === 'lose-appetite') {
    // Острый стресс → адреналин → подавление аппетита
    recommendations.push('Регулярные небольшие приемы пищи');
  }
}
```

**Сон:**
```javascript
if (sleepDuration < 5 || sleepDuration > 8) {
  // Нарушение метаболизма
  recommendations.push('Нормализация сна критична для похудения');
  
  if (sleepDuration < 5) {
    // Повышенный грелин, сниженный лептин → усиленный аппетит
    recommendations.push('Риск переедания из-за недосыпа');
  }
}
```

## 5. Особые популяции

### 5.1 Спортсмены

```javascript
if (userType === 'athlete') {
  // Значительно увеличенные потребности
  const trainingIntensity = getTrainingIntensity();
  
  // Углеводы (г/кг/день)
  const carbNeeds = {
    'light': 3-5,
    'moderate': 5-7, 
    'endurance': 6-10,
    'extreme-endurance': 8-12
  };
  
  // Белки (г/кг/день)
  const proteinNeeds = {
    'endurance': 1.2-1.4,
    'strength': 1.6-2.0,
    'mixed': 1.4-1.8
  };
  
  // Общие калории могут достигать 3000-5000+ ккал/день
}
```

### 5.2 Беременность и лактация

```javascript
if (isPregnant || isLactating) {
  if (isPregnant) {
    // Увеличение BMR на 15-20%
    bmrMultiplier = 1.15-1.20;
    
    // Дополнительные 300-400 ккал во 2-3 триместре
    additionalCalories = 300-400;
  }
  
  if (isLactating) {
    // Увеличение на 15-25% для производства молока
    bmrMultiplier = 1.15-1.25;
    
    // Дополнительные 500-700 ккал/день
    additionalCalories = 500-700;
  }
  
  // Обязательная рекомендация консультации врача
  medicalConsultationRequired = true;
}
```

### 5.3 Дети и подростки

```javascript
if (age < 18) {
  // Активный рост требует больше калорий
  if (age >= 14 && age <= 18) {
    // Подростки: самые высокие потребности
    caloryRanges = {
      'female': 1800-2400,
      'male': 2000-3200
    };
  }
  
  // Обязательная консультация педиатра
  medicalConsultationRequired = true;
}
```

## 6. Алгоритм итогового расчета

### 6.1 Пошаговый процесс с валидацией

```javascript
function calculatePersonalizedCalories(userProfile) {
  // Шаг 1: Выбор формулы BMR
  let bmr;
  if (userProfile.bodyFatPercentage && userProfile.advancedMode) {
    // Katch-McArdle для точности
    const lbm = calculateLBM(userProfile);
    bmr = 370 + (21.6 * lbm);
  } else {
    // Mifflin-St Jeor по умолчанию
    bmr = calculateMifflinStJeor(userProfile);
  }
  
  // Шаг 2: Медицинские корректировки BMR
  bmr = applyMedicalAdjustments(bmr, userProfile);
  
  // Шаг 3: TDEE
  let tdee = bmr * getActivityMultiplier(userProfile.activityLevel);
  
  // Шаг 4: Дефицит калорий
  const dailyDeficit = (userProfile.weightLossRate * 7700) / 7;
  let targetCalories = tdee - dailyDeficit;
  
  // Шаг 5: Проверки безопасности
  const minCalories = userProfile.gender === 'female' ? 1200 : 1500;
  const maxDeficit = tdee * 0.25; // не более 25% от TDEE
  
  if (targetCalories < minCalories) {
    targetCalories = minCalories;
    addWarning('Минимальный порог калорий');
  }
  
  if (dailyDeficit > maxDeficit) {
    targetCalories = tdee - maxDeficit;
    addWarning('Слишком агрессивный дефицит');
  }
  
  // Шаг 6: Психологические/образ жизни корректировки
  targetCalories = applyLifestyleAdjustments(targetCalories, userProfile);
  
  // Шаг 7: Расчет макронутриентов
  const macros = calculateMacros(targetCalories, userProfile);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    dailyDeficit: Math.round(dailyDeficit),
    macros: macros,
    warnings: getWarnings(),
    recommendations: getRecommendations()
  };
}
```

### 6.2 Расчет макронутриентов с учетом качества

```javascript
function calculateMacros(calories, userProfile) {
  // Белок: приоритет по весу тела, не по калориям
  const proteinGrams = calculateProteinNeeds(
    userProfile.weight, 
    userProfile.activityLevel, 
    userProfile.primaryGoal
  );
  const proteinCalories = proteinGrams * 4;
  
  // Жиры: базовый процент
  const dietSettings = getDietAdjustments(userProfile.dietPreference);
  const fatCalories = calories * dietSettings.fat;
  const fatGrams = fatCalories / 9;
  
  // Углеводы: оставшиеся калории
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbGrams = carbCalories / 4;
  
  return {
    protein: Math.round(proteinGrams),
    fat: Math.round(fatGrams),
    carbs: Math.round(carbGrams),
    percentages: {
      protein: Math.round((proteinCalories / calories) * 100),
      fat: Math.round((fatCalories / calories) * 100),
      carbs: Math.round((carbCalories / calories) * 100)
    }
  };
}
```

## 7. Интеграция с AI и API

### 7.1 Структура данных для AI

```javascript
const userNutritionProfile = {
  // Базовые данные
  userId: String,
  gender: 'male' | 'female' | 'non-binary',
  age: Number,
  height: Number, // см
  weight: Number, // кг
  bodyFatPercentage: Number, // опционально
  
  // Активность
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active',
  exerciseIntent: Boolean,
  neatLevel: 'low' | 'moderate' | 'high',
  
  // Цели
  primaryGoal: 'maintain' | 'lose-weight' | 'gain-weight' | 'gain-muscle',
  targetWeight: Number,
  weightLossRate: Number, // кг/неделю
  
  // Здоровье
  healthConditions: Array<String>,
  medicationUse: 'none' | 'weight-related' | 'other',
  isPregnant: Boolean,
  isLactating: Boolean,
  
  // Образ жизни
  smoker: Boolean,
  stressLevel: 'low' | 'moderate' | 'high',
  stressResponse: 'emotional-eating' | 'lose-appetite' | 'no-change',
  sleepDuration: Number,
  
  // Питание
  dietPreference: 'standard' | 'keto' | 'low-carb' | 'vegan' | 'mediterranean',
  intermittentFasting: Boolean,
  mealFrequency: Number,
  
  // Расчетные результаты
  calculatedBMR: Number,
  calculatedTDEE: Number,
  targetCalories: Number,
  macroTargets: {
    protein: Number,
    fat: Number,
    carbs: Number
  }
};
```

### 7.2 API для баз данных питания

**Интеграция FatSecret Platform API:**
- 24 языка, 56+ стран
- Калории, макро/микронутриенты, аллергены
- Распознавание изображений + оценка порций
- NLP для текстового/голосового ввода

**Интеграция LogMeal Food AI:**
- 37 показателей питания
- Анализ фотографий блюд
- Расчет на основе идентифицированных ингредиентов

**Гибридный подход (рекомендуется):**
1. **AI распознавание** → идентификация продукта
2. **API валидация** → проверенные данные питания
3. **User feedback** → улучшение точности

## 8. Мониторинг и адаптация

### 8.1 Динамические корректировки

```javascript
// Еженедельная оценка прогресса
function adjustCaloriesBasedOnProgress(actualProgress, expectedProgress) {
  const progressRatio = actualProgress / expectedProgress;
  
  if (progressRatio < 0.8) {
    // Медленный прогресс - снизить калории
    return -50; // ккал
  } else if (progressRatio > 1.3) {
    // Слишком быстро - увеличить калории
    return +100; // ккал
  }
  
  return 0; // без изменений
}
```

### 8.2 Триггеры пересчета

- Изменение веса ≥2-3 кг
- Изменение уровня активности
- Плато >2 недель
- Изменение целей/диеты
- Новые медицинские состояния

## 9. Предупреждения и отказ от ответственности

### 9.1 Обязательные предупреждения

**Когда показывать:**
- Агрессивный дефицит >750 ккал/день
- Калории ниже минимума (1200F/1500M)
- Быстрая потеря >1 кг/неделю
- Медицинские состояния
- Беременность/лактация
- Возраст <18 лет

### 9.2 Отказ от ответственности

> ⚠️ **Важно**: Все расчеты являются оценками на основе научных формул и популяционных данных. Точность ±10%. Расчеты предназначены только для информационных целей и не заменяют медицинскую консультацию. При наличии заболеваний, беременности или специфических целей обязательно проконсультируйтесь с врачом или зарегистрированным диетологом.

## Заключение

Обновленная система расчета калорий NutriChecker основана на современных научных данных и учитывает:

1. **Научную точность** - проверенные формулы с известными ограничениями
2. **Медицинскую безопасность** - минимальные пороги и предупреждения
3. **Индивидуализацию** - 50+ факторов из онбординга
4. **Особые популяции** - спортсмены, беременные, подростки
5. **Динамичность** - адаптация под прогресс пользователя
6. **Качество питания** - не только калории, но и состав макронутриентов

Система превосходит простые калькуляторы и обеспечивает персонализированный, безопасный и научно обоснованный подход к управлению весом. 
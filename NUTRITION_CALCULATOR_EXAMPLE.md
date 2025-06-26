# 📊 Пример использования калькулятора питания NutriChecker

## 🧪 Тестовые сценарии

### Сценарий 1: Мужчина, похудение, средиземноморская диета

```typescript
import { calculateCompleteNutrition, validateNutritionResults } from './utils/nutritionCalculator';

const userProfile1 = {
  // Базовые данные
  birthday: '1990-05-15', // 34 года
  gender: 'male',
  height: 180, // см
  currentWeight: 85, // кг
  goalWeight: 75, // кг
  weightLossRate: 0.5, // кг/неделю
  
  // Цели
  primaryGoal: 'lose-weight',
  activityLevel: 'moderately-active',
  exerciseIntent: true,
  
  // Питание
  dietPreference: 'mediterranean',
  nutritionFocus: 'balanced',
  mealFrequency: '3-meals',
  intermittentFasting: false,
  weightLossPlan: 'steady',
  
  // Психология
  confidenceLevel: 4,
  stressResponse: 'exercise',
  temptationResponse: 'usually-control',
  
  // Медицина
  medication: 'not-using'
};

const result1 = calculateCompleteNutrition(userProfile1);
const validation1 = validateNutritionResults(result1, userProfile1);

console.log('=== МУЖЧИНА 34 ГОДА, ПОХУДЕНИЕ ===');
console.log('BMR:', result1.bmr, 'ккал');
console.log('TDEE:', result1.tdee, 'ккал');
console.log('Целевые калории:', result1.targetCalories, 'ккал');
console.log('Белки:', result1.dailyMacros.protein, 'г');
console.log('Жиры:', result1.dailyMacros.fat, 'г');
console.log('Углеводы:', result1.dailyMacros.carbs, 'г');
console.log('Макс. скрытый сахар:', result1.maxHiddenSugar, 'г');
console.log('Недельные калории:', result1.weeklyTargets.calories, 'ккал');
console.log('Корректировки:', result1.appliedAdjustments);
console.log('Валидация:', validation1);
```

**Ожидаемый результат:**
- BMR: ~1,850 ккал
- TDEE: ~2,870 ккал (1.55 × 1.05 за спорт)
- Целевые калории: ~2,320 ккал (дефицит 550 ккал)
- Белки: ~136 г (1.6 г/кг для похудения)
- Жиры: ~90 г (35% от калорий)
- Углеводы: ~261 г (45% от калорий)
- Скрытый сахар: ~40 г (7% для средиземноморской диеты)

---

### Сценарий 2: Женщина, набор мышц, кето-диета

```typescript
const userProfile2 = {
  // Базовые данные
  birthday: '1995-08-20', // 29 лет
  gender: 'female',
  height: 165, // см
  currentWeight: 60, // кг
  goalWeight: 65, // кг
  weightLossRate: 0, // набор веса
  
  // Цели
  primaryGoal: 'gain-muscle',
  activityLevel: 'very-active',
  exerciseIntent: true,
  
  // Питание
  dietPreference: 'keto',
  nutritionFocus: 'high-protein',
  mealFrequency: '4-meals',
  intermittentFasting: false,
  weightLossPlan: 'steady',
  
  // Психология
  confidenceLevel: 5,
  stressResponse: 'exercise',
  temptationResponse: 'easily-resist',
  
  // Медицина
  medication: 'supplements'
};

const result2 = calculateCompleteNutrition(userProfile2);
const validation2 = validateNutritionResults(result2, userProfile2);

console.log('=== ЖЕНЩИНА 29 ЛЕТ, НАБОР МЫШЦ ===');
console.log('BMR:', result2.bmr, 'ккал');
console.log('TDEE:', result2.tdee, 'ккал');
console.log('Целевые калории:', result2.targetCalories, 'ккал');
console.log('Белки:', result2.dailyMacros.protein, 'г');
console.log('Жиры:', result2.dailyMacros.fat, 'г');
console.log('Углеводы:', result2.dailyMacros.carbs, 'г');
console.log('Макс. скрытый сахар:', result2.maxHiddenSugar, 'г');
console.log('Недельные калории:', result2.weeklyTargets.calories, 'ккал');
console.log('Корректировки:', result2.appliedAdjustments);
console.log('Валидация:', validation2);
```

**Ожидаемый результат:**
- BMR: ~1,400 ккал
- TDEE: ~2,415 ккал (1.725 × 1.05 за спорт)
- Целевые калории: ~2,715 ккал (+300 для набора мышц)
- Белки: ~144 г (2.4 г/кг для набора мышц + high-protein)
- Жиры: ~211 г (70% от калорий на кето)
- Углеводы: ~34 г (5% от калорий на кето)
- Скрытый сахар: ~14 г (2% для кето)

---

### Сценарий 3: Эмоциональное переедание, веганская диета

```typescript
const userProfile3 = {
  // Базовые данные
  birthday: '1988-12-10', // 36 лет
  gender: 'female',
  height: 170, // см
  currentWeight: 75, // кг
  goalWeight: 65, // кг
  weightLossRate: 0.75, // агрессивное похудение
  
  // Цели
  primaryGoal: 'lose-weight',
  activityLevel: 'lightly-active',
  exerciseIntent: false,
  
  // Питание
  dietPreference: 'vegan',
  nutritionFocus: 'plant-based',
  mealFrequency: '5-meals',
  intermittentFasting: false,
  weightLossPlan: 'aggressive',
  
  // Психология (проблемная)
  confidenceLevel: 2, // низкая уверенность
  stressResponse: 'emotional-eating', // заедает стресс
  temptationResponse: 'often-give-in', // слабый самоконтроль
  
  // Медицина
  medication: 'not-using'
};

const result3 = calculateCompleteNutrition(userProfile3);
const validation3 = validateNutritionResults(result3, userProfile3);

console.log('=== ЖЕНЩИНА 36 ЛЕТ, ЭМОЦИОНАЛЬНОЕ ПЕРЕЕДАНИЕ ===');
console.log('BMR:', result3.bmr, 'ккал');
console.log('TDEE:', result3.tdee, 'ккал');
console.log('Целевые калории:', result3.targetCalories, 'ккал');
console.log('Белки:', result3.dailyMacros.protein, 'г');
console.log('Жиры:', result3.dailyMacros.fat, 'г');
console.log('Углеводы:', result3.dailyMacros.carbs, 'г');
console.log('Макс. скрытый сахар:', result3.maxHiddenSugar, 'г');
console.log('Недельные калории:', result3.weeklyTargets.calories, 'ккал');
console.log('Корректировки:', result3.appliedAdjustments);
console.log('Валидация:', validation3);
```

**Ожидаемый результат:**
- BMR: ~1,520 ккал
- TDEE: ~2,090 ккал (1.375 без спорта)
- Базовый дефицит: ~825 ккал (агрессивный план)
- Психологические буферы: +225 ккал (эмоциональное переедание + низкая уверенность + слабый самоконтроль)
- Целевые калории: ~1,490 ккал (с учетом буферов и минимума 1200)
- Белки: ~120 г (1.6 г/кг для похудения)
- Жиры: ~50 г (30% от калорий)
- Углеводы: ~203 г (55% от калорий, веганская диета)

---

## 🔬 Анализ корректировок

### Диетические корректировки:
- **Стандартная**: 0% (базовая)
- **Кето**: +5% (термогенез)
- **Палео**: +8% (необработанная пища)
- **Веганская**: +5% (клетчатка)

### Психологические корректировки:
- **Эмоциональное переедание**: +100 ккал
- **Низкая уверенность**: +50 ккал
- **Слабый самоконтроль**: +75 ккал
- **Итого буфер**: +225 ккал

### Частота питания:
- **2 приема**: -30 ккал
- **3 приема**: 0 ккал (стандарт)
- **5 приемов**: +40 ккал
- **Интервальное голодание**: -50 ккал

---

## 🎯 Интеграция в приложение

```typescript
// В компоненте React Native
import { calculateCompleteNutrition, validateNutritionResults } from '../utils/nutritionCalculator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const calculateUserNutrition = async () => {
  try {
    // Получаем профиль пользователя
    const userProfileString = await AsyncStorage.getItem('userProfile');
    if (!userProfileString) return;
    
    const userProfile = JSON.parse(userProfileString);
    
    // Рассчитываем питание
    const nutritionResult = calculateCompleteNutrition(userProfile);
    const validation = validateNutritionResults(nutritionResult, userProfile);
    
    // Сохраняем результат
    await AsyncStorage.setItem('nutritionPlan', JSON.stringify(nutritionResult));
    await AsyncStorage.setItem('nutritionValidation', JSON.stringify(validation));
    
    // Показываем предупреждения пользователю
    if (validation.warnings.length > 0) {
      Alert.alert('Внимание', validation.warnings.join('\n'));
    }
    
    return nutritionResult;
  } catch (error) {
    console.error('Ошибка расчета питания:', error);
    Alert.alert('Ошибка', 'Не удалось рассчитать план питания');
  }
};
```

---

## 📈 Мониторинг и обновления

```typescript
// Пересчет при изменении веса
const updateWeight = async (newWeight: number) => {
  const userProfile = await getUserProfile();
  userProfile.weight = newWeight;
  
  // Пересчитываем питание
  const updatedNutrition = calculateCompleteNutrition(userProfile);
  
  // Сохраняем обновленные данные
  await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
  await AsyncStorage.setItem('nutritionPlan', JSON.stringify(updatedNutrition));
  
  return updatedNutrition;
};

// Еженедельная проверка прогресса
const checkWeeklyProgress = async () => {
  const nutritionPlan = await getNutritionPlan();
  const actualWeightChange = await getActualWeightChange();
  
  if (Math.abs(actualWeightChange - nutritionPlan.expectedWeightChange) > 0.2) {
    // Корректируем план
    const adjustedCalories = nutritionPlan.targetCalories + 
      (actualWeightChange < nutritionPlan.expectedWeightChange ? -100 : +100);
    
    // Пересчитываем с новыми калориями
    // ... логика корректировки
  }
};
```

---

## ⚠️ Важные замечания

1. **Безопасность**: Все расчеты проверяются на минимальные пороги калорий
2. **Точность**: Погрешность ±10% - это нормально для популяционных формул
3. **Медицинская консультация**: Обязательна при наличии заболеваний
4. **Динамичность**: Пересчет каждые 2-3 недели или при изменении веса >2 кг
5. **Персонализация**: 47 параметров онбординга обеспечивают максимальную индивидуализацию 
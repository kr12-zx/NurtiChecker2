# 📋 СВОДКА ПО ТЕСТАМ NUTRICHECKER

## 🚀 **БЫСТРЫЕ КОМАНДЫ**

```bash
npm test              # Все тесты
npm run test:watch    # Режим наблюдения
npm run test:coverage # С покрытием кода
```

## 📊 **СТАТИСТИКА**

✅ **46 тестов проходят**  
📁 **5 test suites**  
⚡ **~4-5 секунд**  

## 🎯 **ЧТО ПРОТЕСТИРОВАНО**

| Модуль | Тестов | Что покрывает |
|--------|--------|---------------|
| **nutritionCalculator.test.ts** | 12 | BMR, TDEE, целевые калории, макросы |
| **aiResponseParser.test.ts** | 8 | Парсинг AI ответов, JSON, markdown |
| **dailyNutrition.test.ts** | 9 | Ежедневные данные, даты, AsyncStorage |
| **calorieCalculations.test.ts** | 7 | Калории за день, первый запуск |
| **simple.test.ts** | 7 | Базовые функции, математика, даты |

## 🔥 **КРИТИЧНЫЕ ФУНКЦИИ**

### Расчеты питания:
- `calculateBMR()` - базовый метаболизм по формуле Mifflin-St Jeor
- `calculateTDEE()` - общий расход энергии с коэффициентами активности  
- `calculateTargetCalories()` - целевые калории с безопасными лимитами
- `calculateMacronutrients()` - распределение белки/жиры/углеводы

### AI парсер:
- `parseAIResponse()` - обработка JSON, markdown, массивов, ошибок

### Данные питания:
- `formatDateToString()` - форматирование в DD.MM.YYYY
- `getDailyNutrition()` - получение данных за день
- `isFirstTimeUser()` - проверка первого запуска

## 🛠 **КАК ДОБАВИТЬ НОВЫЙ ТЕСТ**

```javascript
// utils/__tests__/newFunction.test.ts
import { newFunction } from '../newFunction';

describe('New Function', () => {
  test('does what expected', () => {
    const result = newFunction('input');
    expect(result).toBe('expected');
  });
});
```

## 🎯 **ПРИОРИТЕТЫ ДЛЯ НОВЫХ ТЕСТОВ**

1. **Image Utils** - обработка изображений
2. **Meal Service** - добавление продуктов  
3. **Goal Tracking** - отслеживание целей
4. **Push Notifications** - уведомления

## 📖 **ПОЛНАЯ ДОКУМЕНТАЦИЯ**

👉 **[TESTING_COMPLETE_GUIDE.md](./TESTING_COMPLETE_GUIDE.md)** - полное руководство с примерами 
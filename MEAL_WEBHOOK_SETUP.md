# 🍽️ Meal Dashboard Webhook Setup

## Обзор

Система автоматически отправляет данные о съеденных продуктах в N8N webhook каждый раз, когда пользователь добавляет продукт в свой дневник питания.

## 🔧 Настройка

### 1. N8N Workflow

Импортируйте файл `n8n_workflows/6_add_meal_dashboard.json` в ваш N8N:

1. Откройте N8N интерфейс
2. Workflows → Import from file
3. Выберите `6_add_meal_dashboard.json`
4. Убедитесь, что Supabase credentials настроены правильно

### 2. Webhook URL

**Endpoint:** `https://ttagent.website/webhook/add-meal`
**Метод:** POST

### 3. Структура Данных

Webhook получает полную информацию о продукте:

```json
{
  "userId": "2025052522330875258@nutrichecker.top",
  "dish": "Греческий йогурт",
  "grams": 150,
  "kcal": 120,
  "prot": 15,
  "fat": 5,
  "carb": 8,
  "sugar": 6,
  "fiber": 0,
  "sodium": 50,
  "glycemicIndex": 35,
  "saturatedFat": 3,
  "vitamins": ["Vitamin B12", "Calcium"],
  "minerals": ["Calcium", "Phosphorus"],
  "healthBenefits": ["Пробиотики"],
  "healthConcerns": ["Высокое содержание жиров"],
  "overallHealthScore": 75,
  "recommendedIntakeDescr": "1-2 порции в день",
  "packageInfo": "Натуральный йогурт 150г",
  "targetLanguage": "ru",
  "isSafeForUser": true,
  "allergenId": 1,
  "allergenName": "Молоко",
  "messageAllergen": "Содержит молочные продукты",
  "recommendedIntakeMaxFrequency": "daily",
  "eaten_at": "2024-12-25T10:30:00.000Z",
  "eaten_day": "2024-12-25",
  "imageUrl": "https://example.com/yogurt.jpg",
  "ingredients": "Молоко, живые культуры",
  "description": "Натуральный греческий йогурт"
}
```

## 🚀 Как Работает

### Автоматическая Интеграция

Данные отправляются автоматически при:

1. **Добавлении продукта в дневник** - через экран продукта с выбором порции
2. **Сканировании продукта** - после анализа и сохранения
3. **Ручном добавлении** - через dashboard (если реализовано)

### Код Интеграции

В `services/dailyNutrition.ts` добавлена автоматическая отправка:

```typescript
// После успешного сохранения в локальную базу
await saveDailyNutrition(updatedData);

// Отправляем данные в webhook
try {
  const mealData = MealService.convertScanToMealData(product, servingMultiplier);
  const webhookSuccess = await MealService.addMealToDashboard(mealData);
  
  if (webhookSuccess) {
    console.log('Данные отправлены в dashboard webhook');
  }
} catch (error) {
  console.error('Ошибка webhook:', error);
  // Не прерываем основной процесс
}
```

## 🧪 Тестирование

### DEV Режим

В настройках приложения (только в DEV режиме) есть кнопка "Test Meal Webhook":

1. Откройте приложение
2. Перейдите в Settings
3. Найдите секцию "Development"
4. Нажмите "Test Meal Webhook"

### Ручное Тестирование

```typescript
import { MealService } from './services/mealService';

// Тестовые данные
const testData = {
  userId: '', // Заполнится автоматически
  dish: 'Тестовый продукт',
  grams: 100,
  kcal: 250,
  prot: 12,
  fat: 8,
  carb: 30
  // ... остальные поля
};

const success = await MealService.addMealToDashboard(testData);
```

## 📊 База Данных

Данные сохраняются в таблицу `meals_scan` со всеми полями:

- Основные нутриенты (kcal, prot, fat, carb, sugar, fiber, sodium)
- Дополнительная информация (vitamins, minerals, healthBenefits)
- Метаданные (eaten_at, eaten_day, imageUrl, ingredients)
- Информация об аллергенах (allergenId, allergenName, messageAllergen)

## 🔍 Мониторинг

### Логи Приложения

```javascript
// Успешная отправка
console.log('Данные о продукте успешно отправлены в dashboard webhook');

// Ошибка отправки
console.warn('Не удалось отправить данные в dashboard webhook');
console.error('Ошибка при отправке данных в webhook:', error);
```

### N8N Dashboard

1. Откройте N8N
2. Перейдите к workflow "Add Meal Dashboard"
3. Проверьте логи выполнения
4. Мониторьте ошибки валидации

### Supabase Dashboard

1. Откройте Supabase проект
2. Перейдите в Table Editor
3. Проверьте таблицу `meals_scan`
4. Убедитесь, что данные поступают

## ⚠️ Troubleshooting

### Ошибка 400: Missing required fields
- Проверьте, что `userId` передается корректно
- Убедитесь в наличии обязательных полей

### Ошибка 500: Database error
- Проверьте Supabase credentials в N8N
- Убедитесь, что таблица `meals_scan` существует
- Проверьте права доступа service role

### Webhook не отвечает
- Проверьте статус N8N сервера
- Убедитесь, что workflow активен
- Проверьте URL webhook

### Данные не отправляются
- Проверьте консоль приложения на ошибки
- Убедитесь, что `MealService` импортирован
- Проверьте интернет-соединение

## 🔄 Обновления

При изменении структуры данных:

1. Обновите интерфейс `MealData` в `services/mealService.ts`
2. Обновите N8N workflow
3. Обновите схему таблицы в Supabase (если нужно)
4. Протестируйте изменения

## 📝 Примечания

- Отправка данных не блокирует основной процесс добавления продукта
- При ошибке webhook пользователь не увидит ошибку
- Все ошибки логируются в консоль для отладки
- Система работает только при наличии интернет-соединения 
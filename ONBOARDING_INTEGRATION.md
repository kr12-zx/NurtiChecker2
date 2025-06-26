# Интеграция онбординга NutriChecker

## Обзор

Система онбординга собирает **ВСЕ** данные пользователей со всех 47 шагов и отправляет их через webhook при достижении paywall экрана. Каждому пользователю назначается уникальный ID в формате email.

## Полный сбор данных

### Что собирается:
- **Основные данные**: возраст, пол, рост, вес, цели
- **Диетические предпочтения**: тип диеты, частота питания, пищевые предпочтения
- **Психологический профиль**: уверенность, стрессоустойчивость, адаптивность
- **Препятствия**: эмоциональное питание, нехватка времени, социальное давление
- **План похудения**: темп снижения веса, упражнения, калорийность
- **Медицинские данные**: прием лекарств, основные препятствия
- **Аналитика**: время прохождения шагов, устройство, платформа

### Новые функции API:

#### `collectAllOnboardingData()`
Собирает все данные из AsyncStorage:
```javascript
const { userProfile, unitSettings, stepData } = await collectAllOnboardingData();
```

#### `createCompleteOnboardingPayload(eventType, step)`
Создает полный payload со всеми данными:
```javascript
const payload = await createCompleteOnboardingPayload('paywall_reached', 45);
```

## Структура базы данных

### 1. Создание базы данных

Выполните SQL скрипты в следующем порядке:

```bash
# 1. Создание схемы
psql -d your_database -f onboarding_schema.sql

# 2. Добавление функций для полного сохранения данных
psql -d your_database -f save_complete_onboarding.sql
```

### 2. Основные таблицы

- **onboarding_users** - основная таблица с email-подобными ID
- **user_profile_basic** - антропометрические данные
- **user_psychology_profile** - психологический профиль
- **user_challenges** - препятствия пользователя (многие ко многим)
- **webhook_events** - лог webhook событий

### 3. SQL функции для сохранения данных

#### `save_complete_onboarding_data(email_id, onboarding_data)`
Сохраняет все данные онбординга в соответствующие таблицы:
```sql
SELECT save_complete_onboarding_data(
    '2025052708443239565@nutrichecker.top',
    '{"user": {...}, "profile": {...}, "settings": {...}}'::jsonb
);
```

#### `process_onboarding_webhook(webhook_payload)`
Обрабатывает webhook payload и сохраняет данные:
```sql
SELECT * FROM process_onboarding_webhook(
    '{"user": {...}, "profile": {...}, "event": {...}}'::jsonb
);
```

## Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://your-api-server.com
EXPO_PUBLIC_WEBHOOK_URL=https://your-webhook-endpoint.com/onboarding
```

## Webhook события

### 1. Paywall Reached (step 45)

Отправляется автоматически при достижении paywall экрана с **ПОЛНЫМИ** данными:

```json
{
  "user": {
    "emailId": "2025052708443239565@nutrichecker.top",
    "createdAt": "2025-01-27T10:30:00.000Z"
  },
  "profile": {
    // Основные антропометрические данные
    "birthday": "1992-06-15",
    "gender": "male",
    "height": 176,
    "currentWeight": 75,
    "goalWeight": 70,
    "weightLossRate": 0.5,
    "primaryGoal": "lose-weight",
    
    // Активность и диета
    "activityLevel": "lightly-active",
    "dietPreference": "standard",
    "mealFrequency": "3-meals",
    
    // План похудения и упражнения
    "weightLossPlan": "steady",
    "exerciseIntent": false,
    "showCalorieTutorial": true,
    "useFlexibleCalories": false,
    "intermittentFasting": false,
    
    // Питание и фокус
    "nutritionFocus": "balanced",
    "foodPreferences": "taste",
    "foodVariety": "sometimes",
    "mealFeelings": "energized",
    
    // Психологический профиль
    "confidenceLevel": 3,
    "stressResponse": "emotional-eating",
    "adaptability": "adapt-time",
    "challengesView": "growth-opportunity",
    "setbacksResponse": "bounce-back",
    "decisionMaking": "confident-doubt",
    "difficultSituationsHandling": "cope-most",
    "temptationResponse": "usually-control",
    
    // Медицинские данные и препятствия
    "medicationUse": "not-using",
    "mainObstacle": "emotional-eating",
    "eatingHabitsAssessment": "improving",
    
    // Препятствия и вызовы
    "challenges": ["emotional-eating", "busy-schedule"],
    
    // Рассчитанные значения (если есть)
    "bmr": 1800,
    "tdee": 2200,
    "calorieTarget": 1700,
    "proteinTarget": 120,
    "fatTarget": 60,
    "carbTarget": 180,
    "goalDate": "2025-06-01"
  },
  "settings": {
    "weightUnit": "kg",
    "heightUnit": "cm",
    "system": "metric"
  },
  "event": {
    "type": "paywall_reached",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "step": 45
  },
  "analytics": {
    "totalSteps": 45,
    "completedSteps": [0, 1, 2, 3, ..., 44],
    "stepTimestamps": [
      {"step": 0, "timestamp": "2025-01-27T10:00:00.000Z"},
      {"step": 1, "timestamp": "2025-01-27T10:01:00.000Z"},
      // ... все шаги
    ],
    "deviceInfo": {
      "platform": "mobile",
      "userAgent": "NutriChecker-Mobile/1.0"
    }
  }
}
```

### 2. Onboarding Completed

Отправляется при завершении онбординга с тем же полным форматом:

```json
{
  // ... тот же полный формат, но
  "event": {
    "type": "onboarding_completed",
    "timestamp": "2025-01-27T10:35:00.000Z",
    "step": 47
  }
}
```

## Генерация ID пользователя

ID генерируется в формате: `{timestamp}{randomSuffix}@nutrichecker.top`

Пример: `2025052708443239565@nutrichecker.top`

## Функции API

### getUserEmailId()
Получает или создает уникальный email ID для пользователя.

### collectAllOnboardingData()
Собирает все данные онбординга из AsyncStorage.

### createCompleteOnboardingPayload(eventType, step)
Создает полный payload со всеми собранными данными.

### sendPaywallWebhook(userProfile, unitSettings)
Отправляет webhook при достижении paywall с полными данными.

### sendCompletionWebhook(userProfile, unitSettings)
Отправляет webhook при завершении онбординга с полными данными.

### saveOnboardingStep(stepNumber, stepName, data)
Сохраняет данные каждого шага для аналитики.

## Интеграция с N8N

### Готовый workflow

Импортируйте файл `n8n_workflow_example.json` в N8N для автоматической обработки webhook.

Workflow включает:
1. **Webhook Trigger** - принимает данные онбординга
2. **Process Data** - валидирует и обрабатывает данные
3. **Save to Database** - использует функцию `process_onboarding_webhook()`
4. **Check Event Type** - определяет тип события
5. **Notifications** - отправляет уведомления
6. **Response** - возвращает подтверждение
7. **Log Webhook** - логирует событие

### Настройка:

1. Импортируйте workflow в N8N
2. Настройте PostgreSQL credentials
3. Установите webhook URL в `EXPO_PUBLIC_WEBHOOK_URL`
4. Активируйте workflow

## Отладка

### Просмотр полных данных онбординга:

```javascript
import { collectAllOnboardingData, getOnboardingDebugData } from './utils/onboardingApi';

// Все данные
const allData = await collectAllOnboardingData();
console.log('All onboarding data:', allData);

// Debug информация
const debugData = await getOnboardingDebugData();
console.log('Debug data:', debugData);
```

### Тестирование полного payload:

```javascript
import { createCompleteOnboardingPayload } from './utils/onboardingApi';

const payload = await createCompleteOnboardingPayload('paywall_reached', 45);
console.log('Complete payload:', JSON.stringify(payload, null, 2));
```

### Очистка данных (для тестирования):

```javascript
import { clearOnboardingData } from './utils/onboardingApi';

await clearOnboardingData();
```

## Безопасность

- Все данные сохраняются локально в AsyncStorage
- Webhook отправляется по HTTPS
- Ошибки webhook не блокируют работу приложения
- Полная валидация данных в N8N workflow
- Логирование всех операций

## Мониторинг

Все webhook события логируются в таблицу `webhook_events` с:
- Полным payload
- Статусом ответа
- Временем отправки
- Информацией об ошибках
- Аналитикой по шагам

### SQL запросы для мониторинга:

```sql
-- Статистика webhook событий
SELECT 
    event_type,
    COUNT(*) as total,
    COUNT(CASE WHEN success THEN 1 END) as successful,
    ROUND(AVG(response_status), 0) as avg_status
FROM webhook_events 
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Конверсия до paywall
SELECT 
    DATE(created_at) as date,
    COUNT(*) as started,
    COUNT(paywall_reached_at) as reached_paywall,
    ROUND(COUNT(paywall_reached_at) * 100.0 / COUNT(*), 2) as conversion_rate
FROM onboarding_users 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
``` 
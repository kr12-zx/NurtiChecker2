# 🚀 Настройка N8N Webhook для NutriChecker

## 📋 Что включает workflow:

### 🔧 Узлы workflow:
1. **Webhook Trigger** - принимает POST запросы от приложения
2. **Process & Validate Data** - валидирует и обрабатывает данные
3. **Save to Supabase** - сохраняет в базу данных
4. **Check Event Type** - определяет тип события (paywall/completion)
5. **Paywall Notification** - уведомления о достижении paywall
6. **Completion Notification** - уведомления о завершении онбординга
7. **Success Response** - возвращает успешный ответ
8. **Analytics Processing** - обрабатывает аналитику
9. **Error Response** - обрабатывает ошибки

### 📊 Что обрабатывается:
- ✅ Все 25+ полей профиля пользователя
- ✅ Психологический профиль и препятствия
- ✅ Аналитика прохождения онбординга
- ✅ Автоматические уведомления
- ✅ Обработка ошибок
- ✅ Расчет BMI, времени прохождения, сегментация

## 🛠️ Пошаговая настройка:

### 1. Импорт workflow в N8N

1. Откройте N8N
2. Нажмите **"Import from file"** или **"+"** → **"Import from file"**
3. Выберите файл `nutrichecker_onboarding_webhook.json`
4. Нажмите **"Import"**

### 2. Настройка Supabase подключения

1. В N8N перейдите в **Settings** → **Credentials**
2. Нажмите **"Add Credential"**
3. Выберите **"Postgres"**
4. Заполните данные Supabase:

```
Name: Supabase NutriChecker
Host: db.bespxpyftmnhbynchywl.supabase.co
Database: postgres
User: postgres
Password: [твой пароль от Supabase]
Port: 5432
SSL: Enable (или Require)
```

**⚠️ Важные моменты:**
- **Host**: `db.bespxpyftmnhbynchywl.supabase.co` (без `https://` и без порта)
- **SSL**: ОБЯЗАТЕЛЬНО включить! Supabase требует SSL
- **Password**: найди в Supabase Dashboard → Settings → Database → Database password
- **Port**: 5432 (стандартный PostgreSQL порт)

**Если не помнишь пароль:**
1. Зайди в Supabase Dashboard
2. Settings → Database  
3. Нажми "Reset database password"
4. Скопируй новый пароль

**Альтернативный способ - через Connection String:**
1. В Supabase Dashboard → Settings → Database
2. Скопируй "Connection string" 
3. Формат: `postgresql://postgres:[password]@db.bespxpyftmnhbynchywl.supabase.co:5432/postgres`
4. Извлеки пароль между `postgres:` и `@`

### 3. Активация workflow

1. Откройте импортированный workflow
2. Нажмите **"Activate"** в правом верхнем углу
3. Скопируйте **Webhook URL** из узла "Webhook Trigger"

URL будет выглядеть как:
```
https://your-n8n-instance.com/webhook/nutrichecker-onboarding
```

### 4. Настройка в приложении

В файле `.env` вашего React Native проекта:

```env
EXPO_PUBLIC_WEBHOOK_URL=https://your-n8n-instance.com/webhook/nutrichecker-onboarding
```

## 🧪 Тестирование webhook

### Тестовый payload для проверки:

```bash
curl -X POST https://your-n8n-instance.com/webhook/nutrichecker-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "emailId": "test123456789@nutrichecker.top",
      "createdAt": "2025-01-27T10:30:00.000Z"
    },
    "profile": {
      "birthday": "1992-06-15",
      "gender": "male",
      "height": 176,
      "currentWeight": 75,
      "goalWeight": 70,
      "weightLossRate": 0.5,
      "primaryGoal": "lose-weight",
      "activityLevel": "lightly-active",
      "dietPreference": "standard",
      "mealFrequency": "3-meals",
      "confidenceLevel": 3,
      "challenges": ["emotional-eating", "busy-schedule"],
      "stressResponse": "emotional-eating"
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
      "completedSteps": [0, 1, 2, 3, 4, 5],
      "stepTimestamps": [
        {"step": 0, "timestamp": "2025-01-27T10:00:00.000Z"},
        {"step": 1, "timestamp": "2025-01-27T10:01:00.000Z"}
      ],
      "deviceInfo": {
        "platform": "mobile",
        "userAgent": "NutriChecker-Mobile/1.0"
      }
    }
  }'
```

### Ожидаемый ответ:

```json
{
  "success": true,
  "message": "NutriChecker onboarding data processed successfully",
  "data": {
    "userId": "uuid-here",
    "emailId": "test123456789@nutrichecker.top",
    "eventType": "paywall_reached",
    "profileCompleteness": "15/25",
    "processedAt": "2025-01-27T10:30:00.000Z"
  }
}
```

## 📊 Мониторинг и логи

### В N8N:
1. **Executions** - просмотр всех выполнений
2. **Logs** - детальные логи каждого узла
3. **Error handling** - автоматическая обработка ошибок

### В Supabase:
Проверьте таблицы:
```sql
-- Проверка сохраненных пользователей
SELECT * FROM onboarding_users ORDER BY created_at DESC LIMIT 10;

-- Проверка webhook событий
SELECT * FROM webhook_events ORDER BY sent_at DESC LIMIT 10;

-- Статистика по событиям
SELECT 
    event_type,
    COUNT(*) as total,
    COUNT(CASE WHEN success THEN 1 END) as successful
FROM webhook_events 
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type;
```

## 🔧 Дополнительные настройки

### Добавление Slack уведомлений:

В узлах "Paywall Notification" и "Completion Notification" добавьте:

```javascript
// Отправка в Slack
const slackMessage = {
  text: notification.message,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${notification.type}*\n${notification.message}`
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*User:* ${notification.user.emailId}`
        },
        {
          type: "mrkdwn",
          text: `*Steps:* ${notification.analytics.totalSteps}`
        }
      ]
    }
  ]
};

// Добавьте HTTP Request узел для отправки в Slack webhook
```

### Email уведомления:

Добавьте узел **"Send Email"** после уведомлений для отправки welcome email.

### Аналитика:

Добавьте узлы для отправки данных в:
- Google Analytics
- Mixpanel
- Amplitude
- Custom dashboard

## 🚨 Troubleshooting

### 🔌 Проблемы с подключением к Postgres:

**1. "Connection refused" или "timeout":**
```
✅ Проверь настройки:
Host: db.bespxpyftmnhbynchywl.supabase.co (точно как в psql команде)
Port: 5432
SSL: ОБЯЗАТЕЛЬНО Enable/Require
```

**2. "Authentication failed":**
- Неправильный пароль
- Зайди в Supabase → Settings → Database → Reset password

**3. "SSL required":**
- В N8N обязательно включи SSL
- Попробуй разные варианты: "Enable", "Require", "Prefer"

**4. Тест подключения в N8N:**
1. После настройки credentials нажми "Test"
2. Должно показать "Connection successful"

**5. Проверка через psql (для отладки):**
```bash
# Твоя команда (работает?)
psql -h db.bespxpyftmnhbynchywl.supabase.co -p 5432 -d postgres -U postgres

# С SSL (если нужно)
psql "postgresql://postgres:[password]@db.bespxpyftmnhbynchywl.supabase.co:5432/postgres?sslmode=require"
```

### Частые ошибки:

1. **"Missing required field"**
   - Проверьте структуру payload
   - Убедитесь что `user.emailId` и `event.type` присутствуют

2. **"Database connection failed"**
   - Проверьте credentials Supabase
   - Убедитесь что IP N8N добавлен в whitelist

3. **"Function not found"**
   - Выполните SQL скрипты в правильном порядке
   - Проверьте что функции созданы в Supabase

4. **"Webhook timeout"**
   - Увеличьте timeout в настройках N8N
   - Оптимизируйте SQL запросы

### Логи для отладки:

```javascript
// Добавьте в Function узлы для детального логирования
console.log('🔍 Debug info:', {
  emailId,
  eventType,
  profileFields: Object.keys(profile).length,
  timestamp: new Date().toISOString()
});
```

## 📈 Метрики для отслеживания

- **Conversion rate**: paywall_reached → onboarding_completed
- **Time to paywall**: среднее время до достижения paywall
- **Profile completeness**: процент заполненных полей
- **User segments**: высокая уверенность, множественные препятствия
- **Device analytics**: платформа, время использования

Готово! 🎉 Webhook настроен и готов к приему данных онбординга. 
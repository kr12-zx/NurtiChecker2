# N8N Workflows для NutriChecker Push Notifications

## 📋 Обзор

Этот документ описывает N8N workflows для обработки push-уведомлений в приложении NutriChecker.

## 🔄 Workflow 1: Регистрация Push Токенов

**Webhook URL:** `https://ttagent.website/webhook/register-push-token`

### Входящие данные:
```json
{
  "userId": "20241225123456789@nutrichecker.top",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "deviceInfo": {
    "brand": "Apple",
    "modelName": "iPhone 15",
    "osName": "iOS",
    "osVersion": "17.0"
  },
  "registeredAt": "2024-12-25T12:34:56.789Z"
}
```

### Шаги workflow:

1. **Webhook Trigger**
   - Принимает POST запрос
   - Валидирует входящие данные

2. **Upsert User в Supabase**
   ```sql
   INSERT INTO users (user_id, platform, device_info, updated_at)
   VALUES ({{$json.userId}}, {{$json.platform}}, {{$json.deviceInfo}}, NOW())
   ON CONFLICT (user_id) 
   DO UPDATE SET 
     platform = EXCLUDED.platform,
     device_info = EXCLUDED.device_info,
     updated_at = NOW();
   ```

3. **Upsert Push Token в Supabase**
   ```sql
   INSERT INTO push_tokens (user_id, push_token, platform, device_info, last_used_at)
   VALUES ({{$json.userId}}, {{$json.pushToken}}, {{$json.platform}}, {{$json.deviceInfo}}, NOW())
   ON CONFLICT (push_token)
   DO UPDATE SET 
     user_id = EXCLUDED.user_id,
     platform = EXCLUDED.platform,
     device_info = EXCLUDED.device_info,
     last_used_at = NOW(),
     is_active = TRUE;
   ```

4. **Response**
   ```json
   {
     "success": true,
     "message": "Push token registered successfully",
     "userId": "{{$json.userId}}"
   }
   ```

---

## 🔄 Workflow 2: Обработка Данных Сканирования

**Webhook URL:** `https://ttagent.website/webhook/food-scan` (существующий)

### Дополнительные шаги для push-уведомлений:

5. **Сохранение в nutrition_data**
   ```sql
   INSERT INTO nutrition_data (
     user_id, food_name, calories, protein, fat, carbs,
     portion_size, scan_method, full_analysis_data, scanned_at
   ) VALUES (
     {{$json.userId}},
     {{$json.foodName}},
     {{$json.nutritionInfo.calories}},
     {{$json.nutritionInfo.protein}},
     {{$json.nutritionInfo.fat}},
     {{$json.nutritionInfo.carbs}},
     {{$json.portionInfo.amount}},
     'photo',
     {{$json}},
     NOW()
   );
   ```

6. **Проверка на триггеры уведомлений**
   - Если это 5-е сканирование за день → отправить совет
   - Если высокие калории (>500 на 100г) → предупреждение
   - Если найдены аллергены → предупреждение

---

## 🔄 Workflow 3: Отправка Тестового Уведомления

**Webhook URL:** `https://ttagent.website/webhook/send-test-push`

### Входящие данные:
```json
{
  "userId": "20241225123456789@nutrichecker.top",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Шаги workflow:

1. **Webhook Trigger**

2. **Отправка через Expo Push API**
   ```javascript
   // HTTP Request Node
   // Method: POST
   // URL: https://exp.host/--/api/v2/push/send
   // Headers: 
   {
     "Accept": "application/json",
     "Accept-encoding": "gzip, deflate",
     "Content-Type": "application/json"
   }
   
   // Body:
   {
     "to": "{{$json.pushToken}}",
     "title": "🧪 Тестовое уведомление",
     "body": "Push-уведомления работают! 🎉",
     "data": {
       "type": "test",
       "userId": "{{$json.userId}}",
       "timestamp": "{{new Date().toISOString()}}"
     },
     "sound": "default",
     "badge": 1
   }
   ```

3. **Логирование в Supabase**
   ```sql
   INSERT INTO sent_notifications (
     user_id, push_token, notification_type, title, body, data, status
   ) VALUES (
     {{$json.userId}},
     {{$json.pushToken}},
     'test',
     'Тестовое уведомление',
     'Push-уведомления работают! 🎉',
     {{$json}},
     CASE WHEN {{$response.statusCode}} = 200 THEN 'sent' ELSE 'failed' END
   );
   ```

---

## 🔄 Workflow 4: Ежедневные Советы по Питанию

**Trigger:** Cron (каждый день в 9:00)
**Webhook URL:** `https://ttagent.website/webhook/send-daily-advice`

### Шаги workflow:

1. **Cron Trigger** (0 9 * * *)

2. **Получение активных пользователей**
   ```sql
   SELECT 
     u.user_id,
     u.preferred_notification_time,
     u.timezone,
     pt.push_token,
     pt.platform
   FROM active_users_with_tokens u
   JOIN push_tokens pt ON u.user_id = pt.user_id
   WHERE u.notifications_enabled = TRUE
   AND pt.is_active = TRUE;
   ```

3. **Для каждого пользователя:**

   a. **Получение статистики питания**
   ```sql
   SELECT * FROM weekly_nutrition_stats 
   WHERE user_id = {{$json.user_id}}
   AND week_start = DATE_TRUNC('week', NOW());
   ```

   b. **Генерация совета через OpenAI**
   ```javascript
   // OpenAI Node
   {
     "model": "gpt-4",
     "messages": [
       {
         "role": "system",
         "content": "Ты диетолог. Дай краткий совет по питанию на основе данных пользователя."
       },
       {
         "role": "user", 
         "content": `Статистика за неделю: 
         Сканирований: {{$json.scans_count}}
         Средние калории: {{$json.avg_calories}}
         Белки: {{$json.avg_protein}}г
         Жиры: {{$json.avg_fat}}г
         Углеводы: {{$json.avg_carbs}}г`
       }
     ],
     "max_tokens": 150
   }
   ```

   c. **Сохранение совета**
   ```sql
   INSERT INTO nutrition_advice (
     user_id, advice_text, advice_type, nutrition_summary, ai_model
   ) VALUES (
     {{$json.user_id}},
     {{$openai.choices[0].message.content}},
     'daily',
     {{$json.nutrition_stats}},
     'gpt-4'
   ) RETURNING id;
   ```

   d. **Отправка push-уведомления**
   ```javascript
   {
     "to": "{{$json.push_token}}",
     "title": "🥗 Ваш ежедневный совет",
     "body": "{{$openai.choices[0].message.content}}",
     "data": {
       "type": "nutrition_advice",
       "userId": "{{$json.user_id}}",
       "adviceId": "{{$advice.id}}"
     },
     "sound": "default"
   }
   ```

   e. **Обновление статуса**
   ```sql
   UPDATE nutrition_advice 
   SET sent_at = NOW(), is_sent = TRUE 
   WHERE id = {{$advice.id}};
   ```

---

## 🔄 Workflow 5: Отключение Уведомлений

**Webhook URL:** `https://ttagent.website/webhook/disable-push`

### Входящие данные:
```json
{
  "userId": "20241225123456789@nutrichecker.top"
}
```

### Шаги workflow:

1. **Webhook Trigger**

2. **Деактивация токенов**
   ```sql
   UPDATE push_tokens 
   SET is_active = FALSE 
   WHERE user_id = {{$json.userId}};
   ```

3. **Обновление настроек пользователя**
   ```sql
   UPDATE users 
   SET notifications_enabled = FALSE 
   WHERE user_id = {{$json.userId}};
   ```

---

## 🔄 Workflow 6: Умные Уведомления

**Trigger:** Webhook после сканирования
**Webhook URL:** `https://ttagent.website/webhook/smart-notification`

### Логика отправки:

1. **Высококалорийный продукт** (>400 ккал/100г)
   ```json
   {
     "title": "⚠️ Высококалорийный продукт",
     "body": "{{foodName}} содержит {{calories}} ккал. Учтите это в своем рационе!",
     "data": {"type": "high_calorie_warning"}
   }
   ```

2. **Обнаружен аллерген**
   ```json
   {
     "title": "🚨 Внимание: аллерген!",
     "body": "В продукте {{foodName}} обнаружен аллерген: {{allergen}}",
     "data": {"type": "allergen_warning"}
   }
   ```

3. **Достижение цели** (5 сканирований в день)
   ```json
   {
     "title": "🎉 Отличная работа!",
     "body": "Вы отсканировали уже 5 продуктов сегодня. Продолжайте следить за питанием!",
     "data": {"type": "achievement"}
   }
   ```

---

## 🛠️ Настройка в N8N

### 1. Создание Credentials:

**Supabase:**
- URL: `https://your-project.supabase.co`
- API Key: `your-service-role-key`

**OpenAI:**
- API Key: `your-openai-api-key`

### 2. Переменные окружения:
```
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Error Handling:
- Все workflows должны иметь Error Trigger
- Логирование ошибок в отдельную таблицу
- Retry механизм для failed push notifications

---

## 📊 Мониторинг

### Метрики для отслеживания:
- Количество отправленных уведомлений
- Delivery rate (доставлено/отправлено)
- Open rate (открыто/доставлено)
- Активные пользователи с токенами
- Ошибки отправки

### Дашборд в Supabase:
```sql
-- Статистика уведомлений за последние 7 дней
SELECT 
  DATE(sent_at) as date,
  notification_type,
  COUNT(*) as sent_count,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_count
FROM sent_notifications 
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at), notification_type
ORDER BY date DESC;
```

---

## 🚀 Развертывание

1. **Импорт workflows в N8N**
2. **Настройка credentials**
3. **Активация cron triggers**
4. **Тестирование каждого workflow**
5. **Мониторинг логов**

## 🔐 Безопасность

- Все API ключи в environment variables
- Rate limiting на webhooks
- Валидация входящих данных
- Логирование всех операций 
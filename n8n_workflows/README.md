# 🔄 N8N Workflows для NutriChecker

## 📋 Список workflows

1. **`1_register_push_token.json`** - Регистрация push токенов
2. **`2_send_test_push.json`** - Отправка тестовых уведомлений  
3. **`3_daily_nutrition_advice.json`** - Ежедневные советы с ИИ
4. **`4_smart_notifications.json`** - Умные уведомления (аллергены, калории, достижения)
5. **`5_disable_notifications.json`** - Отключение уведомлений

## 🚀 Импорт в N8N

### 1. Подготовка credentials

Перед импортом создай credentials в N8N:

#### **Supabase API:**
- Name: `Supabase NutriChecker`
- Type: `HTTP Request Auth`
- Authentication: `Header Auth`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`

#### **OpenAI API:**
- Name: `OpenAI NutriChecker`
- Type: `OpenAI`
- API Key: `sk-your-openai-api-key`

### 2. Environment Variables

Добавь в N8N environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
```

### 3. Импорт workflows

Для каждого JSON файла:

1. Открой N8N Dashboard
2. Нажми **"Import from file"** или **"+"** → **"Import"**
3. Выбери JSON файл
4. Нажми **"Import"**
5. Проверь, что credentials подключены правильно
6. Активируй workflow

## 🔧 Настройка после импорта

### 1. Проверь webhook URLs

Убедись, что webhook URLs соответствуют твоему домену:

- `https://ttagent.website/webhook/register-push-token`
- `https://ttagent.website/webhook/send-test-push`
- `https://ttagent.website/webhook/smart-notification`
- `https://ttagent.website/webhook/disable-push`

### 2. Обнови credentials IDs

В каждом workflow проверь, что используются правильные credentials:

```json
"credentials": {
  "supabaseApi": {
    "id": "supabase-nutrichecker",
    "name": "Supabase NutriChecker"
  }
}
```

### 3. Настрой cron для ежедневных советов

В workflow `3_daily_nutrition_advice.json`:
- Проверь время: `0 9 * * *` (9:00 каждый день)
- Измени при необходимости

## 🧪 Тестирование

### 1. Тест регистрации токена

```bash
curl -X POST https://ttagent.website/webhook/register-push-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123@nutrichecker.top",
    "pushToken": "ExponentPushToken[test]",
    "platform": "ios",
    "deviceInfo": {
      "brand": "Apple",
      "modelName": "iPhone 15"
    }
  }'
```

### 2. Тест отправки уведомления

```bash
curl -X POST https://ttagent.website/webhook/send-test-push \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123@nutrichecker.top",
    "pushToken": "ExponentPushToken[test]"
  }'
```

### 3. Тест умных уведомлений

```bash
curl -X POST https://ttagent.website/webhook/smart-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123@nutrichecker.top",
    "foodName": "Шоколад",
    "nutritionInfo": {
      "calories": 534
    },
    "allergens": ["Молоко", "Соя"]
  }'
```

## 📊 Мониторинг

### Проверка выполнения workflows:

1. В N8N Dashboard → **Executions**
2. Фильтруй по workflow name
3. Проверяй статус: ✅ Success / ❌ Error

### Проверка в Supabase:

```sql
-- Последние уведомления
SELECT * FROM sent_notifications 
ORDER BY sent_at DESC 
LIMIT 10;

-- Активные пользователи
SELECT COUNT(*) FROM active_users_with_tokens;

-- Ошибки
SELECT * FROM sent_notifications 
WHERE status = 'failed' 
ORDER BY sent_at DESC;
```

## 🔧 Troubleshooting

### Ошибка: "Credential not found"
- Проверь, что credentials созданы с правильными именами
- Обнови credential IDs в workflow

### Ошибка: "Supabase connection failed"
- Проверь SUPABASE_URL и SERVICE_KEY
- Убедись, что RLS политики настроены

### Ошибка: "OpenAI API failed"
- Проверь OPENAI_API_KEY
- Убедись, что у тебя есть доступ к GPT-4

### Ошибка: "Expo push failed"
- Проверь формат push токена (должен начинаться с "ExponentPushToken")
- Убедись, что токен активен

## 📝 Кастомизация

### Изменение времени ежедневных советов:

В workflow `3_daily_nutrition_advice.json` найди:
```json
"expression": "0 9 * * *"
```

Измени на нужное время:
- `0 8 * * *` - 8:00
- `0 20 * * *` - 20:00
- `0 9 * * 1-5` - 9:00 только в будни

### Изменение порога калорий:

В workflow `4_smart_notifications.json` найди:
```json
"rightValue": 400
```

Измени на нужное значение калорий.

### Добавление новых типов уведомлений:

1. Добавь новую проверку в `4_smart_notifications.json`
2. Создай новый node для отправки
3. Обнови логирование

## 🔐 Безопасность

- ✅ Все API ключи в environment variables
- ✅ Валидация входящих данных
- ✅ Rate limiting на webhooks (настрой в N8N)
- ✅ Логирование всех операций

## 📞 Поддержка

При проблемах проверь:
1. **Execution logs** в N8N
2. **Supabase logs** в Dashboard
3. **Environment variables**
4. **Credentials configuration**

---

**Готово!** 🎉 Workflows готовы к использованию. 
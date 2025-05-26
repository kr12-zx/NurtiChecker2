# 🔔 Настройка Push-уведомлений для NutriChecker

## 📋 Обзор системы

Система push-уведомлений состоит из:
- **React Native приложение** - получает токены и обрабатывает уведомления
- **Supabase** - хранит пользователей, токены и данные
- **N8N** - обрабатывает логику и отправляет уведомления
- **Expo Push Service** - доставляет уведомления на устройства

## 🚀 Пошаговая настройка

### 1. 📱 Настройка приложения (уже сделано)

✅ Установлены пакеты:
```bash
npx expo install expo-notifications expo-device expo-constants
```

✅ Создан сервис `services/pushNotifications.ts`
✅ Добавлена инициализация в `_layout.tsx`
✅ Добавлена тестовая кнопка в настройки

### 2. 🗄️ Настройка Supabase

#### Шаг 1: Создание таблиц
1. Открой Supabase Dashboard
2. Перейди в SQL Editor
3. Выполни скрипт из файла `supabase_setup.sql`

#### Шаг 2: Получение API ключей
1. В Supabase Dashboard → Settings → API
2. Скопируй:
   - **URL**: `https://your-project.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 🔄 Настройка N8N

#### Шаг 1: Создание Credentials

**Supabase Credential:**
1. В N8N → Credentials → Add Credential
2. Выбери "HTTP Request Auth"
3. Настрой:
   - Name: `Supabase NutriChecker`
   - Authentication: `Header Auth`
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_SERVICE_ROLE_KEY`

**OpenAI Credential:**
1. Add Credential → OpenAI
2. API Key: `sk-...`

#### Шаг 2: Создание Workflows

Создай следующие workflows из файла `n8n_workflows.md`:

1. **Register Push Token** - `https://ttagent.website/webhook/register-push-token`
2. **Send Test Push** - `https://ttagent.website/webhook/send-test-push`
3. **Daily Advice** - Cron trigger (9:00 каждый день)
4. **Disable Push** - `https://ttagent.website/webhook/disable-push`

### 4. 🧪 Тестирование

#### Тест 1: Регистрация токена
1. Запусти приложение на реальном устройстве
2. Проверь логи - должен появиться push токен
3. Проверь в Supabase - должны появиться записи в `users` и `push_tokens`

#### Тест 2: Отправка тестового уведомления
1. В приложении → Настройки → "Отправить тестовое уведомление"
2. Через несколько секунд должно прийти уведомление
3. Проверь в Supabase таблицу `sent_notifications`

#### Тест 3: Ежедневные советы
1. Отсканируй несколько продуктов
2. Запусти workflow "Daily Advice" вручную
3. Должен прийти персонализированный совет

## 📊 Мониторинг

### Проверка статуса в Supabase:

```sql
-- Активные пользователи с токенами
SELECT COUNT(*) FROM active_users_with_tokens;

-- Отправленные уведомления за сегодня
SELECT 
  notification_type,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
FROM sent_notifications 
WHERE DATE(sent_at) = CURRENT_DATE
GROUP BY notification_type;

-- Последние ошибки
SELECT * FROM sent_notifications 
WHERE status = 'failed' 
ORDER BY sent_at DESC 
LIMIT 10;
```

### Логи в приложении:
- Открой Metro bundler
- Смотри консоль на наличие ошибок push-уведомлений

## 🔧 Troubleshooting

### Проблема: Токен не получается
**Решение:**
- Убедись, что используешь реальное устройство
- Проверь разрешения на уведомления
- Проверь Project ID в `app.json`

### Проблема: Уведомления не приходят
**Решение:**
- Проверь статус в таблице `sent_notifications`
- Убедись, что токен активен в `push_tokens`
- Проверь N8N workflow на ошибки

### Проблема: Ошибка в N8N
**Решение:**
- Проверь credentials (Supabase, OpenAI)
- Убедись, что webhook URLs правильные
- Проверь формат данных в запросах

## 🎯 Типы уведомлений

### 1. Тестовые (для разработки)
```json
{
  "title": "🧪 Тестовое уведомление",
  "body": "Push-уведомления работают! 🎉",
  "data": {"type": "test"}
}
```

### 2. Ежедневные советы
```json
{
  "title": "🥗 Ваш ежедневный совет",
  "body": "На основе ваших сканирований рекомендуем...",
  "data": {"type": "nutrition_advice"}
}
```

### 3. Предупреждения об аллергенах
```json
{
  "title": "🚨 Внимание: аллерген!",
  "body": "В продукте обнаружен аллерген: Глютен",
  "data": {"type": "allergen_warning"}
}
```

### 4. Высококалорийные продукты
```json
{
  "title": "⚠️ Высококалорийный продукт",
  "body": "Шоколад содержит 534 ккал. Учтите это в рационе!",
  "data": {"type": "high_calorie_warning"}
}
```

### 5. Достижения
```json
{
  "title": "🎉 Отличная работа!",
  "body": "Вы отсканировали уже 5 продуктов сегодня!",
  "data": {"type": "achievement"}
}
```

## 🔮 Будущие улучшения

### Персонализация:
- Время отправки по часовому поясу пользователя
- Частота уведомлений (ежедневно/еженедельно)
- Типы советов (похудение/набор массы/поддержание)

### Аналитика:
- A/B тестирование текстов уведомлений
- Анализ времени открытия
- Сегментация пользователей

### Интеграции:
- Apple Health / Google Fit
- Календарь приемов пищи
- Социальные функции

## 📞 Поддержка

При возникновении проблем:
1. Проверь логи в Metro bundler
2. Проверь таблицы в Supabase
3. Проверь execution logs в N8N
4. Убедись, что все credentials актуальны

## 🔐 Безопасность

- ✅ Push токены шифруются в базе
- ✅ API ключи в environment variables
- ✅ Rate limiting на webhooks
- ✅ Валидация всех входящих данных
- ✅ Row Level Security в Supabase

---

**Готово!** 🎉 Система push-уведомлений настроена и готова к использованию. 
-- =====================================================
-- NutriChecker - Supabase Database Setup
-- =====================================================

-- 1. Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL, -- "20241225123456789@nutrichecker.top"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Метаданные
  app_version TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB,
  
  -- Настройки пользователя
  notifications_enabled BOOLEAN DEFAULT TRUE,
  preferred_notification_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'Europe/Moscow',
  language TEXT DEFAULT 'ru'
);

-- 2. Таблица push токенов
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  
  -- Метаданные устройства
  device_info JSONB,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  
  -- Уникальность токена
  UNIQUE(push_token)
);

-- 3. Таблица данных о питании (расширенная)
CREATE TABLE IF NOT EXISTS nutrition_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Основные данные о продукте
  food_name TEXT NOT NULL,
  calories INTEGER,
  protein DECIMAL(8,2),
  fat DECIMAL(8,2),
  carbs DECIMAL(8,2),
  sugar DECIMAL(8,2),
  fiber DECIMAL(8,2),
  sodium DECIMAL(8,2),
  
  -- Дополнительные данные
  portion_size DECIMAL(8,2),
  portion_unit TEXT DEFAULT 'г',
  
  -- Метаданные сканирования
  scan_method TEXT CHECK (scan_method IN ('photo', 'barcode', 'manual')),
  image_url TEXT,
  full_analysis_data JSONB, -- Полные данные от N8N
  
  -- Временные метки
  scanned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Таблица отправленных уведомлений (для аналитики)
CREATE TABLE IF NOT EXISTS sent_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  
  -- Содержание уведомления
  notification_type TEXT NOT NULL, -- 'nutrition_advice', 'weekly_summary', 'reminder'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  
  -- Статус доставки
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'failed')),
  
  -- Ошибки
  error_message TEXT
);

-- 5. Таблица советов по питанию (сгенерированных ИИ)
CREATE TABLE IF NOT EXISTS nutrition_advice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Содержание совета
  advice_text TEXT NOT NULL,
  advice_type TEXT DEFAULT 'daily' CHECK (advice_type IN ('daily', 'weekly', 'personalized')),
  
  -- Данные для генерации
  based_on_period INTERVAL DEFAULT '7 days',
  nutrition_summary JSONB, -- Сводка питания за период
  ai_model TEXT DEFAULT 'gpt-4',
  
  -- Статус
  generated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  is_sent BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- ИНДЕКСЫ для оптимизации
-- =====================================================

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_nutrition_data_user_id ON nutrition_data(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_data_scanned_at ON nutrition_data(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_notifications_user_id ON sent_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_notifications_sent_at ON sent_notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_advice_user_id ON nutrition_advice(user_id);

-- =====================================================
-- ФУНКЦИИ для автоматизации
-- =====================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Функция для очистки старых токенов
CREATE OR REPLACE FUNCTION cleanup_old_push_tokens()
RETURNS void AS $$
BEGIN
    -- Деактивируем токены, которые не использовались более 30 дней
    UPDATE push_tokens 
    SET is_active = FALSE 
    WHERE last_used_at < NOW() - INTERVAL '30 days' 
    AND is_active = TRUE;
    
    -- Удаляем совсем старые неактивные токены (старше 90 дней)
    DELETE FROM push_tokens 
    WHERE is_active = FALSE 
    AND last_used_at < NOW() - INTERVAL '90 days';
END;
$$ language 'plpgsql';

-- =====================================================
-- CRON JOBS (если включен pg_cron)
-- =====================================================

-- Очистка старых токенов каждый день в 2:00
-- SELECT cron.schedule('cleanup-old-tokens', '0 2 * * *', 'SELECT cleanup_old_push_tokens();');

-- Отправка ежедневных советов каждый день в 9:00
-- SELECT cron.schedule('daily-nutrition-advice', '0 9 * * *', 
--   'SELECT net.http_post(
--     url := ''https://ttagent.website/webhook/send-daily-advice'',
--     headers := ''{"Content-Type": "application/json"}''::jsonb
--   );'
-- );

-- =====================================================
-- ПОЛИТИКИ БЕЗОПАСНОСТИ (RLS)
-- =====================================================

-- Включаем Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_advice ENABLE ROW LEVEL SECURITY;

-- Политики для пользователей (пока открытые для N8N)
CREATE POLICY "Allow all operations for service role" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON push_tokens
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON nutrition_data
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON sent_notifications
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role" ON nutrition_advice
  FOR ALL USING (true);

-- =====================================================
-- ТЕСТОВЫЕ ДАННЫЕ (опционально)
-- =====================================================

-- Вставляем тестового пользователя
-- INSERT INTO users (user_id, platform, device_info) 
-- VALUES (
--   '20241225123456789@nutrichecker.top',
--   'ios',
--   '{"brand": "Apple", "model": "iPhone 15", "os": "iOS 17.0"}'::jsonb
-- ) ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- ПРЕДСТАВЛЕНИЯ для удобства
-- =====================================================

-- Представление активных пользователей с токенами
CREATE OR REPLACE VIEW active_users_with_tokens AS
SELECT 
  u.user_id,
  u.notifications_enabled,
  u.preferred_notification_time,
  u.timezone,
  u.language,
  pt.push_token,
  pt.platform,
  pt.last_used_at
FROM users u
JOIN push_tokens pt ON u.user_id = pt.user_id
WHERE pt.is_active = TRUE 
AND u.notifications_enabled = TRUE;

-- Представление статистики питания за последнюю неделю
CREATE OR REPLACE VIEW weekly_nutrition_stats AS
SELECT 
  user_id,
  COUNT(*) as scans_count,
  AVG(calories) as avg_calories,
  SUM(calories) as total_calories,
  AVG(protein) as avg_protein,
  AVG(fat) as avg_fat,
  AVG(carbs) as avg_carbs,
  DATE_TRUNC('week', scanned_at) as week_start
FROM nutrition_data
WHERE scanned_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id, DATE_TRUNC('week', scanned_at);

-- =====================================================
-- КОММЕНТАРИИ к таблицам
-- =====================================================

COMMENT ON TABLE users IS 'Основная таблица пользователей приложения';
COMMENT ON TABLE push_tokens IS 'Push токены для отправки уведомлений';
COMMENT ON TABLE nutrition_data IS 'Данные о сканированных продуктах';
COMMENT ON TABLE sent_notifications IS 'Лог отправленных уведомлений';
COMMENT ON TABLE nutrition_advice IS 'Сгенерированные ИИ советы по питанию';

COMMENT ON COLUMN users.user_id IS 'Уникальный ID пользователя в формате timestamp@nutrichecker.top';
COMMENT ON COLUMN push_tokens.push_token IS 'Expo push токен для отправки уведомлений';
COMMENT ON COLUMN nutrition_data.full_analysis_data IS 'Полные данные анализа от N8N в JSON формате';
COMMENT ON COLUMN sent_notifications.data IS 'Дополнительные данные уведомления в JSON формате';

-- =====================================================
-- ЗАВЕРШЕНИЕ
-- =====================================================

-- Выводим информацию о созданных таблицах
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('users', 'push_tokens', 'nutrition_data', 'sent_notifications', 'nutrition_advice')
ORDER BY tablename; 
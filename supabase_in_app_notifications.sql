-- =====================================================
-- Таблица для уведомлений внутри приложения
-- =====================================================

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- mailid пользователя
  
  -- Содержание уведомления
  notification_type TEXT NOT NULL, -- 'daily_advice', 'weekly_summary', 'vitamin_reminder'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Статус
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Дополнительные данные
  data JSONB, -- Дополнительная информация (советы, статистика и т.д.)
  action_url TEXT, -- URL для перехода при нажатии
  
  -- Временные метки
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  expires_at TIMESTAMP, -- Когда уведомление устаревает
  
  -- Индексы
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES profiles(mailid) ON DELETE CASCADE
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_unread ON in_app_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_type ON in_app_notifications(notification_type);

-- RLS политики
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Политика для service role (N8N)
CREATE POLICY "Allow all operations for service role" ON in_app_notifications
  FOR ALL USING (true);

-- Функция для автоматической очистки старых уведомлений
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Архивируем прочитанные уведомления старше 30 дней
    UPDATE in_app_notifications 
    SET is_archived = TRUE 
    WHERE is_read = TRUE 
    AND read_at < NOW() - INTERVAL '30 days' 
    AND is_archived = FALSE;
    
    -- Удаляем архивированные уведомления старше 90 дней
    DELETE FROM in_app_notifications 
    WHERE is_archived = TRUE 
    AND created_at < NOW() - INTERVAL '90 days';
    
    -- Удаляем истекшие уведомления
    DELETE FROM in_app_notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Представление для получения активных уведомлений
CREATE OR REPLACE VIEW active_notifications AS
SELECT 
  id,
  user_id,
  notification_type,
  title,
  message,
  is_read,
  priority,
  data,
  action_url,
  created_at,
  read_at,
  expires_at
FROM in_app_notifications
WHERE is_archived = FALSE 
AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY 
  CASE priority 
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at DESC;

-- Представление для статистики уведомлений по пользователям
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  notification_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_read THEN 1 END) as read_count,
  COUNT(CASE WHEN NOT is_read THEN 1 END) as unread_count,
  MAX(created_at) as last_notification_at
FROM in_app_notifications
WHERE is_archived = FALSE
GROUP BY user_id, notification_type;

-- Комментарии
COMMENT ON TABLE in_app_notifications IS 'Уведомления внутри приложения для дашбордов';
COMMENT ON COLUMN in_app_notifications.user_id IS 'mailid пользователя из таблицы profiles';
COMMENT ON COLUMN in_app_notifications.data IS 'JSON данные с дополнительной информацией для уведомления';
COMMENT ON COLUMN in_app_notifications.action_url IS 'URL для перехода при нажатии на уведомление';
COMMENT ON COLUMN in_app_notifications.expires_at IS 'Время истечения уведомления (NULL = не истекает)';

-- Тестовые данные (опционально)
-- INSERT INTO in_app_notifications (user_id, notification_type, title, message, priority, data) 
-- VALUES (
--   'test@nutrichecker.top',
--   'daily_advice',
--   '🥗 Ваш ежедневный совет',
--   'Добавьте больше овощей в рацион для лучшего баланса витаминов',
--   'normal',
--   '{"advice_type": "vegetables", "generated_at": "2024-12-25T09:00:00Z"}'::jsonb
-- ); 
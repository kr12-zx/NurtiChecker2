-- Примеры SQL запросов для работы с данными онбординга NutriChecker

-- 1. Получение полного профиля пользователя по email ID
SELECT 
    ou.email_id,
    ou.created_at as registration_date,
    ou.paywall_reached_at,
    ou.completed_at,
    ou.status,
    
    -- Основные данные
    upb.birthday,
    upb.gender,
    upb.height,
    upb.current_weight,
    upb.goal_weight,
    upb.weight_loss_rate,
    upb.primary_goal,
    
    -- Активность и диета
    uad.activity_level,
    uad.diet_preference,
    uad.meal_frequency,
    
    -- Психологический профиль
    upp.confidence_level,
    upp.stress_response,
    upp.adaptability,
    upp.challenges_view,
    
    -- Настройки единиц
    uus.weight_unit,
    uus.height_unit,
    uus.system
    
FROM onboarding_users ou
LEFT JOIN user_profile_basic upb ON ou.id = upb.user_id
LEFT JOIN user_activity_diet uad ON ou.id = uad.user_id
LEFT JOIN user_psychology_profile upp ON ou.id = upp.user_id
LEFT JOIN user_unit_settings uus ON ou.id = uus.user_id
WHERE ou.email_id = '2025052708443239565@nutrichecker.top';

-- 2. Получение всех препятствий пользователя
SELECT 
    ou.email_id,
    uc.challenge,
    uc.created_at
FROM onboarding_users ou
JOIN user_challenges uc ON ou.id = uc.user_id
WHERE ou.email_id = '2025052708443239565@nutrichecker.top';

-- 3. Статистика по завершению онбординга
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM onboarding_users 
GROUP BY status;

-- 4. Конверсия от старта до paywall
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_started,
    COUNT(paywall_reached_at) as reached_paywall,
    ROUND(COUNT(paywall_reached_at) * 100.0 / COUNT(*), 2) as paywall_conversion_rate
FROM onboarding_users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 5. Популярные цели пользователей
SELECT 
    upb.primary_goal,
    COUNT(*) as count,
    ROUND(AVG(upb.current_weight), 1) as avg_current_weight,
    ROUND(AVG(upb.goal_weight), 1) as avg_goal_weight
FROM user_profile_basic upb
JOIN onboarding_users ou ON upb.user_id = ou.id
WHERE ou.status = 'completed'
GROUP BY upb.primary_goal
ORDER BY count DESC;

-- 6. Анализ препятствий по полу
SELECT 
    upb.gender,
    uc.challenge,
    COUNT(*) as count
FROM user_profile_basic upb
JOIN user_challenges uc ON upb.user_id = uc.user_id
JOIN onboarding_users ou ON upb.user_id = ou.id
WHERE ou.status = 'completed'
GROUP BY upb.gender, uc.challenge
ORDER BY upb.gender, count DESC;

-- 7. Средний уровень уверенности по возрастным группам
SELECT 
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(upb.birthday)) < 25 THEN '18-24'
        WHEN EXTRACT(YEAR FROM AGE(upb.birthday)) < 35 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(upb.birthday)) < 45 THEN '35-44'
        WHEN EXTRACT(YEAR FROM AGE(upb.birthday)) < 55 THEN '45-54'
        ELSE '55+'
    END as age_group,
    ROUND(AVG(upp.confidence_level), 2) as avg_confidence,
    COUNT(*) as count
FROM user_profile_basic upb
JOIN user_psychology_profile upp ON upb.user_id = upp.user_id
JOIN onboarding_users ou ON upb.user_id = ou.id
WHERE ou.status = 'completed'
GROUP BY age_group
ORDER BY age_group;

-- 8. Webhook события и их успешность
SELECT 
    event_type,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN success = true THEN 1 END) as successful,
    ROUND(COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate,
    AVG(response_status) as avg_response_status
FROM webhook_events
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY event_type;

-- 9. Время прохождения онбординга
SELECT 
    ou.email_id,
    ou.created_at,
    ou.paywall_reached_at,
    ou.completed_at,
    EXTRACT(EPOCH FROM (paywall_reached_at - created_at))/60 as minutes_to_paywall,
    EXTRACT(EPOCH FROM (completed_at - created_at))/60 as total_minutes
FROM onboarding_users ou
WHERE ou.completed_at IS NOT NULL
ORDER BY total_minutes DESC
LIMIT 10;

-- 10. Вставка нового пользователя (пример для N8N)
INSERT INTO onboarding_users (email_id, paywall_reached_at, status)
VALUES ('2025052708443239565@nutrichecker.top', NOW(), 'in_progress')
ON CONFLICT (email_id) 
DO UPDATE SET 
    paywall_reached_at = EXCLUDED.paywall_reached_at,
    updated_at = NOW()
RETURNING id;

-- 11. Сохранение основного профиля
INSERT INTO user_profile_basic (
    user_id, birthday, gender, height, current_weight, goal_weight, 
    weight_loss_rate, primary_goal
) VALUES (
    (SELECT id FROM onboarding_users WHERE email_id = '2025052708443239565@nutrichecker.top'),
    '1992-06-15', 'male', 176, 75.0, 70.0, 0.5, 'lose-weight'
) ON CONFLICT (user_id) 
DO UPDATE SET 
    birthday = EXCLUDED.birthday,
    gender = EXCLUDED.gender,
    height = EXCLUDED.height,
    current_weight = EXCLUDED.current_weight,
    goal_weight = EXCLUDED.goal_weight,
    weight_loss_rate = EXCLUDED.weight_loss_rate,
    primary_goal = EXCLUDED.primary_goal,
    updated_at = NOW();

-- 12. Сохранение препятствий пользователя
INSERT INTO user_challenges (user_id, challenge)
SELECT 
    (SELECT id FROM onboarding_users WHERE email_id = '2025052708443239565@nutrichecker.top'),
    unnest(ARRAY['emotional-eating', 'busy-schedule', 'stress'])
ON CONFLICT (user_id, challenge) DO NOTHING;

-- 13. Логирование webhook события
INSERT INTO webhook_events (
    user_id, event_type, webhook_url, payload, response_status, success
) VALUES (
    (SELECT id FROM onboarding_users WHERE email_id = '2025052708443239565@nutrichecker.top'),
    'paywall_reached',
    'https://your-webhook.com/onboarding',
    '{"user": {"emailId": "2025052708443239565@nutrichecker.top"}, "event": {"type": "paywall_reached"}}'::jsonb,
    200,
    true
);

-- 14. Очистка старых данных (для обслуживания)
DELETE FROM onboarding_users 
WHERE created_at < CURRENT_DATE - INTERVAL '1 year' 
AND status = 'abandoned';

-- 15. Поиск пользователей с похожими профилями
SELECT 
    ou2.email_id,
    upb2.gender,
    upb2.current_weight,
    upb2.goal_weight,
    uad2.activity_level,
    uad2.diet_preference
FROM onboarding_users ou1
JOIN user_profile_basic upb1 ON ou1.id = upb1.user_id
JOIN user_activity_diet uad1 ON ou1.id = uad1.user_id
JOIN user_profile_basic upb2 ON upb1.gender = upb2.gender 
    AND ABS(upb1.current_weight - upb2.current_weight) < 5
    AND upb1.primary_goal = upb2.primary_goal
JOIN user_activity_diet uad2 ON upb2.user_id = uad2.user_id 
    AND uad1.activity_level = uad2.activity_level
JOIN onboarding_users ou2 ON upb2.user_id = ou2.id
WHERE ou1.email_id = '2025052708443239565@nutrichecker.top'
AND ou2.email_id != ou1.email_id
AND ou2.status = 'completed'
LIMIT 5; 
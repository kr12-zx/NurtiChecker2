-- Схема базы данных для онбординга NutriChecker
-- Создает таблицы для хранения всех данных, собираемых в процессе онбординга

-- Основная таблица пользователей онбординга
CREATE TABLE IF NOT EXISTS onboarding_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id TEXT UNIQUE NOT NULL, -- Уникальный ID пользователя (email-like format)
    mailid TEXT, -- Связь с таблицей profiles
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, paywall_reached, completed, abandoned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    paywall_reached BOOLEAN DEFAULT FALSE,
    paywall_reached_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Основные антропометрические данные
CREATE TABLE user_profile_basic (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    birthday DATE NOT NULL,
    gender VARCHAR(50) NOT NULL, -- female, male, non-binary, prefer-not-to-say
    height INTEGER NOT NULL, -- в см
    current_weight DECIMAL(5,2) NOT NULL, -- в кг
    goal_weight DECIMAL(5,2) NOT NULL, -- в кг
    weight_loss_rate DECIMAL(3,2) NOT NULL, -- кг/неделю
    primary_goal VARCHAR(50) NOT NULL, -- lose-weight, maintain-weight, gain-muscle, improve-health, track-nutrition
    primary_goal_custom TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Настройки единиц измерения
CREATE TABLE user_unit_settings (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    weight_unit VARCHAR(10) NOT NULL DEFAULT 'kg', -- kg, lb
    height_unit VARCHAR(10) NOT NULL DEFAULT 'cm', -- cm, ft
    system VARCHAR(20) NOT NULL DEFAULT 'metric', -- metric, imperial
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Активность и диета
CREATE TABLE user_activity_diet (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    activity_level VARCHAR(50) NOT NULL, -- sedentary, lightly-active, moderately-active, very-active, extremely-active
    diet_preference VARCHAR(50) NOT NULL, -- standard, vegetarian, vegan, low-carb, keto, paleo, mediterranean
    meal_frequency VARCHAR(50) NOT NULL, -- 2-meals, 3-meals, 4-meals, 5-meals, 6-meals, intermittent
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- План похудения и упражнения
CREATE TABLE user_weight_loss_plan (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    weight_loss_plan VARCHAR(50) NULL, -- steady, aggressive, etc.
    exercise_intent BOOLEAN DEFAULT FALSE,
    show_calorie_tutorial BOOLEAN DEFAULT TRUE,
    use_flexible_calories BOOLEAN DEFAULT FALSE,
    intermittent_fasting BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Питание и фокус
CREATE TABLE user_nutrition_focus (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    nutrition_focus VARCHAR(50) NULL, -- balanced, protein-focused, etc.
    food_preferences VARCHAR(50) NULL, -- taste, health, convenience
    food_variety VARCHAR(50) NULL, -- always, sometimes, rarely
    meal_feelings VARCHAR(50) NULL, -- energized, satisfied, tired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Психологический профиль
CREATE TABLE user_psychology_profile (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    stress_response VARCHAR(50) NULL, -- emotional-eating, exercise, etc.
    adaptability VARCHAR(50) NULL, -- adapt-quickly, adapt-time, struggle
    challenges_view VARCHAR(50) NULL, -- growth-opportunity, necessary-evil, avoid
    setbacks_response VARCHAR(50) NULL, -- bounce-back, take-time, struggle
    decision_making VARCHAR(50) NULL, -- confident, confident-doubt, uncertain
    difficult_situations_handling VARCHAR(50) NULL, -- cope-well, cope-most, struggle
    temptation_response VARCHAR(50) NULL, -- always-control, usually-control, sometimes-control, rarely-control
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Препятствия и вызовы (многие ко многим)
CREATE TABLE user_challenges (
    user_id UUID REFERENCES onboarding_users(id) ON DELETE CASCADE,
    challenge VARCHAR(50) NOT NULL, -- emotional-eating, busy-schedule, lack-of-motivation, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, challenge)
);

-- Медицинская информация и препятствия
CREATE TABLE user_medical_obstacles (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    medication_use VARCHAR(50) NULL, -- not-using, using-some, using-many
    main_obstacle VARCHAR(50) NULL, -- emotional-eating, time-constraints, etc.
    eating_habits_assessment VARCHAR(50) NULL, -- excellent, good, improving, poor
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Рассчитанные значения калорий и макронутриентов
CREATE TABLE user_calculated_values (
    user_id UUID PRIMARY KEY REFERENCES onboarding_users(id) ON DELETE CASCADE,
    bmr DECIMAL(7,2) NULL, -- Базовый метаболизм
    tdee DECIMAL(7,2) NULL, -- Общий дневной расход энергии
    calorie_target DECIMAL(7,2) NULL, -- Целевые калории
    protein_target DECIMAL(6,2) NULL, -- Целевой белок (г)
    fat_target DECIMAL(6,2) NULL, -- Целевые жиры (г)
    carb_target DECIMAL(6,2) NULL, -- Целевые углеводы (г)
    goal_date DATE NULL, -- Ожидаемая дата достижения цели
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Логи прохождения онбординга (для аналитики)
CREATE TABLE onboarding_steps_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES onboarding_users(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL,
    data_collected JSONB NULL, -- Данные, собранные на этом шаге
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook события
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES onboarding_users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- paywall_reached, onboarding_completed, etc.
    webhook_url VARCHAR(500) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER NULL,
    response_body TEXT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT FALSE
);

-- Индексы для оптимизации
CREATE INDEX idx_onboarding_users_email_id ON onboarding_users(email_id);
CREATE INDEX idx_onboarding_users_status ON onboarding_users(status);
CREATE INDEX idx_onboarding_users_created_at ON onboarding_users(created_at);
CREATE INDEX idx_onboarding_steps_log_user_id ON onboarding_steps_log(user_id);
CREATE INDEX idx_onboarding_steps_log_step_number ON onboarding_steps_log(step_number);
CREATE INDEX idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_user_profile_basic_updated_at BEFORE UPDATE ON user_profile_basic FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_activity_diet_updated_at BEFORE UPDATE ON user_activity_diet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_weight_loss_plan_updated_at BEFORE UPDATE ON user_weight_loss_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nutrition_focus_updated_at BEFORE UPDATE ON user_nutrition_focus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_psychology_profile_updated_at BEFORE UPDATE ON user_psychology_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_medical_obstacles_updated_at BEFORE UPDATE ON user_medical_obstacles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_calculated_values_updated_at BEFORE UPDATE ON user_calculated_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_users_updated_at BEFORE UPDATE ON onboarding_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE onboarding_users IS 'Основная таблица пользователей онбординга с email-подобными ID';
COMMENT ON TABLE user_profile_basic IS 'Базовые антропометрические данные пользователя';
COMMENT ON TABLE user_unit_settings IS 'Настройки единиц измерения (метрическая/имперская система)';
COMMENT ON TABLE user_activity_diet IS 'Данные об активности и диетических предпочтениях';
COMMENT ON TABLE user_weight_loss_plan IS 'План похудения и настройки упражнений';
COMMENT ON TABLE user_nutrition_focus IS 'Фокус на питании и пищевые предпочтения';
COMMENT ON TABLE user_psychology_profile IS 'Психологический профиль пользователя';
COMMENT ON TABLE user_challenges IS 'Препятствия и вызовы пользователя (связь многие ко многим)';
COMMENT ON TABLE user_medical_obstacles IS 'Медицинская информация и основные препятствия';
COMMENT ON TABLE user_calculated_values IS 'Рассчитанные значения калорий и макронутриентов';
COMMENT ON TABLE onboarding_steps_log IS 'Лог прохождения шагов онбординга для аналитики';
COMMENT ON TABLE webhook_events IS 'Лог отправки webhook событий'; 
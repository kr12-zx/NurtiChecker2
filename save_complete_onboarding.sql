-- Функция для сохранения полных данных онбординга пользователя
-- Принимает JSON с всеми данными и сохраняет их в соответствующие таблицы

CREATE OR REPLACE FUNCTION save_complete_onboarding_data(
    p_email_id VARCHAR(255),
    p_onboarding_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_challenge TEXT;
BEGIN
    -- 1. Создаем или обновляем основную запись пользователя
    INSERT INTO onboarding_users (email_id, paywall_reached_at, status)
    VALUES (
        p_email_id, 
        CASE 
            WHEN (p_onboarding_data->>'event_type') = 'paywall_reached' THEN NOW()
            ELSE NULL
        END,
        CASE 
            WHEN (p_onboarding_data->>'event_type') = 'onboarding_completed' THEN 'completed'
            WHEN (p_onboarding_data->>'event_type') = 'paywall_reached' THEN 'in_progress'
            ELSE 'in_progress'
        END
    )
    ON CONFLICT (email_id) 
    DO UPDATE SET 
        paywall_reached_at = CASE 
            WHEN (p_onboarding_data->>'event_type') = 'paywall_reached' AND EXCLUDED.paywall_reached_at IS NULL 
            THEN NOW()
            ELSE onboarding_users.paywall_reached_at
        END,
        completed_at = CASE 
            WHEN (p_onboarding_data->>'event_type') = 'onboarding_completed' 
            THEN NOW()
            ELSE onboarding_users.completed_at
        END,
        status = CASE 
            WHEN (p_onboarding_data->>'event_type') = 'onboarding_completed' THEN 'completed'
            WHEN (p_onboarding_data->>'event_type') = 'paywall_reached' AND onboarding_users.status = 'in_progress' THEN 'in_progress'
            ELSE onboarding_users.status
        END,
        updated_at = NOW()
    RETURNING id INTO v_user_id;

    -- 2. Сохраняем основные антропометрические данные
    INSERT INTO user_profile_basic (
        user_id, birthday, gender, height, current_weight, goal_weight, 
        weight_loss_rate, primary_goal, primary_goal_custom
    ) VALUES (
        v_user_id,
        COALESCE((p_onboarding_data->'profile'->>'birthday')::DATE, '1990-01-01'),
        COALESCE(p_onboarding_data->'profile'->>'gender', 'prefer-not-to-say'),
        COALESCE((p_onboarding_data->'profile'->>'height')::INTEGER, 170),
        COALESCE((p_onboarding_data->'profile'->>'currentWeight')::DECIMAL, 70.0),
        COALESCE((p_onboarding_data->'profile'->>'goalWeight')::DECIMAL, 65.0),
        COALESCE((p_onboarding_data->'profile'->>'weightLossRate')::DECIMAL, 0.5),
        COALESCE(p_onboarding_data->'profile'->>'primaryGoal', 'lose-weight'),
        p_onboarding_data->'profile'->>'primaryGoalCustom'
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        birthday = EXCLUDED.birthday,
        gender = EXCLUDED.gender,
        height = EXCLUDED.height,
        current_weight = EXCLUDED.current_weight,
        goal_weight = EXCLUDED.goal_weight,
        weight_loss_rate = EXCLUDED.weight_loss_rate,
        primary_goal = EXCLUDED.primary_goal,
        primary_goal_custom = EXCLUDED.primary_goal_custom,
        updated_at = NOW();

    -- 3. Сохраняем настройки единиц измерения
    INSERT INTO user_unit_settings (
        user_id, weight_unit, height_unit, system
    ) VALUES (
        v_user_id,
        COALESCE(p_onboarding_data->'settings'->>'weightUnit', 'kg'),
        COALESCE(p_onboarding_data->'settings'->>'heightUnit', 'cm'),
        COALESCE(p_onboarding_data->'settings'->>'system', 'metric')
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        weight_unit = EXCLUDED.weight_unit,
        height_unit = EXCLUDED.height_unit,
        system = EXCLUDED.system;

    -- 4. Сохраняем данные об активности и диете
    INSERT INTO user_activity_diet (
        user_id, activity_level, diet_preference, meal_frequency
    ) VALUES (
        v_user_id,
        COALESCE(p_onboarding_data->'profile'->>'activityLevel', 'moderately-active'),
        COALESCE(p_onboarding_data->'profile'->>'dietPreference', 'standard'),
        COALESCE(p_onboarding_data->'profile'->>'mealFrequency', '3-meals')
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        activity_level = EXCLUDED.activity_level,
        diet_preference = EXCLUDED.diet_preference,
        meal_frequency = EXCLUDED.meal_frequency,
        updated_at = NOW();

    -- 5. Сохраняем план похудения и упражнения
    INSERT INTO user_weight_loss_plan (
        user_id, weight_loss_plan, exercise_intent, show_calorie_tutorial, 
        use_flexible_calories, intermittent_fasting
    ) VALUES (
        v_user_id,
        p_onboarding_data->'profile'->>'weightLossPlan',
        COALESCE((p_onboarding_data->'profile'->>'exerciseIntent')::BOOLEAN, false),
        COALESCE((p_onboarding_data->'profile'->>'showCalorieTutorial')::BOOLEAN, true),
        COALESCE((p_onboarding_data->'profile'->>'useFlexibleCalories')::BOOLEAN, false),
        COALESCE((p_onboarding_data->'profile'->>'intermittentFasting')::BOOLEAN, false)
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        weight_loss_plan = EXCLUDED.weight_loss_plan,
        exercise_intent = EXCLUDED.exercise_intent,
        show_calorie_tutorial = EXCLUDED.show_calorie_tutorial,
        use_flexible_calories = EXCLUDED.use_flexible_calories,
        intermittent_fasting = EXCLUDED.intermittent_fasting,
        updated_at = NOW();

    -- 6. Сохраняем фокус на питании
    INSERT INTO user_nutrition_focus (
        user_id, nutrition_focus, food_preferences, food_variety, meal_feelings
    ) VALUES (
        v_user_id,
        p_onboarding_data->'profile'->>'nutritionFocus',
        p_onboarding_data->'profile'->>'foodPreferences',
        p_onboarding_data->'profile'->>'foodVariety',
        p_onboarding_data->'profile'->>'mealFeelings'
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        nutrition_focus = EXCLUDED.nutrition_focus,
        food_preferences = EXCLUDED.food_preferences,
        food_variety = EXCLUDED.food_variety,
        meal_feelings = EXCLUDED.meal_feelings,
        updated_at = NOW();

    -- 7. Сохраняем психологический профиль
    INSERT INTO user_psychology_profile (
        user_id, confidence_level, stress_response, adaptability, challenges_view,
        setbacks_response, decision_making, difficult_situations_handling, temptation_response
    ) VALUES (
        v_user_id,
        COALESCE((p_onboarding_data->'profile'->>'confidenceLevel')::INTEGER, 3),
        p_onboarding_data->'profile'->>'stressResponse',
        p_onboarding_data->'profile'->>'adaptability',
        p_onboarding_data->'profile'->>'challengesView',
        p_onboarding_data->'profile'->>'setbacksResponse',
        p_onboarding_data->'profile'->>'decisionMaking',
        p_onboarding_data->'profile'->>'difficultSituationsHandling',
        p_onboarding_data->'profile'->>'temptationResponse'
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        confidence_level = EXCLUDED.confidence_level,
        stress_response = EXCLUDED.stress_response,
        adaptability = EXCLUDED.adaptability,
        challenges_view = EXCLUDED.challenges_view,
        setbacks_response = EXCLUDED.setbacks_response,
        decision_making = EXCLUDED.decision_making,
        difficult_situations_handling = EXCLUDED.difficult_situations_handling,
        temptation_response = EXCLUDED.temptation_response,
        updated_at = NOW();

    -- 8. Сохраняем медицинскую информацию
    INSERT INTO user_medical_obstacles (
        user_id, medication_use, main_obstacle, eating_habits_assessment
    ) VALUES (
        v_user_id,
        p_onboarding_data->'profile'->>'medicationUse',
        p_onboarding_data->'profile'->>'mainObstacle',
        p_onboarding_data->'profile'->>'eatingHabitsAssessment'
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        medication_use = EXCLUDED.medication_use,
        main_obstacle = EXCLUDED.main_obstacle,
        eating_habits_assessment = EXCLUDED.eating_habits_assessment,
        updated_at = NOW();

    -- 9. Удаляем старые препятствия и добавляем новые
    DELETE FROM user_challenges WHERE user_id = v_user_id;
    
    -- Добавляем препятствия из массива challenges
    IF p_onboarding_data->'profile'->'challenges' IS NOT NULL THEN
        FOR v_challenge IN SELECT jsonb_array_elements_text(p_onboarding_data->'profile'->'challenges')
        LOOP
            INSERT INTO user_challenges (user_id, challenge)
            VALUES (v_user_id, v_challenge)
            ON CONFLICT (user_id, challenge) DO NOTHING;
        END LOOP;
    END IF;

    -- 10. Сохраняем рассчитанные значения (если есть)
    INSERT INTO user_calculated_values (
        user_id, bmr, tdee, calorie_target, protein_target, fat_target, carb_target, goal_date
    ) VALUES (
        v_user_id,
        (p_onboarding_data->'profile'->>'bmr')::DECIMAL,
        (p_onboarding_data->'profile'->>'tdee')::DECIMAL,
        (p_onboarding_data->'profile'->>'calorieTarget')::DECIMAL,
        (p_onboarding_data->'profile'->>'proteinTarget')::DECIMAL,
        (p_onboarding_data->'profile'->>'fatTarget')::DECIMAL,
        (p_onboarding_data->'profile'->>'carbTarget')::DECIMAL,
        (p_onboarding_data->'profile'->>'goalDate')::DATE
    ) ON CONFLICT (user_id) 
    DO UPDATE SET 
        bmr = EXCLUDED.bmr,
        tdee = EXCLUDED.tdee,
        calorie_target = EXCLUDED.calorie_target,
        protein_target = EXCLUDED.protein_target,
        fat_target = EXCLUDED.fat_target,
        carb_target = EXCLUDED.carb_target,
        goal_date = EXCLUDED.goal_date,
        updated_at = NOW();

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Функция для простого вызова с webhook данными
CREATE OR REPLACE FUNCTION process_onboarding_webhook(
    webhook_payload JSONB
) RETURNS TABLE(
    user_id UUID,
    email_id VARCHAR(255),
    event_type VARCHAR(50),
    success BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_email_id VARCHAR(255);
    v_event_type VARCHAR(50);
BEGIN
    -- Извлекаем основные данные из webhook
    v_email_id := webhook_payload->'user'->>'emailId';
    v_event_type := webhook_payload->'event'->>'type';
    
    -- Сохраняем данные онбординга
    v_user_id := save_complete_onboarding_data(v_email_id, webhook_payload);
    
    -- Логируем webhook событие
    INSERT INTO webhook_events (
        user_id, event_type, webhook_url, payload, response_status, success
    ) VALUES (
        v_user_id,
        v_event_type,
        'webhook_processed',
        webhook_payload,
        200,
        true
    );
    
    -- Возвращаем результат
    RETURN QUERY SELECT v_user_id, v_email_id, v_event_type, true;
END;
$$ LANGUAGE plpgsql;

-- Пример использования функций:

-- 1. Прямое сохранение данных
/*
SELECT save_complete_onboarding_data(
    '2025052708443239565@nutrichecker.top',
    '{
        "user": {"emailId": "2025052708443239565@nutrichecker.top"},
        "profile": {
            "birthday": "1992-06-15",
            "gender": "male",
            "height": 176,
            "currentWeight": 75,
            "goalWeight": 70,
            "primaryGoal": "lose-weight",
            "challenges": ["emotional-eating", "busy-schedule"]
        },
        "settings": {"weightUnit": "kg", "heightUnit": "cm", "system": "metric"},
        "event": {"type": "paywall_reached"}
    }'::jsonb
);
*/

-- 2. Обработка webhook payload
/*
SELECT * FROM process_onboarding_webhook(
    '{
        "user": {"emailId": "2025052708443239565@nutrichecker.top"},
        "profile": {...},
        "settings": {...},
        "event": {"type": "paywall_reached"}
    }'::jsonb
);
*/ 
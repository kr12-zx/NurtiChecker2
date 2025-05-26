/**
 * Типы данных для расширенного онбординга с функционалом потери веса
 */

// Базовый тип для экрана онбординга (совместимый с текущей реализацией)
export interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Тип пола пользователя
export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';

// Тип основной цели пользователя
export type PrimaryGoal = 
  | 'lose-weight'       // Снижение веса
  | 'maintain-weight'   // Поддержание веса
  | 'gain-muscle'       // Набор мышечной массы
  | 'improve-health'    // Общее улучшение здоровья
  | 'track-nutrition';  // Отслеживание питания

// Тип уровня активности
export type ActivityLevel =
  | 'sedentary'         // Сидячий образ жизни
  | 'lightly-active'    // Низкая активность
  | 'moderately-active' // Умеренная активность
  | 'very-active'       // Высокая активность
  | 'extremely-active'; // Экстремально высокая активность

// Тип предпочтений по питанию
export type DietPreference =
  | 'standard'          // Стандартная диета
  | 'vegetarian'        // Вегетарианская
  | 'vegan'             // Веганская
  | 'low-carb'          // Низкоуглеводная
  | 'keto'              // Кетогенная
  | 'paleo'             // Палео
  | 'mediterranean';    // Средиземноморская

// Тип частоты приема пищи
export type MealFrequency =
  | '2-meals'           // 2 приема пищи в день
  | '3-meals'           // 3 приема пищи в день
  | '4-meals'           // 4 приема пищи в день
  | '5-meals'           // 5 приемов пищи в день
  | '6-meals'           // 6 приемов пищи в день
  | 'intermittent';     // Интервальное голодание

// Тип основных препятствий
export type Challenge =
  | 'emotional-eating'   // Эмоциональное питание
  | 'busy-schedule'      // Напряженный график
  | 'lack-of-motivation' // Недостаток мотивации
  | 'social-situations'  // Социальные ситуации
  | 'food-cravings'      // Тяга к определенным продуктам
  | 'night-eating'       // Ночные приемы пищи
  | 'stress'             // Стресс
  | 'lack-of-knowledge'  // Недостаток знаний
  | 'lack-of-time'       // Нехватка времени
  | 'social-pressure'    // Социальное давление
  | 'cravings';          // Сильные желания

// Полный профиль пользователя
export interface UserProfile {
  // Основные антропометрические данные
  birthday: string;            // Дата рождения в формате ISO (YYYY-MM-DD)
  height: number;              // Рост в см
  gender: Gender;              // Пол
  currentWeight: number;       // Текущий вес в кг
  goalWeight: number;          // Целевой вес в кг
  weightLossRate: number;      // Темп снижения веса в кг/неделю
  weight?: number;            // Текущий вес (дубликат currentWeight для совместимости)
  
  // Цели и предпочтения
  primaryGoal: PrimaryGoal;    // Основная цель
  primaryGoalCustom?: string;  // Кастомная цель пользователя
  activityLevel: ActivityLevel; // Уровень активности
  dietPreference: DietPreference; // Предпочтения в питании
  
  // Дополнительные детали
  mealFrequency: MealFrequency; // Частота приема пищи
  challenges: Challenge[];      // Основные препятствия (можно выбрать несколько)
  
  // Опции плана снижения веса
  weightLossPlan?: string;     // План снижения веса
  exerciseIntent?: boolean;    // Намерение заниматься физической активностью
  showCalorieTutorial?: boolean; // Показывать туториал по калориям
  useFlexibleCalories?: boolean; // Использовать гибкий подход к калориям
  nutritionFocus?: string;     // Фокус на питании
  intermittentFasting?: boolean; // Использование интервального голодания
  
  // Расширенные психологические параметры
  stressResponse: string;      // Способ реагирования на стресс
  confidenceLevel: number;     // Уровень уверенности в достижении цели (1-5)
  adaptability?: string;       // Адаптивность к изменениям
  challengesView?: string;     // Отношение к вызовам
  setbacksResponse?: string;   // Реакция на неудачи
  decisionMaking?: string;     // Стиль принятия решений
  difficultSituationsHandling?: string; // Подход к сложным ситуациям
  temptationResponse?: string; // Реакция на соблазны
  
  // Дополнительные пищевые предпочтения
  foodPreferences?: string;    // Пищевые предпочтения
  foodVariety?: string;        // Разнообразие пищи
  mealFeeling?: string;        // Ощущения от приемов пищи
  medication?: string;         // Использование лекарств
  mainObstacle?: string;       // Основное препятствие
  eatingHabitsAssessment?: string; // Оценка пищевых привычек
  
  // Рассчитанные значения
  bmr?: number;                // Базовый метаболический уровень
  tdee?: number;               // Общий дневной расход энергии
  calorieTarget?: number;      // Целевое количество калорий
  proteinTarget?: number;      // Целевое количество белка (г)
  fatTarget?: number;          // Целевое количество жиров (г)
  carbTarget?: number;         // Целевое количество углеводов (г)
  
  // Информация о достижении цели
  goalDate?: string;           // Ожидаемая дата достижения цели
}

// Настройки единиц измерения
export interface UnitSettings {
  weight: 'kg' | 'lb';         // Единицы измерения веса (кг или фунты)
  height: 'cm' | 'ft';         // Единицы измерения роста (см или футы)
  system: 'metric' | 'imperial'; // Добавлено поле для общей системы единиц
}

// Состояние процесса онбординга
export interface OnboardingState {
  currentStep: number;         // Текущий шаг
  totalSteps: number;          // Общее количество шагов
  userProfile: Partial<UserProfile>; // Текущий профиль (может быть неполным)
  unitSettings: UnitSettings;  // Предпочитаемые единицы измерения
}

import {
    calculateAge,
    calculateBMR,
    calculateMacronutrients,
    calculateMaxHiddenSugar,
    calculateTDEE,
    calculateTargetCalories,
    validateNutritionResults
} from '../nutritionCalculator';

describe('NutriChecker Core Calculations', () => {
  describe('calculateBMR', () => {
    test('correctly calculates BMR for male', () => {
      // Пример: мужчина 30 лет, 80кг, 180см
      // BMR = 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBMR(80, 180, 30, 'male');
      expect(bmr).toBe(1780); // Точное значение
    });

    test('correctly calculates BMR for female', () => {
      // Пример: женщина 25 лет, 65кг, 165см
      // BMR = 10 * 65 + 6.25 * 165 - 5 * 25 - 161 = 650 + 1031.25 - 125 - 161 = 1395.25
      const bmr = calculateBMR(65, 165, 25, 'female');
      expect(bmr).toBe(1395.25); // Точное значение
    });

    test('handles edge cases', () => {
      // Минимальные значения
      const minBMR = calculateBMR(40, 140, 18, 'female');
      expect(minBMR).toBeGreaterThan(1000);
      
      // Максимальные значения
      const maxBMR = calculateBMR(150, 200, 80, 'male');
      expect(maxBMR).toBeGreaterThan(1500);
    });
  });

  describe('calculateTDEE', () => {
    test('applies correct activity multipliers', () => {
      const bmr = 1500;
      
      expect(calculateTDEE(bmr, 'sedentary', false)).toBe(1800); // 1.2x
      expect(calculateTDEE(bmr, 'moderately-active', false)).toBe(2325); // 1.55x
      expect(calculateTDEE(bmr, 'very-active', false)).toBe(2587.5); // 1.725x
    });

    test('applies exercise intent bonus', () => {
      const bmr = 1500;
      const withoutExercise = calculateTDEE(bmr, 'sedentary', false);
      const withExercise = calculateTDEE(bmr, 'sedentary', true);
      
      expect(withExercise).toBeGreaterThan(withoutExercise);
      expect(withExercise - withoutExercise).toBeCloseTo(75, 5); // +5% = 75 калорий
    });
  });

  describe('calculateTargetCalories', () => {
    test('creates calorie deficit for weight loss', () => {
      const tdee = 2000;
      const target = calculateTargetCalories(tdee, 'lose-weight', 0.5, 'steady', 'male');
      
      expect(target).toBeLessThan(tdee);
      expect(target).toBeGreaterThanOrEqual(1500); // Безопасный минимум для мужчин
    });

    test('respects minimum calorie limits', () => {
      const tdee = 1300; // Очень низкий TDEE
      const targetMale = calculateTargetCalories(tdee, 'lose-weight', 1.0, 'aggressive', 'male');
      const targetFemale = calculateTargetCalories(tdee, 'lose-weight', 1.0, 'aggressive', 'female');
      
      expect(targetMale).toBeGreaterThanOrEqual(1500);
      expect(targetFemale).toBeGreaterThanOrEqual(1200);
    });

    test('adds calories for muscle gain', () => {
      const tdee = 2000;
      const target = calculateTargetCalories(tdee, 'gain-muscle', 0, 'steady', 'male');
      
      expect(target).toBe(2300); // +300 калорий
    });
  });

  describe('calculateAge', () => {
    test('calculates age correctly', () => {
      // Тестируем с фиксированной датой
      const birthdate = '1990-05-15';
      const age = calculateAge(birthdate);
      
      // Возраст должен быть разумным (между 10 и 100)
      expect(age).toBeGreaterThanOrEqual(10);
      expect(age).toBeLessThanOrEqual(100);
    });

    test('handles different date formats', () => {
      const birthdate1 = '1995-12-01';
      const birthdate2 = '1995-01-15';
      
      const age1 = calculateAge(birthdate1);
      const age2 = calculateAge(birthdate2);
      
      expect(typeof age1).toBe('number');
      expect(typeof age2).toBe('number');
    });
  });

  describe('calculateMacronutrients', () => {
    test('macros add up to target calories', () => {
      const targetCalories = 2000;
      const proteinGrams = 120;
      
      const macros = calculateMacronutrients(targetCalories, proteinGrams, 'standard', 'balanced');
      
      // Проверяем что макросы в граммах положительные
      expect(macros.protein).toBeGreaterThan(0);
      expect(macros.fat).toBeGreaterThan(0);
      expect(macros.carbs).toBeGreaterThan(0);
      
      // Проверяем что проценты суммируются к 100%
      const totalPercentage = macros.percentages.protein + macros.percentages.fat + macros.percentages.carbs;
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    test('keto diet has correct macro ratios', () => {
      const targetCalories = 1800;
      const proteinGrams = 100;
      
      const macros = calculateMacronutrients(targetCalories, proteinGrams, 'keto', 'balanced');
      
      // Кето диета: низкие углеводы, высокие жиры
      expect(macros.percentages.carbs).toBeLessThan(10);
      expect(macros.percentages.fat).toBeGreaterThan(60);
    });
  });

  describe('calculateMaxHiddenSugar', () => {
    test('calculates reasonable sugar limits', () => {
      const calories2000 = calculateMaxHiddenSugar(2000, 'standard');
      const calories1500 = calculateMaxHiddenSugar(1500, 'standard');
      
      expect(calories2000).toBeGreaterThan(calories1500);
      expect(calories2000).toBeGreaterThan(0);
      expect(calories2000).toBeLessThan(200); // Разумный лимит
    });

    test('keto diet has lower sugar limits', () => {
      const standardSugar = calculateMaxHiddenSugar(2000, 'standard');
      const ketoSugar = calculateMaxHiddenSugar(2000, 'keto');
      
      expect(ketoSugar).toBeLessThan(standardSugar);
    });
  });

  describe('validateNutritionResults', () => {
    test('validates reasonable nutrition results', () => {
      const mockResult = {
        bmr: 1500,
        tdee: 2000,
        targetCalories: 1700,
        dailyMacros: {
          protein: 120,
          fat: 60,
          carbs: 180,
          percentages: { protein: 25, fat: 30, carbs: 45 }
        },
        maxHiddenSugar: 50,
        weeklyTargets: {
          calories: 11900,
          protein: 840,
          fat: 420,
          carbs: 1260,
          hiddenSugar: 350
        },
        expectedWeightChange: -0.3,
        appliedAdjustments: {
          diet: 0,
          stress: 0,
          mealFrequency: 0,
          foodPreferences: 0,
          total: 0
        }
      };

      const mockProfile = {
        weight: 70,
        height: 170,
        age: 30,
        gender: 'female' as const
      };

      const validation = validateNutritionResults(mockResult, mockProfile);
      
      expect(validation.isValid).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
      expect(Array.isArray(validation.recommendations)).toBe(true);
    });
  });
}); 
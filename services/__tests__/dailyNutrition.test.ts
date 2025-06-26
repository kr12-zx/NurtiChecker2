import {
    formatDateToString,
    getDailyNutrition,
    parseDateString
} from '../dailyNutrition';

// Мокаем AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Daily Nutrition Service', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('formatDateToString', () => {
    test('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDateToString(date);
      
      expect(formatted).toBe('15.01.2024');
    });

    test('handles different dates', () => {
      const date1 = new Date('2024-12-31T23:59:59');
      const date2 = new Date('2024-01-01T00:00:00');
      
      expect(formatDateToString(date1)).toBe('31.12.2024');
      expect(formatDateToString(date2)).toBe('01.01.2024');
    });

    test('pads single digits with zero', () => {
      const date = new Date('2024-05-03T15:00:00');
      const formatted = formatDateToString(date);
      
      expect(formatted).toBe('03.05.2024');
    });
  });

  describe('parseDateString', () => {
    test('parses date string correctly', () => {
      const dateString = '15.01.2024';
      const parsed = parseDateString(dateString);
      
      expect(parsed.getDate()).toBe(15);
      expect(parsed.getMonth()).toBe(0); // Январь = 0
      expect(parsed.getFullYear()).toBe(2024);
    });

    test('handles different date formats', () => {
      const dateString1 = '31.12.2024';
      const dateString2 = '01.01.2025';
      
      const parsed1 = parseDateString(dateString1);
      const parsed2 = parseDateString(dateString2);
      
      expect(parsed1.getDate()).toBe(31);
      expect(parsed1.getMonth()).toBe(11); // Декабрь = 11
      expect(parsed2.getDate()).toBe(1);
      expect(parsed2.getMonth()).toBe(0); // Январь = 0
    });
  });

  describe('getDailyNutrition', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    test('returns empty nutrition data for new date', async () => {
      // Мокаем пустой ответ из AsyncStorage
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      
      const result = await getDailyNutrition('15.01.2024');
      
      expect(result).toEqual({
        date: '15.01.2024',
        caloriesConsumed: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        saturatedFat: 0,
        addedProducts: []
      });
    });

    test('returns existing nutrition data', async () => {
      const mockData = [{
        date: '15.01.2024',
        caloriesConsumed: 500,
        protein: 25,
        fat: 15,
        carbs: 60,
        sugar: 10,
        fiber: 5,
        saturatedFat: 8,
        addedProducts: [{
          productId: 'test-123',
          name: 'Тестовый продукт',
          servingMultiplier: 1.0,
          calories: 500,
          protein: 25,
          fat: 15,
          carbs: 60,
          sugar: 10,
          fiber: 5,
          saturatedFat: 8
        }]
      }];

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));
      
      const result = await getDailyNutrition('15.01.2024');
      
      expect(result?.caloriesConsumed).toBe(500);
      expect(result?.addedProducts).toHaveLength(1);
      expect(result?.addedProducts[0].name).toBe('Тестовый продукт');
    });

    test('uses current date when no date provided', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      
      const result = await getDailyNutrition();
      
      expect(result?.date).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    test('returns empty data on storage errors', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await getDailyNutrition();
      
      // При ошибке возвращает пустую структуру данных, а не null
      expect(result).toBeDefined();
      expect(result?.caloriesConsumed).toBe(0);
      expect(result?.addedProducts).toEqual([]);
    });
  });
}); 
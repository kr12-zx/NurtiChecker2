import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getCaloriesForDate,
    getCurrentCalorieGoal,
    isFirstTimeUser,
    resetFirstTimeUser
} from '../calorieCalculations';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Calorie Calculations', () => {
  beforeEach(async () => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
    // Сбрасываем состояние первого запуска перед каждым тестом
    await resetFirstTimeUser();
  });

  describe('getCaloriesForDate', () => {
    test('returns saved calories for a date', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1500');
      
      const result = await getCaloriesForDate('2024-12-25');
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('daily_calories_2024-12-25');
      expect(result).toBe(1500);
    });

    test('returns 0 when no calories saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await getCaloriesForDate('2024-12-25');
      
      expect(result).toBe(0);
    });

    test('handles storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await getCaloriesForDate('2024-12-25');
      
      expect(result).toBe(0);
    });
  });

  describe('isFirstTimeUser', () => {
    test('returns true for first time user', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await isFirstTimeUser();
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_used_before', 'true');
    });

    test('returns false for returning user', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      
      const result = await isFirstTimeUser();
      
      expect(result).toBe(false);
    });
  });

  describe('getCurrentCalorieGoal', () => {
    test('returns saved calorie goal', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('2000');
      
      const result = await getCurrentCalorieGoal();
      
      expect(result).toBe(2000);
    });

    test('returns default goal when none saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await getCurrentCalorieGoal();
      
      expect(result).toBe(1842);
    });
  });
}); 
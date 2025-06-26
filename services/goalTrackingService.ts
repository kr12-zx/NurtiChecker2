import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeeklyCheckData {
  currentWeight?: number;
  energyLevel: number; // 1-5
  motivationLevel: number; // 1-5
  challenges: string[];
  dietCompliance: number; // 1-5
  exerciseCompliance: number; // 1-5
  sleepQuality: number; // 1-5
  stressLevel: number; // 1-5
  notes: string;
}

export interface SavedWeeklyCheckData extends WeeklyCheckData {
  completedAt: string;
  weeklyProgress?: number;
}

export interface GoalProgress {
  currentWeight: number | undefined;
  targetWeight: number;
  startWeight: number;
  weeklyTarget: number;
  weeksSinceStart: number;
  weeksToGoal: number;
  lastCheckIn: Date;
  needsWeeklyCheck: boolean;
}

// Функции для работы с данными еженедельной проверки
export const saveWeeklyCheckData = async (data: WeeklyCheckData): Promise<void> => {
  try {
    const savedData: SavedWeeklyCheckData = {
      ...data,
      completedAt: new Date().toISOString(),
    };
    
    // Сохраняем текущие данные
    await AsyncStorage.setItem('weekly_check_current', JSON.stringify(savedData));
    
    // Также добавляем в историю
    const historyKey = `weekly_check_history_${new Date().getFullYear()}_${new Date().getMonth() + 1}`;
    const existingHistory = await AsyncStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(savedData);
    await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    
    console.log('✅ Weekly check data saved successfully');
  } catch (error) {
    console.error('❌ Error saving weekly check data:', error);
    throw error;
  }
};

export const getLatestWeeklyCheckData = async (): Promise<SavedWeeklyCheckData | null> => {
  try {
    const data = await AsyncStorage.getItem('weekly_check_current');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error loading weekly check data:', error);
    return null;
  }
};

export const getWeeklyCheckHistory = async (year: number, month: number): Promise<SavedWeeklyCheckData[]> => {
  try {
    const historyKey = `weekly_check_history_${year}_${month}`;
    const data = await AsyncStorage.getItem(historyKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error loading weekly check history:', error);
    return [];
  }
};

// Функции для работы с целями
export const saveGoalSettings = async (goals: Partial<GoalProgress>): Promise<void> => {
  try {
    await AsyncStorage.setItem('goal_settings', JSON.stringify(goals));
    console.log('✅ Goal settings saved successfully');
  } catch (error) {
    console.error('❌ Error saving goal settings:', error);
    throw error;
  }
};

export const getGoalSettings = async (): Promise<Partial<GoalProgress> | null> => {
  try {
    const data = await AsyncStorage.getItem('goal_settings');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error loading goal settings:', error);
    return null;
  }
}; 
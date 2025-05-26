import AsyncStorage from '@react-native-async-storage/async-storage';

// Интерфейс для продукта в истории сканирований
export interface ScanHistoryItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar?: number; // Скрытый сахар в продукте (граммы)
  image?: string;
  date: string;
  timestamp: number; // Unix timestamp для сортировки
  scanDate: string; // форматированная дата для отображения
  fullData?: string; // JSON-строка с полными данными анализа от n8n
}

// Ключ для хранения в AsyncStorage
const SCAN_HISTORY_KEY = '@nutrichecker:scan_history';

/**
 * Сохраняет новый элемент в историю сканирований
 */
export const saveScanToHistory = async (scanData: Omit<ScanHistoryItem, 'id' | 'date' | 'timestamp' | 'scanDate'>): Promise<ScanHistoryItem> => {
  try {
    // Генерируем уникальный ID и текущую дату
    const id = Date.now().toString();
    const now = new Date();
    const timestamp = now.getTime();
    
    // Форматируем время (HH:MM)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Форматируем дату (DD.MM.YYYY)
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const scanDate = `${day}.${month}.${year}`;
    
    // Создаем новый элемент истории
    const newItem: ScanHistoryItem = {
      ...scanData,
      id,
      date: timeString,
      timestamp,
      scanDate
    };
    
    // Получаем текущую историю
    const currentHistory = await getScanHistory();
    
    // Добавляем новый элемент в начало
    const updatedHistory = [newItem, ...currentHistory];
    
    // Сохраняем обновленную историю
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    return newItem;
  } catch (error) {
    console.error('Ошибка при сохранении в историю:', error);
    throw error;
  }
};

/**
 * Получает всю историю сканирований
 */
export const getScanHistory = async (): Promise<ScanHistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    if (!historyJson) return [];
    
    return JSON.parse(historyJson) as ScanHistoryItem[];
  } catch (error) {
    console.error('Ошибка при загрузке истории:', error);
    return [];
  }
};

/**
 * Получает последние N элементов из истории сканирований
 */
export const getRecentScans = async (limit: number = 3): Promise<ScanHistoryItem[]> => {
  try {
    const history = await getScanHistory();
    return history.slice(0, limit);
  } catch (error) {
    console.error('Ошибка при загрузке последних сканирований:', error);
    return [];
  }
};

/**
 * Получает элемент истории по ID
 */
export const getScanById = async (id: string): Promise<ScanHistoryItem | null> => {
  try {
    const history = await getScanHistory();
    const item = history.find(scan => scan.id === id);
    return item || null;
  } catch (error) {
    console.error('Ошибка при поиске скана по ID:', error);
    return null;
  }
};

/**
 * Удаляет элемент из истории сканирований по ID
 */
export const deleteScanFromHistory = async (id: string): Promise<boolean> => {
  try {
    const currentHistory = await getScanHistory();
    const updatedHistory = currentHistory.filter(item => item.id !== id);
    
    // Проверяем, был ли элемент найден и удален
    if (currentHistory.length === updatedHistory.length) {
      console.warn(`Элемент с ID ${id} не найден в истории`);
      return false;
    }
    
    // Сохраняем обновленную историю
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updatedHistory));
    console.log(`Элемент с ID ${id} успешно удален из истории`);
    return true;
  } catch (error) {
    console.error('Ошибка при удалении из истории:', error);
    throw error;
  }
};

/**
 * Очищает всю историю сканирований
 */
export const clearScanHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
  } catch (error) {
    console.error('Ошибка при очистке истории:', error);
    throw error;
  }
};

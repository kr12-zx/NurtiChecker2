import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

// Ключ для хранения ID пользователя в AsyncStorage
const USER_ID_KEY = 'nutrichecker_user_id';

/**
 * Генерирует уникальный ID пользователя в формате:
 * текущая дата и время (цифрами) + 5 случайных цифр + "@nutrichecker.top"
 */
const generateUserId = (): string => {
  // Получаем текущую дату и время
  const now = new Date();
  
  // Форматируем дату и время как цифры (YYYYMMDDHHMMSS)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  
  // Генерируем 5 случайных цифр
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
  
  // Собираем итоговый ID
  const userId = `${timestamp}${randomDigits}@nutrichecker.top`;
  
  return userId;
};

/**
 * Получает ID пользователя из AsyncStorage.
 * Если ID не существует, генерирует новый и сохраняет его.
 */
export const getUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      // Генерируем новый ID если его нет
      userId = generateUserId();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      console.log('Сгенерирован новый ID пользователя:', userId);
    }
    
    return userId;
  } catch (error) {
    console.error('Ошибка при получении ID пользователя:', error);
    // В случае ошибки возвращаем сгенерированный ID без сохранения
    return generateUserId();
  }
};

/**
 * Принудительно регенерирует ID пользователя
 */
export const regenerateUserId = async (): Promise<string> => {
  try {
    const newUserId = generateUserId();
    await AsyncStorage.setItem(USER_ID_KEY, newUserId);
    console.log('ID пользователя регенерирован:', newUserId);
    return newUserId;
  } catch (error) {
    console.error('Ошибка при регенерации ID пользователя:', error);
    return generateUserId();
  }
};

/**
 * Копирует ID пользователя в буфер обмена
 */
export const copyUserIdToClipboard = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    await Clipboard.setStringAsync(userId);
    return true;
  } catch (error) {
    console.error('Ошибка при копировании ID в буфер обмена:', error);
    return false;
  }
};

/**
 * Удаляет ID пользователя из AsyncStorage (для тестирования)
 */
export const clearUserId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    console.log('ID пользователя удален');
  } catch (error) {
    console.error('Ошибка при удалении ID пользователя:', error);
  }
}; 
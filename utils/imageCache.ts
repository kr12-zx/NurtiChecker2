import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { getThumbnailUrl } from './imageUtils';

/**
 * Проактивно кэширует изображение в локальной памяти
 * @param imageUrl URL изображения для кэширования
 * @returns Promise<boolean> - успешность кэширования
 */
export const prefetchImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl) return false;
    
    // Пытаемся загрузить как миниатюру, так и оригинал
    const thumbnailUrl = getThumbnailUrl(imageUrl);
    
    // Сначала кэшируем миниатюру (она меньше и загрузится быстрее)
    if (thumbnailUrl && thumbnailUrl !== imageUrl) {
      await Image.prefetch(thumbnailUrl);
      console.log('✅ Миниатюра закэширована:', thumbnailUrl);
    }
    
    // Затем кэшируем оригинал
    await Image.prefetch(imageUrl);
    console.log('✅ Изображение закэширована:', imageUrl);
    
    return true;
  } catch (error) {
    console.warn('⚠️ Не удалось закэшировать изображение:', error);
    return false;
  }
};

/**
 * Проактивно кэширует массив изображений
 * @param imageUrls Массив URL изображений
 * @returns Promise<number> - количество успешно закэшированных изображений
 */
export const prefetchImages = async (imageUrls: string[]): Promise<number> => {
  let successCount = 0;
  
  // Кэшируем изображения параллельно, но ограничиваем количество одновременных запросов
  const batchSize = 3;
  
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(url => prefetchImage(url))
    );
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      }
    });
  }
  
  console.log(`📦 Закэшировано ${successCount} из ${imageUrls.length} изображений`);
  return successCount;
};

/**
 * Очищает кэш изображений Expo Image
 * @returns Promise<boolean> - успешность очистки
 */
export const clearImageCache = async (): Promise<boolean> => {
  try {
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    console.log('🧹 Кэш изображений очищен');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при очистке кэша изображений:', error);
    return false;
  }
};

/**
 * Получает размер кэша изображений на диске
 * @returns Promise<number> - размер в байтах
 */
export const getCacheSize = async (): Promise<number> => {
  try {
    const cacheDir = FileSystem.cacheDirectory + 'ExpoImageCache/';
    const info = await FileSystem.getInfoAsync(cacheDir);
    
    if (info.exists && info.isDirectory) {
      // Рекурсивно вычисляем размер всех файлов в кэше
      const calculateDirectorySize = async (dirPath: string): Promise<number> => {
        const files = await FileSystem.readDirectoryAsync(dirPath);
        let totalSize = 0;
        
        for (const file of files) {
          const filePath = dirPath + file;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          
          if (fileInfo.exists) {
            if (fileInfo.isDirectory) {
              totalSize += await calculateDirectorySize(filePath + '/');
            } else {
              totalSize += fileInfo.size || 0;
            }
          }
        }
        
        return totalSize;
      };
      
      return await calculateDirectorySize(cacheDir);
    }
    
    return 0;
  } catch (error) {
    console.warn('⚠️ Не удалось получить размер кэша:', error);
    return 0;
  }
};

/**
 * Форматирует размер в байтах в читаемый формат
 * @param bytes Размер в байтах
 * @returns Отформатированная строка (например, "2.5 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 
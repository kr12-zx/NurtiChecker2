import { firebaseStorage } from './config';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
// Используем expo-image-manipulator для изменения размера изображений
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Загружает изображение в Firebase Storage
 * @param uri URI изображения для загрузки
 * @param path Путь в Firebase Storage (например, 'products/images')
 * @param filename Имя файла (если не указано, будет сгенерировано)
 * @returns URL загруженного изображения
 */
export const uploadImage = async (uri: string, path: string = 'products/images', filename?: string) => {
  try {
    // Проверяем, что Firebase Storage доступен
    if (!firebaseStorage) {
      console.error('Firebase Storage не инициализирован');
      return null;
    }
    
    console.log('Оригинальное изображение:', uri);
    
    // Изменяем размер изображения до максимум 1300x1300 пикселей с сохранением пропорций
    try {
      // Сначала получаем информацию о размере изображения
      const imageInfo = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('Размер оригинального изображения:', imageInfo.width, 'x', imageInfo.height);
      
      // Определяем, нужно ли изменять размер изображения
      const MAX_SIZE = 1300;
      let resizeActions = [];
      
      if (imageInfo.width > MAX_SIZE || imageInfo.height > MAX_SIZE) {
        // Вычисляем соотношение сторон, чтобы сохранить пропорции
        const aspectRatio = imageInfo.width / imageInfo.height;
        
        let newWidth, newHeight;
        if (imageInfo.width > imageInfo.height) {
          // Пейзажное изображение
          newWidth = MAX_SIZE;
          newHeight = Math.round(MAX_SIZE / aspectRatio);
        } else {
          // Портретное изображение
          newHeight = MAX_SIZE;
          newWidth = Math.round(MAX_SIZE * aspectRatio);
        }
        
        resizeActions.push({ resize: { width: newWidth, height: newHeight } });
        console.log(`Изменение размера изображения до ${newWidth}x${newHeight}`);
      } else {
        console.log('Изображение уже оптимального размера, не требует изменений');
      }
      
      // Изменяем размер изображения и применяем сжатие
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        resizeActions,
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('Окончательный размер изображения:', manipResult.width, 'x', manipResult.height);
      
      // Используем оптимизированное изображение для загрузки
      uri = manipResult.uri;
    } catch (error) {
      console.error('Ошибка при изменении размера изображения:', error);
      console.log('Продолжаем загрузку оригинального изображения');
    }
    
    // Генерируем имя файла, если оно не указано
    const name = filename || `${Date.now()}.jpg`;
    const storageRef = firebaseStorage.ref(`${path}/${name}`);

    // Для iOS и Android нужно преобразовать URI изображения
    const imageUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    // Загружаем файл
    await storageRef.putFile(imageUri);

    // Получаем URL загруженного файла
    const downloadURL = await storageRef.getDownloadURL();
    console.log('Изображение успешно загружено:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return null;
  }
};

/**
 * Получает URL изображения из Firebase Storage
 * @param path Полный путь к изображению в Firebase Storage
 * @returns URL изображения
 */
export const getImageUrl = async (path: string) => {
  try {
    // Проверяем, что Firebase Storage доступен
    if (!firebaseStorage) {
      console.error('Firebase Storage не инициализирован');
      return null;
    }

    const storageRef = firebaseStorage.ref(path);
    const downloadURL = await storageRef.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Ошибка при получении URL изображения:', error);
    return null;
  }
};

/**
 * Удаляет изображение из Firebase Storage
 * @param path Полный путь к изображению в Firebase Storage
 * @returns true, если удаление прошло успешно
 */
export const deleteImage = async (path: string) => {
  try {
    // Проверяем, что Firebase Storage доступен
    if (!firebaseStorage) {
      console.error('Firebase Storage не инициализирован');
      return false;
    }

    const storageRef = firebaseStorage.ref(path);
    await storageRef.delete();
    console.log('Изображение успешно удалено:', path);
    return true;
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    return false;
  }
};

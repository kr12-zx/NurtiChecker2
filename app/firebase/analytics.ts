import { firebaseAnalytics } from './config';

/**
 * Регистрирует событие в Firebase Analytics
 * @param eventName Название события
 * @param params Параметры события (опционально)
 */
export const logEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (!firebaseAnalytics) {
      console.error('Firebase Analytics не инициализирован');
      return;
    }

    firebaseAnalytics.logEvent(eventName, params);
    console.log(`Событие ${eventName} зарегистрировано в Analytics`);
  } catch (error) {
    console.error(`Ошибка при регистрации события ${eventName}:`, error);
  }
};

/**
 * Устанавливает ID пользователя для аналитики
 * @param userId ID пользователя
 */
export const setUserId = (userId: string) => {
  try {
    if (!firebaseAnalytics) {
      console.error('Firebase Analytics не инициализирован');
      return;
    }

    firebaseAnalytics.setUserId(userId);
    console.log(`ID пользователя установлен: ${userId}`);
  } catch (error) {
    console.error('Ошибка при установке ID пользователя:', error);
  }
};

/**
 * Устанавливает пользовательские свойства для аналитики
 * @param properties Объект с пользовательскими свойствами
 */
export const setUserProperties = (properties: Record<string, string>) => {
  try {
    if (!firebaseAnalytics) {
      console.error('Firebase Analytics не инициализирован');
      return;
    }

    firebaseAnalytics.setUserProperties(properties);
    console.log('Пользовательские свойства установлены');
  } catch (error) {
    console.error('Ошибка при установке пользовательских свойств:', error);
  }
};

// Предопределенные события для удобства использования
export const AnalyticsEvents = {
  // Навигация
  SCREEN_VIEW: 'screen_view',
  
  // Сканирование
  SCAN_STARTED: 'scan_started',
  SCAN_COMPLETED: 'scan_completed',
  SCAN_FAILED: 'scan_failed',
  GALLERY_OPENED: 'gallery_opened',
  
  // Продукты
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_SAVED: 'product_saved',
  PRODUCT_SHARED: 'product_shared',
  
  // Настройки
  SETTINGS_CHANGED: 'settings_changed',
  LANGUAGE_CHANGED: 'language_changed',
  
  // Пользовательские действия
  USER_ENGAGEMENT: 'user_engagement',
  APP_OPEN: 'app_open',
  APP_UPDATE: 'app_update',
};

/**
 * Этот файл полностью отключает функциональность Firebase в приложении,
 * предоставляя фиктивные реализации для сервисов Firebase
 */

// Создаем заглушки для всех сервисов Firebase
export const firebaseStorage = {
  // Загрузка изображения - возвращает фиктивный URL
  ref: (path: string) => ({
    putFile: async (localPath: string) => ({ ref: { fullPath: localPath } }),
    getDownloadURL: async () => `https://placeholder-storage.com/${path}/${Math.random().toString(36).substring(7)}`,
  }),
};

export const firebaseAnalytics = {
  // Аналитика - ничего не делает
  setAnalyticsCollectionEnabled: async (enabled: boolean) => {},
  logEvent: async (name: string, params?: any) => {},
};

export const firebaseRemoteConfig = {
  // Remote Config - возвращает значения по умолчанию
  setDefaults: async (defaults: any) => {},
  setConfigSettings: async (settings: any) => {},
  fetchAndActivate: async () => true,
  getValue: (key: string) => ({ asString: () => '', asBoolean: () => false, asNumber: () => 0 }),
};

// Функция инициализации ничего не делает
export function initFirebase() {
  console.log('Firebase отключен. Используются заглушки для всех Firebase сервисов.');
  return undefined;
}

// Функции настройки - ничего не делают
export const initializeAnalytics = async () => {
  console.log('Analytics отключен. Используется заглушка.');
};

export const setupRemoteConfig = async () => {
  console.log('Remote Config отключен. Используется заглушка.');
};

// Функция загрузки - возвращает фиктивный URL
export const uploadImage = async (uri: string, path: string = 'uploads'): Promise<string> => {
  console.log(`Загрузка изображения отключена. Вернем заглушку для: ${uri}`);
  return `https://placeholder-storage.com/${path}/${Math.random().toString(36).substring(7)}`;
};

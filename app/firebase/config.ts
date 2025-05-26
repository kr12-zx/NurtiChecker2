// Импортируем Firebase модули
import storage from '@react-native-firebase/storage';
import analytics from '@react-native-firebase/analytics';
import remoteConfig from '@react-native-firebase/remote-config';

// Инициализация Firebase - проверяем если уже инициализирован
// Конфигурация берется из GoogleService-Info.plist/google-services.json
import firebase from '@react-native-firebase/app';

// Если Firebase уже инициализирован, используем существующий экземпляр
// Передаем минимальные параметры, совпадающие с GoogleService-Info.plist
// Это нужно для типизации, но реальная конфигурация все равно берется из GoogleService-Info.plist

// Минимальная конфигурация для типизации
const minimalConfig = {
  appId: '1:56615385728:ios:e92c49d22d2eace3e10465',
  projectId: 'nutrichecker-41993',
  apiKey: 'AIzaSyAWX_DWWf3fFyn4HiGqraClKsr9nqhByJ0',
}

export const app = firebase.apps.length > 0 
  ? firebase.app() 
  : firebase.initializeApp(minimalConfig);

// Инициализация сервисов
export const firebaseStorage = storage();
export const firebaseAnalytics = analytics();
export const firebaseRemoteConfig = remoteConfig();

// Включаем аналитику - сразу без проверок
export const initializeAnalytics = async () => {
  try {
    await firebaseAnalytics.setAnalyticsCollectionEnabled(true);
    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Analytics initialization failed:', error);
  }
};

// Настройка Remote Config - без лишних проверок
export const setupRemoteConfig = async () => {
  try {
    // Установка значений по умолчанию
    await firebaseRemoteConfig.setDefaults({
      welcome_message: 'Welcome to NutriChecker!',
      scan_tip: 'Position the barcode in the frame to scan',
      enable_gallery_button: 'true',
      // Настройки онбординга
      onboarding_version: 'onboarding1',
      onboarding_config: JSON.stringify({
        "onboarding1": {
          "screens": [
            {
              "id": "1",
              "title": "Добро пожаловать в NutriChecker",
              "description": "Ваш личный помощник для выбора здоровой пищи и отслеживания аллергенов.",
              "icon": "nutrition-outline"
            },
            {
              "id": "2",
              "title": "Сканируйте продукты",
              "description": "Просто отсканируйте любой продукт, чтобы получить подробную информацию о его составе и предупреждения об аллергенах.",
              "icon": "scan-outline"
            }
          ]
        },
        "onboarding2": {
          "screens": [
            {
              "id": "1",
              "title": "Тестовый онбординг #2",
              "description": "Это второй вариант онбординга, включающий среднее количество экранов.",
              "icon": "flask-outline"
            },
            {
              "id": "2",
              "title": "Второй экран",
              "description": "Тестовый экран второго варианта онбординга. Нажмите 'Далее' для продолжения.",
              "icon": "cube-outline"
            },
            {
              "id": "3",
              "title": "Третий экран", 
              "description": "Это завершающий экран для второго варианта онбординга. Нажмите 'Начать' для завершения.",
              "icon": "flag-outline"
            }
          ]
        },
        "onboarding3": {
          "screens": [
            {
              "id": "1",
              "title": "Тестовый онбординг #3",
              "description": "Это расширенный вариант онбординга с максимальным количеством экранов.",
              "icon": "bulb-outline"
            },
            {
              "id": "2",
              "title": "Второй экран",
              "description": "Первый тестовый экран из длинной серии в третьем варианте онбординга.",
              "icon": "albums-outline"
            },
            {
              "id": "3",
              "title": "Третий экран", 
              "description": "Продолжаем тестировать третий вариант онбординга с несколькими экранами.",
              "icon": "bookmarks-outline"
            },
            {
              "id": "4",
              "title": "Четвертый экран",
              "description": "Это четвертый экран третьего варианта онбординга. Почти завершили.",
              "icon": "diamond-outline"
            },
            {
              "id": "5",
              "title": "Завершающий экран",
              "description": "Это финальный экран третьего варианта онбординга. Нажмите 'Начать' чтобы приступить.",
              "icon": "rocket-outline"
            }
          ]
        }
      })
    });
    
    // Настройка минимального интервала получения обновлений (в секундах)
    await firebaseRemoteConfig.setConfigSettings({
      minimumFetchIntervalMillis: 3600000, // 1 час
    });
    
    // Получение и активация значений
    await firebaseRemoteConfig.fetchAndActivate();
    
    console.log('Remote Config setup completed');
  } catch (error) {
    console.error('Remote Config setup failed:', error);
  }
};

# Руководство по интеграции Firebase в React Native (Expo) приложение

## Обзор процесса интеграции

При интеграции Firebase в React Native приложение с использованием Expo мы столкнулись с несколькими типичными проблемами и нашли эффективные решения. Этот документ описывает архитектуру, подход, и детальные шаги для корректной настройки Firebase, основываясь на реальном опыте интеграции в проект NutriChecker.

## Используемые технологии и версии

- **React Native**: версия 0.79.x
- **Expo**: версия 53.0.x
- **Firebase**: `@react-native-firebase/*` версии 22.0.0
- **iOS**: минимальная версия 15.1
- **CocoaPods**: последняя стабильная версия

## Архитектура Firebase-интеграции

### 1. Структура файлов

Создайте директорию `app/firebase/` со следующими файлами:
- `config.ts` - основная конфигурация Firebase
- `remote-config.ts` - функции для работы с Remote Config
- `analytics.ts` - функции для аналитики
- `storage.ts` - функции для работы с хранилищем
- `index.ts` - экспорты для удобного импорта

### 2. Нативная инициализация

Firebase инициализируется на нативном уровне в iOS приложении через `AppDelegate.swift` с использованием файла `GoogleService-Info.plist`.

## Подробная инструкция по установке

### Шаг 1: Установите зависимости

```bash
# Основной пакет Firebase
npm install firebase --save

# Модульные пакеты React Native Firebase
npm install @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/remote-config @react-native-firebase/storage --save
```

### Шаг 2: Настройка iOS

#### 2.1. Настройка Podfile

Отредактируйте `ios/Podfile`:

```ruby
platform :ios, '15.1'

# Установите версию Swift
ENV['SWIFT_VERSION'] = '5.0'

use_modular_headers!
use_frameworks! :linkage => :static

# Добавляем Firebase модули
pod 'Firebase', :modular_headers => true
pod 'FirebaseCoreInternal', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
pod 'FirebaseCore', :modular_headers => true
pod 'FirebaseStorage'
pod 'FirebaseAnalytics'
```

#### 2.2. Добавьте `GoogleService-Info.plist` 

Скачайте файл из Firebase Console и разместите его в:
- `/ios/YourAppName/GoogleService-Info.plist` (в директории приложения)
- `/ios/GoogleService-Info.plist` (в iOS директории)
- `/GoogleService-Info.plist` (в корне проекта)

#### 2.3. Модифицируйте `AppDelegate.swift`

Важно добавить надежный механизм инициализации Firebase с проверкой наличия конфигурационного файла:

```swift
import Firebase
import FirebaseCore

override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
  // Ищем файл конфигурации в бандле
  let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") 
  if let path = path {
    print("🔥 Firebase: Найден файл по пути: " + path)
    let options = FirebaseOptions(contentsOfFile: path)
    if let options = options {
      FirebaseApp.configure(options: options)
    } else {
      print("🔥 Firebase: Не удалось создать FirebaseOptions из файла")
    }
  } else {
    print("🔥 Firebase: Файл не найден в бандле")
    // Резервный путь к файлу
    let directPath = "/Users/yourusername/YourProject/GoogleService-Info.plist"
    if FileManager.default.fileExists(atPath: directPath) {
      print("🔥 Firebase: Файл существует по пути: " + directPath)
      if let options = FirebaseOptions(contentsOfFile: directPath) {
        FirebaseApp.configure(options: options)
      }
    } else {
      try? FirebaseApp.configure()
      print("🔥 Firebase: Попытка стандартной конфигурации")
    }
  }
  
  return super.application(application, didFinishLaunchingWithOptions: launchOptions)
}
```

### Шаг 3: JavaScript настройка

#### 3.1. Создайте базовую конфигурацию в `app/firebase/config.ts`

```typescript
import firebase from '@react-native-firebase/app';
import { getStorage } from '@react-native-firebase/storage';
import { getAnalytics } from '@react-native-firebase/analytics';
import { getRemoteConfig } from '@react-native-firebase/remote-config';

// Проверка нативной инициализации
if (!firebase.apps.length) {
  console.warn('Firebase JavaScript SDK: Default app not initialized natively.');
}

// Получаем экземпляр приложения (должен быть инициализирован нативно)
const app = firebase.app();

// Инициализация сервисов
export const firebaseStorage = getStorage(app);
export const firebaseAnalytics = getAnalytics(app);
export const firebaseRemoteConfig = getRemoteConfig(app);

// Включение аналитики
export const initializeAnalytics = async () => {
  try {
    await firebaseAnalytics.setAnalyticsCollectionEnabled(true);
    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Analytics initialization failed:', error);
  }
};

// Настройка Remote Config
export const setupRemoteConfig = async () => {
  try {
    await firebaseRemoteConfig.setDefaults({
      welcome_message: 'Welcome to App!',
      // Другие значения по умолчанию
    });
    
    await firebaseRemoteConfig.setConfigSettings({
      minimumFetchIntervalMillis: 3600000, // 1 час
    });
    
    await firebaseRemoteConfig.fetchAndActivate();
    console.log('Remote Config setup completed');
  } catch (error) {
    console.error('Remote Config setup failed:', error);
  }
};
```

#### 3.2. Создайте утилиты для Remote Config в `app/firebase/remote-config.ts`

```typescript
import { firebaseRemoteConfig } from './config';

// Получение строкового значения
export const getStringValue = (key: string, defaultValue: string = ''): string => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return defaultValue;
    }

    return firebaseRemoteConfig.getValue(key).asString() || defaultValue;
  } catch (error) {
    console.error(`Ошибка при получении значения ${key}:`, error);
    return defaultValue;
  }
};

// Получение булевого значения
export const getBooleanValue = (key: string, defaultValue: boolean = false): boolean => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return defaultValue;
    }

    return firebaseRemoteConfig.getValue(key).asBoolean() || defaultValue;
  } catch (error) {
    console.error(`Ошибка при получении значения ${key}:`, error);
    return defaultValue;
  }
};

// Получение числового значения
export const getNumberValue = (key: string, defaultValue: number = 0): number => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return defaultValue;
    }

    return firebaseRemoteConfig.getValue(key).asNumber() || defaultValue;
  } catch (error) {
    console.error(`Ошибка при получении значения ${key}:`, error);
    return defaultValue;
  }
};

// Обновление значений Remote Config
export const refreshRemoteConfig = async (): Promise<boolean> => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return false;
    }

    await firebaseRemoteConfig.setConfigSettings({
      minimumFetchIntervalMillis: 0, // Получать обновления каждый раз
    });

    const fetchedRemotely = await firebaseRemoteConfig.fetchAndActivate();
    console.log(
      fetchedRemotely
        ? 'Получены новые значения из Remote Config'
        : 'Используются кэшированные значения Remote Config'
    );

    return true;
  } catch (error) {
    console.error('Ошибка при обновлении Remote Config:', error);
    return false;
  }
};
```

#### 3.3. Инициализируйте Firebase в корневом компоненте, например, `app/_layout.tsx`

```typescript
import { useEffect } from 'react';
import { initializeAnalytics, setupRemoteConfig } from '../firebase/config';

export default function RootLayout() {
  useEffect(() => {
    // Инициализация Firebase сервисов
    const initFirebaseServices = async () => {
      await initializeAnalytics();
      await setupRemoteConfig();
    };
    
    initFirebaseServices();
  }, []);
  
  // Остальной код компонента
}
```

## Распространенные ошибки и решения

### 1. Проблема: "No Firebase App '[DEFAULT]' has been created"

**Решение**: 
- Убедитесь, что `FirebaseApp.configure()` вызывается в AppDelegate.swift
- Проверьте наличие и валидность `GoogleService-Info.plist`
- Используйте явную инициализацию через метод с параметрами

### 2. Проблема: Ошибки с отсутствующими файлами `RNCWebViewSpec`

**Решение**:
- Очистите все кэши и переустановите поды:
```bash
cd ios
rm -rf Pods Podfile.lock build
pod cache clean --all
pod install
```

### 3. Проблема: "`FirebaseApp.configure()` could not find GoogleService-Info.plist"

**Решение**:
- Проверьте наличие файла в нескольких местах:
  - В директории iOS приложения
  - В iOS директории
  - В корне проекта
- Файл должен быть добавлен в проект Xcode (не просто лежать на диске)

### 4. Проблема: Несоответствия методов в JavaScript

**Решение**:
- Используйте правильный API (с учетом версии):
  - Для версии 22.x: `getApps()` вместо `firebase.apps`
  - Корректно используйте методы экземпляров: `firebaseAnalytics.setAnalyticsCollectionEnabled()`

## Проверка успешной интеграции

После настройки проверьте:

1. Приложение собирается без ошибок (`npx expo run:ios`)
2. В логах нет критических ошибок Firebase
3. Успешная инициализация сервисов ("Analytics initialized successfully")
4. Remote Config настраивается ("Remote Config setup completed")

## Лучшие практики

1. **Версии зависимостей**: Всегда фиксируйте конкретные версии в package.json
2. **Резервные механизмы**: Реализуйте проверки и отказоустойчивость для каждого сервиса Firebase
3. **Логирование**: Добавляйте подробное логирование для простоты отладки 
4. **Избегайте блокирующего кода**: Оборачивайте Firebase-вызовы в try-catch
5. **Нативная инициализация**: Реализуйте её в AppDelegate для iOS и в MainApplication для Android
6. **Множественные копии файлов конфигурации**: Размещайте `GoogleService-Info.plist` в нескольких местах

## Заключение

Интеграция Firebase в React Native требует корректной настройки как на нативном, так и на JavaScript уровне. Придерживаясь этого руководства вы избежите большинства распространенных проблем и обеспечите стабильную работу сервисов Firebase в своём приложении.

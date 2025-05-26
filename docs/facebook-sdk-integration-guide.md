# Инструкция по интеграции Facebook SDK в React Native приложение

Данная инструкция описывает полный процесс интеграции Facebook SDK в приложение React Native/Expo. Следуя этим шагам, вы сможете настроить сбор аналитики, логирование пользовательских событий и других метрик.

## Шаг 1: Создание приложения в Facebook Developers

1. Перейдите на [Facebook Developers](https://developers.facebook.com/) и войдите в свой аккаунт.
2. Нажмите "Create App" и выберите тип приложения "Consumer".
3. Введите название приложения и контактный email.
4. После создания, на дашборде приложения, запомните App ID - он понадобится для интеграции.

## Шаг 2: Установка зависимостей

Для интеграции Facebook SDK с React Native используется пакет `react-native-fbsdk-next`:

```bash
npm install react-native-fbsdk-next
# или
npm install react-native-fbsdk-next
```

## Шаг 3: Конфигурация для iOS

### 3.1 Обновите Podfile

После установки `react-native-fbsdk-next`, убедитесь, что ваш `ios/Podfile` настроен правильно.

**Стандартная интеграция (без `use_frameworks!`)**:
Обычно достаточно просто запустить `pod install`.

**Интеграция с `use_frameworks!` (особенно `:linkage => :static`)**:
Сочетание `use_frameworks! :linkage => :static` и Facebook SDK может вызывать проблемы с поиском заголовков и протоколов. Если вы столкнулись с ошибками компиляции типа `cannot find protocol declaration` или `file not found` для FBSDK, попробуйте следующую конфигурацию в вашем `target`:

```ruby
target 'YourAppName' do
  # ... другие поды ...

  # Facebook SDK (конфигурация для use_frameworks! :linkage => :static)
  # Используем раздельные поды с modular_headers и явным Basics
  pod 'FBSDKCoreKit', :modular_headers => true
  pod 'FBSDKLoginKit', :modular_headers => true
  pod 'FBSDKShareKit', :modular_headers => true
  pod 'FBSDKCoreKit_Basics'

  # ... остальные настройки ...
end
```

**После изменения Podfile, выполните полную очистку и переустановку:**
```bash
cd ios
pod deintegrate
rm -rf Pods Podfile.lock ~/Library/Developer/Xcode/DerivedData/* # Очистка кешей
pod install --repo-update # Установка с обновлением репозиториев
cd ..
```

### 3.2 Обновите Info.plist

Добавьте следующие элементы в файл `ios/YourAppName/Info.plist`:

```xml
<!-- Facebook SDK конфигурация -->
<key>FacebookAppID</key>
<string>ВАШЕ_FB_APP_ID</string>
<key>FacebookClientToken</key>
<string>ВАШ_CLIENT_TOKEN</string> <!-- Обязательно! Получите из FB Developer Dashboard -> Настройки -> Расширенные -->
<key>FacebookDisplayName</key>
<string>НАЗВАНИЕ_ВАШЕГО_ПРИЛОЖЕНИЯ</string>
<key>FacebookAutoLogAppEventsEnabled</key>
<true/>
<key>FacebookAdvertiserIDCollectionEnabled</key>
<true/>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>fbapi</string>
  <string>fb-messenger-api</string>
  <string>fbauth2</string>
  <string>fbshareextension</string>
</array>
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fbВАШЕ_FB_APP_ID</string>
    </array>
  </dict>
</array>

<!-- SKAdNetwork identifiers для атрибуции на iOS 14.5+ -->
<!-- (Рекомендуется добавить актуальный список ID от Meta) -->
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>v9wttpbfk9.skadnetwork</string>
  </dict>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>n38lu8286q.skadnetwork</string> <!-- Пример другого ID -->
  </dict>
  <!-- Добавьте другие релевантные ID -->
</array>
```

### 3.3 Настройте AppDelegate.mm

Убедитесь, что в файле `AppDelegate.mm` не происходит инициализация Facebook SDK нативными методами, если используется react-native-fbsdk-next. Библиотека сама обрабатывает эту логику.

Проверьте, что в методе `application:openURL:options:` присутствует код:

```objective-c
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

## Шаг 4: Создание сервиса для работы с Facebook SDK

Создайте файл `app/services/FacebookService.ts` с основными методами для работы с SDK:

```typescript
import { Platform } from 'react-native';
import { Settings, AppEventsLogger, Params } from 'react-native-fbsdk-next';

/**
 * Инициализирует Facebook SDK
 */
export const initializeFacebookSDK = (): void => {
  try {
    Settings.initializeSDK();
    console.log('Facebook SDK успешно инициализирован');
  } catch (error) {
    console.error('Ошибка при инициализации Facebook SDK:', error);
  }
};

/**
 * Логирует открытие приложения в Facebook Analytics
 */
export const logAppOpen = (): void => {
  try {
    AppEventsLogger.logEvent('fb_mobile_activate_app');
    console.log('Событие открытия приложения отправлено в Facebook Analytics');
  } catch (error) {
    console.error('Ошибка при логировании открытия приложения:', error);
  }
};

/**
 * Логирует установку приложения в Facebook Analytics
 */
export const logAppInstall = (): void => {
  try {
    AppEventsLogger.logEvent('fb_mobile_complete_registration');
    console.log('Событие установки приложения отправлено в Facebook Analytics');
  } catch (error) {
    console.error('Ошибка при логировании установки приложения:', error);
  }
};

/**
 * Логирует кастомное событие в Facebook Analytics
 * @param eventName Название события
 * @param params Дополнительные параметры события
 */
export const logCustomEvent = (eventName: string, params?: Params): void => {
  try {
    if (params) {
      AppEventsLogger.logEvent(eventName, params);
    } else {
      AppEventsLogger.logEvent(eventName);
    }
    console.log(`Кастомное событие ${eventName} отправлено в Facebook Analytics`);
  } catch (error) {
    console.error(`Ошибка при логировании события ${eventName}:`, error);
  }
};
```

## Шаг 5: Отслеживание первого запуска приложения

Добавьте функции для работы с AsyncStorage для отслеживания первого запуска:

```typescript
// В app/utils/storage.ts или подобном файле
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
export const STORAGE_KEYS = {
  FIRST_LAUNCH: 'yourapp.firstLaunch',
};

/**
 * Проверяет, является ли это первым запуском приложения
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    // Если значение отсутствует (null), это первый запуск
    return value === null;
  } catch (error) {
    console.error('Error checking first launch status:', error);
    // При ошибке считаем, что это не первый запуск
    return false;
  }
};

/**
 * Устанавливает статус первого запуска
 */
export const setFirstLaunch = async (isFirst: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, isFirst ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting first launch status:', error);
  }
};
```

## Шаг 6: Инициализация SDK в приложении

Добавьте инициализацию в корневой компонент приложения (например, в `_layout.tsx` для Expo Router или в `App.tsx`). Используйте `useRef` для защиты от двойной инициализации:

```tsx
import React, { useEffect, useRef } from 'react';
import { initializeFacebookSDK, logAppOpen, logAppInstall } from './services/FacebookService';
import { isFirstLaunch, setFirstLaunch } from './utils/storage';

export default function RootLayout() { // или App()
  const fbInitialized = useRef(false);

  useEffect(() => {
    // Запускаем инициализацию только один раз
    if (fbInitialized.current) return;
    fbInitialized.current = true;

    initializeFacebookSDK();
    logAppOpen();
    
    // Проверяем, первый ли запуск приложения
    const checkFirstLaunch = async () => {
      const isFirst = await isFirstLaunch();
      if (isFirst) {
        logAppInstall(); // Отправляет fb_mobile_complete_registration
        console.log('Logged first launch event to Facebook');
        await setFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []); // Пустой массив зависимостей для запуска один раз при монтировании

  // Остальная часть компонента...
}
```

## Шаг 7: Логирование пользовательских событий

Для отслеживания действий пользователя используйте функцию `logCustomEvent`:

```typescript
import { logCustomEvent } from './services/FacebookService';

// Пример логирования события с параметрами
const handleButtonPress = () => {
  logCustomEvent('button_pressed', {
    button_name: 'subscribe_button',
    screen_name: 'profile'
  });
  
  // Дальнейшая логика обработки нажатия...
};

// Пример логирования покупки
const handlePurchase = (productId: string, price: number) => {
  logCustomEvent('purchase_completed', {
    product_id: productId,
    price: price,
    currency: 'USD'
  });
};
```

## Шаг 8: Тестирование интеграции

Для проверки работы SDK:

1. Запустите приложение на реальном устройстве
2. Проверьте логи - должны быть сообщения об успешной инициализации SDK и отправке событий

Для отладки событий Facebook SDK используйте следующие методы:

### Метод 1: Логи в консоли
Самый простой способ - включить подробное логирование в FacebookService.ts:

```typescript
// В FacebookService.ts добавьте
import { Platform } from 'react-native';
import { Settings, AppEventsLogger, Params } from 'react-native-fbsdk-next';

// Включите расширенное логирование
Settings.setAdvertiserTrackingEnabled(true);
AppEventsLogger.setFlushBehavior(AppEventsLogger.FlushBehavior.AUTO);

// Для отладки добавьте вывод подробной информации
const logEventDetails = (eventName: string, params?: Params) => {
  console.log(`[FB EVENT] ${eventName}`, params ? JSON.stringify(params) : '');
};

// Затем используйте в каждом методе логирования
export const logAppOpen = (): void => {
  try {
    AppEventsLogger.logEvent('fb_mobile_activate_app');
    logEventDetails('fb_mobile_activate_app');
    console.log('Событие открытия приложения отправлено в Facebook Analytics');
  } catch (error) {
    console.error('Ошибка при логировании открытия приложения:', error);
  }
};
```

### Метод 2: Facebook Events Manager
Для онлайн-отладки подключите Meta Events Manager:

1. Создайте бизнес-аккаунт в Meta Business Suite
2. Подключите ваше приложение к бизнес-аккаунту в Facebook Developer Dashboard 
3. Перейдите в Events Manager: https://business.facebook.com/events_manager
4. Добавьте ваше приложение как источник данных (Data Source)
5. Следуйте инструкциям по настройке

### Метод 3: Метод отладки через Safari
Для iOS-устройств можно использовать Safari Web Inspector:

1. Подключите iOS устройство к Mac
2. Включите Web Inspector в настройках Safari на устройстве
3. Откройте Safari на Mac и подключитесь к устройству через Developer menu
4. Мониторите Network запросы к graph.facebook.com

> **Важно:** Основной способ убедиться, что события не только отправляются из приложения (что видно в логах), но и **доставляются** на серверы Facebook — использовать вкладку **Test Events** в [Meta Events Manager](https://business.facebook.com/events_manager/). События там должны появляться почти в реальном времени.

## Шаг 9: Просмотр аналитики

Данные из SDK доступны через Meta Business Suite:

1. **Meta Business Suite Events Manager**: https://business.facebook.com/events_manager/
2. **App Dashboard**: https://developers.facebook.com/apps/[ваш-app-id]/dashboard/
3. **Ads Manager** (для рекламы): https://www.facebook.com/ads/manager/

> **Важно**: Facebook Analytics как отдельный сервис был закрыт Meta в 2021 году. Все аналитические данные событий теперь доступны через Events Manager и используются преимущественно для таргетирования рекламы и создания Custom Audiences.

## Возможные проблемы и их решения

1. **События не отображаются в дашборде**:
   - Проверьте, включен ли Live Mode для приложения
   - Учтите, что данные могут появляться с задержкой (до 24-48 часов)
   - Проверьте наличие интернет-соединения на устройстве

2. **Ошибка инициализации SDK**:
   - Проверьте правильность App ID в настройках
   - Убедитесь, что все необходимые ключи добавлены в Info.plist

3. **Конфликты с нативным кодом**:
   - Убедитесь, что нет двойной инициализации SDK (в JS и в нативном коде)
   - Проверьте, что AppDelegate корректно настроен для обработки URL

4. **Ошибки компиляции FBSDK при использовании `use_frameworks! :linkage => :static`**:
   - **Симптомы:** Ошибки типа `'FBSDKCoreKit_Basics/...' file not found`, `cannot find protocol declaration for 'FBSDKURLSessionProviding'`.
   - **Решение:** Попробуйте явно указать раздельные поды Facebook с `:modular_headers => true` и `FBSDKCoreKit_Basics` в `Podfile`, как описано в **Шаге 3.1**.

## Документация

- [Официальная документация Meta для разработчиков](https://developers.facebook.com/docs/)
- [react-native-fbsdk-next на GitHub](https://github.com/thebergamo/react-native-fbsdk-next)

## Примечание об ATT (App Tracking Transparency)

Данная инструкция не включает реализацию запроса на отслеживание (ATT), который необходим на iOS 14.5+ для доступа к IDFA (Identifier for Advertisers). Без получения разрешения от пользователя через ATT, возможности Facebook по атрибуции установок к рекламным кампаниям и созданию аудиторий будут ограничены.

Для полноценного рекламного трекинга рекомендуется реализовать ATT prompt с использованием библиотеки, например, [`expo-tracking-transparency`](https://docs.expo.dev/versions/latest/sdk/tracking-transparency/). 
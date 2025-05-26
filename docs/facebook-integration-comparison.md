# Сравнение интеграции Facebook SDK: Рекомендации vs Текущая реализация

## Введение

Этот документ сравнивает рекомендуемый способ интеграции Facebook SDK с использованием библиотеки `react-native-fbsdk-next` (основанный на её README и общепринятых практиках) с текущей реализацией в проекте SoulAnimal. Цель — выявить расхождения, которые могут быть причиной проблем с верификацией SDK в Facebook Events Manager.

## 1. Рекомендуемая интеграция (`react-native-fbsdk-next` README)

Согласно документации `react-native-fbsdk-next`, стандартная интеграция для iOS включает следующие ключевые шаги:

### 1.1 Установка и связывание
- Установка пакета: `npm install react-native-fbsdk-next`
- Линковка: Для React Native 0.60+ используется авто-линковка. Достаточно выполнить `cd ios && pod install`.

### 1.2 Конфигурация `Podfile`
- **Явное указание подов Facebook не требуется.** Библиотека `react-native-fbsdk-next` сама управляет своими нативными зависимостями через собственный `podspec`.
- Не рекомендуется использовать монолитный `pod 'facebooksdk'`, так как он может конфликтовать с RN-проектами.
- Стандартный `Podfile` для RN-проекта обычно не содержит прямых ссылок на `FBSDK*Kit`.

### 1.3 Конфигурация `Info.plist`
- Добавление обязательных ключей:
    - `FacebookAppID` (ID приложения)
    - `FacebookClientToken` (Токен клиента)
    - `FacebookDisplayName` (Имя приложения)
    - `CFBundleURLTypes` (со схемой `fb<APP_ID>`)
    - `LSApplicationQueriesSchemes` (с `fbapi`, `fb-messenger-share-api` и т.д.)
- Добавление опциональных ключей для авто-сбора событий и IDFA:
    - `FacebookAutoLogAppEventsEnabled` (`<true/>`)
    - `FacebookAdvertiserIDCollectionEnabled` (`<true/>`)
- Добавление `NSUserTrackingUsageDescription` (если планируется использовать ATT).
- Добавление `SKAdNetworkItems` (рекомендуется).

### 1.4 Конфигурация `AppDelegate.mm`
- **`didFinishLaunchingWithOptions`:** Необходимо добавить вызов для инициализации FB SDK **до** `return YES;`:
  ```objective-c
  #import <FBSDKCoreKit/FBSDKCoreKit-Swift.h> // или FBSDKCoreKit.h

  - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
  {
    // ... другие настройки ...
    [[FBSDKApplicationDelegate sharedInstance] application:application
                         didFinishLaunchingWithOptions:launchOptions]; // <--- ВАЖНО
    // ...
    return YES; // или super вызов
  }
  ```
- **`application:openURL:options:`:** **Критически важно** обрабатывать URL и для Facebook SDK (первым), и для React Native Linking (вторым):
  ```objective-c
  #import <React/RCTLinkingManager.h>
  #import <FBSDKCoreKit/FBSDKCoreKit-Swift.h> // или FBSDKCoreKit.h

  - (BOOL)application:(UIApplication *)app
              openURL:(NSURL *)url
              options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
  {
    // СНАЧАЛА FACEBOOK SDK
    if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
      return YES;
    }
    // ПОТОМ REACT NATIVE LINKING
    if ([RCTLinkingManager application:app openURL:url options:options]) {
      return YES;
    }
    return NO;
  }
  ```

### 1.5 Expo Config Plugin
- Для проектов Expo рекомендуется использовать **Config Plugin** в `app.json`:
  ```json
  "plugins": [
    ["react-native-fbsdk-next", {
      "appID": "...",
      "clientToken": "...",
      "displayName": "...",
      "scheme": "fb...",
      // другие опции
    }]
  ]
  ```
- Плагин автоматически настраивает `Info.plist` и другие нативные файлы при `npx expo prebuild`.

### 1.6 Инициализация в JavaScript
- Вызвать `Settings.initializeSDK();` как можно раньше в коде (например, в `_layout.tsx` или `App.tsx`).
- Вызывать `logAppOpen()` при старте.
- Вызывать `logAppInstall()` при первом запуске (используя AsyncStorage для отслеживания).

## 2. Текущая реализация (Проект SoulAnimal)

В проекте SoulAnimal интеграция выполнена следующим образом:

### 2.1 Установка и связывание
- Пакет `react-native-fbsdk-next` установлен.
- `pod install` выполнялся многократно.

### 2.2 Конфигурация `Podfile`
- Используется `use_frameworks! :linkage => :static`.
- **Отклонение от стандарта:** Из-за конфликтов компиляции, вызванных статической линковкой, используется **рабочая, но нестандартная конфигурация**:
  ```ruby
  # Facebook SDK (конфигурация для use_frameworks! :linkage => :static)
  # Используем раздельные поды с modular_headers и явным Basics
  pod 'FBSDKCoreKit', :modular_headers => true
  pod 'FBSDKLoginKit', :modular_headers => true
  pod 'FBSDKShareKit', :modular_headers => true
  pod 'FBSDKCoreKit_Basics' # Добавлен явно для решения ошибок "file not found"
  ```
- *Примечание: Стандартная конфигурация (единый `pod 'FacebookSDK'` или отсутствие явных подов) приводила к ошибкам сборки в данном проекте.* 

### 2.3 Конфигурация `Info.plist`
- **Соответствует рекомендациям:** Добавлены `FacebookAppID`, `FacebookClientToken`, `FacebookDisplayName`, `LSApplicationQueriesSchemes`, `CFBundleURLTypes`.
- Добавлены `FacebookAutoLogAppEventsEnabled` и `FacebookAdvertiserIDCollectionEnabled` со значением `true`.
- Добавлены `SKAdNetworkItems`.

### 2.4 Конфигурация `AppDelegate.mm`
+**Ключевые исправления, необходимые для работы SDK:**
+- **Импорты:** Добавлены необходимые импорты для совместимости `FBSDKCoreKit-Swift.h` с Objective-C:
+  ```objective-c
+  #import <SafariServices/SafariServices.h>
+  #import <AuthenticationServices/AuthenticationServices.h>
+  #import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>
+  ```
 - **`didFinishLaunchingWithOptions`:**
    - **Исправлено:** Добавлен обязательный вызов `FBSDKApplicationDelegate` для корректной инициализации SDK:
      ```objective-c
      [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
      ```
 - **`application:openURL:options:`:**
    - **Исправлено:** Реализована **правильная обработка URL**, сначала для Facebook SDK, затем для `RCTLinkingManager`. **Это критически важно для верификации SDK и работы SSO**:
      ```objective-c
      - (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
      {
        // СНАЧАЛА FACEBOOK SDK
        if ([[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]) {
          return YES;
        }
        // ПОТОМ REACT NATIVE LINKING
        if ([RCTLinkingManager application:app openURL:url options:options]) {
          return YES;
        }
        return NO;
      }
      ```

### 2.5 Expo Config Plugin
- **Отклонение от стандарта:** Плагин **не используется**. `Info.plist` и `Podfile` настраивались вручную.

### 2.6 Инициализация в JavaScript
- **Соответствует рекомендациям:** Используется `FacebookService.ts`, вызываются `initializeFacebookSDK`, `logAppOpen`, `logAppInstall` в `_layout.tsx`.

## 3. Ключевые расхождения и их возможное влияние

1.  **`Podfile`:** Наша конфигурация нестандартна, это **работающий обходной путь** для решения проблем сборки со статическими фреймворками. Она отличается от стандартных рекомендаций `react-native-fbsdk-next` и Facebook.
2.  **`AppDelegate.mm` (`didFinishLaunchingWithOptions`):** ~~Отсутствие вызова `FBSDKApplicationDelegate` может приводить к неполной или несвоевременной инициализации SDK на нативном уровне.~~ **Исправлено.**
3.  **`AppDelegate.mm` (`openURL`):** ~~**Это наиболее вероятная причина проблемы с верификацией.** Без передачи URL делегату Facebook SDK, он не может корректно обработать обратные вызовы (например, после логина через приложение Facebook) и подтвердить свою работоспособность для Events Manager.~~ **Исправлено. Правильная обработка URL критична.**
4.  **Expo Config Plugin:** Отсутствие плагина усложняет поддержку и повышает риск ошибок при обновлениях Expo или библиотек, так как нативные конфигурации не управляются автоматически.

## 4. Тестирование и Верификация

Чтобы проверить, работает ли SDK и отправляются ли события:

1.  **Логи в консоли Xcode/Терминала:** Добавьте `console.log` в функции `FacebookService.ts` для отслеживания вызовов.
2.  **Facebook Events Manager -> Test Events:** Это **основной инструмент**. Запустите приложение на **реальном устройстве**, выполните действия, которые должны логировать события (открытие, установка, кастомные события), и смотрите, появляются ли они во вкладке Test Events в реальном времени. Если события появляются здесь, значит SDK работает и отправляет данные.
3.  **Проверка статуса в Events Manager:** После успешной отправки тестовых событий, статус SDK на главной странице Events Manager должен обновиться (может занять время).
4.  **Safari Web Inspector (для iOS):** Можно использовать для отслеживания сетевых запросов к `graph.facebook.com`.
5.  **Отладка на реальном устройстве:** Некоторые проблемы (особенно связанные с ATT или взаимодействием с приложением Facebook) проявляются только на реальных устройствах.

## 5. Заключение

**Ключевые моменты для успешной интеграции (особенно с `use_frameworks! :linkage => :static`):**
- **`Podfile`:** Может потребоваться нестандартная конфигурация с раздельными подами Facebook, `modular_headers` и явным `FBSDKCoreKit_Basics`.
- **`AppDelegate.mm`:** Крайне важно:
    - Добавить системные импорты (`SafariServices`, `AuthenticationServices`), если используется `-Swift.h`.
    - Вызвать `FBSDKApplicationDelegate` в `didFinishLaunchingWithOptions`.
    - Правильно реализовать метод `application:openURL:options:`, передавая URL сначала делегату Facebook, затем `RCTLinkingManager`.
- **`Info.plist`:** Необходимо заполнить все обязательные ключи (`FacebookAppID`, `FacebookClientToken` и т.д.).
- **Тестирование:** Использовать вкладку **Test Events** в Events Manager на реальном устройстве для проверки отправки событий. 
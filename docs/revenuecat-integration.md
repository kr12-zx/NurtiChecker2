# Интеграция пейвола RevenueCat в AllerScan

Данный документ описывает шаги, необходимые для полной интеграции пейвола RevenueCat в приложение AllerScan.

## Шаг 1: Установка библиотек RevenueCat

```bash
# Установка базового SDK RevenueCat
npm install react-native-purchases

# Установка UI-компонентов для пейволов
npm install react-native-purchases-ui

# Запуск скрипта для подключения нативных ресурсов
npx react-native-asset
```

## Шаг 2: Инициализация SDK RevenueCat

Создайте файл `utils/revenuecat/index.ts` с следующим содержимым:

```typescript
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// API ключи для RevenueCat
const API_KEYS = {
  android: 'YOUR_ANDROID_API_KEY',
  ios: 'YOUR_IOS_API_KEY',
};

/**
 * Инициализирует SDK RevenueCat
 */
export const initializeRevenueCat = () => {
  try {
    const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
    
    // Настройка логгирования (использовать только для отладки)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    
    // Инициализация SDK
    Purchases.configure({ apiKey });
    
    console.log('RevenueCat SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat SDK:', error);
  }
};

/**
 * Идентифицирует пользователя в RevenueCat
 * @param userId Уникальный идентификатор пользователя
 */
export const identifyRevenueCatUser = async (userId: string) => {
  try {
    await Purchases.logIn(userId);
    console.log('User identified in RevenueCat');
  } catch (error) {
    console.error('Failed to identify user in RevenueCat:', error);
  }
};

/**
 * Проверяет статус подписки пользователя
 * @returns Информация о клиенте с данными о подписках
 */
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
};

/**
 * Получает текущие предложения (offerings)
 * @returns Offerings с пакетами подписок
 */
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    throw error;
  }
};
```

## Шаг 3: Инициализация SDK в App.tsx

Добавьте вызов initializeRevenueCat в корневой компонент приложения:

```typescript
// В файле app/_layout.tsx добавьте:
import { initializeRevenueCat } from '../utils/revenuecat';

// Добавьте внутрь useEffect для инициализации:
useEffect(() => {
  // Существующий код инициализации Firebase
  
  // Инициализация RevenueCat
  initializeRevenueCat();
}, []);
```

## Шаг 4: Настройка пейвола в консоли RevenueCat

1. Создайте аккаунт на [RevenueCat](https://revenuecat.com/)
2. Создайте проект и добавьте приложение
3. Настройте продукты/подписки для App Store и Google Play
4. Создайте и настройте пейвол в разделе Paywalls
5. Получите API ключи из настроек проекта и обновите их в `utils/revenuecat/index.ts`

## Шаг 5: Активация пейвола RevenueCat в коде

Раскомментируйте закомментированный код в файле `app/paywall-revenuecat-implementation.tsx` и переместите его содержимое в `app/paywall-revenuecat.tsx`, заменив временную реализацию.

## Дополнительные ресурсы

- [Документация RevenueCat для React Native](https://revenuecat.com/docs/reactnative)
- [Настройка и отображение пейволов RevenueCat](https://revenuecat.com/docs/tools/paywalls/displaying-paywalls) 
# Интеграция RevenueCat в AllerScan

Этот проект использует RevenueCat для управления встроенными покупками и подписками.

## Реализованная функциональность

1. **Пейвол RevenueCat** - используется для отображения экрана подписки, настроенного в консоли RevenueCat.
2. **Интеграция с онбордингом** - пейвол показывается после завершения онбординга.
3. **Автоматическая навигация** - переход к основному приложению после покупки, восстановления или закрытия пейвола.

## Установка и настройка

### 1. Установка зависимостей

```bash
# Установка основного SDK
npm install react-native-purchases

# Установка UI-компонентов
npm install react-native-purchases-ui
```

### 2. Настройка файла конфигурации

В корне проекта создан файл `react-native.config.js`, необходимый для работы с нативными ресурсами:

```javascript
module.exports = {
  assets: [],
  // Дополнительные настройки проекта React Native
};
```

Запустите следующую команду для линковки нативных ресурсов:

```bash
npx react-native-asset
```

### 3. Инициализация RevenueCat

В файле `utils/revenuecat/index.ts` настройте API ключи для вашего проекта RevenueCat.

### 4. Настройка ключей API

В файле `utils/revenuecat/index.ts` замените API ключи вашими:

```typescript
const API_KEYS = {
  android: 'YOUR_ANDROID_API_KEY', // Замените на ваш ключ для Android
  ios: 'YOUR_IOS_API_KEY', // Замените на ваш ключ для iOS
};
```

## Дополнительная информация

### Структура файлов пейвола

- `app/paywall-revenuecat.tsx` - основная реализация пейвола RevenueCat, использующая модальное окно
- `app/paywall-revenuecat-component.tsx` - альтернативная реализация с использованием встраиваемого компонента

### Альтернативные реализации

Вы можете выбрать один из двух подходов к интеграции пейвола:

1. **Модальный пейвол** - используется функция `RevenueCatUI.presentPaywall()`, которая показывает модальное окно поверх текущего экрана.

```typescript
const paywallResult = await RevenueCatUI.presentPaywall({
  // Опции пейвола
});
```

2. **Встроенный компонент** - используется компонент `RevenueCatUI.Paywall`, который можно встроить в любое место интерфейса.

```typescript
<RevenueCatUI.Paywall 
  options={{
    // Опции пейвола
  }}
  onPurchaseCompleted={handlePurchaseCompleted}
  onRestoreCompleted={handleRestoreCompleted}
  onDismiss={handleDismiss}
/>
```

### Настройка пейвола в консоли RevenueCat

1. Создайте аккаунт на [RevenueCat](https://revenuecat.com/)
2. Создайте проект и настройте ваше приложение
3. Добавьте продукты для подписки
4. Настройте пейвол в разделе Paywalls
5. Скопируйте API ключи из настроек проекта

## Полезные ссылки

- [Документация RevenueCat](https://revenuecat.com/docs/)
- [RevenueCat для React Native](https://revenuecat.com/docs/reactnative)
- [Настройка и отображение пейволов](https://revenuecat.com/docs/tools/paywalls/displaying-paywalls) 
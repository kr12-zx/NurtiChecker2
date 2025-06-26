# 🧪 Руководство по тестированию NutriChecker App

## Типы тестирования для React Native/Expo приложений

### 1. **Unit Tests (Юнит-тесты)** ✅
Тестируют отдельные функции, утилиты и бизнес-логику.

**Инструменты:**
- Jest (уже настроен в проекте)
- Можно тестировать без эмулятора

**Что тестировать:**
- Утилиты: `utils/calorieCalculations.ts`
- Сервисы: `services/mealService.ts`
- Бизнес-логику: расчет калорий, парсинг данных
- API парсеры: `utils/aiResponseParser.ts`

**Пример теста:**
```javascript
// utils/__tests__/calorieCalculations.test.ts
test('getCaloriesForDate returns saved calories', async () => {
  const result = await getCaloriesForDate('2024-12-25');
  expect(typeof result).toBe('number');
});
```

### 2. **Component Tests (Тесты компонентов)** 🔄
Тестируют рендеринг компонентов и взаимодействие.

**Инструменты:**
- React Native Testing Library 
- Jest
- Enzyme (альтернатива)

**Что тестировать:**
- Компоненты: `CircularProgress`, `ProductCard`
- Рендеринг с разными пропсами
- Обработка событий

### 3. **Integration Tests (Интеграционные тесты)** 🔄
Тестируют взаимодействие между компонентами и сервисами.

**Что тестировать:**
- Потоки данных между экранами
- API интеграции
- Сохранение в AsyncStorage

### 4. **End-to-End Tests (E2E тесты)** 🚀
Тестируют полные пользовательские сценарии.

**Инструменты:**
- **Detox** (рекомендуется для React Native)
- **Appium** 
- **Maestro** (новый, простой в настройке)

## 🛠 Практические способы тестирования в Cursor

### A. **Manual Testing (Ручное тестирование)**

**1. Симулятор iOS/Android:**
```bash
npm run ios     # iOS симулятор
npm run android # Android эмулятор
npm run web     # Web версия для быстрой проверки
```

**2. Expo Go на реальном устройстве:**
```bash
npm start
# Сканируй QR код в Expo Go
```

**3. Hot Reload для быстрой итерации:**
- Изменения в коде автоматически обновляются
- Cmd+R для перезагрузки
- Cmd+D для меню разработчика

### B. **Automated Testing (Автоматизированное тестирование)**

**1. Простые Jest тесты (работают):**
```bash
# Создать тест
touch utils/__tests__/myFunction.test.ts

# Запустить
npm test
```

**2. Детокс E2E (продвинутый):**
```bash
npm install --save-dev detox
# Настройка detox.config.js
```

**3. Maestro E2E (простой):**
```bash
# Установка
curl -Ls "https://get.maestro.mobile.dev" | bash

# Создать flow файл
touch test_flow.yaml
```

### C. **Логирование и отладка**

**1. Console Debugging:**
```javascript
console.log('🔍 Debugging value:', value);
console.warn('⚠️ Warning:', warning);
console.error('❌ Error:', error);
```

**2. React Native Debugger:**
```bash
# Установка
brew install --cask react-native-debugger

# Запуск
react-native-debugger
```

**3. Flipper (Facebook):**
```bash
# Установка
brew install --cask flipper
```

## 🎯 Практические тесты для NutriChecker

### 1. **Критические функции для тестирования:**

```javascript
// 1. Калькуляции калорий
describe('Calorie Calculations', () => {
  test('getCurrentCalorieGoal returns valid number', async () => {
    const goal = await getCurrentCalorieGoal();
    expect(goal).toBeGreaterThan(0);
  });
});

// 2. Обработка AI ответов
describe('AI Response Parser', () => {
  test('parseNutritionData handles valid response', () => {
    const mockResponse = { calories: 150, protein: 20 };
    const result = parseNutritionData(mockResponse);
    expect(result.calories).toBe(150);
  });
});

// 3. Форматирование дат
describe('Date Utils', () => {
  test('formatDateToString returns correct format', () => {
    const date = new Date('2024-12-25');
    const result = formatDateToString(date);
    expect(result).toBe('25.12.2024');
  });
});
```

### 2. **Тестовые сценарии пользователей:**

**Сценарий 1: Добавление продукта**
1. Открыть сканер
2. Выбрать фото продукта  
3. Дождаться AI анализа
4. Проверить корректность данных
5. Добавить в дневник

**Сценарий 2: Просмотр истории**
1. Открыть главный экран
2. Переключить на вчерашний день
3. Проверить сохраненные данные
4. Проверить календарь индикаторов

**Сценарий 3: Онбординг**
1. Очистить данные приложения
2. Запустить приложение
3. Пройти онбординг
4. Проверить сохранение данных

### 3. **Простая настройка тестирования с Maestro:**

```yaml
# test_nutrition_flow.yaml
appId: your.app.bundle.id

---
- launchApp
- tapOn: "Сканировать продукт"  
- takeScreenshot: scan_screen
- tapOn: "Выбрать из галереи"
- tapOn: "Добавить в дневник"
- assertVisible: "Продукт добавлен"
```

```bash
# Запуск теста
maestro test test_nutrition_flow.yaml
```

## 🚨 Быстрые способы тестирования без настройки

### 1. **Console.log тестирование:**
```javascript
// В компоненте или функции
console.log('📊 Nutrition data:', nutritionData);
console.log('🎯 Current calorie goal:', calorieGoal);
console.log('📅 Selected date:', currentDate);
```

### 2. **Alert тестирование:**
```javascript
// Быстрая проверка значений
Alert.alert('Debug', `Calories: ${calories}, Goal: ${goal}`);
```

### 3. **Dev Menu shortcuts:**
```javascript
// Добавить в код для быстрого тестирования
if (__DEV__) {
  // Тестовые данные
  const testData = { calories: 1500, protein: 50 };
  console.log('🧪 Test data:', testData);
}
```

### 4. **Error Boundaries для отлова ошибок:**
```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.log('🚨 Error caught:', error, errorInfo);
  }
}
```

## ⚡ Быстрые команды для тестирования

```bash
# Очистить кэш и перезапустить
npm start -- --clear

# Запустить на конкретном устройстве
npm run ios -- --simulator="iPhone 15 Pro"

# Построить продакшн версию для тестирования
npm run build:ios
npm run build:android

# Посмотреть логи устройства
npx react-native log-ios
npx react-native log-android
```

## 🎯 Заключение

**Для быстрого тестирования:**
1. ✅ Используй ручное тестирование в симуляторе
2. ✅ Добавляй console.log для отладки
3. ✅ Пиши простые Jest тесты для утилит

**Для серьезного тестирования:**
1. 🔄 Настрой React Native Testing Library
2. 🚀 Используй Maestro для E2E тестов
3. 📊 Добавь мониторинг ошибок (Sentry)

React Native тестирование может быть сложным, но начни с простого и постепенно добавляй сложности! 
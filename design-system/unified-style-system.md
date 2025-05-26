# Унифицированная система стилей для онбординга NutriChecker

## Основные принципы

1. **Модульность** — каждый компонент имеет свой набор стилей, которые могут быть переиспользованы
2. **Консистентность** — единообразие стилей на всех экранах
3. **Адаптивность** — поддержка светлой и темной темы
4. **Современность** — градиенты, тени, анимации для премиального ощущения
5. **Простота интеграции** — минимум кода для подключения стилей к компоненту

## Цветовая система

### Основная палитра

```typescript
// Основные цвета
export const primaryColors = {
  // Фирменные цвета
  primary: '#5C55FA',
  primaryLight: '#7D7AFF',
  secondary: '#FF5778',
  
  // Функциональные цвета
  success: '#23D18B',
  warning: '#FFAC33',
  error: '#FF4777',
  
  // Нейтральные цвета
  white: '#FFFFFF',
  black: '#000000',
  
  // Семантические (для визуализации питательных веществ)
  protein: '#FF6B8B',
  carbs: '#53D2DC',
  fats: '#FFCC66',
  vitamins: '#7D7AFF',
};

// Цвета темы
export const lightThemeColors = {
  // Фоны
  background: '#FFFFFF',
  backgroundGradientStart: '#FFFFFF',
  backgroundGradientEnd: '#F6F8FC',
  
  // Элементы
  componentBackground: 'rgba(250, 251, 255, 0.85)',
  componentBorder: 'rgba(92, 85, 250, 0.1)',
  
  // Тени
  shadowColor: '#6065A8',
  shadowOpacity: 0.1,
  
  // Текст
  textPrimary: '#13141C',
  textSecondary: '#515773',
  
  // Интерактивные элементы
  optionBackground: 'rgba(250, 251, 255, 0.85)',
  optionBackgroundSelected: 'rgba(125, 122, 255, 0.15)',
  optionBorderColor: 'rgba(92, 85, 250, 0.1)',
  optionBorderColorSelected: '#5C55FA',
  
  // Кнопки
  buttonPrimaryBackground: primaryColors.primary,
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBackground: 'transparent',
  buttonSecondaryBorder: primaryColors.primary,
  buttonSecondaryText: primaryColors.primary,
  buttonDisabledBackground: '#E5E7EB',
  buttonDisabledText: '#9CA3AF',
};

export const darkThemeColors = {
  // Фоны
  background: '#13141C',
  backgroundGradientStart: '#13141C',
  backgroundGradientEnd: '#1A1E2C',
  
  // Элементы
  componentBackground: 'rgba(39, 42, 58, 0.85)', 
  componentBorder: 'rgba(122, 122, 255, 0.3)',
  
  // Тени
  shadowColor: '#000000',
  shadowOpacity: 0.4,
  
  // Текст
  textPrimary: '#F6F8FC',
  textSecondary: '#A7AECB',
  
  // Интерактивные элементы
  optionBackground: 'rgba(39, 42, 58, 0.85)',
  optionBackgroundSelected: 'rgba(94, 92, 230, 0.85)',
  optionBorderColor: 'rgba(122, 122, 255, 0.3)',
  optionBorderColorSelected: '#7D7AFF',
  
  // Кнопки
  buttonPrimaryBackground: primaryColors.primaryLight,
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBackground: 'transparent',
  buttonSecondaryBorder: primaryColors.primaryLight,
  buttonSecondaryText: primaryColors.primaryLight,
  buttonDisabledBackground: '#2A2C3A',
  buttonDisabledText: '#64677E',
};
```

## Компоненты

### 1. Контейнеры

```typescript
export const containerStyles = StyleSheet.create({
  // Основной контейнер экрана
  screen: {
    flex: 1,
    // Цвет фона задается динамически
  },
  
  // Контейнер для содержимого (основная часть экрана)
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  
  // Контейнер для заголовка и подзаголовка
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  // Контейнер для группы опций
  optionsGroup: {
    width: '100%',
    marginVertical: 16,
  },
  
  // Контейнер для навигационных кнопок (внизу экрана)
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    width: '100%',
  },
  
  // Карточка с эффектом матового стекла
  glassCard: {
    borderRadius: 16,
    padding: 20,
    // Цвет фона, тени и бордера задаются динамически
  },
});
```

### 2. Типографика

```typescript
export const typographyStyles = StyleSheet.create({
  // Заголовок экрана
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    // Цвет текста задается динамически
  },
  
  // Подзаголовок экрана
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 16,
    // Цвет текста задается динамически
  },
  
  // Заголовок опции
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    // Цвет текста задается динамически
  },
  
  // Описание опции
  optionDescription: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    // Цвет текста задается динамически
  },
  
  // Текст ошибки
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    color: primaryColors.error,
  },
  
  // Обычный текст
  bodyText: {
    fontSize: 15,
    fontWeight: '400',
    // Цвет текста задается динамически
  },
  
  // Текст кнопки
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    // Цвет текста задается динамически
  },
});
```

### 3. Кнопки

```typescript
export const buttonStyles = StyleSheet.create({
  // Базовая кнопка
  base: {
    height: 56,
    borderRadius: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // Цвет фона и тени задаются динамически
  },
  
  // Первичная кнопка (Далее)
  primary: {
    // Наследует базовые стили, цвета задаются динамически
  },
  
  // Вторичная кнопка (Назад)
  secondary: {
    // Наследует базовые стили
    borderWidth: 1,
    // Цвета задаются динамически
  },
  
  // Отключенная кнопка
  disabled: {
    // Наследует базовые стили, цвета задаются динамически
  },
  
  // Текст кнопки
  text: {
    fontSize: 16,
    fontWeight: '600',
    // Цвет текста задается динамически
  },
});
```

### 4. Элементы выбора

```typescript
export const optionStyles = StyleSheet.create({
  // Базовый контейнер опции
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    // Цвета фона и бордера задаются динамически
  },
  
  // Контейнер выбранной опции
  selected: {
    // Наследует базовые стили, цвета задаются динамически
  },
  
  // Левая часть опции (иконка + тексты)
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  // Контейнер для текстов
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  
  // Контейнер для индикатора выбора (справа)
  selectionIndicatorContainer: {
    marginLeft: 12,
  },
  
  // Индикатор выбора (круг)
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    // Цвета задаются динамически
  },
  
  // Внутренний круг индикатора (для выбранного состояния)
  selectionIndicatorInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    // Цвет задается динамически
  },
  
  // Контейнер для иконки
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    // Цвет фона задается динамически
  },
});
```

### 5. Индикаторы прогресса

```typescript
export const progressStyles = StyleSheet.create({
  // Контейнер для индикаторов
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  
  // Точка пагинации (неактивная)
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    // Цвет задается динамически
  },
  
  // Точка пагинации (активная)
  activeDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    // Цвет задается динамически
  },
  
  // Линейный индикатор прогресса (контейнер)
  linearContainer: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    marginVertical: 20,
    overflow: 'hidden',
    // Цвет фона задается динамически
  },
  
  // Заполнитель прогресса
  linearFill: {
    height: '100%',
    borderRadius: 2,
    // Ширина и цвет задаются динамически
  },
});
```

## Утилиты для применения стилей

```typescript
// Функция для получения стилей в зависимости от темы
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkThemeColors : lightThemeColors;
};

// Функция для получения стилей контейнера опции
export const getOptionContainerStyle = (isSelected: boolean, isDark: boolean) => {
  const themeColors = getThemeColors(isDark);
  
  return {
    ...optionStyles.container,
    backgroundColor: isSelected ? themeColors.optionBackgroundSelected : themeColors.optionBackground,
    borderColor: isSelected ? themeColors.optionBorderColorSelected : themeColors.optionBorderColor,
    shadowColor: isSelected ? themeColors.optionBorderColorSelected : 'transparent',
    shadowOffset: { width: 0, height: isSelected ? 4 : 0 },
    shadowOpacity: isSelected ? 0.3 : 0,
    shadowRadius: isSelected ? 8 : 0,
    elevation: isSelected ? 5 : 0,
  };
};

// Функция для получения стилей кнопки
export const getButtonStyle = (type: 'primary' | 'secondary' | 'disabled', isDark: boolean) => {
  const themeColors = getThemeColors(isDark);
  const baseStyle = buttonStyles.base;
  
  let specificStyle: ViewStyle = {};
  let textColor: string = '';
  
  switch (type) {
    case 'primary':
      specificStyle = {
        backgroundColor: themeColors.buttonPrimaryBackground,
        shadowColor: themeColors.buttonPrimaryBackground,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      };
      textColor = themeColors.buttonPrimaryText;
      break;
    case 'secondary':
      specificStyle = {
        backgroundColor: themeColors.buttonSecondaryBackground,
        borderColor: themeColors.buttonSecondaryBorder,
        borderWidth: 1,
      };
      textColor = themeColors.buttonSecondaryText;
      break;
    case 'disabled':
      specificStyle = {
        backgroundColor: themeColors.buttonDisabledBackground,
      };
      textColor = themeColors.buttonDisabledText;
      break;
  }
  
  return {
    containerStyle: { ...baseStyle, ...specificStyle },
    textStyle: { ...buttonStyles.text, color: textColor },
  };
};
```

## Применение стилей к компонентам

### Пример компонента экрана онбординга

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { 
  containerStyles, 
  typographyStyles, 
  optionStyles, 
  buttonStyles,
  getThemeColors,
  getOptionContainerStyle,
  getButtonStyle,
} from '../styles/unifiedStyles';
import { Ionicons } from '@expo/vector-icons';

interface ScreenProps {
  onContinue: () => void;
  onBack: () => void;
  // Другие необходимые пропсы
}

const ExampleScreen: React.FC<ScreenProps> = ({ onContinue, onBack }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = getThemeColors(isDark);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const options = [
    { id: 'option1', title: 'Опция 1', description: 'Описание опции 1', icon: 'person-outline' },
    { id: 'option2', title: 'Опция 2', description: 'Описание опции 2', icon: 'map-outline' },
    // Другие опции
  ];
  
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };
  
  // Стили кнопок
  const primaryButtonStyles = getButtonStyle('primary', isDark);
  const secondaryButtonStyles = getButtonStyle('secondary', isDark);
  const disabledButtonStyles = getButtonStyle('disabled', isDark);
  
  return (
    <View style={[containerStyles.screen, { backgroundColor: themeColors.background }]}>
      <ScrollView>
        <View style={containerStyles.content}>
          <View style={containerStyles.header}>
            <Text style={[typographyStyles.title, { color: themeColors.textPrimary }]}>
              Заголовок экрана
            </Text>
            <Text style={[typographyStyles.subtitle, { color: themeColors.textSecondary }]}>
              Подзаголовок с описанием
            </Text>
          </View>
          
          <View style={containerStyles.optionsGroup}>
            {options.map((option) => {
              const isSelected = selectedOption === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={getOptionContainerStyle(isSelected, isDark)}
                  onPress={() => handleSelectOption(option.id)}
                  activeOpacity={0.8}
                >
                  {/* Левая часть опции */}
                  <View style={optionStyles.contentLeft}>
                    {/* Иконка */}
                    <View style={[
                      optionStyles.iconContainer, 
                      { backgroundColor: isSelected ? themeColors.optionBorderColorSelected + '20' : themeColors.optionBackground }
                    ]}>
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={isSelected ? themeColors.optionBorderColorSelected : themeColors.textSecondary}
                      />
                    </View>
                    
                    {/* Текстовый блок */}
                    <View style={optionStyles.textContainer}>
                      <Text style={[
                        typographyStyles.optionTitle, 
                        { color: isSelected ? themeColors.optionBorderColorSelected : themeColors.textPrimary }
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={[
                        typographyStyles.optionDescription, 
                        { color: themeColors.textSecondary }
                      ]}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Индикатор выбора */}
                  <View style={optionStyles.selectionIndicatorContainer}>
                    <View style={[
                      optionStyles.selectionIndicator,
                      { 
                        borderColor: isSelected ? themeColors.optionBorderColorSelected : themeColors.optionBorderColor 
                      }
                    ]}>
                      {isSelected && (
                        <View style={[
                          optionStyles.selectionIndicatorInner,
                          { backgroundColor: themeColors.optionBorderColorSelected }
                        ]} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
      
      {/* Навигационные кнопки */}
      <View style={containerStyles.navigationButtons}>
        <TouchableOpacity
          style={secondaryButtonStyles.containerStyle}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={secondaryButtonStyles.textStyle}>Назад</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={selectedOption ? primaryButtonStyles.containerStyle : disabledButtonStyles.containerStyle}
          onPress={selectedOption ? onContinue : undefined}
          disabled={!selectedOption}
          activeOpacity={0.8}
        >
          <Text style={selectedOption ? primaryButtonStyles.textStyle : disabledButtonStyles.textStyle}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExampleScreen;
```

## Преимущества новой системы

1. **Удобство рефакторинга** — для изменения стиля всех компонентов нужно обновить только определение стиля в файле unifiedStyles
2. **Единообразие** — все экраны будут выглядеть согласованно
3. **Адаптивность к темам** — система автоматически адаптируется к светлой или темной теме
4. **Поддержка** — легко добавлять новые компоненты и стили, сохраняя единую структуру
5. **Расширяемость** — можно легко добавить новые стили для новых типов компонентов

## Рекомендации по миграции

1. Создать файл с унифицированными стилями
2. Постепенно переводить каждый экран на новую систему стилей
3. Обновить общую логику управления темами
4. Протестировать в обеих темах и на разных устройствах

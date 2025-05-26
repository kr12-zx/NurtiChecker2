import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ======== ЦВЕТОВАЯ СИСТЕМА ========

// Современная синяя палитра по мотивам скриншота
export const palette = {
  // Основные цвета 
  primary: '#007AFF', // Яркий синий как на скриншоте
  primaryDark: '#0062CC',
  primaryLight: '#4A9DFF',
  secondary: '#34C759', // Зеленый для индикаторов успеха
  
  // Цвета фона
  background: {
    main: '#F8FAFF', // Очень светлый голубой фон (почти белый)
    card: '#FFFFFF', // Белый для карточек
    selected: '#E9F0FF', // Светло-голубой для выбранных элементов
    gradient: {
      top: '#E2EDFF',
      bottom: '#F8FAFF',
    },
    pattern: {
      main: 'rgba(0, 122, 255, 0.03)', // Полупрозрачный синий для паттернов
      accent: 'rgba(0, 122, 255, 0.08)',
    }
  },
  
  // Цвета текста
  text: {
    primary: '#333333',
    secondary: '#6D6D72',
    hint: '#8A8A8E',
    white: '#FFFFFF',
    blue: '#007AFF',
  },
  
  // Цвета границ и разделителей
  border: {
    light: '#E0E0E5',
    medium: '#C7C7CC',
    selected: '#007AFF',
  },
  
  // Цвета иконок
  icon: {
    primary: '#007AFF',
    secondary: '#8E8E93',
    light: '#C7C7CC',
  },
  
  // Семантические цвета
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
};

// ======== РАЗМЕРЫ И ОТСТУПЫ ========

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999, // Для полностью круглых элементов
};

// ======== ТИПОГРАФИКА ========

export const typography = StyleSheet.create({
  // Заголовки экранов
  headline: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0.36,
    textAlign: 'center',
    color: palette.text.primary,
  },
  
  // Подзаголовки
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.35,
    textAlign: 'center',
    color: palette.text.secondary,
    marginBottom: spacing.xl,
  },
  
  // Заголовок опции
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.35,
    color: palette.text.primary,
  },
  
  // Подпись опции
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
    color: palette.text.secondary,
    marginTop: spacing.xs,
  },
  
  // Текст кнопок
  button: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.35,
    textAlign: 'center',
  },
});

// ======== КОНТЕЙНЕРЫ ========

export const containers = StyleSheet.create({
  // Основной контейнер экрана
  screen: {
    flex: 1,
    backgroundColor: palette.background.main,
  },
  
  // Контент экрана
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  
  // Контейнер заголовка
  header: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  // Группа опций
  optionsGroup: {
    marginBottom: spacing.xl,
  },
  
  // Контейнер для кнопок навигации
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});

// ======== КОМПОНЕНТЫ ВЫБОРА ОПЦИЙ ========

export const options = StyleSheet.create({
  // Базовый контейнер опции
  container: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.background.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  
  // Левая часть опции (текст)
  contentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Иконка опции
  icon: {
    width: 40,
    height: 40,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Контейнер текста опции
  textContainer: {
    flex: 1,
  },
  
  // Контейнер для индикатора выбора (чекбокс/радио)
  selectionContainer: {
    marginLeft: spacing.md,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Индикатор выбора (контур)
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Внутренний круг индикатора (выбранное состояние)
  selectionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

// ======== КНОПКИ ========

export const buttons = StyleSheet.create({
  // Базовая кнопка
  base: {
    height: 50,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  
  // Основная кнопка
  primary: {
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Вторичная кнопка (обводка)
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.primary,
  },
  
  // Неактивная кнопка
  disabled: {
    backgroundColor: palette.border.light,
  },
  
  // Текст основной кнопки
  primaryText: {
    ...typography.button,
    color: palette.text.white,
  },
  
  // Текст вторичной кнопки
  secondaryText: {
    ...typography.button,
    color: palette.primary,
  },
  
  // Текст неактивной кнопки
  disabledText: {
    ...typography.button,
    color: palette.text.secondary,
  },
});

// ======== СТИЛИ ЧЕКБОКСОВ И РАДИОКНОПОК ========

export const selection = StyleSheet.create({
  // Контейнер чекбокса
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Контейнер радиокнопки
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Внутренний индикатор чекбокса
  checkmark: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.xs / 2,
  },
  
  // Внутренний индикатор радиокнопки
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

// ======== УТИЛИТЫ ДЛЯ ПРИМЕНЕНИЯ СТИЛЕЙ ========

// Функция для получения стилей опции
export const getOptionStyles = (isSelected: boolean, isDark: boolean): ViewStyle => {
  return {
    ...options.container,
    backgroundColor: isSelected ? palette.background.selected : palette.background.card,
    borderColor: isSelected ? palette.border.selected : palette.border.light,
  };
};

// Функция для получения стилей иконки
export const getIconStyles = (isSelected: boolean, isDark: boolean): ViewStyle => {
  return {
    ...options.icon,
    backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.1)' : 'rgba(142, 142, 147, 0.1)',
  };
};

// Функция для получения стилей текста опции
export const getOptionTextStyles = (isSelected: boolean, isDark: boolean): TextStyle => {
  return {
    ...typography.optionTitle,
    color: isSelected ? palette.primary : palette.text.primary,
    fontWeight: isSelected ? '600' : '500',
  };
};

// Функция для получения стилей индикатора выбора
export const getSelectionIndicatorStyles = (isSelected: boolean, isDark: boolean) => {
  const indicatorStyle: ViewStyle = {
    ...options.selectionIndicator,
    borderColor: isSelected ? palette.primary : palette.border.medium,
  };
  
  const dotStyle: ViewStyle = {
    ...options.selectionDot,
    backgroundColor: palette.primary,
  };
  
  return { indicatorStyle, dotStyle };
};

// Функция для получения стилей кнопки
export const getButtonStyles = (
  type: 'primary' | 'secondary' | 'disabled', 
  isDark: boolean
) => {
  let containerStyle: ViewStyle = {
    ...buttons.base
  };
  
  let textStyle: TextStyle = {
    ...typography.button
  };
  
  switch (type) {
    case 'primary':
      containerStyle = {
        ...containerStyle,
        ...buttons.primary,
      };
      textStyle = {
        ...textStyle,
        ...buttons.primaryText,
      };
      break;
    case 'secondary':
      containerStyle = {
        ...containerStyle,
        ...buttons.secondary,
      };
      textStyle = {
        ...textStyle,
        ...buttons.secondaryText,
      };
      break;
    case 'disabled':
      containerStyle = {
        ...containerStyle,
        ...buttons.disabled,
      };
      textStyle = {
        ...textStyle,
        ...buttons.disabledText,
      };
      break;
  }
  
  return {
    containerStyle,
    textStyle,
  };
};

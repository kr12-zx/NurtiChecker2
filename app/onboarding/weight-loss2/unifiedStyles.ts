// unifiedStyles.ts - Модульная система стилей для онбординга NutriChecker
// Использует единые стилевые константы для всех экранов

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ======== ЦВЕТОВАЯ СИСТЕМА ========

// Базовая палитра - современный минимализм
export const palette = {
  // Основные цвета бренда
  primary: '#5D5FEF', // Глубокий фиолетовый (сиреневый)
  primaryLight: '#8687E7', 
  secondary: '#FF5A5F', // Кораллово-красный
  secondaryLight: '#FF8087',
  tertiary: '#22A094', // Изумрудный
  
  // Фоновые цвета
  background: {
    // Минималистичные чистые цвета
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    light: '#F4F5FF', // Светлый фиолетовый оттенок для фона
    
    // Пастельные тона для фона
    lavender: '#EBEAFF', // Лавандовый
    mint: '#E8FAF6', // Мятный
    coral: '#FFE9EA', // Коралловый
    
    // Для темной темы
    darkBase: '#1E1E2E',
    darkSurface: '#2C2C3E',
  },
  
  // Функциональные цвета
  success: '#23D18B',
  warning: '#FFAC33',
  error: '#FF4777',
  
  // Нейтральные цвета (светлая тема)
  light: {
    background: '#FFFFFF',
    backgroundAlt: '#F6F8FC',
    surface: '#FAFBFF',
    border: '#E5E7F0',
    textPrimary: '#13141C',
    textSecondary: '#515773',
    disabled: '#9CA3AF',
  },
  
  // Нейтральные цвета (темная тема)
  dark: {
    background: '#13141C',
    backgroundAlt: '#1A1E2C',
    surface: '#272A3A',
    border: '#343A4F',
    textPrimary: '#F6F8FC',
    textSecondary: '#A7AECB',
    disabled: '#64677E',
  },
  
  // Дополнительные оттенки для градиентов
  gradients: {
    primaryStart: '#5C55FA',
    primaryEnd: '#7D7AFF',
    secondaryStart: '#FF5778',
    secondaryEnd: '#FF7A94',
  },
};

// Тематические цвета (зависят от светлой/темной темы)
export const lightThemeColors = {
  // Основные области
  background: palette.light.background,
  backgroundAlt: palette.light.backgroundAlt,
  surface: palette.light.surface,
  
  // Тексты
  textPrimary: palette.light.textPrimary,
  textSecondary: palette.light.textSecondary,
  
  // Элементы интерфейса
  primary: palette.primary,
  primaryLight: palette.primaryLight,
  accent: palette.secondary,
  
  // Компоненты выбора
  optionBackground: 'rgba(250, 251, 255, 0.85)',
  optionBackgroundSelected: 'rgba(125, 122, 255, 0.15)',
  optionBorderColor: 'rgba(92, 85, 250, 0.1)', 
  optionBorderColorSelected: palette.primary,
  
  // Иконки
  iconBackground: 'rgba(92, 85, 250, 0.08)', 
  iconBackgroundSelected: 'rgba(92, 85, 250, 0.15)',
  iconColor: palette.light.textSecondary,
  iconColorSelected: palette.primary,
  
  // Индикаторы выбора
  selectionIndicatorBorder: palette.light.border,
  selectionIndicatorFill: palette.primary,
  selectionIndicatorCheck: palette.light.background,
  
  // Кнопки (первичные)
  buttonPrimaryBackground: palette.primary,
  buttonPrimaryText: palette.light.background,
  
  // Кнопки (вторичные)
  buttonSecondaryBackground: 'transparent',
  buttonSecondaryBorder: palette.primary,
  buttonSecondaryText: palette.primary,
  
  // Кнопки (неактивные)
  buttonDisabledBackground: palette.light.border,
  buttonDisabledText: palette.light.disabled,
  
  // Поля ввода
  inputBackground: palette.light.surface,
  inputBorder: palette.light.border,
  inputText: palette.light.textPrimary,
  inputPlaceholder: palette.light.textSecondary,
  
  // Ошибки и уведомления
  error: palette.error,
  success: palette.success,
  warning: palette.warning,
  
  // Тени
  shadowColor: palette.primary,
  shadowColorAlt: palette.light.border,
  shadowOpacity: 0.12,
};

export const darkThemeColors = {
  // Основные области
  background: palette.dark.background,
  backgroundAlt: palette.dark.backgroundAlt,
  surface: palette.dark.surface,
  
  // Тексты
  textPrimary: palette.dark.textPrimary,
  textSecondary: palette.dark.textSecondary,
  
  // Элементы интерфейса
  primary: palette.primaryLight,
  primaryLight: palette.primary,
  accent: palette.secondary,
  
  // Компоненты выбора
  optionBackground: 'rgba(39, 42, 58, 0.85)',
  optionBackgroundSelected: 'rgba(94, 92, 230, 0.85)',
  optionBorderColor: 'rgba(122, 122, 255, 0.2)',
  optionBorderColorSelected: palette.primaryLight,
  
  // Иконки
  iconBackground: 'rgba(122, 122, 255, 0.15)',
  iconBackgroundSelected: 'rgba(122, 122, 255, 0.3)',
  iconColor: palette.dark.textSecondary,
  iconColorSelected: palette.primaryLight,
  
  // Индикаторы выбора
  selectionIndicatorBorder: palette.dark.border,
  selectionIndicatorFill: palette.primaryLight,
  selectionIndicatorCheck: palette.dark.background,
  
  // Кнопки (первичные)
  buttonPrimaryBackground: palette.primaryLight,
  buttonPrimaryText: palette.dark.background,
  
  // Кнопки (вторичные)
  buttonSecondaryBackground: 'transparent',
  buttonSecondaryBorder: palette.primaryLight,
  buttonSecondaryText: palette.primaryLight,
  
  // Кнопки (неактивные)
  buttonDisabledBackground: palette.dark.border,
  buttonDisabledText: palette.dark.disabled,
  
  // Поля ввода
  inputBackground: palette.dark.surface,
  inputBorder: palette.dark.border,
  inputText: palette.dark.textPrimary,
  inputPlaceholder: palette.dark.textSecondary,
  
  // Ошибки и уведомления
  error: palette.error,
  success: palette.success,
  warning: palette.warning,
  
  // Тени
  shadowColor: palette.primaryLight,
  shadowColorAlt: '#000000',
  shadowOpacity: 0.25,
};

// Функция для получения цветов в зависимости от темы
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkThemeColors : lightThemeColors;
};

// ======== РАЗМЕРЫ И ОТСТУПЫ ========

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 9999, // Для полностью круглых элементов
};

// ======== ТИПОГРАФИКА ========

export const typography = StyleSheet.create({
  // Заголовки
  headline: {
    fontSize: 24,
    fontWeight: '700', // Bold
    lineHeight: 32,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  
  // Подзаголовки
  subtitle: {
    fontSize: 16,
    fontWeight: '400', // Regular
    lineHeight: 22,
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  
  // Заголовки опций
  optionTitle: {
    fontSize: 16,
    fontWeight: '600', // Semibold
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  
  // Описания опций
  optionDescription: {
    fontSize: 13,
    fontWeight: '400', // Regular
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  
  // Кнопки
  button: {
    fontSize: 16,
    fontWeight: '600', // Semibold
    lineHeight: 22,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  
  // Обычный текст
  body: {
    fontSize: 15,
    fontWeight: '400', // Regular
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  
  // Подписи и мелкий текст
  caption: {
    fontSize: 13,
    fontWeight: '400', // Regular
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  
  // Сообщения об ошибках
  error: {
    fontSize: 14,
    fontWeight: '500', // Medium
    lineHeight: 18,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
});

// ======== КОНТЕЙНЕРЫ ========

export const containers = StyleSheet.create({
  // Основной контейнер экрана
  screen: {
    flex: 1,
    // Цвет фона задается динамически
  },
  
  // Контент экрана
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  
  // Заголовок экрана и подзаголовок
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  // Группа опций выбора
  optionsGroup: {
    width: '100%',
    marginVertical: spacing.md,
  },
  
  // Контейнер для навигационных кнопок внизу
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    width: '100%',
  },
  
  // Разделитель
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
    // Цвет задается динамически
  },
});

// ======== КОМПОНЕНТЫ ВЫБОРА ОПЦИЙ ========

export const options = StyleSheet.create({
  // Базовый контейнер опции
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    // Цвета фона и бордера задаются динамически
  },
  
  // Левая часть опции (иконка + текст)
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  // Контейнер для текста
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  
  // Контейнер для индикатора выбора
  selectionContainer: {
    marginLeft: spacing.md,
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
  
  // Внутренний круг индикатора (для выбранной опции)
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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

// ======== КНОПКИ ========

export const buttons = StyleSheet.create({
  // Базовая кнопка
  base: {
    height: 56,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
    // Цвета задаются динамически
  },
  
  // Контейнер для кнопок
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  
  // Стиль тени для кнопок
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    // shadowColor и shadowOpacity задаются динамически
  },
});

// ======== ПОЛЯ ВВОДА ========

export const inputs = StyleSheet.create({
  // Контейнер для поля ввода
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  
  // Лейбл поля ввода
  label: {
    marginBottom: spacing.xs,
    // Стиль текста задается отдельно
  },
  
  // Базовое поле ввода
  base: {
    height: 50,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    // Цвета задаются динамически
  },
  
  // Горизонтальное поле ввода с пикерами
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  
  // Пикер выбора
  picker: {
    height: 180,
    width: '100%',
    // Цвета задаются динамически
  },
});

// ======== УТИЛИТЫ ДЛЯ ПРИМЕНЕНИЯ СТИЛЕЙ ========

// Функция для получения премиального фона
export const getBackgroundStyle = (type: 'light' | 'lavender' | 'mint' | 'coral', isDark: boolean): ViewStyle => {
  // Если тёмная тема, используем тёмные цвета
  if (isDark) {
    return {
      backgroundColor: palette.background.darkBase,
    };
  }
  
  // Для светлой темы используем выбранный цвет
  return {
    backgroundColor: palette.background[type]
  };
};

// Современные стили кнопок
export const getModernButtonStyles = (type: 'primary' | 'secondary' | 'tertiary', isDark: boolean) => {
  const baseStyles: ViewStyle = {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: 120,
  };
  
  let specificStyle: ViewStyle = {};
  let textStyle: TextStyle = {};
  
  switch (type) {
    case 'primary':
      specificStyle = {
        backgroundColor: palette.primary,
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
      };
      textStyle = {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
      };
      break;
      
    case 'secondary':
      specificStyle = {
        backgroundColor: palette.secondary,
        shadowColor: palette.secondary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      };
      textStyle = {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
      };
      break;
      
    case 'tertiary':
      specificStyle = {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDark ? palette.primaryLight : palette.primary,
      };
      textStyle = {
        color: isDark ? palette.primaryLight : palette.primary,
        fontSize: 18,
        fontWeight: '600',
      };
      break;
  }
  
  return {
    containerStyle: { ...baseStyles, ...specificStyle },
    textStyle,
  };
};

// Функция для создания неоморфных эффектов для опций
export const getNeomorphicStyle = (isSelected: boolean, isDark: boolean): ViewStyle => {
  return {
    backgroundColor: isDark ? '#272A3A' : '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: isSelected ? 2 : 0,
    borderColor: isSelected ? palette.primary : 'transparent',
    marginBottom: 12,
    padding: 16,
  };
};

// Функция для получения стилей компонента опции
export const getOptionStyles = (isSelected: boolean, isDark: boolean): ViewStyle => {
  const themeColors = getThemeColors(isDark);
  
  return {
    ...options.container,
    backgroundColor: isSelected ? 'rgba(0, 112, 243, 0.15)' : '#FFFFFF',
    borderColor: isSelected ? palette.primary : 'rgba(0, 0, 0, 0.08)',
    borderRadius: 16, // Более скругленные углы
    marginBottom: 12, // Больше пространства между опциями
    paddingVertical: 16, // Больше внутренних отступов
    // Улучшенные тени
    shadowColor: isSelected ? palette.primary : 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
    shadowOpacity: isSelected ? 0.3 : 0.1,
    shadowRadius: isSelected ? 8 : 4,
    elevation: isSelected ? 5 : 2,
  };
};

// Функция для получения стилей иконки в опции
export const getIconContainerStyles = (isSelected: boolean, isDark: boolean): ViewStyle => {
  const themeColors = getThemeColors(isDark);
  
  return {
    ...options.iconContainer,
    backgroundColor: isSelected ? themeColors.iconBackgroundSelected : themeColors.iconBackground,
  };
};

// Функция для получения стилей текста опции
export const getOptionTextStyles = (isSelected: boolean, isDark: boolean): TextStyle => {
  const themeColors = getThemeColors(isDark);
  
  return {
    ...typography.optionTitle,
    color: isSelected ? themeColors.primary : themeColors.textPrimary,
  };
};

// Функция для получения стилей индикатора выбора
export const getSelectionIndicatorStyles = (isSelected: boolean, isDark: boolean) => {
  const themeColors = getThemeColors(isDark);
  
  const indicatorStyle: ViewStyle = {
    ...options.selectionIndicator,
    borderColor: isSelected ? themeColors.selectionIndicatorFill : themeColors.selectionIndicatorBorder,
    backgroundColor: 'transparent',
  };
  
  const dotStyle: ViewStyle = {
    ...options.selectionDot,
    backgroundColor: themeColors.selectionIndicatorFill,
    display: isSelected ? 'flex' : 'none',
  };
  
  return { indicatorStyle, dotStyle };
};

// Функция для получения стилей кнопки
export const getButtonStyles = (
  type: 'primary' | 'secondary' | 'disabled', 
  isDark: boolean
) => {
  const themeColors = getThemeColors(isDark);
  const baseStyle = buttons.base;
  
  let specificStyle: ViewStyle = {};
  let textStyle: TextStyle = { ...typography.button };
  
  switch (type) {
    case 'primary':
      specificStyle = {
        backgroundColor: palette.primary,
        borderRadius: 28,
        height: 56,
        // Улучшенные тени для кнопок
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      };
      textStyle = {
        ...typography.button,
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 18,
      };
      break;
      
    case 'secondary':
      specificStyle = {
        backgroundColor: 'transparent',
        borderColor: palette.primary,
        borderWidth: 1.5,
        borderRadius: 28,
        height: 56,
      };
      textStyle = {
        ...typography.button,
        color: palette.primary,
        fontWeight: '600',
        fontSize: 18,
      };
      break;
      
    case 'disabled':
      specificStyle = {
        backgroundColor: isDark ? 'rgba(80, 80, 80, 0.3)' : 'rgba(200, 200, 200, 0.3)',
        borderRadius: 28,
        height: 56,
      };
      textStyle = {
        ...typography.button,
        color: isDark ? 'rgba(180, 180, 180, 0.7)' : 'rgba(120, 120, 120, 0.7)',
        fontWeight: '600',
        fontSize: 18,
      };
      break;
  }
  
  return {
    containerStyle: { ...baseStyle, ...specificStyle },
    textStyle,
  };
};

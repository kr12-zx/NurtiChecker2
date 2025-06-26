import { Dimensions, StyleSheet, useColorScheme } from 'react-native';

// Получаем размеры экрана
const { width, height } = Dimensions.get('window');

/**
 * Основная палитра цветов с поддержкой светлой и темной темы
 * Цвета темной темы соответствуют стандартным цветам приложения
 */
export const colorTheme = {
  light: {
    primary: '#007AFF',         // Основной цвет (синий)
    secondary: '#5C8BEF',       // Вторичный цвет
    background: '#EBF3FF',      // Фон приложения
    surface: '#FFFFFF',         // Поверхности (карточки, элементы)
    white: '#FFFFFF',           // Белый цвет
    success: '#4CD964',         // Успех
    warning: '#FFA500',         // Предупреждение
    error: '#FF3B30',           // Ошибка
    text: {
      primary: '#333333',        // Основной текст
      secondary: '#666666',      // Вторичный текст
      tertiary: '#999999',       // Третичный текст
      accent: '#007AFF',         // Акцентный текст
      white: '#FFFFFF',          // Белый текст
      disabled: '#CCCCCC',       // Отключенный текст
    },
    border: {
      primary: '#007AFF',        // Основная граница
      secondary: '#E0E0E0',      // Вторичная граница
      inactive: '#DDDDDD',       // Неактивная граница
    },
    option: {
      selectedBorder: '#007AFF',         // Рамка выбранной опции
      unselectedBorder: '#DDDDDD',       // Рамка невыбранной опции
      selectedBackground: '#FFFFFF',      // Фон выбранной опции
      unselectedBackground: '#FFFFFF',    // Фон невыбранной опции
    },
    indicator: {
      active: '#007AFF',         // Активный индикатор
      inactive: '#DDDDDD',       // Неактивный индикатор
    },
  },
  dark: {
    primary: '#007AFF',         // Основной цвет (синий) - оставляем тот же для консистентности
    secondary: '#5C8BEF',       // Вторичный цвет
    background: '#000000',      // Фон приложения - черный как в основном приложении
    surface: '#1C1C1E',         // Поверхности (карточки, элементы) - стандартный цвет карточек
    white: '#FFFFFF',           // Белый цвет
    success: '#32D74B',         // Успех
    warning: '#FF9F0A',         // Предупреждение
    error: '#FF453A',           // Ошибка
    text: {
      primary: '#FFFFFF',        // Основной текст - белый
      secondary: '#AAAAAA',      // Вторичный текст - стандартный серый
      tertiary: '#888888',       // Третичный текст
      accent: '#007AFF',         // Акцентный текст
      white: '#FFFFFF',          // Белый текст
      disabled: '#666666',       // Отключенный текст
    },
    border: {
      primary: '#007AFF',        // Основная граница
      secondary: '#3A3A3C',      // Вторичная граница - стандартный цвет границ
      inactive: '#3A3A3C',       // Неактивная граница
    },
    option: {
      selectedBorder: '#007AFF',         // Рамка выбранной опции
      unselectedBorder: '#3A3A3C',       // Рамка невыбранной опции
      selectedBackground: '#1C1C1E',      // Фон выбранной опции
      unselectedBackground: '#1C1C1E',    // Фон невыбранной опции
    },
    indicator: {
      active: '#007AFF',         // Активный индикатор
      inactive: '#3A3A3C',       // Неактивный индикатор
    },
  }
};

/**
 * Функция для получения текущей палитры в зависимости от темы
 */
export const usePalette = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return isDark ? colorTheme.dark : colorTheme.light;
};

// DEPRECATED: Используйте usePalette() вместо статичной палитры для поддержки темной темы
// Эта палитра оставлена только для экранов, которые еще не мигрированы на динамические стили
export const palette = colorTheme.light;

// Функция для создания динамических стилей контейнеров
export const useContainerStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  // Корневой контейнер с фоном palette.background
  rootContainer: {
    flex: 1,
    backgroundColor: palette.background,
  },
  // Контейнер всего экрана
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  // Безопасная область верхнего уровня
  safeArea: {
    flex: 1,
      backgroundColor: palette.background,
  },
  // Область скролла
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Содержимое области скролла
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Отступ снизу для контента скролла (чтобы не перекрывались кнопки)
  },
  // Содержимое без ScrollView для экранов с виртуализированными списками
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Отступ снизу для контента (чтобы не перекрывались кнопки)
  },
  // Заголовок
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
    // Основной контейнер с контентом
  contentContainer: {
    flex: 1,
      backgroundColor: palette.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 90, // Ровно 90px, точно совпадает с высотой блока кнопок в ButtonFooter
    overflow: 'hidden',
  },
  optionsList: {
    marginTop: 20,
  },
    // Фон внизу экрана для кнопок
  bottomWhiteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -50, // Смещаем вниз за границы экрана, чтобы гарантированно закрыть область Home Indicator
      height: 180, // Значительно увеличиваем высоту блока, чтобы везде был гарантированный фон
      backgroundColor: palette.surface,
    // Добавляем тень для лучшего визуального разделения
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 50, // Увеличиваем z-index, чтобы гарантировать отображение поверх других элементов
  },
    // Область для кнопок внизу (SafeAreaView)
  buttonArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
      backgroundColor: palette.surface,
    paddingTop: 15,
    // Добавляем тень для лучшего визуального разделения
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 100, // Высокий z-index для отображения поверх всех элементов
  },
  // Контейнер для кнопок навигации
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: 'center',
  },
});
};

// Функция для создания динамических стилей типографики
export const useTypographyStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text.primary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: palette.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: palette.text.secondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: palette.text.secondary,
    lineHeight: 16,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: palette.text.primary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Для кнопки Назад
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
  },
  // Для кнопки Пропустить (используется тот же стиль что и для Назад)
  skipButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
  },
  // Для кнопки Продолжить
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.white,
  },
});
};

// Функция для создания динамических стилей опций
export const useOptionsStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectedOption: {
    borderColor: palette.option.selectedBorder,
    backgroundColor: palette.option.selectedBackground,
  },
  unselectedOption: {
    borderColor: palette.option.unselectedBorder,
    backgroundColor: palette.option.unselectedBackground,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckIconContainer: {
    backgroundColor: palette.primary,
  },
  unselectedCheckIconContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.border.inactive,
  },
  optionsList: {
    marginTop: 20,
  },
});
};

// Функция для создания динамических стилей кнопок
export const useButtonStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  // Кнопка назад
  backButton: {
    width: '35%', // Уже для кнопки Назад
    height: 44, // Компактная высота
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  // Кнопка пропустить (такая же как Назад по стилю)
  skipButton: {
    width: '35%',
    height: 44,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  // Кнопка продолжить
  continueButton: {
    width: '60%', // Шире для кнопки Продолжить
    height: 44, // Компактная высота
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.primary,
  },
  // Вторичная кнопка (для переходов между экранами)
  secondaryButton: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  // Стандартная кнопка опции
  optionButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  // Стили текста для кнопок
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.white,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
    marginLeft: 8,
    marginRight: 8,
  },
});
};

// Функция для создания динамических стилей индикаторов прогресса
export const useProgressIndicatorStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: palette.indicator.active,
  },
  inactiveDot: {
    backgroundColor: palette.indicator.inactive,
  },
});
};

// Функция для создания динамических стилей программы
export const useProgramStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
    marginBottom: 32, 
  },
  title: { 
    textAlign: 'center',
    marginBottom: 24,
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', 
  },
  step: {
    width: '30%', 
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 80, 
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
      backgroundColor: palette.surface,
  },
  stepText: { 
    fontSize: 12,
    textAlign: 'center',
      color: palette.text.secondary,
  },
});
};

// DEPRECATED: Статичные стили для обратной совместимости - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Используйте useContainerStyles() для поддержки темной темы
export const containers = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: palette.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 90,
    overflow: 'hidden',
  },
  optionsList: {
    marginTop: 20,
  },
  bottomWhiteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -50,
    height: 180,
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 50,
  },
  buttonArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.surface,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: 'center',
  },
});

// DEPRECATED: Статичные стили типографики - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Используйте useTypographyStyles() для поддержки темной темы
export const typography = StyleSheet.create({
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text.primary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: palette.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: palette.text.secondary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: palette.white,
  },
});

// DEPRECATED: Статичные стили опций - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Используйте useOptionsStyles() для поддержки темной темы
export const options = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectedOption: {
    borderColor: palette.option.selectedBorder,
    backgroundColor: palette.option.selectedBackground,
  },
  unselectedOption: {
    borderColor: palette.option.unselectedBorder,
    backgroundColor: palette.option.unselectedBackground,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckIconContainer: {
    backgroundColor: palette.primary,
  },
  unselectedCheckIconContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.border.inactive,
  },
});

// DEPRECATED: Статичные стили кнопок - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Используйте useButtonStyles() для поддержки темной темы
export const buttons = StyleSheet.create({
  backButton: {
    width: '35%',
    height: 44,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  skipButton: {
    width: '35%',
    height: 44,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  continueButton: {
    width: '60%',
    height: 44,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.primary,
  },
  optionButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
});

// DEPRECATED: Статичные стили индикаторов - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Используйте useProgressIndicatorStyles() для поддержки темной темы
export const progressIndicators = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: palette.indicator.active,
  },
  inactiveDot: {
    backgroundColor: palette.indicator.inactive,
  },
});

// DEPRECATED: Статичные стили программы - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Используйте useProgramStyles() для поддержки темной темы
export const program = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
    marginBottom: 32, 
  },
  title: { 
    textAlign: 'center',
    marginBottom: 24,
  },
  steps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  step: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 80, 
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: palette.surface,
  },
  stepText: { 
    fontSize: 12,
    textAlign: 'center',
  },
});

// Функция для создания динамических стилей экранов с иконками
export const useIconContainerStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
      backgroundColor: palette.surface,
    marginBottom: 16,
    alignSelf: 'center'
  },
    headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
      backgroundColor: palette.surface,
      marginBottom: -56,
    alignSelf: 'center'
  },
  });
};

// Функция для создания динамических стилей карточек и секций
export const useCardStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
    section: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 20,
    marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  // Калорийный бюджет карточка
  budgetCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: '700',
    color: palette.text.primary,
    textAlign: 'center',
  },
  calorieUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.inactive,
    marginVertical: 16,
  },
  budgetDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.text.primary,
    flex: 1,
  },
  // Советы контейнер
  tipsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
    flex: 1,
  },
  infoContainer: {
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 16
  },
  infoText: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20
  },
    noteContainer: {
      backgroundColor: palette.surface,
    padding: 16,
    borderRadius: 12,
      marginBottom: 20,
    flexDirection: 'row',
      alignItems: 'flex-start'
  },
    noteText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
      lineHeight: 20,
      fontStyle: 'italic'
  }
});
};

// Функция для создания динамических стилей для пикеров
export const usePickerStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
    pickerContainer: {
    flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 200,
      marginVertical: 32,
    },
    ageText: {
    textAlign: 'center',
      fontSize: 18,
      fontWeight: '500',
      marginTop: 10,
      color: palette.text.primary,
    }
  });
};

// Функция для создания динамических стилей для экранов с программами
export const useProgramContainerStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
    programContainer: {
      marginTop: 24,
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border.inactive,
    },
    programTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text.primary,
      marginBottom: 16,
      textAlign: 'center'
    },
    programContent: {
      gap: 8
    },
    programItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    activeItem: {
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
    nextStepItem: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderWidth: 1,
      borderColor: palette.primary,
    },
    inactiveItem: {
      opacity: 0.6
    },
    programIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: palette.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    programText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: palette.text.primary
    },
    inactiveText: {
      color: palette.text.disabled
    },
    programCheckmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: palette.primary,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
};

// Функция для создания динамических стилей для полей ввода
export const useInputStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.text.primary,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: palette.border.inactive,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: palette.text.primary,
      backgroundColor: palette.surface,
  },
  focusedInput: {
    borderColor: palette.primary,
  },
  errorInput: {
      borderColor: palette.error,
  },
  errorText: {
    fontSize: 14,
      color: palette.error,
    marginTop: 4,
  },
});
};

// Функция для создания динамических стилей для специальных опций
export const useSpecialOptionStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
    recommendedOption: {
      borderLeftWidth: 4,
      borderLeftColor: palette.success,
    },
    recommendedText: {
      fontSize: 12,
      color: palette.success,
      marginTop: 4,
    },
    descriptionText: {
      fontSize: 12,
      color: palette.text.secondary,
      marginTop: 4,
      lineHeight: 16,
    },
    disclaimerText: {
      fontSize: 12,
      color: palette.text.secondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 16,
      lineHeight: 16
    },
    // Стили для планов похудения
    planOption: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    recommendedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: palette.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    recommendedBadgeText: {
      fontSize: 12,
      color: palette.white,
      fontWeight: '600',
    },
    planTextContainer: {
      flex: 1,
      marginLeft: 8,
    },
    planDetails: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.border.inactive,
    },
    planDetailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    planDetailLabel: {
      fontSize: 13,
      color: palette.text.secondary,
    },
    planDetailValue: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text.primary,
    },
  });
};

// Функция для создания динамических стилей настройки целей
export const useGoalSettingStyles = () => {
  const palette = usePalette();
  
  return StyleSheet.create({
    optionsContainer: {
    marginTop: 20,
    },
    pickerContainer: {
    flexDirection: 'row',
      justifyContent: 'center',
    alignItems: 'center',
      marginVertical: 20,
    },
    nextStepButton: {
      flexDirection: 'row',
      height: 44,
      borderWidth: 1,
      borderColor: palette.primary,
    borderRadius: 30,
      justifyContent: 'center',
    alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      marginTop: 20,
    },
    nextStepText: {
      fontSize: 16,
      fontWeight: '600',
    textAlign: 'center',
    color: palette.primary,
      marginLeft: 8,
      marginRight: 8,
    },
    navigationButtons: {
    flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    navigationButton: {
    flexDirection: 'row',
      height: 44,
      borderWidth: 1,
      borderColor: palette.primary,
      borderRadius: 30,
      justifyContent: 'center',
    alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      flex: 0.48,
    },
    targetDateContainer: {
      backgroundColor: palette.surface,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
    alignItems: 'center',
  },
    targetDateLabel: {
      fontSize: 14,
      fontWeight: '500',
    color: palette.text.secondary,
      marginBottom: 4,
  },
    targetDate: {
    fontSize: 16,
      fontWeight: '600',
    color: palette.text.primary,
    },
  });
};

// DEPRECATED: Специальные стили для отдельных экранов - НЕ ПОДДЕРЖИВАЮТ ТЕМНУЮ ТЕМУ
// Эти объекты созданы для совместимости с импортами, но они пустые
// Используйте соответствующие use*Styles() хуки для поддержки темной темы
export const weightLossPlan = {
  recommendedBadgeText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  planTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 }
};
export const nutritionIntro = {};
export const decisionMaking = {};
export const difficultSituationsStyles = {
  handlingOption: {},
  handlingTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 }
};
export const summaryPlanStyles = {
  planStatusContainer: {},
  statusText: { fontSize: 16, color: '#333333', textAlign: 'center' },
  actionButtonsContainer: {},
  actionButton: {},
  actionButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  infoContainer: {},
  infoTitle: { fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 16 },
  infoItem: { flexDirection: 'row', marginBottom: 8 },
  infoBullet: { fontSize: 16, color: '#333333', marginRight: 8 },
  infoText: { fontSize: 14, color: '#333333', flex: 1 }
};
export const mealFeelings = {
  feelingOption: {},
  feelingTextContainer: {},
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  }
};
export const planSummary = {
  summaryContainer: {},
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  summaryTextContainer: { flex: 1 },
  summaryLabel: { fontSize: 14, color: '#666666', marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: '500', color: '#333333' },
  nextStepsContainer: { marginTop: 24 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#007AFF', color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 24, marginRight: 12 },
  stepText: { flex: 1, fontSize: 14, color: '#333333', lineHeight: 20 },
  motivationText: { fontSize: 16, color: '#333333', textAlign: 'center', fontStyle: 'italic', marginTop: 24 }
};
export const temptationResponseStyles = {
  responseOption: {},
  responseTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 }
};
export const setbacksResponseStyles = {
  responseOption: {},
  responseTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 }
};
export const medicalDisclaimer = {};
export const onboardingIndex = {};
export const goalSetting = {};

// Дополнительные объекты для совместимости с базовыми стилями
export const dietPreferences = {};
export const calorieSchedule = {
  scheduleTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 },
  recommendedText: { fontSize: 12, color: '#007AFF', marginTop: 4, fontWeight: '500' }
};
export const paywall = {
  headerContainer: {},
  premiumBadgeText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  plansContainer: {},
  popularBadgeText: { fontSize: 12, color: '#FF9500', fontWeight: '600' },
  benefitText: { fontSize: 14, color: '#333333', marginBottom: 8 },
  subscribeButton: {},
  subscribeButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  restoreButton: {},
  restoreButtonText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  termsContainer: {},
  termsText: { fontSize: 12, color: '#666666', textAlign: 'center' }
};
export const generatingPlan = {
  loadingContainer: {},
  loadingIconContainer: {},
  loadingIndicatorContainer: {}
};
export const confidenceLevel = {};
export const medication = {
  optionsContainer: {},
  medicationTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 },
  disclaimerText: { fontSize: 12, color: '#666666', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
};
export const planReady = {
  successContainer: {},
  featureText: { fontSize: 14, color: '#333333', marginBottom: 8 },
  ctaContainer: {},
  ctaText: { fontSize: 16, color: '#333333', textAlign: 'center' }
};
export const calorieBudgetIntro = {
  programContainer: {},
  programIconContainer: {},
  programText: { fontSize: 14, color: '#333333' },
  inactiveText: { color: '#999999' },
  infoContainer: {},
  infoText: { fontSize: 14, color: '#666666', marginBottom: 8 }
};
export const nutritionFocus = {};
export const weightManagement = {
  optionsContainer: {},
  obstacleTextContainer: {},
  descriptionText: { fontSize: 14, color: '#666666', marginTop: 4 },
  helpNoteContainer: {},
  helpNoteText: { fontSize: 12, color: '#666666', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
};
export const eatingHabitsAssessment = {};
export const stressResponse = {};
export const fixedCalorieBudgetConfirm = {};
export const foodPreferences = {};
export const summary = {
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  summaryLabel: { fontSize: 14, marginBottom: 4 },
  calorieLabel: { fontSize: 14, marginBottom: 4 },
  macroLabel: { fontSize: 14, marginBottom: 4 }
};
export const goalSetConfirm = {};
export const intermittentFastingSkipConfirm = {};
export const calorieBudgetConfirm = {};
export const adaptability = {};
export const foodVarietyStyles = {};
export const planPreview = {};
export const goalDateIntro = {};
export const activityLevel = {};
export const exerciseBenefits = {};
export const intermittentFasting = {};
export const tutorials = {};
export const challengesScreen = {};
export const calorieBudget = {};

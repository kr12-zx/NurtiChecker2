import { Dimensions, StyleSheet, useColorScheme } from 'react-native';

// Получаем размеры экрана
const { width, height } = Dimensions.get('window');

/**
 * Основная палитра цветов с поддержкой светлой и темной темы
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
    primary: '#0A84FF',         // Основной цвет (синий)
    secondary: '#5C8BEF',       // Вторичный цвет
    background: '#121212',      // Фон приложения
    surface: '#1E1E1E',         // Поверхности (карточки, элементы)
    white: '#FFFFFF',           // Белый цвет
    success: '#32D74B',         // Успех
    warning: '#FF9F0A',         // Предупреждение
    error: '#FF453A',           // Ошибка
    text: {
      primary: '#EEEEEE',        // Основной текст
      secondary: '#AAAAAA',      // Вторичный текст
      tertiary: '#888888',       // Третичный текст
      accent: '#0A84FF',         // Акцентный текст
      white: '#FFFFFF',          // Белый текст
      disabled: '#666666',       // Отключенный текст
    },
    border: {
      primary: '#0A84FF',        // Основная граница
      secondary: '#333333',      // Вторичная граница
      inactive: '#444444',       // Неактивная граница
    },
    option: {
      selectedBorder: '#0A84FF',         // Рамка выбранной опции
      unselectedBorder: '#444444',       // Рамка невыбранной опции
      selectedBackground: '#252525',      // Фон выбранной опции
      unselectedBackground: '#1E1E1E',    // Фон невыбранной опции
    },
    indicator: {
      active: '#0A84FF',         // Активный индикатор
      inactive: '#444444',       // Неактивный индикатор
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

// Совместимость со старым кодом, позже можно удалить
export const palette = colorTheme.light;

// Стили для контейнеров
export const containers = StyleSheet.create({
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
    backgroundColor: palette.background, // Голубой фон
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
  // Основной контейнер с контентом (голубой фон)
  contentContainer: {
    flex: 1,
    backgroundColor: palette.background, // Голубой фон
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
  // Белый фон внизу экрана для кнопок
  bottomWhiteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -50, // Смещаем вниз за границы экрана, чтобы гарантированно закрыть область Home Indicator
    height: 180, // Значительно увеличиваем высоту белого блока, чтобы везде был гарантированный белый фон
    backgroundColor: palette.white,
    // Добавляем тень для лучшего визуального разделения
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 50, // Увеличиваем z-index, чтобы гарантировать отображение поверх других элементов
  },
  // Белая область для кнопок внизу (SafeAreaView)
  buttonArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', // Гарантированный белый цвет
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

// Типографика
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

// Стили для опций (элементов выбора)
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

// Стили для кнопок
export const buttons = StyleSheet.create({
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
  // Стандартная кнопка опции
  optionButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
});

// Индикаторы прогресса
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

// Стили для экрана программы
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
    backgroundColor: palette.background,
  },
  stepText: { 
    fontSize: 12,
    textAlign: 'center',
  },
});

// Стили для обучающего контента (туториалы)
export const tutorials = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: palette.text.primary,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: palette.primary,
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.text.white,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },
  tip: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.surface,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: palette.text.primary,
  }
});

// Стили для экрана калорийного бюджета
export const calorieBudget = StyleSheet.create({
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
  stepsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: palette.surface,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: palette.text.primary,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
  },
  calorieContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: palette.surface,
  },
  calorieLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: palette.text.secondary,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: palette.primary,
  },
  calorieNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: palette.text.primary,
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: palette.text.secondary,
  }
});

// Стили для экрана препятствий управления весом
export const weightManagement = StyleSheet.create({
  optionsContainer: {
    marginTop: 20,
  },
  obstacleOption: {
    marginBottom: 12,
  },
  obstacleTextContainer: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: palette.text.secondary,
    marginTop: 2,
  },
  helpNoteContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: palette.surface,
    borderRadius: 10,
  },
  helpNoteText: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
  },
});

// Стили для экрана ввода роста и веса
export const heightWeight = StyleSheet.create({
  pickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginVertical: 32,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  nextStepText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
    color: palette.primary,
  }
});

// Стили для экрана введения в бюджет калорий
export const calorieBudgetIntro = StyleSheet.create({
  programContainer: {
    marginTop: 24,
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  programTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center'
  },
  programContent: {
    gap: 12
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: palette.background,
  },
  nextStepItem: {
    backgroundColor: palette.background,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  inactiveItem: {
    opacity: 0.6
  },
  programIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.white,
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
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoContainer: {
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 12
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    marginBottom: 16
  },
  infoIcon: {
    marginBottom: 8
  }
});

// Стили для экрана приема лекарств
export const medication = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  optionsContainer: {
    marginTop: 20,
  },
  medicationOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  medicationTextContainer: {
    flex: 1,
    paddingRight: 12,
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
  }
});

// Стили для экрана введения в питание
export const nutritionIntro = StyleSheet.create({
  programContainer: {
    marginTop: 24,
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  programTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text.secondary,
    marginBottom: 16,
    textAlign: 'center'
  },
  programContent: {
    gap: 12
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: palette.surface,
  },
  nextStepItem: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  inactiveItem: {
    opacity: 0.6
  },
  programIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.white,
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
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center'
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
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20
  },
  nextStepsContainer: {
    backgroundColor: palette.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  nextStepsText: {
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
    fontStyle: 'italic'
  }
});

// Стили для экрана подтверждения цели
export const goalSetConfirm = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  // Специальная иконка для headerIcon (чтобы поместиться в исходное пространство)
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: -56, // Исходный marginTop заголовка 24px, иконка 80px, нужно чтобы итого было 24px: 80 - 56 = 24px
    alignSelf: 'center'
  },
  programContainer: {
    marginTop: 24,
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  programTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text.secondary,
    marginBottom: 16,
    textAlign: 'center'
  },
  programContent: {
    gap: 12
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: palette.surface,
  },
  inactiveItem: {
    opacity: 0.6
  },
  programIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.white,
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
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  goalInfoContainer: {
    marginBottom: 20
  },
  goalInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 8
  },
  goalInfoText: {
    fontSize: 16,
    color: palette.primary,
    marginBottom: 8,
    fontWeight: '500'
  },
  goalInfoHint: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20
  }
});

// Стили для экрана настройки целей
export const goalSetting = StyleSheet.create({
  optionsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  pickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginVertical: 32,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  nextStepText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetDateContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: palette.surface,
    borderRadius: 12,
  },
  targetDateLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  targetDate: {
    fontSize: 18,
    fontWeight: '600',
  }
});

// Стили для экрана подтверждения пропуска интервального голодания
export const intermittentFastingSkipConfirm = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  infoContainer: {
    marginTop: 24,
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 16
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    marginRight: 12,
    marginTop: 2
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20
  },
  noteContainer: {
    backgroundColor: palette.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  noteIcon: {
    marginRight: 12,
    marginTop: 2
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic'
  }
});

// Стили для экрана интервального голодания
export const intermittentFasting = StyleSheet.create({
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
  optionsContainer: {
    marginTop: 16,
  },
  recommendedOption: {
    borderLeftWidth: 4,
    borderLeftColor: palette.success,
  },
  recommendedText: {
    fontSize: 12,
    marginTop: 4,
  }
});

// Стили для экрана разнообразия пищи
export const foodVarietyStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  varietyOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  varietyTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

// Стили для экрана ощущений после еды
export const mealFeelings = StyleSheet.create({
  feelingOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  feelingTextContainer: {
    flex: 1,
    paddingRight: 12,
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
  }
});

// Стили для экрана препятствий
export const challengesScreen = StyleSheet.create({
  optionsContainer: {
    marginTop: 16,
  }
});

// Стили для экрана предпочтений в диете
export const dietPreferences = StyleSheet.create({
  optionsContainer: {
    marginTop: 16,
  }
});

// Стили для экрана предпочтений в еде
export const foodPreferences = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  priorityOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  priorityTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

// Стили для основного компонента онбординга
export const onboardingIndex = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: palette.border.inactive,
    position: 'absolute',
    top: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: palette.primary,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.border.inactive,
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: palette.primary,
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
});

// Стили для экрана выбора единиц измерения
export const units = StyleSheet.create({
  optionsContainer: {
    marginTop: 20,
  }
});

// Стили для экрана преимуществ упражнений
export const exerciseBenefits = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  benefitsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
  },
  recommendationContainer: {
    backgroundColor: palette.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  recommendationText: {
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
    fontWeight: '500',
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  }
});

// Стили для экрана намерения заниматься физическими упражнениями
export const exerciseIntentStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  // Специальная иконка для headerIcon (чтобы поместиться в исходное пространство)
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: -56, // Исходный marginTop заголовка 24px, иконка 80px, нужно чтобы итого было 24px: 80 - 56 = 24px
    alignSelf: 'center'
  }
});

// Стили для экрана сводки плана
export const summary = StyleSheet.create({
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  nutritionContainer: {
    alignItems: 'center',
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    alignItems: 'center',
    width: '30%',
  },
  macroIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 12,
  }
});

export const confidenceLevel = StyleSheet.create({
  confidenceContainer: {
    marginTop: 24,
  },
  confidenceOption: {
    marginBottom: 12,
  },
  scaleContainer: {
    marginTop: 32,
    width: '100%',
  },
  scaleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scalePoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.indicator.inactive,
  },
  activeScalePoint: {
    backgroundColor: palette.primary,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  scaleLabel: {
    fontSize: 14,
    color: palette.text.secondary,
  }
});

export const stressResponse = StyleSheet.create({
  optionsContainer: {
    marginTop: 16,
  },
  responseOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  responseTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  noteContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: palette.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
  },
  noteText: {
    fontSize: 12,
    color: palette.text.secondary,
    lineHeight: 16,
  }
});

export const adaptability = StyleSheet.create({
  optionsContainer: {
    marginTop: 16,
  },
  adaptabilityOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  adaptabilityTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

export const nutritionFocus = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  recommendedOption: {
    borderLeftWidth: 4,
    borderLeftColor: palette.success,
  },
  recommendedText: {
    fontSize: 12,
    color: palette.success,
    marginTop: 4,
  },
  nutritionOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  nutritionTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

export const eatingHabitsAssessment = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center',
    position: 'relative'
  },
  secondIcon: {
    position: 'absolute',
    bottom: 12,
    right: 14
  },
  assessmentOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  assessmentTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  tipContainer: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: palette.background,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
  }
});

export const calorieSchedule = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  recommendedOption: {
    borderLeftWidth: 4,
    borderLeftColor: palette.success,
  },
  recommendedText: {
    fontSize: 12,
    color: palette.success,
    marginTop: 4,
  },
  scheduleOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  scheduleTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

export const summaryPlanStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  planStatusContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    backgroundColor: palette.background,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.text.primary,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: palette.white,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoBullet: {
    fontSize: 18,
    color: palette.primary,
    marginRight: 12,
    fontWeight: '600'
  },
  infoText: {
    fontSize: 14,
    color: palette.text.primary,
  },
  nextStepContainer: {
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 8,
  },
  nextStepText: {
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
  }
});

export const planSummary = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  summaryContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: palette.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
  },
  nextStepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    color: palette.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 12,
    lineHeight: 24,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.primary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  infoBullet: {
    fontSize: 18,
    color: palette.primary,
    marginRight: 12,
    fontWeight: 'bold',
  }
});

// Стили для экрана сложных ситуаций
export const difficultSituationsStyles = StyleSheet.create({
  handlingOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  handlingTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

// Стили для экрана введения даты цели
export const goalDateIntro = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  infoContainer: {
    marginTop: 24,
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 16
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start'
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20
  },
  questionsPreviewContainer: {
    backgroundColor: palette.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  questionsPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 12
  },
  questionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center'
  },
  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.background,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    color: palette.primary,
    marginRight: 12
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20
  },
  noteContainer: {
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: palette.text.secondary,
    lineHeight: 20
  }
});

// Стили для экрана реакции на искушения
export const temptationResponseStyles = StyleSheet.create({
  responseOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  responseTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

// Стили для экрана реакции на неудачи
export const weightLossPlan = StyleSheet.create({
  planOption: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingTop: 24, // Дополнительное место для бейджа рекомендации
    position: 'relative', // Для позиционирования бейджа
  },
  recommendedOption: {
    borderWidth: 2,
    borderColor: palette.success,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    backgroundColor: palette.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedBadgeText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  planDetails: {
    marginTop: 12,
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 8,
  },
  planDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planDetailLabel: {
    fontSize: 12,
    color: palette.text.secondary,
  },
  planDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.text.primary,
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
  }
});

export const decisionMaking = StyleSheet.create({
  confidenceOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  confidenceTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

export const setbacksResponseStyles = StyleSheet.create({
  responseOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  responseTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

// Стили для экрана медицинского отказа от ответственности
export const medicalDisclaimer = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  disclaimerCard: {
    marginTop: 24,
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFA500', // Оранжевый цвет для предупреждения
  },
  disclaimerText: {
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.inactive,
    marginVertical: 12,
  },
  infoContainer: {
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 12
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start'
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20
  },
  acknowledgementContainer: {
    backgroundColor: palette.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  acknowledgementText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: palette.text.primary,
    lineHeight: 20
  }
});

// Стили для экрана подтверждения фиксированного бюджета калорий
export const fixedCalorieBudgetConfirm = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  budgetCardContainer: {
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  budgetCard: {
    backgroundColor: palette.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: palette.primary,
  },
  calorieUnit: {
    fontSize: 14,
    color: palette.text.secondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.inactive,
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
    textAlign: 'center',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
  }
});

// Стили для экрана подтверждения бюджета калорий
export const calorieBudgetConfirm = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.background,
    marginBottom: 16,
    alignSelf: 'center'
  },
  budgetCardContainer: {
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  budgetCard: {
    backgroundColor: palette.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: palette.primary,
  },
  calorieUnit: {
    fontSize: 14,
    color: palette.text.secondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.inactive,
    marginBottom: 16,
  },
  budgetDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: palette.text.primary,
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: palette.text.primary,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: palette.text.secondary,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  }
});

// Стили для экрана даты рождения
export const birthday = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  ageText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 10,
    color: palette.text.primary,
  }
});

// Стили для экрана выбора пола
export const gender = StyleSheet.create({
  optionsContainer: {
    marginTop: 20,
  }
});

// Стили для экрана уровня активности
export const activityLevel = StyleSheet.create({
  optionsContainer: {
    marginTop: 20,
  }
});

// Стили для экрана основной цели
export const primaryGoal = StyleSheet.create({
  optionsContainer: {
    marginTop: 20,
  },
  goalOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  goalTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

// Унифицированные формы ввода
export const inputs = StyleSheet.create({
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
  },
  focusedInput: {
    borderColor: palette.primary,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 4,
  },
});

// Стили для экрана генерации плана
export const generatingPlan = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 60
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  socialProofTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: 8,
    textAlign: 'center'
  },
  socialProofSubtitle: {
    fontSize: 18,
    color: palette.text.secondary,
    textAlign: 'center'
  },
  loadingIndicatorContainer: {
    marginTop: 60,
    flexDirection: 'row',
    gap: 8
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary + '30'
  }
});

// Стили для экрана готовности плана
export const planReady = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.success + '20',
    marginBottom: 24,
    alignSelf: 'center'
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.success,
    textAlign: 'center',
    marginBottom: 16
  },
  successSubtitle: {
    fontSize: 16,
    color: palette.text.secondary,
    textAlign: 'center',
    lineHeight: 24
  },
  featuresList: {
    marginTop: 32,
    marginBottom: 24
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 20,
    textAlign: 'left'
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2
  },
  featureBullet: {
    fontSize: 18,
    color: palette.primary,
    marginRight: 12,
    marginTop: 2,
    fontWeight: '600'
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: palette.text.primary,
    lineHeight: 22
  },
  featureHighlight: {
    fontWeight: '600',
    color: palette.primary
  },
  ctaContainer: {
    backgroundColor: palette.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.primary,
    textAlign: 'center',
    lineHeight: 24
  }
});

// Стили для экрана Paywall
export const paywall = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30
  },
  premiumBadge: {
    backgroundColor: palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16
  },
  premiumBadgeText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600'
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.text.primary,
    textAlign: 'center',
    marginBottom: 8
  },
  mainSubtitle: {
    fontSize: 16,
    color: palette.text.secondary,
    textAlign: 'center',
    lineHeight: 22
  },
  plansContainer: {
    marginTop: 24,
    marginBottom: 24
  },
  planOption: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedPlan: {
    borderColor: palette.primary,
    backgroundColor: palette.primary + '10'
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: palette.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  popularBadgeText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '600'
  },
  planDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text.primary,
    marginBottom: 4
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.primary,
    marginBottom: 2
  },
  planPeriod: {
    fontSize: 14,
    color: palette.text.secondary
  },
  planSavings: {
    fontSize: 12,
    color: palette.success,
    fontWeight: '600',
    marginTop: 4
  },
  benefitsList: {
    marginBottom: 24
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  benefitIcon: {
    marginRight: 12
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: palette.text.primary,
    lineHeight: 22
  },
  subscribeButton: {
    backgroundColor: palette.primary,
    borderRadius: 30,
    paddingVertical: 16,
    marginBottom: 16
  },
  subscribeButtonText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  restoreButton: {
    paddingVertical: 12,
    marginBottom: 8
  },
  restoreButtonText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  termsText: {
    fontSize: 12,
    color: palette.text.secondary,
    textAlign: 'center',
    lineHeight: 16
  },
  termsLink: {
    color: palette.primary,
    textDecorationLine: 'underline'
  }
});

// Стили для экрана PlanPreview
export const planPreview = StyleSheet.create({
  section: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginLeft: 12
  },
  nutritionContainer: {
    alignItems: 'center'
  },
  calorieCard: {
    alignItems: 'center',
    marginBottom: 20
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.primary
  },
  calorieLabel: {
    fontSize: 16,
    color: palette.text.secondary,
    marginTop: 4
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  macroItem: {
    alignItems: 'center',
    flex: 1
  },
  macroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text.primary,
    marginBottom: 4
  },
  macroLabel: {
    fontSize: 14,
    color: palette.text.secondary
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8
  },
  recommendationLabel: {
    fontSize: 16,
    color: palette.text.secondary,
    flex: 1
  },
  recommendationValue: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.text.primary,
    flex: 1,
    textAlign: 'right'
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 16
  },
  tipText: {
    fontSize: 16,
    color: palette.text.primary,
    lineHeight: 22,
    marginLeft: 12,
    flex: 1
  },
  trialSection: {
    backgroundColor: palette.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  trialTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.white,
    textAlign: 'center',
    marginBottom: 8
  },
  trialSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.white,
    textAlign: 'center',
    marginBottom: 16
  },
  trialDescription: {
    fontSize: 16,
    color: palette.white,
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9
  },
  trialButton: {
    backgroundColor: palette.white,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    minWidth: '80%'
  },
  trialButtonText: {
    color: palette.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  trialNote: {
    fontSize: 13,
    color: palette.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 18
  }
});

// Этот файл будет содержать общие стили для нового онбординга Weight-Loss2
// на основе design-system-documentation.md

import { StyleSheet } from 'react-native';

// --- Интерфейс для цветовой темы ---
export interface ColorTheme {
  background: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
  optionBackground: string;
  optionBackgroundSelected: string;
  optionBorderColor: string;
  optionBorderColorSelected: string;
  iconContainerBackground: string;
  iconContainerBackgroundSelected: string;
  iconColor: string;
  iconColorSelected: string;
  selectionIndicatorBorder: string;
  selectionIndicatorBackground: string;
  selectionIndicatorCheckmark: string;
  navButtonPrimaryBackground: string;
  navButtonPrimaryText: string;
  navButtonSecondaryBackground: string;
  navButtonSecondaryText: string;
  navButtonSecondaryBorder: string;
  navButtonDisabledBackground: string; // Новый стиль
  navButtonDisabledText: string; // Новый стиль
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  error: string;
  // Добавьте другие общие ключи сюда при необходимости
}

// --- Цветовые палитры ---
export const lightThemeColors: ColorTheme = {
  background: '#FFFFFF',                     // Фоновый цвет (светлая тема)
  textPrimary: '#333333',                   // Основной текст (светлая тема)
  textSecondary: '#666666',                 // Вторичный текст (светлая тема)
  primaryAccent: '#007AFF',                 // Основной цвет (Primary)
  
  optionBackground: '#F9F9F9',              // Фон обычной опции (светлая тема)
  optionBackgroundSelected: '#E6F2FF',      // Фон выбранной опции (светлая тема)
  optionBorderColor: 'transparent',           // Цвет рамки обычной опции (светлая тема) - обычно прозрачный
  optionBorderColorSelected: '#007AFF',     // Цвет рамки выбранной опции (светлая тема)

  iconContainerBackground: '#F0F0F0',         // Фон контейнера иконки (неактивный, светлая тема)
  iconContainerBackgroundSelected: '#E6F2FF',// Фон контейнера иконки (активный, светлая тема)
  iconColor: '#666666',                     // Цвет иконки (неактивный, светлая тема)
  iconColorSelected: '#007AFF',              // Цвет иконки (активный, светлая тема)

  selectionIndicatorBorder: '#CCCCCC',      // Цвет рамки радио/чекбокса (невыбранный, светлая тема)
  selectionIndicatorBackground: '#007AFF', // Фон радио/чекбокса (выбранный, светлая тема)
  selectionIndicatorCheckmark: '#FFFFFF',   // Цвет галочки/точки в радио/чекбоксе (выбранный, светлая тема)

  navButtonPrimaryBackground: '#4A90E2', // Яркий синий
  navButtonPrimaryText: '#FFFFFF',
  navButtonSecondaryBackground: 'transparent',
  navButtonSecondaryBorder: '#E0E0E0', // Светло-серый для рамки
  navButtonSecondaryText: '#4A4A4A',    // Темно-серый для текста
  navButtonDisabledBackground: '#D1D1D1', // Светло-серый фон для неактивной кнопки
  navButtonDisabledText: '#A1A1A1',      // Серый текст для неактивной кнопки

  inputBackground: '#F0F0F0',              // Фон поля ввода (светлая тема)
  inputBorder: '#CCCCCC',                   // Рамка поля ввода (светлая тема)
  inputText: '#333333',                     // Текст поля ввода (светлая тема)
  placeholderText: '#A0A0A0',               // Цвет плейсхолдера (светлая тема)

  error: '#FF3B30',
};

export const darkThemeColors: ColorTheme = {
  background: '#121212',                     // Фоновый цвет (темная тема)
  textPrimary: '#F5F5F5',                   // Основной текст (темная тема)
  textSecondary: '#A0A0A0',                 // Вторичный текст (темная тема)
  primaryAccent: '#0A84FF',                 // Основной цвет (Primary для темной темы, ярче)

  optionBackground: '#1C1C1E',              // Фон обычной опции (темная тема)
  optionBackgroundSelected: '#0A3150',      // Фон выбранной опции (темная тема)
  optionBorderColor: 'transparent',           // Цвет рамки обычной опции (темная тема)
  optionBorderColorSelected: '#0A84FF',     // Цвет рамки выбранной опции (темная тема)

  iconContainerBackground: '#2C2C2E',         // Фон контейнера иконки (неактивный, темная тема)
  iconContainerBackgroundSelected: '#0A3150',// Фон контейнера иконки (активный, темная тема)
  iconColor: '#A0A0A0',                     // Цвет иконки (неактивный, темная тема)
  iconColorSelected: '#0A84FF',              // Цвет иконки (активный, темная тема)

  selectionIndicatorBorder: '#444444',      // Цвет рамки радио/чекбокса (невыбранный, темная тема)
  selectionIndicatorBackground: '#0A84FF', // Фон радио/чекбокса (выбранный, темная тема)
  selectionIndicatorCheckmark: '#FFFFFF',   // Цвет галочки/точки в радио/чекбоксе (выбранный, темная тема)

  navButtonPrimaryBackground: '#50E3C2', // Яркий бирюзовый
  navButtonPrimaryText: '#000000',
  navButtonSecondaryBackground: 'transparent',
  navButtonSecondaryBorder: '#555555', // Темно-серый для рамки
  navButtonSecondaryText: '#E0E0E0',    // Светло-серый для текста
  navButtonDisabledBackground: '#404040', // Темно-серый фон для неактивной кнопки
  navButtonDisabledText: '#707070',      // Более светлый серый текст для неактивной кнопки

  inputBackground: '#1C1C1E',              // Фон поля ввода (темная тема)
  inputBorder: '#444444',                   // Рамка поля ввода (темная тема)
  inputText: '#F5F5F5',                     // Текст поля ввода (темная тема)
  placeholderText: '#666666',               // Цвет плейсхолдера (темная тема)
  
  error: '#FF6B6B',                         // Цвет для ошибок (темная тема, аналог FF3B30)
};

// --- Общие стили компонентов ---
export const sharedOnboardingStyles = StyleSheet.create({
  // --- Контейнеры --- 
  screenContainer: {
    flex: 1,
    paddingHorizontal: 16, 
    paddingTop: 24, // Отступ сверху экрана
    // paddingBottom: 16, // Нижний отступ будет управляться SafeAreaView или контейнером кнопок
    justifyContent: 'space-between', // Распределяет пространство: хедер сверху, кнопки снизу
  },
  contentContainer: { // Для контента между хедером и кнопками навигации
    flex: 1, // Занимает доступное пространство
    // justifyContent: 'center', // Можно убрать если опции должны быть сверху
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24, // Отступ под заголовком/подзаголовком
  },
  optionsGroupContainer: {
    marginVertical: 16, // Отступ сверху и снизу для группы опций
  },
  optionsContainer: { // Для ScrollView, если опций много
    width: '100%',
    marginVertical: 8, // Как в доке
  },
  optionContainer: { // Контейнер для одной опции выбора
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12, // Более скругленные углы
    borderWidth: 1.5, 
    marginBottom: 12, // Расстояние между опциями
    minHeight: 60,    // Минимальная высота для удобства нажатия
    justifyContent: 'space-between', // Чтобы распределить иконку, текст и индикатор
  },
  optionIconContainer: {
    width: 40, // Фиксированный размер контейнера иконки
    height: 40,
    borderRadius: 20, // Половина от 40
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // В доке 8
  },
  optionText: { // Текст рядом с иконкой или как основное описание опции
    flex: 1, // Занимает доступное пространство, чтобы индикатор был справа
    fontSize: 16,
    marginHorizontal: 12,
    // color будет из themeColors.textPrimary или themeColors.primaryAccent при выборе
  },
  // --- Типографика ---
  titleText: { // H1 Заголовок экрана
    fontSize: 20,
    fontWeight: 'bold', // 700
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '400', // normal
    textAlign: 'center',
    marginBottom: 8, // Отступ под подзаголовком
  },
  optionTitle: { // Заголовок внутри опции
    fontSize: 16,
    fontWeight: '500', // medium
    marginBottom: 2,
  },
  optionDescription: { // Описание внутри опции
    fontSize: 11,
    fontWeight: '400', // normal
  },
  // --- Кнопки выбора опций ---
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12, // В доке 10, чуть увеличил для лучшего касания
    paddingHorizontal: 12,
    marginBottom: 8, // В доке 4, увеличил для большего разделения
    borderRadius: 12, // В доке 10
    borderWidth: 1.5, // В доке 1, сделал чуть заметнее при выборе
  },
  optionLeftContainer: { // Контейнер для иконки и текста
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Занимает доступное место, чтобы индикатор был справа
    marginRight: 8, // Отступ до индикатора
  },
  // --- Индикаторы выбора (Радио/Чекбокс) ---
  selectionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11, // Для радио-кнопки
    borderWidth: 1.5, // В доке 1
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorCheckbox: { // Если нужен вид чекбокса
    borderRadius: 5, 
  },
  selectionIndicatorInner: { // Внутренняя точка для радио или галочка для чекбокса
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // --- Навигационные кнопки ---
  navButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // или 'center' если одна кнопка
    paddingHorizontal: 8, // Небольшой отступ, если кнопки у краев
    paddingVertical: 16, // Отступ сверху и снизу для контейнера кнопок
    // backgroundColor: 'transparent', // Фон по умолчанию прозрачный
  },
  navButton: {
    flex: 1, // Кнопки занимают равное пространство если их две
    paddingVertical: 14, // В доке 12, чуть больше
    borderRadius: 12, // В доке 12
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // В доке 48, чуть больше
    marginHorizontal: 8, // Отступы между кнопками и от краев
    borderWidth: 1, // Для вторичной кнопки
  },
  navButtonSecondary: {
    // backgroundColor будет из themeColors.navButtonSecondaryBackground
    // Дополнительные стили для второстепенной кнопки, если нужны
    // Например, borderWidth: 1, borderColor: themeColors.primaryAccent
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500', // medium
  },
  // --- Элементы ввода (SimplePicker и т.д.) ---
  inputContainer: { // Общий контейнер для текстового поля или пикера
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    // backgroundColor, borderColor, color будут из themeColors
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    // backgroundColor, borderColor, color, placeholderTextColor будут из themeColors
  },
  inputError: { // Стиль для поля ввода с ошибкой
    borderColor: '#FF3B30', // Используем цвет ошибки из светлой темы как базовый, можно адаптировать через themeColors.error
    // Можно добавить другие стили, например, более толстую рамку, если нужно
  },
  errorText: {
    fontSize: 14,
    // color будет из themeColors.error
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

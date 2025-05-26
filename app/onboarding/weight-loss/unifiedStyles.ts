import { StyleSheet } from 'react-native';

// Унифицированные стили для всех экранов онбординга
export const unifiedStyles = StyleSheet.create({
  // Основные контейнеры
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  
  // Заголовки и подзаголовки
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#000000',
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#666666',
    paddingHorizontal: 10,
  },
  darkSubtitle: {
    color: '#AAAAAA',
  },
  
  // Контейнер для опций
  optionsContainer: {
    width: '100%',
    maxHeight: '70%',
    marginBottom: 10,
  },
  
  // Кнопки опций (большие блоки)
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  
  // Иконки
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedIconWrapper: {
    backgroundColor: '#E6F2FF',
  },
  
  // Контейнер для текста
  textContainer: {
    flex: 1,
    marginRight: 6,
  },
  
  // Стили для текста опций
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  selectedLabel: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  selectedDescription: {
    color: '#0077CC',
  },
  
  // Радиокнопки
  radioWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioWrapperSelected: {
    borderColor: '#007AFF',
  },
  
  // Для мультивыбора (чекбоксы)
  checkboxWrapper: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxWrapperSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  // Стили для выбранной опции (синяя заливка)
  blueSelectedOption: {
    backgroundColor: '#007AFF',
  },
  whiteText: {
    color: '#FFFFFF',
  }
});

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Основной контейнер
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  darkSafeArea: {
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#000000',
  },

  // Заголовок
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F2F2F7',
  },
  darkHeader: {
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },

  // ScrollView стили
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },

  // Секции
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },

  // Поле ввода названия
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkInput: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
    color: '#FFFFFF',
  },

  // Кнопка ИИ
  aiButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkAiButton: {
    backgroundColor: '#0A84FF',
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Сетка нутриентов
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutrientItem: {
    flex: 1,
    minWidth: '45%',
  },
  nutrientLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  nutrientInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkNutrientInput: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
    color: '#FFFFFF',
  },

  // Опции (размер порции)
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // Кнопки опций
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkOptionButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  darkOptionButtonActive: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  darkOptionButtonText: {
    color: '#FFFFFF',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },

  // Кнопка добавления
  addButton: {
    width: '60%',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkAddButton: {
    backgroundColor: '#0A84FF',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Контейнер для закрепленной кнопки внизу
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Учитываем safe area
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  darkBottomButtonContainer: {
    backgroundColor: '#000000',
  },
}); 
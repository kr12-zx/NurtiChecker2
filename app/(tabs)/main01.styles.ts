import { StyleSheet } from 'react-native';

// Содержимое стилей идентично предыдущему файлу app/main01.styles.ts
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  darkSafeArea: {
    backgroundColor: '#000000',
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  darkContainer: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#000000',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  calorieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  calorieStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  calorieSummaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  calorieSummaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  activityContainer: {
    flexDirection: 'column',
    marginTop: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
  },
  sugarBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  sugarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  sugarValues: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  sugarIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  sugarBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    flexGrow: 1,
    overflow: 'hidden',
  },
  sugarBarFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  sugarIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  darkCardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'normal',
    marginBottom: 16,
    color: '#000000',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10, // Добавили отступы сверху и снизу
  },
  circularProgressContainer: {
    flex: 0.5, // Увеличили с 0.45 до 0.5
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 5, // Добавили небольшой отступ справа
  },
  macronutrientsContainer: {
    flex: 0.5, // Уменьшили с 0.55 до 0.5
    paddingLeft: 12,
    justifyContent: 'center',
  },
  macroItem: {
    marginBottom: 12,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
  },
  macroValues: {
    fontSize: 12,
    fontWeight: '400',
  },
  linearProgressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E6E7E8',
    overflow: 'hidden',
  },
  darkLinearProgressBar: {
    backgroundColor: '#3A3A3C',
  },
  linearProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  // Стили без карточки вокруг сканирований
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  productCardsContainer: {
    marginBottom: 20,
  },
  // Старый стиль карточки (не используется)
  recentScansCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentScansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  headerButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  scanButtonSmall: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 

export default styles;
export { styles };

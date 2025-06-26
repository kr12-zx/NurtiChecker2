import { StyleSheet } from 'react-native';

// Содержимое стилей идентично предыдущему файлу app/main01.styles.ts
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  darkSafeArea: {
    backgroundColor: '#000000',
  },
  scrollViewContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  darkContainer: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 4,
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
  // Стили для кнопки рекомендаций
  recommendationsButton: {
    backgroundColor: '#0D6EFD',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0D6EFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationsRetryButton: {
    backgroundColor: '#FF9500',
    shadowColor: '#FF9500',
  },
  recommendationsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Стили для прогресс-бара рекомендаций
  recommendationsProgressContainer: {
    marginTop: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(13, 110, 253, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 110, 253, 0.1)',
  },
  darkRecommendationsProgressContainer: {
    backgroundColor: 'rgba(13, 110, 253, 0.15)',
    borderColor: 'rgba(13, 110, 253, 0.3)',
  },
  recommendationsProgressBar: {
    height: 4,
    backgroundColor: '#E6E7E8',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  darkRecommendationsProgressBar: {
    backgroundColor: '#3A3A3C',
  },
  recommendationsProgressFill: {
    height: '100%',
    backgroundColor: '#0D6EFD',
    borderRadius: 2,
  },
  recommendationsProgressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D6EFD',
    textAlign: 'center',
  },
  darkRecommendationsProgressText: {
    color: '#4A9EFF',
  },
  // Стили для отображения результатов рекомендаций
  recommendationsResult: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0D6EFD',
  },
  darkRecommendationsResult: {
    backgroundColor: '#2A2A2C',
    borderLeftColor: '#4A9EFF',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  darkRecommendationsTitle: {
    color: '#FFFFFF',
  },
  recommendationsMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#495057',
  },
  darkRecommendationsMessage: {
    color: '#E5E5E7',
  },
  recommendationsTimestamp: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 8,
    fontStyle: 'italic',
  },
  darkRecommendationsTimestamp: {
    color: '#8E8E93',
  },
  // Стили для заблокированной кнопки рекомендаций
  recommendationsDisabled: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  darkRecommendationsDisabled: {
    backgroundColor: '#2A2A2C',
    borderColor: '#3A3A3C',
  },
  recommendationsDisabledText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
  darkRecommendationsDisabledText: {
    color: '#8E8E93',
  },
  // Стили без карточки вокруг сканирований
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 0,
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
  // Стили для редактирования целей питания
  editingContainer: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F8F9FA',
  },
  darkEditingContainer: {
    borderColor: '#0A84FF',
    backgroundColor: '#1C1C1E',
  },
  calorieCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkHelpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  editButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
  darkEditButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  editingGoalsContainer: {
    marginTop: 8,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  darkGoalEditRow: {
    borderBottomColor: '#3A3A3C',
  },
  goalEditLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  goalEditInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 15,
    textAlign: 'right',
    minWidth: 60,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#FFF',
  },
  goalEditUnit: {
    fontSize: 15,
    color: '#666',
    minWidth: 30,
    textAlign: 'left',
    fontWeight: '500',
  },
  
  // Стили для горизонтального скролла Dashboard
  dashboardContainer: {
    marginBottom: 10,
  },
  dashboardScrollView: {
    borderRadius: 20,
  },
  dashboardSlide: {
    width: '100%',
    paddingHorizontal: 0,
  },
  slideIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  slideIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  slideIndicatorActive: {
    backgroundColor: '#007AFF',
    width: 20,
  },
  
  // Стили для блока рекомендаций
  recommendationContainer: {
    width: '100%',
    marginTop: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  recommendationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
    fontWeight: '500',
  },

  // Стили для легенды витаминов и минералов
  vitaminLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    width: '30%',
  },
  legendColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },

  // Стили для компактного отображения витаминов и минералов
  vitaminMineralMainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    marginTop: -10,     
    marginBottom: 4,  
  },
  vitaminMineralSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  compactLegendContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  compactLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  compactLegendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  compactRecommendationContainer: {
    marginTop: 4,
  },
  compactDeficiencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  compactRecommendationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
    fontWeight: '500',
  },

  // Стили для модального окна с целями
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  goalsInfoModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  darkGoalsInfoModal: {
    backgroundColor: '#1C1C1E',
  },
  goalsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkModalCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  goalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  goalsDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Стили для блока информации о весе
  weightGoalsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  darkWeightGoalsSection: {
    borderTopColor: '#3A3A3C',
  },
  weightGoalsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  weightStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weightStatItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  weightStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  weightStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Стили для секции быстрого доступа
  quickAccessSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  darkQuickAccessCard: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  quickAccessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 18,
  },
  quickAccessDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },

  // Стили для Recent блока с горизонтальным скроллом
  recentContainer: {
    marginTop: 8,
  },
  recentScrollView: {
    height: 'auto',
  },
  recentSlide: {
    paddingHorizontal: 0,
  },
  recentIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 8,
  },
  recentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D6',
    marginHorizontal: 4,
  },
  recentIndicatorActive: {
    backgroundColor: '#0D6EFD',
    width: 24,
  },

  // Стили для карточек продуктов в Recent блоке (как в history.tsx)
  recentProductItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  darkRecentProductItem: {
    backgroundColor: '#1C1C1E',
  },
  recentProductImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    marginRight: 12,
  },
  recentProductInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recentProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recentProductName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  recentCaloriesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  recentMacrosRowScanned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentMacroDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recentMacroCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  recentMacroLetter: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recentMacroValue: {
    fontSize: 13,
    color: '#666666',
  },
  recentDeleteButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
}); 

export default styles;
export { styles };

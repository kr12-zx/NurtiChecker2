import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useTranslation } from '../i18n/i18n';

interface AIRecommendationsProps {
  recommendations: {
    nutritionRecommendations: {
      shortSummary: string;
      bulletPoints: string[];
    };
    weeklyFocus: {
      mainGoal: string;
      specificFoods: string[];
      avoidOrReduce: string[];
    };
    progressNotes: {
      weightProgress: string;
      nutritionQuality: string;
      challengeEvolution: string;
      encouragement: string;
    };
    nextWeekTargets: {
      calorieTarget: string;
      macroFocus: string;
      behavioralGoal: string;
      activitySuggestion: string;
    };
  };
}

const AIRecommendationsCard: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    progress: false,
    foods: false,
    targets: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ExpandableSection = ({ 
    title, 
    icon, 
    sectionKey, 
    children, 
    previewText 
  }: {
    title: string;
    icon: string;
    sectionKey: string;
    children: React.ReactNode;
    previewText?: string;
  }) => (
    <View style={[styles.sectionContainer, isDark && styles.darkCard]}>
      <TouchableOpacity 
        style={[styles.sectionHeader, isDark && styles.darkSectionHeader]}
        onPress={() => toggleSection(sectionKey)}
      >
        <View style={styles.sectionTitleContainer}>
          <Ionicons name={icon as any} size={20} color="#007AFF" style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{title}</Text>
        </View>
        <Ionicons 
          name={expandedSections[sectionKey] ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={isDark ? "#AAAAAA" : "#666"} 
        />
      </TouchableOpacity>
      
      {!expandedSections[sectionKey] && previewText && (
        <Text style={[styles.previewText, isDark && styles.darkTextSecondary]} numberOfLines={2}>
          {previewText}
        </Text>
      )}
      
      {expandedSections[sectionKey] && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, isDark && styles.darkContainer]} showsVerticalScrollIndicator={false}>
      {/* Основной заголовок и краткая сводка */}
      <View style={[styles.headerContainer, isDark && styles.darkCard]}>
        <View style={styles.titleRow}>
          <Ionicons name="bulb" size={24} color="#FF9500" />
          <Text style={[styles.mainTitle, isDark && styles.darkText]}>{t('recommendations.card.mainTitle')}</Text>
        </View>
        <Text style={[styles.summary, isDark && styles.darkTextSecondary]}>
          {recommendations.nutritionRecommendations.shortSummary || t('goalTracking.analyzingPersonalizedRecommendations')}
        </Text>
      </View>

      {/* Основные рекомендации (всегда видны) */}
      <View style={[styles.bulletPointsContainer, isDark && styles.darkCard]}>
        {recommendations.nutritionRecommendations.bulletPoints.length > 0 ? (
          recommendations.nutritionRecommendations.bulletPoints.map((point, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={[styles.bulletText, isDark && styles.darkTextSecondary]}>• {point}</Text>
            </View>
          ))
        ) : (
          <View style={styles.bulletPoint}>
            <Text style={[styles.bulletText, isDark && styles.darkTextSecondary]}>• {t('goalTracking.dataProcessing')}</Text>
          </View>
        )}
      </View>

      {/* Анализ прогресса */}
      <ExpandableSection
        title={t('recommendations.card.sections.progressAnalysis')}
        icon="analytics"
        sectionKey="progress"
        previewText={`💪 ${t('goalTracking.dailyOpportunityReminder')}`}
      >
        <View style={styles.progressSection}>
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, isDark && styles.darkProgressLabel]}>{t('recommendations.card.progress.weightChange')}</Text>
            <Text style={[styles.progressText, isDark && styles.darkText]}>{recommendations.progressNotes.weightProgress || t('goalTracking.analyzingWeightDynamics')}</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, isDark && styles.darkProgressLabel]}>{t('recommendations.card.progress.nutritionQuality')}</Text>
            <Text style={[styles.progressText, isDark && styles.darkText]}>{recommendations.progressNotes.nutritionQuality || t('goalTracking.evaluatingNutritionQuality')}</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Text style={[styles.progressLabel, isDark && styles.darkProgressLabel]}>{t('recommendations.card.progress.challengeWork')}</Text>
            <Text style={[styles.progressText, isDark && styles.darkText]}>{recommendations.progressNotes.challengeEvolution || t('goalTracking.trackingBehaviorChanges')}</Text>
          </View>
          
          <View style={[styles.encouragementContainer, isDark && styles.darkEncouragementContainer]}>
            <Ionicons name="heart" size={16} color={isDark ? "#FF6B6B" : "#FF3B30"} />
            <Text style={[styles.encouragementText, isDark && styles.darkText]}>
              {recommendations.progressNotes.encouragement || t('goalTracking.dailyOpportunityReminder')}
            </Text>
          </View>
        </View>
      </ExpandableSection>

      {/* Что добавить и исключить */}
      <ExpandableSection
        title={t('recommendations.card.sections.foodsToAddAndAvoid')}
        icon="restaurant"
        sectionKey="foods"
        previewText={recommendations.weeklyFocus.mainGoal || t('goalTracking.determiningNutritionStrategy')}
      >
        <View style={styles.foodSection}>
          <Text style={[styles.goalText, isDark && styles.darkText]}>
            🎯 {recommendations.weeklyFocus.mainGoal || t('goalTracking.determiningNutritionStrategy')}
          </Text>
          
          <View style={styles.foodCategory}>
            <View style={styles.foodCategoryHeader}>
              <Ionicons name="add-circle" size={18} color="#34C759" />
              <Text style={[styles.foodCategoryTitle, isDark && styles.darkText]}>{t('recommendations.card.foods.addToRation')}</Text>
            </View>
            {recommendations.weeklyFocus.specificFoods && recommendations.weeklyFocus.specificFoods.length > 0 ? (
              recommendations.weeklyFocus.specificFoods.map((food, index) => (
                <Text key={index} style={[styles.foodItem, isDark && styles.darkTextSecondary]}>• {food}</Text>
              ))
            ) : (
              <Text style={[styles.foodItem, isDark && styles.darkTextSecondary]}>• {t('goalTracking.fallbackRecommendations.addMoreVegetablesAndFruits')}</Text>
            )}
          </View>
          
          <View style={styles.foodCategory}>
            <View style={styles.foodCategoryHeader}>
              <Ionicons name="remove-circle" size={18} color="#FF3B30" />
              <Text style={[styles.foodCategoryTitle, isDark && styles.darkText]}>{t('recommendations.card.foods.limitOrExclude')}</Text>
            </View>
            {recommendations.weeklyFocus.avoidOrReduce && recommendations.weeklyFocus.avoidOrReduce.length > 0 ? (
              recommendations.weeklyFocus.avoidOrReduce.map((food, index) => (
                <Text key={index} style={[styles.foodItem, isDark && styles.darkTextSecondary]}>• {food}</Text>
              ))
            ) : (
              <Text style={[styles.foodItem, isDark && styles.darkTextSecondary]}>• {t('goalTracking.fallbackRecommendations.limitSweetDrinksAndFastFood')}</Text>
            )}
          </View>
        </View>
      </ExpandableSection>

      {/* Цели на следующую неделю */}
      <ExpandableSection
        title={t('recommendations.card.sections.nextWeekGoals')}
        icon="flag"
        sectionKey="targets"
        previewText={recommendations.nextWeekTargets.calorieTarget || t('goalTracking.determiningOptimalCalories')}
      >
        <View style={styles.targetsSection}>
          <View style={styles.targetItem}>
            <View style={styles.targetHeader}>
              <Ionicons name="flame" size={16} color="#007AFF" />
              <Text style={[styles.targetLabel, isDark && styles.darkTargetLabel]}>{t('recommendations.card.targets.calories')}</Text>
            </View>
            <Text style={[styles.targetText, isDark && styles.darkText]}>{recommendations.nextWeekTargets.calorieTarget || t('goalTracking.determiningOptimalCalories')}</Text>
          </View>
          
          <View style={styles.targetItem}>
            <View style={styles.targetHeader}>
              <Ionicons name="fitness" size={16} color="#007AFF" />
              <Text style={[styles.targetLabel, isDark && styles.darkTargetLabel]}>{t('recommendations.card.targets.macronutrients')}</Text>
            </View>
            <Text style={[styles.targetText, isDark && styles.darkText]}>{recommendations.nextWeekTargets.macroFocus || t('goalTracking.balancingMacronutrients')}</Text>
          </View>
          
          <View style={styles.targetItem}>
            <View style={styles.targetHeader}>
              <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
              <Text style={[styles.targetLabel, isDark && styles.darkTargetLabel]}>{t('recommendations.card.targets.behavioralGoal')}</Text>
            </View>
            <Text style={[styles.targetText, isDark && styles.darkText]}>{recommendations.nextWeekTargets.behavioralGoal || t('goalTracking.formingHealthyHabits')}</Text>
          </View>
          
          <View style={styles.targetItem}>
            <View style={styles.targetHeader}>
              <Ionicons name="walk" size={16} color="#007AFF" />
              <Text style={[styles.targetLabel, isDark && styles.darkTargetLabel]}>{t('recommendations.card.targets.activity')}</Text>
            </View>
            <Text style={[styles.targetText, isDark && styles.darkText]}>{recommendations.nextWeekTargets.activitySuggestion || t('goalTracking.selectingSuitableActivity')}</Text>
          </View>
        </View>
      </ExpandableSection>

      {/* Кнопка "Показать меньше/больше" */}
      <TouchableOpacity 
        style={styles.showMoreButton}
        onPress={() => {
          const allExpanded = Object.values(expandedSections).every(Boolean);
          const newState = allExpanded ? false : true;
          setExpandedSections({
            progress: newState,
            foods: newState,
            targets: newState,
          });
        }}
      >
        <Text style={[styles.showMoreText, isDark && styles.darkShowMoreText]}>
          {Object.values(expandedSections).some(Boolean) ? t('recommendations.card.actions.collapseAll') : t('recommendations.card.actions.expandAll')}
        </Text>
        <Ionicons 
          name={Object.values(expandedSections).some(Boolean) ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={isDark ? "#0A84FF" : "#007AFF"} 
        />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  darkText: {
    color: '#FFFFFF',
  },
  summary: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  bulletPointsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  bulletPoint: {
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  darkSectionHeader: {
    borderBottomColor: '#3A3A3C',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    padding: 16,
    paddingTop: 0,
    lineHeight: 18,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  progressSection: {
    gap: 12,
  },
  progressItem: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  darkProgressLabel: {
    color: '#0A84FF',
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  darkEncouragementContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  encouragementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  foodSection: {
    gap: 16,
  },
  goalText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  foodCategory: {
    marginBottom: 16,
  },
  foodCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginLeft: 6,
  },
  foodItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
    marginLeft: 8,
  },
  targetsSection: {
    gap: 16,
  },
  targetItem: {
    marginBottom: 12,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  darkTargetLabel: {
    color: '#0A84FF',
  },
  targetText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginLeft: 22,
  },
  showMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  showMoreText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 4,
  },
  darkShowMoreText: {
    color: '#0A84FF',
  },
});

export default AIRecommendationsCard; 
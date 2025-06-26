import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useAIRecommendations } from '../hooks/useAIRecommendations';
import { useTranslation } from '../i18n/i18n';
import AIRecommendationsCard from './AIRecommendationsCard';

interface RecommendationsSectionProps {
  onNavigateToRecommendations?: () => void;
  refreshTrigger?: number; // Добавляем внешний триггер для обновления
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ 
  onNavigateToRecommendations,
  refreshTrigger
}) => {
  const { t } = useTranslation();
  const { recommendations, loading, error, hasRecommendations, refresh } = useAIRecommendations();
  const isDark = useColorScheme() === 'dark';

  // Обновляем данные при изменении внешнего триггера
  useEffect(() => {
    if (refreshTrigger) {
      console.log('🔄 RecommendationsSection получил внешний триггер обновления');
      refresh();
    }
  }, [refreshTrigger, refresh]);

  if (loading) {
    return (
      <View style={[
        styles.loadingContainer,
        isDark && styles.darkLoadingContainer
      ]}>
        <ActivityIndicator size="small" color={isDark ? "#0A84FF" : "#007AFF"} />
        <Text style={[
          styles.loadingText,
          isDark && styles.darkText
        ]}>{t('recommendations.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[
        styles.errorContainer,
        isDark && styles.darkErrorContainer
      ]}>
        <Ionicons name="alert-circle" size={20} color="#FF3B30" />
        <Text style={[
          styles.errorText,
          isDark && styles.darkErrorText
        ]}>{t('recommendations.error')}</Text>
      </View>
    );
  }

  if (!hasRecommendations()) {
    return (
      <View style={[
        styles.noRecommendationsContainer,
        isDark && styles.darkNoRecommendationsContainer
      ]}>
        <Ionicons name="bulb-outline" size={24} color={isDark ? "#0A84FF" : "#007AFF"} />
        <Text style={[
          styles.noRecommendationsText,
          isDark && styles.darkText
        ]}>
          {t('recommendations.noRecommendations')}
        </Text>
      </View>
    );
  }

  // Если есть рекомендации, показываем краткую версию или полную карточку
  if (onNavigateToRecommendations) {
    // Краткая версия для главного экрана
    return (
      <TouchableOpacity 
        style={[
          styles.summaryContainer,
          isDark && styles.darkSummaryContainer
        ]} 
        onPress={onNavigateToRecommendations}
      >
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleContainer}>
            <Ionicons name="bulb" size={20} color="#FF9500" />
            <Text style={[
              styles.summaryTitle,
              isDark && styles.darkText
            ]}>{t('recommendations.title')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#666"} />
        </View>
        
        <Text style={[
          styles.summaryText,
          isDark && styles.darkText
        ]} numberOfLines={2}>
          {recommendations?.nutritionRecommendations.shortSummary || t('goalTracking.analyzingPersonalizedRecommendations')}
        </Text>
        
        <View style={styles.bulletPreview}>
          {(recommendations?.nutritionRecommendations.bulletPoints.length || 0) > 0 ? (
            <>
              {recommendations?.nutritionRecommendations.bulletPoints.slice(0, 2).map((point, index) => (
                <Text key={index} style={[
                  styles.bulletPreviewText,
                  isDark && styles.darkText
                ]} numberOfLines={1}>
                  • {point}
                </Text>
              ))}
              {(recommendations?.nutritionRecommendations.bulletPoints.length || 0) > 2 && (
                <Text style={[
                  styles.moreText,
                  isDark && styles.darkMoreText
                ]}>
                  +{(recommendations?.nutritionRecommendations.bulletPoints.length || 0) - 2} {t('recommendations.more')}
                </Text>
              )}
            </>
          ) : (
            <Text style={[
              styles.bulletPreviewText,
              isDark && styles.darkText
            ]} numberOfLines={1}>
              • {t('goalTracking.dataProcessing')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Полная версия для отдельного экрана
  return (
    <AIRecommendationsCard recommendations={recommendations!} />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  darkLoadingContainer: {
    backgroundColor: '#1C1C1E',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  darkText: {
    color: '#E5E5E7',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF2F2',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  darkErrorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF3B30',
  },
  darkErrorText: {
    color: '#FF6B6B',
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  darkNoRecommendationsContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderLeftColor: '#0A84FF',
  },
  noRecommendationsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  darkSummaryContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderLeftColor: '#0A84FF',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginLeft: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  bulletPreview: {
    gap: 4,
  },
  bulletPreviewText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 4,
  },
  darkMoreText: {
    color: '#4A9EFF',
  },
});

export default RecommendationsSection; 
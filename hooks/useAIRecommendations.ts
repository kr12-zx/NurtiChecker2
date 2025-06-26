import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { parseAIResponse } from '../utils/aiResponseParser';

interface AIRecommendations {
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
}

export const useAIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(0);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Hook загружает рекомендации из AsyncStorage...', new Date().toISOString());
      
      // Сначала пытаемся загрузить новый структурированный формат
      const newFormat = await AsyncStorage.getItem('ai_recommendations');
      if (newFormat) {
        console.log('📦 Hook найден новый формат рекомендаций');
        const parsed = parseAIResponse(newFormat);
        if (parsed) {
          setRecommendations(parsed);
          console.log('✅ Hook новый формат успешно загружен');
          return;
        }
      }
      
      // Если нет нового формата, пытаемся загрузить старый
      const oldFormat = await AsyncStorage.getItem('weekly_recommendations');
      if (oldFormat) {
        console.log('📦 Hook найден старый формат рекомендаций, конвертируем...');
        const parsed = parseAIResponse(oldFormat);
        if (parsed) {
          // Сохраняем в новом формате и удаляем старый
          await AsyncStorage.setItem('ai_recommendations', JSON.stringify(parsed));
          await AsyncStorage.removeItem('weekly_recommendations');
          setRecommendations(parsed);
          console.log('✅ Hook старый формат конвертирован и загружен');
          return;
        }
      }
      
      console.log('ℹ️ Hook рекомендации не найдены');
      setRecommendations(null);
    } catch (err) {
      console.error('❌ Hook ошибка загрузки рекомендаций:', err);
      setError('Ошибка загрузки рекомендаций');
    } finally {
      setLoading(false);
    }
  }, [lastRefresh]);

  // Функция для принудительного обновления
  const refresh = useCallback(() => {
    console.log('🔄 Hook принудительное обновление рекомендаций...');
    setLastRefresh(Date.now());
  }, []);

  const saveRecommendations = async (newRecommendations: AIRecommendations) => {
    try {
      await AsyncStorage.setItem('ai_recommendations', JSON.stringify(newRecommendations));
      await AsyncStorage.setItem('ai_recommendations_timestamp', new Date().toISOString());
      setRecommendations(newRecommendations);
      console.log('✅ Hook рекомендации сохранены в AsyncStorage');
    } catch (err) {
      console.error('❌ Hook ошибка сохранения рекомендаций:', err);
      setError('Ошибка сохранения рекомендаций');
    }
  };

  const clearRecommendations = async () => {
    try {
      await AsyncStorage.removeItem('ai_recommendations');
      await AsyncStorage.removeItem('ai_recommendations_timestamp');
      // Также удаляем старый формат
      await AsyncStorage.removeItem('weekly_recommendations');
      setRecommendations(null);
      console.log('🗑️ Hook рекомендации удалены из AsyncStorage');
    } catch (err) {
      console.error('❌ Hook ошибка удаления рекомендаций:', err);
      setError('Ошибка удаления рекомендаций');
    }
  };

  const hasRecommendations = () => {
    return recommendations !== null;
  };

  const getLastUpdated = async () => {
    try {
      const timestamp = await AsyncStorage.getItem('ai_recommendations_timestamp');
      return timestamp ? new Date(timestamp) : null;
    } catch (err) {
      console.error('❌ Hook ошибка получения времени обновления:', err);
      return null;
    }
  };

  const setLastUpdated = async () => {
    try {
      await AsyncStorage.setItem('ai_recommendations_timestamp', new Date().toISOString());
    } catch (err) {
      console.error('❌ Hook ошибка сохранения времени обновления:', err);
    }
  };

  // Функция для обработки нового AI ответа (поддерживает все форматы)
  const processNewAIResponse = async (aiResponse: any) => {
    try {
      console.log('🔄 Hook обрабатываем новый AI ответ...', typeof aiResponse, Array.isArray(aiResponse));
      
      const parsed = parseAIResponse(aiResponse);
      if (parsed) {
        await saveRecommendations(parsed);
        console.log('✅ Hook новый AI ответ обработан и сохранен');
        return true;
      } else {
        console.warn('⚠️ Hook не удалось обработать AI ответ');
        setError('Не удалось обработать рекомендации');
        return false;
      }
    } catch (err) {
      console.error('❌ Hook ошибка обработки AI ответа:', err);
      setError('Ошибка обработки рекомендаций');
      return false;
    }
  };

  // Автоматическая проверка обновлений каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const timestamp = await AsyncStorage.getItem('ai_recommendations_timestamp');
        const currentTimestamp = await getLastUpdated();
        
        if (timestamp && currentTimestamp) {
          const stored = new Date(timestamp);
          const current = currentTimestamp;
          
          // Если данные в AsyncStorage новее, чем в hook - обновляем
          if (stored > current) {
            console.log('🔄 Hook обнаружил новые данные в AsyncStorage, обновляем...');
            refresh();
          }
        }
      } catch (err) {
        // Игнорируем ошибки проверки
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [refresh, getLastUpdated]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    loadRecommendations,
    saveRecommendations,
    clearRecommendations,
    hasRecommendations,
    getLastUpdated,
    setLastUpdated,
    processNewAIResponse,
    refresh, // Новая функция для обновления
  };
}; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Modal, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircularProgress from '../../components/CircularProgress';
import RecommendationsSection from '../../components/RecommendationsSection';
import { useTranslation } from '../../i18n/i18n';
import { getLatestWeeklyCheckData, type GoalProgress, type SavedWeeklyCheckData } from '../../services/goalTrackingService';
import { getUserId } from '../../services/userService';
import { styles } from './goal-tracking.styles';

// Компонент для отображения прогресс-бара загрузки рекомендаций
const LoadingOverlay = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  
  console.log('🎬 LoadingOverlay рендерится!');
  
  useEffect(() => {
    console.log('🎬 LoadingOverlay useEffect запущен');
    // Анимация прогресс-бара в течение примерно 30 секунд
    Animated.timing(progressAnim, {
      toValue: 0.95, // Не делаем 100%, чтобы показать, что процесс ещё идёт
      duration: 30000, // 30 секунд
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Modal
      transparent={true}
      visible={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.loadingCard, isDark && {backgroundColor: '#2A2A2A'}]}>
          <ActivityIndicator size="large" color={isDark ? "#0A84FF" : "#007AFF"} style={styles.loadingIndicator} />
          <Text style={[styles.overlayLoadingText, isDark && {color: '#FFF'}]}>
            {t('goalTracking.generatingRecommendations')}
          </Text>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressWidth }
              ]} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function GoalTrackingScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();

  const [goalProgress, setGoalProgress] = useState<GoalProgress>({
    currentWeight: undefined,
    targetWeight: 75,
    startWeight: 85,
    weeklyTarget: 0.5,
    weeksSinceStart: 6,
    weeksToGoal: 8,
    lastCheckIn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    needsWeeklyCheck: true,
  });

  const [weeklyData, setWeeklyData] = useState<SavedWeeklyCheckData | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // Добавляем ref для отслеживания отправленных запросов
  const sentWebhookRef = useRef<Set<string>>(new Set());
  
  // Триггер для обновления рекомендаций
  const [refreshTrigger, setRefreshTrigger] = useState(0);



  // Загружаем данные при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused, reloading goal data...');
      loadGoalData();
      // Принудительно обновляем триггер для RecommendationsSection
      setRefreshTrigger(prev => prev + 1);
    }, [])
  );

  // Генерируем уникальный ключ для данных еженедельной проверки
  const getDataKey = (data: SavedWeeklyCheckData) => {
    return `${data.completedAt}-${data.currentWeight}-${data.energyLevel}`;
  };

  // Отдельный useEffect для обработки данных из еженедельной проверки
  useEffect(() => {
    if (params.weeklyDataCompleted === 'true' && params.weeklyData) {
      try {
        const weeklyData = JSON.parse(params.weeklyData as string) as SavedWeeklyCheckData;
        
        console.log('📋 Получены завершенные данные из еженедельной проверки');
        
        // Обновляем локальные данные
        setWeeklyData(weeklyData);
        setGoalProgress(prev => ({
          ...prev,
          currentWeight: weeklyData.currentWeight,
          lastCheckIn: new Date(weeklyData.completedAt || new Date().toISOString()),
          needsWeeklyCheck: false,
        }));
        
        // Загружаем рекомендации из AsyncStorage
        loadRecommendationsFromStorage();
        
        // Очищаем параметры чтобы избежать повторной обработки
        router.replace('/(tabs)/goal-tracking');
      } catch (error) {
        console.error('❌ Ошибка при обработке завершенных данных еженедельной проверки:', error);
      }
    }
  }, [params.weeklyDataCompleted, params.weeklyData]);

  const loadRecommendationsFromStorage = async () => {
    try {
      const savedRecommendations = await AsyncStorage.getItem('weekly_recommendations');
      
      if (savedRecommendations) {
        console.log('✅ Рекомендации загружены из AsyncStorage');
        
        // Пытаемся распарсить JSON рекомендации
        try {
          const parsedRecommendations = JSON.parse(savedRecommendations);
          
          // Форматируем рекомендации для отображения
          let formattedRecommendations = '';
          
          if (parsedRecommendations.nutritionRecommendations) {
            formattedRecommendations += `📋 ${parsedRecommendations.nutritionRecommendations.shortSummary}\n\n`;
            
            if (parsedRecommendations.nutritionRecommendations.bulletPoints) {
              formattedRecommendations += '🎯 Рекомендации:\n';
              parsedRecommendations.nutritionRecommendations.bulletPoints.forEach((point: string, index: number) => {
                formattedRecommendations += `${index + 1}. ${point}\n`;
              });
            }
          } else {
            // Если это текстовые рекомендации
            formattedRecommendations = savedRecommendations;
          }
          
          setRecommendations(formattedRecommendations);
          return;
        } catch (parseError) {
          console.log('🔍 Не JSON формат, используем как текст');
          setRecommendations(savedRecommendations);
          return;
        }
      } else {
        console.log('ℹ️ Нет сохраненных рекомендаций в AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Ошибка при загрузке рекомендаций:', error);
    }
  };

  const loadGoalData = async () => {
    try {
      // Загружаем настройки плана (target weight, start weight, weekly target)
      const { getGoalSettings } = await import('../../services/goalTrackingService');
      const goalSettings = await getGoalSettings();
      
      // Загружаем данные еженедельной проверки
      const savedData = await getLatestWeeklyCheckData();
      
      // Обновляем состояние с данными из настроек плана
      setGoalProgress(prev => ({
        ...prev,
        targetWeight: goalSettings?.targetWeight || prev.targetWeight,
        startWeight: goalSettings?.startWeight || prev.startWeight,
        weeklyTarget: goalSettings?.weeklyTarget || prev.weeklyTarget,
        weeksToGoal: goalSettings?.weeksToGoal || prev.weeksToGoal,
        // Если есть данные еженедельной проверки, используем их для текущего веса
        currentWeight: savedData?.currentWeight || goalSettings?.currentWeight || goalSettings?.startWeight,
        lastCheckIn: savedData ? new Date(savedData.completedAt) : prev.lastCheckIn,
        needsWeeklyCheck: !savedData, // Если нет savedData, нужна проверка
      }));
      
      if (savedData) {
        setWeeklyData(savedData);
        // Проверяем есть ли сохраненные рекомендации
        await loadRecommendationsFromStorage();
      }
      
      console.log('✅ Goal data loaded:', { goalSettings, savedData });
    } catch (error) {
      console.error('❌ Error loading goal data:', error);
    }
  };

  const loadRecommendations = async (weeklyData: SavedWeeklyCheckData) => {
    // Предотвращаем множественные запросы
    if (isLoadingRecommendations || showLoadingOverlay) {
      console.log('⚠️ Рекомендации уже загружаются, игнорируем дублирующий запрос');
      return;
    }

    try {
      setIsLoadingRecommendations(true);
      
      // Отправляем данные на webhook для получения рекомендаций
      await sendDataToWebhook(weeklyData);
      
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      setRecommendations(generateFallbackRecommendations(weeklyData));
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Функция для конвертации числовых оценок в понятные описания
  const convertRatingsToDescriptions = (weeklyData: SavedWeeklyCheckData) => {
    const getEnergyDescription = (level: number): string => {
      switch (level) {
        case 1: return "Very low energy";
        case 2: return "Low energy";
        case 3: return "Moderate energy";
        case 4: return "Good energy";
        case 5: return "Excellent energy";
        default: return "Not specified";
      }
    };

    const getMotivationDescription = (level: number): string => {
      switch (level) {
        case 1: return "No motivation at all";
        case 2: return "Low motivation";
        case 3: return "Moderate motivation";
        case 4: return "High motivation";
        case 5: return "Very high motivation";
        default: return "Not specified";
      }
    };

    const getDietComplianceDescription = (level: number): string => {
      switch (level) {
        case 1: return "Did not follow diet plan at all";
        case 2: return "Poorly followed diet plan";
        case 3: return "Moderately followed diet plan";
        case 4: return "Well followed diet plan";
        case 5: return "Perfectly followed diet plan";
        default: return "Not specified";
      }
    };

    const getExerciseComplianceDescription = (level: number): string => {
      switch (level) {
        case 1: return "Did not exercise at all";
        case 2: return "Minimal exercise activity";
        case 3: return "Moderate exercise activity";
        case 4: return "Good exercise activity";
        case 5: return "Excellent exercise activity";
        default: return "Not specified";
      }
    };

    const getSleepQualityDescription = (level: number): string => {
      switch (level) {
        case 1: return "Very poor sleep quality";
        case 2: return "Poor sleep quality";
        case 3: return "Average sleep quality";
        case 4: return "Good sleep quality";
        case 5: return "Excellent sleep quality";
        default: return "Not specified";
      }
    };

    const getStressLevelDescription = (level: number): string => {
      switch (level) {
        case 1: return "Very high stress level";
        case 2: return "High stress level";
        case 3: return "Moderate stress level";
        case 4: return "Low stress level";
        case 5: return "Very low stress level";
        default: return "Not specified";
      }
    };

    return {
      currentWeight: weeklyData.currentWeight,
      energyLevel: getEnergyDescription(weeklyData.energyLevel),
      motivationLevel: getMotivationDescription(weeklyData.motivationLevel),
      challenges: weeklyData.challenges, // Остаются как есть - они уже описательные
      dietCompliance: getDietComplianceDescription(weeklyData.dietCompliance),
      exerciseCompliance: getExerciseComplianceDescription(weeklyData.exerciseCompliance),
      sleepQuality: getSleepQualityDescription(weeklyData.sleepQuality),
      stressLevel: getStressLevelDescription(weeklyData.stressLevel),
      completedAt: weeklyData.completedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      // Добавляем также оригинальные числовые значения для аналитики
      originalRatings: {
        energyLevel: weeklyData.energyLevel,
        motivationLevel: weeklyData.motivationLevel,
        dietCompliance: weeklyData.dietCompliance,
        exerciseCompliance: weeklyData.exerciseCompliance,
        sleepQuality: weeklyData.sleepQuality,
        stressLevel: weeklyData.stressLevel,
      }
    };
  };

  const sendDataToWebhook = async (weeklyData: SavedWeeklyCheckData) => {
    // Предотвращаем множественные запросы
    if (showLoadingOverlay) {
      console.log('⚠️ Запрос уже выполняется, игнорируем дублирующий запрос');
      return;
    }

    try {
      setShowLoadingOverlay(true);
      console.log('🔄 LoadingOverlay установлен в true');
      
      // Конвертируем числовые оценки в описательный текст
      const descriptiveWeeklyData = convertRatingsToDescriptions(weeklyData);
      
      // Получаем язык системы
      const locales = getLocales();
      const systemLanguage = locales[0]?.languageCode || 'en';
      
      // Подготавливаем данные для отправки с понятными описаниями
      const webhookData = {
        userId: await getUserId(),
        body: {
          userId: await getUserId()
        },
        // Отправляем описательные данные вместо чисел с добавленным языком
        weeklyData: {
          ...descriptiveWeeklyData,
          language: systemLanguage
        }
      };

      console.log('📤 Отправляем данные на AI webhook с описаниями:', webhookData);
      
      // Используем ваш тестовый webhook endpoint 
      const N8N_WEBHOOK_URL = 'https://ttagent.website/webhook/pro_week_check';
      
      console.log('🎯 URL endpoint:', N8N_WEBHOOK_URL);
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      console.log('📨 Response status:', response.status);

      if (response.ok) {
        // Проверяем, есть ли содержимое в ответе
        const responseText = await response.text();
        console.log('📦 Raw response text:', responseText ? responseText.substring(0, 200) + '...' : 'EMPTY');
        
        if (!responseText || responseText.trim() === '') {
          console.warn('⚠️ Webhook вернул пустой ответ, используем fallback');
          setRecommendations(generateFallbackRecommendations(weeklyData));
          return;
        }
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Ошибка парсинга JSON:', parseError);
          console.log('⚠️ Используем fallback рекомендации из-за ошибки парсинга');
          setRecommendations(generateFallbackRecommendations(weeklyData));
          return;
        }
        
        console.log('✅ WeeklyCheck получен ответ от AI:', result);
        
        // Сохраняем полный AI ответ в AsyncStorage для использования в компонентах рекомендаций
        try {
          await AsyncStorage.setItem('ai_recommendations', JSON.stringify(result));
          await AsyncStorage.setItem('ai_recommendations_timestamp', new Date().toISOString());
          console.log('✅ WeeklyCheck рекомендации сохранены в AsyncStorage');
          
          // Обновляем компонент рекомендаций
          // Обновляем рекомендации через trigger
          console.log('🔄 Обновляем компонент рекомендаций через trigger...');
          setRefreshTrigger(Date.now());
        } catch (saveError) {
          console.error('❌ Ошибка сохранения рекомендаций:', saveError);
        }
        
        // Извлекаем краткий текст для отображения в goal-tracking
        let recommendationsText = '';
        
        // Используем новый парсер для обработки ответа
        const { parseAIResponse } = require('../../utils/aiResponseParser');
        const parsed = parseAIResponse(result);
        
        if (parsed) {
          // Формируем краткое описание для goal-tracking экрана
          recommendationsText = parsed.nutritionRecommendations.shortSummary;
          
          if (parsed.nutritionRecommendations.bulletPoints.length > 0) {
            const firstThreePoints = parsed.nutritionRecommendations.bulletPoints.slice(0, 3);
            recommendationsText += '\n\n' + firstThreePoints
              .map((point: string) => `• ${point}`)
              .join('\n');
          }
          
          console.log('✅ WeeklyCheck рекомендации обработаны новым парсером');
        } else {
          // Fallback к старой логике если парсер не сработал
          let aiData = result;
          
          if (result.text && typeof result.text === 'string') {
            try {
              const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
              if (jsonMatch && jsonMatch[1]) {
                aiData = JSON.parse(jsonMatch[1]);
                console.log('✅ JSON извлечен из markdown');
              }
            } catch (parseError) {
              console.warn('⚠️ Не удалось извлечь JSON из text');
            }
          }
          
          if (aiData.nutritionRecommendations?.shortSummary) {
            recommendationsText = aiData.nutritionRecommendations.shortSummary;
            if (aiData.nutritionRecommendations?.bulletPoints?.length > 0) {
              recommendationsText += '\n\n' + aiData.nutritionRecommendations.bulletPoints
                .slice(0, 3)
                .map((point: string) => `• ${point}`)
                .join('\n');
            }
          } else {
            recommendationsText = generateFallbackRecommendations(weeklyData);
          }
        }
        
        console.log('🎯 WeeklyCheck финальный текст рекомендаций:', recommendationsText.substring(0, 100) + '...');
        setRecommendations(recommendationsText);
      } else {
        console.error('❌ Webhook ответил с ошибкой:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Текст ошибки:', errorText);
        setRecommendations(generateFallbackRecommendations(weeklyData));
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке на webhook:', error);
      setRecommendations(generateFallbackRecommendations(weeklyData));
    } finally {
      setShowLoadingOverlay(false);
      console.log('🔄 LoadingOverlay установлен в false');
    }
  };

  const generateFallbackRecommendations = (data: SavedWeeklyCheckData): string => {
    const recommendations = [];
    
    if (data.energyLevel <= 2) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.lowEnergy')}`);
    }
    
    if (data.motivationLevel <= 2) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.lowMotivation')}`);
    }
    
    if (data.dietCompliance <= 2) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.poorDiet')}`);
    }
    
    if (data.exerciseCompliance <= 2) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.lowExercise')}`);
    }
    
    if (data.sleepQuality <= 2) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.poorSleep')}`);
    }
    
    if (data.stressLevel >= 4) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.highStress')}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push(`• ${t('goalTracking.fallbackRecommendations.keepGoing')}`);
    }
    
    return `${t('goalTracking.fallbackRecommendations.header')}\n\n${recommendations.join('\n')}`;
  };

  // Определяем тип цели: похудение или набор веса
  const isWeightLossGoal = goalProgress.startWeight > goalProgress.targetWeight;
  
  const displayWeight = goalProgress.currentWeight || goalProgress.startWeight;
  const totalWeightChange = Math.abs(goalProgress.targetWeight - goalProgress.startWeight);
  const currentWeightChange = goalProgress.currentWeight ? 
    Math.abs(goalProgress.currentWeight - goalProgress.startWeight) : 0;
  const progressPercentage = goalProgress.currentWeight ? 
    Math.min(100, (currentWeightChange / totalWeightChange) * 100) : 0;

  // Проверяем, достигнута ли цель
  const isGoalAchieved = goalProgress.currentWeight ? 
    (isWeightLossGoal ? 
      goalProgress.currentWeight <= goalProgress.targetWeight : 
      goalProgress.currentWeight >= goalProgress.targetWeight
    ) : false;
  
  // Вычисляем прогресс за неделю
  const weeklyProgressValue = goalProgress.currentWeight ? 
    (goalProgress.currentWeight - goalProgress.startWeight) : 0;
  
  // Определяем правильное направление в зависимости от цели
  const isProgressGood = isWeightLossGoal ? 
    weeklyProgressValue < 0 : // Для похудения хорошо, когда вес уменьшается
    weeklyProgressValue > 0;  // Для набора веса хорошо, когда вес увеличивается
  
  const weeklyProgressAbs = Math.abs(weeklyProgressValue);
  
  // Пересчитываем недели до цели на основе текущего прогресса
  const calculateWeeksToGoal = () => {
    if (!goalProgress.currentWeight) return goalProgress.weeksToGoal;
    
    // Если цель достигнута
    if (isGoalAchieved) return 0;
    
    const remainingWeight = Math.abs(displayWeight - goalProgress.targetWeight);
    if (remainingWeight <= 0) return 0; // Цель достигнута
    
    // Если есть хороший прогресс, используем среднюю скорость
    if (isProgressGood && weeklyProgressAbs > 0) {
      // Вычисляем недели с начала на основе даты последней проверки
      const startDate = new Date(goalProgress.lastCheckIn || new Date());
      const now = new Date();
      const weeksElapsed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      const averageWeeklyChange = weeklyProgressAbs / weeksElapsed;
      return Math.ceil(remainingWeight / averageWeeklyChange);
    }
    
    // Если прогресса нет или идет в неправильном направлении, используем целевую скорость
    return Math.ceil(remainingWeight / goalProgress.weeklyTarget);
  };

  const weeksToGoal = calculateWeeksToGoal();

  // Определяем цвета для прогресса
  const getProgressColors = () => {
    if (!goalProgress.currentWeight) {
      return {
        circleColor: '#E0E0E0',
        circleColorDark: '#404040',
        weeklyBgColor: '#F5F5F5',
        weeklyTextColor: '#666666',
        trendIcon: 'help-circle-outline' as const,
        trendColor: '#666666'
      };
    }

    // Если цель достигнута - золотой/праздничный цвет
    if (isGoalAchieved) {
      return {
        circleColor: '#FFD700',
        circleColorDark: '#FFC107', 
        weeklyBgColor: '#FFF8E1',
        weeklyTextColor: '#F57C00',
        trendIcon: 'trophy' as const,
        trendColor: '#FF9800'
      };
    }

    if (isProgressGood) {
      return {
        circleColor: '#4CAF50',
        circleColorDark: '#66BB6A', 
        weeklyBgColor: '#E8F5E8',
        weeklyTextColor: '#2E7D32',
        trendIcon: isWeightLossGoal ? 'trending-down' as const : 'trending-up' as const,
        trendColor: '#4CAF50'
      };
    } else {
      return {
        circleColor: '#FF5722',
        circleColorDark: '#FF7043',
        weeklyBgColor: '#FFEBEE',
        weeklyTextColor: '#C62828',
        trendIcon: isWeightLossGoal ? 'trending-up' as const : 'trending-down' as const,
        trendColor: '#FF5722'
      };
    }
  };

  const progressColors = getProgressColors();

  // Форматируем дату последней проверки
  const formatLastCheckDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('goalTracking.today');
    if (diffDays === 1) return `1 ${t('goalTracking.dateFormat.dayAgo')}`;
    if (diffDays < 5) return `${diffDays} ${t('goalTracking.dateFormat.daysAgo')}`;
    return `${diffDays} ${t('goalTracking.dateFormat.daysAgoMany')}`;
  };

  const handleWeeklyCheck = () => {
    router.push('/goal-tracking/weekly-check');
  };

  const handleDetailedStats = () => {
    Alert.alert(t('goalTracking.comingSoon'), t('goalTracking.detailedStatsComingSoon'));
  };

  const handleAdjustPlan = () => {
    router.push('/goal-tracking/plan-settings');
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <View style={[styles.container, isDark && styles.darkContainer]}>
        {/* Header в стиле History/Diets - без стрелки */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingTop: 16,
        }}>
          <Text style={[styles.title, isDark && styles.darkText]}>{t('goalTracking.title')}</Text>
        </View>

      <ScrollView 
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Главная карточка прогресса */}
        <View style={[styles.progressCard, isDark && styles.darkCard]}>
          <View style={styles.progressHeaderContainer}>
            <Text style={[styles.cardTitle, isDark && styles.darkText, { marginBottom: 0 }]}>{t('goalTracking.yourProgress')}</Text>
            {/* Показываем weekly progress данные рядом с заголовком */}
            {goalProgress.currentWeight ? (
              <View style={[
                styles.weeklyProgressInfo,
                { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : progressColors.weeklyBgColor }
              ]}>
                <Ionicons 
                  name={progressColors.trendIcon} 
                  size={16} 
                  color={progressColors.trendColor} 
                />
                <Text style={[
                  styles.weeklyProgressInfoText, 
                  isDark && styles.darkTextSecondary,
                  { color: isDark ? styles.darkTextSecondary.color : progressColors.weeklyTextColor }
                ]}>
                  {isGoalAchieved ? t('goalTracking.goalAchieved') :
                    `${weeklyProgressValue >= 0 ? '+' : ''}${weeklyProgressValue.toFixed(1)} ${t('common.kg')}`
                  }
                </Text>
              </View>
            ) : (
              <Text style={[styles.weeklyProgressInfoText, isDark && styles.darkTextSecondary]}>
                {t('goalTracking.noData')}
              </Text>
            )}
          </View>
          
          {/* Основная область с кругом и информацией */}
          <View style={styles.mainProgressArea}>
            <View style={styles.circularProgressContainer}>
              <CircularProgress 
                size={140}
                strokeWidth={14}
                progressPercentage={progressPercentage}
                caloriesLeft={displayWeight}
                burnedCalories={0}
                isWeightView={true}
                customText={t('common.kg')}
                progressColorLight={progressColors.circleColor}
                progressColorDark={progressColors.circleColorDark}
                textColorLight="#1a1a1a"
                textColorDark="#FFFFFF"
              />
            </View>
            
            {/* Статистика справа от круга */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, isDark && styles.darkTextSecondary]}>{t('goalTracking.current')}</Text>
                <Text style={[styles.statValue, isDark && styles.darkText]}>
                  {goalProgress.currentWeight ? `${displayWeight} ${t('common.kg')}` : t('goalTracking.noData')}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, isDark && styles.darkTextSecondary]}>{t('goalTracking.goal')}</Text>
                <Text style={[styles.statValue, isDark && styles.darkText]}>{goalProgress.targetWeight} {t('common.kg')}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, isDark && styles.darkTextSecondary]}>
                  {isGoalAchieved ? t('goalTracking.status') : (isWeightLossGoal ? t('goalTracking.remaining') : t('goalTracking.needToGain'))}
                </Text>
                <Text style={[styles.statValue, styles.remainingWeight, isDark && styles.darkText]}>
                  {!goalProgress.currentWeight ? t('goalTracking.noData') : 
                    isGoalAchieved ? t('goalTracking.achieved') : 
                    `${Math.abs(displayWeight - goalProgress.targetWeight).toFixed(1)} ${t('common.kg')}`
                  }
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, isDark && styles.darkTextSecondary]}>
                  {isGoalAchieved ? t('goalTracking.result') : t('goalTracking.weeksToGoal')}
                </Text>
                <Text style={[styles.statValue, isDark && styles.darkText]}>
                  {isGoalAchieved ? t('goalTracking.done') : weeksToGoal}
                </Text>
              </View>
            </View>
          </View>

          {/* Кнопка Weekly Check внизу карточки */}
          <TouchableOpacity 
            style={[
              styles.weeklyCheckButton, 
              !goalProgress.needsWeeklyCheck && styles.weeklyCheckButtonActive,
              isDark && styles.darkWeeklyCheckButton,
              !goalProgress.needsWeeklyCheck && isDark && styles.darkWeeklyCheckButtonActive
            ]}
            onPress={handleWeeklyCheck}
          >
            <Ionicons 
              name={goalProgress.needsWeeklyCheck ? "clipboard-outline" : "checkmark"} 
              size={20} 
              color={
                !goalProgress.needsWeeklyCheck 
                  ? (isDark ? "#AAAAAA" : "#666666")
                  : "#FFFFFF"
              } 
            />
            <Text style={[
              styles.weeklyCheckButtonText, 
              !goalProgress.needsWeeklyCheck && styles.weeklyCheckButtonTextActive,
              isDark && !goalProgress.needsWeeklyCheck && styles.darkWeeklyCheckButtonTextActive,
            ]}>
              {goalProgress.needsWeeklyCheck ? 'Take Weekly Check' : t('goalTracking.checkCompleted')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Новая секция рекомендаций */}
        <RecommendationsSection 
          refreshTrigger={refreshTrigger}
          onNavigateToRecommendations={() => router.push('/recommendations')}
        />

        {/* Быстрые действия */}
        {/* Additional Section - Quick Access Style */}
        <View style={styles.additionalSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('goalTracking.additional')}</Text>
          
          <View style={styles.quickAccessGrid}>
            {/* Adjust Plan */}
            <TouchableOpacity 
              style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]}
              onPress={handleAdjustPlan}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                <Ionicons name="settings-outline" size={24} color="#FF9500" />
              </View>
              <Text style={[styles.quickAccessTitle, isDark && styles.darkText]}>
                {t('goalTracking.adjustPlan')}
              </Text>
              <Text style={[styles.quickAccessDescription, isDark && styles.darkTextSecondary]}>
                {t('goalTracking.adjustPlanDescription')}
              </Text>
            </TouchableOpacity>

            {/* Detailed Statistics */}
            <TouchableOpacity 
              style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]}
              onPress={handleDetailedStats}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                <Ionicons name="bar-chart-outline" size={24} color="#FF3B30" />
              </View>
              <Text style={[styles.quickAccessTitle, isDark && styles.darkText]}>
                {t('goalTracking.detailedStats')}
              </Text>
              <Text style={[styles.quickAccessDescription, isDark && styles.darkTextSecondary]}>
                {t('goalTracking.detailedStatsDescription')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay для загрузки рекомендаций */}
      {showLoadingOverlay && <LoadingOverlay />}
      </View>
    </SafeAreaView>
  );
} 
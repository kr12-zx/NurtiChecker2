import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Modal, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimplePicker from '../../../components/SimplePicker';
import { useTranslation } from '../../../i18n/i18n';
import { saveWeeklyCheckData, WeeklyCheckData } from '../../../services/goalTrackingService';
import { getUserId } from '../../../services/userService';
import { styles } from './styles';

const CHALLENGE_KEYS = [
  'overeating',
  'emotionalEating',
  'lackOfTime',
  'workStress',
  'socialEvents',
  'sweetTemptations',
  'lackOfSleep',
  'lowMotivation',
];

const CompletionModal = ({ 
  visible, 
  onConfirm,
  weeklyCheckData 
}: { 
  visible: boolean; 
  onConfirm: () => void;
  weeklyCheckData: any;
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  
  React.useEffect(() => {
    if (visible) {
      // Анимация прогресс-бара
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [visible]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.completionModal, isDark && styles.darkCompletionModal]}>
          {/* Заголовок */}
          <View style={styles.modalHeader}>
            <View style={[styles.iconContainer, {backgroundColor: '#34C759'}]}>
              <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            </View>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.completion.title')}
            </Text>
            <Text style={[styles.modalSubtitle, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.completion.subtitle')}
            </Text>
          </View>

          {/* Прогресс-бар */}
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, isDark && styles.darkText]}>
              {t('weeklyCheck.completion.dataSaved')}
            </Text>
            <View style={[styles.progressBarContainer, isDark && styles.darkProgressBarContainer]}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { width: progressWidth }
                ]} 
              />
            </View>
          </View>

          {/* Краткие результаты */}
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.completion.yourResults')}
            </Text>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, isDark && styles.darkTextSecondary]}>{t('weeklyCheck.completion.weight')}</Text>
              <Text style={[styles.resultValue, isDark && styles.darkText]}>{weeklyCheckData?.currentWeight || 'N/A'} {t('common.kg')}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, isDark && styles.darkTextSecondary]}>{t('weeklyCheck.completion.energy')}</Text>
              <Text style={[styles.resultValue, isDark && styles.darkText]}>{weeklyCheckData?.energyLevel || 'N/A'}/5</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, isDark && styles.darkTextSecondary]}>{t('weeklyCheck.completion.motivation')}</Text>
              <Text style={[styles.resultValue, isDark && styles.darkText]}>{weeklyCheckData?.motivationLevel || 'N/A'}/5</Text>
            </View>
          </View>

          {/* Кнопка получения рекомендаций */}
          <TouchableOpacity 
            style={[styles.confirmButton, isDark && styles.confirmButtonDark]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>{t('weeklyCheck.completion.getRecommendations')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// LoadingOverlay для показа прогресса отправки webhook
const LoadingOverlay = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  
  console.log('🎬 WeeklyCheck LoadingOverlay рендерится!');
  
  React.useEffect(() => {
    console.log('🎬 WeeklyCheck LoadingOverlay useEffect запущен');
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
        <View style={[styles.loadingCard, isDark && styles.darkLoadingCard]}>
          <ActivityIndicator size="large" color={isDark ? "#0A84FF" : "#007AFF"} style={styles.loadingIndicator} />
          <Text style={[styles.overlayLoadingText, isDark && styles.darkText]}>
            {t('weeklyCheck.loading.generating')}
          </Text>
          <View style={[styles.loadingProgressContainer, isDark && styles.darkLoadingProgressContainer]}>
            <Animated.View 
              style={[
                styles.loadingProgressBar,
                { width: progressWidth }
              ]} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function WeeklyCheckScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [checkData, setCheckData] = useState<WeeklyCheckData>({
    currentWeight: undefined,
    energyLevel: 3,
    motivationLevel: 3,
    challenges: [],
    dietCompliance: 3,
    exerciseCompliance: 3,
    sleepQuality: 3,
    stressLevel: 3,
    notes: '',
  });


  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 7; // Увеличили количество шагов

  const handleRatingChange = (field: keyof WeeklyCheckData, value: number) => {
    setCheckData(prev => ({ ...prev, [field]: value }));
  };

  const handleChallengeToggle = (challenge: string) => {
    setCheckData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }));
  };

  const handleNext = () => {
    // Проверяем, что вес введен на первом шаге
    if (currentStep === 0) {
      if (!checkData.currentWeight || checkData.currentWeight <= 0) {
        Alert.alert('Введите вес', 'Пожалуйста, выберите корректный вес для продолжения');
        return;
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      // Сохраняем данные проверки
      await saveWeeklyCheckData(checkData);
      
      // Показываем модальное окно с анимацией
      setShowCompletionModal(true);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить данные. Попробуйте еще раз.',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    }
  };

  const handleModalConfirm = async () => {
    try {
      setShowCompletionModal(false);
      setShowLoadingOverlay(true);
      
      console.log('🚀 Начинаем отправку webhook из weekly-check');
      
      // Отправляем webhook и сохраняем рекомендации
      await sendWebhookAndWaitForResponse(checkData);
      
      // Переходим обратно в goal-tracking
      router.replace({
        pathname: '/(tabs)/goal-tracking',
        params: { 
          weeklyDataCompleted: 'true',
          weeklyData: JSON.stringify(checkData)
        }
      });
    } catch (error) {
      console.error('❌ Ошибка при отправке webhook:', error);
      
      // ВРЕМЕННО: Симулируем успешный ответ для тестирования
      console.log('🧪 ТЕСТ: Симулируем успешный AI ответ для тестирования...');
      const mockResponse = [
        {
          "text": "```json\n{\n  \"nutritionRecommendations\": {\n    \"shortSummary\": \"Вес увеличился. Главная цель: точно отслеживать все приемы пищи для понимания реальной калорийности.\",\n    \"bulletPoints\": [\n      \"Начните записывать КАЖДЫЙ прием пищи и напиток.\",\n      \"Включите в каждый прием пищи источник белка (мясо, яйца).\",\n      \"Проанализируйте причины переедания, не связанные с эмоциями.\"\n    ]\n  },\n  \"weeklyFocus\": {\n    \"mainGoal\": \"Достичь 100% честности и последовательности в ведении дневника питания.\",\n    \"specificFoods\": [\n      \"Асадо или бифе де чоризо (нежирные куски)\",\n      \"Мате: традиционный аргентинский напиток\",\n      \"Кефир или йогурт без сахара\"\n    ],\n    \"avoidOrReduce\": [\n      \"Промышленные соусы и заправки\",\n      \"Приемы пищи 'на ходу' или перед экраном\"\n    ]\n  },\n  \"progressNotes\": {\n    \"weightProgress\": \"Набор веса в 2 кг указывает на превышение калорийности.\",\n    \"nutritionQuality\": \"Оценка здоровья 60/100 требует улучшения.\",\n    \"challengeEvolution\": \"Эмоциональное переедание больше не проблема - отличный прогресс!\",\n    \"encouragement\": \"Первая неделя – это адаптация. Увеличение веса – это ценная информация!\"\n  },\n  \"nextWeekTargets\": {\n    \"calorieTarget\": \"2300-2400 ккал/день\",\n    \"macroFocus\": \"Фокус на белок в каждом приеме пищи\",\n    \"behavioralGoal\": \"Записывать еду сразу после приема пищи\",\n    \"activitySuggestion\": \"20-минутная прогулка после ужина\"\n  }\n}\n```"
        }
      ];
      
      try {
        await AsyncStorage.setItem('ai_recommendations', JSON.stringify(mockResponse));
        await AsyncStorage.setItem('ai_recommendations_timestamp', new Date().toISOString());
        console.log('✅ WeeklyCheck MOCK рекомендации сохранены в AsyncStorage');
        
        // Тест парсинга mock данных
        const { parseAIResponse } = require('../../../utils/aiResponseParser');
        const testParsed = parseAIResponse(mockResponse);
        if (testParsed) {
          console.log('🧪 ТЕСТ: Парсинг MOCK данных успешен!');
          console.log('🧪 ТЕСТ: Short Summary:', testParsed.nutritionRecommendations.shortSummary.substring(0, 50) + '...');
        } else {
          console.log('🧪 ТЕСТ: Парсинг MOCK данных не удался');
        }
      } catch (mockError) {
        console.error('❌ Ошибка сохранения mock данных:', mockError);
      }
      
      // Создаем fallback рекомендации в случае ошибки
      const fallbackRecommendations = generateFallbackRecommendations(checkData);
      
      // Сохраняем fallback рекомендации в AsyncStorage
      try {
        await AsyncStorage.setItem('weekly_recommendations', fallbackRecommendations);
        console.log('✅ WeeklyCheck fallback рекомендации сохранены в AsyncStorage');
      } catch (storageError) {
        console.error('❌ Ошибка при сохранении fallback рекомендаций:', storageError);
      }
      
      // Не выбрасываем ошибку, чтобы пользователь мог продолжить
      console.log('⚠️ Используем fallback рекомендации из-за ошибки webhook');
      
      // Переходим обратно в goal-tracking
      router.replace({
        pathname: '/(tabs)/goal-tracking',
        params: { 
          weeklyDataCompleted: 'true',
          weeklyData: JSON.stringify(checkData)
        }
      });
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  // Функция для конвертации числовых оценок в понятные описания (копия из goal-tracking)
  const convertRatingsToDescriptions = (weeklyData: WeeklyCheckData) => {
    // Функция для перевода challenges на английский
    const translateChallenges = (challenges: string[]): string[] => {
      const translations: { [key: string]: string } = {
        'Переедание': 'Overeating',
        'Эмоциональное питание': 'Emotional eating',
        'Недостаток времени': 'Lack of time',
        'Стресс на работе': 'Work stress',
        'Социальные события': 'Social events',
        'Сладкие соблазны': 'Sweet cravings',
        'Недостаток сна': 'Lack of sleep',
        'Низкая мотивация': 'Low motivation',
      };
      
      return challenges.map(challenge => translations[challenge] || challenge);
    };
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
      challenges: translateChallenges(weeklyData.challenges), // Переводим challenges на английский
      dietCompliance: getDietComplianceDescription(weeklyData.dietCompliance),
      exerciseCompliance: getExerciseComplianceDescription(weeklyData.exerciseCompliance),
      sleepQuality: getSleepQualityDescription(weeklyData.sleepQuality),
      stressLevel: getStressLevelDescription(weeklyData.stressLevel),
      completedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      // Убираем originalRatings - теперь отправляем только описательные тексты
      // originalRatings: {
      //   energyLevel: weeklyData.energyLevel,
      //   motivationLevel: weeklyData.motivationLevel,
      //   dietCompliance: weeklyData.dietCompliance,
      //   exerciseCompliance: weeklyData.exerciseCompliance,
      //   sleepQuality: weeklyData.sleepQuality,
      //   stressLevel: weeklyData.stressLevel,
      // }
    };
  };

  const sendWebhookAndWaitForResponse = async (weeklyData: WeeklyCheckData) => {
    try {
      // Конвертируем числовые оценки в описательный текст
      const descriptiveWeeklyData = convertRatingsToDescriptions(weeklyData);
      
      // Получаем язык системы
      const locales = getLocales();
      const systemLanguage = locales[0]?.languageCode || 'en';
      
      // Подготавливаем данные для отправки
      const webhookData = {
        userId: await getUserId(),
        body: {
          userId: await getUserId()
        },
        weeklyData: {
          ...descriptiveWeeklyData,
          language: systemLanguage
        }
      };

      console.log('📤 WeeklyCheck отправляем данные на AI webhook:', webhookData);
      
      const N8N_WEBHOOK_URL = 'https://ttagent.website/webhook/pro_week_check';
      
      // Создаем AbortController для timeout - увеличиваем до 90 секунд
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 секунд timeout
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('📨 WeeklyCheck Response status:', response.status);

      if (response.ok) {
        // Проверяем, есть ли содержимое в ответе
        const responseText = await response.text();
        console.log('📦 WeeklyCheck Raw response text:', responseText ? responseText.substring(0, 200) + '...' : 'EMPTY');
        
        if (!responseText || responseText.trim() === '') {
          console.warn('⚠️ WeeklyCheck Webhook вернул пустой ответ, используем fallback');
          const fallbackRecommendations = generateFallbackRecommendations(weeklyData);
          await AsyncStorage.setItem('weekly_recommendations', fallbackRecommendations);
          console.log('✅ WeeklyCheck fallback рекомендации сохранены в AsyncStorage');
          router.replace({
            pathname: '/(tabs)/goal-tracking',
            params: { 
              weeklyDataCompleted: 'true',
              weeklyData: JSON.stringify(checkData)
            }
          });
          return;
        }
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ WeeklyCheck Ошибка парсинга JSON:', parseError);
          console.log('⚠️ WeeklyCheck Используем fallback рекомендации из-за ошибки парсинга');
          const fallbackRecommendations = generateFallbackRecommendations(weeklyData);
          await AsyncStorage.setItem('weekly_recommendations', fallbackRecommendations);
          console.log('✅ WeeklyCheck fallback рекомендации сохранены в AsyncStorage');
          router.replace({
            pathname: '/(tabs)/goal-tracking',
            params: { 
              weeklyDataCompleted: 'true',
              weeklyData: JSON.stringify(checkData)
            }
          });
          return;
        }
        
        console.log('✅ WeeklyCheck получен ответ от AI:', result);
        
        // Сохраняем полный ответ в новом формате для hook
        try {
          await AsyncStorage.setItem('ai_recommendations', JSON.stringify(result));
          await AsyncStorage.setItem('ai_recommendations_timestamp', new Date().toISOString());
          console.log('✅ WeeklyCheck рекомендации сохранены в AsyncStorage');
          
          // Временный тест парсинга
          const { parseAIResponse } = require('../../../utils/aiResponseParser');
          const testParsed = parseAIResponse(result);
          if (testParsed) {
            console.log('🧪 ТЕСТ: Парсинг нового формата успешен!');
            console.log('🧪 ТЕСТ: Short Summary:', testParsed.nutritionRecommendations.shortSummary.substring(0, 50) + '...');
            console.log('🧪 ТЕСТ: Bullet Points count:', testParsed.nutritionRecommendations.bulletPoints.length);
          } else {
            console.log('🧪 ТЕСТ: Парсинг не удался');
          }
        } catch (saveError) {
          console.error('❌ Ошибка сохранения рекомендаций:', saveError);
        }
        
        // Также сохраняем в старом формате для совместимости (если нужно)
        try {
          // Парсим ответ для извлечения текста рекомендаций
          let aiData = result;
          
          // Обрабатываем новый формат: [{"text": "```json\n{...}\n```"}]
          if (Array.isArray(result) && result.length > 0 && result[0].text) {
            console.log('🔍 WeeklyCheck обрабатываем массив ответов');
            const textContent = result[0].text;
            
            // Извлекаем JSON из markdown
            const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              aiData = JSON.parse(jsonMatch[1]);
              console.log('✅ WeeklyCheck JSON извлечен из markdown');
            }
          } else if (result.text && typeof result.text === 'string') {
            // Обрабатываем старый формат
            const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              aiData = JSON.parse(jsonMatch[1]);
              console.log('✅ WeeklyCheck JSON извлечен из markdown (старый формат)');
            }
          }
          
          // Формируем текст рекомендаций для старого формата
          let recommendationsText = '';
          
          if (aiData.nutritionRecommendations?.shortSummary) {
            recommendationsText = aiData.nutritionRecommendations.shortSummary;
            
            if (aiData.nutritionRecommendations?.bulletPoints?.length > 0) {
              recommendationsText += '\n\n' + aiData.nutritionRecommendations.bulletPoints
                .map((point: string) => `• ${point}`)
                .join('\n');
            }
            
            if (aiData.progressNotes?.encouragement) {
              recommendationsText += '\n\n💪 ' + aiData.progressNotes.encouragement;
            }
          }
          
          // Сохраняем в старом формате для совместимости
          if (recommendationsText) {
            await AsyncStorage.setItem('weekly_recommendations', recommendationsText);
            console.log('✅ WeeklyCheck legacy рекомендации сохранены');
          }
        } catch (legacyError) {
          console.warn('⚠️ Ошибка сохранения legacy формата:', legacyError);
        }
        
      } else {
        throw new Error(`Webhook ответил с ошибкой: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ WeeklyCheck ошибка при отправке webhook:', error);
      
      // Создаем fallback рекомендации в случае ошибки
      const fallbackRecommendations = generateFallbackRecommendations(weeklyData);
      
      // Сохраняем fallback рекомендации в AsyncStorage
      try {
        await AsyncStorage.setItem('weekly_recommendations', fallbackRecommendations);
        console.log('✅ WeeklyCheck fallback рекомендации сохранены в AsyncStorage');
      } catch (storageError) {
        console.error('❌ Ошибка при сохранении fallback рекомендаций:', storageError);
      }
      
      // Не выбрасываем ошибку, чтобы пользователь мог продолжить
      console.log('⚠️ Используем fallback рекомендации из-за ошибки webhook');
      
      // Переходим обратно в goal-tracking
      router.replace({
        pathname: '/(tabs)/goal-tracking',
        params: { 
          weeklyDataCompleted: 'true',
          weeklyData: JSON.stringify(checkData)
        }
      });
    }
  };

  // Функция для создания fallback рекомендаций
  const generateFallbackRecommendations = (weeklyData: WeeklyCheckData): string => {
    let recommendations = `📋 ${t('goalTracking.thankYouForWeeklyCheck')}\n\n`;
    
    // Анализируем энергию
    if (weeklyData.energyLevel <= 2) {
      recommendations += `🎯 ${t('goalTracking.weeklyCheckFallback.recommendationsTitle')}\n`;
      recommendations += `1. ${t('goalTracking.weeklyCheckFallback.lowEnergyTips.1')}\n`;
      recommendations += `2. ${t('goalTracking.weeklyCheckFallback.lowEnergyTips.2')}\n`;
      recommendations += `3. ${t('goalTracking.weeklyCheckFallback.lowEnergyTips.3')}\n\n`;
    } else if (weeklyData.energyLevel >= 4) {
      recommendations += `🎯 ${t('goalTracking.weeklyCheckFallback.recommendationsTitle')}\n`;
      recommendations += `1. ${t('goalTracking.weeklyCheckFallback.highEnergyTips.1')}\n`;
      recommendations += `2. ${t('goalTracking.weeklyCheckFallback.highEnergyTips.2')}\n`;
      recommendations += `3. ${t('goalTracking.weeklyCheckFallback.highEnergyTips.3')}\n\n`;
    } else {
      recommendations += `🎯 ${t('goalTracking.weeklyCheckFallback.recommendationsTitle')}\n`;
      recommendations += `1. ${t('goalTracking.weeklyCheckFallback.moderateEnergyTips.1')}\n`;
      recommendations += `2. ${t('goalTracking.weeklyCheckFallback.moderateEnergyTips.2')}\n`;
      recommendations += `3. ${t('goalTracking.weeklyCheckFallback.moderateEnergyTips.3')}\n\n`;
    }
    
    // Анализируем challenges
    if (weeklyData.challenges.includes('Эмоциональное питание')) {
      recommendations += `🎯 ${t('goalTracking.weeklyCheckFallback.mainGoals.emotionalEating')}\n\n`;
    } else if (weeklyData.challenges.includes('Недостаток времени')) {
      recommendations += `🎯 ${t('goalTracking.weeklyCheckFallback.mainGoals.timeShortage')}\n\n`;
    } else {
      recommendations += `🎯 ${t('goalTracking.weeklyCheckFallback.mainGoals.general')}\n\n`;
    }
    
    recommendations += `💪 ${t('goalTracking.dailyOpportunityReminder')}`;
    
         return recommendations;
   };

  const renderRatingScale = (
    title: string,
    value: number,
    onValueChange: (value: number) => void,
    labels: string[]
  ) => (
    <View style={styles.ratingContainer}>
      <Text style={[styles.ratingTitle, isDark && styles.darkText]}>{title}</Text>
      <View style={styles.ratingScale}>
        {[1, 2, 3, 4, 5].map(rating => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              value === rating && styles.ratingButtonActive,
              isDark && styles.darkRatingButton,
              value === rating && isDark && styles.darkRatingButtonActive,
            ]}
            onPress={() => onValueChange(rating)}
          >
            <Text style={[
              styles.ratingButtonText,
              value === rating && styles.ratingButtonTextActive,
              isDark && styles.darkRatingButtonText,
              value === rating && isDark && styles.darkRatingButtonTextActive,
            ]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.ratingLabels}>
        <Text style={[styles.ratingLabel, isDark && styles.darkTextSecondary]}>{labels[0]}</Text>
        <Text style={[styles.ratingLabel, isDark && styles.darkTextSecondary]}>{labels[1]}</Text>
      </View>
    </View>
  );

  const renderWeightInput = () => {
    // Генерируем значения для килограммов (40-200 кг)
    const kgValues = Array.from({ length: 161 }, (_, i) => i + 40);
    
    // Генерируем значения для граммов (0, 100, 200, ... 900)
    const gramValues = Array.from({ length: 10 }, (_, i) => i * 100);
    
    // Получаем текущие килограммы и граммы
    const currentKg = checkData.currentWeight ? Math.floor(checkData.currentWeight) : 75;
    const currentGrams = checkData.currentWeight ? Math.round((checkData.currentWeight - Math.floor(checkData.currentWeight)) * 1000 / 100) * 100 : 0;
    
    const handleWeightChange = (kg: number, grams: number) => {
      const totalWeight = kg + (grams / 1000);
      setCheckData(prev => ({ ...prev, currentWeight: totalWeight }));
    };
    
    return (
    <View style={styles.weightInputContainer}>
      <Text style={[styles.weightInputLabel, isDark && styles.darkText]}>
        {t('weeklyCheck.steps.weight.label')}
      </Text>
        
        <View style={styles.weightPickerContainer}>
          <View style={styles.pickerSection}>
            <SimplePicker
              values={kgValues}
              selectedValue={currentKg}
              onChange={(value) => handleWeightChange(Number(value), currentGrams)}
              pickerWidth={100}
              pickerHeight={180}
              formatValue={(value) => `${value}`}
            />
            <Text style={[styles.pickerLabel, isDark && styles.darkText]}>{t('common.kg')}</Text>
          </View>
          
          <View style={styles.pickerSection}>
            <SimplePicker
              values={gramValues}
              selectedValue={currentGrams}
              onChange={(value) => handleWeightChange(currentKg, Number(value))}
              pickerWidth={100}
              pickerHeight={180}
              formatValue={(value) => `${value}`}
            />
            <Text style={[styles.pickerLabel, isDark && styles.darkText]}>{t('weeklyCheck.steps.weight.grams')}</Text>
          </View>
        </View>
        
      <Text style={[styles.weightInputHint, isDark && styles.darkTextSecondary]}>
          {t('weeklyCheck.steps.weight.hintPicker')}
      </Text>
    </View>
  );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.weight.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.weight.description')}
            </Text>
            {renderWeightInput()}
          </View>
        );

      case 1:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.energy.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.energy.description')}
            </Text>
            {renderRatingScale(
              t('weeklyCheck.steps.energy.ratingTitle'),
              checkData.energyLevel,
              (value) => handleRatingChange('energyLevel', value),
              [t('weeklyCheck.steps.energy.labels.0'), t('weeklyCheck.steps.energy.labels.1')]
            )}
          </View>
        );

      case 2:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.motivation.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.motivation.description')}
            </Text>
            {renderRatingScale(
              t('weeklyCheck.steps.motivation.ratingTitle'),
              checkData.motivationLevel,
              (value) => handleRatingChange('motivationLevel', value),
              [t('weeklyCheck.steps.motivation.labels.0'), t('weeklyCheck.steps.motivation.labels.1')]
            )}
          </View>
        );

      case 3:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.challenges.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.challenges.description')}
            </Text>
            <View style={styles.challengesContainer}>
              {CHALLENGE_KEYS.map(challenge => (
                <TouchableOpacity
                  key={challenge}
                  style={[
                    styles.challengeButton,
                    checkData.challenges.includes(challenge) && styles.challengeButtonActive,
                    isDark && styles.darkChallengeButton,
                    checkData.challenges.includes(challenge) && isDark && styles.darkChallengeButtonActive,
                  ]}
                  onPress={() => handleChallengeToggle(challenge)}
                >
                  <Text style={[
                    styles.challengeButtonText,
                    checkData.challenges.includes(challenge) && styles.challengeButtonTextActive,
                    isDark && styles.darkChallengeButtonText,
                    checkData.challenges.includes(challenge) && isDark && styles.darkChallengeButtonTextActive,
                  ]}>
                    {t(`weeklyCheck.challenges.${challenge}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.diet.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.diet.description')}
            </Text>
            {renderRatingScale(
              t('weeklyCheck.steps.diet.ratingTitle'),
              checkData.dietCompliance,
              (value) => handleRatingChange('dietCompliance', value),
              [t('weeklyCheck.steps.diet.labels.0'), t('weeklyCheck.steps.diet.labels.1')]
            )}
          </View>
        );

      case 5:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.exercise.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.exercise.description')}
            </Text>
            {renderRatingScale(
              t('weeklyCheck.steps.exercise.ratingTitle'),
              checkData.exerciseCompliance,
              (value) => handleRatingChange('exerciseCompliance', value),
              [t('weeklyCheck.steps.exercise.labels.0'), t('weeklyCheck.steps.exercise.labels.1')]
            )}
          </View>
        );

      case 6:
        return (
          <View style={[styles.stepContainer, isDark && styles.darkStepContainer]}>
            <Text style={[styles.stepTitle, isDark && styles.darkText]}>
              {t('weeklyCheck.steps.sleepStress.title')}
            </Text>
            <Text style={[styles.stepDescription, isDark && styles.darkTextSecondary]}>
              {t('weeklyCheck.steps.sleepStress.description')}
            </Text>
            {renderRatingScale(
              t('weeklyCheck.steps.sleepStress.sleepTitle'),
              checkData.sleepQuality,
              (value) => handleRatingChange('sleepQuality', value),
              [t('weeklyCheck.steps.sleepStress.sleepLabels.0'), t('weeklyCheck.steps.sleepStress.sleepLabels.1')]
            )}
            {renderRatingScale(
              t('weeklyCheck.steps.sleepStress.stressTitle'),
              checkData.stressLevel,
              (value) => handleRatingChange('stressLevel', value),
              [t('weeklyCheck.steps.sleepStress.stressLabels.0'), t('weeklyCheck.steps.sleepStress.stressLabels.1')]
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.darkText]}>{t('weeklyCheck.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, isDark && styles.darkProgressBar]}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / totalSteps) * 100}%` }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.darkTextSecondary]}>
          {currentStep + 1} {t('weeklyCheck.stepOf')} {totalSteps}
        </Text>
      </View>

      <ScrollView 
        style={[styles.scrollViewContainer, isDark && styles.darkContainer]}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={[styles.bottomContainer, isDark && styles.darkBottomContainer]}>
        <TouchableOpacity
          style={[styles.nextButton, isDark && styles.darkNextButton]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, isDark && styles.darkNextButtonText]}>
            {currentStep === totalSteps - 1 ? t('weeklyCheck.finish') : t('weeklyCheck.next')}
          </Text>
          <Ionicons 
            name={currentStep === totalSteps - 1 ? "checkmark" : "arrow-forward"} 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Completion Modal */}
      <CompletionModal 
        visible={showCompletionModal}
        onConfirm={handleModalConfirm}
        weeklyCheckData={checkData}
      />
      
      {/* Показываем LoadingOverlay во время отправки webhook */}
      {showLoadingOverlay && <LoadingOverlay />}
    </SafeAreaView>
  );
} 